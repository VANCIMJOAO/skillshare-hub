# Configuração de Environment Variables para Vercel

# Execute estes comandos no terminal ou configure via dashboard

# PASSO 1: Navegar para o diretório do projeto

cd apps/web

# PASSO 2: Configurar variáveis de produção

vercel env add NEXT_PUBLIC_API_URL production

# Quando solicitado, cole: https://skillsharehub-production.up.railway.app

vercel env add NEXTAUTH_URL production

# Quando solicitado, cole: https://skillsharehub-sigma.vercel.app

vercel env add NEXTAUTH_SECRET production

# Quando solicitado, cole: 68QSERd7on8RG9JHIZ4Wmmn3+I+MaoWb1CsPLF6uY0I=

vercel env add NODE_ENV production

# Quando solicitado, cole: production

# PASSO 3: Fazer redeploy

vercel --prod

# ALTERNATIVA: Configure via Dashboard

# 1. https://vercel.com/dashboard

# 2. Selecione projeto > Settings > Environment Variables

# 3. Adicione:

# NEXT_PUBLIC_API_URL = https://skillsharehub-production.up.railway.app

# NEXTAUTH_URL = https://skillsharehub-sigma.vercel.app

# NEXTAUTH_SECRET = 68QSERd7on8RG9JHIZ4Wmmn3+I+MaoWb1CsPLF6uY0I=

# NODE_ENV = production
