#!/bin/bash

# Script para testar o build do Docker localmente
# Usage: ./scripts/test-docker-build.sh

set -e

echo "=== Testing Docker Build for SkillHub API ==="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está rodando
if ! docker info >/dev/null 2>&1; then
    log_error "Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

log_info "Docker está rodando..."

# Limpar builds anteriores
log_info "Limpando imagens antigas..."
docker image prune -f || true
docker rmi skillhub-api:test || true

# Fazer build da API
log_info "Iniciando build da API..."
if docker build -t skillhub-api:test -f apps/api/Dockerfile .; then
    log_info "✅ Build da API concluído com sucesso!"
else
    log_error "❌ Falha no build da API"
    exit 1
fi

# Verificar tamanho da imagem
IMAGE_SIZE=$(docker images skillhub-api:test --format "table {{.Size}}" | tail -n +2)
log_info "Tamanho da imagem: $IMAGE_SIZE"

# Testar se a imagem pode ser executada
log_info "Testando execução da imagem..."
CONTAINER_ID=$(docker run -d -p 3001:3000 skillhub-api:test)

# Aguardar um pouco para o container inicializar
sleep 5

# Verificar se o container está rodando
if docker ps | grep -q $CONTAINER_ID; then
    log_info "✅ Container está rodando!"
    
    # Testar endpoint básico (se disponível)
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        log_info "✅ Health check passou!"
    else
        log_warn "⚠️  Health check falhou (pode ser normal se não implementado)"
    fi
else
    log_error "❌ Container falhou ao inicializar"
    docker logs $CONTAINER_ID
fi

# Cleanup
log_info "Limpando recursos de teste..."
docker stop $CONTAINER_ID >/dev/null 2>&1 || true
docker rm $CONTAINER_ID >/dev/null 2>&1 || true

log_info "=== Teste Docker concluído ==="
log_info "Para fazer deploy, use: docker build -t skillhub-api -f apps/api/Dockerfile ."
