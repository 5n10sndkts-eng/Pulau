import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Briefcase,
  Copy,
  Phone,
  Mail,
  Navigation,
  HelpCircle,
  QrCode,
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
import { BookingDetails } from './BookingDetails'

interface TripsDashboardProps {
  bookings: Booking[]
  onUpdateBookings: (bookings: Booking[]) => void
  onBack: () => void
  onViewTrip: (trip: Trip) => void
  onBookAgain: (trip: Trip) => void
}

export function TripsDashboard({ bookings = [], onUpdateBookings, onBack, onViewTrip, onBookAgain }: TripsDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const navigate = useNavigate()

  const safeBookings = bookings || []

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // AC3: Upcoming Tab - status='confirmed' AND trip.start_date >= today
  const upcomingBookings = safeBookings.filter((b) => {
    if (!b.trip.startDate) return false
    const startDate = new Date(b.trip.startDate)
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    return b.status === 'confirmed' && startDay >= today
  }).sort((a, b) => {
    const aDate = a.trip.startDate ? new Date(a.trip.startDate).getTime() : 0
    const bDate = b.trip.startDate ? new Date(b.trip.startDate).getTime() : 0
    return aDate - bDate // nearest first
  })

  // AC4: Past Tab - trip.end_date < today OR status='completed'
  const pastBookings = safeBookings.filter((b) => {
    if (!b.trip.endDate) {
      return b.status === 'completed'
    }
    const endDate = new Date(b.trip.endDate)
    const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    return endDay < today || b.status === 'completed'
  }).sort((a, b) => {
    const aDate = a.trip.startDate ? new Date(a.trip.startDate).getTime() : 0
    const bDate = b.trip.startDate ? new Date(b.trip.startDate).getTime() : 0
    return bDate - aDate // most recent first
  })

  // All bookings
  const allBookings = safeBookings

  const handleCancelBooking = (booking: Booking) => {
    const updated = (bookings || []).map((b) =>
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
    onUpdateBookings(updated)
    toast.success('Booking cancelled successfully')
    setSelectedBooking(null)
  }

  const handleDeleteBooking = (bookingId: string) => {
    const updated = (bookings || []).filter((b) => b.id !== bookingId)
    onUpdateBookings(updated)
    toast.success('Booking removed from history')
  }

  const handleDownloadReceipt = (booking?: Booking) => {
    toast.success('Receipt downloaded')
  }

  const handleShareTrip = (booking?: Booking) => {
    toast.success('Trip details copied to clipboard')
  }

  const handleCopyReference = (reference: string) => {
    navigator.clipboard.writeText(reference)
    toast.success('Booking reference copied')
  }

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60]/20 border">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20 border">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline" className="border-gray-400 text-gray-600">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-[#0D7377]/10 text-[#0D7377] border-[#0D7377]/20 border">
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
            {booking.status === 'confirmed' && (
              <Button
                className="flex-1 bg-teal-600 hover:bg-teal-700"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/ticket/${booking.id}`)
                }}
              >
                <QrCode className="w-4 h-4 mr-2" />
                View Ticket
              </Button>
            )}
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

  // renderBookingDetail previously extracted to src/components/BookingDetails.tsx

  const renderEmptyState = (type: 'upcoming' | 'past' | 'all') => {
    const getEmptyText = () => {
      if (type === 'upcoming') return 'No upcoming trips'
      if (type === 'past') return 'No past trips'
      return 'No trips yet'
    }

    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display text-xl font-semibold">
          {getEmptyText()}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Start planning your dream vacation!
        </p>
        <Button onClick={onBack} className="mt-4">
          Explore experiences
        </Button>
      </div>
    )
  }

  if (selectedBooking) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto p-6">
          <BookingDetails
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onUpdateBooking={(updated) => {
              const newBookings = bookings.map(b => b.id === updated.id ? updated : b);
              onUpdateBookings(newBookings);
              setSelectedBooking(updated);
            }}
            onDeleteBooking={handleDeleteBooking}
            onBookAgain={() => onBookAgain(selectedBooking.trip)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back to profile">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold">My Trips</h1>
            <p className="text-muted-foreground">Manage your bookings and travel history</p>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'upcoming' | 'past' | 'all')}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upcoming" className="gap-2">
              <Plane className="w-4 h-4" />
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <Receipt className="w-4 h-4" />
              Past ({pastBookings.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Package className="w-4 h-4" />
              All ({allBookings.length})
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

          <TabsContent value="all" className="space-y-4">
            {allBookings.length === 0 ? (
              renderEmptyState('all')
            ) : (
              <div className="grid gap-4">
                {allBookings.map((booking) => renderBookingCard(booking))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
