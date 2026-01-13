# Story 32.1.3: Configure Sourcemaps for Production

Status: not-started
Epic: 32 - Monitoring & Observability
Phase: Launch Readiness Sprint - Phase 3
Priority: P0

## Story

As a **developer**,
I want source maps uploaded to Sentry,
So that I can debug production errors with original source code.

## Acceptance Criteria

1. **Given** production build completes
   **When** source maps are generated
   **Then** they are:
   - Uploaded to Sentry automatically
   - Not served to users
   - Tagged with release version
   - Deleted from build output

2. **Given** error occurs in production
   **When** viewing in Sentry
   **Then** stack trace shows:
   - Original TypeScript code
   - Correct file paths
   - Accurate line numbers
   - Variable names unminified

## Tasks / Subtasks

- [ ] Task 1: Configure Vite to generate source maps
- [ ] Task 2: Set up Sentry Vite plugin
- [ ] Task 3: Add source map upload to CI/CD
- [ ] Task 4: Verify source maps work in Sentry
- [ ] Task 5: Remove source maps from production dist

## Dev Notes

**vite.config.ts:**

```typescript
export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'pulau',
      project: 'pulau-web',
      sourcemaps: {
        assets: './dist/**',
        ignore: ['node_modules'],
        filesToDeleteAfterUpload: ['./dist/**/*.map'],
      },
    }),
  ],
});
```

**CI/CD (GitHub Actions):**

```yaml
- name: Build and upload to Sentry
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
  run: npm run build
```

## Success Metrics

- 100% of errors show original source
- Source maps upload in < 30 seconds
- No .map files in production dist
- All releases tracked in Sentry

## Related Files

- `vite.config.ts` (update)
- `.github/workflows/deploy.yml` (update)
