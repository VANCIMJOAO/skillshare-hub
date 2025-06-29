// apps/web/middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth(
    function middleware(req) {
        // Add your middleware logic here
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Public routes
                if (pathname.startsWith('/auth') || pathname === '/') {
                    return true;
                }

                // Protected routes
                if (pathname.startsWith('/dashboard')) {
                    return token?.role === 'INSTRUCTOR' || token?.role === 'ADMIN';
                }

                if (pathname.startsWith('/admin')) {
                    return token?.role === 'ADMIN';
                }

                // Default: require authentication
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/profile/:path*'],
};
