/**
 * Realtime Service Module
 * Story: 25.2 - Create Real-Time Service Module
 * Phase: 2a - Core Transactional
 *
 * Provides centralized management for Supabase Realtime subscriptions.
 * Handles connection lifecycle, reconnection, and cleanup automatically.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
import type { Database } from './database.types';

// ================================================
// TYPE DEFINITIONS
// ================================================

export type ExperienceSlot =
  Database['public']['Tables']['experience_slots']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];

export type SlotChangePayload = RealtimePostgresChangesPayload<ExperienceSlot>;
export type BookingChangePayload = RealtimePostgresChangesPayload<Booking>;

/**
 * Callback function for slot availability changes
 */
export type SlotAvailabilityCallback = (payload: SlotChangePayload) => void;

/**
 * Callback function for booking status changes
 */
export type BookingStatusCallback = (payload: BookingChangePayload) => void;

/**
 * Subscription metadata for tracking
 */
interface SubscriptionMetadata {
  channel: RealtimeChannel;
  type: 'slot' | 'booking' | 'notification';
  id: string;
}

// ================================================
// VALIDATION HELPERS
// ================================================

/**
 * UUID v4 validation regex pattern
 * Prevents injection attacks by ensuring IDs match expected format
 */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate that a string is a valid UUID
 * @throws Error if the ID is not a valid UUID format
 */
function validateUUID(id: string, paramName: string): void {
  if (!UUID_PATTERN.test(id)) {
    throw new Error(`Invalid ${paramName}: must be a valid UUID format`);
  }
}

// ================================================
// STATE MANAGEMENT
// ================================================

/**
 * Active subscriptions registry
 * Maps subscription IDs to their channels
 */
const activeSubscriptions = new Map<string, SubscriptionMetadata>();

function realtimeEnabled(): boolean {
  if (!isSupabaseConfigured()) {
    console.warn(
      '[realtimeService] Supabase not configured; skipping subscription',
    );
    return false;
  }
  return true;
}

// ================================================
// SUBSCRIPTION FUNCTIONS
// ================================================

/**
 * Subscribe to slot availability changes for a specific experience
 *
 * @param experienceId - The experience to monitor
 * @param callback - Function called when slots change
 * @returns Subscription ID for cleanup
 *
 * @example
 * ```typescript
 * const subId = subscribeToSlotAvailability('exp-123', (payload) => {
 *   if (payload.eventType === 'UPDATE') {
 *     setAvailableCount(payload.new.available_count)
 *   }
 * })
 * // Later: unsubscribe(subId)
 * ```
 */
