import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Onboarding } from './components/Onboarding'
import { HomeScreen } from './components/HomeScreen'
import { CategoryBrowser } from './components/CategoryBrowser'
import { ExperienceDetail } from './components/ExperienceDetail'
import { TripBuilder } from './components/TripBuilder'
import { CheckoutFlow } from './components/checkout/CheckoutFlow'
import { TripsDashboard } from './components/TripsDashboard'
import { SavedScreen } from './components/SavedScreen'
import { ExploreScreen } from './components/ExploreScreen'
import { ProfileScreen } from './components/ProfileScreen'
import { CustomerLogin } from './components/auth/CustomerLogin'
import { CustomerRegister } from './components/auth/CustomerRegister'
import { PasswordReset } from './components/auth/PasswordReset'
import { VendorLogin } from './components/vendor/VendorLogin'
import { VendorRegister } from './components/vendor/VendorRegister'
import { VendorDashboard } from './components/vendor/VendorDashboard'
import { VendorExperiences } from './components/vendor/VendorExperiences'
import { VendorBookings } from './components/vendor/VendorBookings'
import { User, Trip, Experience, UserPreferences, TripItem, Booking, VendorSession } from './lib/types'
import { getExperienceById, calculateTripTotal, generateDemoBookings } from './lib/helpers'
import { toast } from 'sonner'
import { Toaster } from './components/ui/sonner'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Compass, PlusCircle, Heart, UserCircle, ArrowLeft, Package } from 'lucide-react'

