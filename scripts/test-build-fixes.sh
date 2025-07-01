#!/bin/bash

# Test script to validate nest build fix
set -e

echo "=== Testing Nest Build Fix ==="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "1. Testing ERR_INVALID_THIS resolution..."
if ./scripts/test-err-invalid-this-fix.sh >/dev/null 2>&1; then
    log_info "✅ ERR_INVALID_THIS fix validated"
else
    log_error "❌ ERR_INVALID_THIS fix failed"
    exit 1
fi

log_info "2. Testing API build process..."
if cd apps/api && pnpm run build >/dev/null 2>&1; then
    log_info "✅ API build successful"
    cd ../..
else
    log_error "❌ API build failed"
    exit 1
fi

log_info "3. Checking dist output..."
if [ -d "apps/api/dist" ]; then
    DIST_SIZE=$(du -sh apps/api/dist/ | cut -f1)
    log_info "✅ Dist directory created: $DIST_SIZE"
else
    log_error "❌ Dist directory not found"
    exit 1
fi

log_info "4. Checking Dockerfile corrections..."
if grep -q "ENV NODE_ENV=production" apps/api/Dockerfile; then
    BUILD_LINE=$(grep -n "pnpm run build" apps/api/Dockerfile | cut -d: -f1)
    ENV_LINE=$(grep -n "ENV NODE_ENV=production" apps/api/Dockerfile | cut -d: -f1)
    if [ "$BUILD_LINE" -lt "$ENV_LINE" ]; then
        log_info "✅ Dockerfile build order correct (build: $BUILD_LINE, env: $ENV_LINE)"
    else
        log_error "❌ Dockerfile build order incorrect (build: $BUILD_LINE, env: $ENV_LINE)"
        exit 1
    fi
else
    log_error "❌ Dockerfile NODE_ENV not set"
    exit 1
fi

log_info "5. Testing full monorepo build..."
if pnpm turbo build >/dev/null 2>&1; then
    log_info "✅ Full monorepo build successful"
else
    log_error "❌ Full monorepo build failed"
    exit 1
fi

log_info "=== All tests passed! ==="
log_info ""
log_info "Summary of fixes:"
log_info "✅ ERR_INVALID_THIS: Resolved"
log_info "✅ Nest CLI: Available during build"
log_info "✅ Build process: Working"
log_info "✅ Docker setup: Optimized"
log_info ""
log_info "Ready for deployment! 🚀"
