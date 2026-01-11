import { useState, useEffect, useCallback } from 'react'
import { VendorSession, Experience } from '@/lib/types'
import { validateExperienceForPublishing, ValidationResult } from '@/lib/publishValidation'
import { PublishExperienceModal } from './PublishExperienceModal'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { vendorService } from '@/lib/vendorService'
import { getVendorOnboardingState, getVendorCapabilities, VendorCapabilities } from '@/lib/vendorStateMachine'
import {
  Plus,
  ArrowLeft,
  Edit,
  MoreVertical,
  DollarSign,
  Users,
  Clock,
  Star,
  Zap,
  Timer
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface VendorExperiencesProps {
  session: VendorSession
  onBack: () => void
  onNavigateToCreate: () => void
  onNavigateToEdit: (id: string) => void
  onNavigateToAvailability: (id: string) => void
}

export function VendorExperiences({ session, onBack, onNavigateToCreate, onNavigateToEdit, onNavigateToAvailability }: VendorExperiencesProps) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [vendorCapabilities, setVendorCapabilities] = useState<VendorCapabilities | null>(null)
  const [updatingInstantBook, setUpdatingInstantBook] = useState<string | null>(null)
  const [updatingCutoff, setUpdatingCutoff] = useState<string | null>(null)

  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  const loadExperiences = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await vendorService.getVendorExperiences(session.vendorId)
      setExperiences(data)
    } catch (error) {
      console.error('Failed to load experiences:', error)
      toast.error('Failed to load experiences')
    } finally {
      setIsLoading(false)
    }
  }, [session.vendorId])

  const loadVendorCapabilities = useCallback(async () => {
    try {
      const state = await getVendorOnboardingState(session.vendorId)
      if (state) {
        setVendorCapabilities(getVendorCapabilities(state))
      }
    } catch (error) {
      console.error('Failed to load vendor capabilities:', error)
    }
  }, [session.vendorId])

  useEffect(() => {
    loadExperiences()
    loadVendorCapabilities()
  }, [loadExperiences, loadVendorCapabilities])



  const handleInstantBookToggle = async (experienceId: string, enabled: boolean) => {
    if (!vendorCapabilities?.canEnableInstantBook) {
      toast.error('Complete payment setup to enable Instant Book')
      return
    }

    setUpdatingInstantBook(experienceId)
    try {
      await vendorService.updateExperienceInstantBook(experienceId, enabled)
      setExperiences(prev => prev.map(exp =>
        exp.id === experienceId ? { ...exp, instantBookEnabled: enabled } : exp
      ))
      toast.success(enabled ? 'Instant Book enabled!' : 'Switched to Request to Book')
    } catch (error) {
      console.error('Failed to update instant book:', error)
      toast.error('Failed to update booking policy')
    } finally {
      setUpdatingInstantBook(null)
    }
  }

  const handleCutoffChange = async (experienceId: string, hours: string) => {
    const cutoffHours = parseInt(hours, 10)
    if (isNaN(cutoffHours)) return

    setUpdatingCutoff(experienceId)
    try {
      await vendorService.updateExperienceCutoffHours(experienceId, cutoffHours)
      setExperiences(prev => prev.map(exp =>
        exp.id === experienceId ? { ...exp, cutoffHours } : exp
      ))
      toast.success(`Cut-off time set to ${cutoffHours} hours`)
    } catch (error) {
      console.error('Failed to update cutoff:', error)
      toast.error('Failed to update cut-off time')
    } finally {
      setUpdatingCutoff(null)
    }
  }

  const handlePublishClick = (experience: Experience) => {
    const result = validateExperienceForPublishing(experience)
    setValidationResult(result)
    setSelectedExpId(experience.id)
    setPublishModalOpen(true)
  }

  const handleConfirmPublish = async () => {
    if (!selectedExpId) return

    setIsPublishing(true)

    try {
      await vendorService.updateExperienceStatus(selectedExpId, 'active')

      setExperiences(prev => prev.map(exp => {
        if (exp.id === selectedExpId) {
          return {
            ...exp,
            status: 'active',
            publishedAt: new Date().toISOString()
          }
        }
        return exp
      }))

      setPublishModalOpen(false)
      toast.success('Experience published successfully!', {
        description: 'It is now visible to travelers.'
      })
    } catch (e) {
      toast.error('Failed to publish experience')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await vendorService.updateExperienceStatus(id, 'draft') // Using draft as inactive state equivalent

      setExperiences(prev => prev.map(exp => {
        if (exp.id === id) {
          return {
            ...exp,
            status: 'draft'
          }
        }
        return exp
      }))
      toast('Experience deactivated', {
        description: 'It is no longer visible to travelers.'
      })
    } catch (e) {
      toast.error('Failed to deactivate experience')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold">My Experiences</h1>
              <p className="text-white/80 mt-1">
                {experiences.length} {experiences.length === 1 ? 'experience' : 'experiences'} listed
              </p>
            </div>
            <Button
              className="bg-white text-primary hover:bg-white/90"
              onClick={onNavigateToCreate}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Experience
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {isLoading ? (
          <div className="text-center py-12">Loading experiences...</div>
        ) : experiences.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold">No experiences yet</h2>
              <p className="text-muted-foreground">
                Create your first experience to start attracting travelers
              </p>
              <Button
                size="lg"
                onClick={onNavigateToCreate}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Experience
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {experiences.map((experience) => (
              <Card key={experience.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative w-full md:w-64 h-48 md:h-auto">
                    <img
                      src={experience.images[0]}
                      alt={experience.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className={`absolute top-3 right-3 text-white ${experience.status === 'active' ? 'bg-green-600' : 'bg-gray-500'
                      }`}>
                      {experience.status === 'active' ? 'Active' : 'Draft'}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-bold mb-2">
                          {experience.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{experience.category.replace('_', ' ')}</Badge>
                          <Badge variant="outline">{experience.difficulty}</Badge>
                          <Badge variant="outline">{experience.duration}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">${experience.price.amount}</p>
                          <p className="text-xs text-muted-foreground">per {experience.price.per}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{experience.groupSize.min}-{experience.groupSize.max}</p>
                          <p className="text-xs text-muted-foreground">guests</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <div>
                          <p className="font-semibold">{experience.provider.rating}</p>
                          <p className="text-xs text-muted-foreground">{experience.reviews.length} reviews</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{experience.duration}</p>
                          <p className="text-xs text-muted-foreground">duration</p>
                        </div>
                      </div>
                    </div>

                    {/* Instant Book Toggle */}
                    <div className="flex items-center justify-between rounded-lg border p-3 mb-4 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Zap className={`h-4 w-4 ${experience.instantBookEnabled ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                        <div>
                          <p className="text-sm font-medium">
                            {experience.instantBookEnabled ? 'Instant Book' : 'Request to Book'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {experience.instantBookEnabled
                              ? 'Travelers book instantly'
                              : 'Approval required'}
                          </p>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Switch
                                checked={experience.instantBookEnabled ?? false}
                                onCheckedChange={(checked) => handleInstantBookToggle(experience.id, checked)}
                                disabled={!vendorCapabilities?.canEnableInstantBook || updatingInstantBook === experience.id}
                                aria-label="Toggle instant book"
                              />
                            </div>
                          </TooltipTrigger>
                          {!vendorCapabilities?.canEnableInstantBook && (
                            <TooltipContent>
                              <p>Complete payment setup to enable Instant Book</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Cut-off Time Selector */}
                    <div className="flex items-center justify-between rounded-lg border p-3 mb-4 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Booking Cut-off</p>
                          <p className="text-xs text-muted-foreground">
                            Closes {experience.cutoffHours ?? 2}h before start
                          </p>
                        </div>
                      </div>
                      <Select
                        value={String(experience.cutoffHours ?? 2)}
                        onValueChange={(value) => handleCutoffChange(experience.id, value)}
                        disabled={updatingCutoff === experience.id}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="6">6 hours</SelectItem>
                          <SelectItem value="12">12 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                          <SelectItem value="48">48 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      {experience.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeactivate(experience.id)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handlePublishClick(experience)}
                        >
                          Publish
                        </Button>
                      )}

                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => onNavigateToEdit(experience.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => onNavigateToAvailability(experience.id)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Availability
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <PublishExperienceModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
        validationResult={validationResult}
        isPublishing={isPublishing}
      />
    </div>
  )
}
