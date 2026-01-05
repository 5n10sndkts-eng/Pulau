import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Trip, Booking } from '../lib/types'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { getExperienceById, formatDate } from '../lib/helpers'
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
  Receipt,
  Plane,
  Package,
} from 'lucide-react'
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
} from './ui/alert-dialog'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface TripsDashboardProps {
  onBack: () => void
  onViewTrip: (trip: Trip) => void
  onBookAgain: (trip: Trip) => void
}

export function TripsDashboard({ onBack, onViewTrip, onBookAgain }: TripsDashboardProps) {
  const [bookings, setBookings] = useKV<Booking[]>('pulau_bookings', [])
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const safeBookings = bookings || []

  const now = new Date()
  const upcomingBookings = safeBookings.filter((b) => {
    if (!b.trip.startDate) return false
    const startDate = new Date(b.trip.startDate)
    return startDate >= now && b.status !== 'cancelled'
  })

  const pastBookings = safeBookings.filter((b) => {
    if (!b.trip.startDate) return true
    const startDate = new Date(b.trip.startDate)
    return startDate < now || b.status === 'cancelled' || b.status === 'completed'
  })

  const handleCancelBooking = (booking: Booking) => {
    setBookings((current) => {
      const updated = (current || []).map((b) =>
        b.id === booking.id
          ? {
              ...b,
              status: 'cancelled' as const,
              trip: {
                ...b.trip,
                status: 'cancelled' as const,
                cancelledAt: new Date().toISOString(),
              },
            }
          : b
      )
      return updated
    })
    toast.success('Booking cancelled successfully')
    setSelectedBooking(null)
  }

  const handleDeleteBooking = (bookingId: string) => {
    setBookings((current) => (current || []).filter((b) => b.id !== bookingId))
    toast.success('Booking removed from history')
  }

  const handleDownloadReceipt = () => {
    toast.success('Receipt downloaded')
  }

  const handleShareTrip = () => {
    toast.success('Trip details copied to clipboard')
  }

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="border-warning text-warning">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline" className="border-destructive text-destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
    }
  }

  const renderBookingCard = (booking: Booking) => {
    const destination = booking.trip.destination === 'dest_bali' ? 'Bali, Indonesia' : 'Unknown'
    const startDate = booking.trip.startDate ? new Date(booking.trip.startDate) : null
    const endDate = booking.trip.endDate ? new Date(booking.trip.endDate) : null

    return (
      <motion.div
        key={booking.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
          onClick={() => setSelectedBooking(booking)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-display text-lg font-semibold">{destination}</h3>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {startDate && endDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(startDate.toISOString())} - {formatDate(endDate.toISOString())}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{booking.trip.travelers} travelers</span>
                </div>
              </div>
            </div>
            {getStatusBadge(booking.status)}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Booking Ref:</span>
              <span className="font-mono font-medium">{booking.reference}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Experiences:</span>
              <span className="font-medium">{booking.trip.items.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Paid:</span>
              <span className="font-display text-lg font-bold text-primary">
                ${booking.trip.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                onViewTrip(booking.trip)
              }}
            >
              <Package className="w-4 h-4 mr-2" />
              View Details
            </Button>
            {booking.status === 'completed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onBookAgain(booking.trip)
                }}
              >
                Book Again
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    )
  }

  const renderBookingDetail = (booking: Booking) => {
    const destination = booking.trip.destination === 'dest_bali' ? 'Bali, Indonesia' : 'Unknown'
    const startDate = booking.trip.startDate ? new Date(booking.trip.startDate) : null
    const endDate = booking.trip.endDate ? new Date(booking.trip.endDate) : null
    const canCancel = booking.status === 'confirmed' && startDate && startDate > new Date()

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedBooking(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold">{destination}</h2>
            <p className="text-sm text-muted-foreground">Booking Reference: {booking.reference}</p>
          </div>
          {getStatusBadge(booking.status)}
        </div>

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
              <p className="font-display font-semibold">{booking.trip.travelers}</p>
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
          <h3 className="font-display text-lg font-semibold mb-4">Your Experiences</h3>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {booking.trip.items.map((item, index) => {
                const experience = getExperienceById(item.experienceId)
                if (!experience) return null

                return (
                  <Card key={index} className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={experience.images[0]}
                        alt={experience.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-display font-semibold mb-1">{experience.title}</h4>
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
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Payment Summary</h3>
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
            onClick={() => handleDownloadReceipt(booking)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => handleShareTrip(booking)}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Trip
          </Button>
        </div>

        {canCancel && (
          <Card className="p-4 bg-destructive/5 border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Cancellation Policy</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Free cancellation up to 24 hours before your trip starts. After that,
                  cancellation fees may apply.
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
                        This will cancel your entire trip to {destination}. You'll receive a full
                        refund if you're cancelling more than 24 hours before your trip starts.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCancelBooking(booking)}
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

        {booking.status === 'cancelled' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove from History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove from history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this booking from your history. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep in History</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteBooking(booking.id)}>
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    )
  }

  const renderEmptyState = (type: 'upcoming' | 'past') => {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          {type === 'upcoming' ? (
            <Plane className="w-8 h-8 text-muted-foreground" />
          ) : (
            <Receipt className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <h2 className="font-display text-xl font-semibold">
          {type === 'upcoming' ? 'No upcoming trips' : 'No past bookings'}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {type === 'upcoming'
            ? "You don't have any trips planned yet. Start building your dream vacation!"
            : "You haven't completed any trips yet. Your travel history will appear here."}
        </p>
        {type === 'upcoming' && (
          <Button onClick={onBack} className="mt-4">
            Start Planning
          </Button>
        )}
      </div>
    )
  }

  if (selectedBooking) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto p-6">{renderBookingDetail(selectedBooking)}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold">My Trips</h1>
            <p className="text-muted-foreground">Manage your bookings and travel history</p>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'upcoming' | 'past')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming" className="gap-2">
              <Plane className="w-4 h-4" />
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <Receipt className="w-4 h-4" />
              Past ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length === 0 ? (
              renderEmptyState('upcoming')
            ) : (
              <div className="grid gap-4">
                {upcomingBookings.map((booking) => renderBookingCard(booking))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length === 0 ? (
              renderEmptyState('past')
            ) : (
              <div className="grid gap-4">
                {pastBookings.map((booking) => renderBookingCard(booking))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
