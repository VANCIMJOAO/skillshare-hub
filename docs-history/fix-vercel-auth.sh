#!/bin/bash

echo "🔧 CONFIGURAÇÃO AUTOMÁTICA VERCEL - SkillHub"
echo "============================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis necessárias
NEXT_PUBLIC_API_URL="https://skillsharehub-production.up.railway.app"
NEXTAUTH_URL="https://skillsharehub-sigma.vercel.app"
NEXTAUTH_SECRET="68QSERd7on8RG9JHIZ4Wmmn3+I+MaoWb1CsPLF6uY0I="
NODE_ENV="production"

echo -e "${BLUE}📋 CONFIGURANDO VARIÁVEIS DE AMBIENTE:${NC}"
echo ""

# Configurar cada variável
echo -e "${YELLOW}Configurando NEXT_PUBLIC_API_URL...${NC}"
echo "$NEXT_PUBLIC_API_URL" | vercel env add NEXT_PUBLIC_API_URL production

echo -e "${YELLOW}Configurando NEXTAUTH_URL...${NC}"
echo "$NEXTAUTH_URL" | vercel env add NEXTAUTH_URL production

echo -e "${YELLOW}Configurando NEXTAUTH_SECRET...${NC}"
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production

echo -e "${YELLOW}Configurando NODE_ENV...${NC}"
echo "$NODE_ENV" | vercel env add NODE_ENV production

echo ""
echo -e "${GREEN}✅ Variáveis configuradas!${NC}"
echo ""

echo -e "${BLUE}📋 LISTANDO VARIÁVEIS CONFIGURADAS:${NC}"
vercel env ls

echo ""
echo -e "${YELLOW}🚀 Iniciando redeploy...${NC}"

# Fazer redeploy
vercel --prod

echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo -e "${BLUE}🧪 Testando autenticação...${NC}"

# Aguardar um pouco para o deploy ser propagado
sleep 10

# Testar autenticação
AUTH_TEST=$(curl -s -o /dev/null -w "%{http_code}" "https://skillsharehub-sigma.vercel.app/api/auth/providers")

if [ "$AUTH_TEST" = "200" ]; then
    echo -e "${GREEN}🎉 SUCESSO! Autenticação NextAuth está funcionando!${NC}"
    echo -e "${GREEN}✅ Problema resolvido!${NC}"
else
    echo -e "${RED}❌ Ainda há problemas. Status: $AUTH_TEST${NC}"
    echo -e "${YELLOW}Verificando resposta...${NC}"
    curl -s "https://skillsharehub-sigma.vercel.app/api/auth/providers"
fi

echo ""
