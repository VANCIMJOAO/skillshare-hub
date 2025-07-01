#!/bin/bash

echo "🚀 Deploy SkillHub Frontend no Vercel"
echo "====================================="

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Preparando deploy do frontend...${NC}"

# Verificar se está na pasta correta
if [ ! -f "apps/web/package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script da pasta raiz do projeto SkillHub${NC}"
    exit 1
fi

# Navegar para a pasta do frontend
cd apps/web

echo -e "${BLUE}📍 Navegado para: $(pwd)${NC}"

# Verificar se o Next.js está instalado
if grep -q '"next"' package.json; then
    echo -e "${GREEN}✅ Next.js encontrado no package.json${NC}"
else
    echo -e "${RED}❌ Next.js não encontrado no package.json${NC}"
    exit 1
fi

# Build local para verificar
echo -e "${YELLOW}🔨 Fazendo build local para verificar...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build local concluído com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro no build local${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🌐 Instruções para deploy no Vercel:${NC}"
echo ""
echo "1. Certifique-se de estar na pasta do frontend:"
echo "   cd apps/web"
echo ""
echo "2. Instale o Vercel CLI (se não tiver):"
echo "   npm i -g vercel"
echo ""
echo "3. Login no Vercel:"
echo "   vercel login"
echo ""
echo "4. Deploy do frontend (a partir da pasta apps/web):"
echo "   vercel --prod"
echo ""
echo "5. Configure as seguintes variáveis no Vercel Dashboard:"
echo "   - NEXT_PUBLIC_API_URL: https://skillsharehub-production.up.Railway.app"
echo "   - NEXTAUTH_SECRET: [gerar-um-secret-seguro]"
echo "   - NEXTAUTH_URL: [url-do-seu-deploy-vercel]"
echo ""

echo -e "${GREEN}📄 Arquivos de configuração prontos:${NC}"
echo "   ✅ apps/web/vercel.json - Configuração do Vercel"
echo "   ✅ apps/web/package.json - Next.js 14 configurado"
echo "   ✅ apps/web/.env.example - Exemplo de variáveis"
echo ""

echo -e "${YELLOW}🎯 Comando direto para deploy:${NC}"
echo "cd apps/web && vercel --prod"
echo ""

echo -e "${GREEN}✅ Frontend pronto para deploy!${NC}"
echo -e "${BLUE}📍 Certifique-se de executar 'vercel --prod' a partir da pasta apps/web${NC}"
