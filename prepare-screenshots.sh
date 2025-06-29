#!/bin/bash

# 🔧 SCRIPT AUTOMÁTICO PARA PREPARAR CAPTURAS

echo "🎯 ======================================="
echo "🎯 PREPARANDO AMBIENTE PARA CAPTURAS"
echo "🎯 ======================================="
echo ""

# Criar estrutura de pastas
echo "📁 Criando estrutura de pastas..."
mkdir -p screenshots/{desktop,mobile,gifs}
mkdir -p docs/images

# Verificar se servidores estão rodando
echo "🔍 Verificando servidores..."

if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Frontend não está rodando!"
    echo "▶️  Execute: cd apps/web && npm run dev"
    exit 1
fi

if ! curl -s http://localhost:3004 > /dev/null; then
    echo "❌ Backend não está rodando!"
    echo "▶️  Execute: cd apps/api && npm run dev"
    exit 1
fi

echo "✅ Ambos servidores rodando!"
echo ""

# Instalar ferramentas se necessário (Ubuntu/Debian)
echo "🛠️  Verificando ferramentas de captura..."

if ! command -v gnome-screenshot &> /dev/null; then
    echo "📦 Instalando gnome-screenshot..."
    sudo apt update && sudo apt install -y gnome-screenshot
fi

if ! command -v peek &> /dev/null; then
    echo "📦 Instalando peek para GIFs..."
    sudo apt update && sudo apt install -y peek
fi

echo "✅ Ferramentas prontas!"
echo ""

# URLs para capturar
echo "📸 URLs PRONTAS PARA CAPTURA:"
echo ""
echo "🏠 Homepage:"
echo "   http://localhost:3000"
echo ""
echo "🎓 Workshop Details:"
echo "   http://localhost:3000/workshops/a46b2e55-4551-437f-ac92-b1acdfffc1a2"
echo ""
echo "🧪 Connection Test:"
echo "   http://localhost:3000/test-connection"
echo ""
echo "📊 Workshops List:"
echo "   http://localhost:3000/workshops-test"
echo ""
echo "🔐 Auth Test:"
echo "   http://localhost:3000/auth-test"
echo ""
echo "📈 API Docs:"
echo "   http://localhost:3004/api-docs"
echo ""

# Script para capturas automáticas
echo "🎯 ======================================="
echo "🎯 COMANDOS PARA CAPTURA RÁPIDA"
echo "🎯 ======================================="
echo ""

echo "📸 SCREENSHOTS DESKTOP:"
cat << 'EOF'

# Homepage
gnome-screenshot -w -f screenshots/desktop/01-homepage.png

# Workshop Details  
gnome-screenshot -w -f screenshots/desktop/02-workshop-details.png

# API Docs
gnome-screenshot -w -f screenshots/desktop/03-api-docs.png

# Connection Test
gnome-screenshot -w -f screenshots/desktop/04-connection-test.png

EOF

echo "🎥 GIFS (usar peek interface gráfica):"
echo "   1. Abra 'peek' no terminal"
echo "   2. Posicione sobre área desejada"  
echo "   3. Grave navegação homepage → workshop"
echo "   4. Salve como screenshots/gifs/navigation-flow.gif"
echo ""

echo "📱 MOBILE (Chrome DevTools):"
echo "   1. F12 → Toggle device toolbar"
echo "   2. Selecione iPhone/iPad"
echo "   3. Capture com Ctrl+Shift+P → Screenshot"
echo ""

echo "🎊 AMBIENTE PRONTO! COMECE AS CAPTURAS!"
echo "💡 Dica: Abra cada URL em abas separadas para captura rápida"
