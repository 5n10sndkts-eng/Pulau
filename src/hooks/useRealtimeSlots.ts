/**
 * useRealtimeSlots Hook
 * Story: 25.1 - Implement Supabase Realtime Subscriptions
 * Phase: 2a - Core Transactional
 *
 * Custom React hook for subscribing to real-time slot availability updates.
 * Automatically handles subscription lifecycle, reconnection, and cleanup.
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { subscribeToSlotAvailability, unsubscribe, type SlotChangePayload } from '@/lib/realtimeService'

/**
 * Connection state for realtime subscription
 */
export type RealtimeConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * Hook return value
 */
export interface UseRealtimeSlotsReturn {
  connectionState: RealtimeConnectionState
  lastUpdate: Date | null
  error: string | null
  isStale: boolean
}

/**
 * Subscribe to real-time slot availability changes for an experience
 * 
 * @param experienceId - Experience to monitor
 * @param onSlotChange - Callback when slot changes (must be memoized)
 * @param options - Configuration options
 * @returns Connection state, last update time, error, and staleness indicator
 * 
 * @example
 * ```typescript
 * const handleSlotChange = useCallback((payload: SlotChangePayload) => {
 *   if (payload.eventType === 'UPDATE') {
 *     updateAvailability(payload.new.available_count)
 *   }
 * }, [])
 * 
 * const { connectionState, lastUpdate, isStale } = useRealtimeSlots(
 *   experience.id,
 *   handleSlotChange,
 *   { staleThresholdMs: 60000 }
 * )
 * ```
 */
export function useRealtimeSlots(
  experienceId: string | undefined,
  onSlotChange?: (payload: SlotChangePayload) => void,
  options: {
    staleThresholdMs?: number // Consider data stale after this many ms (default 60000)
    retryOnError?: boolean    // Retry subscription on error (default true)
    retryDelayMs?: number     // Delay before retry (default 3000)
  } = {}
): UseRealtimeSlotsReturn {
  const {
    staleThresholdMs = 60000,
    retryOnError = true,
    retryDelayMs = 3000
  } = options

  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>('disconnected')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStale, setIsStale] = useState(false)

  // Use ref to track subscription ID to avoid stale closures
  const subscriptionIdRef = useRef<string | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if data is stale
  useEffect(() => {
    if (!lastUpdate) {
      setIsStale(false)
      return
    }

    const checkStale = () => {
      const now = Date.now()
      const updateTime = lastUpdate.getTime()
      setIsStale(now - updateTime > staleThresholdMs)
    }

    // Check immediately
    checkStale()

    // Check periodically
    const interval = setInterval(checkStale, 10000) // Check every 10s

    return () => clearInterval(interval)
  }, [lastUpdate, staleThresholdMs])

  // Memoize the subscription setup to avoid recreating on every render
  const setupSubscription = useCallback(() => {
    if (!experienceId) {
      setConnectionState('disconnected')
      setError(null)
      return
    }

    setConnectionState('connecting')
    setError(null)

    try {
      // Set up subscription
      const subscriptionId = subscribeToSlotAvailability(experienceId, (payload) => {
        // Update last update time (for staleness check)
        setLastUpdate(new Date())
        
        // Set connected state
        setConnectionState('connected')
        setError(null)
        
        // Call user callback if provided
        if (onSlotChange) {
          try {
            onSlotChange(payload)
          } catch (callbackError) {
            console.error('Error in slot change callback:', callbackError)
            setError(callbackError instanceof Error ? callbackError.message : 'Callback error')
          }
        }
      })

      subscriptionIdRef.current = subscriptionId
      
      // Set connected after a brief delay to allow channel to establish
      setTimeout(() => {
        if (subscriptionIdRef.current === subscriptionId) {
          setConnectionState('connected')
        }
      }, 100)

    } catch (subscriptionError) {
      const errorMessage = subscriptionError instanceof Error 
        ? subscriptionError.message 
        : 'Failed to subscribe to realtime updates'
      
      console.error('Error subscribing to realtime slots:', subscriptionError)
      setConnectionState('error')
      setError(errorMessage)

      // Retry if enabled
      if (retryOnError) {
        retryTimeoutRef.current = setTimeout(() => {
          console.log(`Retrying subscription for experience ${experienceId}...`)
          setupSubscription()
        }, retryDelayMs)
      }
    }
  }, [experienceId, onSlotChange, retryOnError, retryDelayMs])

  // Set up and clean up subscription
  useEffect(() => {
    setupSubscription()

    // Cleanup function
    return () => {
      // Clear retry timeout if exists
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }

      // Unsubscribe from realtime
      if (subscriptionIdRef.current) {
        unsubscribe(subscriptionIdRef.current).catch(err => {
          console.error('Error unsubscribing from realtime:', err)
        })
        subscriptionIdRef.current = null
      }
      
      setConnectionState('disconnected')
      setError(null)
    }
  }, [setupSubscription])

  return { 
    connectionState, 
    lastUpdate, 
    error,
    isStale
  }
}
