/**
 * Revenue Summary Card Component
 * Story: 29.1 - Create Vendor Revenue Dashboard
 *
 * Displays individual revenue metrics with trend indicators.
 */

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'
import { formatCurrency, formatPercentChange } from '@/lib/vendorAnalyticsService'

interface RevenueSummaryCardProps {
  title: string
  amount: number
  percentChange?: number
  icon: LucideIcon
  iconBgColor: string
  iconColor: string
  isLoading: boolean
}

export function RevenueSummaryCard({
  title,
  amount,
  percentChange,
  icon: Icon,
  iconBgColor,
  iconColor,
  isLoading,
}: RevenueSummaryCardProps) {
  const hasChange = percentChange !== undefined && percentChange !== 0

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(amount)}</p>
          {hasChange && (
            <p
              className={`text-xs mt-1 flex items-center gap-1 ${
                percentChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {percentChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatPercentChange(percentChange)} vs previous period
            </p>
          )}
        </div>
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center ${iconBgColor}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </Card>
  )
}
