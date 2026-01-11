/**
 * useVendorNotifications Hook
 * Story: 29.5 - Add Real-Time Revenue Notifications
 *
 * Manages vendor notification subscriptions, toast notifications,
 * and browser notification triggers for new bookings.
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { DollarSign } from 'lucide-react'
import { createElement } from 'react'
import {
  subscribeToVendorBookings,
  unsubscribe,
  type BookingChangePayload,
} from '@/lib/realtimeService'
import {
  VendorNotification,
  NotificationPermissionStatus,
  NotificationPreferences,
  getNotificationPermission,
  requestNotificationPermission,
  getNotificationPreferences,
  saveNotificationPreferences,
  showBrowserNotification,
  createBookingNotification,
  addToNotificationHistory,
  getNotificationHistory,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotificationHistory,
} from '@/lib/vendorNotificationService'
import { formatCurrency } from '@/lib/vendorAnalyticsService'

// ============================================================================
// TYPES
// ============================================================================

interface UseVendorNotificationsOptions {
  vendorId: string
  enabled?: boolean
  simulateForDemo?: boolean
}

interface UseVendorNotificationsReturn {
  // State
  notifications: VendorNotification[]
  unreadCount: number
  permissionStatus: NotificationPermissionStatus
  preferences: NotificationPreferences
  isSubscribed: boolean

  // Actions
  requestPermission: () => Promise<NotificationPermissionStatus>
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  simulateBooking: () => void // For demo/testing
}

// ============================================================================
// MOCK DATA FOR DEMO
// ============================================================================

const MOCK_EXPERIENCES = [
  { id: 'exp-1', title: 'Volcano Sunrise Trek', price: 8500 },
  { id: 'exp-2', title: 'Rice Terrace Walking Tour', price: 4500 },
  { id: 'exp-3', title: 'Traditional Cooking Class', price: 6500 },
  { id: 'exp-4', title: 'Temple & Waterfall Tour', price: 7500 },
  { id: 'exp-5', title: 'Snorkeling Adventure', price: 9500 },
] as const

function getRandomExperience(): typeof MOCK_EXPERIENCES[number] {
  const index = Math.floor(Math.random() * MOCK_EXPERIENCES.length)
  return MOCK_EXPERIENCES[index]!
}

function getRandomGuestCount() {
  return Math.floor(Math.random() * 4) + 1 // 1-4 guests
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useVendorNotifications({
  vendorId,
  enabled = true,
  simulateForDemo = false,
}: UseVendorNotificationsOptions): UseVendorNotificationsReturn {
  // State
  const [notifications, setNotifications] = useState<VendorNotification[]>(() =>
    getNotificationHistory()
  )
  const [unreadCount, setUnreadCount] = useState(() => getUnreadCount())
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>(() =>
    getNotificationPermission()
  )
  const [preferences, setPreferences] = useState<NotificationPreferences>(() =>
    getNotificationPreferences()
  )
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Refs
  const subscriptionIdRef = useRef<string | null>(null)
  const simulationIntervalRef = useRef<number | null>(null)

  // ============================================================================
  // NOTIFICATION HANDLER
  // ============================================================================

  const handleNewBooking = useCallback(
    (
      bookingId: string,
      experienceTitle: string,
      guestCount: number,
      totalAmount: number,
      experienceId?: string
    ) => {
      // Create notification
      const notification = createBookingNotification(
        bookingId,
        experienceTitle,
        guestCount,
        totalAmount,
        experienceId
      )

      // Add to history
      addToNotificationHistory(notification)

      // Update state
      setNotifications(getNotificationHistory())
      setUnreadCount(getUnreadCount())

      // Show toast notification if enabled
      if (preferences.toastNotificationsEnabled) {
        toast.success(notification.title, {
          description: notification.message,
          icon: createElement(DollarSign, { className: 'h-4 w-4 text-green-600' }),
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => {
              // Mark as read when clicked
              markNotificationAsRead(notification.id)
              setNotifications(getNotificationHistory())
              setUnreadCount(getUnreadCount())
            },
          },
        })
      }

      // Show browser notification if enabled and permitted
      if (
        preferences.browserNotificationsEnabled &&
        permissionStatus === 'granted'
      ) {
        showBrowserNotification(notification)
      }
    },
    [preferences, permissionStatus]
  )

  // ============================================================================
  // REALTIME SUBSCRIPTION
  // ============================================================================

  useEffect(() => {
    if (!enabled || !vendorId) {
      return
    }

    // Subscribe to vendor bookings
    // Note: This requires vendor_id column on bookings table or filtering logic
    // For now, we'll set up the subscription infrastructure
    try {
      subscriptionIdRef.current = subscribeToVendorBookings(
        vendorId,
        (payload: BookingChangePayload) => {
          // Handle new booking (INSERT) or status update to 'confirmed' (UPDATE)
          if (payload.eventType === 'INSERT') {
            const booking = payload.new
            // In production, we'd join with trip_items/experiences to get details
            // For now, log the event
            console.log('[VendorNotifications] New booking detected:', booking)
          } else if (payload.eventType === 'UPDATE') {
            const booking = payload.new
            const oldBooking = payload.old
            // Check if status changed to confirmed
            if (
              oldBooking?.status !== 'confirmed' &&
              booking?.status === 'confirmed'
            ) {
              console.log('[VendorNotifications] Booking confirmed:', booking)
            }
          }
        }
      )
      setIsSubscribed(true)
    } catch (error) {
      console.error('[VendorNotifications] Failed to subscribe:', error)
      setIsSubscribed(false)
    }

    return () => {
      if (subscriptionIdRef.current) {
        unsubscribe(subscriptionIdRef.current)
        subscriptionIdRef.current = null
        setIsSubscribed(false)
      }
    }
  }, [enabled, vendorId])

  // ============================================================================
  // DEMO SIMULATION
  // ============================================================================

  useEffect(() => {
    if (!simulateForDemo || !enabled) {
      return
    }

    // Simulate a booking every 30-60 seconds for demo purposes
    const scheduleNextSimulation = () => {
      const delay = 30000 + Math.random() * 30000 // 30-60 seconds
      simulationIntervalRef.current = window.setTimeout(() => {
        const exp = getRandomExperience()
        const guests = getRandomGuestCount()
        const total = exp.price * guests

        handleNewBooking(
          `sim-${Date.now()}`,
          exp.title,
          guests,
          total,
          exp.id
        )

        scheduleNextSimulation()
      }, delay)
    }

    scheduleNextSimulation()

    return () => {
      if (simulationIntervalRef.current) {
        clearTimeout(simulationIntervalRef.current)
        simulationIntervalRef.current = null
      }
    }
  }, [simulateForDemo, enabled, handleNewBooking])

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const requestPermission = useCallback(async () => {
    const status = await requestNotificationPermission()
    setPermissionStatus(status)
    return status
  }, [])

  const updatePreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    saveNotificationPreferences(prefs)
    setPreferences(getNotificationPreferences())
  }, [])

  const markAsRead = useCallback((notificationId: string) => {
    markNotificationAsRead(notificationId)
    setNotifications(getNotificationHistory())
    setUnreadCount(getUnreadCount())
  }, [])

  const markAllAsRead = useCallback(() => {
    markAllNotificationsAsRead()
    setNotifications(getNotificationHistory())
    setUnreadCount(getUnreadCount())
  }, [])

  const clearAll = useCallback(() => {
    clearNotificationHistory()
    setNotifications([])
    setUnreadCount(0)
  }, [])

  const simulateBooking = useCallback(() => {
    const exp = getRandomExperience()
    const guests = getRandomGuestCount()
    const total = exp.price * guests

    handleNewBooking(
      `manual-${Date.now()}`,
      exp.title,
      guests,
      total,
      exp.id
    )
  }, [handleNewBooking])

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    notifications,
    unreadCount,
    permissionStatus,
    preferences,
    isSubscribed,
    requestPermission,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    clearAll,
    simulateBooking,
  }
}
