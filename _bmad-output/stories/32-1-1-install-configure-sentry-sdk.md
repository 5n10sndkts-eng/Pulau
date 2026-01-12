# Story 32.1.1: Install and Configure Sentry SDK

Status: not-started
Epic: 32 - Monitoring & Observability
Phase: Launch Readiness Sprint - Phase 3
Priority: P0

## Story

As a **platform operator**,
I want Sentry error monitoring integrated,
So that I can detect, diagnose, and fix production errors quickly.

## Acceptance Criteria

1. **Given** Sentry account is set up
   **When** installing Sentry SDK
   **Then** it:
     - Installs @sentry/react and @sentry/vite-plugin
     - Initializes with production DSN
     - Uploads source maps
     - Captures unhandled errors

2. **Given** Sentry is initialized
   **When** an error occurs in the application
   **Then** it:
     - Captures error details
     - Includes stack trace
     - Attaches user context
     - Records breadcrumbs
     - Groups similar errors

3. **Given** source maps are uploaded
   **When** viewing error in Sentry
   **Then** it shows:
     - Original TypeScript source code
     - Exact line numbers
     - Full stack trace
     - Variable values at error time

4. **Given** multiple environments (dev, staging, prod)
   **When** errors occur
   **Then** Sentry:
     - Tags errors by environment
     - Separates concerns
     - Only tracks production errors (or configures per env)
     - Respects privacy settings

## Tasks / Subtasks

- [ ] Task 1: Create Sentry account and project (AC: #1)
  - [ ] 1.1: Sign up for Sentry (free tier: 5k errors/month)
  - [ ] 1.2: Create project for Pulau (React)
  - [ ] 1.3: Copy DSN (Data Source Name)
  - [ ] 1.4: Create auth token for source map uploads

- [ ] Task 2: Install Sentry SDK (AC: #1)
  - [ ] 2.1: Install dependencies
    ```bash
    npm i @sentry/react @sentry/vite-plugin
    ```
  - [ ] 2.2: Add to vite.config.ts
  - [ ] 2.3: Initialize in main.tsx
  - [ ] 2.4: Configure environment-specific settings

- [ ] Task 3: Configure Sentry initialization (AC: #2)
  - [ ] 3.1: Add initialization code to main.tsx
  - [ ] 3.2: Set sample rate for performance monitoring
  - [ ] 3.3: Configure integrations (BrowserTracing, Replay)
  - [ ] 3.4: Set up user context tracking
  - [ ] 3.5: Configure beforeSend hook for PII filtering

- [ ] Task 4: Set up source maps (AC: #3)
  - [ ] 4.1: Configure Vite plugin for source map upload
  - [ ] 4.2: Add SENTRY_AUTH_TOKEN to environment variables
  - [ ] 4.3: Test source map upload in build
  - [ ] 4.4: Verify source maps in Sentry dashboard

- [ ] Task 5: Configure environments (AC: #4)
  - [ ] 5.1: Set environment tags (development, staging, production)
  - [ ] 5.2: Disable Sentry in development (or use separate DSN)
  - [ ] 5.3: Configure sampling rates per environment
  - [ ] 5.4: Test error capture in each environment

## Dev Notes

### Architecture Patterns & Constraints

**Sentry Pricing:**
- Free: 5,000 errors/month, 10k transactions/month
- Team: $26/month - 50k errors, 100k transactions
- Business: $80/month - 500k errors, 1M transactions

**Installation:**
```bash
npm i @sentry/react @sentry/vite-plugin
```

**Vite Configuration:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'pulau',
      project: 'pulau-web',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**',
      },
      release: {
        name: process.env.VITE_APP_VERSION || 'development',
      },
    }),
  ],
  build: {
    sourcemap: true, // Required for Sentry
  },
})
```

**Sentry Initialization:**
```typescript
// src/main.tsx
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Filter sensitive data
    beforeSend(event, hint) {
      // Don't send errors from browser extensions
      if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
        frame => frame.filename?.includes('chrome-extension://')
      )) {
        return null
      }
      
      // Remove PII
      if (event.user) {
        delete event.user.email
        delete event.user.ip_address
      }
      
      return event
    },
    
    // Ignore common non-critical errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed', // Common in PWA offline mode
    ],
  })
}

