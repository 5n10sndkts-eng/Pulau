/**
 * Admin Booking Search Component
 * Story: 28.1 - Build Booking Search Interface
 *
 * Allows admins to search, filter, and export booking data
 */

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Download, Loader2, RefreshCw, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, subDays, startOfDay } from 'date-fns'

interface BookingSearchResult {
  id: string
  reference: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  booked_at: string
  trip_id: string
  trip: {
    id: string
    name: string | null
    user_id: string
    travelers: number
    start_date: string | null
    destination_id: string
  } | null
}

type DateRange = '7days' | '30days' | '90days' | 'all'
type StatusFilter = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed'

async function searchBookings(
  searchTerm: string,
  statusFilter: StatusFilter,
  dateRange: DateRange
): Promise<BookingSearchResult[]> {
  let query = supabase
    .from('bookings')
    .select(`
      id,
      reference,
      status,
      booked_at,
      trip_id,
      trips (
        id,
        name,
        user_id,
        travelers,
        start_date,
        destination_id
      )
    `)
    .order('booked_at', { ascending: false })
    .limit(100)

  // Apply status filter
  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  // Apply date range filter
  if (dateRange !== 'all') {
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90
    const startDate = startOfDay(subDays(new Date(), days)).toISOString()
    query = query.gte('booked_at', startDate)
  }

  // Apply search term filter (reference or trip name)
  if (searchTerm.trim()) {
    query = query.or(`reference.ilike.%${searchTerm}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error searching bookings:', error)
    throw error
  }

  return (data || [])
    .filter((row) => row.status) // Filter out rows without status
    .map((row) => ({
      id: row.id,
      reference: row.reference,
      status: row.status as BookingSearchResult['status'],
      booked_at: row.booked_at,
      trip_id: row.trip_id,
      trip: row.trips
        ? {
            id: row.trips.id,
            name: row.trips.name,
            user_id: row.trips.user_id,
            travelers: row.trips.travelers ?? 0,
            start_date: row.trips.start_date,
            destination_id: row.trips.destination_id,
          }
        : null,
    }))
}

function exportToCSV(bookings: BookingSearchResult[]) {
  const headers = [
    'Reference',
    'Status',
    'Booked At',
    'Travelers',
    'Trip Date',
    'Destination',
  ]

  const rows = bookings.map((b) => [
    b.reference,
    b.status,
    format(new Date(b.booked_at), 'yyyy-MM-dd HH:mm'),
    b.trip?.travelers?.toString() || '',
    b.trip?.start_date || '',
    b.trip?.destination_id || '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bookings-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
}

export function AdminBookingSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateRange, setDateRange] = useState<DateRange>('30days')

  // Debounce search input
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const {
    data: bookings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-bookings', debouncedSearch, statusFilter, dateRange],
    queryFn: () => searchBookings(debouncedSearch, statusFilter, dateRange),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Booking Management</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by booking reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Select
            value={dateRange}
            onValueChange={(v) => setDateRange(v as DateRange)}
          >
            <SelectTrigger className="w-[150px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Button */}
          <Button
            variant="outline"
            onClick={() => exportToCSV(bookings)}
            disabled={bookings.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Results Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading bookings...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Failed to load bookings. Please try again.
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No bookings found matching your criteria.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Booked At</TableHead>
                <TableHead>Travelers</TableHead>
                <TableHead>Trip Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono font-medium">
                    {booking.reference}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[booking.status] || ''}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(booking.booked_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{booking.trip?.travelers || '-'}</TableCell>
                  <TableCell>
                    {booking.trip?.start_date
                      ? format(new Date(booking.trip.start_date), 'MMM d, yyyy')
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Results Count */}
        {!isLoading && bookings.length > 0 && (
          <div className="p-4 border-t text-sm text-muted-foreground">
            Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          </div>
        )}
      </Card>
    </div>
  )
}
