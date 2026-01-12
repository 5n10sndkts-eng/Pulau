/**
 * useCustomerNotifications Hook
 * Story: 30.4 - Create In-App Notification Center
 *
 * Manages customer notification state, fetching, and real-time subscriptions.
 * Provides actions for marking notifications as read.
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'
import { createElement } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchNotifications,
  getUnreadCount,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
  type CustomerNotification,
  type CustomerNotificationType,
} from '@/lib/customerNotificationService'
import {
  subscribeToCustomerNotifications,
  unsubscribe,
  type CustomerNotificationChangePayload,
} from '@/lib/realtimeService'

// ============================================================================
// TYPES
// ============================================================================

interface UseCustomerNotificationsOptions {
  /** Enable/disable the hook (useful for conditional rendering) */
  enabled?: boolean
  /** Show toast notifications for new notifications */
  showToasts?: boolean
}

interface UseCustomerNotificationsReturn {
  /** List of notifications, newest first */
  notifications: CustomerNotification[]
  /** Count of unread notifications */
  unreadCount: number
  /** Whether notifications are being fetched */
  isLoading: boolean
  /** Error if fetch failed */
  error: Error | null
  /** Whether real-time subscription is active */
  isSubscribed: boolean
  /** Mark a single notification as read */
  markAsRead: (notificationId: string) => Promise<void>
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>
  /** Manually refresh notifications */
  refresh: () => Promise<void>
}

// ============================================================================
// TOAST HELPERS
// ============================================================================

function getToastIcon(type: CustomerNotificationType) {
  const iconClass = 'h-4 w-4'
  switch (type) {
    case 'booking_confirmed':
      return createElement(Bell, { className: `${iconClass} text-green-600` })
    case 'booking_cancelled':
      return createElement(Bell, { className: `${iconClass} text-red-600` })
    case 'reminder_24h':
      return createElement(Bell, { className: `${iconClass} text-blue-600` })
    case 'reminder_2h':
      return createElement(Bell, { className: `${iconClass} text-orange-600` })
    default:
      return createElement(Bell, { className: iconClass })
  }
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useCustomerNotifications({
  enabled = true,
  showToasts = true,
}: UseCustomerNotificationsOptions = {}): UseCustomerNotificationsReturn {
  const { user } = useAuth()
  const userId = user?.id

  // State
  const [notifications, setNotifications] = useState<CustomerNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Refs
  const subscriptionIdRef = useRef<string | null>(null)

  // ============================================================================
  // FETCH NOTIFICATIONS
  // ============================================================================

  const fetchData = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const [notifs, count] = await Promise.all([
        fetchNotifications(userId),
        getUnreadCount(userId),
      ])

      setNotifications(notifs)
      setUnreadCount(count)
    } catch (err) {
      console.error('[useCustomerNotifications] Failed to fetch:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Initial fetch
  useEffect(() => {
    if (enabled && userId) {
      fetchData()
    }
  }, [enabled, userId, fetchData])

  // ============================================================================
  // REAL-TIME SUBSCRIPTION
  // ============================================================================

  useEffect(() => {
    if (!enabled || !userId) {
      return
    }

    try {
      subscriptionIdRef.current = subscribeToCustomerNotifications(
        userId,
        (payload: CustomerNotificationChangePayload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const newNotification = payload.new as CustomerNotification

            // Add to the top of the list
            setNotifications(prev => [newNotification, ...prev].slice(0, 50))
            setUnreadCount(prev => prev + 1)

            // Show toast if enabled
            if (showToasts) {
              toast(newNotification.title, {
                description: newNotification.message,
                icon: getToastIcon(newNotification.type as CustomerNotificationType),
                duration: 5000,
              })
            }
          }
        }
      )
      setIsSubscribed(true)
    } catch (err) {
      console.error('[useCustomerNotifications] Failed to subscribe:', err)
      setIsSubscribed(false)
    }

    return () => {
      if (subscriptionIdRef.current) {
        unsubscribe(subscriptionIdRef.current)
        subscriptionIdRef.current = null
        setIsSubscribed(false)
      }
    }
  }, [enabled, userId, showToasts])

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markAsReadService(notificationId)

      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('[useCustomerNotifications] Failed to mark as read:', err)
      throw err
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    try {
      await markAllAsReadService(userId)

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('[useCustomerNotifications] Failed to mark all as read:', err)
      throw err
    }
  }, [userId])

  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    isSubscribed,
    markAsRead,
    markAllAsRead,
    refresh,
  }
}
