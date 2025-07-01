// apps/web/lib/auth-oauth.ts
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || 'demo',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo',
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
