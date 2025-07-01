// apps/web/lib/auth-minimal.ts
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
                // Demo mode - aceita qualquer email/senha
                if (credentials?.email && credentials?.password) {
                    return {
                        id: '1',
                        email: credentials.email,
                        name: credentials.email.split('@')[0],
                        role: 'user',
                        accessToken: 'demo-token',
                        refreshToken: 'demo-refresh-token'
                    } as any;
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async redirect() {
            return '/dashboard';
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET || 'skillshare-hub-demo-secret',
};
