# 🔧 Configuração das Variáveis de Ambiente no Vercel

## ⚙️ Variáveis Necessárias

Após o deploy inicial, configure as seguintes variáveis no **Vercel Dashboard**:

### 1. NEXTAUTH_SECRET

```
Valor: jNvqBAjRVyDlM4aqd1DTKTa6Kh9kiVL3mrHtgrJhNzg=
```

### 2. NEXTAUTH_URL

```
Valor: [URL do seu deploy no Vercel - será fornecida após o deploy]
```

### 3. NEXT_PUBLIC_API_URL

```
Valor: https://skillsharehub-production.up.railway.app
```

## 📋 Como Configurar

### Método 1: Via Dashboard (Recomendado)

1. Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione as variáveis acima
5. Redeploy o projeto

### Método 2: Via CLI

```bash
# Adicionar as variáveis via CLI
vercel env add NEXTAUTH_SECRET
# Cole o valor: jNvqBAjRVyDlM4aqd1DTKTa6Kh9kiVL3mrHtgrJhNzg=

vercel env add NEXTAUTH_URL
# Cole o valor: [URL do seu deploy]

vercel env add NEXT_PUBLIC_API_URL
# Cole o valor: https://skillsharehub-production.up.railway.app
```

## 🚀 Sequência de Deploy

1. **Primeiro Deploy** (sem NEXTAUTH_SECRET no vercel.json):

   ```bash
   cd apps/web
   vercel --prod
   ```

2. **Anote a URL do deploy** (ex: https://skillhub-xyz.vercel.app)

3. **Configure as variáveis** no Dashboard:
   - `NEXTAUTH_SECRET`: `jNvqBAjRVyDlM4aqd1DTKTa6Kh9kiVL3mrHtgrJhNzg=`
   - `NEXTAUTH_URL`: `https://skillhub-xyz.vercel.app`
   - `NEXT_PUBLIC_API_URL`: `https://skillsharehub-production.up.railway.app`

4. **Redeploy** para aplicar as variáveis:
   ```bash
   vercel --prod
   ```

## ✅ Verificação

Após configurar, teste:

- **Homepage**: Deve carregar normalmente
- **Login**: Deve funcionar com a API
- **Dashboard**: Deve mostrar dados da API

---

**🎯 Agora você pode fazer o deploy sem erro!**
