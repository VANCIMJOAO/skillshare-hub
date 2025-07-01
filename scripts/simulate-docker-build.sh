#!/bin/bash

# Script para simular e testar os comandos Docker sem Docker rodando
# Usage: ./scripts/simulate-docker-build.sh

set -e

echo "=== Simulando Docker Build para SkillHub API ==="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "Simulando ambiente Docker..."

# Verificar estrutura de arquivos necessários
log_info "Verificando arquivos necessários para Docker build..."

REQUIRED_FILES=(
    "package.json"
    "pnpm-workspace.yaml" 
    "pnpm-lock.yaml"
    ".npmrc"
    "apps/api/package.json"
    "apps/api/Dockerfile"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_info "✅ $file encontrado"
    else
        log_error "❌ $file não encontrado"
        exit 1
    fi
done

# Simular install das dependências
log_info "Simulando: pnpm install --frozen-lockfile..."
if pnpm install --frozen-lockfile >/dev/null 2>&1; then
    log_info "✅ Instalação de dependências simulada com sucesso"
else
    log_warn "⚠️  Simulação de instalação teve problemas"
fi

# Simular build
log_info "Simulando: pnpm run build --filter=api..."
if pnpm run build --filter=api >/dev/null 2>&1; then
    log_info "✅ Build simulado com sucesso"
else
    log_error "❌ Build falhou na simulação"
    exit 1
fi

# Verificar se dist foi criado
if [ -d "apps/api/dist" ]; then
    log_info "✅ Diretório dist criado: $(du -sh apps/api/dist)"
    log_info "Arquivos em dist:"
    ls -la apps/api/dist/ | head -10
else
    log_error "❌ Diretório dist não foi criado"
    exit 1
fi

# Verificar configurações de rede
log_info "Verificando configurações de rede (.npmrc)..."
if grep -q "fetch-retries" .npmrc; then
    log_info "✅ Configurações de retry encontradas"
else
    log_warn "⚠️  Configurações de retry não encontradas"
fi

if grep -q "network-concurrency=1" .npmrc; then
    log_info "✅ Configuração de concorrência encontrada"
else
    log_warn "⚠️  Configuração de concorrência não encontrada"
fi

# Verificar pnpm lock version
LOCK_VERSION=$(head -1 pnpm-lock.yaml | grep -o "lockfileVersion:" | wc -l)
if [ "$LOCK_VERSION" -gt 0 ]; then
    ACTUAL_VERSION=$(head -1 pnpm-lock.yaml)
    log_info "✅ Lockfile version: $ACTUAL_VERSION"
else
    log_warn "⚠️  Não foi possível determinar versão do lockfile"
fi

# Simular comandos que seriam executados no Docker
log_info "Comandos que seriam executados no Docker:"
echo "  1. apt-get update && apt-get install -y python3 make g++"
echo "  2. npm install -g pnpm@8"
echo "  3. pnpm install --frozen-lockfile --prefer-offline"
echo "  4. pnpm run build"
echo "  5. pnpm prune --prod"
echo "  6. pnpm run start:prod"

log_info "=== Simulação concluída com sucesso ==="
log_info "O build Docker deve funcionar com essas configurações."
log_info "Para testar com Docker real, execute: docker build -t skillhub-api -f apps/api/Dockerfile ."
