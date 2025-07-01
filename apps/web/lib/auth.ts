// apps/web/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

                    // Fazer login na API real
                    const response = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        console.error('Login failed:', errorData);
                        return null;
                    }

                    const result = await response.json();
                    
                    if (result.data && result.data.user && result.data.accessToken) {
                        return {
                            id: result.data.user.id,
                            email: result.data.user.email,
                            name: result.data.user.name,
                            role: result.data.user.role,
                            accessToken: result.data.accessToken,
                            refreshToken: result.data.refreshToken,
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
                    token.role = (user as any).role || 'STUDENT';
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
                    session.user.id = token.sub || '';
                    session.user.email = token.email || '';
                    session.user.name = token.name || '';
                    session.user.role = (token.role as string) || 'STUDENT';
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
    secret: process.env.NEXTAUTH_SECRET,
};
