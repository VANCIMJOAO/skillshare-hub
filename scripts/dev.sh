#!/bin/bash

# Script de desenvolvimento para SkillHub

echo "🚀 Iniciando SkillHub em modo desenvolvimento..."

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm não encontrado. Instale com: npm install -g pnpm"
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    pnpm install
fi

# Verificar se as apps existem
if [ ! -d "apps/web" ] || [ ! -d "apps/api" ]; then
    echo "❌ Estrutura de apps não encontrada. Verifique a estrutura do projeto."
    exit 1
fi

echo "🌐 Frontend: http://localhost:3000"
echo "🔗 API: http://localhost:3001"
echo "📚 API Docs: http://localhost:3001/api/docs"
echo ""
echo "Para parar os servidores, pressione Ctrl+C"
echo ""

# Executar em modo desenvolvimento
pnpm dev
