/**
 * Vendor Notification Service
 * Story: 29.5 - Add Real-Time Revenue Notifications
 *
 * Handles browser notifications for vendor booking alerts.
 * Uses the Web Notifications API to show desktop notifications.
 */

import { formatCurrency } from './vendorAnalyticsService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'payout_sent'
  | 'review_received';

export interface VendorNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  amount?: number;
  bookingId?: string;
  experienceId?: string;
  experienceTitle?: string;
  guestCount?: number;
  createdAt: Date;
  read: boolean;
}

export type NotificationPermissionStatus =
  | 'default'
  | 'granted'
  | 'denied'
  | 'unsupported';

// ============================================================================
// PERMISSION MANAGEMENT
// ============================================================================

/**
 * Check if browser notifications are supported
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermissionStatus {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionStatus;
}

/**
 * Request permission to show browser notifications
 * @returns The permission status after requesting
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  // Already granted or denied
  if (Notification.permission !== 'default') {
    return Notification.permission as NotificationPermissionStatus;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermissionStatus;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

// ============================================================================
// BROWSER NOTIFICATIONS
// ============================================================================

/**
 * Show a browser notification
 * @param notification - The notification data to display
 * @returns The Notification instance or null if not permitted
 */
export function showBrowserNotification(
  notification: VendorNotification,
): Notification | null {
  if (!isNotificationSupported()) {
    console.warn('Browser notifications not supported');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Browser notification permission not granted');
    return null;
  }

  try {
    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: `booking-${notification.id}`,
      requireInteraction: false,
      silent: false,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 5000);

    return browserNotification;
  } catch (error) {
    console.error('Failed to show browser notification:', error);
    return null;
  }
}

// ============================================================================
// NOTIFICATION CREATION HELPERS
// ============================================================================

/**
 * Create a booking confirmed notification
 */
export function createBookingNotification(
  bookingId: string,
  experienceTitle: string,
  guestCount: number,
  totalAmount: number, // in cents
  experienceId?: string,
): VendorNotification {
  const formattedAmount = formatCurrency(totalAmount);

  return {
    id: `notif-${bookingId}-${Date.now()}`,
    type: 'booking_confirmed',
    title: 'New Booking Confirmed!',
    message: `${formattedAmount} • ${guestCount} guest${guestCount !== 1 ? 's' : ''} for ${experienceTitle}`,
    amount: totalAmount,
    bookingId,
    experienceId,
    experienceTitle,
    guestCount,
    createdAt: new Date(),
    read: false,
  };
}

/**
 * Create a booking cancelled notification
 */
export function createCancellationNotification(
  bookingId: string,
  experienceTitle: string,
  refundAmount: number, // in cents
): VendorNotification {
  const formattedAmount = formatCurrency(refundAmount);

  return {
    id: `notif-cancel-${bookingId}-${Date.now()}`,
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: `${experienceTitle} • ${formattedAmount} refunded`,
    amount: refundAmount,
    bookingId,
    experienceTitle,
    createdAt: new Date(),
    read: false,
  };
}

/**
 * Create a payout notification
 */
export function createPayoutNotification(
  payoutId: string,
  amount: number, // in cents
): VendorNotification {
  const formattedAmount = formatCurrency(amount);

  return {
    id: `notif-payout-${payoutId}-${Date.now()}`,
    type: 'payout_sent',
    title: 'Payout Sent',
    message: `${formattedAmount} is on the way to your bank account`,
    amount,
    createdAt: new Date(),
    read: false,
  };
}

// ============================================================================
// LOCAL STORAGE FOR NOTIFICATION PREFERENCES
// ============================================================================

const NOTIFICATION_PREFS_KEY = 'vendor_notification_prefs';

export interface NotificationPreferences {
  browserNotificationsEnabled: boolean;
  toastNotificationsEnabled: boolean;
  soundEnabled: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  browserNotificationsEnabled: true,
  toastNotificationsEnabled: true,
  soundEnabled: false,
};

/**
 * Get notification preferences from local storage
 */
export function getNotificationPreferences(): NotificationPreferences {
  try {
    const stored = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (stored) {
      return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to read notification preferences:', error);
  }
  return DEFAULT_PREFS;
}

/**
 * Save notification preferences to local storage
 */
export function saveNotificationPreferences(
  prefs: Partial<NotificationPreferences>,
): void {
  try {
    const current = getNotificationPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
  }
}

// ============================================================================
// NOTIFICATION HISTORY (IN-MEMORY FOR SESSION)
// ============================================================================

const MAX_NOTIFICATIONS = 50;
let notificationHistory: VendorNotification[] = [];

/**
 * Add a notification to history
 */
export function addToNotificationHistory(
  notification: VendorNotification,
): void {
  notificationHistory = [notification, ...notificationHistory].slice(
    0,
    MAX_NOTIFICATIONS,
  );
}

/**
 * Get notification history
 */
export function getNotificationHistory(): VendorNotification[] {
  return [...notificationHistory];
}

/**
 * Get unread notification count
 */
export function getUnreadCount(): number {
  return notificationHistory.filter((n) => !n.read).length;
}

/**
 * Mark a notification as read
 */
export function markNotificationAsRead(notificationId: string): void {
  notificationHistory = notificationHistory.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n,
  );
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsAsRead(): void {
  notificationHistory = notificationHistory.map((n) => ({ ...n, read: true }));
}

/**
 * Clear notification history
 */
export function clearNotificationHistory(): void {
  notificationHistory = [];
}
