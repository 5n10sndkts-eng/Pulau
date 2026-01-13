import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Trip, TripItem } from '../lib/types';
import { calculateTripTotal } from '../lib/helpers';
import { tripService } from '../lib/tripService';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface TripContextType {
  trip: Trip;
  isLoading: boolean;
  addToTrip: (experienceId: string, guests: number, totalPrice: number) => void;
  removeFromTrip: (experienceId: string) => void;
  replaceTrip: (trip: Trip) => void;
  clearTrip: () => void;
  itemCount: number;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const defaultTrip: Trip = {
  id: 'trip_session',
  userId: 'guest',
  destination: 'bali',
  travelers: 1,
  status: 'planning',
  items: [],
  subtotal: 0,
  serviceFee: 0,
  total: 0,
};

export function TripProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip>(defaultTrip);
  const [isLoading, setIsLoading] = useState(false);

  // Load active trip when user changes
  useEffect(() => {
    let mounted = true;

    const loadTrip = async () => {
      // If user is logged in, try to load from backend
      if (user) {
        setIsLoading(true);
        try {
          const activeTrip = await tripService.getActiveTrip(user.id);

          // Check for guest trip to merge
          const savedGuestTrip = localStorage.getItem('pulau_guest_trip');

          if (mounted) {
            if (activeTrip) {
              setTrip(activeTrip);
              // If user has a trip but also a guest trip, what do we do?
              // For now, if guest trip exists, we could prompt merge,
              // but simplest is to just prioritize the user's saved trip
              // UNLESS the user trip is empty and guest trip is not.
              // (Advanced merge logic can be a future task)

              // Cleanup guest trip now that we are logged in
              if (savedGuestTrip) localStorage.removeItem('pulau_guest_trip');
            } else {
              // User has no active backend trip.
              // Do we have a guest trip to migrate?
              if (savedGuestTrip) {
                try {
                  const parsedGuestTrip = JSON.parse(savedGuestTrip);
                  // Reassign ownership to new user
                  const migratedTrip = { ...parsedGuestTrip, userId: user.id };

                  // Save immediately to backend to finalize migration
                  const saved = await tripService.saveTrip(migratedTrip);
                  setTrip(saved);

                  localStorage.removeItem('pulau_guest_trip');
                  toast.success('We saved your planned trip to your account!');
                } catch {
                  setTrip((prev) => ({ ...prev, userId: user.id }));
                }
              } else {
                setTrip((prev) => ({ ...prev, userId: user.id }));
              }
            }
          }
        } catch (e) {
          console.error('Failed to load trip', e);
        } finally {
          if (mounted) setIsLoading(false);
        }
      } else {
        // If guest, try to load from localStorage
        const savedGuestTrip = localStorage.getItem('pulau_guest_trip');
        if (savedGuestTrip) {
          try {
            const parsedTrip = JSON.parse(savedGuestTrip);
            setTrip(parsedTrip);
          } catch {
            setTrip(defaultTrip);
          }
        } else {
          setTrip(defaultTrip);
        }
      }
    };

    loadTrip();
    return () => {
      mounted = false;
    };
  }, [user]);

  const saveTripToBackend = useCallback(
    async (newTrip: Trip) => {
      if (user) {
        try {
          const saved = await tripService.saveTrip({
            ...newTrip,
            userId: user.id,
          });
          // Update local state id/fields if the backend returns something new (e.g. real ID)
          if (saved.id !== newTrip.id) {
            setTrip(saved);
          }
        } catch (e) {
          console.error('Failed to save trip', e);
          toast.error('Failed to save changes');
        }
      } else {
        localStorage.setItem('pulau_guest_trip', JSON.stringify(newTrip));
      }
    },
    [user],
  );

  // Public Actions
  const replaceTrip = useCallback(
    (newTrip: Trip) => {
      setTrip(newTrip);
      // Debounce saving could be added here, but direct save for now
      saveTripToBackend(newTrip);
    },
    [saveTripToBackend],
  );

  const addToTrip = useCallback(
    (experienceId: string, guests: number, totalPrice: number) => {
      setTrip((prev) => {
        const existingItemIndex = prev.items.findIndex(
          (item) => item.experienceId === experienceId,
        );
        let newItems: TripItem[];

        if (existingItemIndex >= 0) {
          // Update existing item
          newItems = [...prev.items];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            experienceId,
            guests,
            totalPrice,
          };
        } else {
          // Add new item
          const newItem: TripItem = { experienceId, guests, totalPrice };
          newItems = [...prev.items, newItem];
        }

        const recalculated = calculateTripTotal(newItems);
        const newTrip = { ...prev, items: newItems, ...recalculated };

        saveTripToBackend(newTrip);
        return newTrip;
      });
    },
    [saveTripToBackend],
  );

  const removeFromTrip = useCallback(
    (experienceId: string) => {
      setTrip((prev) => {
        const newItems = prev.items.filter(
          (item) => item.experienceId !== experienceId,
        );
        const recalculated = calculateTripTotal(newItems);
        const newTrip = { ...prev, items: newItems, ...recalculated };
        saveTripToBackend(newTrip);
        return newTrip;
      });
    },
    [saveTripToBackend],
  );

  const clearTrip = useCallback(() => {
    // Keep destination/preferences? For now reset effectively to default but keep UserID if auth
    setTrip(() => {
      const newTrip = {
        ...defaultTrip,
        userId: user?.id || 'guest',
      };
      saveTripToBackend(newTrip);
      return newTrip;
    });
  }, [user, saveTripToBackend]);

  return (
    <TripContext.Provider
      value={{
        trip,
        isLoading,
        addToTrip,
        removeFromTrip,
        replaceTrip,
        clearTrip,
        itemCount: trip.items.length,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
