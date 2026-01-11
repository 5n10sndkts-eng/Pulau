/**
 * Experience Performance Table Component
 * Story: 29.2 - Build Experience Performance Metrics
 *
 * Displays sortable table of experience performance metrics with
 * booking counts, slot utilization, ratings, and revenue.
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  Package,
  RefreshCw,
} from 'lucide-react'
import { VendorSession } from '@/lib/types'
import {
  getExperiencePerformanceMetrics,
  formatCurrency,
  TimePeriod,
  SortColumn,
  SortDirection,
  ExperiencePerformanceMetrics,
} from '@/lib/vendorAnalyticsService'
import { cn } from '@/lib/utils'

// ============================================================================
// UtilizationBar Component
// ============================================================================

interface UtilizationBarProps {
  percentage: number
  className?: string
}

function UtilizationBar({ percentage, className }: UtilizationBarProps) {
  const getColorClass = (pct: number) => {
    if (pct >= 70) return 'bg-green-500'
    if (pct >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getColorClass(percentage))}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className="text-sm font-medium w-10 text-right">{percentage}%</span>
    </div>
  )
}

// ============================================================================
// Table Header Component
// ============================================================================

interface SortableHeaderProps {
  label: string
  column: SortColumn
  currentSort: SortColumn
  currentDir: SortDirection
  onSort: (column: SortColumn) => void
  className?: string
}

function SortableHeader({
  label,
  column,
  currentSort,
  currentDir,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = currentSort === column

  return (
    <button
      onClick={() => onSort(column)}
      className={cn(
        'flex items-center gap-1 font-medium text-sm hover:text-primary transition-colors',
        isActive ? 'text-primary' : 'text-muted-foreground',
        className
      )}
      aria-label={`Sort by ${label}`}
    >
      {label}
      {isActive ? (
        currentDir === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      )}
    </button>
  )
}

// ============================================================================
// Table Row Component
// ============================================================================

interface TableRowProps {
  experience: ExperiencePerformanceMetrics
}

function TableRow({ experience }: TableRowProps) {
  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      {/* Experience */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          {experience.thumbnailUrl ? (
            <img
              src={experience.thumbnailUrl}
              alt=""
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium truncate">{experience.title}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {experience.category}
            </p>
          </div>
        </div>
      </td>

      {/* Bookings */}
      <td className="py-4 px-4 text-center">
        <span className="font-semibold">{experience.bookingCount}</span>
      </td>

      {/* Utilization */}
      <td className="py-4 px-4">
        <UtilizationBar percentage={experience.slotUtilization} />
      </td>

      {/* Rating */}
      <td className="py-4 px-4">
        {experience.averageRating !== null ? (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{experience.averageRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              ({experience.reviewCount})
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">No reviews</span>
        )}
      </td>

      {/* Revenue */}
      <td className="py-4 px-4 text-right">
        <span className="font-semibold">{formatCurrency(experience.revenue)}</span>
      </td>
    </tr>
  )
}

// ============================================================================
// Skeleton Loading
// ============================================================================

function TableSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <tr key={i} className="border-b animate-pulse">
          <td className="py-4 px-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
          </td>
          <td className="py-4 px-4 text-center">
            <div className="h-4 w-8 bg-muted rounded mx-auto" />
          </td>
          <td className="py-4 px-4">
            <div className="h-2 bg-muted rounded-full" />
          </td>
          <td className="py-4 px-4">
            <div className="h-4 w-16 bg-muted rounded" />
          </td>
          <td className="py-4 px-4 text-right">
            <div className="h-4 w-16 bg-muted rounded ml-auto" />
          </td>
        </tr>
      ))}
    </>
  )
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState() {
  return (
    <tr>
      <td colSpan={5} className="py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No experiences found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first experience to see performance metrics
        </p>
      </td>
    </tr>
  )
}

// ============================================================================
// Main Component
// ============================================================================

interface ExperiencePerformanceTableProps {
  session: VendorSession
  selectedPeriod: TimePeriod
}

export function ExperiencePerformanceTable({
  session,
  selectedPeriod,
}: ExperiencePerformanceTableProps) {
  const [sortBy, setSortBy] = useState<SortColumn>('revenue')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const {
    data,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['experience-performance', session.vendorId, selectedPeriod, sortBy, sortDir],
    queryFn: () => getExperiencePerformanceMetrics(
      session.vendorId,
      selectedPeriod,
      sortBy,
      sortDir
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      // Toggle direction
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, default to desc
      setSortBy(column)
      setSortDir('desc')
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold">Experience Performance</h3>
        {isFetching && !isLoading && (
          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="py-3 px-4 text-left">
                <SortableHeader
                  label="Experience"
                  column="title"
                  currentSort={sortBy}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
              </th>
              <th className="py-3 px-4 text-center">
                <SortableHeader
                  label="Bookings"
                  column="bookingCount"
                  currentSort={sortBy}
                  currentDir={sortDir}
                  onSort={handleSort}
                  className="justify-center"
                />
              </th>
              <th className="py-3 px-4">
                <SortableHeader
                  label="Utilization"
                  column="slotUtilization"
                  currentSort={sortBy}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
              </th>
              <th className="py-3 px-4">
                <SortableHeader
                  label="Rating"
                  column="averageRating"
                  currentSort={sortBy}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
              </th>
              <th className="py-3 px-4 text-right">
                <SortableHeader
                  label="Revenue"
                  column="revenue"
                  currentSort={sortBy}
                  currentDir={sortDir}
                  onSort={handleSort}
                  className="justify-end"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton />
            ) : !data?.experiences.length ? (
              <EmptyState />
            ) : (
              data.experiences.map((exp) => (
                <TableRow key={exp.experienceId} experience={exp} />
              ))
            )}
          </tbody>
          {data && data.experiences.length > 0 && (
            <tfoot className="bg-muted/30 font-medium">
              <tr>
                <td className="py-3 px-4">
                  Totals ({data.experiences.length} experiences)
                </td>
                <td className="py-3 px-4 text-center">
                  {data.totals.totalBookings}
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm">
                    Avg: {data.totals.averageUtilization}%
                  </span>
                </td>
                <td className="py-3 px-4">—</td>
                <td className="py-3 px-4 text-right">
                  {formatCurrency(data.totals.totalRevenue)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Card>
  )
}
