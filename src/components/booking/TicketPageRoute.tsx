import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TicketPage } from './TicketPage';
import { bookingService } from '../../lib/bookingService';
import { Booking } from '@/lib/types';
import { getExperienceById } from '@/lib/helpers';
import { toast } from 'sonner';

export function TicketPageRoute() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);

  const loadBooking = useCallback(async () => {
    if (!bookingId || !user) return;
    setLoading(true);
    try {
      // For now, we fetch all user bookings and filter
      // In a real app, we'd have bookingService.getBookingById(bookingId)
      const bookings = await bookingService.getUserBookings(user.id);
      const found = bookings.find((b) => b.id === bookingId);

      if (found) {
        setBooking(found);
      } else {
        toast.error('Booking not found');
      }
    } catch (err) {
      console.error('Error loading ticket:', err);
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [bookingId, user]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  if (loading) {
    return <TicketPage loading={true} />;
  }

  if (!booking) {
    return (
      <TicketPage ticketData={undefined} onBack={() => navigate('/trips')} />
    );
  }

  // Transform Booking to TicketData
  // If there are multiple items, we use the first one for the primary display
  const firstItem = booking.trip.items[0];
  const experience = firstItem
    ? getExperienceById(firstItem.experienceId)
    : null;

  const ticketData = {
    bookingId: booking.id,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${booking.id}`,
    experienceName: experience?.title || 'Your Trip',
    experienceImage: experience?.images[0],
    dateTime:
      firstItem?.date && firstItem?.time
        ? `${firstItem.date}T${firstItem.time}`
        : booking.bookedAt,
    guestCount: firstItem?.guests || booking.trip.travelers,
    meetingPoint: experience?.meetingPoint?.name || 'Meeting Point TBD',
    vendorName: experience?.provider?.name || 'Local Guide',
    vendorContact: '+62 361 234 567', // Mock contact
    bookingReference: booking.reference,
    lastUpdated: Date.now(),
  };

  return (
    <TicketPage
      ticketData={ticketData}
      onBack={() => navigate('/trips')}
      onRefresh={loadBooking}
    />
  );
}
