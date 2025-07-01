// apps/web/middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth(
    function middleware(req) {
        // Middleware adicional pode ser adicionado aqui se necessário
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/profile/:path*',
        '/admin/:path*',
        '/instructor/:path*',
        '/student/:path*',
        '/workshops/create',
        '/workshops/:path*/edit',
    ],
};
