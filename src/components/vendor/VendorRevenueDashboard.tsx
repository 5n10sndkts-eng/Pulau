/**
 * Vendor Revenue Dashboard
 * Story: 29.1 - Create Vendor Revenue Dashboard
 *
 * Displays revenue metrics, trends, and payout information for vendors.
 * Uses Recharts for data visualization and TanStack Query for data fetching.
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  BarChart3,
  LineChartIcon,
  AlertCircle,
} from 'lucide-react'
import { VendorSession, Experience } from '@/lib/types'
import { vendorService } from '@/lib/vendorService'
import {
  getVendorRevenueStats,
  getRevenueByDateRange,
  formatCurrency,
  TimePeriod,
  VendorRevenueStats,
  RevenueDataPoint,
} from '@/lib/vendorAnalyticsService'
import { RevenueSummaryCard } from './RevenueSummaryCard'
import { RevenueChart } from './RevenueChart'
import { ExperiencePerformanceTable } from './ExperiencePerformanceTable'

// Error fallback for chart rendering failures
function ChartErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4 opacity-50" />
        <p className="text-destructive font-medium mb-2">Chart failed to render</p>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
          Try Again
        </Button>
      </div>
    </div>
  )
}

interface VendorRevenueDashboardProps {
  session: VendorSession
  onBack: () => void
}

// Time period options
const TIME_PERIODS: { value: TimePeriod; label: string; description: string }[] = [
  { value: '7d', label: '7 Days', description: 'Last 7 days' },
  { value: '30d', label: '30 Days', description: 'Last 30 days' },
  { value: '90d', label: '90 Days', description: 'Last 90 days' },
  { value: '12m', label: '12 Months', description: 'Last 12 months' },
]

export function VendorRevenueDashboard({
  session,
  onBack,
}: VendorRevenueDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d')
  const [selectedExperience, setSelectedExperience] = useState<string>('all')
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  // Fetch revenue stats - includes experienceId filter
  const {
    data: stats,
    isLoading: statsLoading,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useQuery<VendorRevenueStats>({
    queryKey: ['vendor-revenue-stats', session.vendorId, selectedPeriod, selectedExperience],
    queryFn: () => getVendorRevenueStats(
      session.vendorId,
      selectedPeriod,
      selectedExperience !== 'all' ? selectedExperience : undefined
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch revenue chart data
  const {
    data: chartData,
    isLoading: chartLoading,
    isFetching: chartFetching,
    refetch: refetchChart,
  } = useQuery<RevenueDataPoint[]>({
    queryKey: [
      'vendor-revenue-chart',
      session.vendorId,
      selectedPeriod,
      selectedExperience,
    ],
    queryFn: () =>
      getRevenueByDateRange(
        session.vendorId,
        selectedPeriod,
        selectedExperience !== 'all' ? selectedExperience : undefined
      ),
    staleTime: 5 * 60 * 1000,
  })

  // Track if any data is being refreshed
  const isRefreshing = statsFetching || chartFetching

  // Fetch vendor's experiences for filter
  const { data: experiences = [] } = useQuery<Experience[]>({
    queryKey: ['vendor-experiences', session.vendorId],
    queryFn: () => vendorService.getVendorExperiences(session.vendorId),
    staleTime: 10 * 60 * 1000,
  })

  const handleRefresh = () => {
    refetchStats()
    refetchChart()
  }

  const selectedPeriodInfo = TIME_PERIODS.find((p) => p.value === selectedPeriod)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-display font-bold">
                  Revenue Dashboard
                </h1>
                <p className="text-white/80 text-sm">
                  {session.businessName} • {selectedPeriodInfo?.description}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white/20 hover:bg-white/30 text-white border-none"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RevenueSummaryCard
            title="Total Revenue"
            amount={stats?.totalRevenue || 0}
            icon={DollarSign}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            isLoading={statsLoading}
          />
          <RevenueSummaryCard
            title="This Month"
            amount={stats?.revenueThisMonth || 0}
            percentChange={stats?.periodComparison.percentChange}
            icon={TrendingUp}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            isLoading={statsLoading}
          />
          <RevenueSummaryCard
            title="Pending Payouts"
            amount={stats?.pendingPayouts || 0}
            icon={Clock}
            iconBgColor="bg-yellow-100"
            iconColor="text-yellow-600"
            isLoading={statsLoading}
          />
          <RevenueSummaryCard
            title="Completed Payouts"
            amount={stats?.completedPayouts || 0}
            icon={CheckCircle}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            isLoading={statsLoading}
          />
        </div>

        {/* Chart Section */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-display font-bold">Revenue Trends</h2>

            <div className="flex flex-wrap items-center gap-3">
              {/* Time Period Selector */}
              <div className="flex rounded-lg border p-1" role="tablist" aria-label="Time period">
                {TIME_PERIODS.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    role="tab"
                    aria-selected={selectedPeriod === period.value}
                    aria-label={period.description}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      selectedPeriod === period.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {/* Experience Filter */}
              <Select
                value={selectedExperience}
                onValueChange={setSelectedExperience}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Experiences" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experiences</SelectItem>
                  {experiences.map((exp) => (
                    <SelectItem key={exp.id} value={exp.id}>
                      {exp.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Chart Type Toggle */}
              <div className="flex rounded-lg border p-1" role="group" aria-label="Chart type">
                <button
                  onClick={() => setChartType('line')}
                  aria-pressed={chartType === 'line'}
                  aria-label="Line chart"
                  className={`p-2 rounded-md transition-colors ${
                    chartType === 'line'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LineChartIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  aria-pressed={chartType === 'bar'}
                  aria-label="Bar chart"
                  className={`p-2 rounded-md transition-colors ${
                    chartType === 'bar'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[350px]">
            <ErrorBoundary FallbackComponent={ChartErrorFallback}>
              <RevenueChart
                data={chartData}
                isLoading={chartLoading}
                chartType={chartType}
                selectedPeriod={selectedPeriod}
              />
            </ErrorBoundary>
          </div>
        </Card>

        {/* Period Comparison Card */}
        {stats && stats.periodComparison.previousPeriod > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-display font-semibold mb-4">
              Period Comparison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Current Period</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.revenueThisMonth)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Previous Period</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.periodComparison.previousPeriod)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Change</p>
                <p
                  className={`text-2xl font-bold flex items-center gap-2 ${
                    stats.periodComparison.percentChange >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stats.periodComparison.percentChange >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  {stats.periodComparison.percentChange >= 0 ? '+' : ''}
                  {stats.periodComparison.percentChange}%
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Experience Performance Table (Story 29.2) */}
        <ExperiencePerformanceTable
          session={session}
          selectedPeriod={selectedPeriod}
        />
      </div>
    </div>
  )
}
