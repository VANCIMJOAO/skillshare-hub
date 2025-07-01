#!/bin/bash

echo "🧪 TESTE DE AUTENTICAÇÃO VERCEL - SkillHub"
echo "=========================================="
echo ""

# URLs para teste
FRONTEND_URL="https://skillsharehub-sigma.vercel.app"
BACKEND_URL="https://skillsharehub-production.up.railway.app"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 TESTANDO BACKEND RAILWAY:${NC}"
echo ""

# Teste do backend
echo -n "🔍 Health Check: "
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")
if [ "$HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ $HEALTH${NC}"
else
    echo -e "${RED}❌ $HEALTH${NC}"
fi

echo -n "🔍 Ping endpoint: "
PING=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/ping")
if [ "$PING" = "200" ]; then
    echo -e "${GREEN}✅ $PING${NC}"
else
    echo -e "${RED}❌ $PING${NC}"
fi

echo -n "🔍 Workshops API: "
WORKSHOPS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/workshops")
if [ "$WORKSHOPS" = "200" ]; then
    echo -e "${GREEN}✅ $WORKSHOPS${NC}"
else
    echo -e "${RED}❌ $WORKSHOPS${NC}"
fi

echo ""
echo -e "${BLUE}📋 TESTANDO FRONTEND VERCEL:${NC}"
echo ""

# Teste do frontend
echo -n "🔍 Homepage: "
HOMEPAGE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$HOMEPAGE" = "200" ]; then
    echo -e "${GREEN}✅ $HOMEPAGE${NC}"
else
    echo -e "${RED}❌ $HOMEPAGE${NC}"
fi

echo -n "🔍 NextAuth Providers: "
PROVIDERS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/api/auth/providers")
if [ "$PROVIDERS" = "200" ]; then
    echo -e "${GREEN}✅ $PROVIDERS - Autenticação OK!${NC}"
else
    echo -e "${RED}❌ $PROVIDERS - Falha na autenticação!${NC}"
    echo -e "${YELLOW}Verificando logs...${NC}"
    curl -s "$FRONTEND_URL/api/auth/providers" | head -200
fi

echo -n "🔍 NextAuth Session: "
SESSION=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/api/auth/session")
if [ "$SESSION" = "200" ]; then
    echo -e "${GREEN}✅ $SESSION - Session endpoint OK!${NC}"
else
    echo -e "${RED}❌ $SESSION - Session endpoint falhou!${NC}"
fi

echo ""
echo -e "${BLUE}📋 RESUMO:${NC}"
echo ""

if [ "$PROVIDERS" = "200" ] && [ "$SESSION" = "200" ]; then
    echo -e "${GREEN}🎉 SUCESSO! Autenticação NextAuth está funcionando!${NC}"
    echo -e "${GREEN}✅ Frontend Vercel: Operacional${NC}"
    echo -e "${GREEN}✅ Backend Railway: Operacional${NC}"
    echo -e "${GREEN}✅ Autenticação: Funcionando${NC}"
    echo ""
    echo -e "${BLUE}🌐 Links para teste:${NC}"
    echo "Frontend: $FRONTEND_URL"
    echo "Backend: $BACKEND_URL"
    echo "API Docs: $BACKEND_URL/api/docs"
else
    echo -e "${RED}❌ PROBLEMA: Autenticação NextAuth ainda com erro!${NC}"
    echo -e "${YELLOW}Possíveis causas:${NC}"
    echo "- Variáveis de ambiente não configuradas no Vercel"
    echo "- Deploy não foi concluído com sucesso"
    echo "- Problema na configuração do NextAuth"
fi

echo ""
