/**
 * Vendor Onboarding State Machine
 * Story: 22.4 - Implement Vendor Onboarding State Machine
 *
 * Manages vendor state transitions and capability gating throughout
 * the onboarding process from registration to full platform access.
 */

import { supabase } from './supabase';

// ================================================
// STATE DEFINITIONS
// ================================================

/**
 * Vendor onboarding states following the defined state machine:
 * REGISTERED → KYC_SUBMITTED → KYC_VERIFIED → BANK_LINKED → ACTIVE
 * With rejection and suspension branches
 */
export type VendorOnboardingStateValue =
  | 'registered' // Initial state after vendor registration
  | 'kyc_submitted' // Stripe Connect onboarding initiated
  | 'kyc_verified' // Identity verification complete
  | 'kyc_rejected' // Verification failed (can retry)
  | 'bank_linked' // Bank account connected
  | 'active' // Full platform access
  | 'suspended'; // Account suspended by admin

/**
 * Valid state transitions map.
 * Each state maps to an array of states it can transition to.
 */
const VALID_TRANSITIONS: Record<
  VendorOnboardingStateValue,
  VendorOnboardingStateValue[]
> = {
  registered: ['kyc_submitted'],
  kyc_submitted: ['kyc_verified', 'kyc_rejected'],
  kyc_verified: ['bank_linked'],
  kyc_rejected: ['kyc_submitted'], // Can retry
  bank_linked: ['active'],
  active: ['suspended'],
  suspended: ['active'], // Can reactivate
};

/**
 * Human-readable labels for each state
 */
export const STATE_LABELS: Record<VendorOnboardingStateValue, string> = {
  registered: 'Registered',
  kyc_submitted: 'KYC Submitted',
  kyc_verified: 'KYC Verified',
  kyc_rejected: 'KYC Rejected',
  bank_linked: 'Bank Linked',
  active: 'Active',
  suspended: 'Suspended',
};

// ================================================
// CAPABILITY GATING
// ================================================

/**
 * Capabilities available to vendors based on their onboarding state
 */
export interface VendorCapabilities {
  canCreateExperiences: boolean; // REGISTERED+
  canEditExperiences: boolean; // REGISTERED+
  canPublishExperiences: boolean; // KYC_VERIFIED+
  canEnableInstantBook: boolean; // BANK_LINKED+
  canReceivePayments: boolean; // ACTIVE only
  canAccessDashboard: boolean; // All states except suspended
  canViewAnalytics: boolean; // KYC_VERIFIED+
}

/**
 * Get capabilities available for a given onboarding state
 */
export function getVendorCapabilities(
  state: VendorOnboardingStateValue,
): VendorCapabilities {
  // States that have progressed past a certain point
  const isPastRegistered = state !== 'suspended';
  const isPastKycSubmitted = ['kyc_verified', 'bank_linked', 'active'].includes(
    state,
  );
  const isPastBankLinked = ['bank_linked', 'active'].includes(state);
  const isActive = state === 'active';
  const isSuspended = state === 'suspended';

  return {
    canCreateExperiences: isPastRegistered && !isSuspended,
    canEditExperiences: isPastRegistered && !isSuspended,
    canPublishExperiences: isPastKycSubmitted && !isSuspended,
    canEnableInstantBook: isPastBankLinked && !isSuspended,
    canReceivePayments: isActive,
    canAccessDashboard: !isSuspended,
    canViewAnalytics: isPastKycSubmitted && !isSuspended,
  };
}

/**
 * Check if a vendor can perform a specific action
 */
export function canVendorPerform(
  state: VendorOnboardingStateValue,
  action: keyof VendorCapabilities,
): boolean {
  const capabilities = getVendorCapabilities(state);
  return capabilities[action];
}

// ================================================
// STATE TRANSITION VALIDATION
// ================================================

export interface TransitionResult {
  success: boolean;
  newState?: VendorOnboardingStateValue;
  error?: string;
}

/**
 * Check if a state transition is valid
 */
export function isValidTransition(
  currentState: VendorOnboardingStateValue,
  targetState: VendorOnboardingStateValue,
): boolean {
  const validTargets = VALID_TRANSITIONS[currentState];
  return validTargets?.includes(targetState) ?? false;
}

/**
 * Get all valid next states from current state
 */
export function getValidNextStates(
  currentState: VendorOnboardingStateValue,
): VendorOnboardingStateValue[] {
  return VALID_TRANSITIONS[currentState] ?? [];
}

// ================================================
// STATE TRANSITION SERVICE
// ================================================

export type TransitionActor = 'system' | 'admin' | 'stripe_webhook' | 'vendor';

