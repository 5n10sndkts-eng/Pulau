/**
 * Admin Booking Search Component
 * Story: 28.1 - Build Booking Search Interface
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Download } from 'lucide-react'

export function AdminBookingSearch() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Booking Management</h1>
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>
    </div>
  )
}
