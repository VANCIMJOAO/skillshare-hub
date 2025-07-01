// apps/web/middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth(
    function middleware(req) {
        // Log para debug
        console.log('Middleware executado para:', req.nextUrl.pathname);
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
