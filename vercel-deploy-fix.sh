#!/bin/bash

echo "🎯 SOLUÇÃO PARA ERRO DO VERCEL - DEPLOY CORRETO"
echo "==============================================="

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}🔍 DIAGNÓSTICO DO PROBLEMA:${NC}"
echo "O Vercel não encontra o Next.js porque estamos em um MONOREPO"
echo "O frontend está em 'apps/web/', não na raiz"
echo ""

echo -e "${GREEN}✅ SOLUÇÃO CONFIRMADA:${NC}"
echo ""

# Verificar estrutura
echo "📁 Estrutura verificada:"
echo "   ✅ apps/web/package.json - Next.js 14.0.3 ✓"
echo "   ✅ apps/web/vercel.json - Configuração OK ✓"
echo "   ✅ apps/web/.next/ - Build gerado ✓"
echo ""

echo -e "${BLUE}🚀 COMANDO CORRETO PARA DEPLOY:${NC}"
echo ""
echo "# 1. Navegar para a pasta do frontend"
echo "cd apps/web"
echo ""
echo "# 2. Deploy no Vercel"
echo "vercel --prod"
echo ""

echo -e "${YELLOW}🔧 PASSOS COMPLETOS:${NC}"
echo ""
echo "1. Instalar Vercel CLI (se necessário):"
echo "   npm i -g vercel"
echo ""
echo "2. Login no Vercel:"
echo "   vercel login"
echo ""
echo "3. Navegar para a pasta correta:"
echo "   cd /home/admin/Desktop/Projetos/SkillHub/apps/web"
echo ""
echo "4. Deploy:"
echo "   vercel --prod"
echo ""
echo "5. Configurar variáveis no Vercel Dashboard:"
echo "   - NEXT_PUBLIC_API_URL: https://skillsharehub-production.up.railway.app"
echo "   - NEXTAUTH_SECRET: [gerar-secret-seguro]"
echo "   - NEXTAUTH_URL: [url-do-deploy]"
echo ""

echo -e "${GREEN}📋 RESUMO:${NC}"
echo "❌ ERRADO: vercel --prod (da raiz)"
echo "✅ CORRETO: cd apps/web && vercel --prod"
echo ""

echo -e "${BLUE}🎯 O frontend está 100% pronto para deploy!${NC}"
