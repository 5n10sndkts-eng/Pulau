import { useState } from 'react'
import { Experience, ExperienceAvailability } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface PublishExperienceModalProps {
  experience: Experience
  availabilityData: ExperienceAvailability[]
  isOpen: boolean
  onClose: () => void
  onPublish: (experienceId: string) => void
  onUnpublish?: (experienceId: string) => void
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function PublishExperienceModal({
  experience,
  availabilityData,
  isOpen,
  onClose,
  onPublish,
  onUnpublish
}: PublishExperienceModalProps) {
  const [isPublishing, setIsPublishing] = useState(false)

  const validateExperience = (): ValidationResult => {
    const errors: string[] = []

    // Check title
    if (!experience.title || experience.title.trim() === '') {
      errors.push('Experience title is required')
    }

    // Check description
    if (!experience.description || experience.description.trim() === '') {
      errors.push('Description is required')
    }

    // Check price
    if (!experience.price || experience.price.amount <= 0) {
      errors.push('Valid price is required')
    }

    // Check duration
    if (!experience.duration || experience.duration.trim() === '') {
      errors.push('Duration is required')
    }

    // Check group size
    if (!experience.groupSize || experience.groupSize.min < 1 || experience.groupSize.max < 1) {
      errors.push('Valid group size is required')
    }

    // Check images (at least 3)
    if (!experience.images || experience.images.length < 3) {
      errors.push(`At least 3 images are required (currently ${experience.images?.length || 0})`)
    }

    // Check availability (at least one date)
    const availableDates = availabilityData.filter(a => a.status === 'available')
    if (availableDates.length === 0) {
      errors.push('At least one available date must be set')
    }

    // Check meeting point
    if (!experience.meetingPoint || !experience.meetingPoint.name || 
        (!experience.meetingPoint.address && !experience.meetingPoint.instructions)) {
      errors.push('Meeting point information is incomplete')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const validation = validateExperience()
  const isCurrentlyActive = experience.status === 'active'

  const handlePublish = async () => {
    if (!validation.isValid) {
      toast.error('Please complete all requirements before publishing')
      return
    }

    setIsPublishing(true)

    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onPublish(experience.id)
      toast.success('Experience is now live!')
      onClose()
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!onUnpublish) return

    setIsPublishing(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onUnpublish(experience.id)
      toast.success('Experience deactivated')
      onClose()
    } finally {
      setIsPublishing(false)
    }
  }

  const getChecklistItem = (condition: boolean, label: string) => {
    return (
      <div className="flex items-start gap-3 py-2">
        {condition ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        )}
        <span className={condition ? 'text-foreground' : 'text-muted-foreground'}>
          {label}
        </span>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCurrentlyActive ? 'Deactivate Experience' : 'Publish Experience'}
          </DialogTitle>
          <DialogDescription>
            {isCurrentlyActive 
              ? 'This will hide your experience from travelers' 
              : 'Make your experience visible to travelers'
            }
          </DialogDescription>
        </DialogHeader>

        {isCurrentlyActive ? (
          <div className="py-4 space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Deactivate Experience</AlertTitle>
              <AlertDescription>
                Your experience will be hidden from search and browse results. 
                Existing bookings will remain active. You can reactivate it anytime.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleUnpublish}
                disabled={isPublishing}
                className="flex-1"
              >
                {isPublishing ? 'Deactivating...' : 'Deactivate'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="py-4 space-y-4">
              {!validation.isValid && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Requirements Not Met</AlertTitle>
                  <AlertDescription>
                    Complete these requirements before publishing:
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-1">
                <h4 className="font-medium mb-2">Publishing Checklist</h4>
                
                {getChecklistItem(
                  !!experience.title && experience.title.trim() !== '',
                  'Experience title'
                )}
                
                {getChecklistItem(
                  !!experience.description && experience.description.trim() !== '',
                  'Description'
                )}
                
                {getChecklistItem(
                  !!experience.price && experience.price.amount > 0,
                  'Price information'
                )}
                
                {getChecklistItem(
                  !!experience.duration && experience.duration.trim() !== '',
                  'Duration'
                )}
                
                {getChecklistItem(
                  !!experience.groupSize && experience.groupSize.min >= 1 && experience.groupSize.max >= 1,
                  'Group size settings'
                )}
                
                {getChecklistItem(
                  !!experience.images && experience.images.length >= 3,
                  `At least 3 images (${experience.images?.length || 0}/3)`
                )}
                
                {getChecklistItem(
                  availabilityData.filter(a => a.status === 'available').length > 0,
                  `At least one available date (${availabilityData.filter(a => a.status === 'available').length} set)`
                )}
                
                {getChecklistItem(
                  !!experience.meetingPoint && !!experience.meetingPoint.name,
                  'Meeting point information'
                )}
              </div>

              {validation.isValid && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Ready to Publish!</AlertTitle>
                  <AlertDescription>
                    All requirements met. Your experience will be visible to travelers immediately.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {validation.isValid && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    toast.info('Preview feature coming soon')
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button 
                onClick={handlePublish}
                disabled={!validation.isValid || isPublishing}
              >
                {isPublishing ? 'Publishing...' : 'Publish Experience'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
