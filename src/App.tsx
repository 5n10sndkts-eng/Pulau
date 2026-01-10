import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Onboarding } from './components/Onboarding'
import { HomeScreen } from './components/HomeScreen'
import { CategoryBrowser } from './components/CategoryBrowser'
import { ExperienceDetail } from './components/ExperienceDetail'
import { TripBuilder } from './components/TripBuilder'
import { CheckoutFlow } from './components/checkout/CheckoutFlow'
import { CheckoutSuccess } from './components/checkout/CheckoutSuccess'
import { CheckoutCancel } from './components/checkout/CheckoutCancel'
import { TripsDashboard } from './components/TripsDashboard'
import { SavedScreen } from './components/SavedScreen'
import { ExploreScreen } from './components/ExploreScreen'
import { ProfileScreen } from './components/ProfileScreen'

// New Auth Screens
import { LoginScreen } from './components/auth/LoginScreen'
import { RegisterScreen } from './components/auth/RegisterScreen'
import { PasswordReset } from './components/auth/PasswordReset'

// Vendor imports
import { VendorLogin } from './components/vendor/VendorLogin'
import { VendorRegister } from './components/vendor/VendorRegister'
import { VendorDashboard } from './components/vendor/VendorDashboard'

import { NavigationShellWithRouter } from './components/layout/NavigationShellWithRouter'
import { MetaManager } from './components/common/MetaManager'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Toaster } from './components/ui/sonner'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import { User, Trip, Experience, UserPreferences, TripItem, Booking, VendorSession } from './lib/types'
import { getExperienceById, calculateTripTotal, generateTripFromPreferences } from './lib/helpers'
import { tripService } from './lib/tripService'
import { bookingService } from './lib/bookingService'

const defaultPreferences: UserPreferences = {
  travelStyles: ['adventure'],
  groupType: 'solo',
  budget: 'midrange',
}

// We rely on authUser for id/email, but keep a default structure for types
const defaultUser: User = {
  id: '',
  email: '',
  name: 'Guest',
  preferences: defaultPreferences,
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

// Wrapper to inject params into ExperienceDetail
function ExperienceDetailRoute({
  user,
  onToggleSave,
  onAddToTrip
}: {
  user: User,
  onToggleSave: (id: string) => void,
  onAddToTrip: (id: string, guests: number, price: number) => void
}) {
  const { id } = useParams()
  const navigate = useNavigate()
  const experience = id ? getExperienceById(id) : undefined

  if (!experience) {
    return <div className="p-8 text-center text-muted-foreground">Experience not found</div>
  }

  return (
    <ExperienceDetail
      experience={experience}
      isSaved={user.saved?.includes(experience.id) ?? false}
      onBack={() => navigate(-1)}
      onToggleSave={() => onToggleSave(experience.id)}
      onAddToTrip={(guests, totalPrice) => onAddToTrip(experience.id, guests, totalPrice)}
    />
  )
}

function CategoryBrowserRoute({ user, onQuickAdd, onToggleSave }: any) {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <CategoryBrowser
      categoryId={id || ''}
      userPreferences={user.preferences}
      savedExperiences={user.saved}
      onBack={() => navigate('/')}
      onExperienceSelect={(expId) => navigate(`/experience/${expId}`)}
      onQuickAdd={onQuickAdd}
      onToggleSave={onToggleSave}
    />
  )
}

