// apps/web/types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
    interface Session {
        accessToken?: string;
        refreshToken?: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }

    interface User {
        id: string;
        email: string;
        name: string;
        role: string;
        accessToken: string;
        refreshToken: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role?: string;
        accessToken?: string;
        refreshToken?: string;
    }
}
