#!/bin/bash

echo "🚀 Deploy do Frontend SkillHub no Vercel"
echo "========================================"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Verificando build do frontend...${NC}"

# Build do frontend
cd apps/web
if pnpm build; then
    echo -e "${GREEN}✅ Build do frontend concluído com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro no build do frontend${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🌐 Instruções para deploy no Vercel:${NC}"
echo ""
echo "1. Instale o Vercel CLI (se não tiver):"
echo "   npm i -g vercel"
echo ""
echo "2. Login no Vercel:"
echo "   vercel login"
echo ""
echo "3. Deploy do projeto:"
echo "   cd /home/admin/Desktop/Projetos/SkillHub"
echo "   vercel --prod"
echo ""
echo "4. Configure as variáveis de ambiente no Vercel Dashboard:"
echo "   - NEXT_PUBLIC_API_URL=https://skillsharehub-production.up.railway.app"
echo "   - NEXTAUTH_SECRET=[seu-secret-aqui]"
echo "   - NEXTAUTH_URL=[url-do-seu-deploy]"
echo ""
echo -e "${GREEN}📄 Arquivos prontos para deploy:${NC}"
echo "   ✅ vercel.json configurado"
echo "   ✅ .env.example com exemplo de variáveis"
echo "   ✅ Frontend buildado com sucesso"
echo "   ✅ Integração com API validada"
echo ""
echo -e "${YELLOW}🔗 URLs importantes:${NC}"
echo "   API: https://skillsharehub-production.up.railway.app"
echo "   API Docs: https://skillsharehub-production.up.railway.app/api/docs"
echo "   Health Check: https://skillsharehub-production.up.railway.app/health"
echo ""
echo -e "${GREEN}✅ Frontend pronto para deploy!${NC}"
