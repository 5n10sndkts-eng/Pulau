// ================================================
// Edge Function: health-check
// Story: 32.3 - Create Health Check Endpoints
// Phase: 2b - Enhanced Operations & Notifications
// ================================================
// Provides health status for monitoring and alerting.
// Checks database connectivity, Stripe API, and Edge Functions.
// Returns aggregated status for uptime monitoring tools.
// ================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger, jsonResponse } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// ================================================
// Types (AC #4: Response Format)
// ================================================

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

// ================================================
// Health Check Implementations
// ================================================

/**
 * Check database connectivity (AC #2)
 * Performs a simple query to verify Supabase is reachable
 */
async function checkDatabase(): Promise<ServiceCheck> {
  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return {
        status: 'unhealthy',
        error: 'Database configuration missing',
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simple query to verify connectivity - select from a small table
    const { error } = await supabase.from('profiles').select('id').limit(1);

    if (error) {
      throw new Error(error.message);
    }

    return {
      status: 'healthy',
      latency_ms: Date.now() - startTime,
    };
  } catch (err) {
    console.error('Database health check failed:', err);
    return {
      status: 'unhealthy',
      latency_ms: Date.now() - startTime,
      // Sanitize error - don't expose connection details (AC #2)
      error: 'Database connection failed',
    };
  }
}

/**
 * Check Stripe API connectivity (AC #3)
 * Verifies Stripe API is reachable by retrieving account balance
 */
async function checkStripe(): Promise<ServiceCheck> {
  const startTime = Date.now();

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!stripeKey) {
      return {
        status: 'unhealthy',
        error: 'Stripe configuration missing',
      };
    }

    // Use fetch instead of Stripe SDK to avoid import issues
    const response = await fetch('https://api.stripe.com/v1/balance', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      // Handle rate limiting gracefully (AC #3)
      if (response.status === 429) {
        return {
          status: 'healthy', // Rate limited but API is reachable
          latency_ms: Date.now() - startTime,
        };
      }
      throw new Error(`Stripe API returned ${response.status}`);
    }

    return {
      status: 'healthy',
      latency_ms: Date.now() - startTime,
    };
  } catch (err) {
    console.error('Stripe health check failed:', err);
    return {
      status: 'unhealthy',
      latency_ms: Date.now() - startTime,
      error: 'Stripe API unavailable',
    };
  }
}

/**
 * Check Edge Functions are operational
 * This check succeeds if this function is running
 */
function checkEdgeFunctions(): ServiceCheck {
  return {
    status: 'healthy',
    latency_ms: 0,
  };
}

/**
 * Determine overall status based on individual checks (AC #4)
 */
function determineOverallStatus(
  checks: HealthCheckResult['checks'],
): OverallStatus {
  const statuses = Object.values(checks).map((c) => c.status);

  // All healthy = healthy
  if (statuses.every((s) => s === 'healthy')) {
    return 'healthy';
  }

  // Database unhealthy = unhealthy (critical service)
  if (checks.database.status === 'unhealthy') {
    return 'unhealthy';
  }

  // Other services down = degraded
  return 'degraded';
}

// ================================================
// Main Handler
// ================================================

serve(async (req: Request): Promise<Response> => {
  const logger = createLogger('health-check', req);
  logger.requestStart(req.method, '/health-check');

  // Handle CORS preflight (AC #5 - allow unauthenticated)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    logger.warn('Method not allowed', { method: req.method });
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const startTime = Date.now();

  try {
    logger.info('Running health checks');

    // Run all health checks in parallel for speed
    const [database, stripe] = await Promise.all([
      checkDatabase(),
      checkStripe(),
    ]);

    const checks: HealthCheckResult['checks'] = {
      database,
      stripe,
      edge_functions: checkEdgeFunctions(),
    };

    const overallStatus = determineOverallStatus(checks);

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: Deno.env.get('APP_VERSION') || '1.0.0',
      duration_ms: Date.now() - startTime,
      environment: Deno.env.get('ENVIRONMENT') || 'production',
      checks,
    };

    // Return 200 for healthy, 503 for degraded/unhealthy (AC #4)
    const httpStatus = overallStatus === 'healthy' ? 200 : 503;

    logger.requestEnd(httpStatus, {
      status: overallStatus,
      checks: {
        database: database.status,
        stripe: stripe.status,
        edge_functions: 'healthy',
      },
    });

    return new Response(JSON.stringify(result, null, 2), {
      status: httpStatus,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': overallStatus,
        'X-Request-ID': logger.getRequestId(),
      },
    });
  } catch (err) {
    logger.error('Health check failed', err);

    // Return unhealthy if the check itself fails
    const errorResult: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: Deno.env.get('APP_VERSION') || '1.0.0',
      duration_ms: Date.now() - startTime,
      environment: Deno.env.get('ENVIRONMENT') || 'production',
      checks: {
        database: { status: 'unhealthy', error: 'Check failed' },
        stripe: { status: 'unhealthy', error: 'Check failed' },
        edge_functions: { status: 'unhealthy', error: 'Internal error' },
      },
    };

    logger.requestEnd(503);

    return new Response(JSON.stringify(errorResult, null, 2), {
      status: 503,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': 'unhealthy',
        'X-Request-ID': logger.getRequestId(),
      },
    });
  }
});