export function subscribeToSlotAvailability(
  experienceId: string,
  callback: SlotAvailabilityCallback,
): string {
  if (!realtimeEnabled()) return 'realtime-disabled';
  // Validate UUID to prevent filter injection attacks
  validateUUID(experienceId, 'experienceId');

  // Generate unique subscription ID
  const subscriptionId = `slot-${experienceId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Use unique channel name to allow multiple independent listeners for same resource
  // The filter param controls what data we receive, channel name is just a handle
  const channelName = `experience-slots-${experienceId}-${subscriptionId}`;

  // Keep reference to the channel object (not the subscribe() return) so we
  // can reliably clean it up later in unsubscribe/removeChannel calls.
  const channel = supabase.channel(channelName);

  channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'experience_slots',
        filter: `experience_id=eq.${experienceId}`,
      },
      callback,
    )
    .subscribe();

  // Track subscription
  activeSubscriptions.set(subscriptionId, {
    channel,
    type: 'slot',
    id: experienceId,
  });

  return subscriptionId;
}

/**
 * Subscribe to booking status changes for a specific booking
 *
 * @param bookingId - The booking to monitor
 * @param callback - Function called when booking changes
 * @returns Subscription ID for cleanup
 *
 * @example
 * ```typescript
 * const subId = subscribeToBookingStatus('booking-456', (payload) => {
 *   if (payload.eventType === 'UPDATE') {
 *     setBookingStatus(payload.new.status)
 *   }
 * })
 * ```
 */
export function subscribeToBookingStatus(
  bookingId: string,
  callback: BookingStatusCallback,
): string {
  if (!realtimeEnabled()) return 'realtime-disabled';
  // Validate UUID to prevent filter injection attacks
  validateUUID(bookingId, 'bookingId');

  const subscriptionId = `booking-${bookingId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const channelName = `booking-${bookingId}-${subscriptionId}`;

  const channel = supabase.channel(channelName);

  channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`,
      },
      callback,
    )
    .subscribe();

  activeSubscriptions.set(subscriptionId, {
    channel,
    type: 'booking',
    id: bookingId,
  });

  return subscriptionId;
}

/**
 * Unsubscribe from a specific subscription
 *
 * @param subscriptionId - ID returned from subscribe function
 *
 * @example
 * ```typescript
 * unsubscribe(subId)
 * ```
 */
export async function unsubscribe(subscriptionId: string): Promise<void> {
  const subscription = activeSubscriptions.get(subscriptionId);

  if (!subscription) {
    console.warn(`Subscription ${subscriptionId} not found`);
    return;
  }

  await supabase.removeChannel(subscription.channel);
  activeSubscriptions.delete(subscriptionId);
}

/**
 * Unsubscribe from all active subscriptions
 * Call this on app unmount or cleanup
 *
 * @example
 * ```typescript
 * useEffect(() => {
 *   return () => {
 *     unsubscribeAll()
 *   }
 * }, [])
 * ```
 */
export async function unsubscribeAll(): Promise<void> {
  if (activeSubscriptions.size === 0) return;
  const promises = Array.from(activeSubscriptions.values()).map((sub) =>
    supabase.removeChannel(sub.channel),
  );

  await Promise.all(promises);
  activeSubscriptions.clear();
}

/**
 * Get count of active subscriptions (useful for debugging)
 */
export function getActiveSubscriptionCount(): number {
  return activeSubscriptions.size;
}

/**
 * Get list of active subscription IDs (useful for debugging)
 */
export function getActiveSubscriptionIds(): string[] {
  return Array.from(activeSubscriptions.keys());
}

// ================================================
// VENDOR NOTIFICATION SUBSCRIPTIONS
// ================================================

/**
 * Callback function for vendor booking notifications
 */
export type VendorBookingCallback = (payload: BookingChangePayload) => void;

/**
 * Subscribe to new bookings for a specific vendor
 *
 * Listens for INSERT events on the bookings table filtered by vendor_id.
 * Used to notify vendors in real-time when new bookings are confirmed.
 *
 * @param vendorId - The vendor to monitor bookings for
 * @param callback - Function called when a new booking is created
 * @returns Subscription ID for cleanup
 *
 * @example
 * ```typescript
 * const subId = subscribeToVendorBookings('vendor-123', (payload) => {
 *   if (payload.eventType === 'INSERT') {
 *     const booking = payload.new
 *     showNotification(`New booking: ${booking.total_amount}`)
 *   }
 * })
 * // Later: unsubscribe(subId)
 * ```
 */
export function subscribeToVendorBookings(
  vendorId: string,
  callback: VendorBookingCallback,
): string {
  if (!realtimeEnabled()) return 'realtime-disabled';
  // Validate UUID to prevent filter injection attacks
  validateUUID(vendorId, 'vendorId');

  const subscriptionId = `vendor-bookings-${vendorId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const channelName = `vendor-bookings-${vendorId}-${subscriptionId}`;

  const channel = supabase.channel(channelName);

  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `vendor_id=eq.${vendorId}`,
      },
      callback,
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `vendor_id=eq.${vendorId}`,
      },
      callback,
    )
    .subscribe();

  activeSubscriptions.set(subscriptionId, {
    channel,
    type: 'booking',
    id: vendorId,
  });

  return subscriptionId;
}

// ================================================
// CUSTOMER NOTIFICATION SUBSCRIPTIONS
// Story: 30.4 - Create In-App Notification Center
// ================================================

/**
 * Customer notification row type
 * Matches the customer_notifications table schema
 */
export interface CustomerNotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  booking_id: string | null;
  read: boolean;
  created_at: string;
}

/**
 * Payload for customer notification changes
 */
export type CustomerNotificationChangePayload =
  RealtimePostgresChangesPayload<CustomerNotificationRow>;

/**
 * Callback function for customer notification updates
 */
export type CustomerNotificationCallback = (
  payload: CustomerNotificationChangePayload,
) => void;

/**
 * Subscribe to new notifications for a specific user
 *
 * Listens for INSERT events on the customer_notifications table filtered by user_id.
 * Used to show real-time notification updates in the notification center.
 *
 * @param userId - The user to monitor notifications for
 * @param callback - Function called when a new notification is created
 * @returns Subscription ID for cleanup
 *
 * @example
 * ```typescript
 * const subId = subscribeToCustomerNotifications('user-123', (payload) => {
 *   if (payload.eventType === 'INSERT') {
 *     const notification = payload.new
 *     addNotificationToList(notification)
 *   }
 * })
 * // Later: unsubscribe(subId)
 * ```
 */
export function subscribeToCustomerNotifications(
  userId: string,
  callback: CustomerNotificationCallback,
): string {
  if (!realtimeEnabled()) return 'realtime-disabled';
  // Validate UUID to prevent filter injection attacks
  validateUUID(userId, 'userId');

  const subscriptionId = `customer-notifications-${userId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const channelName = `customer-notifications-${userId}-${subscriptionId}`;

  const channel = supabase.channel(channelName);

  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'customer_notifications',
        filter: `user_id=eq.${userId}`,
      },
      callback,
    )
    .subscribe();

  activeSubscriptions.set(subscriptionId, {
    channel,
    type: 'notification',
    id: userId,
  });

  return subscriptionId;
}
