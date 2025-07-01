// apps/web/middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth(
    function middleware(req) {
        // Middleware adicional pode ser adicionado aqui se necessário
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Permitir acesso às rotas de autenticação
                if (req.nextUrl.pathname.startsWith('/auth/')) {
                    return true;
                }
                
                // Permitir acesso às rotas da API do NextAuth
                if (req.nextUrl.pathname.startsWith('/api/auth/')) {
                    return true;
                }
                
                // Para outras rotas, exigir token
                return !!token;
            },
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
        '/auth/:path*',
        '/api/auth/:path*',
    ],
};
