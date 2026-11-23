#!/usr/bin/env bash
set -euo pipefail

# Ensure we are running from the Part-1A root folder
cd "$(dirname "$0")/.." || exit 1

echo '=== Dependency vulnerability audit ==='
npm audit --audit-level=high

echo '=== Node.js source security lint ==='
npx eslint src/backend/src/

echo 'Security checks passed.'