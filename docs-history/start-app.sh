#!/bin/bash

echo "🚀 Iniciando SkillShare Hub..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para iniciar serviço em background
start_service() {
    local name=$1
    local dir=$2
    local command=$3
    
    echo -e "${BLUE}📦 Iniciando $name...${NC}"
    cd "$dir"
    
    # Verifica se o comando existe
    if command -v $command >/dev/null 2>&1; then
        $command &
        echo -e "${GREEN}✅ $name iniciado${NC}"
    else
        echo -e "${RED}❌ Erro: $command não encontrado${NC}"
    fi
    
    cd - > /dev/null
}

# Iniciar Backend
echo -e "${BLUE}🔧 Iniciando Backend (NestJS)...${NC}"
cd apps/api
npm run start:dev &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend rodando em http://localhost:3004${NC}"

# Esperar um pouco para o backend inicializar
sleep 3

# Iniciar Frontend
echo -e "${BLUE}🎨 Iniciando Frontend (Next.js)...${NC}"
cd ../web
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend rodando em http://localhost:3000${NC}"

echo ""
echo -e "${GREEN}🎉 SkillShare Hub iniciado com sucesso!${NC}"
echo ""
echo -e "${BLUE}📍 URLs importantes:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3004"
echo "   Admin:    http://localhost:3000/admin"
echo "   Getting Started: http://localhost:3000/getting-started"
echo ""
echo -e "${BLUE}🔑 Login de teste:${NC}"
echo "   Email: admin@skillshare.com"
echo "   Senha: admin123"
echo ""
echo "Pressione Ctrl+C para parar todos os serviços"

# Esperar e capturar Ctrl+C
trap 'echo -e "\n${RED}🛑 Parando serviços...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT

# Manter o script rodando
wait
