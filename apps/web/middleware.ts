// apps/web/middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth(
    function middleware(req) {
        // Middleware adicional pode ser adicionado aqui se necessário
        console.log('Middleware executado para:', req.nextUrl.pathname);
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;
                console.log('Verificando autorização para:', pathname, 'Token:', !!token);
                
                // Sempre permitir acesso às rotas de autenticação
                if (pathname.startsWith('/auth/') || pathname.startsWith('/api/auth/')) {
                    return true;
                }
                
                // Para rotas protegidas, exigir token
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
        // Removendo rotas de auth do middleware para evitar interferência
    ],
};
