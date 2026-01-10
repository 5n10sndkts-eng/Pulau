/**
 * Vendor Operations Page
 * Stories: 27.1-27.4 - Vendor Check-In & Operations
 * 
 * Main page for vendors to check in guests and view today's bookings
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QRScanner } from './QRScanner'
import { Camera, Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

interface Booking {
  id: string
  bookingReference: string
  travelerName: string
  experienceName: string
  dateTime: string
  guestCount: number
  status: 'pending' | 'checked_in' | 'no_show'
  checkedInAt?: number
}

// Mock bookings for today
const mockTodayBookings: Booking[] = [
  {
    id: '1',
    bookingReference: 'PUL-001',
    travelerName: 'Sarah Johnson',
    experienceName: 'Sunset Freediving',
    dateTime: new Date().toISOString(),
    guestCount: 2,
    status: 'pending'
  },
  {
    id: '2',
    bookingReference: 'PUL-002',
    travelerName: 'Michael Chen',
    experienceName: 'Sunset Freediving',
    dateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    guestCount: 1,
    status: 'checked_in',
    checkedInAt: Date.now() - 2 * 60 * 60 * 1000
  }
]

export function VendorOperationsPage() {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>(mockTodayBookings)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const handleQRScan = (bookingId: string) => {
    // Find booking by ID or reference
    const booking = bookings.find(b => 
      b.id === bookingId || b.bookingReference === bookingId
    )

    if (booking) {
      setSelectedBooking(booking)
      setScannerOpen(false)
    } else {
      alert('Booking not found: ' + bookingId)
    }
  }

  const handleCheckIn = (bookingId: string) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId 
        ? { ...b, status: 'checked_in' as const, checkedInAt: Date.now() }
        : b
    ))
    setSelectedBooking(null)
  }

  const handleNoShow = (bookingId: string) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId 
        ? { ...b, status: 'no_show' as const }
        : b
    ))
  }

  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const checkedInCount = bookings.filter(b => b.status === 'checked_in').length
  const totalGuests = bookings.reduce((sum, b) => sum + b.guestCount, 0)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">
            Operations
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="text-2xl font-bold">{checkedInCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold">{totalGuests}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Scan Button */}
        <Button
          onClick={() => setScannerOpen(true)}
          size="lg"
          className="w-full h-16 text-lg"
        >
          <Camera className="w-6 h-6 mr-2" />
          Scan Ticket QR Code
        </Button>

        {/* Today's Bookings */}
        <div>
          <h2 className="font-display text-xl font-bold mb-4">
            Today's Bookings
          </h2>

          <div className="space-y-3">
            {bookings.map(booking => (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          {booking.travelerName}
                        </h3>
                        <Badge variant={
                          booking.status === 'checked_in' ? 'default' :
                          booking.status === 'no_show' ? 'destructive' :
                          'secondary'
                        }>
                          {booking.status === 'checked_in' ? 'Checked In' :
                           booking.status === 'no_show' ? 'No Show' :
                           'Pending'}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-1">
                        {booking.experienceName}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(booking.dateTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
                        </div>
                      </div>

                      {booking.status === 'checked_in' && booking.checkedInAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Checked in {formatDistanceToNow(booking.checkedInAt, { addSuffix: true })}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleCheckIn(booking.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Check In
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNoShow(booking.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            No Show
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {bookings.length === 0 && (
              <Card className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  No bookings scheduled for today
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleQRScan}
      />

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="max-w-md w-full p-6">
              <h2 className="font-display text-xl font-bold mb-4">
                Booking Details
              </h2>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Traveler</p>
                  <p className="font-semibold">{selectedBooking.travelerName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-semibold">{selectedBooking.experienceName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold">
                    {new Date(selectedBooking.dateTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-semibold">{selectedBooking.guestCount}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedBooking.status === 'pending' ? (
                  <>
                    <Button
                      onClick={() => handleCheckIn(selectedBooking.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Check In
                    </Button>
                    <Button
                      onClick={() => setSelectedBooking(null)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setSelectedBooking(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Close
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}
