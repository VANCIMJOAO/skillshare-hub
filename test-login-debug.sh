#!/bin/bash

echo "🔍 TESTANDO LOGIN COM LOGS DETALHADOS"
echo "====================================="

# URLs
FRONTEND_URL="https://skillhub-dgysyoukb-jvancim-gmailcoms-projects.vercel.app"
API_URL="https://skillsharehub-production.up.railway.app"

echo "🌐 URLs de Teste:"
echo "   Frontend: $FRONTEND_URL"
echo "   API: $API_URL"
echo ""

echo "📋 INSTRUÇÕES PARA TESTAR LOGIN:"
echo ""
echo "1. Abra o navegador em: $FRONTEND_URL"
echo "2. Clique em 'Fazer Login'"
echo "3. Use qualquer email/senha (ex: test@test.com / 123456)"
echo "4. Abra o DevTools (F12) → Console"
echo "5. Observe os logs detalhados durante o login"
echo ""

echo "🔍 LOGS QUE VOCÊ DEVE VER:"
echo ""
echo "✅ Frontend (Console do Navegador):"
echo "   🏗️ PROVIDERS INITIALIZED"
echo "   🔧 NEXTAUTH CONFIG LOADED"
echo "   🚪 LOGIN FORM SUBMIT START"
echo "   📡 CALLING signIn with credentials provider"
echo "   🔍 AUTHORIZE START"
echo "   🌐 API CALL PREP"
echo "   📡 API RESPONSE"
echo "   ✅ LOGIN SUCCESS ou ❌ LOGIN ERROR"
echo ""

echo "✅ Backend (Railway Logs):"
echo "   POST /auth/login"
echo "   Response status e dados"
echo ""

echo "🚨 SE HOUVER ERROS, PROCURE POR:"
echo "   ❌ AUTHORIZE FAIL"
echo "   💥 AUTHORIZE ERROR"
echo "   ❌ API LOGIN FAIL"
echo "   📋 SIGNIN RESULT com error"
echo ""

echo "📊 Acesse os logs do Railway:"
echo "   https://railway.app/project/38e189bc-ad0d-4f8d-b0ce-a1a70f803938"
echo ""

echo "🎯 TESTE AGORA:"
echo "   $FRONTEND_URL/auth/signin"
