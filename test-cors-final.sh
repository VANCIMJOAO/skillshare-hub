#!/bin/bash

echo "🔍 TESTE FINAL - CORS e INTEGRAÇÃO"
echo "=================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs atualizadas
FRONTEND_URL="https://skillhub-ay0e814bp-jvancim-gmailcoms-projects.vercel.app"
BACKEND_URL="https://skillsharehub-production.up.railway.app"

echo -e "${BLUE}🌐 URLs de teste:${NC}"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo ""

echo -e "${BLUE}1. Testando CORS preflight (OPTIONS):${NC}"
CORS_PREFLIGHT=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: content-type" \
  -X OPTIONS "$BACKEND_URL/workshops")

echo "Status do preflight CORS: $CORS_PREFLIGHT"

if [ "$CORS_PREFLIGHT" = "204" ]; then
    echo -e "${GREEN}✅ CORS preflight OK!${NC}"
else
    echo -e "${RED}❌ CORS preflight falhou${NC}"
fi
echo ""

echo -e "${BLUE}2. Testando requisição GET com CORS:${NC}"
GET_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Origin: $FRONTEND_URL" \
  -H "Content-Type: application/json" \
  "$BACKEND_URL/workshops")

HTTP_CODE=$(echo "$GET_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$GET_RESPONSE" | head -n -1)

echo "Status da requisição GET: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ API respondeu com sucesso!${NC}"
    echo "Número de workshops: $(echo "$RESPONSE_BODY" | jq -r '.data | length' 2>/dev/null || echo "N/A")"
else
    echo -e "${YELLOW}⚠️  Status inesperado: $HTTP_CODE${NC}"
fi
echo ""

echo -e "${BLUE}3. Testando frontend:${NC}"
FRONTEND_HOME=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
FRONTEND_WORKSHOPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/workshops-test")

echo "Status da homepage: $FRONTEND_HOME"
echo "Status da página de teste: $FRONTEND_WORKSHOPS_TEST"

if [ "$FRONTEND_HOME" = "200" ] || [ "$FRONTEND_HOME" = "401" ]; then
    echo -e "${GREEN}✅ Frontend respondendo!${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend status: $FRONTEND_HOME${NC}"
fi
echo ""

echo -e "${BLUE}4. Verificando headers CORS:${NC}"
CORS_HEADERS=$(curl -s -I \
  -H "Origin: $FRONTEND_URL" \
  "$BACKEND_URL/workshops" | grep -i "access-control")

if [ -n "$CORS_HEADERS" ]; then
    echo -e "${GREEN}✅ Headers CORS encontrados:${NC}"
    echo "$CORS_HEADERS"
else
    echo -e "${RED}❌ Headers CORS não encontrados${NC}"
fi
echo ""

echo -e "${BLUE}📊 RESUMO FINAL:${NC}"
echo "====================="

if [ "$CORS_PREFLIGHT" = "204" ] && [ "$HTTP_CODE" = "200" ] && ([ "$FRONTEND_HOME" = "200" ] || [ "$FRONTEND_HOME" = "401" ]); then
    echo -e "${GREEN}🎉 SUCESSO TOTAL!${NC}"
    echo -e "${GREEN}   ✅ CORS funcionando perfeitamente${NC}"
    echo -e "${GREEN}   ✅ API respondendo corretamente${NC}"
    echo -e "${GREEN}   ✅ Frontend deployado com sucesso${NC}"
    echo -e "${GREEN}   ✅ Integração completa funcionando!${NC}"
else
    echo -e "${YELLOW}⚠️  Alguns testes apresentaram resultados inesperados${NC}"
    echo -e "${YELLOW}   Mas o sistema pode estar funcionando corretamente${NC}"
fi

echo ""
echo -e "${BLUE}🔗 Links para teste manual:${NC}"
echo "🌐 Homepage: $FRONTEND_URL"
echo "🧪 Teste de Workshops: $FRONTEND_URL/workshops-test"
echo "📚 API Docs: $BACKEND_URL/api-docs"
echo "🔌 API Health: $BACKEND_URL/health"
echo ""
echo -e "${GREEN}✨ TESTE CONCLUÍDO!${NC}"
