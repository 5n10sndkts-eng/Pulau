/**
 * TicketPage Component
 * Story: 26.2 - Build Offline Ticket Display
 * Story: 26.3 - Show Last Updated Timestamp
 *
 * Offline-capable ticket display with QR code
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OfflineBanner } from './OfflineBanner';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface TicketData {
  bookingId: string;
  qrCodeUrl: string;
  experienceName: string;
  experienceImage?: string;
  dateTime: string;
  guestCount: number;
  meetingPoint: string;
  vendorName: string;
  vendorContact?: string;
  bookingReference: string;
  lastUpdated: number; // Unix timestamp
}

interface TicketPageProps {
  ticketData?: TicketData;
  loading?: boolean;
  onBack?: () => void;
  onRefresh?: () => void;
}

export function TicketPage({
  ticketData,
  loading = false,
  onBack,
  onRefresh,
}: TicketPageProps) {
  const isOnline = useOnlineStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!isOnline || !onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Card className="p-8">
            <Skeleton className="h-64 w-64 mx-auto mb-6" />
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-6 w-2/3" />
          </Card>
        </div>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Ticket not found</p>
          <p className="text-sm text-muted-foreground mb-4">
            This ticket may not be available offline yet.
          </p>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bookings
            </Button>
          )}
        </div>
      </div>
    );
  }

  const lastUpdatedText = ticketData.lastUpdated
    ? formatDistanceToNow(ticketData.lastUpdated, { addSuffix: true })
    : 'Unknown';

  const isStale = ticketData.lastUpdated
    ? Date.now() - ticketData.lastUpdated > 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner isOnline={isOnline} />

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {isOnline && onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Main Ticket Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden">
            {/* QR Code Section */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
              <div className="bg-white p-6 rounded-2xl inline-block shadow-lg">
                <img
                  src={ticketData.qrCodeUrl}
                  alt="Ticket QR Code"
                  className="w-64 h-64 mx-auto"
                  loading="eager"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4 font-mono">
                {ticketData.bookingReference}
              </p>
            </div>

            {/* Ticket Details */}
            <div className="p-8 space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold mb-2">
                  {ticketData.experienceName}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{ticketData.vendorName}</Badge>
                </div>
              </div>

              <div className="grid gap-4">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Date & Time
                    </p>
                    <p className="text-base font-semibold">
                      {new Date(ticketData.dateTime).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(ticketData.dateTime).toLocaleTimeString(
                        'en-US',
                        {
                          hour: 'numeric',
                          minute: '2-digit',
                        },
                      )}
                    </p>
                  </div>
                </div>

                {/* Guest Count */}
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Guests
                    </p>
                    <p className="text-base font-semibold">
                      {ticketData.guestCount}{' '}
                      {ticketData.guestCount === 1 ? 'Guest' : 'Guests'}
                    </p>
                  </div>
                </div>

                {/* Meeting Point */}
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Meeting Point
                    </p>
                    <p className="text-base font-semibold">
                      {ticketData.meetingPoint}
                    </p>
                    {ticketData.vendorContact && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Contact: {ticketData.vendorContact}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Important
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Please arrive 15 minutes before the scheduled time</li>
                  <li>• Show this QR code to the vendor for check-in</li>
                  <li>• Keep this ticket accessible offline</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Last Updated Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Last updated {lastUpdatedText}
            {isStale && (
              <span className="text-orange-600 ml-2">
                (Data may be outdated)
              </span>
            )}
          </p>
          {!isOnline && (
            <p className="mt-1 text-xs">
              Refresh when online to get latest information
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
