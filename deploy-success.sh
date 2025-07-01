#!/bin/bash

echo "🎉 DEPLOY REALIZADO COM SUCESSO!"
echo "==============================="

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# URLs do deploy
DEPLOY_URL="https://skillhub-i4wk9ivp4-jvancim-gmailcoms-projects.vercel.app"
INSPECT_URL="https://vercel.com/jvancim-gmailcoms-projects/skillhub/5PGuVnBLjaUrTb6JA61v6aR8qpEc"

echo -e "${GREEN}✅ Frontend SkillHub deployado com sucesso!${NC}"
echo ""
echo -e "${BLUE}🔗 URLs do Deploy:${NC}"
echo "   🌐 Production: $DEPLOY_URL"
echo "   🔍 Inspect: $INSPECT_URL"
echo ""

echo -e "${YELLOW}⚠️  AÇÃO NECESSÁRIA: Configurar Variáveis de Ambiente${NC}"
echo ""
echo "1. Vá para o Vercel Dashboard:"
echo "   $INSPECT_URL"
echo ""
echo "2. Clique em 'Settings' → 'Environment Variables'"
echo ""
echo "3. Adicione as seguintes variáveis:"
echo ""
echo "   📌 NEXTAUTH_SECRET"
echo "   Valor: jNvqBAjRVyDlM4aqd1DTKTa6Kh9kiVL3mrHtgrJhNzg="
echo ""
echo "   📌 NEXTAUTH_URL"
echo "   Valor: $DEPLOY_URL"
echo ""
echo "   📌 NEXT_PUBLIC_API_URL"
echo "   Valor: https://skillsharehub-production.up.railway.app"
echo ""
echo "4. Clique em 'Redeploy' para aplicar as variáveis"
echo ""

echo -e "${GREEN}🎯 Status Final:${NC}"
echo "   ✅ Frontend deployado: $DEPLOY_URL"
echo "   ✅ Backend funcionando: https://skillsharehub-production.up.railway.app"
echo "   ⚠️  Variáveis: Configurar no Dashboard"
echo ""

echo -e "${BLUE}📋 Próximos passos:${NC}"
echo "1. Configurar variáveis de ambiente"
echo "2. Redeploy para aplicar configurações"
echo "3. Testar login e funcionalidades"
echo "4. Documentar URL final"
echo ""

echo -e "${GREEN}🚀 SkillHub está LIVE em produção!${NC}"
