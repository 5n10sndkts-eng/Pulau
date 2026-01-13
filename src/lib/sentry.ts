// ================================================
// Sentry Error Tracking Configuration
// Story: 32.1 - Integrate Error Tracking (Sentry)
// ================================================
// Provides error tracking, performance monitoring, and session replay.
// Only active in production to avoid noise during development.
// PII is scrubbed before sending to Sentry.
// ================================================

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking
 * AC #1: Automatic error capture
 * AC #5: Environment configuration (only in production)
 */
export function initSentry(): void {
  // Skip Sentry in development (AC #5)
  if (!import.meta.env.PROD) {
    console.log('[Sentry] Skipping initialization in development mode');
    return;
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn('[Sentry] No DSN configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,

    // Environment tagging (AC #5)
    environment: import.meta.env.MODE || 'production',

    // Release version for source map correlation (AC #2)
    release: `pulau@${import.meta.env.VITE_APP_VERSION || '0.0.0'}`,

    // Integrations
    integrations: [
      // Browser performance tracing
      Sentry.browserTracingIntegration(),

      // Session replay for debugging (with privacy protection)
      Sentry.replayIntegration({
        maskAllText: true, // Mask all text for privacy
        blockAllMedia: true, // Block media uploads
      }),
    ],

    // Trace propagation targets (moved to top level in v8)
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/.*\.supabase\.co/,
      /^https:\/\/pulau\.app/,
    ],

    // Sampling rates
    tracesSampleRate: 0.1, // 10% of transactions for performance
    replaysSessionSampleRate: 0.1, // 10% of sessions for replay
    replaysOnErrorSampleRate: 1.0, // 100% of error sessions

    // Error filtering
    ignoreErrors: [
      // Ignore common non-actionable errors
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      // Ignore user-initiated cancellations
      'AbortError',
      'The operation was aborted',
      // Ignore extension errors
      /^chrome-extension:\/\//,
      /^moz-extension:\/\//,
    ],

    // PII Scrubbing (AC #4)
    beforeSend(event) {
      // Remove sensitive user data
      if (event.user) {
        delete event.user.email;
        delete event.user.username;
        delete event.user.ip_address;
        // Keep only the anonymized ID
      }

      // Scrub sensitive breadcrumb data
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          if (breadcrumb.data) {
            // Remove any potential PII from breadcrumb data
            const sanitized = { ...breadcrumb.data };
            delete sanitized.email;
            delete sanitized.password;
            delete sanitized.token;
            delete sanitized.authorization;
            return { ...breadcrumb, data: sanitized };
          }
          return breadcrumb;
        });
      }

      return event;
    },

    // Performance optimization
    maxBreadcrumbs: 50,
    attachStacktrace: true,
  });

  console.log('[Sentry] Initialized for production');
}

/**
 * Set the current user for error context
 * AC #4: User context (anonymized ID only)
 */
