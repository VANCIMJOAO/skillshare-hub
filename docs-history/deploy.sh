#!/bin/bash

# 🚀 SCRIPT DE DEPLOY AUTOMATIZADO - SKILLSHARE HUB

echo "🎯 =========================================="
echo "🎯 SKILLSHARE HUB - DEPLOY AUTOMATIZADO"
echo "🎯 =========================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto"
    exit 1
fi

echo "ℹ️  Preparando deploy..."

# 1. Verificar se os builds funcionam
echo ""
echo "🔧 Testando build do backend..."
cd apps/api
if pnpm run build; then
    echo "✅ Backend build OK"
else
    echo "❌ Backend build falhou. Corrija os erros primeiro."
    exit 1
fi

echo ""
echo "📱 Testando build do frontend..."
cd ../web
if pnpm run build; then
    echo "✅ Frontend build OK"
else
    echo "❌ Frontend build falhou. Corrija os erros primeiro."
    exit 1
fi

cd ../..

echo ""
echo "🎯 =========================================="
echo "🎯 BUILDS OK - PRONTO PARA DEPLOY"
echo "🎯 =========================================="
echo ""

echo "📋 PRÓXIMOS PASSOS MANUAIS:"
echo ""
echo "1. 🌐 FRONTEND (Vercel):"
echo "   - Acesse: https://vercel.com"
echo "   - Conecte seu repositório GitHub"
echo "   - Configure build settings:"
echo "     • Framework: Next.js"
echo "     • Root Directory: apps/web"
echo "     • Build Command: pnpm run build"
echo "     • Output Directory: .next"
echo ""

echo "2. 🔧 BACKEND (Railway):"
echo "   - Acesse: https://railway.app"
echo "   - Conecte seu repositório GitHub"
echo "   - Configure deploy settings:"
echo "     • Root Directory: apps/api"
echo "     • Build Command: pnpm run build"
echo "     • Start Command: node dist/main.js"
echo ""

echo "3. 🗃️ DATABASE (Neon):"
echo "   - Acesse: https://neon.tech"
echo "   - Crie novo projeto"
echo "   - Copie a connection string"
echo ""

echo "4. ⚙️ VARIÁVEIS DE AMBIENTE:"
echo ""
echo "   VERCEL (Frontend):"
echo "   NEXT_PUBLIC_API_URL=https://seu-backend.railway.app"
echo "   NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "   NEXTAUTH_URL=https://seu-frontend.vercel.app"
echo ""
echo "   RAILWAY (Backend):"
echo "   DATABASE_URL=sua-connection-string-neon"
echo "   JWT_SECRET=$(openssl rand -base64 32)"
echo "   NODE_ENV=production"
echo "   PORT=3000"
echo ""

echo "🎯 =========================================="
echo "🎯 COMANDOS ÚTEIS"
echo "🎯 =========================================="
echo ""

echo "📦 Instalar CLIs (se necessário):"
echo "npm i -g vercel @railway/cli"
echo ""

echo "🌐 Deploy Vercel (via CLI):"
echo "cd apps/web && vercel --prod"
echo ""

echo "🔧 Deploy Railway (via CLI):"
echo "cd apps/api && railway login && railway up"
echo ""

echo "🎯 =========================================="
echo "🎯 VERIFICAÇÃO PÓS-DEPLOY"
echo "🎯 =========================================="
echo ""

echo "Após o deploy, teste:"
echo "✅ Frontend carrega"
echo "✅ Backend responde"
echo "✅ Login funciona"
echo "✅ Notificações funcionam"
echo "✅ Upload funciona"
echo "✅ Reviews funcionam"
echo "✅ Analytics carrega"
echo ""

echo "🚀 URLs finais:"
echo "🌐 App: https://skillshare-hub.vercel.app"
echo "🔧 API: https://skillshare-hub-api.railway.app"
echo "📋 Docs: https://skillshare-hub-api.railway.app/api-docs"
echo ""

echo "🎊 SUCESSO! Seu SkillShare Hub estará no ar!"
echo "🎊 Pronto para impressionar recrutadores!"

# Criar arquivo de configuração do Vercel
echo ""
echo "📝 Criando vercel.json..."
cat > vercel.json << 'EOF'
{
  "name": "skillshare-hub",
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ]
}
EOF

echo "✅ vercel.json criado"

# Criar Procfile para Railway
echo ""
echo "📝 Criando Procfile para Railway..."
echo "web: cd apps/api && node dist/main.js" > Procfile
echo "✅ Procfile criado"

echo ""
echo "🎯 ARQUIVOS DE DEPLOY CRIADOS:"
echo "✅ vercel.json (configuração Vercel)"
echo "✅ Procfile (configuração Railway)"
echo ""

echo "🚀 PRONTO PARA DEPLOY!"
