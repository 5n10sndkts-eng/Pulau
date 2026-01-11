/**
 * Vendor Analytics Service
 * Story: 29.1 - Create Vendor Revenue Dashboard
 *
 * Centralized service for vendor revenue analytics and payout data
 */

import { supabase, isSupabaseConfigured } from './supabase'

// Use mock data if Supabase not configured
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !isSupabaseConfigured()

// ============================================================================
// Type Definitions
// ============================================================================

export interface VendorRevenueStats {
  totalRevenue: number
  revenueThisMonth: number
  pendingPayouts: number
  completedPayouts: number
  periodComparison: {
    previousPeriod: number
    percentChange: number
  }
}

export interface RevenueDataPoint {
  date: string // ISO date
  amount: number
  bookingCount: number
}

export interface RevenueDateRange {
  startDate: string
  endDate: string
  experienceId?: string
  granularity: 'day' | 'week' | 'month'
}

export interface PayoutSummary {
  pendingAmount: number
  completedAmount: number
  nextPayoutDate: string | null
  lastPayoutDate: string | null
  lastPayoutAmount: number | null
}

export type TimePeriod = '7d' | '30d' | '90d' | '12m'

// Story 29.2: Experience Performance Metrics
export interface ExperiencePerformanceMetrics {
  experienceId: string
  title: string
  thumbnailUrl: string | null
  category: string
  bookingCount: number
  slotUtilization: number // 0-100 percentage
  totalSlots: number
  bookedSlots: number
  averageRating: number | null // null if no reviews
  reviewCount: number
  revenue: number // in cents
}

export interface ExperiencePerformanceResponse {
  experiences: ExperiencePerformanceMetrics[]
  totals: {
    totalBookings: number
    averageUtilization: number
    totalRevenue: number
  }
}

export type SortColumn = 'title' | 'bookingCount' | 'slotUtilization' | 'averageRating' | 'revenue'
export type SortDirection = 'asc' | 'desc'

// Story 29.3: Payout History Types
export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled'

export interface PayoutRecord {
  id: string
  amount: number       // in cents
  fee: number          // platform fee in cents
  net: number          // net amount after fees in cents
  currency: string     // 'usd', 'idr'
  status: PayoutStatus
  arrivalDate: Date    // expected or actual arrival
  createdAt: Date
  stripePayoutId: string
  description?: string
}

