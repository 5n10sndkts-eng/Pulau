import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trip } from '@/lib/types';
import { BookingData } from './CheckoutFlow';
import { formatPrice, formatDateRange } from '@/lib/helpers';
import {
  CheckCircle,
  Copy,
  Calendar,
  Share2,
  Download,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ConfirmationStepProps {
  trip: Trip;
  bookingData: BookingData;
  bookingRef: string;
}

export function ConfirmationStep({
  trip,
  bookingData,
  bookingRef,
}: ConfirmationStepProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(bookingRef);
    toast.success('Booking reference copied!');
  };

  const handleAddToCalendar = () => {
    toast.info('Calendar export coming soon!');
  };

  const handleShare = () => {
    toast.info('Share functionality coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/10 to-background">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ['#0D7377', '#FF6B6B', '#F4D03F'][i % 3],
                left: `${Math.random() * 100}%`,
                top: '-10%',
              }}
              initial={{ y: -20, opacity: 1 }}
              animate={{
                y: window.innerHeight + 20,
                opacity: 0,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto p-6 space-y-6 pt-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-success" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2"
        >
          <h1 className="font-display text-4xl font-bold">
            You're going to Bali! 🏝️
          </h1>
          <p className="text-xl text-muted-foreground">
            Your adventure is confirmed
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <div className="text-center space-y-4">
              <div>
                <p className="text-sm opacity-90 mb-2">Booking Reference</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="font-mono text-3xl font-bold tracking-wider">
                    {bookingRef}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyRef}
                    className="text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm opacity-90">
                Save this reference - you'll need it to access your bookings
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h2 className="font-display text-xl font-bold mb-4">
              Booking Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination</span>
                <span className="font-semibold">Bali, Indonesia 🇮🇩</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dates</span>
                <span className="font-semibold">
                  {formatDateRange(trip.startDate, trip.endDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Experiences Booked
                </span>
                <span className="font-semibold">{trip.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Travelers</span>
                <span className="font-semibold">{trip.travelers}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total Paid</span>
                <span className="font-bold text-primary">
                  {formatPrice(trip.total)}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <h2 className="font-display text-xl font-bold mb-4">
              Confirmation Sent
            </h2>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-semibold mb-1">Email confirmation sent</p>
                <p className="text-sm text-muted-foreground">
                  We've sent your booking details to{' '}
                  <span className="font-semibold">
                    {bookingData.leadTraveler?.email}
                  </span>
                </p>
              </div>
            </div>
            <Alert className="bg-coral/5 border-coral">
              <Sparkles className="h-4 w-4 text-coral" />
              <AlertDescription>
                Your booking confirmations will arrive within 1 hour. Local
                operators may contact you to confirm pickup details.
              </AlertDescription>
            </Alert>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6 bg-muted/50">
            <h2 className="font-display text-xl font-bold mb-4">
              What's Next?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                  1
                </div>
                <div>
                  <p className="font-semibold mb-1">Check your email</p>
                  <p className="text-sm text-muted-foreground">
                    Individual confirmations for each experience will arrive
                    shortly
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                  2
                </div>
                <div>
                  <p className="font-semibold mb-1">Operators will reach out</p>
                  <p className="text-sm text-muted-foreground">
                    Local guides may contact you about pickup times and special
                    requests
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                  3
                </div>
                <div>
                  <p className="font-semibold mb-1">Get ready for adventure</p>
                  <p className="text-sm text-muted-foreground">
                    Pack your bags, get excited, and prepare for an
                    unforgettable journey
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={handleAddToCalendar}
            className="w-full"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Add to Calendar
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleShare}
            className="w-full"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Trip
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.print()}
            className="w-full"
          >
            <Download className="w-5 h-5 mr-2" />
            Save PDF
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              window.location.reload();
            }}
          >
            Back to Home
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-muted-foreground pt-6"
        >
          <p>Questions? Contact us at support@pulau.travel</p>
          <p className="mt-2">
            Need to make changes? Use your booking reference {bookingRef}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
