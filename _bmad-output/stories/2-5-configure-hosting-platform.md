# Task 2.5: Configure Hosting Platform

Status: not-started
Phase: Launch Readiness Sprint - Phase 2
Priority: P0
Type: Infrastructure Setup

## Task Description

Set up production hosting for the Pulau frontend application using Vercel or Netlify with optimized build configuration and CDN delivery.

## Acceptance Criteria

- [ ] Hosting platform account created
- [ ] Project linked to GitHub repository
- [ ] Build configuration optimized
- [ ] Environment variables configured (see Task 2.3)
- [ ] Preview deployments enabled
- [ ] Production deployment successful
- [ ] CDN caching configured

## Recommended Platform

**Vercel** (Recommended for React/Vite apps)

- Pros: Zero-config for Vite, edge functions, great DX
- Cons: More expensive at scale
- Pricing: Free (hobby), $20/month (Pro)

**Alternative: Netlify**

- Pros: Generous free tier, good plugin ecosystem
- Cons: Slower cold starts
- Pricing: Free (up to 100GB bandwidth)

## Steps (Vercel)

### 1. Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub account
3. Authorize Vercel to access repositories

### 2. Import Project

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd /path/to/pulau
vercel link

# Follow prompts:
# - Set up and deploy: Yes
# - Which scope: Your username/team
# - Link to existing project: No
# - Project name: pulau
# - Directory: ./
# - Override settings: No
```

### 3. Configure Build Settings

In Vercel dashboard or `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 4. Set Environment Variables

```bash
# See Task 2.3 for complete list
# Set via CLI or Vercel dashboard

# Via CLI
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production

# Via Dashboard
# Settings → Environment Variables → Add
```

### 5. Configure Git Integration

1. Connect GitHub repository
2. Enable automatic deployments:
   - Production branch: `main`
   - Preview branches: All branches
3. Configure deployment protection:
   - Enable Vercel authentication for preview URLs
   - Set up deployment notifications (Slack/Email)

### 6. Optimize Build Performance

**Update `vite.config.ts`:**

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true, // For Sentry
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
```

**Update `package.json`:**

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "build:analyze": "vite build --mode analyze",
    "preview": "vite preview"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 7. Test Production Build

```bash
# Build locally
npm run build

# Analyze bundle size
npm run build:analyze

# Preview production build
npm run preview
# Opens http://localhost:4173

# Test in browser
# - Verify all routes work
# - Check Network tab for 404s
# - Test PWA installation
# - Verify service worker registers
```

### 8. Deploy to Production

```bash
# Deploy via CLI
vercel --prod

# Or via GitHub
# Push to main branch → auto-deploys

# Monitor deployment
vercel logs pulau --prod
```

## Steps (Netlify Alternative)

### If using Netlify instead:

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Configure netlify.toml
cat > netlify.toml << EOF
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
EOF

# Deploy
netlify deploy --prod
```

## CDN Configuration

### Caching Strategy

```typescript
// Add to vite.config.ts
{
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/[name].[hash].css'
          }
          if (assetInfo.name.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)) {
            return 'assets/images/[name].[hash].[ext]'
          }
          return 'assets/[name].[hash].[ext]'
        },
      },
    },
  },
}
```

### Cache Headers

- **HTML**: `Cache-Control: public, max-age=0, must-revalidate`
- **JS/CSS**: `Cache-Control: public, max-age=31536000, immutable`
- **Images**: `Cache-Control: public, max-age=31536000, immutable`
- **Service Worker**: `Cache-Control: public, max-age=0, must-revalidate`

## Performance Optimization

### Enable Edge Functions (Vercel)

```typescript
// Optional: API routes as Edge Functions
// api/health.ts
export const config = {
  runtime: 'edge',
};

export default function handler(request: Request) {
  return new Response('OK', { status: 200 });
}
```

### Enable Image Optimization

```typescript
// Use Vercel's automatic image optimization
// In components:
<img
  src="/images/hero.jpg"
  alt="Hero"
  loading="lazy"
  decoding="async"
/>
```

## Monitoring Setup

### Analytics

```bash
# Vercel Analytics (built-in)
npm i @vercel/analytics

# Add to main.tsx
import { Analytics } from '@vercel/analytics/react'

<Analytics />
```

### Web Vitals

```typescript
// Add to main.tsx
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onFCP(console.log);
onLCP(console.log);
onTTFB(console.log);
```

## Security Configuration

### Content Security Policy

```json
// Add to vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.stripe.com;"
        }
      ]
    }
  ]
}
```

## Validation Tests

```bash
# Test production URL
curl -I https://pulau.app
# Should return 200

# Test PWA
lighthouse https://pulau.app --view

# Test performance
npm run build
ls -lh dist/
# Bundle should be < 500KB gzipped

# Test all routes
curl https://pulau.app/
curl https://pulau.app/experiences
curl https://pulau.app/vendor/dashboard
# All should return 200
```

## Related Files

- `vercel.json` (create)
- `netlify.toml` (if using Netlify)
- `vite.config.ts` (update)
- `package.json` (update build scripts)

## Estimated Time

1-2 hours

## Dependencies

- Task 2.3 (Environment variables ready)
- GitHub repository with latest code
- Domain name ready (see Task 2.6)

## Success Validation

- [ ] Production build completes successfully
- [ ] All routes accessible
- [ ] Environment variables loaded
- [ ] PWA installable
- [ ] Service worker registers
- [ ] Lighthouse score > 90
- [ ] Bundle size optimized (< 500KB)
- [ ] CDN caching working
- [ ] SSL certificate active

## Common Issues

| Issue               | Solution                               |
| ------------------- | -------------------------------------- |
| Build fails         | Check Node version (18+), run `npm ci` |
| 404 on routes       | Verify SPA redirect in vercel.json     |
| Env vars not loaded | Redeploy after setting variables       |
| Large bundle size   | Analyze with `vite-bundle-visualizer`  |
| Slow cold starts    | Enable Edge Functions, optimize chunks |

## Post-Deployment

- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure deployment notifications
- [ ] Enable preview deployments for PRs
- [ ] Set up rollback strategy
- [ ] Monitor build times and optimize