export function setSentryUser(userId: string | null): void {
  if (!import.meta.env.PROD) return;

  if (userId) {
    // Only send anonymized user ID, no PII
    Sentry.setUser({ id: userId });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Capture an exception with additional context
 * Used by ErrorBoundary and manual error handling
 */
export function captureError(
  error: Error | unknown,
  context?: {
    componentStack?: string;
    extra?: Record<string, unknown>;
    tags?: Record<string, string>;
  },
): void {
  if (!import.meta.env.PROD) {
    console.error('[Sentry] Would capture in production:', error);
    return;
  }

  const errorToCapture =
    error instanceof Error ? error : new Error(String(error));

  Sentry.captureException(errorToCapture, {
    extra: {
      ...context?.extra,
      ...(context?.componentStack && {
        componentStack: context.componentStack,
      }),
    },
    tags: context?.tags,
  });
}

/**
 * Capture a message (info/warning level)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>,
): void {
  if (!import.meta.env.PROD) {
    console.log(`[Sentry] Would capture message (${level}):`, message);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add a breadcrumb for debugging context
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
): void {
  if (!import.meta.env.PROD) return;

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Set custom tags for filtering in Sentry
 */
export function setTag(key: string, value: string): void {
  if (!import.meta.env.PROD) return;
  Sentry.setTag(key, value);
}

/**
 * Set extra context data
 */
export function setContext(
  name: string,
  context: Record<string, unknown>,
): void {
  if (!import.meta.env.PROD) return;
  Sentry.setContext(name, context);
}

// ================================================
// STORY 32-2: Application Performance Monitoring
// ================================================

/**
 * Start a custom transaction for tracking user flows
 * AC #1: Custom transaction tracking for checkout flow
 */
export function startTransaction(
  name: string,
  operation: string,
  data?: Record<string, unknown>,
): Sentry.Span | undefined {
  if (!import.meta.env.PROD) {
    console.log(`[Sentry APM] Would start transaction: ${name} (${operation})`);
    return undefined;
  }

  return Sentry.startInactiveSpan({
    name,
    op: operation,
    attributes: data as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Create a span within the current transaction
 * Used for tracking sub-operations (e.g., API calls within checkout)
 */
export function startSpan<T>(
  name: string,
  operation: string,
  callback: () => T | Promise<T>,
): T | Promise<T> {
  if (!import.meta.env.PROD) {
    console.log(`[Sentry APM] Would track span: ${name} (${operation})`);
    return callback();
  }

  return Sentry.startSpan({ name, op: operation }, callback);
}

/**
 * Track checkout flow performance
 * AC #1: Custom transaction tracking for checkout flow
 */
export function trackCheckoutStep(
  step: 'review' | 'traveler-details' | 'payment' | 'confirmation',
  data?: Record<string, unknown>,
): void {
  if (!import.meta.env.PROD) {
    console.log(`[Sentry APM] Checkout step: ${step}`, data);
    return;
  }

  addBreadcrumb(`Checkout step: ${step}`, 'checkout', data);
  setContext('checkout', {
    currentStep: step,
    timestamp: new Date().toISOString(),
    ...data,
  });
}

/**
 * Track API call performance
 * Wraps fetch/API calls with performance monitoring
 */
export async function trackApiCall<T>(
  name: string,
  apiCall: () => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await startSpan(name, 'http.client', apiCall);
    const duration = performance.now() - startTime;

    if (import.meta.env.PROD) {
      addBreadcrumb(`API call succeeded: ${name}`, 'api', {
        duration: `${duration.toFixed(2)}ms`,
        ...metadata,
      });
    }

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    if (import.meta.env.PROD) {
      addBreadcrumb(`API call failed: ${name}`, 'api', {
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...metadata,
      });
    }

    throw error;
  }
}

/**
 * Report Core Web Vitals to Sentry
 * AC #2: Monitor Core Web Vitals (LCP, FID, CLS)
 */
export function reportWebVitals(): void {
  if (!import.meta.env.PROD) {
    console.log('[Sentry APM] Would report Web Vitals in production');
    return;
  }

  // Web Vitals are automatically captured by Sentry's browserTracingIntegration
  // This function adds custom measurement logging for debugging
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // LCP (Largest Contentful Paint)
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          Sentry.setMeasurement('lcp', lastEntry.startTime, 'millisecond');
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // LCP not supported
    }

    // FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if ('processingStart' in entry) {
            const fid =
              (entry as PerformanceEventTiming).processingStart -
              entry.startTime;
            Sentry.setMeasurement('fid', fid, 'millisecond');
          }
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // FID not supported
    }

    // CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (
            !(entry as PerformanceEntry & { hadRecentInput?: boolean })
              .hadRecentInput
          ) {
            clsValue += (entry as PerformanceEntry & { value: number }).value;
          }
        }
        Sentry.setMeasurement('cls', clsValue, 'none');
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // CLS not supported
    }
  }
}

/**
 * Track page navigation performance
 */
export function trackPageView(
  pageName: string,
  data?: Record<string, unknown>,
): void {
  if (!import.meta.env.PROD) {
    console.log(`[Sentry APM] Page view: ${pageName}`, data);
    return;
  }

  addBreadcrumb(`Page view: ${pageName}`, 'navigation', data);
  setTag('page', pageName);
}

/**
 * Measure custom timing
 * For tracking specific operations (e.g., image upload, form validation)
 */
export function measureTiming(
  name: string,
  value: number,
  unit: 'millisecond' | 'second' | 'none' = 'millisecond',
): void {
  if (!import.meta.env.PROD) {
    console.log(
      `[Sentry APM] Timing ${name}: ${value}${unit === 'none' ? '' : unit.slice(0, 2)}`,
    );
    return;
  }

  Sentry.setMeasurement(name, value, unit);
}

// Re-export Sentry for advanced usage
export { Sentry };
