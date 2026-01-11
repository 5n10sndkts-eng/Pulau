#!/bin/bash
# Local CI Mirror - Debug CI failures locally
# Mirrors CI environment and execution flow

set -e

echo "🔍 Running CI pipeline locally..."
echo ""

# Lint
echo "📋 Stage 1: Lint"
npm run lint || exit 1
echo "✅ Lint passed"
echo ""

# Unit Tests
echo "🧪 Stage 2: Unit Tests"
npm run test:run || exit 1
echo "✅ Unit tests passed"
echo ""

# E2E Tests
echo "🎭 Stage 3: E2E Tests"
npm run test:e2e || exit 1
echo "✅ E2E tests passed"
echo ""

# Burn-in (reduced iterations for local testing)
echo "🔥 Stage 4: Burn-In (3 iterations)"
for i in {1..3}; do
  echo "  Iteration $i/3"
  npm run test:e2e || exit 1
done
echo "✅ Burn-in passed"
echo ""

echo "✅ Local CI pipeline completed successfully!"
