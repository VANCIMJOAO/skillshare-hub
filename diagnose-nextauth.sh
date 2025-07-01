#!/bin/bash

echo "🔍 DIAGNÓSTICO DETALHADO - NextAuth Vercel"
echo "=========================================="
echo ""

# URLs para teste
FRONTEND_URL="https://skillsharehub-sigma.vercel.app"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 TESTANDO ENDPOINTS NEXTAUTH:${NC}"
echo ""

# Teste direto do providers
echo -e "${YELLOW}1. Testando /api/auth/providers:${NC}"
PROVIDERS_RESPONSE=$(curl -s "$FRONTEND_URL/api/auth/providers")
PROVIDERS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/api/auth/providers")

echo "Status: $PROVIDERS_STATUS"
echo "Response: $PROVIDERS_RESPONSE"
echo ""

# Teste direto do session
echo -e "${YELLOW}2. Testando /api/auth/session:${NC}"
SESSION_RESPONSE=$(curl -s "$FRONTEND_URL/api/auth/session")
SESSION_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/api/auth/session")

echo "Status: $SESSION_STATUS"
echo "Response: $SESSION_RESPONSE"
echo ""

# Teste direto do signin
echo -e "${YELLOW}3. Testando /auth/signin:${NC}"
SIGNIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/auth/signin")
echo "Status: $SIGNIN_STATUS"
echo ""

# Verificação das variáveis
echo -e "${BLUE}📋 VARIÁVEIS ESPERADAS NO VERCEL:${NC}"
echo ""
echo "NEXTAUTH_URL: https://skillsharehub-sigma.vercel.app"
echo "NEXTAUTH_SECRET: 68QSERd7on8RG9JHIZ4Wmmn3+I+MaoWb1CsPLF6uY0I="
echo "NEXT_PUBLIC_API_URL: https://skillsharehub-production.up.railway.app"
echo "NODE_ENV: production"
echo ""

# Análise
if [[ "$PROVIDERS_STATUS" == "200" && "$SESSION_STATUS" == "200" ]]; then
    echo -e "${GREEN}🎉 SUCESSO! NextAuth está funcionando!${NC}"
elif [[ "$PROVIDERS_RESPONSE" == *"server configuration"* ]]; then
    echo -e "${RED}❌ PROBLEMA: Configuração do servidor${NC}"
    echo -e "${YELLOW}💡 SOLUÇÃO:${NC}"
    echo "1. Verifique se NEXTAUTH_URL está exatamente: https://skillsharehub-sigma.vercel.app"
    echo "2. Verifique se NEXTAUTH_SECRET está completo no Vercel"
    echo "3. Faça redeploy após corrigir as variáveis"
elif [[ "$PROVIDERS_RESPONSE" == *"NO_SECRET"* ]]; then
    echo -e "${RED}❌ PROBLEMA: NEXTAUTH_SECRET não encontrado${NC}"
    echo -e "${YELLOW}💡 SOLUÇÃO: Configure NEXTAUTH_SECRET no Vercel${NC}"
else
    echo -e "${RED}❌ PROBLEMA DESCONHECIDO${NC}"
    echo "Response completa: $PROVIDERS_RESPONSE"
fi

echo ""
