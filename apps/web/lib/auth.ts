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
            
            // Sempre redirecionar para dashboard após login bem-sucedido
            if (url.includes('/api/auth/callback') || url.includes('/dashboard')) {
                return `${baseUrl}/dashboard`;
            }
            
            // Para qualquer outra URL, usar o baseUrl
            if (url.startsWith(baseUrl)) {
                return url;
            }
            
            // Fallback seguro
            return baseUrl;
        },
        async signIn({ user, account, profile }) {
            console.log('SignIn callback:', { user, account });
            return true; // Sempre permitir sign in para demo
        },
    },
    // Remover completamente configuração de páginas personalizadas
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
    debug: true, // Ativar debug para ver logs
};
