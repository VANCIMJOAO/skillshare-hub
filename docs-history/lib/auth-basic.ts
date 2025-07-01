// apps/web/lib/auth-basic.ts
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
                    };
                }
                return null;
            },
        }),
    ],
    pages: {
        signIn: '/auth/signin',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET || 'skillshare-hub-demo-secret',
};
