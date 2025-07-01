# SkillHub - Plataforma de Compartilhamento de Conhecimento

Um monorepo moderno para conectar pessoas que querem ensinar com pessoas que querem aprender.

## 🏗️ Estrutura do Projeto

```
skillshare-hub/
├── apps/
│   ├── web/          # Frontend Next.js
│   └── api/          # Backend NestJS
├── packages/
│   └── eslint-config/  # Configurações compartilhadas
├── docs/             # Documentação
└── scripts/          # Scripts utilitários
```

## 🚀 Tecnologias

### Frontend (Next.js 14)

- **Framework**: Next.js 14 com App Router
- **Styling**: Tailwind CSS + Shadcn/ui
- **Autenticação**: NextAuth.js
- **Formulários**: React Hook Form + Zod
- **Estado**: React Query

### Backend (NestJS)

- **Framework**: NestJS
- **Banco de Dados**: PostgreSQL + Prisma
- **Autenticação**: JWT + Passport
- **Documentação**: Swagger/OpenAPI

## 🏃‍♂️ Como Executar

### Pré-requisitos

- Node.js 18+
- pnpm
- PostgreSQL

### Instalação

```bash
# Instalar dependências
pnpm install

# Configurar banco de dados
cd apps/api
cp .env.example .env
# Editar .env com suas configurações

# Executar migrações
pnpm db:migrate

# Executar em desenvolvimento
pnpm dev
```

## 📱 Funcionalidades

- ✅ Landing page responsiva
- ✅ Sistema de autenticação
- ✅ Dashboard do usuário
- ✅ Criação e gerenciamento de workshops
- ✅ Sistema de busca e filtros
- ✅ Perfil do usuário
- ✅ Sistema de notificações

## 🌍 Deploy

- **Frontend**: Vercel
- **Backend**: Railway
- **Banco**: Railway PostgreSQL

## 📖 Documentação

Veja a pasta `docs/` para documentação detalhada.

## 🤝 Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request

## 📄 Licença

MIT License - veja LICENSE para detalhes.
