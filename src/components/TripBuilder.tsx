import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trip, TripItem } from '@/lib/types'
import { getExperienceById, formatPrice, formatDateRange, getDayLabel, getDaysBetween } from '@/lib/helpers'
import { ArrowLeft, Share2, Clock, Trash2, Calendar } from 'lucide-react'
import { useState } from 'react'

interface TripBuilderProps {
  trip: Trip
  onBack: () => void
  onRemoveItem: (index: number) => void
  onCheckout: () => void
  readOnly?: boolean
}

export function TripBuilder({ trip, onBack, onRemoveItem, onCheckout, readOnly = false }: TripBuilderProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const itemsByDate: Record<string, TripItem[]> = {}
  const unscheduledItems: TripItem[] = []

  trip.items.forEach((item) => {
    if (item.date) {
      if (!itemsByDate[item.date]) {
        itemsByDate[item.date] = []
      }
      itemsByDate[item.date].push(item)
    } else {
      unscheduledItems.push(item)
    }
  })

  const sortedDates = Object.keys(itemsByDate).sort()

  if (trip.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-card border-b p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display text-2xl font-bold">Your Bali Trip</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-4">
          <div className="text-6xl mb-4">🧳</div>
          <h2 className="font-display text-2xl font-semibold">Your trip is waiting to be built</h2>
          <p className="text-muted-foreground max-w-md">
            Browse experiences and add them here to start creating your perfect Bali adventure
          </p>
          <Button size="lg" onClick={onBack} className="mt-4">
            Start Exploring
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-48">
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">Your Bali Trip</h1>
            <p className="text-sm text-muted-foreground">{formatDateRange(trip.startDate, trip.endDate)}</p>
          </div>
          <Button variant="ghost" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
            List View
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {sortedDates.map((date, dayIndex) => {
          const dayNumber = trip.startDate ? getDaysBetween(trip.startDate, date) : dayIndex + 1
          return (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px bg-border flex-1" />
                <div className="text-center">
                  <p className="font-display font-bold text-sm">DAY {dayNumber}</p>
                  <p className="text-sm text-muted-foreground">{getDayLabel(date)}</p>
                </div>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="space-y-3">
                {itemsByDate[date].map((item, itemIndex) => {
                  const experience = getExperienceById(item.experienceId)
                  if (!experience) return null

                  return (
                    <Card key={itemIndex} className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={experience.images[0]}
                          alt={experience.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold leading-tight mb-1">{experience.title}</h3>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                            {item.time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{item.time}</span>
                              </div>
                            )}
                            <span>•</span>
                            <span>{experience.duration}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">
                              {formatPrice(experience.price.amount)} × {item.guests} = {formatPrice(item.totalPrice)}
                            </p>
                            {!readOnly && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const globalIndex = trip.items.findIndex(
                                    (i) => i.experienceId === item.experienceId && i.date === item.date
                                  )
                                  if (globalIndex !== -1) onRemoveItem(globalIndex)
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}

        {unscheduledItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px bg-border flex-1" />
              <p className="font-display font-bold text-sm">NOT YET SCHEDULED</p>
              <div className="h-px bg-border flex-1" />
            </div>

            <div className="space-y-3">
              {unscheduledItems.map((item, index) => {
                const experience = getExperienceById(item.experienceId)
                if (!experience) return null

                return (
                  <Card key={index} className="p-4 border-dashed">
                    <div className="flex gap-4">
                      <img
                        src={experience.images[0]}
                        alt={experience.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold leading-tight mb-1">{experience.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{experience.duration}</p>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
                          {!readOnly && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Calendar className="w-3 h-3 mr-1" />
                                Assign Date
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const globalIndex = trip.items.findIndex((i) => i.experienceId === item.experienceId)
                                  if (globalIndex !== -1) onRemoveItem(globalIndex)
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 space-y-4 shadow-2xl">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              🎒 {trip.items.length} experiences • {sortedDates.length} days
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(trip.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service fee</span>
            <span>{formatPrice(trip.serviceFee)}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatPrice(trip.total)}</span>
          </div>
        </div>
        {!readOnly && (
          <Button size="lg" className="w-full" onClick={onCheckout}>
            Continue to Booking
          </Button>
        )}
        {readOnly && trip.bookingReference && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              Booking Reference: <span className="font-mono font-semibold">{trip.bookingReference}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