export interface TransitionOptions {
  vendorId: string;
  targetState: VendorOnboardingStateValue;
  actor: TransitionActor;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Transition a vendor to a new onboarding state.
 * Validates the transition and creates an audit log entry.
 */
export async function transitionVendorState(
  options: TransitionOptions,
): Promise<TransitionResult> {
  const { vendorId, targetState, actor, reason, metadata } = options;

  try {
    // 1. Get current vendor state
    const { data: vendor, error: fetchError } = await supabase
      .from('vendors')
      .select('id, onboarding_state, business_name')
      .eq('id', vendorId)
      .single();

    if (fetchError || !vendor) {
      return {
        success: false,
        error: `Vendor not found: ${vendorId}`,
      };
    }

    const currentState = vendor.onboarding_state as VendorOnboardingStateValue;

    // 2. Validate the transition
    if (!isValidTransition(currentState, targetState)) {
      return {
        success: false,
        error: `Invalid transition from ${currentState} to ${targetState}. Valid targets: ${getValidNextStates(currentState).join(', ')}`,
      };
    }

    // 3. Update vendor state
    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        onboarding_state: targetState,
      })
      .eq('id', vendorId);

    if (updateError) {
      return {
        success: false,
        error: `Failed to update vendor state: ${updateError.message}`,
      };
    }

    // 4. Create audit log entry
    await createStateTransitionAuditLog({
      vendorId,
      previousState: currentState,
      newState: targetState,
      actor,
      reason,
      metadata,
    });

    return {
      success: true,
      newState: targetState,
    };
  } catch (e) {
    console.error('State transition error:', e);
    return {
      success: false,
      error: 'An unexpected error occurred during state transition',
    };
  }
}

// ================================================
// AUDIT LOGGING
// ================================================

interface AuditLogOptions {
  vendorId: string;
  previousState: VendorOnboardingStateValue;
  newState: VendorOnboardingStateValue;
  actor: TransitionActor;
  reason?: string;
  metadata?: Record<string, unknown>;
}

async function createStateTransitionAuditLog(
  options: AuditLogOptions,
): Promise<void> {
  const { vendorId, previousState, newState, actor, reason, metadata } =
    options;

  try {
    await supabase.from('audit_logs').insert({
      event_type: 'vendor.state_transition',
      entity_type: 'vendor',
      entity_id: vendorId,
      actor_type: actor,
      metadata: {
        previous_state: previousState,
        new_state: newState,
        reason: reason || null,
        ...metadata,
      },
    });
  } catch (e) {
    // Don't fail the transition if audit log fails, but log the error
    console.error('Failed to create audit log entry:', e);
  }
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Get current vendor onboarding state
 */
export async function getVendorOnboardingState(
  vendorId: string,
): Promise<VendorOnboardingStateValue | null> {
  const { data, error } = await supabase
    .from('vendors')
    .select('onboarding_state')
    .eq('id', vendorId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.onboarding_state as VendorOnboardingStateValue;
}

/**
 * Determine the appropriate state based on Stripe webhook data.
 * Called by webhook handler to determine state transitions.
 */
export function determineStateFromStripeData(data: {
  hasAccount: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}): VendorOnboardingStateValue {
  const { hasAccount, chargesEnabled, payoutsEnabled, detailsSubmitted } = data;

  if (!hasAccount) {
    return 'registered';
  }

  // Full verification and bank linked
  if (chargesEnabled && payoutsEnabled) {
    return 'bank_linked'; // Will transition to 'active' separately
  }

  // Identity verified but bank not linked
  if (chargesEnabled && !payoutsEnabled) {
    return 'kyc_verified';
  }

  // Details submitted but not yet verified
  if (detailsSubmitted && !chargesEnabled) {
    return 'kyc_submitted';
  }

  // Has account but nothing else
  return 'kyc_submitted';
}

/**
 * Check if vendor can enable instant book based on their state
 */
export async function canEnableInstantBook(vendorId: string): Promise<boolean> {
  const state = await getVendorOnboardingState(vendorId);
  if (!state) return false;
  return canVendorPerform(state, 'canEnableInstantBook');
}

/**
 * Progress vendor to active state after all requirements are met.
 * Should be called after bank_linked state is achieved.
 */
export async function activateVendor(
  vendorId: string,
  actor: TransitionActor = 'system',
): Promise<TransitionResult> {
  return transitionVendorState({
    vendorId,
    targetState: 'active',
    actor,
    reason: 'Vendor onboarding complete - all requirements met',
  });
}

// ================================================
// EXPORTS
// ================================================

export const vendorStateMachine = {
  // State validation
  isValidTransition,
  getValidNextStates,

  // Capabilities
  getVendorCapabilities,
  canVendorPerform,

  // State transitions
  transitionVendorState,

  // Helpers
  getVendorOnboardingState,
  determineStateFromStripeData,
  canEnableInstantBook,
  activateVendor,

  // Constants
  STATE_LABELS,
  VALID_TRANSITIONS,
};
