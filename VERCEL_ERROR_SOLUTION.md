# 🔧 Solução: Erro "No Next.js version detected"

## ❌ Problema

```
error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.
```

## ✅ Solução

### 1. **Problema Identificado**

O Vercel não consegue encontrar o Next.js porque estamos em um **monorepo**. O frontend está em `apps/web/`, não na raiz.

### 2. **Solução: Deploy a partir da pasta correta**

#### Método 1: Deploy via CLI (Recomendado)

```bash
# 1. Navegar para a pasta do frontend
cd apps/web

# 2. Fazer o deploy a partir da pasta do frontend
vercel --prod
```

#### Método 2: Configurar Root Directory no Vercel Dashboard

1. Vá para o Vercel Dashboard
2. Project Settings → General
3. Configure **Root Directory**: `apps/web`
4. Redeploy

### 3. **Verificação dos Arquivos**

#### ✅ `apps/web/package.json` (Contém Next.js)

```json
{
  "name": "web",
  "dependencies": {
    "next": "14.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

#### ✅ `apps/web/vercel.json` (Configuração do Vercel)

```json
{
  "version": 2,
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://skillsharehub-production.up.railway.app",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

### 4. **Comandos Corretos**

```bash
# ❌ ERRADO (da raiz do projeto)
vercel --prod

# ✅ CORRETO (da pasta do frontend)
cd apps/web
vercel --prod
```

### 5. **Variáveis de Ambiente**

Configure no Vercel Dashboard:

- `NEXT_PUBLIC_API_URL`: `https://skillsharehub-production.up.railway.app`
- `NEXTAUTH_SECRET`: [gerar um secret seguro]
- `NEXTAUTH_URL`: [URL do deploy no Vercel]

### 6. **Script Automático**

Use o script que criamos:

```bash
# Execute da raiz do projeto
./deploy-vercel.sh
```

## 🎯 Resumo da Solução

O erro acontece porque o Vercel precisa estar na pasta onde está o `package.json` com Next.js (`apps/web`), não na raiz do monorepo.

**Solução simples**: `cd apps/web && vercel --prod`
