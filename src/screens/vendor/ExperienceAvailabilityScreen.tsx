import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Calendar as CalendarIcon, Users } from 'lucide-react'
import { ExperienceAvailabilityRecord } from '@/lib/types'
import { EditAvailabilityModal } from '@/components/vendor/EditAvailabilityModal'
import { toast } from 'sonner'
import 'react-day-picker/dist/style.css'

interface ExperienceAvailabilityScreenProps {
    experienceId: string
    onBack: () => void
}

export function ExperienceAvailabilityScreen({ experienceId, onBack }: ExperienceAvailabilityScreenProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [availability, setAvailability] = useState<ExperienceAvailabilityRecord[]>([
        // Seed some data
        {
            id: '1',
            experienceId,
            date: format(new Date(), 'yyyy-MM-dd'),
            slotsAvailable: 5,
            status: 'available'
        }
    ])

    const getRecordForDate = (date: Date) => {
        const dString = format(date, 'yyyy-MM-dd')
        return availability.find(r => r.date === dString)
    }

    const handleDayClick = (day: Date) => {
        setSelectedDate(day)
        setIsModalOpen(true)
    }

    const handleSaveAvailability = (date: Date, status: 'available' | 'blocked', slots: number) => {
        const dString = format(date, 'yyyy-MM-dd')

        setAvailability(prev => {
            const others = prev.filter(r => r.date !== dString)
            const newRecord: ExperienceAvailabilityRecord = {
                id: crypto.randomUUID(),
                experienceId,
                date: dString,
                slotsAvailable: slots,
                status
            }
            return [...others, newRecord]
        })

        toast.success(`Updated availability for ${format(date, 'MMM d')}`)
    }

    // Modifiers for coloring the calendar
    const blockedDates = availability.filter(r => r.status === 'blocked').map(r => new Date(r.date))
    const availableDates = availability.filter(r => r.status === 'available').map(r => new Date(r.date))

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card border-b">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold">Manage Availability</h1>
                            <p className="text-xs text-muted-foreground">Set dates and capacity</p>
                        </div>
                    </div>
                    <Button variant="outline">
                        Bulk Edit (Coming Soon)
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 grid md:grid-cols-2 gap-8">

                {/* Calendar Column */}
                <Card className="p-4 flex justify-center">
                    <style>{`
                .rdp-day_selected { 
                    background-color: var(--primary) !important; 
                    color: white !important;
                }
                .rdp-day_blocked {
                    background-color: #f3f4f6;
                    color: #9ca3af;
                    text-decoration: line-through;
                }
                .rdp-day_available {
                    background-color: #ecfdf5;
                    color: #047857;
                    font-weight: bold;
                }
            `}</style>
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(d) => d && handleDayClick(d)}
                        modifiers={{
                            blocked: blockedDates,
                            available: availableDates
                        }}
                        modifiersClassNames={{
                            blocked: 'rdp-day_blocked',
                            available: 'rdp-day_available'
                        }}
                    />
                </Card>

                {/* Legend / Info Column */}
                <div className="space-y-6">
                    <Card className="p-6 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" /> Legend
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center justify-center text-[10px]">10</div>
                                <span>Available (Green)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200 text-gray-400 flex items-center justify-center text-[10px]">x</div>
                                <span>Blocked (Gray)</span>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-primary/5 p-4 rounded-lg text-sm text-primary-foreground/80 border border-primary/10">
                        <p><strong>Tip:</strong> Click any date to quickly update its status or available slots. Use the Bulk Edit tool for recurring schedules.</p>
                    </div>
                </div>

            </div>

            <EditAvailabilityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                date={selectedDate}
                currentRecord={selectedDate ? getRecordForDate(selectedDate) : undefined}
                onSave={handleSaveAvailability}
            />
        </div>
    )
}
