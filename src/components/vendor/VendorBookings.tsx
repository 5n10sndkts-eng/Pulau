import { VendorSession } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Users, DollarSign, Package } from 'lucide-react'

interface VendorBookingsProps {
  session: VendorSession
  onBack: () => void
}

export function VendorBookings({ session, onBack }: VendorBookingsProps) {
  // Mock bookings data
  const mockBookings = [
    {
      id: 'book_v001',
      reference: 'PUL-2026-0123',
      travelerName: 'Sarah Johnson',
      travelerEmail: 'sarah@example.com',
      experienceName: 'Sunrise Snorkeling at Menjangan Island',
      date: '2026-01-20',
      guests: 2,
      amount: 130,
      status: 'confirmed' as const,
      bookedAt: '2026-01-05',
    },
    {
      id: 'book_v002',
      reference: 'PUL-2026-0124',
      travelerName: 'Michael Chen',
      travelerEmail: 'michael@example.com',
      experienceName: 'Sunrise Snorkeling at Menjangan Island',
      date: '2026-01-22',
      guests: 4,
      amount: 260,
      status: 'confirmed' as const,
      bookedAt: '2026-01-06',
    },
    {
      id: 'book_v003',
      reference: 'PUL-2026-0089',
      travelerName: 'Emma Wilson',
      travelerEmail: 'emma@example.com',
      experienceName: 'Sunrise Snorkeling at Menjangan Island',
      date: '2026-01-15',
      guests: 2,
      amount: 130,
      status: 'completed' as const,
      bookedAt: '2025-12-28',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold">Bookings</h1>
            <p className="text-white/80 mt-1">
              {mockBookings.length} total bookings
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {mockBookings.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold">No bookings yet</h2>
              <p className="text-muted-foreground">
                Bookings from travelers will appear here
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {mockBookings.map((booking) => (
              <Card key={booking.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-display text-lg font-bold">
                            {booking.travelerName}
                          </h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.experienceName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ref: {booking.reference}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">Experience date</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{booking.guests} guests</p>
                          <p className="text-xs text-muted-foreground">Party size</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">${booking.amount}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {new Date(booking.bookedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">Booked</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                      Contact Guest
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
