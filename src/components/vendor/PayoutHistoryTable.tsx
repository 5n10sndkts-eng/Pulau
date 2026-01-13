/**
 * Payout History Table Component
 * Story: 29.3 - Implement Payout History Table
 *
 * Displays vendor payout history from Stripe Connect with
 * status badges, amounts, dates, and export functionality.
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Download,
  ExternalLink,
  RefreshCw,
  Wallet,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Ban,
} from 'lucide-react';
import { VendorSession } from '@/lib/types';
import {
  getPayoutHistory,
  exportPayoutsToCSV,
  formatPayoutStatus,
  formatCurrency,
  PayoutRecord,
  PayoutStatus as PayoutStatusType,
  PayoutHistoryResponse,
} from '@/lib/vendorAnalyticsService';
import { cn } from '@/lib/utils';

// ============================================================================
// Status Badge Component
// ============================================================================

interface StatusBadgeProps {
  status: PayoutStatusType;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const { label, color } = formatPayoutStatus(status);

  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const iconMap: Record<PayoutStatusType, typeof CheckCircle> = {
    paid: CheckCircle,
    in_transit: Truck,
    pending: Clock,
    failed: XCircle,
    canceled: Ban,
  };

  const Icon = iconMap[status] || Clock;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        colorClasses[color] || colorClasses.gray,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ============================================================================
// Table Row Component
// ============================================================================

interface PayoutRowProps {
  payout: PayoutRecord;
}

function PayoutRow({ payout }: PayoutRowProps) {
  // Format date relative to now
  const formatRelativeDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // For future dates (pending/in_transit)
  const formatFutureDate = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const dateDisplay =
    payout.status === 'paid'
      ? formatRelativeDate(payout.arrivalDate)
      : formatFutureDate(payout.arrivalDate);

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      {/* Status */}
      <td className="py-4 px-4">
        <StatusBadge status={payout.status} />
      </td>

      {/* Date */}
      <td className="py-4 px-4">
        <div>
          <p className="font-medium">{dateDisplay}</p>
          <p className="text-xs text-muted-foreground">
            {payout.arrivalDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </td>

      {/* Gross Amount */}
      <td className="py-4 px-4 text-right">
        <span className="font-medium">
          {formatCurrency(payout.amount, payout.currency)}
        </span>
      </td>

      {/* Fee */}
      <td className="py-4 px-4 text-right text-muted-foreground">
        -{formatCurrency(payout.fee, payout.currency)}
      </td>

      {/* Net Amount */}
      <td className="py-4 px-4 text-right">
        <span className="font-semibold text-green-600">
          {formatCurrency(payout.net, payout.currency)}
        </span>
      </td>

      {/* Payout ID */}
      <td className="py-4 px-4 text-xs text-muted-foreground font-mono">
        {payout.stripePayoutId.slice(0, 12)}...
      </td>
    </tr>
  );
}

// ============================================================================
// Skeleton Loading
// ============================================================================

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b animate-pulse">
          <td className="py-4 px-4">
            <div className="h-6 w-24 bg-muted rounded-full" />
          </td>
          <td className="py-4 px-4">
            <div className="space-y-1">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          </td>
          <td className="py-4 px-4 text-right">
            <div className="h-4 w-16 bg-muted rounded ml-auto" />
          </td>
          <td className="py-4 px-4 text-right">
            <div className="h-4 w-12 bg-muted rounded ml-auto" />
          </td>
          <td className="py-4 px-4 text-right">
            <div className="h-4 w-16 bg-muted rounded ml-auto" />
          </td>
          <td className="py-4 px-4">
            <div className="h-3 w-24 bg-muted rounded" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState() {
  return (
    <tr>
      <td colSpan={6} className="py-12 text-center">
        <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No payouts yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Payouts will appear here once you receive bookings
        </p>
      </td>
    </tr>
  );
}

// ============================================================================
// Summary Cards
// ============================================================================

interface SummaryProps {
  summary: PayoutHistoryResponse['summary'];
  isLoading: boolean;
}

function PayoutSummary({ summary, isLoading }: SummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-4 animate-pulse">
            <div className="h-3 w-16 bg-muted rounded mb-2" />
            <div className="h-6 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-green-50 border border-green-100 rounded-lg p-4">
        <p className="text-xs text-green-600 font-medium mb-1">Completed</p>
        <p className="text-lg font-bold text-green-700">
          {formatCurrency(summary.totalPaid)}
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-xs text-blue-600 font-medium mb-1">In Transit</p>
        <p className="text-lg font-bold text-blue-700">
          {formatCurrency(summary.totalInTransit)}
        </p>
      </div>
      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
        <p className="text-xs text-yellow-600 font-medium mb-1">Pending</p>
        <p className="text-lg font-bold text-yellow-700">
          {formatCurrency(summary.totalPending)}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface PayoutHistoryTableProps {
  session: VendorSession;
}

export function PayoutHistoryTable({ session }: PayoutHistoryTableProps) {
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isFetching, refetch } =
    useQuery<PayoutHistoryResponse>({
      queryKey: ['payout-history', session.vendorId, limit],
      queryFn: () => getPayoutHistory(session.vendorId, limit),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  const handleLoadMore = useCallback(() => {
    setLimit((prev) => prev + 10);
  }, []);

  const handleExport = useCallback(() => {
    if (!data?.payouts.length) return;

    const csv = exportPayoutsToCSV(data.payouts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payouts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data]);

  const handleOpenStripeDashboard = useCallback(() => {
    window.open('https://connect.stripe.com/express_login', '_blank');
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-display font-semibold">
              Payout History
            </h3>
            {isFetching && !isLoading && (
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!data?.payouts.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenStripeDashboard}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Stripe Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <PayoutSummary
          summary={
            data?.summary || {
              totalPaid: 0,
              totalPending: 0,
              totalInTransit: 0,
            }
          }
          isLoading={isLoading}
        />

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">
                  Gross
                </th>
                <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">
                  Fee
                </th>
                <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">
                  Net
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                  ID
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton />
              ) : !data?.payouts.length ? (
                <EmptyState />
              ) : (
                data.payouts.map((payout) => (
                  <PayoutRow key={payout.id} payout={payout} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load More / Pagination */}
        {data?.hasMore && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isFetching}
            >
              {isFetching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More ({data.totalCount - data.payouts.length} remaining)
                </>
              )}
            </Button>
          </div>
        )}

        {/* Footer info */}
        {data?.payouts.length ? (
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Showing {data.payouts.length} of {data.totalCount} payouts
          </div>
        ) : null}
      </div>
    </Card>
  );
}