type Screen =
  | { type: 'customerLogin' }
  | { type: 'customerRegister' }
  | { type: 'passwordReset' }
  | { type: 'destinationSelector' }
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
  | { type: 'vendorLogin' }
  | { type: 'vendorRegister' }
  | { type: 'vendorDashboard' }
  | { type: 'vendorExperiences' }
  | { type: 'vendorBookings' }

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
  const [vendorSession, setVendorSession] = useKV<VendorSession | null>('pulau_vendor_session', null)
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'customerLogin' })

  const safeUser = user || defaultUser
  const safeTrip = trip || defaultTrip

  useEffect(() => {
    // Check for vendor session first
    if (vendorSession) {
      setCurrentScreen({ type: 'vendorDashboard' })
    } else if (safeUser.hasCompletedOnboarding && safeUser.id !== 'user_demo') {
      // User is authenticated and has completed onboarding
      setCurrentScreen({ type: 'home' })
    } else if (safeUser.id !== 'user_demo' && !safeUser.hasCompletedOnboarding) {
      // User is authenticated but hasn't completed onboarding
      setCurrentScreen({ type: 'onboarding' })
    }
  }, [safeUser.hasCompletedOnboarding, safeUser.id, vendorSession])

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
    // AC #2, #3, #4, #5: Create new trip with copied items
    const newTrip: Trip = {
      ...tripData,
      id: `trip_${Date.now()}`, // New unique ID
      status: 'planning', // AC #4: Reset status to planning
      startDate: undefined, // AC #4: Clear dates
      endDate: undefined, // AC #4: Clear dates
      bookingReference: undefined,
      bookedAt: undefined,
      cancelledAt: undefined,
      cancellationReason: undefined,
      // AC #5: Copy items but clear scheduled dates
      items: tripData.items.map(item => ({
        ...item,
        date: undefined, // AC #5: Clear scheduled dates
        time: undefined,
      })),
    }
    
    setTrip(newTrip)
    setCurrentScreen({ type: 'trip' })
    // AC #7: User feedback with actionable message
    toast.success('Trip copied! Set your new dates.')
  }

  const handleVendorLogin = (session: VendorSession) => {
    setVendorSession(session)
    setCurrentScreen({ type: 'vendorDashboard' })
  }

  const handleCustomerLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser)
    if (authenticatedUser.hasCompletedOnboarding) {
      setCurrentScreen({ type: 'home' })
    } else {
      setCurrentScreen({ type: 'onboarding' })
    }
  }

  const handleCustomerRegister = (newUser: User) => {
    setUser(newUser)
    setCurrentScreen({ type: 'onboarding' })
  }

  const handleCustomerLogout = () => {
    setUser(defaultUser)
    setTrip(defaultTrip)
    setCurrentScreen({ type: 'customerLogin' })
    toast.success('Logged out successfully')
  }

  const renderScreen = () => {
    if (currentScreen.type === 'customerLogin') {
      return (
        <CustomerLogin
          onLoginSuccess={handleCustomerLogin}
          onNavigateToRegister={() => setCurrentScreen({ type: 'customerRegister' })}
          onNavigateToPasswordReset={() => setCurrentScreen({ type: 'passwordReset' })}
          onNavigateToVendor={() => setCurrentScreen({ type: 'vendorLogin' })}
        />
      )
    }

    if (currentScreen.type === 'customerRegister') {
      return (
        <CustomerRegister
          onNavigateToLogin={() => setCurrentScreen({ type: 'customerLogin' })}
          onRegisterSuccess={handleCustomerRegister}
        />
      )
    }

    if (currentScreen.type === 'passwordReset') {
      return (
        <PasswordReset
          onBack={() => setCurrentScreen({ type: 'customerLogin' })}
        />
      )
    }

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
        <ExploreScreen
          onViewExperience={(id) => setCurrentScreen({ type: 'experience', experienceId: id })}
        />
      )
    }

    if (currentScreen.type === 'saved') {
      const savedExperiences = safeUser.saved
        .map(id => getExperienceById(id))
        .filter((exp): exp is Experience => exp !== undefined)

      return (
        <SavedScreen
          savedExperiences={savedExperiences}
          onToggleSave={handleToggleSave}
          onAddToTrip={(experience) => handleQuickAdd(experience)}
          onViewExperience={(id) => setCurrentScreen({ type: 'experience', experienceId: id })}
          onNavigateHome={() => setCurrentScreen({ type: 'home' })}
          tripItemIds={safeTrip.items.map(item => item.experienceId)}
        />
      )
    }

    if (currentScreen.type === 'profile') {
      const demoBookingsCount = (bookings || []).length

      return (
        <>
          <ProfileScreen
            user={safeUser}
            onNavigateToTrips={() => setCurrentScreen({ type: 'trips' })}
            onNavigateToSaved={() => setCurrentScreen({ type: 'saved' })}
            onNavigateToVendor={() => setCurrentScreen({ type: 'vendorLogin' })}
            onLogout={handleCustomerLogout}
          />
          {demoBookingsCount === 0 && (
            <div className="fixed bottom-24 left-0 right-0 p-4 z-40">
              <Card className="max-w-md mx-auto p-4 bg-accent/10 border-accent/30 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Try the Demo</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Load sample bookings to explore trips
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
                      Load Demo
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
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

    if (currentScreen.type === 'vendorLogin') {
      return (
        <VendorLogin
          onLogin={handleVendorLogin}
          onNavigateToRegister={() => setCurrentScreen({ type: 'vendorRegister' })}
        />
      )
    }

    if (currentScreen.type === 'vendorRegister') {
      return (
        <VendorRegister
          onNavigateToLogin={() => setCurrentScreen({ type: 'vendorLogin' })}
        />
      )
    }

    if (currentScreen.type === 'vendorDashboard') {
      if (!vendorSession) {
        setCurrentScreen({ type: 'vendorLogin' })
        return null
      }
      return (
        <VendorDashboard
          session={vendorSession}
          onNavigateToExperiences={() => setCurrentScreen({ type: 'vendorExperiences' })}
          onNavigateToBookings={() => setCurrentScreen({ type: 'vendorBookings' })}
        />
      )
    }

    if (currentScreen.type === 'vendorExperiences') {
      if (!vendorSession) {
        setCurrentScreen({ type: 'vendorLogin' })
        return null
      }
      return (
        <VendorExperiences
          session={vendorSession}
          onBack={() => setCurrentScreen({ type: 'vendorDashboard' })}
        />
      )
    }

    if (currentScreen.type === 'vendorBookings') {
      if (!vendorSession) {
        setCurrentScreen({ type: 'vendorLogin' })
        return null
      }
      return (
        <VendorBookings
          session={vendorSession}
          onBack={() => setCurrentScreen({ type: 'vendorDashboard' })}
        />
      )
    }

    return null
  }

  const showBottomNav = currentScreen.type !== 'onboarding' 
    && currentScreen.type !== 'checkout' 
    && currentScreen.type !== 'trips' 
    && currentScreen.type !== 'tripDetail'
    && currentScreen.type !== 'vendorLogin'
    && currentScreen.type !== 'vendorRegister'
    && currentScreen.type !== 'vendorDashboard'
    && currentScreen.type !== 'vendorExperiences'
    && currentScreen.type !== 'vendorBookings'

  return (
    <div className="relative font-body">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen.type}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <main id="main-content" role="main">
            {renderScreen()}
          </main>
        </motion.div>
      </AnimatePresence>

      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t shadow-lg z-50" aria-label="Main navigation">
          <div className="flex items-center justify-around h-16 max-w-screen-lg mx-auto">
            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                currentScreen.type === 'home' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleTabChange('home')}
              aria-label="Trip planner"
              aria-current={currentScreen.type === 'home' ? 'page' : undefined}
            >
              <Home className={`w-6 h-6 ${currentScreen.type === 'home' ? 'fill-current' : ''}`} aria-hidden="true" />
              <span className="text-xs font-medium">Trip</span>
            </button>
            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                currentScreen.type === 'explore' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleTabChange('explore')}
              aria-label="Explore experiences"
              aria-current={currentScreen.type === 'explore' ? 'page' : undefined}
            >
              <Compass className={`w-6 h-6 ${currentScreen.type === 'explore' ? 'fill-current' : ''}`} aria-hidden="true" />
              <span className="text-xs font-medium">Explore</span>
            </button>
            <button
              className="flex flex-col items-center gap-1 px-4 py-2 transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() => setCurrentScreen({ type: 'home' })}
              aria-label="Quick add experiences"
            >
              <div className="w-14 h-14 -mt-7 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow">
                <PlusCircle className="w-8 h-8" aria-hidden="true" />
              </div>
            </button>
            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                currentScreen.type === 'saved' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleTabChange('saved')}
              aria-label="Saved experiences"
              aria-current={currentScreen.type === 'saved' ? 'page' : undefined}
            >
              <Heart className={`w-6 h-6 ${currentScreen.type === 'saved' ? 'fill-current' : ''}`} aria-hidden="true" />
              <span className="text-xs font-medium">Saved</span>
            </button>
            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                currentScreen.type === 'profile' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleTabChange('profile')}
              aria-label="Profile and settings"
              aria-current={currentScreen.type === 'profile' ? 'page' : undefined}
            >
              <UserCircle className={`w-6 h-6 ${currentScreen.type === 'profile' ? 'fill-current' : ''}`} aria-hidden="true" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </nav>
      )}

      <Toaster />
    </div>
  )
}

export default App