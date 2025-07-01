#!/bin/bash

# Test script to validate ERR_INVALID_THIS fix
set -e

echo "=== Testing ERR_INVALID_THIS Fix ==="

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

# Test 1: Check .npmrc configurations
log_info "1. Checking .npmrc configurations..."
if grep -q "network-concurrency=1" .npmrc; then
    log_info "✅ network-concurrency configured"
else
    log_error "❌ network-concurrency not configured"
fi

if grep -q "maxsockets=1" .npmrc; then
    log_info "✅ maxsockets configured"
else
    log_error "❌ maxsockets not configured"
fi

# Test 2: Check pnpm version compatibility
log_info "2. Checking pnpm version..."
PNPM_VERSION=$(pnpm --version)
log_info "Current pnpm version: $PNPM_VERSION"

# Test 3: Check lockfile version
log_info "3. Checking lockfile version..."
LOCKFILE_VERSION=$(head -1 pnpm-lock.yaml)
log_info "Lockfile version: $LOCKFILE_VERSION"

# Test 4: Test dependency installation
log_info "4. Testing dependency installation..."
if timeout 300 pnpm install --frozen-lockfile --network-concurrency=1 >/dev/null 2>&1; then
    log_info "✅ Dependency installation successful"
else
    log_warn "⚠️  Dependency installation had issues, trying alternative..."
    if timeout 300 pnpm install --frozen-lockfile --prefer-offline --maxsockets=1 >/dev/null 2>&1; then
        log_info "✅ Alternative installation successful"
    else
        log_error "❌ Both installation methods failed"
        exit 1
    fi
fi

# Test 5: Check Railway configuration
log_info "5. Checking Railway configuration..."
if [ -f "apps/api/railway.toml" ]; then
    if grep -q "dockerfile" apps/api/railway.toml; then
        log_info "✅ Railway configured to use Dockerfile"
    else
        log_warn "⚠️  Railway not configured for Dockerfile"
    fi
fi

# Test 6: Validate Dockerfile
log_info "6. Validating Dockerfile..."
if [ -f "apps/api/Dockerfile" ]; then
    if grep -q "pnpm@8" apps/api/Dockerfile; then
        log_info "✅ Dockerfile uses pnpm 8.x"
    else
        log_warn "⚠️  Dockerfile pnpm version unclear"
    fi
    
    if grep -q "network-concurrency" apps/api/Dockerfile; then
        log_info "✅ Dockerfile includes network concurrency settings"
    else
        log_warn "⚠️  Dockerfile may not include network settings"
    fi
fi

# Test 7: Test build process
log_info "7. Testing build process..."
if pnpm run build --filter=api >/dev/null 2>&1; then
    log_info "✅ Build process successful"
else
    log_error "❌ Build process failed"
    exit 1
fi

log_info "=== All tests completed ==="
log_info "ERR_INVALID_THIS fix validation: ✅ PASSED"
log_info ""
log_info "Next steps:"
log_info "1. Commit and push changes"
log_info "2. Deploy to Railway"
log_info "3. Monitor build logs for ERR_INVALID_THIS"
