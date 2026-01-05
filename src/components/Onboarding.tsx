import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { UserPreferences } from '@/lib/types'
import { Mountain, Heart, Sparkles, Grid2X2, User, Users, UsersRound, Baby, Wallet, Gem, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface OnboardingProps {
  onComplete: (preferences: UserPreferences, dates?: { start: string; end: string }) => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [preferences, setPreferences] = useState<UserPreferences>({})
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const handleTravelStyleSelect = (style: 'adventure' | 'relaxation' | 'culture' | 'mix') => {
    setPreferences({ ...preferences, travelStyle: style })
  }

  const handleGroupTypeSelect = (type: 'solo' | 'couple' | 'friends' | 'family') => {
    setPreferences({ ...preferences, groupType: type })
  }

  const handleBudgetSelect = (budget: 'budget' | 'midrange' | 'luxury') => {
    setPreferences({ ...preferences, budget })
  }

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      const dates =
        startDate && endDate
          ? {
              start: startDate.toISOString().split('T')[0],
              end: endDate.toISOString().split('T')[0],
            }
          : undefined
      onComplete(preferences, dates)
    }
  }

  const handleSkipDates = () => {
    onComplete(preferences)
  }

  if (step === 1) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="max-w-2xl w-full space-y-8 text-center">
          <motion.div 
            className="space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="text-7xl mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              🏝️
            </motion.div>
            <motion.h1 
              className="font-display text-5xl font-bold text-foreground"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Welcome to Pulau
            </motion.h1>
            <motion.p 
              className="font-display text-2xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Build Your Bali Dream
            </motion.p>
            <motion.p 
              className="text-lg text-muted-foreground max-w-md mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Discover authentic local experiences and create your perfect Bali adventure, one experience at a time.
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button onClick={handleContinue} size="lg" className="text-lg px-12 py-6 h-auto shadow-xl">
              Get Started
            </Button>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-background p-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-display text-3xl font-bold">Tell us about your style</h2>
            <p className="text-muted-foreground">Help us recommend the perfect experiences for you</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold">Travel Style</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    preferences.travelStyle === 'adventure' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleTravelStyleSelect('adventure')}
                >
                  <div className="text-center space-y-2">
                    <Mountain className="w-8 h-8 mx-auto text-primary" />
                    <p className="font-medium">Adventure</p>
                  </div>
                </Card>
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    preferences.travelStyle === 'relaxation' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleTravelStyleSelect('relaxation')}
                >
                  <div className="text-center space-y-2">
                    <Heart className="w-8 h-8 mx-auto text-accent" />
                    <p className="font-medium">Relaxation</p>
                  </div>
                </Card>
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    preferences.travelStyle === 'culture' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleTravelStyleSelect('culture')}
                >
                  <div className="text-center space-y-2">
                    <Sparkles className="w-8 h-8 mx-auto text-golden" />
                    <p className="font-medium">Culture</p>
                  </div>
                </Card>
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    preferences.travelStyle === 'mix' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleTravelStyleSelect('mix')}
                >
                  <div className="text-center space-y-2">
                    <Grid2X2 className="w-8 h-8 mx-auto text-primary" />
                    <p className="font-medium">Mix of Everything</p>
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold">Group Type</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    preferences.groupType === 'solo' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleGroupTypeSelect('solo')}
                >
                  <div className="text-center space-y-2">
                    <User className="w-8 h-8 mx-auto text-primary" />
                    <p className="font-medium">Solo</p>
                  </div>
                </Card>
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    preferences.groupType === 'couple' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleGroupTypeSelect('couple')}
                >
                  <div className="text-center space-y-2">
                    <Users className="w-8 h-8 mx-auto text-accent" />
                    <p className="font-medium">Couple</p>
                  </div>
                </Card>
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    preferences.groupType === 'friends' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleGroupTypeSelect('friends')}
                >
                  <div className="text-center space-y-2">
                    <UsersRound className="w-8 h-8 mx-auto text-primary" />
                    <p className="font-medium">Friends</p>
                  </div>
                </Card>
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    preferences.groupType === 'family' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleGroupTypeSelect('family')}
                >
                  <div className="text-center space-y-2">
                    <Baby className="w-8 h-8 mx-auto text-golden" />
                    <p className="font-medium">Family</p>
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold">Budget Feel</h3>
              <div className="grid grid-cols-3 gap-4">
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    preferences.budget === 'budget' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleBudgetSelect('budget')}
                >
                  <div className="text-center space-y-2">
                    <Wallet className="w-8 h-8 mx-auto text-primary" />
                    <p className="font-medium">Budget-Conscious</p>
                  </div>
                </Card>
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    preferences.budget === 'midrange' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleBudgetSelect('midrange')}
                >
                  <div className="text-center space-y-2">
                    <TrendingUp className="w-8 h-8 mx-auto text-accent" />
                    <p className="font-medium">Mid-Range</p>
                  </div>
                </Card>
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    preferences.budget === 'luxury' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleBudgetSelect('luxury')}
                >
                  <div className="text-center space-y-2">
                    <Gem className="w-8 h-8 mx-auto text-golden" />
                    <p className="font-medium">Luxury</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={handleContinue} size="lg" className="px-12">
              Continue
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-display text-3xl font-bold">When are you visiting?</h2>
          <p className="text-muted-foreground">Select your arrival and departure dates</p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Arrival Date</label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Departure Date</label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => !startDate || date <= startDate}
                className="rounded-md border"
              />
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Button onClick={handleContinue} size="lg" disabled={!startDate || !endDate}>
            Complete Setup
          </Button>
          <Button onClick={handleSkipDates} variant="ghost" size="lg">
            Skip for now - Just browsing
          </Button>
        </div>
      </div>
    </div>
  )
}
