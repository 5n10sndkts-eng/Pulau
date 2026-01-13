/**
 * Booking Funnel Chart Component
 * Story: 29.4 - Create Booking Funnel Analytics
 *
 * Displays a funnel visualization showing conversion rates
 * from views through to confirmed bookings.
 */

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import {
  FunnelChart,
  Funnel,
  Cell,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { VendorSession } from '@/lib/types';
import {
  getBookingFunnel,
  formatConversionRate,
  TimePeriod,
  FunnelData,
  FunnelStage,
} from '@/lib/vendorAnalyticsService';
import { cn } from '@/lib/utils';

// ============================================================================
// Custom Label Component for Funnel
// ============================================================================

interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  name?: string;
}

function CustomLabel({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  value,
  name,
}: CustomLabelProps) {
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-sm font-semibold fill-white"
    >
      {value?.toLocaleString()}
    </text>
  );
}

// ============================================================================
// Conversion Badge Component
// ============================================================================

interface ConversionBadgeProps {
  rate: number;
  label: string;
  isGood?: boolean;
}

function ConversionBadge({ rate, label, isGood }: ConversionBadgeProps) {
  const colorClass = isGood
    ? 'text-green-600 bg-green-50'
    : 'text-yellow-600 bg-yellow-50';
  const Icon = isGood ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        colorClass,
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{formatConversionRate(rate)}</span>
      <span className="text-muted-foreground hidden sm:inline">{label}</span>
    </div>
  );
}

// ============================================================================
// Funnel Stage Icon
// ============================================================================

function getStageIcon(stageName: string) {
  switch (stageName) {
    case 'Views':
      return Eye;
    case 'Add to Trip':
      return ShoppingCart;
    case 'Checkout':
      return CreditCard;
    case 'Confirmed':
      return CheckCircle;
    default:
      return Eye;
  }
}

// ============================================================================
// Stage Details Component
// ============================================================================

interface StageDetailsProps {
  stages: FunnelStage[];
}

function StageDetails({ stages }: StageDetailsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
      {stages.map((stage, index) => {
        const Icon = getStageIcon(stage.name);
        const isFirst = index === 0;

        return (
          <div key={stage.name} className="text-center">
            <div
              className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-2"
              style={{ backgroundColor: `${stage.fill}20` }}
            >
              <Icon className="h-5 w-5" style={{ color: stage.fill }} />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {stage.name}
            </p>
            <p className="text-lg font-bold">{stage.value.toLocaleString()}</p>
            {!isFirst && stage.conversionFromPrevious !== undefined && (
              <p className="text-xs text-muted-foreground">
                {formatConversionRate(stage.conversionFromPrevious)} conv.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Custom Tooltip
// ============================================================================

interface TooltipPayload {
  payload: FunnelStage;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;

  const stage = payload[0]?.payload;
  if (!stage) return null;

  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold">{stage.name}</p>
      <p className="text-muted-foreground">
        Count:{' '}
        <span className="font-medium text-foreground">
          {stage.value.toLocaleString()}
        </span>
      </p>
      {stage.conversionFromPrevious !== undefined && (
        <p className="text-muted-foreground">
          Conversion:{' '}
          <span className="font-medium text-foreground">
            {formatConversionRate(stage.conversionFromPrevious)}
          </span>
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Skeleton Loading
// ============================================================================

function FunnelSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[250px] flex items-center justify-center">
        <div className="w-full max-w-[300px] space-y-2">
          <div className="h-12 bg-muted rounded-lg w-full" />
          <div className="h-10 bg-muted rounded-lg w-5/6 mx-auto" />
          <div className="h-8 bg-muted rounded-lg w-4/6 mx-auto" />
          <div className="h-6 bg-muted rounded-lg w-3/6 mx-auto" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="w-10 h-10 rounded-full bg-muted mx-auto mb-2" />
            <div className="h-3 w-16 bg-muted rounded mx-auto mb-1" />
            <div className="h-5 w-12 bg-muted rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState() {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No funnel data available</p>
        <p className="text-sm text-muted-foreground mt-1">
          Data will appear once you have visitor activity
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface BookingFunnelChartProps {
  session: VendorSession;
  selectedPeriod: TimePeriod;
}

export function BookingFunnelChart({
  session,
  selectedPeriod,
}: BookingFunnelChartProps) {
  const { data, isLoading, isFetching } = useQuery<FunnelData>({
    queryKey: ['booking-funnel', session.vendorId, selectedPeriod],
    queryFn: () => getBookingFunnel(session.vendorId, selectedPeriod),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const hasData = data && data.stages.some((s) => s.value > 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-display font-semibold">Booking Funnel</h3>
          <p className="text-sm text-muted-foreground">
            {data?.periodLabel || 'Conversion rates from views to bookings'}
          </p>
        </div>
        {isFetching && !isLoading && (
          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isLoading ? (
        <FunnelSkeleton />
      ) : !hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* Overall Conversion Summary */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <ConversionBadge
              rate={data!.conversionRates.viewsToAddToTrip}
              label="to cart"
              isGood={data!.conversionRates.viewsToAddToTrip >= 15}
            />
            <span className="text-muted-foreground">→</span>
            <ConversionBadge
              rate={data!.conversionRates.addToTripToCheckout}
              label="to checkout"
              isGood={data!.conversionRates.addToTripToCheckout >= 40}
            />
            <span className="text-muted-foreground">→</span>
            <ConversionBadge
              rate={data!.conversionRates.checkoutToConfirmed}
              label="confirmed"
              isGood={data!.conversionRates.checkoutToConfirmed >= 70}
            />
          </div>

          {/* Funnel Chart */}
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip content={<CustomTooltip />} />
                <Funnel dataKey="value" data={data!.stages} isAnimationActive>
                  {data!.stages.map((stage, index) => (
                    <Cell key={`cell-${index}`} fill={stage.fill} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="center"
                    content={<CustomLabel />}
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* Stage Details */}
          <StageDetails stages={data!.stages} />

          {/* Overall Conversion */}
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Overall Conversion Rate
            </p>
            <p className="text-2xl font-bold text-primary">
              {formatConversionRate(data!.conversionRates.overallConversion)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              From {data!.stages[0]?.value.toLocaleString()} views to{' '}
              {data!.stages[3]?.value.toLocaleString()} confirmed bookings
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
