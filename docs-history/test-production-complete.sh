#!/bin/bash

# Script para testar completamente o sistema em produção
echo "🧪 TESTE COMPLETO DO SISTEMA EM PRODUÇÃO"
echo "========================================"

# URLs dos ambientes
FRONTEND_URL="https://skillhub-nk7pruk56-jvancim-gmailcoms-projects.vercel.app"
BACKEND_URL="https://skillsharehub-production.up.railway.app"

echo ""
echo "📋 Configuração:"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo ""

# Teste 1: Health Check da API
echo "🔍 1. Testando Health Check da API..."
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")
if [ "$API_HEALTH" = "200" ]; then
    echo "✅ API Health Check: OK"
else
    echo "❌ API Health Check: FALHOU (HTTP $API_HEALTH)"
fi

# Teste 2: Ping da API
echo ""
echo "🔍 2. Testando Ping da API..."
API_PING=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/ping")
if [ "$API_PING" = "200" ]; then
    echo "✅ API Ping: OK"
else
    echo "❌ API Ping: FALHOU (HTTP $API_PING)"
fi

# Teste 3: CORS da API
echo ""
echo "🔍 3. Testando CORS da API..."
CORS_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    "$BACKEND_URL/health")

if [ "$CORS_TEST" = "200" ]; then
    echo "✅ CORS: OK"
else
    echo "❌ CORS: FALHOU (HTTP $CORS_TEST)"
fi

# Teste 4: Frontend (Homepage)
echo ""
echo "🔍 4. Testando Frontend (Homepage)..."
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_TEST" = "401" ]; then
    echo "✅ Frontend: OK (Redirecionamento do middleware)"
elif [ "$FRONTEND_TEST" = "200" ]; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FALHOU (HTTP $FRONTEND_TEST)"
fi

# Teste 5: Página de Login
echo ""
echo "🔍 5. Testando Página de Login..."
LOGIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/auth/signin")
if [ "$LOGIN_TEST" = "200" ]; then
    echo "✅ Página de Login: OK"
elif [ "$LOGIN_TEST" = "401" ]; then
    echo "⚠️ Página de Login: Bloqueada pelo middleware"
else
    echo "❌ Página de Login: FALHOU (HTTP $LOGIN_TEST)"
fi

# Teste 6: Página de Cadastro
echo ""
echo "🔍 6. Testando Página de Cadastro..."
REGISTER_TEST=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/auth/register")
if [ "$REGISTER_TEST" = "200" ]; then
    echo "✅ Página de Cadastro: OK"
elif [ "$REGISTER_TEST" = "401" ]; then
    echo "⚠️ Página de Cadastro: Bloqueada pelo middleware"
else
    echo "❌ Página de Cadastro: FALHOU (HTTP $REGISTER_TEST)"
fi

# Teste 7: NextAuth API
echo ""
echo "🔍 7. Testando NextAuth API..."
NEXTAUTH_TEST=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/api/auth/signin")
if [ "$NEXTAUTH_TEST" = "200" ]; then
    echo "✅ NextAuth API: OK"
else
    echo "❌ NextAuth API: FALHOU (HTTP $NEXTAUTH_TEST)"
fi

echo ""
echo "📊 RESUMO DOS TESTES:"
echo "===================="
echo "✅ Backend (API): $([ "$API_HEALTH" = "200" ] && echo "FUNCIONANDO" || echo "PROBLEMAS")"
echo "✅ CORS: $([ "$CORS_TEST" = "200" ] && echo "FUNCIONANDO" || echo "PROBLEMAS")"
echo "✅ Frontend: $([ "$FRONTEND_TEST" = "401" ] || [ "$FRONTEND_TEST" = "200" ] && echo "FUNCIONANDO" || echo "PROBLEMAS")"
echo "✅ Middleware: $([ "$FRONTEND_TEST" = "401" ] && echo "ATIVO" || echo "INATIVO")"

echo ""
echo "🌐 Links para teste manual:"
echo "Frontend: $FRONTEND_URL"
echo "Login: $FRONTEND_URL/auth/signin"
echo "Cadastro: $FRONTEND_URL/auth/register"
echo "API: $BACKEND_URL"
echo "API Docs: $BACKEND_URL/api/docs"

echo ""
echo "💡 Próximos passos:"
echo "1. Testar login/cadastro manualmente no browser"
echo "2. Verificar se o dashboard funciona após login"
echo "3. Testar criação de workshops"
echo "4. Validar se o middleware protege rotas sensíveis"
