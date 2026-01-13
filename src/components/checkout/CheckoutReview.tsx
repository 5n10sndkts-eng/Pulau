/**
 * CheckoutReview Component
 * Story: 24.2 - Build Checkout Review Screen
 * Phase: 2a - Core Transactional
 *
 * Main checkout review screen for reviewing trip details before payment.
 * Displays all experiences with prices, allows modifications, and integrates
 * with real-time availability.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trip, TripItem, Experience } from '@/lib/types';
import { experienceService } from '@/lib/experienceService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatPrice, formatDate, calculateTripTotal } from '@/lib/helpers';
import { slotService, ExperienceSlot } from '@/lib/slotService';
import { toast } from 'sonner';
import {
  ArrowLeft,
  AlertCircle,
  Trash2,
  Minus,
  Plus,
  Clock,
  Users,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

// ================================================
// TYPES
// ================================================

interface CheckoutReviewProps {
  tripId: string;
  trip: Trip;
  onBack: () => void;
  onProceedToPayment: (sessionUrl: string) => void;
  onTripUpdate: (updatedTrip: Trip) => void;
}

interface CheckoutItemCardProps {
  item: TripItem;
  experience: Experience;
  slotAvailability?: ExperienceSlot | null;
  onRemove: () => void;
  onGuestChange: (newCount: number) => void;
  isUpdating: boolean;
}

interface PriceBreakdownProps {
  subtotal: number;
  serviceFee: number;
  total: number;
  itemCount: number;
}

interface CheckoutResponse {
  success: boolean;
  sessionUrl?: string;
  sessionId?: string;
  error?: string;
  errorCode?: string;
}

// ================================================
// CONSTANTS
// ================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const LOW_AVAILABILITY_THRESHOLD = 5;
const GUEST_CHANGE_DEBOUNCE_MS = 300;

// ================================================
// CHECKOUT ITEM CARD COMPONENT
// ================================================

function CheckoutItemCard({
  item,
  experience,
  slotAvailability,
  onRemove,
  onGuestChange,
  isUpdating,
}: CheckoutItemCardProps) {
  const isLowAvailability =
    slotAvailability &&
    slotAvailability.available_count < LOW_AVAILABILITY_THRESHOLD;
  const isUnavailable =
    slotAvailability?.is_blocked ||
    (slotAvailability && slotAvailability.available_count < item.guests);
  const maxGuests =
    slotAvailability?.available_count ?? experience.groupSize.max;

  const handleDecrease = () => {
    if (item.guests > 1) {
      onGuestChange(item.guests - 1);
    }
  };

  const handleIncrease = () => {
    if (item.guests < maxGuests) {
      onGuestChange(item.guests + 1);
    }
  };

  return (
    <Card
      className={`p-4 ${isUnavailable ? 'border-destructive bg-destructive/5' : ''}`}
    >
      <div className="flex gap-4">
        {/* Experience Image */}
        <img
          src={experience.images[0] || 'https://via.placeholder.com/100'}
          alt={experience.title}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Remove */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm sm:text-base leading-tight">
              {experience.title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
              onClick={onRemove}
              disabled={isUpdating}
              aria-label={`Remove ${experience.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Date/Time/Duration */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
            {item.date && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(item.date)}
                {item.time && ` at ${item.time}`}
              </span>
            )}
            <span>{experience.duration}</span>
          </div>

          {/* Availability Warning */}
          {isUnavailable && (
            <div className="flex items-center gap-1 text-destructive text-xs mb-2">
              <AlertCircle className="h-3 w-3" />
              <span>No longer available</span>
            </div>
          )}
          {!isUnavailable && isLowAvailability && slotAvailability && (
            <div className="flex items-center gap-1 text-orange-600 text-xs mb-2">
              <AlertTriangle className="h-3 w-3" />
              <span>Only {slotAvailability.available_count} spots left</span>
            </div>
          )}

          {/* Guest Count and Price Row */}
          <div className="flex items-center justify-between">
            {/* Guest Count Adjuster */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDecrease}
                  disabled={isUpdating || item.guests <= 1}
                  aria-label="Decrease guests"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.guests}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleIncrease}
                  disabled={isUpdating || item.guests >= maxGuests}
                  aria-label="Increase guests"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(experience.price.amount)} × {item.guests}
              </p>
            </div>
          </div>

          {/* Cancellation Policy Badge */}
          <Badge variant="outline" className="mt-2 text-xs">
            {experience.cancellation || 'Free cancellation up to 24h before'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

// ================================================
// PRICE BREAKDOWN COMPONENT
// ================================================

function PriceBreakdown({
  subtotal,
  serviceFee,
  total,
  itemCount,
}: PriceBreakdownProps) {
  return (
    <Card className="p-5 bg-coral/5 border-coral">
      <h3 className="font-display font-bold text-sm mb-4">Price Breakdown</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>
            Subtotal ({itemCount}{' '}
            {itemCount === 1 ? 'experience' : 'experiences'})
          </span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Service fee</span>
          <span>{formatPrice(serviceFee)}</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </Card>
  );
}

// ================================================
// SKELETON LOADING STATE
// ================================================

function CheckoutReviewSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Items Skeleton */}
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex gap-4">
            <Skeleton className="w-24 h-24 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </Card>
      ))}

      {/* Price Breakdown Skeleton */}
      <Card className="p-5">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </Card>

      {/* Button Skeleton */}
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

// ================================================
// MAIN CHECKOUT REVIEW COMPONENT
// ================================================

export function CheckoutReview({
  tripId,
  trip,
  onBack,
  onProceedToPayment,
  onTripUpdate,
}: CheckoutReviewProps) {
  const [experiences, setExperiences] = useState<Map<string, Experience>>(
    new Map(),
  );
  const [slotAvailability, setSlotAvailability] = useState<
    Map<string, ExperienceSlot>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for debouncing and double-click prevention
  const guestChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkoutInProgressRef = useRef(false);

  // Load experiences for trip items
  useEffect(() => {
    async function loadExperiences() {
      if (trip.items.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const experienceIds = [
          ...new Set(trip.items.map((item) => item.experienceId)),
        ];
        const loadedExperiences =
          await experienceService.getExperiencesByIds(experienceIds);

        const expMap = new Map<string, Experience>();
        loadedExperiences.forEach((exp) => expMap.set(exp.id, exp));
        setExperiences(expMap);
      } catch (err) {
        console.error('Failed to load experiences:', err);
        setError('Failed to load experience details');
      } finally {
        setIsLoading(false);
      }
    }

    loadExperiences();
  }, [trip.items]);

  // Load slot availability for items with date/time
  useEffect(() => {
    async function loadSlotAvailability() {
      if (!isSupabaseConfigured()) return;

      const itemsWithSlots = trip.items.filter(
        (item) => item.date && item.time,
      );
      if (itemsWithSlots.length === 0) return;

      const availabilityMap = new Map<string, ExperienceSlot>();

      for (const item of itemsWithSlots) {
        if (!item.date || !item.time) continue;

        try {
          const { data, error: slotsError } =
            await slotService.getAvailableSlots(item.experienceId, {
              startDate: item.date,
              endDate: item.date,
            });

          if (slotsError || !data) {
            console.error(
              `Failed to load slot for ${item.experienceId}:`,
              slotsError,
            );
            continue;
          }

          const matchingSlot = data.find((s) => s.slot_time === item.time);
          if (matchingSlot) {
            const key = `${item.experienceId}-${item.date}-${item.time}`;
            availabilityMap.set(key, matchingSlot);
          }
        } catch (err) {
          console.error(`Failed to load slot for ${item.experienceId}:`, err);
        }
      }

      setSlotAvailability(availabilityMap);
    }

    loadSlotAvailability();
  }, [trip.items]);

  // Subscribe to real-time availability updates
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const itemsWithSlots = trip.items.filter((item) => item.date && item.time);
    if (itemsWithSlots.length === 0) return;

    const experienceIds = [
      ...new Set(itemsWithSlots.map((item) => item.experienceId)),
    ];

    const channel = supabase
      .channel('slot-availability')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'experience_slots',
          // Quote UUIDs properly for PostgREST filter syntax
          filter:
            experienceIds.length === 1
              ? `experience_id=eq.${experienceIds[0]}`
              : `experience_id=in.(${experienceIds.map((id) => `"${id}"`).join(',')})`,
        },
        (payload) => {
          const updatedSlot = payload.new as ExperienceSlot;
          const key = `${updatedSlot.experience_id}-${updatedSlot.slot_date}-${updatedSlot.slot_time}`;

          setSlotAvailability((prev) => {
            const next = new Map(prev);
            next.set(key, updatedSlot);
            return next;
          });

          // Show toast if availability dropped significantly
          if (
            updatedSlot.available_count < LOW_AVAILABILITY_THRESHOLD &&
            updatedSlot.available_count > 0
          ) {
            toast.warning(
              `Only ${updatedSlot.available_count} spots left for a slot!`,
            );
          } else if (
            updatedSlot.available_count === 0 ||
            updatedSlot.is_blocked
          ) {
            toast.error('A slot in your cart is no longer available');
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trip.items]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (guestChangeTimeoutRef.current) {
        clearTimeout(guestChangeTimeoutRef.current);
      }
    };
  }, []);

  // Calculate totals using memoization
  const totals = useMemo(() => calculateTripTotal(trip.items), [trip.items]);

  // Check if any item is unavailable
  const hasUnavailableItems = useMemo(() => {
    return trip.items.some((item) => {
      if (!item.date || !item.time) return false;
      const key = `${item.experienceId}-${item.date}-${item.time}`;
      const slot = slotAvailability.get(key);
      return slot?.is_blocked || (slot && slot.available_count < item.guests);
    });
  }, [trip.items, slotAvailability]);

  // Handle removing an item
  const handleRemoveItem = (experienceId: string) => {
    setIsUpdating(true);

    const updatedItems = trip.items.filter(
      (item) => item.experienceId !== experienceId,
    );
    const newTotals = calculateTripTotal(updatedItems);

    const updatedTrip: Trip = {
      ...trip,
      items: updatedItems,
      ...newTotals,
    };

    onTripUpdate(updatedTrip);
    toast.success('Item removed from checkout');
    setIsUpdating(false);
  };

  // Handle changing guest count with debounce to prevent rapid-fire updates
  const handleGuestChange = useCallback(
    (experienceId: string, newCount: number) => {
      // Clear any pending debounced update
      if (guestChangeTimeoutRef.current) {
        clearTimeout(guestChangeTimeoutRef.current);
      }

      setIsUpdating(true);

      const experience = experiences.get(experienceId);
      if (!experience) {
        setIsUpdating(false);
        return;
      }

      // Debounce the actual update
      guestChangeTimeoutRef.current = setTimeout(() => {
        const updatedItems = trip.items.map((item) => {
          if (item.experienceId !== experienceId) return item;

          return {
            ...item,
            guests: newCount,
            totalPrice: experience.price.amount * newCount,
          };
        });

        const newTotals = calculateTripTotal(updatedItems);

        const updatedTrip: Trip = {
          ...trip,
          items: updatedItems,
          ...newTotals,
        };

        onTripUpdate(updatedTrip);
        setIsUpdating(false);
      }, GUEST_CHANGE_DEBOUNCE_MS);
    },
    [experiences, trip, onTripUpdate],
  );

  // Handle checkout with double-click prevention
  const handleProceedToPayment = async () => {
    // Early exit guard - prevent double-clicks/race conditions
    if (checkoutInProgressRef.current) {
      return;
    }

    if (hasUnavailableItems) {
      toast.error('Please remove unavailable items before checkout');
      return;
    }

    if (trip.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Set both ref (immediate) and state (for UI)
    checkoutInProgressRef.current = true;
    setIsCheckingOut(true);
    setError(null);

    try {
      // Get current auth session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Please log in to continue');
        checkoutInProgressRef.current = false;
        setIsCheckingOut(false);
        return;
      }

      // Call checkout Edge Function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tripId }),
      });

      const data: CheckoutResponse = await response.json();

      if (!data.success || !data.sessionUrl) {
        // Handle specific error codes
        switch (data.errorCode) {
          case 'INSUFFICIENT_INVENTORY':
            toast.error('Some items are no longer available');
            break;
          case 'VENDOR_NOT_PAYMENT_READY':
            toast.error('This vendor cannot accept payments yet');
            break;
          case 'CUTOFF_TIME_PASSED':
            toast.error('Booking cutoff time has passed');
            break;
          case 'MULTI_VENDOR_NOT_SUPPORTED':
            toast.error('Please checkout items from one vendor at a time');
            break;
          default:
            toast.error(data.error || 'Checkout failed');
        }
        setError(data.error || 'Checkout failed');
        checkoutInProgressRef.current = false;
        setIsCheckingOut(false);
        return;
      }

      // Success - redirect to Stripe (don't reset ref, we're navigating away)
      onProceedToPayment(data.sessionUrl);
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Failed to initiate checkout');
      setError('Failed to initiate checkout');
      checkoutInProgressRef.current = false;
      setIsCheckingOut(false);
    }
  };

  // Loading state
  if (isLoading) {
    return <CheckoutReviewSkeleton />;
  }

  // Empty cart state
  if (trip.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Checkout
          </h1>
        </div>

        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Button onClick={onBack}>Browse Experiences</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24 sm:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Review Your Order
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Verify your details before payment
          </p>
        </div>
      </div>

      {/* Unavailable Items Warning */}
      {hasUnavailableItems && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some items in your cart are no longer available. Please remove them
            to continue.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Trip Items */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-lg">Your Experiences</h2>
        {trip.items.map((item, index) => {
          const experience = experiences.get(item.experienceId);
          if (!experience) return null;

          const slotKey = `${item.experienceId}-${item.date}-${item.time}`;
          const slot = slotAvailability.get(slotKey);

          return (
            <CheckoutItemCard
              key={`${item.experienceId}-${index}`}
              item={item}
              experience={experience}
              slotAvailability={slot}
              onRemove={() => handleRemoveItem(item.experienceId)}
              onGuestChange={(newCount) =>
                handleGuestChange(item.experienceId, newCount)
              }
              isUpdating={isUpdating}
            />
          );
        })}
      </div>

      {/* Price Breakdown */}
      <PriceBreakdown
        subtotal={totals.subtotal}
        serviceFee={totals.serviceFee}
        total={totals.total}
        itemCount={trip.items.length}
      />

      {/* Proceed to Payment Button - Sticky on mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t sm:static sm:p-0 sm:border-0 sm:bg-transparent">
        <Button
          size="lg"
          className="w-full"
          onClick={handleProceedToPayment}
          disabled={isCheckingOut || hasUnavailableItems || isUpdating}
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Initiating Checkout...
            </>
          ) : (
            `Proceed to Payment • ${formatPrice(totals.total)}`
          )}
        </Button>
      </div>
    </div>
  );
}
