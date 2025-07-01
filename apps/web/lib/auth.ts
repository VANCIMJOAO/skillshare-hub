// apps/web/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        console.log('Missing credentials');
                        return null;
                    }

                    // Para demonstração, vamos aceitar qualquer usuário com senha válida
                    if (credentials.password.length >= 6) {
                        console.log('Login successful for:', credentials.email);
                        return {
                            id: '1',
                            email: credentials.email,
                            name: credentials.email.split('@')[0],
                            role: 'STUDENT',
                        };
                    }
                    
                    console.log('Password too short');
                    return null;
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.email = user.email;
                token.name = user.name;
                token.role = (user as any).role || 'STUDENT';
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub || '';
                session.user.email = token.email || '';
                session.user.name = token.name || '';
                (session.user as any).role = token.role || 'STUDENT';
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            console.log('Redirect callback:', { url, baseUrl });
            
            // Se for um callback de sucesso, redirecionar para dashboard
            if (url.includes('/api/auth/callback')) {
                return `${baseUrl}/dashboard`;
            }
            
            // Se for a página inicial ou root, redirecionar para dashboard
            if (url === baseUrl || url === '/' || url === `${baseUrl}/`) {
                return `${baseUrl}/dashboard`;
            }
            
            // Para URLs que começam com baseUrl, usar elas
            if (url.startsWith(baseUrl)) {
                return url;
            }
            
            // Para URLs relativas, adicionar baseUrl
            if (url.startsWith('/')) {
                return `${baseUrl}${url}`;
            }
            
            // Fallback para dashboard
            return `${baseUrl}/dashboard`;
        },
        async signIn({ user, account, profile }) {
            console.log('SignIn callback:', { user, account });
            return true; // Sempre permitir sign in para demo
        },
    },
    pages: {
        signIn: '/auth/signin',
        // Não definir página de erro - deixar NextAuth usar o padrão
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
    debug: true, // Ativar debug para ver logs
};
