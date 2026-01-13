/**
 * Vendor Onboarding Service
 * Story: 22.1 - Create Stripe Connect Account for Vendor
 * Story: 22.3 - Build Vendor Payment Setup UI
 * Story: 22.4 - Implement Vendor Onboarding State Machine
 *
 * Handles vendor Stripe Connect onboarding operations.
 */

import { supabase } from './supabase';
import {
  vendorStateMachine,
  VendorOnboardingStateValue,
  VendorCapabilities,
  getVendorCapabilities,
} from './vendorStateMachine';

export interface VendorOnboardResponse {
  success: boolean;
  accountLinkUrl?: string;
  stripeAccountId?: string;
  error?: string;
}

export type VerificationStepStatus =
  | 'pending'
  | 'in_progress'
  | 'complete'
  | 'failed';

export interface VerificationStep {
  id: string;
  label: string;
  status: VerificationStepStatus;
  description?: string;
}

export type PayoutInterval = 'manual' | 'daily' | 'weekly' | 'monthly';

export interface PayoutSchedule {
  interval: PayoutInterval;
  weeklyAnchor?: string; // e.g., 'friday'
  monthlyAnchor?: number; // Day of month (1-31)
  delayDays?: number; // Payout delay (e.g., 7 for T+7)
}

export type VendorOnboardingState =
  | 'not_started'
  | 'in_progress'
  | 'pending_verification'
  | 'active'
  | 'restricted';

