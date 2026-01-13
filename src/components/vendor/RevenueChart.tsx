/**
 * Revenue Chart Component
 * Story: 29.1 - Create Vendor Revenue Dashboard
 *
 * Time series chart for revenue visualization with line/bar toggle.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  TooltipProps,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { RefreshCw, BarChart3 } from 'lucide-react';
import {
  formatCurrency,
  RevenueDataPoint,
  TimePeriod,
} from '@/lib/vendorAnalyticsService';

interface RevenueChartProps {
  data: RevenueDataPoint[] | undefined;
  isLoading: boolean;
  chartType: 'line' | 'bar';
  selectedPeriod: TimePeriod;
}

// Properly typed tooltip props
interface ChartTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    payload: RevenueDataPoint;
    value: number;
  }>;
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const firstPayload = payload[0];
  if (!firstPayload) return null;

  const data = firstPayload.payload;

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium">
        {format(parseISO(data.date), 'MMM d, yyyy')}
      </p>
      <p className="text-lg font-bold text-primary">
        {formatCurrency(data.amount)}
      </p>
      <p className="text-xs text-muted-foreground">
        {data.bookingCount} booking{data.bookingCount !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// Format date for X-axis based on period
function formatXAxisDate(dateStr: string, period: TimePeriod): string {
  const date = parseISO(dateStr);
  switch (period) {
    case '7d':
      return format(date, 'EEE');
    case '30d':
      return format(date, 'MMM d');
    case '90d':
      return format(date, 'MMM d');
    case '12m':
      return format(date, 'MMM yyyy');
    default:
      return format(date, 'MMM d');
  }
}

export function RevenueChart({
  data,
  isLoading,
  chartType,
  selectedPeriod,
}: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            No revenue data for this period
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartType === 'line' ? (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => formatXAxisDate(date, selectedPeriod)}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      ) : (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => formatXAxisDate(date, selectedPeriod)}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar
            dataKey="amount"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
