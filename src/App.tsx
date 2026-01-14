import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useParams,
} from 'react-router-dom';
import { toast } from 'sonner';

import { OnboardingSingleScreen } from './screens/customer/OnboardingSingleScreen';
import { ONBOARDING_DEFAULTS } from './lib/constants/onboarding';
import { OnboardingFlow } from './screens/onboarding/OnboardingFlow';
import { HomeScreen } from './screens/customer/HomeScreen';
import { CategoryBrowser } from './components/features/discovery/CategoryBrowser';
import { ExperienceDetail } from './components/features/discovery/ExperienceDetail';
import { CheckoutSuccess } from './components/checkout/CheckoutSuccess';
import { CheckoutCancel } from './components/checkout/CheckoutCancel';
import { SavedScreen } from './screens/customer/SavedScreen';
import { ExploreScreen } from './screens/customer/ExploreScreen';
import { ProfileScreen } from './screens/customer/ProfileScreen';

// New Auth Screens
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import { PasswordReset } from './components/auth/PasswordReset';

// Lazy-loaded components for code-splitting (Performance Optimization)
// Vendor portal - rarely accessed by most users
const VendorLogin = lazy(() => import('./components/vendor/VendorLogin').then(m => ({ default: m.VendorLogin })));
const VendorRegister = lazy(() => import('./components/vendor/VendorRegister').then(m => ({ default: m.VendorRegister })));
const VendorDashboard = lazy(() => import('./components/vendor/VendorDashboard').then(m => ({ default: m.VendorDashboard })));
const VendorRevenueDashboard = lazy(() => import('./components/vendor/VendorRevenueDashboard').then(m => ({ default: m.VendorRevenueDashboard })));

// Heavy checkout flow - only needed when purchasing
const CheckoutFlow = lazy(() => import('./components/checkout/CheckoutFlow').then(m => ({ default: m.CheckoutFlow })));
const TripBuilder = lazy(() => import('./components/features/trip/TripBuilder').then(m => ({ default: m.TripBuilder })));
const TripsDashboard = lazy(() => import('./screens/customer/TripsDashboard').then(m => ({ default: m.TripsDashboard })));
const TicketPageRoute = lazy(() => import('./components/booking/TicketPageRoute').then(m => ({ default: m.TicketPageRoute })));

import { NavigationShellWithRouter } from './components/layout/NavigationShellWithRouter';
import { MetaManager } from './components/common/MetaManager';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { VendorProtectedRoute } from './components/auth/VendorProtectedRoute';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TripProvider, useTrip } from './contexts/TripContext';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { useNetworkSync } from './hooks/useNetworkSync';
import { StickyTripBar } from './components/features/trip/StickyTripBar';

// Loading fallback for lazy components
function LazyLoadFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

import {
  User,
  Trip,
  Experience,
  UserPreferences,
  Booking,
  VendorSession,
} from './lib/types';
import { getExperienceById, calculateTripTotal } from './lib/helpers';
import { bookingService } from './lib/bookingService';

const defaultPreferences: UserPreferences = {
  travelStyles: ['adventure'],
  groupType: 'solo',
  budget: 'midrange',
};

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
};

// Wrapper to inject params into ExperienceDetail
function ExperienceDetailRoute({
  user,
  onToggleSave,
}: {
  user: User;
  onToggleSave: (id: string) => void;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToTrip } = useTrip();
  const experience = id ? getExperienceById(id) : undefined;

  if (!experience) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Experience not found
      </div>
    );
  }

  // Check if item is already in trip to maybe show different UI?
  // For now just pass the adder.

  return (
    <ExperienceDetail
      experience={experience}
      isSaved={user.saved?.includes(experience.id) ?? false}
      onBack={() => navigate(-1)}
      onToggleSave={() => onToggleSave(experience.id)}
      onAddToTrip={(guests, totalPrice) =>
        addToTrip(experience.id, guests, totalPrice)
      }
    />
  );
}

