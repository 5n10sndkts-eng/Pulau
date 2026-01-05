import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Onboarding } from './components/Onboarding'
import { HomeScreen } from './components/HomeScreen'
import { CategoryBrowser } from './components/CategoryBrowser'
import { ExperienceDetail } from './components/ExperienceDetail'
import { TripBuilder } from './components/TripBuilder'
import { CheckoutFlow } from './components/checkout/CheckoutFlow'
import { TripsDashboard } from './components/TripsDashboard'
import { User, Trip, Experience, UserPreferences, TripItem, Booking } from './lib/types'
import { getExperienceById, calculateTripTotal, generateDemoBookings } from './lib/helpers'
import { toast } from 'sonner'
import { Toaster } from './components/ui/sonner'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Compass, PlusCircle, Heart, UserCircle, ArrowLeft, Calendar, Package } from 'lucide-react'

type Screen =
  | { type: 'onboarding' }
  | { type: 'home' }
  | { type: 'category'; categoryId: string }
  | { type: 'experience'; experienceId: string }
  | { type: 'trip' }
  | { type: 'checkout' }
  | { type: 'explore' }
  | { type: 'saved' }
  | { type: 'profile' }
  | { type: 'trips' }
  | { type: 'tripDetail'; tripId: string }

const defaultUser: User = {
  id: 'user_demo',
  preferences: {},
  saved: [],
  currency: 'USD',
  language: 'en',
  hasCompletedOnboarding: false,
}

const defaultTrip: Trip = {
  id: 'trip_1',
  userId: 'user_demo',
  destination: 'dest_bali',
  travelers: 2,
  status: 'planning',
  items: [],
  subtotal: 0,
  serviceFee: 0,
  total: 0,
}

