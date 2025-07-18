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
                        return null;
                    }

                    // Para demo, aceita qualquer login válido  
                    if (credentials.email && credentials.password) {
                        return {
                            id: '1',
                            email: credentials.email,
                            name: credentials.email.split('@')[0],
                            role: 'user',
                            accessToken: 'demo-token',
                            refreshToken: 'demo-refresh-token'
                        };
                    }
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
            try {
                if (user) {
                    token.email = user.email;
                    token.name = user.name;
                    token.role = (user as any).role || 'user';
                    token.accessToken = (user as any).accessToken;
                    token.refreshToken = (user as any).refreshToken;
                }
                return token;
            } catch (error) {
                console.error('JWT callback error:', error);
                return token;
            }
        },
        async session({ session, token }) {
            try {
                if (token && session.user) {
                    session.user.id = token.sub || '1';
                    session.user.email = token.email || '';
                    session.user.name = token.name || '';
                    session.user.role = (token.role as string) || 'user';
                    (session as any).accessToken = token.accessToken;
                    (session as any).refreshToken = token.refreshToken;
                }
                return session;
            } catch (error) {
                console.error('Session callback error:', error);
                return session;
            }
        },
        async redirect({ url, baseUrl }) {
            // Redireciona para dashboard após login
            if (url === baseUrl || url === '/' || url.includes('/api/auth/callback')) {
                return `${baseUrl}/dashboard`;
            }
            return url.startsWith(baseUrl) ? url : baseUrl;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/signin',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || 'skillshare-hub-demo-secret',
};
