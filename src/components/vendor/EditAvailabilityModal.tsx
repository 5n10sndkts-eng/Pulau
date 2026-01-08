import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExperienceAvailabilityRecord } from '@/lib/types'
import { format } from 'date-fns'

interface EditAvailabilityModalProps {
    isOpen: boolean
    onClose: () => void
    date: Date | undefined
    currentRecord?: ExperienceAvailabilityRecord
    onSave: (date: Date, status: 'available' | 'blocked', slots: number) => void
}

export function EditAvailabilityModal({
    isOpen,
    onClose,
    date,
    currentRecord,
    onSave
}: EditAvailabilityModalProps) {
    const [status, setStatus] = useState<'available' | 'blocked'>('available')
    const [slots, setSlots] = useState(10)

    useEffect(() => {
        if (isOpen && currentRecord) {
            setStatus(currentRecord.status === 'sold_out' ? 'available' : currentRecord.status)
            setSlots(currentRecord.slotsAvailable)
        } else {
            // Defaults
            setStatus('available')
            setSlots(10)
        }
    }, [isOpen, currentRecord])

    const handleSave = () => {
        if (!date) return
        onSave(date, status, slots)
        onClose()
    }

    if (!date) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Availability</DialogTitle>
                    <div className="text-sm text-muted-foreground">
                        For {format(date, 'MMMM d, yyyy')}
                    </div>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <Select
                            value={status}
                            onValueChange={(val: 'available' | 'blocked') => setStatus(val)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {status === 'available' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="slots" className="text-right">
                                Slots
                            </Label>
                            <Input
                                id="slots"
                                type="number"
                                value={slots}
                                onChange={(e) => setSlots(parseInt(e.target.value) || 0)}
                                className="col-span-3"
                                min="0"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
