#!/bin/bash

# 🌐 SCRIPT PARA ABRIR TODAS AS URLs PARA CAPTURA

echo "🚀 Abrindo todas as URLs para captura..."

# URLs para screenshots
URLS=(
    "http://localhost:3000"
    "http://localhost:3000/workshops/a46b2e55-4551-437f-ac92-b1acdfffc1a2"
    "http://localhost:3000/test-connection"
    "http://localhost:3000/workshops-test"
    "http://localhost:3000/auth-test"
    "http://localhost:3004/api-docs"
    "http://localhost:3004/health"
)

# Abrir cada URL em uma nova aba do navegador
for url in "${URLS[@]}"; do
    echo "📖 Abrindo: $url"
    xdg-open "$url" 2>/dev/null || open "$url" 2>/dev/null || echo "⚠️  Abra manualmente: $url"
    sleep 1
done

echo ""
echo "✅ Todas as URLs foram abertas!"
echo "💡 Agora você pode capturar facilmente alternando entre as abas"
echo ""
echo "📸 Para screenshots: gnome-screenshot -w"
echo "🎥 Para GIFs: peek"
