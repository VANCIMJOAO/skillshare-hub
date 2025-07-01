#!/bin/bash

# 📸 SCRIPT PARA CAPTURAR SCREENSHOTS DO SKILLSHARE HUB

echo "🎯 ======================================="
echo "🎯 SKILLSHARE HUB - CAPTURA DE SCREENSHOTS"
echo "🎯 ======================================="
echo ""

# Verificar se a aplicação está rodando
echo "ℹ️  Verificando se a aplicação está rodando..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend rodando em http://localhost:3000"
else
    echo "❌ Frontend não está rodando. Execute: npm run dev"
    exit 1
fi

if curl -s http://localhost:3004 > /dev/null; then
    echo "✅ Backend rodando em http://localhost:3004"
else
    echo "❌ Backend não está rodando. Execute: npm run dev"
    exit 1
fi

echo ""
echo "🎯 ======================================="
echo "🎯 GUIA PARA CAPTURAR SCREENSHOTS"
echo "🎯 ======================================="
echo ""

echo "📸 PÁGINAS PARA CAPTURAR:"
echo ""
echo "1. 🏠 LANDING PAGE"
echo "   URL: http://localhost:3000"
echo "   Capturar: Hero section + lista de workshops"
echo ""

echo "2. 📊 WORKSHOP DETAILS"
echo "   URL: http://localhost:3000/workshops/a46b2e55-4551-437f-ac92-b1acdfffc1a2"
echo "   Capturar: Detalhes completos + botão de inscrição"
echo ""

echo "3. 🧪 CONNECTION TEST"
echo "   URL: http://localhost:3000/test-connection"
echo "   Capturar: Status da conexão Frontend-Backend"
echo ""

echo "4. 🎓 WORKSHOPS LIST"
echo "   URL: http://localhost:3000/workshops-test"
echo "   Capturar: Lista completa de workshops"
echo ""

echo "5. 🔐 AUTH TEST"
echo "   URL: http://localhost:3000/auth-test"
echo "   Capturar: Sistema de autenticação"
echo ""

echo "6. � SWAGGER API"
echo "   URL: http://localhost:3004/api-docs"
echo "   Capturar: Documentação da API"
echo ""

echo "7. ⚡ HEALTH CHECK"
echo "   URL: http://localhost:3004/health"
echo "   Capturar: Status do backend"
echo ""

echo "🎯 ======================================="
echo "🎯 COMO CAPTURAR SCREENSHOTS"
echo "🎯 ======================================="
echo ""

echo "📱 PARA DESKTOP (Recomendado: 1920x1080):"
echo "   - Use Flameshot, Gyazo ou screenshot nativo"
echo "   - Capture a tela completa para cada página"
echo "   - Salve como PNG com alta qualidade"
echo ""

echo "📱 PARA MOBILE (Recomendado: 375x667):"
echo "   - Use DevTools do Chrome (F12)"
echo "   - Ative o modo móvel (Ctrl+Shift+M)"
echo "   - Capture em diferentes resoluções"
echo ""

echo "🎥 PARA GIFS (Recomendado: 800x600):"
echo "   - Use ScreenToGif ou LICEcap"
echo "   - Grave fluxos de 5-10 segundos"
echo "   - Foque em interações específicas"
echo ""

echo "🎯 ======================================="
echo "🎯 SUGESTÕES DE GIFS"
echo "🎯 ======================================="
echo ""

echo "1. 🔄 FLUXO DE INSCRIÇÃO"
echo "   - Navegar para workshop → Clicar em inscrever-se"
echo ""

echo "2. 🔔 NOTIFICAÇÕES EM TEMPO REAL"
echo "   - Mostrar notificações aparecendo"
echo ""

echo "3. 📊 DASHBOARD INTERATIVO"
echo "   - Navegar pelos gráficos"
echo ""

echo "4. 📁 UPLOAD DRAG & DROP"
echo "   - Arrastar arquivo para upload"
echo ""

echo "5. ⭐ SISTEMA DE REVIEWS"
echo "   - Adicionar review com estrelas"
echo ""

echo "🎯 ======================================="
echo "🎯 PRÓXIMOS PASSOS"
echo "🎯 ======================================="
echo ""

echo "1. 📸 Capture todas as screenshots sugeridas"
echo "2. 🎥 Grave 3-5 GIFs dos fluxos principais"
echo "3. 📝 Atualize o README.md com as imagens"
echo "4. 🌐 Faça o deploy em produção"
echo "5. 🚀 Compartilhe o projeto!"
echo ""

echo "💡 DICA: Para capturas profissionais:"
echo "   - Use dados realistas (não lorem ipsum)"
echo "   - Capture em boa resolução"
echo "   - Mostre funcionalidades funcionando"
echo "   - Use modo claro/escuro conforme design"
echo ""

echo "🎊 BOA SORTE COM AS CAPTURAS!"
echo "🎊 O SKILLSHARE HUB VAI IMPRESSIONAR!"