function CategoryBrowserRoute({
  user,
  onQuickAdd,
  onToggleSave,
}: {
  user: User;
  onQuickAdd: (exp: Experience) => void;
  onToggleSave: (id: string) => void;
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <CategoryBrowser
      categoryId={id || ''}
      userPreferences={user.preferences}
      savedExperiences={user.saved || []}
      onBack={() => navigate('/')}
      onExperienceSelect={(expId) => navigate(`/experience/${expId}`)}
      onQuickAdd={onQuickAdd}
      onToggleSave={onToggleSave}
    />
  );
}

function AppContent() {
  const { user: authUser, updateUser, logout } = useAuth();
  const { trip, addToTrip, removeFromTrip, replaceTrip, clearTrip } = useTrip();

  // Local state for bookings (could be moved to BookingContext later)
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Vendor session with localStorage persistence
  const [vendorSession, setVendorSessionState] = useState<VendorSession | null>(
    () => {
      try {
        const stored = localStorage.getItem('pulau_vendor_session');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    },
  );

  const setVendorSession = useCallback((session: VendorSession | null) => {
    setVendorSessionState(session);
    if (session) {
      localStorage.setItem('pulau_vendor_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('pulau_vendor_session');
    }
  }, []);

  const navigate = useNavigate();

  // Initialize Network Sync
  useNetworkSync({
    onSync: async () => {
      if (authUser) {
        const userBookings = await bookingService.getUserBookings(authUser.id);
        setBookings(userBookings);
      }
    },
  });

  // Use authUser if available, otherwise fallback to defaultUser
  const safeUser = authUser || defaultUser;

  // Load bookings when user logs in
  useEffect(() => {
    if (authUser) {
      const loadData = async () => {
        try {
          // Trip is handled by TripContext now
          // Load bookings
          const userBookings = await bookingService.getUserBookings(
            authUser.id,
          );
          setBookings(userBookings);
        } catch (e) {
          console.error('Failed to load user bookings', e);
        }
      };
      loadData();
    } else {
      setBookings([]);
    }
  }, [authUser]);

  // Redirect logic - Route to single-screen onboarding for first-time users (Story 33.2)
  useEffect(() => {
    if (authUser && !authUser.hasCompletedOnboarding) {
      navigate('/onboarding');
    }
  }, [authUser, navigate]);

  const handleOnboardingComplete = (preferences: UserPreferences) => {
    const updatedUser = {
      ...safeUser,
      preferences,
      hasCompletedOnboarding: true,
    };
    updateUser(updatedUser);
    navigate('/');
    toast.success('Welcome to Pulau! 🏝️');
  };

  const handleOnboardingSkip = () => {
    // Default preferences per AC #5 - using shared constants
    const defaultPrefs: UserPreferences = {
      travelStyles: [ONBOARDING_DEFAULTS.travelStyles[0]],
      groupType: ONBOARDING_DEFAULTS.groupType,
      budget: ONBOARDING_DEFAULTS.budget,
    };
    const updatedUser = {
      ...safeUser,
      preferences: defaultPrefs,
      hasCompletedOnboarding: true,
    };
    updateUser(updatedUser);
    console.log('onboarding_skipped'); // Analytics event placeholder
    navigate('/');
    toast.success('Welcome to Pulau! Start exploring 🏝️');
  };

  const handleQuickAdd = (experience: Experience) => {
    // Default 2 guests for quick add
    const guests = 2;
    const totalPrice = experience.price.amount * guests;
    addToTrip(experience.id, guests, totalPrice);
    toast.success(`Added ${experience.title} to your trip!`);
  };

  // Adapter for TripBuilder which returns updated trip completely
  // TripBuilder in 'plan' route calls onUpdateTrip
  // We can just call replaceTrip
  const handleUpdateTrip = (updatedTrip: Trip) => {
    replaceTrip(updatedTrip);
  };

  const handleRemoveItem = (index: number) => {
    const itemToRemove = trip.items[index];
    if (itemToRemove) {
      removeFromTrip(itemToRemove.experienceId);
      toast.success('Removed from trip');
    }
  };

  const handleToggleSave = (experienceId: string) => {
    if (!authUser) {
      toast.error('Please login to save experiences');
      navigate('/login');
      return;
    }

    const isSaved = safeUser.saved?.includes(experienceId) ?? false;
    const updatedSaved = isSaved
      ? safeUser.saved?.filter((id) => id !== experienceId)
      : [...(safeUser.saved || []), experienceId];
    toast.success(isSaved ? 'Removed from saved' : 'Saved for later ❤️');
    updateUser({ ...safeUser, saved: updatedSaved });
  };

  const handleCheckoutComplete = async (bookingRef: string) => {
    const newBooking: Booking = {
      id: crypto.randomUUID(),
      tripId: trip.id,
      reference: bookingRef,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      trip: {
        ...trip,
        status: 'booked',
        bookingReference: bookingRef,
        bookedAt: new Date().toISOString(),
      },
    };

    // Save Booking to DB
    if (authUser) {
      try {
        const savedBooking = await bookingService.createBooking(newBooking);
        if (savedBooking) {
          setBookings((current) => [...(current || []), savedBooking]);
        }
      } catch (e) {
        console.error('Failed to save booking', e);
        toast.error('Failed to save booking');
        setBookings((current) => [...(current || []), newBooking]);
      }
    } else {
      setBookings((current) => [...(current || []), newBooking]);
    }

    // Clear current trip / Start fresh
    clearTrip();
    navigate('/trips');
  };

  const handleBookAgain = (originalTrip: Trip) => {
    const clonedItems = originalTrip.items.map((item) => ({
      ...item,
      date: undefined,
      time: undefined,
    }));

    // We construct a new trip object
    // Note: TripContext 'replaceTrip' expects a Trip object.
    const newTripPartial = {
      ...originalTrip,
      id: `trip_${Date.now()}`,
      userId: safeUser.id,
      status: 'planning',
      startDate: undefined,
      endDate: undefined,
      bookingReference: undefined,
      bookedAt: undefined,
      items: clonedItems,
      ...calculateTripTotal(clonedItems),
    } as Trip; // Force type as we constructed it carefully

    replaceTrip(newTripPartial);
    navigate('/plan');
    toast.success('Trip cloned! Set your new dates in the Trip Builder.');
  };

  return (
    <>
      <MetaManager />
      <Toaster />
      <PWAInstallPrompt />

      <NavigationShellWithRouter>
        <Routes>
          {/* Main Tabs */}
          <Route
            index
            element={
              <HomeScreen
                trip={trip}
                userPreferences={safeUser.preferences || defaultPreferences}
                onCategorySelect={(id) => navigate(`/category/${id}`)}
                onViewTrip={() => navigate('/plan')}
                onExperienceSelect={(id) => navigate(`/experience/${id}`)}
                onQuickAdd={handleQuickAdd}
                onPreferenceChange={(p) =>
                  updateUser({ ...safeUser, preferences: p })
                }
              />
            }
          />

          <Route
            path="/explore"
            element={
              <ExploreScreen
                onViewExperience={(id) => navigate(`/experience/${id}`)}
                onQuickAdd={handleQuickAdd}
              />
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedScreen
                  savedIds={safeUser.saved}
                  onToggleSave={handleToggleSave}
                  onAddToTrip={handleQuickAdd}
                  onViewExperience={(id) => navigate(`/experience/${id}`)}
                  onNavigateHome={() => navigate('/')}
                  tripItemIds={trip.items.map((i) => i.experienceId)}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileScreen
                  user={safeUser}
                  onNavigateToTrips={() => navigate('/trips')}
                  onNavigateToSaved={() => navigate('/saved')}
                  onNavigateToVendor={() => navigate('/vendor/dashboard')}
                  onNavigateToSettings={() => {}}
                  onLogout={() => {
                    logout();
                    navigate('/login');
                  }}
                  onBack={() => navigate('/')}
                />
              </ProtectedRoute>
            }
          />

          {/* Feature Routes */}
          <Route
            path="/category/:id"
            element={
              <CategoryBrowserRoute
                user={safeUser}
                onQuickAdd={handleQuickAdd}
                onToggleSave={handleToggleSave}
              />
            }
          />

          <Route
            path="/experience/:id"
            element={
              <ExperienceDetailRoute
                user={safeUser}
                onToggleSave={handleToggleSave}
              />
            }
          />

          <Route
            path="/plan"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LazyLoadFallback />}>
                  <TripBuilder
                    trip={trip}
                    onBack={() => navigate('/')}
                    onRemoveItem={handleRemoveItem}
                    onCheckout={() => navigate('/checkout')}
                    onUpdateTrip={handleUpdateTrip}
                  />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LazyLoadFallback />}>
                  <CheckoutFlow
                    trip={trip}
                    onBack={() => navigate('/plan')}
                    onComplete={handleCheckoutComplete}
                  />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout/success"
            element={
              <ProtectedRoute>
                <CheckoutSuccess
                  onNavigateHome={() => navigate('/')}
                  onNavigateToTrips={() => navigate('/trips')}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout/cancel"
            element={
              <ProtectedRoute>
                <CheckoutCancel
                  onRetryCheckout={() => navigate('/checkout')}
                  onReturnToTrip={() => navigate('/plan')}
                  onNavigateHome={() => navigate('/')}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LazyLoadFallback />}>
                  <TripsDashboard
                    bookings={bookings || []}
                    onUpdateBookings={(b) => setBookings(b)}
                    onBack={() => navigate('/profile')}
                    onViewTrip={() => {
                      /* Placeholder */
                    }}
                    onBookAgain={handleBookAgain}
                  />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Single-Screen Onboarding (Story 33.2 - Active) */}
          <Route
            path="/onboarding"
            element={
              <OnboardingSingleScreen
                onComplete={handleOnboardingComplete}
                onSkip={handleOnboardingSkip}
              />
            }
          />

          {/* Old Epic 4 multi-step onboarding flow (deprecated - kept for reference) */}
          <Route
            path="/onboarding-flow"
            element={
              <ProtectedRoute>
                <OnboardingFlow />
              </ProtectedRoute>
            }
          />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route
            path="/forgot-password"
            element={<PasswordReset onBack={() => navigate('/login')} />}
          />

          {/* Vendor Routes */}
          <Route
            path="/vendor/login"
            element={
              <Suspense fallback={<LazyLoadFallback />}>
                <VendorLogin
                  onLogin={(s) => {
                    setVendorSession(s);
                    navigate('/vendor/dashboard');
                  }}
                  onNavigateToRegister={() => navigate('/vendor/register')}
                />
              </Suspense>
            }
          />
          <Route
            path="/vendor/register"
            element={
              <Suspense fallback={<LazyLoadFallback />}>
                <VendorRegister
                  onNavigateToLogin={() => navigate('/vendor/login')}
                />
              </Suspense>
            }
          />
          <Route
            path="/vendor/dashboard"
            element={
              <VendorProtectedRoute session={vendorSession}>
                <Suspense fallback={<LazyLoadFallback />}>
                  <VendorDashboard
                    session={vendorSession!}
                    onNavigateToExperiences={() => {}}
                    onNavigateToBookings={() => {}}
                    onNavigateToRevenue={() => navigate('/vendor/revenue')}
                    onLogout={() => {
                      setVendorSession(null);
                      navigate('/vendor/login');
                    }}
                  />
                </Suspense>
              </VendorProtectedRoute>
            }
          />
          <Route
            path="/vendor/revenue"
            element={
              <VendorProtectedRoute session={vendorSession}>
                <Suspense fallback={<LazyLoadFallback />}>
                  <VendorRevenueDashboard
                    session={vendorSession!}
                    onBack={() => navigate('/vendor/dashboard')}
                  />
                </Suspense>
              </VendorProtectedRoute>
            }
          />

          <Route
            path="/ticket/:bookingId"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LazyLoadFallback />}>
                  <TicketPageRoute />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <StickyTripBar />
      </NavigationShellWithRouter>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <AppContent />
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
