/**
 * Network Sync Utility
 * Story: 26.4 - Implement Network Restoration Sync
 * 
 * Automatically syncs data when network connection is restored
 */

import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useOnlineStatus } from './useOnlineStatus'
import { toast } from 'sonner'

interface NetworkSyncOptions {
  onSync?: () => Promise<void>
  syncDelay?: number  // Delay in ms before syncing (default: 1000)
  showNotifications?: boolean  // Show toast notifications (default: true)
  refetchQueries?: boolean  // Auto-refetch all queries on reconnect (default: true)
}

/**
 * Hook to automatically sync data when network is restored
 * 
 * @example
 * ```typescript
 * useNetworkSync({
 *   onSync: async () => {
 *     await refreshBookingData()
 *   },
 *   syncDelay: 2000
 * })
 * ```
 */
export function useNetworkSync(options: NetworkSyncOptions = {}) {
  const {
    onSync,
    syncDelay = 1000,
    showNotifications = true,
    refetchQueries = true
  } = options

  const queryClient = useQueryClient()
  const isOnline = useOnlineStatus()
  const previousOnlineStatus = useRef(isOnline)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSyncing = useRef(false)

  const performSync = useCallback(async () => {
    if (isSyncing.current) return

    isSyncing.current = true

    try {
      if (showNotifications) {
        toast.info('Syncing data...')
      }

      // Auto-refetch all queries when network is restored
      if (refetchQueries) {
        await queryClient.refetchQueries()
      }

      // Execute custom sync function if provided
      if (onSync) {
        await onSync()
      }

      if (showNotifications) {
        toast.success('Data synced successfully')
      }
    } catch (error) {
      console.error('Network sync failed:', error)
      
      if (showNotifications) {
        toast.error('Failed to sync data')
      }
    } finally {
      isSyncing.current = false
    }
  }, [onSync, showNotifications, refetchQueries, queryClient])

  useEffect(() => {
    // Check if we just came back online
    const wasOffline = !previousOnlineStatus.current
    const isNowOnline = isOnline

    if (wasOffline && isNowOnline) {
      console.log('📶 Network restored - scheduling sync in', syncDelay, 'ms')

      // Clear any existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }

      // Schedule sync after delay (per NFR-REL-02: within 10 seconds)
      syncTimeoutRef.current = setTimeout(() => {
        performSync()
      }, syncDelay)
    }

    // Update previous status
    previousOnlineStatus.current = isOnline

    // Cleanup
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [isOnline, syncDelay, performSync])

  return {
    isOnline,
    isSyncing: isSyncing.current
  }
}

/**
 * Utility to manually trigger a sync
 */
export async function triggerManualSync(syncFn: () => Promise<void>): Promise<boolean> {
  try {
    await syncFn()
    return true
  } catch (error) {
    console.error('Manual sync failed:', error)
    return false
  }
}
