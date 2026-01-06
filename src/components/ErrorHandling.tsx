import { useState, useEffect } from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'

interface NetworkStatusProps {
  children: React.ReactNode
}

export function NetworkStatusWrapper({ children }: NetworkStatusProps) {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setShowBanner(false)
      toast.success('Connection restored')
    }

    const handleOffline = () => {
      setShowBanner(true)
      toast.error('No internet connection')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <>
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground">
          <div className="container flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">No internet connection</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      )}
      {children}
    </>
  )
}

interface SoldOutBadgeProps {
  spotsLeft: number
}

export function SoldOutBadge({ spotsLeft }: SoldOutBadgeProps) {
  if (spotsLeft === 0) {
    return (
      <div className="rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground">
        Sold Out
      </div>
    )
  }

  if (spotsLeft <= 3) {
    return (
      <div className="rounded-md bg-orange-500/20 px-3 py-2 text-sm font-medium text-orange-700 dark:text-orange-400">
        Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left!
      </div>
    )
  }

  return null
}

interface SoldOutOverlayProps {
  onWaitlist: () => void
  onViewSimilar: () => void
}

export function SoldOutOverlay({ onWaitlist, onViewSimilar }: SoldOutOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="max-w-md">
        <CardContent className="space-y-4 p-6 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Currently Unavailable</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This experience is fully booked for the selected dates
            </p>
          </div>
          <div className="space-y-2">
            <Button onClick={onWaitlist} className="w-full">
              Join Waitlist
            </Button>
            <Button onClick={onViewSimilar} variant="outline" className="w-full">
              View Similar Experiences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ErrorMessage({ 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry 
}: { 
  title?: string
  message?: string
  onRetry?: () => void 
}) {
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardContent className="space-y-4 p-6 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <WifiOff className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
