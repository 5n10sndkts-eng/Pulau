import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Trip, TripItem } from '@/lib/types'
import { getExperienceById, formatPrice, getDayLabel, getDaysBetween } from '@/lib/helpers'
import { Clock, MapPin } from 'lucide-react'
import { eachDayOfInterval, format, parseISO, isSameDay, addHours } from 'date-fns'

interface TripCalendarViewProps {
    trip: Trip
    readOnly?: boolean
}

export function TripCalendarView({ trip, readOnly = false }: TripCalendarViewProps) {
    // Generate all days in the trip duration
    const days = useMemo(() => {
        if (!trip.startDate || !trip.endDate) return []
        try {
            return eachDayOfInterval({
                start: parseISO(trip.startDate),
                end: parseISO(trip.endDate)
            })
        } catch (e) {
            console.error("Invalid trip dates", e)
            return []
        }
    }, [trip.startDate, trip.endDate])

    // Group items by date string (YYYY-MM-DD)
    const itemsByDate = useMemo(() => {
        const grouped: Record<string, TripItem[]> = {}
        trip.items.forEach(item => {
            if (item.date) {
                if (!grouped[item.date]) grouped[item.date] = []
                grouped[item.date]!.push(item)
            }
        })

        // Sort items within each day by time if available
        Object.keys(grouped).forEach(date => {
            grouped[date]!.sort((a, b) => {
                if (!a.time) return 1
                if (!b.time) return -1
                return a.time.localeCompare(b.time)
            })
        })

        return grouped
    }, [trip.items])

    if (days.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                Please set trip dates to view the calendar.
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {days.map((day, index) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const dayItems = itemsByDate[dateStr] || []
                const dayLabel = getDayLabel(dateStr)

                return (
                    <div key={dateStr} className="relative pl-8 border-l-2 border-border/50 ml-4 last:border-0 last:pb-0">
                        {/* Day Header Timeline Node */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-background" />

                        <div className="mb-6">
                            <h3 className="font-display font-bold text-lg">Day {index + 1}</h3>
                            <p className="text-sm text-muted-foreground">{format(day, 'EEEE, MMMM d')} • {dayLabel}</p>
                        </div>

                        {/* Timeline Items */}
                        <div className="space-y-4 pb-8">
                            {dayItems.length === 0 ? (
                                <div className="p-4 rounded-lg bg-secondary/20 border border-dashed border-border text-center text-sm text-muted-foreground">
                                    No activities planned for this day
                                </div>
                            ) : (
                                dayItems.map((item, itemIdx) => {
                                    const experience = getExperienceById(item.experienceId)
                                    if (!experience) return null

                                    // Simple check if this item is in a conflict
                                    const isConflict = false // TODO: Pass conflicts prop to this component to highlight
                                    // For now we will rely on top-level banner, 
                                    // or we could do a quick cheap calc here if we want per-item highlights.
                                    // Let's just allow passing conflicts as prop for better perf.

                                    // Since I didn't update the prop interface yet, I'll do a quick check? 
                                    // No, let's keep it simple for this step and rely on the banner.
                                    // I'll update the Card style if I can detect it cheaply or I will leave it for next iteration.
                                    // I will add a border-red-500 if specific time conditions met...
                                    // Actually, let's update the interface properly.

                                    return (
                                        <Card key={itemIdx} className={`overflow-hidden bg-card/50 hover:bg-card transition-colors`}>
                                            <div className="flex">
                                                {/* Time Column */}
                                                <div className="w-20 p-4 border-r bg-secondary/10 flex flex-col justify-center items-center text-center">
                                                    <span className="font-mono text-sm font-semibold">
                                                        {item.time || 'Anytime'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground mt-1">
                                                        {experience.duration}
                                                    </span>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 p-3 flex gap-4 items-center">
                                                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={experience.images[0]}
                                                            alt={experience.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-sm truncate">{experience.title}</h4>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {experience.meetingPoint.name}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right px-2">
                                                        <p className="font-bold text-sm">{formatPrice(item.totalPrice)}</p>
                                                        <p className="text-xs text-muted-foreground">{item.guests} guests</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