function App() {
  const [user, setUser] = useKV<User>('pulau_user', defaultUser)
  const [trip, setTrip] = useKV<Trip>('pulau_current_trip', defaultTrip)
  const [bookings, setBookings] = useKV<Booking[]>('pulau_bookings', [])
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'onboarding' })

  const safeUser = user || defaultUser
  const safeTrip = trip || defaultTrip

  useEffect(() => {
    if (safeUser.hasCompletedOnboarding) {
      setCurrentScreen({ type: 'home' })
    }
  }, [safeUser.hasCompletedOnboarding])

  const handleOnboardingComplete = (preferences: UserPreferences, dates?: { start: string; end: string }) => {
    setUser((current) => {
      const base = current || defaultUser
      return {
        ...base,
        preferences,
        hasCompletedOnboarding: true,
      }
    })

    if (dates) {
      setTrip((current) => {
        const base = current || defaultTrip
        return {
          ...base,
          startDate: dates.start,
          endDate: dates.end,
        }
      })
    }

    setCurrentScreen({ type: 'home' })
    toast.success('Welcome to Pulau! 🏝️')
  }

  const handleQuickAdd = (experience: Experience) => {
    const newItem: TripItem = {
      experienceId: experience.id,
      guests: 2,
      totalPrice: experience.price.amount * 2,
    }

    setTrip((current) => {
      const base = current || defaultTrip
      const updatedItems = [...base.items, newItem]
      const totals = calculateTripTotal(updatedItems)
      return {
        ...base,
        items: updatedItems,
        ...totals,
      }
    })

    toast.success(`Added ${experience.title} to your trip!`)
  }

  const handleAddToTrip = (experienceId: string, guests: number, totalPrice: number) => {
    const newItem: TripItem = {
      experienceId,
      guests,
      totalPrice,
    }

    setTrip((current) => {
      const base = current || defaultTrip
      const updatedItems = [...base.items, newItem]
      const totals = calculateTripTotal(updatedItems)
      return {
        ...base,
        items: updatedItems,
        ...totals,
      }
    })

    const experience = getExperienceById(experienceId)
    toast.success(`Added ${experience?.title} to your trip!`)
    setCurrentScreen({ type: 'trip' })
  }

  const handleRemoveItem = (index: number) => {
    setTrip((current) => {
      const base = current || defaultTrip
      const updatedItems = base.items.filter((_, i) => i !== index)
      const totals = calculateTripTotal(updatedItems)
      return {
        ...base,
        items: updatedItems,
        ...totals,
      }
    })
    toast.success('Removed from trip')
  }

  const handleToggleSave = (experienceId: string) => {
    setUser((current) => {
      const base = current || defaultUser
      const isSaved = base.saved.includes(experienceId)
      const updatedSaved = isSaved
        ? base.saved.filter((id) => id !== experienceId)
        : [...base.saved, experienceId]
      
      toast.success(isSaved ? 'Removed from saved' : 'Saved for later ❤️')
      
      return {
        ...base,
        saved: updatedSaved,
      }
    })
  }

  const handleTabChange = (tab: 'home' | 'explore' | 'saved' | 'profile') => {
    if (tab === 'home') setCurrentScreen({ type: 'home' })
    if (tab === 'explore') setCurrentScreen({ type: 'explore' })
    if (tab === 'saved') setCurrentScreen({ type: 'saved' })
    if (tab === 'profile') setCurrentScreen({ type: 'profile' })
  }

  const handleCheckout = () => {
    setCurrentScreen({ type: 'checkout' })
  }

  const handleCheckoutComplete = (bookingRef: string) => {
    const completedTrip = {
      ...safeTrip,
      status: 'booked' as const,
      bookingReference: bookingRef,
      bookedAt: new Date().toISOString(),
    }

    const newBooking: Booking = {
      id: `booking_${Date.now()}`,
      tripId: completedTrip.id,
      reference: bookingRef,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      trip: completedTrip,
    }

    setBookings((current) => [...(current || []), newBooking])

    setTrip({
      ...defaultTrip,
      id: `trip_${Date.now()}`,
    })
  }

  const handleViewTripFromDashboard = (tripData: Trip) => {
    setCurrentScreen({ type: 'tripDetail', tripId: tripData.id })
  }

  const handleBookAgain = (tripData: Trip) => {
    const newTrip = {
      ...tripData,
      id: `trip_${Date.now()}`,
      status: 'planning' as const,
      bookingReference: undefined,
      bookedAt: undefined,
    }
    
    setTrip(newTrip)
    setCurrentScreen({ type: 'trip' })
    toast.success('Trip copied! Review and book when ready.')
  }

  const renderScreen = () => {
    if (currentScreen.type === 'onboarding') {
      return <Onboarding onComplete={handleOnboardingComplete} />
    }

    if (currentScreen.type === 'home') {
      return (
        <HomeScreen
          trip={safeTrip}
          onCategorySelect={(categoryId) => setCurrentScreen({ type: 'category', categoryId })}
          onViewTrip={() => setCurrentScreen({ type: 'trip' })}
        />
      )
    }

    if (currentScreen.type === 'category') {
      return (
        <CategoryBrowser
          categoryId={currentScreen.categoryId}
          userPreferences={safeUser.preferences}
          savedExperiences={safeUser.saved}
          onBack={() => setCurrentScreen({ type: 'home' })}
          onExperienceSelect={(experienceId) => setCurrentScreen({ type: 'experience', experienceId })}
          onQuickAdd={handleQuickAdd}
          onToggleSave={handleToggleSave}
        />
      )
    }

    if (currentScreen.type === 'experience') {
      const experience = getExperienceById(currentScreen.experienceId)
      if (!experience) return <div>Experience not found</div>

      return (
        <ExperienceDetail
          experience={experience}
          isSaved={safeUser.saved.includes(experience.id)}
          onBack={() => setCurrentScreen({ type: 'home' })}
          onToggleSave={() => handleToggleSave(experience.id)}
          onAddToTrip={(guests, totalPrice) => handleAddToTrip(experience.id, guests, totalPrice)}
        />
      )
    }

    if (currentScreen.type === 'trip') {
      return (
        <TripBuilder
          trip={safeTrip}
          onBack={() => setCurrentScreen({ type: 'home' })}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
        />
      )
    }

    if (currentScreen.type === 'checkout') {
      return (
        <CheckoutFlow
          trip={safeTrip}
          onBack={() => setCurrentScreen({ type: 'trip' })}
          onComplete={handleCheckoutComplete}
        />
      )
    }

    if (currentScreen.type === 'explore') {
      return (
        <div className="min-h-screen bg-background p-6 pb-24">
          <h1 className="font-display text-3xl font-bold mb-6">Explore</h1>
          <p className="text-muted-foreground">Discovery features coming soon...</p>
        </div>
      )
    }

    if (currentScreen.type === 'saved') {
      return (
        <div className="min-h-screen bg-background p-6 pb-24">
          <h1 className="font-display text-3xl font-bold mb-6">Saved Experiences</h1>
          {safeUser.saved.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-6xl mb-4">❤️</div>
              <h2 className="font-display text-xl font-semibold">Save experiences you love</h2>
              <p className="text-muted-foreground">Tap the heart icon on any experience to save it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeUser.saved.map((expId) => {
                const exp = getExperienceById(expId)
                return exp ? (
                  <div key={expId} className="p-4 bg-card rounded-lg border">
                    <h3 className="font-display font-semibold">{exp.title}</h3>
                    <p className="text-sm text-muted-foreground">{exp.provider.name}</p>
                  </div>
                ) : null
              })}
            </div>
          )}
        </div>
      )
    }

    if (currentScreen.type === 'profile') {
      const demoBookingsCount = (bookings || []).length

      return (
        <div className="min-h-screen bg-background p-6 pb-24">
          <h1 className="font-display text-3xl font-bold mb-6">Profile</h1>
          <div className="space-y-4">
            <Card 
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setCurrentScreen({ type: 'trips' })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">My Trips</h3>
                    <p className="text-sm text-muted-foreground">
                      View bookings and travel history
                    </p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 rotate-180 text-muted-foreground" />
              </div>
            </Card>

            {demoBookingsCount === 0 && (
              <Card className="p-4 bg-accent/5 border-accent/20">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold mb-1">Try the Demo</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Load sample bookings to explore the trips dashboard and see how booking history works.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const demoData = generateDemoBookings()
                          setBookings(demoData)
                          toast.success('Demo bookings loaded! Check My Trips.')
                        }}
                      >
                        Load Demo Bookings
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
            
            <p className="text-muted-foreground mt-8">More profile features coming soon...</p>
          </div>
        </div>
      )
    }

    if (currentScreen.type === 'trips') {
      return (
        <TripsDashboard
          onBack={() => setCurrentScreen({ type: 'profile' })}
          onViewTrip={handleViewTripFromDashboard}
          onBookAgain={handleBookAgain}
        />
      )
    }

    if (currentScreen.type === 'tripDetail') {
      const booking = (bookings || []).find(b => b.trip.id === currentScreen.tripId)
      if (!booking) {
        return (
          <div className="min-h-screen bg-background p-6 pb-24">
            <Button variant="ghost" onClick={() => setCurrentScreen({ type: 'trips' })}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <p className="text-center mt-8 text-muted-foreground">Trip not found</p>
          </div>
        )
      }
      
      return (
        <TripBuilder
          trip={booking.trip}
          onBack={() => setCurrentScreen({ type: 'trips' })}
          onRemoveItem={() => {}}
          onCheckout={() => {}}
          readOnly
        />
      )
    }

    return null
  }

  const showBottomNav = currentScreen.type !== 'onboarding' && currentScreen.type !== 'checkout' && currentScreen.type !== 'trips' && currentScreen.type !== 'tripDetail'

  return (
    <div className="relative font-body">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen.type}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t shadow-lg z-50">
          <div className="flex items-center justify-around h-16 max-w-screen-lg mx-auto">
            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-all hover:scale-110 active:scale-95 ${
                currentScreen.type === 'home' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleTabChange('home')}
            >
              <Home className={`w-6 h-6 ${currentScreen.type === 'home' ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">Trip</span>
            </button>
            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-all hover:scale-110 active:scale-95 ${
                currentScreen.type === 'explore' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleTabChange('explore')}
            >
              <Compass className={`w-6 h-6 ${currentScreen.type === 'explore' ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">Explore</span>
            </button>
            <button
              className="flex flex-col items-center gap-1 px-4 py-2 transition-all hover:scale-110 active:scale-95"
              onClick={() => setCurrentScreen({ type: 'home' })}
            >
              <div className="w-14 h-14 -mt-7 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow">
                <PlusCircle className="w-8 h-8" />
              </div>
            </button>
            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-all hover:scale-110 active:scale-95 ${
                currentScreen.type === 'saved' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleTabChange('saved')}
            >
              <Heart className={`w-6 h-6 ${currentScreen.type === 'saved' ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">Saved</span>
            </button>
            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-all hover:scale-110 active:scale-95 ${
                currentScreen.type === 'profile' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleTabChange('profile')}
            >
              <UserCircle className={`w-6 h-6 ${currentScreen.type === 'profile' ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  )
}

export default App