function AppContent() {
  const { user: authUser, updateUser, logout } = useAuth()

  // Local state for non-persisted user data (like trip, bookings)
  // In a real app, these would also come from the backend

  // Replace useKV with standard state that we sync
  const [trip, setTrip] = useState<Trip>(defaultTrip)
  // const [bookings, setBookings] = useKV<Booking[]>('pulau_bookings', []) // Keep bookings local mostly for now or separate task
  const [bookings, setBookings] = useState<Booking[]>([])

  const [vendorSession, setVendorSession] = useKV<VendorSession | null>('pulau_vendor_session', null)

  const navigate = useNavigate()

  // Use authUser if available, otherwise fallback to defaultUser
  const safeUser = authUser || defaultUser
  const safeTrip = trip || defaultTrip

  // Load active trip and bookings when user logs in
  useEffect(() => {
    if (authUser) {
      const loadData = async () => {
        try {
          // Load active trip
          const activeTrip = await tripService.getActiveTrip(authUser.id)
          if (activeTrip) {
            setTrip(activeTrip)
            console.log('Trip loaded:', activeTrip.id)
          } else {
            // No active trip, ensure default has user ID if needed
            setTrip(prev => ({ ...prev, userId: authUser.id }))
          }

          // Load bookings
          const userBookings = await bookingService.getUserBookings(authUser.id)
          setBookings(userBookings)
          console.log('Bookings loaded:', userBookings.length)
        } catch (e) {
          console.error('Failed to load user data', e)
        }
      }
      loadData()
    } else {
      // Reset to default if logged out
      setTrip(defaultTrip)
      setBookings([])
    }
  }, [authUser])

  // Save Helper - debounced or direct? Direct for simplicity first.
  const updateAndSaveTrip = async (newTripData: Trip) => {
    setTrip(newTripData)
    if (authUser) {
      try {
        const saved = await tripService.saveTrip({ ...newTripData, userId: authUser.id })
        // If ID changed (e.g. new UUID), update local state
        if (saved.id !== newTripData.id) {
          setTrip(saved)
        }
      } catch (e) {
        console.error('Failed to save trip', e)
        toast.error('Failed to save changes')
      }
    }
  }

  // Redirect logic
  useEffect(() => {
    // If user is logged in but hasn't onboarded
    if (authUser && !authUser.hasCompletedOnboarding) {
      // navigate('/onboarding') 
    }
  }, [authUser])

  const handleOnboardingComplete = (preferences: UserPreferences, dates?: { start: string; end: string }) => {
    const updatedUser = { ...safeUser, preferences, hasCompletedOnboarding: true }
    updateUser(updatedUser)

    if (dates) {
      const generatedTrip = generateTripFromPreferences(preferences, dates)
      const newTrip = { ...generatedTrip, userId: safeUser.id }
      updateAndSaveTrip(newTrip)
      navigate('/plan')
      toast.success('We built your dream trip! 🌴')
    } else {
      navigate('/')
      toast.success('Welcome to Pulau! 🏝️')
    }
  }

  const handleQuickAdd = (experience: Experience) => {
    const newItem: TripItem = {
      experienceId: experience.id,
      guests: 2,
      totalPrice: experience.price.amount * 2,
    }
    const updatedTrip = (current: Trip) => {
      const base = current || defaultTrip
      const updatedItems = [...base.items, newItem]
      return { ...base, items: updatedItems, ...calculateTripTotal(updatedItems) }
    }
    // We need current trip to update. State update function pattern tricky with async save.
    // Better to just use current 'trip' state directly since we are inside component
    const updated = updatedTrip(trip)
    updateAndSaveTrip(updated)
    toast.success(`Added ${experience.title} to your trip!`)
  }

  const handleAddToTrip = (experienceId: string, guests: number, totalPrice: number) => {
    const newItem: TripItem = { experienceId, guests, totalPrice }
    const updatedItems = [...trip.items, newItem]
    const updated = { ...trip, items: updatedItems, ...calculateTripTotal(updatedItems) }
    updateAndSaveTrip(updated)

    const experience = getExperienceById(experienceId)
    toast.success(`Added ${experience?.title} to your trip!`)
    navigate('/plan')
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = trip.items.filter((_, i) => i !== index)
    const updated = { ...trip, items: updatedItems, ...calculateTripTotal(updatedItems) }
    updateAndSaveTrip(updated)
    toast.success('Removed from trip')
  }

  const handleToggleSave = (experienceId: string) => {
    if (!authUser) {
      toast.error('Please login to save experiences');
      navigate('/login');
      return;
    }

    const isSaved = safeUser.saved?.includes(experienceId) ?? false
    const updatedSaved = isSaved
      ? safeUser.saved?.filter((id) => id !== experienceId)
      : [...(safeUser.saved || []), experienceId]
    toast.success(isSaved ? 'Removed from saved' : 'Saved for later ❤️')
    updateUser({ ...safeUser, saved: updatedSaved })
  }

  const handleCheckoutComplete = async (bookingRef: string) => {
    const newBooking: Booking = {
      id: crypto.randomUUID(),
      tripId: safeTrip.id,
      reference: bookingRef,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      trip: { ...safeTrip, status: 'booked', bookingReference: bookingRef, bookedAt: new Date().toISOString() },
    }

    // Save to DB
    if (authUser) {
      try {
        const savedBooking = await bookingService.createBooking(newBooking)
        if (savedBooking) {
          setBookings((current) => [...(current || []), savedBooking])
        }
      } catch (e) {
        console.error('Failed to save booking', e)
        toast.error('Failed to save booking')
        // Optimistic update anyway?
        setBookings((current) => [...(current || []), newBooking])
      }
    } else {
      setBookings((current) => [...(current || []), newBooking])
    }

    // Clear current trip (create new fresh one)
    updateAndSaveTrip({ ...defaultTrip, id: `trip_${Date.now()}` })
    navigate('/trips')
  }

  return (
    <>
      <MetaManager />
      <Toaster />

      <NavigationShellWithRouter>
        <Routes>
          {/* Main Tabs */}
          <Route index element={
            <HomeScreen
              trip={safeTrip}
              userPreferences={safeUser.preferences || defaultPreferences}
              onCategorySelect={(id) => navigate(`/category/${id}`)}
              onViewTrip={() => navigate('/plan')}
              onExperienceSelect={(id) => navigate(`/experience/${id}`)}
              onQuickAdd={handleQuickAdd}
              onPreferenceChange={(p) => updateUser({ ...safeUser, preferences: p })}
            />
          } />

          <Route path="/explore" element={<ExploreScreen
            onViewExperience={(id) => navigate(`/experience/${id}`)}
            onQuickAdd={handleQuickAdd}
          />}
          />
          <Route path="/saved" element={
            <ProtectedRoute>
              <SavedScreen
                savedIds={safeUser.saved}
                onToggleSave={handleToggleSave}
                onAddToTrip={handleQuickAdd}
                onViewExperience={(id) => navigate(`/experience/${id}`)}
                onNavigateHome={() => navigate('/')}
                tripItemIds={safeTrip.items.map(i => i.experienceId)}
              />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileScreen
                user={safeUser}
                onNavigateToTrips={() => navigate('/trips')}
                onNavigateToSaved={() => navigate('/saved')}
                onNavigateToVendor={() => navigate('/vendor/dashboard')}
                onNavigateToSettings={() => { }}
                onLogout={() => { logout(); navigate('/login') }}
                onBack={() => navigate('/')}
              />
            </ProtectedRoute>
          } />

          {/* Feature Routes */}
          <Route path="/category/:id" element={
            <CategoryBrowserRoute
              user={safeUser}
              onQuickAdd={handleQuickAdd}
              onToggleSave={handleToggleSave}
            />
          } />

          <Route path="/experience/:id" element={
            <ExperienceDetailRoute
              user={safeUser}
              onToggleSave={handleToggleSave}
              onAddToTrip={handleAddToTrip}
            />
          } />

          <Route path="/plan" element={
            <ProtectedRoute>
              <TripBuilder
                trip={safeTrip}
                onBack={() => navigate('/')}
                onRemoveItem={handleRemoveItem}
                onCheckout={() => navigate('/checkout')}
                onUpdateTrip={(updated) => updateAndSaveTrip(updated)}
              />
            </ProtectedRoute>
          } />

          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutFlow
                trip={safeTrip}
                onBack={() => navigate('/plan')}
                onComplete={handleCheckoutComplete}
              />
            </ProtectedRoute>
          } />

          <Route path="/checkout/success" element={
            <ProtectedRoute>
              <CheckoutSuccess
                onNavigateHome={() => navigate('/')}
                onNavigateToTrips={() => navigate('/trips')}
              />
            </ProtectedRoute>
          } />

          <Route path="/checkout/cancel" element={
            <ProtectedRoute>
              <CheckoutCancel
                onRetryCheckout={() => navigate('/checkout')}
                onReturnToTrip={() => navigate('/plan')}
                onNavigateHome={() => navigate('/')}
              />
            </ProtectedRoute>
          } />

          <Route path="/trips" element={
            <ProtectedRoute>
              <TripsDashboard
                bookings={bookings || []}
                onUpdateBookings={(b) => setBookings(b)}
                onBack={() => navigate('/profile')}
                onViewTrip={(t) => { /* Placeholder */ }}
                onBookAgain={(t) => {
                  const clonedItems = t.items.map(item => ({ ...item }))
                  const newTrip = {
                    ...defaultTrip,
                    id: `trip_${Date.now()}`,
                    userId: safeUser.id,
                    travelers: t.travelers,
                    items: clonedItems,
                    ...calculateTripTotal(clonedItems)
                  }
                  updateAndSaveTrip(newTrip)
                  navigate('/plan')
                  toast.success('Trip cloned!')
                }}
              />
            </ProtectedRoute>
          } />

          <Route path="/onboarding" element={<Onboarding onComplete={handleOnboardingComplete} />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/forgot-password" element={<PasswordReset onBack={() => navigate('/login')} />} />

          {/* Vendor Routes - Simplified for now */}
          <Route path="/vendor/login" element={
            <VendorLogin
              onLogin={(s) => { setVendorSession(s); navigate('/vendor/dashboard') }}
              onNavigateToRegister={() => navigate('/vendor/register')}
            />
          } />
          <Route path="/vendor/register" element={
            <VendorRegister
              onNavigateToLogin={() => navigate('/vendor/login')}
            />
          } />
          <Route path="/vendor/dashboard" element={
            <VendorDashboard
              session={vendorSession!}
              onNavigateToExperiences={() => { }}
              onNavigateToBookings={() => { }}
              onLogout={() => { setVendorSession(null); navigate('/vendor/login') }}
            />
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NavigationShellWithRouter>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
