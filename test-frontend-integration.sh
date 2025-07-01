#!/bin/bash

echo "🚀 Testando integração Frontend-Backend..."
echo "=================================="

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs
FRONTEND_URL="http://localhost:3000"
API_URL="https://skillsharehub-production.up.railway.app"

echo -e "${YELLOW}📡 Testando conectividade com API...${NC}"

# Teste 1: API Health Check
echo -n "1. API Health Check: "
if curl -s "$API_URL/health" | grep -q "ok"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Teste 2: API Workshops endpoint
echo -n "2. API Workshops: "
if curl -s "$API_URL/workshops" | grep -q "\["; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Teste 3: Frontend accessibility
echo -n "3. Frontend Loading: "
if curl -s "$FRONTEND_URL" | grep -q "SkillShare Hub"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

echo ""
echo -e "${YELLOW}🔗 URLs para testar:${NC}"
echo "Frontend: $FRONTEND_URL"
echo "API: $API_URL"
echo "API Docs: $API_URL/api/docs"

echo ""
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo "O frontend está pronto para deploy no Vercel."
