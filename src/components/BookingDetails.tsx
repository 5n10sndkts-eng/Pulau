import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getExperienceById, formatDate } from '@/lib/helpers';
import { useResendEmail } from '@/hooks/useResendEmail';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Share2,
  Trash2,
  AlertCircle,
  Copy,
  Phone,
  Mail,
  Navigation,
  HelpCircle,
  QrCode,
  Send,
  Loader2,
  Package,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BookingDetailsProps {
  booking: Booking;
  onClose: () => void;
  onUpdateBooking: (booking: Booking) => void;
  onDeleteBooking: (bookingId: string) => void;
  onBookAgain: () => void;
}

export function BookingDetails({
  booking,
  onClose,
  onUpdateBooking,
  onDeleteBooking,
  onBookAgain,
}: BookingDetailsProps) {
  const navigate = useNavigate();
  const { resendEmail, isResending } = useResendEmail();

  const destination =
    booking.trip.destination === 'dest_bali' ? 'Bali, Indonesia' : 'Unknown';
  const startDate = booking.trip.startDate
    ? new Date(booking.trip.startDate)
    : null;
  const endDate = booking.trip.endDate ? new Date(booking.trip.endDate) : null;
  const canCancel =
    booking.status === 'confirmed' && startDate && startDate > new Date();

  // Safe helpers if booking properties are missing (defensive)
  const isEmailSent = (booking as any).email_sent || false;
  const emailSentAt = (booking as any).email_sent_at;

  const handleCopyReference = (reference: string) => {
    navigator.clipboard.writeText(reference);
    toast.success('Booking reference copied');
  };

  const handleResendEmail = async () => {
    await resendEmail(booking.id);
    // Optimistically update or refetch? For now just toast handled in hook.
  };

  const handleCancelBooking = () => {
    const updated = {
      ...booking,
      status: 'cancelled' as const,
      trip: {
        ...booking.trip,
        status: 'cancelled' as const,
        cancelledAt: new Date().toISOString(),
      },
    };
    onUpdateBooking(updated);
    toast.success('Booking cancelled successfully');
  };

  const handleDeleteBooking = () => {
    onDeleteBooking(booking.id);
    toast.success('Booking removed from history');
    onClose();
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60]/20 border">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20 border">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="border-gray-400 text-gray-600">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-[#0D7377]/10 text-[#0D7377] border-[#0D7377]/20 border">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close booking details"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-display text-2xl font-bold">{destination}</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Booking Reference: {booking.reference}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleCopyReference(booking.reference)}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
        {getStatusBadge(booking.status)}
      </div>

      {/* Email Status & Resend - Added for Story 30.1.4 */}
      <Card className="p-4 bg-slate-50 border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail
              className={`w-5 h-5 ${isEmailSent ? 'text-green-600' : 'text-amber-500'}`}
            />
            <div>
              <h4 className="font-semibold text-sm">Booking Confirmation</h4>
              <p className="text-xs text-muted-foreground">
                {isEmailSent
                  ? `Sent ${emailSentAt ? new Date(emailSentAt).toLocaleDateString() : ''}`
                  : 'Email delivery pending or failed'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? (
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            ) : (
              <Send className="w-3 h-3 mr-2" />
            )}
            {isResending ? 'Sending...' : 'Resend Email'}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Check-in</p>
            <p className="font-display font-semibold">
              {startDate ? formatDate(startDate.toISOString()) : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Check-out</p>
            <p className="font-display font-semibold">
              {endDate ? formatDate(endDate.toISOString()) : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Travelers</p>
            <p className="font-display font-semibold">
              {booking.trip.travelers}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Booked On</p>
            <p className="font-display font-semibold">
              {formatDate(booking.bookedAt)}
            </p>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="font-display text-lg font-semibold mb-4">
          Your Experiences
        </h3>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {booking.trip.items.map((item: any, index: number) => {
              const experience = getExperienceById(item.experienceId);
              if (!experience) return null;

              return (
                <Card key={index} className="p-4 space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={experience.images[0]}
                      alt={experience.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-display font-semibold mb-1">
                        {experience.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {experience.provider.name}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        {item.date && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(item.date)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{item.guests} guests</span>
                        </div>
                        <span className="font-semibold text-primary ml-auto">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Operator Contact</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <a
                        href="tel:+62361234567"
                        className="text-primary hover:underline"
                      >
                        +62 361 234 567
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <a
                        href={`mailto:support@pulau.app`}
                        className="text-primary hover:underline"
                      >
                        support@pulau.app
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-4">
          Payment Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${booking.trip.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service Fee</span>
            <span>${booking.trip.serviceFee.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between">
            <span className="font-display font-semibold">Total Paid</span>
            <span className="font-display text-xl font-bold text-primary">
              ${booking.trip.total.toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => toast.success('Receipt downloaded')}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => toast.success('Details shared')}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Trip
        </Button>
      </div>

      {(booking.status === 'completed' ||
        (endDate && endDate < new Date())) && (
        <Button
          className="w-full bg-[#0D7377] hover:bg-[#0D7377]/90 text-white"
          onClick={onBookAgain}
        >
          <Package className="w-4 h-4 mr-2" />
          Book Again
        </Button>
      )}

      {canCancel && (
        <Card className="p-4 bg-destructive/5 border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Cancellation Policy</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Free cancellation up to 24 hours before your trip starts.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Booking
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel your entire trip.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelBooking}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Yes, Cancel Booking
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      )}

      {booking.status === 'confirmed' && (
        <Button
          className="w-full bg-teal-600 hover:bg-teal-700 h-14 text-lg font-bold shadow-lg shadow-teal-100"
          onClick={() => navigate(`/ticket/${booking.id}`)}
        >
          <QrCode className="w-6 h-6 mr-3" />
          View Digital Ticket
        </Button>
      )}
    </div>
  );
}