// Rest of app initialization
const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
```

**User Context Tracking:**
```typescript
// src/contexts/AuthContext.tsx
import { useEffect } from 'react'
import * as Sentry from '@sentry/react'
import { useAuth } from './hooks/useAuth'

function AuthProvider({ children }) {
  const { user } = useAuth()
  
  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: user.id,
        username: user.username,
        // Don't include email or other PII
      })
    } else {
      Sentry.setUser(null)
    }
  }, [user])
  
  return children
}
```

**Environment Variables:**
```bash
# .env.production
VITE_SENTRY_DSN=https://[KEY]@[ORG].ingest.sentry.io/[PROJECT]
VITE_SENTRY_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0

# Build-time only (CI/CD)
SENTRY_AUTH_TOKEN=[TOKEN]
SENTRY_ORG=pulau
SENTRY_PROJECT=pulau-web
```

**Source Map Upload:**
```json
// package.json
{
  "scripts": {
    "build": "tsc && vite build",
    "build:prod": "tsc && vite build --mode production"
  }
}
```

Source maps are uploaded automatically by the Vite plugin during build.

**Verify Setup:**
```typescript
// Test error capture
throw new Error('Sentry test error')

// Or use test button
<button onClick={() => {
  Sentry.captureException(new Error('Test error'))
}}>
  Test Sentry
</button>
```

**Integration with React Router:**
```tsx
// src/App.tsx
import * as Sentry from '@sentry/react'
import { BrowserRouter } from 'react-router-dom'

const SentryRoutes = Sentry.withSentryRouting(Routes)

function App() {
  return (
    <BrowserRouter>
      <SentryRoutes>
        {/* Your routes */}
      </SentryRoutes>
    </BrowserRouter>
  )
}
```

**Performance Monitoring:**
```typescript
// Measure custom transactions
const transaction = Sentry.startTransaction({
  name: 'Checkout Flow',
  op: 'checkout',
})

try {
  await processCheckout()
  transaction.setStatus('ok')
} catch (error) {
  transaction.setStatus('internal_error')
  Sentry.captureException(error)
} finally {
  transaction.finish()
}
```

## Testing Strategy

### Unit Tests
- Mock Sentry in tests
```typescript
// vitest.setup.ts
vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
}))
```

### Integration Tests
- Trigger test error
- Verify in Sentry dashboard
- Check source maps resolve correctly
- Validate user context attached

### Manual QA
1. Deploy to staging with Sentry enabled
2. Trigger various errors (404, API failure, etc.)
3. Check Sentry dashboard for captured errors
4. Verify stack traces are readable
5. Confirm breadcrumbs show user journey

## Dependencies

- Sentry account created
- Auth token for source map upload
- Production deployment (Task 2.7)

## Success Metrics

- 100% of errors captured in production
- Source maps resolve correctly (no minified code)
- User context attached to errors
- Errors grouped intelligently
- Zero PII exposed in error reports

## Security Considerations

- Never expose Sentry auth token in client code
- Filter PII in beforeSend hook
- Use separate DSNs for dev/staging/prod
- Mask sensitive data in Session Replay
- Review error reports for leaked secrets

## Related Files

- `vite.config.ts` (update)
- `src/main.tsx` (update)
- `src/contexts/AuthContext.tsx` (update)
- `.env.production` (add SENTRY_DSN)
- `package.json` (add dependencies)

## Sentry Dashboard Setup

1. Create alerts for:
   - Error spike (> 10 errors/minute)
   - New error types
   - High-severity errors
   - Performance degradation

2. Set up integrations:
   - Slack notifications
   - Email alerts
   - GitHub issues (auto-create)

3. Configure release tracking:
   - Tag deploys with version
   - Track error trends per release
   - Monitor regression

## Alternatives Considered

- **LogRocket**: Better replay, more expensive
- **Rollbar**: Simpler, less features
- **Bugsnag**: Good, but pricier
- **Datadog**: Enterprise-scale, overkill for MVP

**Why Sentry:**
- Industry standard
- Great React integration
- Generous free tier
- Excellent source map support
- Session Replay feature
