/**
 * Customer Notification Service
 * Story: 30.4 - Create In-App Notification Center
 *
 * Handles CRUD operations for customer/traveler notifications.
 * Notifications are persisted to database and support real-time updates.
 */

import { supabase } from './supabase';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CustomerNotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'reminder_24h'
  | 'reminder_2h';

export interface CustomerNotification {
  id: string;
  user_id: string;
  type: CustomerNotificationType;
  title: string;
  message: string;
  booking_id: string | null;
  read: boolean;
  created_at: string;
}

export interface CreateNotificationInput {
  user_id: string;
  type: CustomerNotificationType;
  title: string;
  message: string;
  booking_id?: string | null;
}

// ============================================================================
// NOTIFICATION FETCHING
// ============================================================================

/**
 * Fetch notifications for a user
 * @param userId - The user's ID
 * @param limit - Maximum number of notifications to fetch (default 50)
 * @returns Array of notifications, newest first
 */
export async function fetchNotifications(
  userId: string,
  limit = 50,
): Promise<CustomerNotification[]> {
  const { data, error } = await supabase
    .from('customer_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }

  return (data ?? []) as CustomerNotification[];
}

/**
 * Get count of unread notifications for a user
 * @param userId - The user's ID
 * @returns Number of unread notifications
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('customer_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Failed to get unread count:', error);
    throw error;
  }

  return count ?? 0;
}

// ============================================================================
// NOTIFICATION UPDATES
// ============================================================================

/**
 * Mark a single notification as read
 * @param notificationId - The notification ID to mark as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('customer_notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 * @param userId - The user's ID
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('customer_notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
}

// ============================================================================
// NOTIFICATION CREATION (Used by Edge Functions)
// ============================================================================

/**
 * Create a new notification
 * Note: This is primarily used by Edge Functions via service role
 * @param input - The notification data to create
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<CustomerNotification> {
  const { data, error } = await supabase
    .from('customer_notifications')
    .insert({
      user_id: input.user_id,
      type: input.type,
      title: input.title,
      message: input.message,
      booking_id: input.booking_id ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }

  return data as CustomerNotification;
}

// ============================================================================
// NOTIFICATION HELPERS
// ============================================================================

/**
 * Get display icon name for a notification type
 */
export function getNotificationIcon(type: CustomerNotificationType): string {
  switch (type) {
    case 'booking_confirmed':
      return 'check-circle';
    case 'booking_cancelled':
      return 'x-circle';
    case 'reminder_24h':
      return 'calendar';
    case 'reminder_2h':
      return 'clock';
    default:
      return 'bell';
  }
}

/**
 * Get color class for notification type
 */
export function getNotificationColor(type: CustomerNotificationType): string {
  switch (type) {
    case 'booking_confirmed':
      return 'text-green-600 bg-green-100';
    case 'booking_cancelled':
      return 'text-red-600 bg-red-100';
    case 'reminder_24h':
      return 'text-blue-600 bg-blue-100';
    case 'reminder_2h':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Create notification title based on type
 */
export function createNotificationTitle(
  type: CustomerNotificationType,
): string {
  switch (type) {
    case 'booking_confirmed':
      return 'Booking Confirmed';
    case 'booking_cancelled':
      return 'Booking Cancelled';
    case 'reminder_24h':
      return 'Reminder: Tomorrow';
    case 'reminder_2h':
      return 'Starting Soon';
    default:
      return 'Notification';
  }
}

/**
 * Create notification message based on type and experience details
 */
export function createNotificationMessage(
  type: CustomerNotificationType,
  experienceName: string,
  additionalInfo?: string,
): string {
  switch (type) {
    case 'booking_confirmed':
      return `Your booking for "${experienceName}" has been confirmed!`;
    case 'booking_cancelled':
      return `Your booking for "${experienceName}" has been cancelled.${additionalInfo ? ` ${additionalInfo}` : ''}`;
    case 'reminder_24h':
      return `Your experience "${experienceName}" is tomorrow. Don't forget to check the meeting point!`;
    case 'reminder_2h':
      return `"${experienceName}" starts in 2 hours! Time to get ready.`;
    default:
      return experienceName;
  }
}

/**
 * Format relative time for display
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
