import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    User,
    Calendar,
    Loader2,
    MapPin
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckInValidationResult } from '@/lib/bookingService'

interface ValidationCardProps {
    result: CheckInValidationResult | null
    isValidating: boolean
    onCheckIn: (bookingId: string) => void
    onClose: () => void
}

export function ValidationCard({
    result,
    isValidating,
    onCheckIn,
    onClose
}: ValidationCardProps) {
    if (isValidating) {
        return (
            <Card className="p-8 text-center space-y-4">
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                <p className="text-lg font-medium">Validating Ticket...</p>
                <p className="text-muted-foreground text-sm">Please wait while we check our records</p>
            </Card>
        )
    }

    if (!result) return null

    const { valid, message, booking } = result

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md shadow-2xl"
        >
            <Card className={`overflow-hidden border-2 ${valid ? 'border-teal-500' : 'border-red-500'}`}>
                {/* Status Header */}
                <div className={`p-4 text-white flex items-center gap-3 ${valid ? 'bg-teal-600' : 'bg-red-600'}`}>
                    {valid ? (
                        <CheckCircle2 className="w-8 h-8" />
                    ) : (
                        <XCircle className="w-8 h-8" />
                    )}
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-tight">
                            {valid ? 'Valid Ticket' : 'Invalid Ticket'}
                        </h2>
                    </div>
                </div>

                <div className="p-6 space-y-6 bg-white">
                    {/* Main Message */}
                    <div className={`p-3 rounded-lg text-sm font-medium ${valid ? 'bg-teal-50 text-teal-800' : 'bg-red-50 text-red-800'}`}>
                        {message}
                    </div>

                    {/* Booking Details if available */}
                    {booking && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Reference</p>
                                    <p className="font-mono text-sm font-bold">{booking.reference}</p>
                                </div>
                                <Badge variant={valid ? 'outline' : 'destructive'} className="h-fit">
                                    {booking.items[0]?.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Included Experiences</p>
                                {booking.items.map((item) => (
                                    <div key={item.id} className={`p-4 rounded-xl border ${item.is_today ? 'bg-teal-50/50 border-teal-100' : 'bg-muted/30 border-muted'}`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${item.is_today ? 'bg-teal-100 text-teal-700' : 'bg-muted text-muted-foreground'}`}>
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm">{item.experience_name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        {item.slot_time}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <User className="w-3 h-3" />
                                                        {item.guests} {item.guests === 1 ? 'guest' : 'guests'}
                                                    </div>
                                                </div>
                                                {!item.is_today && (
                                                    <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        SCHEDULED FOR {new Date(item.date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-4 border-t">
                        {valid && (
                            <Button
                                onClick={() => onCheckIn(booking!.id)}
                                className="w-full bg-teal-600 hover:bg-teal-700 h-14 text-lg font-bold shadow-lg shadow-teal-100"
                            >
                                Confirm Check-In
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="w-full h-12"
                        >
                            {valid ? 'Cancel' : 'Back to Scanner'}
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
