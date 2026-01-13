/**
 * Admin Monitoring Dashboard
 * Story: 32.4 - Build Admin Monitoring Dashboard
 *
 * Displays system health, error rates, API latency, and active user metrics.
 * Integrates with health-check endpoint and shows real-time status.
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  RefreshCw,
  Server,
  CreditCard,
  XCircle,
  TrendingUp,
  Users,
  ShoppingCart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

type ServiceStatus = 'healthy' | 'unhealthy';
type OverallStatus = 'healthy' | 'degraded' | 'unhealthy';

interface ServiceCheck {
  status: ServiceStatus;
  latency_ms?: number;
  error?: string;
}

interface HealthCheckResult {
  status: OverallStatus;
  timestamp: string;
  version: string;
  duration_ms: number;
  environment: string;
  checks: {
    database: ServiceCheck;
    stripe: ServiceCheck;
    edge_functions: ServiceCheck;
  };
}

interface SystemMetrics {
  activeUsers: number;
  bookingsToday: number;
  revenueToday: number;
  errorRate: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function getStatusColor(status: ServiceStatus | OverallStatus): string {
  switch (status) {
    case 'healthy':
      return 'text-success';
    case 'degraded':
      return 'text-yellow-500';
    case 'unhealthy':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

function getStatusBadge(status: ServiceStatus | OverallStatus) {
  switch (status) {
    case 'healthy':
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          Healthy
        </Badge>
      );
    case 'degraded':
      return (
        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
          Degraded
        </Badge>
      );
    case 'unhealthy':
      return <Badge variant="destructive">Unhealthy</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

function getStatusIcon(status: ServiceStatus | OverallStatus) {
  switch (status) {
    case 'healthy':
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    case 'degraded':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'unhealthy':
      return <XCircle className="w-5 h-5 text-destructive" />;
    default:
      return <Clock className="w-5 h-5 text-muted-foreground" />;
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MonitoringDashboard() {
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch health status
  const fetchHealth = async () => {
    try {
      const { data, error: funcError } =
        await supabase.functions.invoke('health-check');

      if (funcError) throw funcError;

      setHealth(data as HealthCheckResult);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch health status:', err);
      setError('Failed to fetch system health');
    }
  };

  // Fetch metrics from database
  const fetchMetrics = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get bookings count for today
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get revenue for today
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'succeeded')
        .gte('created_at', today.toISOString());

      const totalRevenue =
        payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Get active users (sessions in last hour - approximation)
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { count: activeCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', hourAgo.toISOString());

      setMetrics({
        activeUsers: activeCount || 0,
        bookingsToday: bookingsCount || 0,
        revenueToday: totalRevenue / 100, // Convert cents to dollars
        errorRate: 0, // Would come from Sentry API in production
      });
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  // Initial load and refresh
  const refresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchHealth(), fetchMetrics()]);
    setLastRefresh(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    refresh();

    // Auto-refresh every 30 seconds
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system health and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastRefresh && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={refresh} disabled={isLoading} variant="outline">
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overall Status Banner */}
      {health && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            className={`p-6 ${
              health.status === 'healthy'
                ? 'bg-success/5 border-success/20'
                : health.status === 'degraded'
                  ? 'bg-yellow-500/5 border-yellow-500/20'
                  : 'bg-destructive/5 border-destructive/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(health.status)}
                <div>
                  <h2 className="font-display text-xl font-bold">
                    System Status:{' '}
                    {health.status.charAt(0).toUpperCase() +
                      health.status.slice(1)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Environment: {health.environment} | Version:{' '}
                    {health.version}
                  </p>
                </div>
              </div>
              {getStatusBadge(health.status)}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Users"
          value={metrics?.activeUsers ?? '-'}
          icon={<Users className="w-5 h-5" />}
          description="Users active in last hour"
        />
        <MetricCard
          title="Bookings Today"
          value={metrics?.bookingsToday ?? '-'}
          icon={<ShoppingCart className="w-5 h-5" />}
          description="Completed bookings"
        />
        <MetricCard
          title="Revenue Today"
          value={
            metrics?.revenueToday !== undefined
              ? `$${metrics.revenueToday.toLocaleString()}`
              : '-'
          }
          icon={<TrendingUp className="w-5 h-5" />}
          description="Total revenue processed"
        />
        <MetricCard
          title="Error Rate"
          value={
            metrics?.errorRate !== undefined ? `${metrics.errorRate}%` : '-'
          }
          icon={<AlertTriangle className="w-5 h-5" />}
          description="Last 24 hours"
          variant={
            metrics?.errorRate && metrics.errorRate > 1 ? 'warning' : 'default'
          }
        />
      </div>

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ServiceCard
          name="Database"
          icon={<Database className="w-5 h-5" />}
          check={health?.checks.database}
          isLoading={isLoading}
        />
        <ServiceCard
          name="Stripe API"
          icon={<CreditCard className="w-5 h-5" />}
          check={health?.checks.stripe}
          isLoading={isLoading}
        />
        <ServiceCard
          name="Edge Functions"
          icon={<Server className="w-5 h-5" />}
          check={health?.checks.edge_functions}
          isLoading={isLoading}
        />
      </div>

      {/* Response Time */}
      {health && (
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Health Check Response Time
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
              <motion.div
                className={`h-full ${
                  health.duration_ms < 500
                    ? 'bg-success'
                    : health.duration_ms < 1000
                      ? 'bg-yellow-500'
                      : 'bg-destructive'
                }`}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((health.duration_ms / 2000) * 100, 100)}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="font-mono text-sm font-medium min-w-[80px]">
              {health.duration_ms}ms
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Target: &lt;500ms | Warning: &gt;1000ms
          </p>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  variant?: 'default' | 'warning' | 'error';
}

function MetricCard({
  title,
  value,
  icon,
  description,
  variant = 'default',
}: MetricCardProps) {
  const borderColor =
    variant === 'warning'
      ? 'border-yellow-500/30'
      : variant === 'error'
        ? 'border-destructive/30'
        : 'border-border';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`p-6 ${borderColor}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-muted-foreground">{icon}</div>
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
        </div>
        <p className="font-display text-3xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </Card>
    </motion.div>
  );
}

interface ServiceCardProps {
  name: string;
  icon: React.ReactNode;
  check?: ServiceCheck;
  isLoading: boolean;
}

function ServiceCard({ name, icon, check, isLoading }: ServiceCardProps) {
  const status = check?.status || 'unknown';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground">{icon}</div>
            <h3 className="font-display font-semibold">{name}</h3>
          </div>
          {isLoading ? (
            <Badge variant="outline">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Checking
            </Badge>
          ) : (
            getStatusBadge(status as ServiceStatus)
          )}
        </div>

        {check && (
          <div className="space-y-2">
            {check.latency_ms !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Latency</span>
                <span className="font-mono">{check.latency_ms}ms</span>
              </div>
            )}
            {check.error && (
              <p className="text-xs text-destructive mt-2">{check.error}</p>
            )}
          </div>
        )}

        {!check && !isLoading && (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </Card>
    </motion.div>
  );
}

export default MonitoringDashboard;
