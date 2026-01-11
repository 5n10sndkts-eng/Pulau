#!/bin/bash
# Burn-In Loop - Flaky Test Detection
# Runs tests multiple times to detect non-deterministic failures

ITERATIONS=${1:-10}

echo "🔥 Starting burn-in loop with $ITERATIONS iterations"
echo ""

for i in $(seq 1 $ITERATIONS); do
  echo "🔥 Burn-in iteration $i/$ITERATIONS"
  npm run test:e2e || {
    echo "❌ Test failed on iteration $i"
    exit 1
  }
done

echo ""
echo "✅ Burn-in completed successfully! All $ITERATIONS iterations passed."
