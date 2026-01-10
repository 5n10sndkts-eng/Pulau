/**
 * useOnlineStatus Hook
 * Story: 26.2 - Build Offline Ticket Display
 * 
 * Custom React hook to detect online/offline status
 */

import { useState, useEffect } from 'react'

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
      console.log('📶 Network connection restored')
    }

    function handleOffline() {
      setIsOnline(false)
      console.log('📴 Network connection lost')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial state
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
