#!/bin/bash

# Ensure we are running from the Part-1A root folder
cd "$(dirname "$0")/.." || exit 1

echo "=== 1. RUNNING LINT GUARD ==="
npx eslint src/backend/src/ || exit 1

echo "=== 2. RUNNING SECURITY/SAST GUARD ==="
bash .harness/security-check.sh || exit 1

echo "=== 3. RUNNING exercise UNIT & CONTRACT TESTS ==="
node tests/exercises.test.js || exit 1

echo "=== 4. RUNNING session UNIT & CONTRACT TESTS ==="
node tests/sessions.test.js || exit 1

echo "✅ ALL HARNESS GATES PASSED"