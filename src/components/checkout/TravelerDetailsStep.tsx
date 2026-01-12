import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trip } from '@/lib/types'
import { TravelerInfo } from './CheckoutFlow'
import { ArrowLeft, Plus, X, Shield, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface TravelerDetailsStepProps {
  trip: Trip
  initialData?: {
    leadTraveler?: TravelerInfo
    additionalTravelers?: Omit<TravelerInfo, 'email' | 'phone' | 'countryCode'>[]
    specialRequests?: string
  }
  onBack: () => void
  onContinue: (data: {
    leadTraveler: TravelerInfo
    additionalTravelers: Omit<TravelerInfo, 'email' | 'phone' | 'countryCode'>[]
    specialRequests: string
  }) => void
}

export function TravelerDetailsStep({ trip, initialData, onBack, onContinue }: TravelerDetailsStepProps) {
  const { user } = useAuth()

  // Pre-fill from user profile if available
  const getInitialLeadTraveler = (): TravelerInfo => {
    if (initialData?.leadTraveler) {
      return initialData.leadTraveler
    }

    // Pre-fill from logged-in user
    if (user) {
      const nameParts = (user.name || '').split(' ')
      return {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: '',
        countryCode: '+1',
        nationality: '',
      }
    }

    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      countryCode: '+1',
      nationality: '',
    }
  }

  const [leadTraveler, setLeadTraveler] = useState<TravelerInfo>(getInitialLeadTraveler())
  const isUserLoggedIn = !!user

  const [additionalTravelers, setAdditionalTravelers] = useState<
    Omit<TravelerInfo, 'email' | 'phone' | 'countryCode'>[]
  >(initialData?.additionalTravelers || [])

  const [specialRequests, setSpecialRequests] = useState(initialData?.specialRequests || '')

  const totalTravelers = trip.travelers || 2
  const additionalTravelersCount = totalTravelers - 1

  const handleAddTraveler = () => {
    if (additionalTravelers.length < additionalTravelersCount) {
      setAdditionalTravelers([...additionalTravelers, { firstName: '', lastName: '', nationality: '' }])
    }
  }

  const handleRemoveTraveler = (index: number) => {
    setAdditionalTravelers(additionalTravelers.filter((_, i) => i !== index))
  }

  const handleUpdateAdditionalTraveler = (
    index: number,
    field: keyof Omit<TravelerInfo, 'email' | 'phone' | 'countryCode'>,
    value: string
  ) => {
    const updated = [...additionalTravelers]
    updated[index] = { ...updated[index], [field]: value } as Omit<TravelerInfo, 'email' | 'phone' | 'countryCode'>
    setAdditionalTravelers(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onContinue({
      leadTraveler,
      additionalTravelers,
      specialRequests,
    })
  }

  const isValid =
    leadTraveler.firstName &&
    leadTraveler.lastName &&
    leadTraveler.email &&
    leadTraveler.phone &&
    leadTraveler.nationality

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold">Who's Traveling?</h1>
          <p className="text-muted-foreground">We'll need these details to confirm your bookings</p>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-xl font-bold mb-4">Lead Traveler</h2>
        <p className="text-sm text-muted-foreground mb-6">This person will receive all booking confirmations</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={leadTraveler.firstName}
              onChange={(e) => setLeadTraveler({ ...leadTraveler, firstName: e.target.value })}
              placeholder="Enter first name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={leadTraveler.lastName}
              onChange={(e) => setLeadTraveler({ ...leadTraveler, lastName: e.target.value })}
              placeholder="Enter last name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={leadTraveler.email}
              onChange={(e) => setLeadTraveler({ ...leadTraveler, email: e.target.value })}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="flex gap-2">
              <Select
                value={leadTraveler.countryCode}
                onValueChange={(value) => setLeadTraveler({ ...leadTraveler, countryCode: value })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+1">🇺🇸 +1</SelectItem>
                  <SelectItem value="+44">🇬🇧 +44</SelectItem>
                  <SelectItem value="+61">🇦🇺 +61</SelectItem>
                  <SelectItem value="+62">🇮🇩 +62</SelectItem>
                  <SelectItem value="+65">🇸🇬 +65</SelectItem>
                  <SelectItem value="+49">🇩🇪 +49</SelectItem>
                  <SelectItem value="+33">🇫🇷 +33</SelectItem>
                  <SelectItem value="+81">🇯🇵 +81</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                value={leadTraveler.phone}
                onChange={(e) => setLeadTraveler({ ...leadTraveler, phone: e.target.value })}
                placeholder="555-1234"
                className="flex-1"
                required
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nationality">Nationality *</Label>
            <Select
              value={leadTraveler.nationality}
              onValueChange={(value) => setLeadTraveler({ ...leadTraveler, nationality: value })}
            >
              <SelectTrigger id="nationality">
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="NL">Netherlands</SelectItem>
                <SelectItem value="SG">Singapore</SelectItem>
                <SelectItem value="JP">Japan</SelectItem>
                <SelectItem value="KR">South Korea</SelectItem>
                <SelectItem value="ID">Indonesia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {additionalTravelersCount > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold">Additional Travelers</h2>
              <p className="text-sm text-muted-foreground">
                {additionalTravelers.length} of {additionalTravelersCount} added
              </p>
            </div>
            {additionalTravelers.length < additionalTravelersCount && (
              <Button type="button" variant="outline" size="sm" onClick={handleAddTraveler}>
                <Plus className="w-4 h-4 mr-2" />
                Add Traveler
              </Button>
            )}
          </div>

          {additionalTravelers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Add information for other travelers in your group
            </p>
          )}

          <div className="space-y-6">
            {additionalTravelers.map((traveler, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Traveler {index + 2}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTraveler(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`traveler-${index}-firstName`}>First Name</Label>
                    <Input
                      id={`traveler-${index}-firstName`}
                      value={traveler.firstName}
                      onChange={(e) => handleUpdateAdditionalTraveler(index, 'firstName', e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`traveler-${index}-lastName`}>Last Name</Label>
                    <Input
                      id={`traveler-${index}-lastName`}
                      value={traveler.lastName}
                      onChange={(e) => handleUpdateAdditionalTraveler(index, 'lastName', e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`traveler-${index}-nationality`}>Nationality</Label>
                    <Select
                      value={traveler.nationality}
                      onValueChange={(value) => handleUpdateAdditionalTraveler(index, 'nationality', value)}
                    >
                      <SelectTrigger id={`traveler-${index}-nationality`}>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="NL">Netherlands</SelectItem>
                        <SelectItem value="SG">Singapore</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="KR">South Korea</SelectItem>
                        <SelectItem value="ID">Indonesia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="font-display text-xl font-bold mb-4">Special Requests</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Let us know about any allergies, dietary restrictions, accessibility needs, or if you're celebrating
          something special
        </p>

        <div className="space-y-2">
          <Textarea
            id="specialRequests"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="E.g., vegetarian meals, gluten-free options, celebrating anniversary..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">{specialRequests.length}/500 characters</p>
        </div>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={!isValid}>
        Continue to Payment
      </Button>
    </form>
  )
}
