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
