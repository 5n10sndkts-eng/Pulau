import { useState } from 'react'
import { Share2, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { Trip } from '@/lib/types'

interface ShareTripModalProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip
  onUpdateTrip: (updates: Partial<Trip>) => void
}

export function ShareTripModal({ isOpen, onClose, trip, onUpdateTrip }: ShareTripModalProps) {
  const [shareToken, setShareToken] = useState(trip.shareToken)

  const generateShareLink = () => {
    if (!shareToken) {
      const token = crypto.randomUUID()
      onUpdateTrip({ shareToken: token })
      setShareToken(token)
      return `${window.location.origin}/trip/${token}`
    }
    return `${window.location.origin}/trip/${shareToken}`
  }

  const handleCopyLink = async () => {
    const url = generateShareLink()
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleNativeShare = async () => {
    const url = generateShareLink()
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my trip plan',
          text: `I'm planning a trip to ${trip.destination}. Take a look!`,
          url,
        })
        toast.success('Shared successfully!')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share')
        }
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Trip</DialogTitle>
          <DialogDescription>
            Share a read-only view of your trip itinerary with friends and family
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <Button onClick={handleCopyLink} className="w-full justify-start" variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>

          {navigator.share && (
            <Button onClick={handleNativeShare} className="w-full justify-start" variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Share via...
            </Button>
          )}
        </div>

        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium">Note:</p>
          <p className="text-muted-foreground">
            Anyone with this link can view your trip, but cannot edit it.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