export interface PayoutHistoryResponse {
  payouts: PayoutRecord[]
  hasMore: boolean
  totalCount: number
  summary: {
    totalPaid: number
    totalPending: number
    totalInTransit: number
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function getDateRangeForPeriod(period: TimePeriod): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  const startDate = new Date()

  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(endDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(endDate.getDate() - 90)
      break
    case '12m':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
  }

  return { startDate, endDate }
}

function getPreviousPeriodRange(period: TimePeriod): { startDate: Date; endDate: Date } {
  const { startDate: currentStart, endDate: currentEnd } = getDateRangeForPeriod(period)
  const duration = currentEnd.getTime() - currentStart.getTime()

  const endDate = new Date(currentStart.getTime() - 1) // Day before current period starts
  const startDate = new Date(endDate.getTime() - duration)

  return { startDate, endDate }
}

function getGranularityForPeriod(period: TimePeriod): 'day' | 'week' | 'month' {
  switch (period) {
    case '7d':
      return 'day'
    case '30d':
      return 'day'
    case '90d':
      return 'week'
    case '12m':
      return 'month'
  }
}

// ============================================================================
// Mock Data
// ============================================================================

function generateMockRevenueData(period: TimePeriod): RevenueDataPoint[] {
  const { startDate, endDate } = getDateRangeForPeriod(period)
  const granularity = getGranularityForPeriod(period)
  const dataPoints: RevenueDataPoint[] = []

  const current = new Date(startDate)
  while (current <= endDate) {
    dataPoints.push({
      date: current.toISOString().split('T')[0] ?? '',
      amount: Math.floor(Math.random() * 500) + 100,
      bookingCount: Math.floor(Math.random() * 5) + 1,
    })

    switch (granularity) {
      case 'day':
        current.setDate(current.getDate() + 1)
        break
      case 'week':
        current.setDate(current.getDate() + 7)
        break
      case 'month':
        current.setMonth(current.getMonth() + 1)
        break
    }
  }

  return dataPoints
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get vendor revenue statistics summary
 * Returns default stats on error to allow graceful degradation
 *
 * @param vendorId - The vendor's UUID
 * @param period - Time period for comparison calculation
 * @param experienceId - Optional filter for specific experience
 */
export async function getVendorRevenueStats(
  vendorId: string,
  period: TimePeriod = '30d',
  experienceId?: string
): Promise<VendorRevenueStats> {
  const defaultStats: VendorRevenueStats = {
    totalRevenue: 0,
    revenueThisMonth: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    periodComparison: {
      previousPeriod: 0,
      percentChange: 0,
    },
  }

  if (USE_MOCK_DATA) {
    // Generate mock stats
    const totalRevenue = Math.floor(Math.random() * 5000000) + 1000000 // In cents: $10,000-$60,000
    const currentPeriodRevenue = Math.floor(Math.random() * 500000) + 100000 // In cents: $1,000-$6,000
    const previousPeriodRevenue = Math.floor(Math.random() * 500000) + 80000 // In cents: $800-$5,800
    const percentChange = previousPeriodRevenue > 0
      ? Math.round(((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100)
      : 0

    return {
      totalRevenue,
      revenueThisMonth: currentPeriodRevenue,
      pendingPayouts: Math.floor(Math.random() * 200000) + 50000, // In cents
      completedPayouts: Math.floor(Math.random() * 4000000) + 800000, // In cents
      periodComparison: {
        previousPeriod: previousPeriodRevenue,
        percentChange,
      },
    }
  }

  // Get period boundaries for comparison
  const { startDate: currentStart, endDate: currentEnd } = getDateRangeForPeriod(period)
  const { startDate: previousStart, endDate: previousEnd } = getPreviousPeriodRange(period)

  try {
    // Helper to build vendor revenue query using RPC or simpler join
    // Note: Supabase nested filters have limitations, so we query bookings first
    const buildRevenueQuery = (start?: Date, end?: Date) => {
      let query = supabase
        .from('payments')
        .select(`
          amount,
          created_at,
          booking_id,
          bookings!inner (
            id,
            trip_id
          )
        `)
        .eq('status', 'succeeded')

      if (start) {
        query = query.gte('created_at', start.toISOString())
      }
      if (end) {
        query = query.lte('created_at', end.toISOString())
      }

      return query
    }

    // Query all successful payments and filter by vendor in application code
    // This is necessary because Supabase doesn't support deep nested eq filters well
    const { data: allPayments, error: paymentsError } = await buildRevenueQuery()

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return defaultStats
    }

    // Get vendor's experience IDs
    const { data: vendorExperiences, error: expError } = await supabase
      .from('experiences')
      .select('id')
      .eq('vendor_id', vendorId)

    if (expError) {
      console.error('Error fetching vendor experiences:', expError)
      return defaultStats
    }

    const vendorExpIds = new Set(vendorExperiences?.map(e => e.id) || [])

    // If filtering by specific experience, narrow the set
    const targetExpIds = experienceId
      ? new Set([experienceId].filter(id => vendorExpIds.has(id)))
      : vendorExpIds

    if (targetExpIds.size === 0) {
      return defaultStats
    }

    // Get trip_items for vendor's experiences to map bookings
    const { data: tripItems, error: tiError } = await supabase
      .from('trip_items')
      .select('trip_id, experience_id')
      .in('experience_id', Array.from(targetExpIds))

    if (tiError) {
      console.error('Error fetching trip items:', tiError)
      return defaultStats
    }

    // Create a set of trip IDs that contain vendor's experiences
    const vendorTripIds = new Set(tripItems?.map(ti => ti.trip_id) || [])

    // Filter payments to only those for vendor's bookings
    const vendorPayments = (allPayments || []).filter(p => {
      const booking = p.bookings
      return booking && vendorTripIds.has(booking.trip_id)
    })

    // Calculate totals
    const totalRevenue = vendorPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Current period revenue
    const currentPeriodPayments = vendorPayments.filter(p => {
      if (!p.created_at) return false
      const date = new Date(p.created_at)
      return date >= currentStart && date <= currentEnd
    })
    const currentPeriodRevenue = currentPeriodPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Previous period revenue for comparison
    const previousPeriodPayments = vendorPayments.filter(p => {
      if (!p.created_at) return false
      const date = new Date(p.created_at)
      return date >= previousStart && date <= previousEnd
    })
    const previousPeriodRevenue = previousPeriodPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Calculate percent change
    const percentChange = previousPeriodRevenue > 0
      ? Math.round(((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100)
      : 0

    // Fetch payout data from Stripe Connect via edge function
    const payoutSummary = await getPayoutSummary(vendorId)

    return {
      totalRevenue,
      revenueThisMonth: currentPeriodRevenue,
      pendingPayouts: payoutSummary.pendingAmount,
      completedPayouts: payoutSummary.completedAmount,
      periodComparison: {
        previousPeriod: previousPeriodRevenue,
        percentChange,
      },
    }
  } catch (err) {
    console.error('Error in getVendorRevenueStats:', err)
    return defaultStats
  }
}

/**
 * Get revenue data points by date range for charting
 */
export async function getRevenueByDateRange(
  vendorId: string,
  period: TimePeriod,
  experienceId?: string
): Promise<RevenueDataPoint[]> {
  if (USE_MOCK_DATA) {
    return generateMockRevenueData(period)
  }

  const { startDate, endDate } = getDateRangeForPeriod(period)
  const granularity = getGranularityForPeriod(period)

  try {
    let query = supabase
      .from('payments')
      .select(`
        amount,
        created_at,
        bookings!inner (
          trip_id,
          trips!inner (
            trip_items!inner (
              experience_id,
              experiences!inner (
                vendor_id
              )
            )
          )
        )
      `)
      .eq('status', 'succeeded')
      .eq('bookings.trips.trip_items.experiences.vendor_id', vendorId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (experienceId) {
      query = query.eq('bookings.trips.trip_items.experience_id', experienceId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching revenue data:', error)
      return []
    }

    // Aggregate by granularity
    const aggregated = new Map<string, { amount: number; count: number }>()

    for (const payment of data || []) {
      if (!payment.created_at) continue
      const date = new Date(payment.created_at)
      let key: string

      switch (granularity) {
        case 'day':
          key = date.toISOString().split('T')[0] ?? ''
          break
        case 'week': {
          // Get start of week (Sunday)
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0] ?? ''
          break
        }
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
          break
      }

      const existing = aggregated.get(key) || { amount: 0, count: 0 }
      aggregated.set(key, {
        amount: existing.amount + (payment.amount || 0),
        count: existing.count + 1,
      })
    }

    // Convert to array
    return Array.from(aggregated.entries()).map(([date, data]) => ({
      date,
      amount: data.amount,
      bookingCount: data.count,
    }))
  } catch (err) {
    console.error('Error in getRevenueByDateRange:', err)
    return []
  }
}

/**
 * Get payout summary from Stripe Connect via edge function
 */
export async function getPayoutSummary(vendorId: string): Promise<PayoutSummary> {
  if (USE_MOCK_DATA) {
    return {
      pendingAmount: Math.floor(Math.random() * 2000) + 500,
      completedAmount: Math.floor(Math.random() * 40000) + 8000,
      nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastPayoutDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastPayoutAmount: Math.floor(Math.random() * 1000) + 200,
    }
  }

  try {
    const { data, error } = await supabase.functions.invoke('vendor-payout-status', {
      body: { vendorId },
    })

    if (error) {
      console.error('Error fetching payout summary:', error)
      return {
        pendingAmount: 0,
        completedAmount: 0,
        nextPayoutDate: null,
        lastPayoutDate: null,
        lastPayoutAmount: null,
      }
    }

    return {
      pendingAmount: data?.pendingAmount || 0,
      completedAmount: data?.completedAmount || 0,
      nextPayoutDate: data?.nextPayoutDate || null,
      lastPayoutDate: data?.lastPayoutDate || null,
      lastPayoutAmount: data?.lastPayoutAmount || null,
    }
  } catch (err) {
    console.error('Error in getPayoutSummary:', err)
    return {
      pendingAmount: 0,
      completedAmount: 0,
      nextPayoutDate: null,
      lastPayoutDate: null,
      lastPayoutAmount: null,
    }
  }
}

/**
 * Format currency for display
 *
 * @param amount - Amount in cents (e.g., 1000 = $10.00). All monetary values
 *                 in the database and Stripe are stored in the smallest currency
 *                 unit (cents for USD) to avoid floating-point precision issues.
 * @param currency - ISO 4217 currency code (default: 'USD')
 * @returns Formatted currency string (e.g., '$1,234')
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

/**
 * Format percentage change for display
 */
export function formatPercentChange(percent: number): string {
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent}%`
}

// ============================================================================
// Story 29.2: Experience Performance Metrics
// ============================================================================

const MOCK_EXPERIENCE_TITLES = [
  'Mount Batur Sunrise Trek',
  'Ubud Rice Terraces Walk',
  'Seminyak Cooking Class',
  'Nusa Penida Snorkeling',
  'Uluwatu Temple Sunset',
  'Tegallalang Photo Tour',
  'Bali Swing Adventure',
  'Waterbom Water Park',
]

const MOCK_CATEGORIES = ['adventure', 'culture', 'wellness', 'food', 'nature']

function generateMockExperienceMetrics(): ExperiencePerformanceMetrics[] {
  const count = Math.floor(Math.random() * 5) + 3 // 3-7 experiences
  return MOCK_EXPERIENCE_TITLES.slice(0, count).map((title, index) => {
    const totalSlots = Math.floor(Math.random() * 100) + 20
    const bookedSlots = Math.floor(Math.random() * totalSlots)
    const utilization = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0
    const reviewCount = Math.floor(Math.random() * 50)

    return {
      experienceId: `exp-${index + 1}`,
      title,
      thumbnailUrl: `https://images.unsplash.com/photo-${1550000000000 + index * 1000}?w=100&h=100&fit=crop`,
      category: MOCK_CATEGORIES[index % MOCK_CATEGORIES.length] ?? 'adventure',
      bookingCount: Math.floor(Math.random() * 30) + 5,
      slotUtilization: utilization,
      totalSlots,
      bookedSlots,
      averageRating: reviewCount > 0 ? Math.round((Math.random() * 15 + 35)) / 10 : null, // 3.5-5.0
      reviewCount,
      revenue: Math.floor(Math.random() * 500000) + 50000, // $500-$5,500 in cents
    }
  })
}

function sortExperiences(
  experiences: ExperiencePerformanceMetrics[],
  sortBy: SortColumn,
  sortDir: SortDirection
): ExperiencePerformanceMetrics[] {
  return [...experiences].sort((a, b) => {
    let valueA: number | string | null
    let valueB: number | string | null

    switch (sortBy) {
      case 'title':
        valueA = a.title.toLowerCase()
        valueB = b.title.toLowerCase()
        break
      case 'bookingCount':
        valueA = a.bookingCount
        valueB = b.bookingCount
        break
      case 'slotUtilization':
        valueA = a.slotUtilization
        valueB = b.slotUtilization
        break
      case 'averageRating':
        valueA = a.averageRating ?? 0
        valueB = b.averageRating ?? 0
        break
      case 'revenue':
        valueA = a.revenue
        valueB = b.revenue
        break
      default:
        return 0
    }

    if (valueA < valueB) return sortDir === 'asc' ? -1 : 1
    if (valueA > valueB) return sortDir === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Get experience performance metrics for a vendor
 *
 * @param vendorId - The vendor's UUID
 * @param period - Time period for filtering metrics
 * @param sortBy - Column to sort by
 * @param sortDir - Sort direction
 */
export async function getExperiencePerformanceMetrics(
  vendorId: string,
  period: TimePeriod = '30d',
  sortBy: SortColumn = 'revenue',
  sortDir: SortDirection = 'desc'
): Promise<ExperiencePerformanceResponse> {
  const defaultResponse: ExperiencePerformanceResponse = {
    experiences: [],
    totals: {
      totalBookings: 0,
      averageUtilization: 0,
      totalRevenue: 0,
    },
  }

  if (USE_MOCK_DATA) {
    const mockExperiences = generateMockExperienceMetrics()
    const sorted = sortExperiences(mockExperiences, sortBy, sortDir)

    const totalBookings = sorted.reduce((sum, e) => sum + e.bookingCount, 0)
    const totalRevenue = sorted.reduce((sum, e) => sum + e.revenue, 0)
    const avgUtilization = sorted.length > 0
      ? Math.round(sorted.reduce((sum, e) => sum + e.slotUtilization, 0) / sorted.length)
      : 0

    return {
      experiences: sorted,
      totals: {
        totalBookings,
        averageUtilization: avgUtilization,
        totalRevenue,
      },
    }
  }

  const { startDate, endDate } = getDateRangeForPeriod(period)

  try {
    // 1. Get vendor's experiences with images
    const { data: experiences, error: expError } = await supabase
      .from('experiences')
      .select(`
        id,
        title,
        category,
        experience_images (
          image_url,
          display_order
        )
      `)
      .eq('vendor_id', vendorId)

    if (expError) {
      console.error('Error fetching experiences:', expError)
      return defaultResponse
    }

    if (!experiences || experiences.length === 0) {
      return defaultResponse
    }

    const experienceIds = experiences.map(e => e.id)

    // 2. Get slot utilization data
    const { data: slotData, error: slotError } = await supabase
      .from('experience_slots')
      .select('experience_id, total_capacity, available_count, slot_date')
      .in('experience_id', experienceIds)
      .gte('slot_date', startDate.toISOString().split('T')[0])
      .lte('slot_date', endDate.toISOString().split('T')[0])

    if (slotError) {
      console.error('Error fetching slots:', slotError)
    }

    // Aggregate slot data by experience
    const slotStats = new Map<string, { total: number; booked: number }>()
    for (const slot of slotData || []) {
      const existing = slotStats.get(slot.experience_id) || { total: 0, booked: 0 }
      const capacity = slot.total_capacity || 0
      const available = slot.available_count || 0
      slotStats.set(slot.experience_id, {
        total: existing.total + capacity,
        booked: existing.booked + (capacity - available),
      })
    }

    // 3. Get booking/revenue data via trip_items
    const { data: tripItems, error: tiError } = await supabase
      .from('trip_items')
      .select(`
        experience_id,
        trips!inner (
          bookings!inner (
            id,
            booked_at,
            payments (
              amount,
              status
            )
          )
        )
      `)
      .in('experience_id', experienceIds)

    if (tiError) {
      console.error('Error fetching trip items:', tiError)
    }

    // Aggregate booking and revenue by experience
    const bookingStats = new Map<string, { bookings: number; revenue: number }>()
    for (const item of tripItems || []) {
      const trip = item.trips
      if (!trip) continue

      const bookings = trip.bookings || []
      for (const booking of bookings) {
        const bookingDate = new Date(booking.booked_at)
        if (bookingDate < startDate || bookingDate > endDate) continue

        const existing = bookingStats.get(item.experience_id) || { bookings: 0, revenue: 0 }
        const payments = booking.payments || []
        const revenue = payments
          .filter((p: { status: string }) => p.status === 'succeeded')
          .reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0)

        bookingStats.set(item.experience_id, {
          bookings: existing.bookings + 1,
          revenue: existing.revenue + revenue,
        })
      }
    }

    // 4. Get review/rating data
    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select('experience_id, rating')
      .in('experience_id', experienceIds)

    if (reviewError) {
      console.error('Error fetching reviews:', reviewError)
    }

    // Aggregate reviews by experience
    const reviewStats = new Map<string, { sum: number; count: number }>()
    for (const review of reviews || []) {
      const existing = reviewStats.get(review.experience_id) || { sum: 0, count: 0 }
      reviewStats.set(review.experience_id, {
        sum: existing.sum + (review.rating || 0),
        count: existing.count + 1,
      })
    }

    // 5. Build metrics for each experience
    const metrics: ExperiencePerformanceMetrics[] = experiences.map(exp => {
      const images = exp.experience_images || []
      const sortedImages = [...images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      const thumbnail = sortedImages[0]?.image_url || null

      const slots = slotStats.get(exp.id) || { total: 0, booked: 0 }
      const booking = bookingStats.get(exp.id) || { bookings: 0, revenue: 0 }
      const review = reviewStats.get(exp.id) || { sum: 0, count: 0 }

      const utilization = slots.total > 0
        ? Math.round((slots.booked / slots.total) * 100)
        : 0
      const avgRating = review.count > 0
        ? Math.round((review.sum / review.count) * 10) / 10
        : null

      return {
        experienceId: exp.id,
        title: exp.title,
        thumbnailUrl: thumbnail,
        category: exp.category,
        bookingCount: booking.bookings,
        slotUtilization: utilization,
        totalSlots: slots.total,
        bookedSlots: slots.booked,
        averageRating: avgRating,
        reviewCount: review.count,
        revenue: booking.revenue,
      }
    })

    // Sort
    const sorted = sortExperiences(metrics, sortBy, sortDir)

    // Calculate totals
    const totalBookings = sorted.reduce((sum, e) => sum + e.bookingCount, 0)
    const totalRevenue = sorted.reduce((sum, e) => sum + e.revenue, 0)
    const avgUtilization = sorted.length > 0
      ? Math.round(sorted.reduce((sum, e) => sum + e.slotUtilization, 0) / sorted.length)
      : 0

    return {
      experiences: sorted,
      totals: {
        totalBookings,
        averageUtilization: avgUtilization,
        totalRevenue,
      },
    }
  } catch (err) {
    console.error('Error in getExperiencePerformanceMetrics:', err)
    return defaultResponse
  }
}

// ============================================================================
// Story 29.3: Payout History
// ============================================================================

const PAYOUT_STATUSES: PayoutStatus[] = ['paid', 'paid', 'paid', 'in_transit', 'pending']

function generateMockPayoutHistory(limit: number = 10): PayoutHistoryResponse {
  const payouts: PayoutRecord[] = []
  const now = Date.now()

  for (let i = 0; i < limit; i++) {
    const amount = Math.floor(Math.random() * 500000) + 50000 // $500-$5,500 in cents
    const fee = Math.round(amount * 0.029) // ~2.9% Stripe fee
    const status = PAYOUT_STATUSES[i % PAYOUT_STATUSES.length] ?? 'paid'
    const daysAgo = i * 7 + Math.floor(Math.random() * 3) // Weekly payouts with some variance

    payouts.push({
      id: `po_${Date.now()}_${i}`,
      amount,
      fee,
      net: amount - fee,
      currency: 'usd',
      status,
      arrivalDate: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
      createdAt: new Date(now - (daysAgo + 2) * 24 * 60 * 60 * 1000),
      stripePayoutId: `po_mock_${String(i).padStart(4, '0')}`,
      description: `Weekly payout - ${new Date(now - daysAgo * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    })
  }

  const totalPaid = payouts
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.net, 0)
  const totalPending = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.net, 0)
  const totalInTransit = payouts
    .filter(p => p.status === 'in_transit')
    .reduce((sum, p) => sum + p.net, 0)

  return {
    payouts,
    hasMore: limit < 20, // Simulate having more data
    totalCount: 20,
    summary: {
      totalPaid,
      totalPending,
      totalInTransit,
    },
  }
}

/**
 * Get payout history from Stripe Connect
 *
 * @param vendorId - The vendor's UUID
 * @param limit - Number of payouts to fetch (default 10)
 * @param offset - Pagination offset (default 0)
 */
export async function getPayoutHistory(
  vendorId: string,
  limit: number = 10,
  offset: number = 0
): Promise<PayoutHistoryResponse> {
  const defaultResponse: PayoutHistoryResponse = {
    payouts: [],
    hasMore: false,
    totalCount: 0,
    summary: {
      totalPaid: 0,
      totalPending: 0,
      totalInTransit: 0,
    },
  }

  if (USE_MOCK_DATA) {
    return generateMockPayoutHistory(limit)
  }

  try {
    const { data, error } = await supabase.functions.invoke('vendor-payout-status', {
      body: { vendorId },
    })

    if (error) {
      console.error('Error fetching payout history:', error)
      return defaultResponse
    }

    // Transform edge function response to PayoutRecord format
    const payouts: PayoutRecord[] = []

    // Process pending payouts
    for (const payout of data?.pending || []) {
      payouts.push({
        id: payout.stripe_transfer_id || `pending_${payouts.length}`,
        amount: payout.amount,
        fee: Math.round(payout.amount * 0.029), // Estimate fee
        net: Math.round(payout.amount * 0.971),
        currency: payout.currency || 'usd',
        status: 'pending',
        arrivalDate: new Date(payout.arrival_date * 1000),
        createdAt: new Date(payout.arrival_date * 1000 - 2 * 24 * 60 * 60 * 1000),
        stripePayoutId: payout.stripe_transfer_id || '',
      })
    }

    // Process in-transit payouts
    for (const payout of data?.scheduled || []) {
      payouts.push({
        id: payout.stripe_transfer_id,
        amount: payout.amount,
        fee: Math.round(payout.amount * 0.029),
        net: Math.round(payout.amount * 0.971),
        currency: payout.currency || 'usd',
        status: 'in_transit',
        arrivalDate: new Date(payout.arrival_date * 1000),
        createdAt: new Date(payout.arrival_date * 1000 - 2 * 24 * 60 * 60 * 1000),
        stripePayoutId: payout.stripe_transfer_id,
      })
    }

    // Process completed payouts
    for (const payout of data?.completed || []) {
      payouts.push({
        id: payout.stripe_transfer_id,
        amount: payout.amount,
        fee: Math.round(payout.amount * 0.029),
        net: Math.round(payout.amount * 0.971),
        currency: payout.currency || 'usd',
        status: 'paid',
        arrivalDate: new Date(payout.arrival_date * 1000),
        createdAt: new Date(payout.arrival_date * 1000 - 2 * 24 * 60 * 60 * 1000),
        stripePayoutId: payout.stripe_transfer_id,
      })
    }

    // Sort by arrival date descending (most recent first)
    payouts.sort((a, b) => b.arrivalDate.getTime() - a.arrivalDate.getTime())

    // Apply pagination
    const paginated = payouts.slice(offset, offset + limit)

    const totalPaid = payouts
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.net, 0)
    const totalPending = payouts
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.net, 0)
    const totalInTransit = payouts
      .filter(p => p.status === 'in_transit')
      .reduce((sum, p) => sum + p.net, 0)

    return {
      payouts: paginated,
      hasMore: offset + limit < payouts.length,
      totalCount: payouts.length,
      summary: {
        totalPaid,
        totalPending,
        totalInTransit,
      },
    }
  } catch (err) {
    console.error('Error in getPayoutHistory:', err)
    return defaultResponse
  }
}

/**
 * Export payout history to CSV format
 */
export function exportPayoutsToCSV(payouts: PayoutRecord[]): string {
  const headers = ['Date', 'Status', 'Gross Amount', 'Fee', 'Net Amount', 'Currency', 'Payout ID']
  const rows = payouts.map(p => [
    p.arrivalDate.toISOString().split('T')[0],
    p.status,
    (p.amount / 100).toFixed(2),
    (p.fee / 100).toFixed(2),
    (p.net / 100).toFixed(2),
    p.currency.toUpperCase(),
    p.stripePayoutId,
  ])

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

/**
 * Format payout status for display
 */
export function formatPayoutStatus(status: PayoutStatus): { label: string; color: string } {
  switch (status) {
    case 'paid':
      return { label: 'Completed', color: 'green' }
    case 'in_transit':
      return { label: 'In Transit', color: 'blue' }
    case 'pending':
      return { label: 'Pending', color: 'yellow' }
    case 'failed':
      return { label: 'Failed', color: 'red' }
    case 'canceled':
      return { label: 'Canceled', color: 'gray' }
    default:
      return { label: status, color: 'gray' }
  }
}
