#!/bin/bash
# Selective Testing Script
# Run only tests affected by changed files
# Usage: ./scripts/test-changed.sh [base-branch]

set -e

BASE_BRANCH="${1:-main}"

echo "🔍 Detecting changed files since $BASE_BRANCH..."

# Get changed files
CHANGED_FILES=$(git diff --name-only "$BASE_BRANCH"...HEAD)

if [ -z "$CHANGED_FILES" ]; then
  echo "ℹ️  No changes detected. Running full test suite..."
  npm run test:e2e
  exit 0
fi

echo "📝 Changed files:"
echo "$CHANGED_FILES"
echo ""

# Detect if source files changed
SRC_CHANGED=$(echo "$CHANGED_FILES" | grep -E "^src/.*\.(ts|tsx|js|jsx)$" || true)

# Detect if E2E tests changed
E2E_CHANGED=$(echo "$CHANGED_FILES" | grep -E "^tests/e2e/.*\.(ts|spec\.ts)$" || true)

# Detect if components changed
COMPONENT_CHANGED=$(echo "$CHANGED_FILES" | grep -E "^src/components/.*\.(tsx|ts)$" || true)

# Strategy: Run relevant test subsets
if [ -n "$E2E_CHANGED" ]; then
  echo "🎯 Running only changed E2E test files..."
  
  # Extract test file names
  TEST_FILES=$(echo "$E2E_CHANGED" | tr '\n' ' ')
  
  # Run only those specific test files
  npx playwright test $TEST_FILES
  
elif [ -n "$COMPONENT_CHANGED" ]; then
  echo "🎯 Component changes detected. Running E2E tests with @interactive tag..."
  
  # Run tests tagged for UI interactions
  npx playwright test --grep "@interactive|@checkout|@trip"
  
elif [ -n "$SRC_CHANGED" ]; then
  echo "🎯 Source changes detected. Running core E2E flows..."
  
  # Run priority tests (tagged @p0)
  npx playwright test --grep "@p0"
  
else
  echo "ℹ️  Non-source changes (config, docs, etc.). Running smoke tests only..."
  
  # Run basic smoke tests
  npx playwright test tests/e2e/example.spec.ts
fi

echo ""
echo "✅ Selective test execution complete!"
echo ""
echo "💡 To run full suite: npm run test:e2e"
