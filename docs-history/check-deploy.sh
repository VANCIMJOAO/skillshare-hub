#!/bin/bash

echo "🔍 Verificando status dos deploys..."
echo ""

# Verificar API Railway
echo "📡 Testando API Railway..."
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://skillsharehub-production.up.railway.app/health)
if [ "$API_HEALTH" == "200" ]; then
    echo "✅ API Health Check: OK"
else
    echo "❌ API Health Check: FALHOU (HTTP $API_HEALTH)"
fi

API_PING=$(curl -s -o /dev/null -w "%{http_code}" https://skillsharehub-production.up.railway.app/ping)
if [ "$API_PING" == "200" ]; then
    echo "✅ API Ping: OK"
else
    echo "❌ API Ping: FALHOU (HTTP $API_PING)"
fi

API_DOCS=$(curl -s -o /dev/null -w "%{http_code}" https://skillsharehub-production.up.railway.app/api/docs)
if [ "$API_DOCS" == "200" ]; then
    echo "✅ API Docs: OK"
else
    echo "❌ API Docs: FALHOU (HTTP $API_DOCS)"
fi

echo ""

# Verificar Frontend Vercel
echo "🌐 Testando Frontend Vercel..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://skillshare-hub-wine.vercel.app)
if [ "$FRONTEND_STATUS" == "200" ]; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FALHOU (HTTP $FRONTEND_STATUS)"
fi

echo ""
echo "🔗 Links importantes:"
echo "API: https://skillsharehub-production.up.railway.app"
echo "API Docs: https://skillsharehub-production.up.railway.app/api/docs"
echo "Frontend: https://skillshare-hub-wine.vercel.app"
echo "GitHub Repo: https://github.com/VANCIMJOAO/skillshare-hub"
echo "Profile: https://github.com/VANCIMJOAO/VANCIMJOAO"
