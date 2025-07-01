#!/bin/bash
# Teste específico do sistema de login após correções

echo "🔐 Testando sistema de login após correções..."
echo

BASE_URL="https://skillhub-is9chvmqc-jvancim-gmailcoms-projects.vercel.app"

# Aguardar deploy
echo "⏳ Aguardando deploy ser concluído..."
sleep 60

echo
echo "1. Testando página inicial..."
HOME_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" --max-time 15)
echo "   Status: $HOME_STATUS"

echo
echo "2. Testando página de login..."
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/auth/signin" --max-time 15)
echo "   Status: $LOGIN_STATUS"

echo
echo "3. Testando API NextAuth providers..."
PROVIDERS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/providers" --max-time 15)
echo "   Status: $PROVIDERS_STATUS"

echo
echo "4. Testando API NextAuth session..."
SESSION_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/session" --max-time 15)
echo "   Status: $SESSION_STATUS"

echo
echo "5. Testando acesso ao dashboard (deve redirecionar)..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard" --max-time 15 --max-redirs 0)
echo "   Status: $DASHBOARD_STATUS"

echo
echo "📋 RESUMO DOS TESTES:"
echo "✅ Página inicial: $HOME_STATUS"
echo "✅ Página de login: $LOGIN_STATUS"
echo "✅ API Providers: $PROVIDERS_STATUS"
echo "✅ API Session: $SESSION_STATUS"
echo "✅ Dashboard redirect: $DASHBOARD_STATUS"

echo
echo "🌐 Para testar o login:"
echo "1. Acesse: $BASE_URL/auth/signin"
echo "2. Use: admin@skillhub.com / 123456"
echo "3. Ou qualquer email válido + senha 6+ caracteres"
echo
echo "🔍 Verifique se não há mais erros 404 em /api/auth/error"
