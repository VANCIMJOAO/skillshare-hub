#!/bin/bash

echo "🔧 CONFIGURAÇÃO VERCEL - SkillHub"
echo "================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 VARIÁVEIS DE AMBIENTE NECESSÁRIAS PARA O VERCEL:${NC}"
echo ""

echo -e "${YELLOW}Frontend (Vercel):${NC}"
echo "NEXT_PUBLIC_API_URL=https://skillsharehub-production.up.railway.app"
echo "NEXTAUTH_URL=https://skillsharehub-sigma.vercel.app"
echo "NEXTAUTH_SECRET=68QSERd7on8RG9JHIZ4Wmmn3+I+MaoWb1CsPLF6uY0I="
echo "NODE_ENV=production"
echo ""

echo -e "${BLUE}🚀 COMANDOS PARA CONFIGURAR NO VERCEL:${NC}"
echo ""

echo -e "${GREEN}# Opção 1: Via Vercel CLI${NC}"
echo "vercel env add NEXT_PUBLIC_API_URL"
echo "# Cole: https://skillsharehub-production.up.railway.app"
echo ""
echo "vercel env add NEXTAUTH_URL"  
echo "# Cole: https://skillsharehub-sigma.vercel.app"
echo ""
echo "vercel env add NEXTAUTH_SECRET"
echo "# Cole: 68QSERd7on8RG9JHIZ4Wmmn3+I+MaoWb1CsPLF6uY0I="
echo ""
echo "vercel env add NODE_ENV"
echo "# Cole: production"
echo ""

echo -e "${GREEN}# Opção 2: Via Dashboard Vercel${NC}"
echo "1. Acesse: https://vercel.com/dashboard"
echo "2. Selecione o projeto: skillsharehub"
echo "3. Vá em Settings > Environment Variables"
echo "4. Adicione as variáveis listadas acima"
echo ""

echo -e "${RED}🔄 APÓS CONFIGURAR AS VARIÁVEIS:${NC}"
echo "vercel --prod  # Redeploy para aplicar as variáveis"
echo ""

echo -e "${BLUE}🔍 TESTE DE VERIFICAÇÃO:${NC}"
echo "curl -s https://skillsharehub-sigma.vercel.app/api/auth/session"
echo "# Deve retornar JSON em vez de erro 500"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "- Use NEXTAUTH_URL com a URL de produção do Vercel"
echo "- O NEXTAUTH_SECRET deve ser consistente entre deploys"
echo "- Todas as variáveis devem ser configuradas como 'Production'"