export interface VendorPaymentStatus {
  hasStripeAccount: boolean;
  stripeAccountId: string | null;
  onboardingComplete: boolean;
  instantBookEnabled: boolean;
  onboardingState: VendorOnboardingState;
  vendorState: VendorOnboardingStateValue; // State machine state
  capabilities: VendorCapabilities; // Gated capabilities
  verificationSteps: VerificationStep[];
  payoutSchedule: PayoutSchedule | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

/**
 * Initiates Stripe Connect onboarding for a vendor.
 * Creates a new Stripe Express account if one doesn't exist,
 * or returns a new account link for an existing account.
 */
export async function initiateStripeOnboarding(): Promise<VendorOnboardResponse> {
  try {
    const { data, error } =
      await supabase.functions.invoke<VendorOnboardResponse>('vendor-onboard', {
        body: {},
      });

    if (error) {
      console.error('Stripe onboarding error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initiate Stripe onboarding',
      };
    }

    return data || { success: false, error: 'No response from server' };
  } catch (e) {
    console.error('Stripe onboarding exception:', e);
    return {
      success: false,
      error: 'Failed to connect to payment service',
    };
  }
}

/**
 * Determines verification steps based on Stripe account state.
 * Since we can't directly query Stripe from the client, we infer status from DB fields.
 */
function inferVerificationSteps(
  hasStripeAccount: boolean,
  onboardingComplete: boolean,
  chargesEnabled: boolean,
  payoutsEnabled: boolean,
): VerificationStep[] {
  if (!hasStripeAccount) {
    return [
      {
        id: 'identity',
        label: 'Identity Verification',
        status: 'pending',
        description: 'Verify your identity with a government ID',
      },
      {
        id: 'business',
        label: 'Business Information',
        status: 'pending',
        description: 'Provide your business details',
      },
      {
        id: 'bank',
        label: 'Bank Account',
        status: 'pending',
        description: 'Connect your bank account for payouts',
      },
    ];
  }

  if (onboardingComplete && chargesEnabled && payoutsEnabled) {
    return [
      { id: 'identity', label: 'Identity Verification', status: 'complete' },
      { id: 'business', label: 'Business Information', status: 'complete' },
      { id: 'bank', label: 'Bank Account', status: 'complete' },
    ];
  }

  // Partial completion - infer from what's enabled
  const identityStatus: VerificationStepStatus = chargesEnabled
    ? 'complete'
    : 'in_progress';
  const businessStatus: VerificationStepStatus = chargesEnabled
    ? 'complete'
    : 'pending';
  const bankStatus: VerificationStepStatus = payoutsEnabled
    ? 'complete'
    : 'pending';

  return [
    {
      id: 'identity',
      label: 'Identity Verification',
      status: identityStatus,
      description:
        identityStatus === 'in_progress' ? 'Under review' : undefined,
    },
    { id: 'business', label: 'Business Information', status: businessStatus },
    {
      id: 'bank',
      label: 'Bank Account',
      status: bankStatus,
      description:
        bankStatus === 'pending' ? 'Required to receive payouts' : undefined,
    },
  ];
}

/**
 * Determines the overall onboarding state.
 */
function determineOnboardingState(
  hasStripeAccount: boolean,
  onboardingComplete: boolean,
  chargesEnabled: boolean,
  payoutsEnabled: boolean,
): VendorOnboardingState {
  if (!hasStripeAccount) {
    return 'not_started';
  }

  if (onboardingComplete && chargesEnabled && payoutsEnabled) {
    return 'active';
  }

  // Has account but not fully enabled - could be pending verification
  if (hasStripeAccount && !chargesEnabled) {
    return 'pending_verification';
  }

  // Has some capabilities but not all
  if (hasStripeAccount && chargesEnabled && !payoutsEnabled) {
    return 'in_progress';
  }

  return 'in_progress';
}

/**
 * Gets the current payment setup status for a vendor.
 * Integrates with the vendor state machine for capability gating.
 */
export async function getVendorPaymentStatus(
  vendorId: string,
): Promise<VendorPaymentStatus> {
  const { data, error } = await supabase
    .from('vendors')
    .select(
      'stripe_account_id, stripe_onboarding_complete, instant_book_enabled, onboarding_state',
    )
    .eq('id', vendorId)
    .single();

  // Default state for not found or error
  const defaultVendorState: VendorOnboardingStateValue = 'registered';

  if (error || !data) {
    return {
      hasStripeAccount: false,
      stripeAccountId: null,
      onboardingComplete: false,
      instantBookEnabled: false,
      onboardingState: 'not_started',
      vendorState: defaultVendorState,
      capabilities: getVendorCapabilities(defaultVendorState),
      verificationSteps: inferVerificationSteps(false, false, false, false),
      payoutSchedule: null,
      chargesEnabled: false,
      payoutsEnabled: false,
    };
  }

  const hasStripeAccount = !!data.stripe_account_id;
  const onboardingComplete = data.stripe_onboarding_complete || false;
  const instantBookEnabled = data.instant_book_enabled || false;
  const vendorState =
    (data.onboarding_state as VendorOnboardingStateValue) || defaultVendorState;

  // Infer charges/payouts enabled from onboarding complete status
  // In a real implementation, this would come from Stripe webhook data stored in DB
  const chargesEnabled = onboardingComplete;
  const payoutsEnabled = onboardingComplete;

  const onboardingState = determineOnboardingState(
    hasStripeAccount,
    onboardingComplete,
    chargesEnabled,
    payoutsEnabled,
  );

  const verificationSteps = inferVerificationSteps(
    hasStripeAccount,
    onboardingComplete,
    chargesEnabled,
    payoutsEnabled,
  );

  // Default payout schedule for Stripe Express in Indonesia (T+7 weekly)
  const payoutSchedule: PayoutSchedule | null = onboardingComplete
    ? {
        interval: 'weekly',
        weeklyAnchor: 'friday',
        delayDays: 7,
      }
    : null;

  // Get capabilities from state machine
  const capabilities = getVendorCapabilities(vendorState);

  return {
    hasStripeAccount,
    stripeAccountId: data.stripe_account_id,
    onboardingComplete,
    instantBookEnabled,
    onboardingState,
    vendorState,
    capabilities,
    verificationSteps,
    payoutSchedule,
    chargesEnabled,
    payoutsEnabled,
  };
}

/**
 * Opens the Stripe Express dashboard for a vendor.
 * Only works if the vendor has completed onboarding.
 */
export async function getStripeExpressDashboardLink(): Promise<{
  success: boolean;
  dashboardUrl?: string;
  error?: string;
}> {
  try {
    // This would call another Edge Function to generate a login link
    // For now, return the standard Stripe Express dashboard URL
    return {
      success: true,
      dashboardUrl: 'https://connect.stripe.com/express_login',
    };
  } catch (e) {
    return {
      success: false,
      error: 'Failed to get dashboard link',
    };
  }
}

/**
 * Formats payout schedule for display.
 */
export function formatPayoutSchedule(schedule: PayoutSchedule | null): string {
  if (!schedule) return 'Not configured';

  const delayText = schedule.delayDays ? ` (T+${schedule.delayDays})` : '';

  switch (schedule.interval) {
    case 'daily':
      return `Daily${delayText}`;
    case 'weekly': {
      const day = schedule.weeklyAnchor
        ? schedule.weeklyAnchor.charAt(0).toUpperCase() +
          schedule.weeklyAnchor.slice(1)
        : 'Friday';
      return `Weekly on ${day}s${delayText}`;
    }
    case 'monthly': {
      const dayOfMonth = schedule.monthlyAnchor || 1;
      const suffix =
        dayOfMonth === 1
          ? 'st'
          : dayOfMonth === 2
            ? 'nd'
            : dayOfMonth === 3
              ? 'rd'
              : 'th';
      return `Monthly on the ${dayOfMonth}${suffix}${delayText}`;
    }
    case 'manual':
      return 'Manual (on request)';
    default:
      return 'Not configured';
  }
}

/**
 * Transition vendor to a new onboarding state after Stripe events.
 * Wraps the state machine transition with appropriate error handling.
 */
export async function transitionVendorAfterStripeEvent(
  vendorId: string,
  stripeData: {
    hasAccount: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
  },
): Promise<{ success: boolean; error?: string }> {
  const targetState =
    vendorStateMachine.determineStateFromStripeData(stripeData);
  const currentState =
    await vendorStateMachine.getVendorOnboardingState(vendorId);

  if (!currentState) {
    return { success: false, error: 'Vendor not found' };
  }

  // If already at target state or no transition needed
  if (currentState === targetState) {
    return { success: true };
  }

  // Validate and execute transition
  if (vendorStateMachine.isValidTransition(currentState, targetState)) {
    const result = await vendorStateMachine.transitionVendorState({
      vendorId,
      targetState,
      actor: 'stripe_webhook',
      reason: `Stripe account update - ${targetState}`,
      metadata: stripeData,
    });
    return { success: result.success, error: result.error };
  }

  // Transition not valid from current state - may need intermediate steps
  // For now, just log and return success (webhook data is processed regardless)
  console.log(
    `Skipping invalid transition from ${currentState} to ${targetState}`,
  );
  return { success: true };
}

// Re-export state machine types and functions for convenience
export type {
  VendorOnboardingStateValue,
  VendorCapabilities,
} from './vendorStateMachine';
export {
  getVendorCapabilities,
  vendorStateMachine,
  STATE_LABELS,
} from './vendorStateMachine';

export const vendorOnboardService = {
  initiateStripeOnboarding,
  getVendorPaymentStatus,
  getStripeExpressDashboardLink,
  formatPayoutSchedule,
  transitionVendorAfterStripeEvent,
  // State machine helpers
  ...vendorStateMachine,
};
