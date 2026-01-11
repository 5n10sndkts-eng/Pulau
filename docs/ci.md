# CI/CD Pipeline Documentation

## Overview

The Pulau project uses GitHub Actions for continuous integration and testing. The pipeline ensures code quality, test coverage, and detects flaky tests before they reach production.

## Pipeline Stages

### 1. Lint
- **Purpose**: Code quality checks with ESLint
- **Runs on**: Every push and PR
- **Duration**: < 2 minutes
- **Command**: `npm run lint`

### 2. Unit Tests
- **Purpose**: Fast unit test execution with Vitest
- **Runs on**: Every push and PR
- **Duration**: < 5 minutes
- **Command**: `npm run test:run`
- **Artifacts**: Coverage reports (on failure)

### 3. E2E Tests (Parallel Sharding)
- **Purpose**: End-to-end testing with Playwright
- **Runs on**: Every push and PR
- **Parallelism**: 4 shards for faster execution
- **Duration**: < 10 minutes per shard
- **Command**: `npx playwright test --shard=N/4`
- **Artifacts**: Test results, traces, screenshots, videos (on failure)

### 4. Burn-In (Flaky Test Detection)
- **Purpose**: Detect non-deterministic test failures
- **Runs on**: Pull requests and weekly schedule (Sundays 2 AM UTC)
- **Iterations**: 10 full test runs
- **Duration**: < 30 minutes
- **Failure threshold**: Even ONE failure indicates flaky tests
- **Artifacts**: Failure traces and reports

## Running Tests Locally

### Run Full CI Pipeline Locally

```bash
./scripts/ci-local.sh
```

This mirrors the CI environment with:
- Lint → Unit Tests → E2E Tests → Burn-In (3 iterations)

### Run Burn-In Loop

```bash
# Default 10 iterations
./scripts/burn-in.sh

# Custom iterations
./scripts/burn-in.sh 5
```

### Run Individual Stages

```bash
# Lint
npm run lint

# Unit tests
npm run test:run

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

## Debugging Failed CI Runs

### 1. Check Artifacts

When tests fail, CI uploads artifacts containing:
- **Traces**: Full debugging context (Playwright Trace Viewer)
- **Screenshots**: Visual evidence of failures
- **Videos**: Interaction playback
- **HTML Reports**: Detailed test results

**To download:**
1. Go to the failed workflow run on GitHub
2. Scroll to "Artifacts" section
3. Download the relevant artifact (e.g., `e2e-test-results-shard-1`)

### 2. Run Locally

```bash
# Mirror the exact CI environment
./scripts/ci-local.sh

# Or run specific test file
npm run test:e2e -- tests/specific-test.spec.ts
```

### 3. View Playwright Traces

```bash
# After downloading artifact
npx playwright show-trace test-results/trace.zip
```

## Performance Targets

| Stage | Target Duration |
|-------|----------------|
| Lint | < 2 minutes |
| Unit Tests | < 5 minutes |
| E2E Tests (per shard) | < 10 minutes |
| Burn-In (10 iterations) | < 30 minutes |
| **Total Pipeline** | **< 15 minutes** |

**Speedup**: 4× faster through parallel sharding

## Caching Strategy

The pipeline caches:
- **npm dependencies**: `~/.npm` (keyed by `package-lock.json`)
- **Playwright browsers**: `~/.cache/ms-playwright` (keyed by `package-lock.json`)

**Benefit**: Reduces execution time by 2-5 minutes per run

## Badges

Add these badges to your README:

```markdown
![Tests](https://github.com/5n10sndkts-eng/Pulau/actions/workflows/test.yml/badge.svg)
```

## Workflow Triggers

- **Push to `main`**: Full pipeline (lint, unit, e2e)
- **Pull Requests**: Full pipeline + burn-in loop
- **Weekly Schedule**: Burn-in validation (Sundays 2 AM UTC)

## Best Practices

1. **Fix flaky tests immediately**: If burn-in fails, the test suite is unreliable
2. **Run `ci-local.sh` before pushing**: Catch issues early
3. **Review artifacts on failure**: Traces contain full debugging context
4. **Keep tests fast**: Target < 10 minutes per shard
5. **Use parallel sharding**: Adjust shard count if tests grow

## Troubleshooting

### Tests pass locally but fail in CI

- Check Node version matches (`.nvmrc`: 20.11.0)
- Verify Playwright browsers are installed
- Check for race conditions (run burn-in locally)

### CI is too slow

- Increase shard count in `.github/workflows/test.yml`
- Optimize slow tests
- Review caching configuration

### Burn-in failures

- Indicates flaky/non-deterministic tests
- Must fix before merging
- Use traces to identify root cause
