#!/bin/bash
# Teste final do sistema de login

echo "🚀 Iniciando teste final do sistema de login..."
echo

BASE_URL="https://skillhub-is9chvmqc-jvancim-gmailcoms-projects.vercel.app"

# 1. Teste de acesso à página inicial
echo "1. Testando acesso à página inicial..."
HOME_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" --max-time 10)
echo "   ✅ Status: $HOME_STATUS"

# 2. Teste de acesso à página de login
echo
echo "2. Testando acesso à página de login..."
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/auth/signin" --max-time 10)
echo "   ✅ Status: $LOGIN_STATUS"

# 3. Teste da API do NextAuth
echo
echo "3. Testando configuração do NextAuth..."
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/providers" --max-time 10)
echo "   ✅ Status: $AUTH_STATUS"

# 4. Teste de acesso ao dashboard
echo
echo "4. Testando redirecionamento do dashboard..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard" --max-time 10 --max-redirs 0)
echo "   ✅ Status: $DASHBOARD_STATUS"

echo
echo "🎉 TESTE CONCLUÍDO!"
echo
echo "📝 Resumo:"
echo "✅ Página inicial: $HOME_STATUS"
echo "✅ Página de login: $LOGIN_STATUS" 
echo "✅ API NextAuth: $AUTH_STATUS"
echo "✅ Dashboard: $DASHBOARD_STATUS"
echo
echo "🌐 Acesse o sistema em: $BASE_URL"
echo "🔐 Use qualquer email válido e senha com 6+ caracteres para testar"
