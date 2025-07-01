// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

console.log('🔧 NEXTAUTH ROUTE HANDLER LOADING:', { 
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasAuthOptions: !!authOptions,
    nextauthUrl: process.env.NEXTAUTH_URL,
    nextauthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET'
});

const handler = NextAuth(authOptions);

// Add logging to the handlers
const GET = async (req: Request, context: any) => {
    console.log('🔵 NEXTAUTH GET REQUEST:', {
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
        params: context?.params,
        pathname: new URL(req.url).pathname
    });
    try {
        const response = await handler(req, context);
        console.log('✅ NEXTAUTH GET RESPONSE:', {
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString()
        });
        return response;
    } catch (error) {
        console.error('❌ NEXTAUTH GET ERROR:', error);
        throw error;
    }
};

const POST = async (req: Request, context: any) => {
    console.log('🟢 NEXTAUTH POST REQUEST:', {
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
        params: context?.params,
        pathname: new URL(req.url).pathname
    });
    try {
        const response = await handler(req, context);
        console.log('✅ NEXTAUTH POST RESPONSE:', {
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString()
        });
        return response;
    } catch (error) {
        console.error('❌ NEXTAUTH POST ERROR:', error);
        throw error;
    }
};

export { GET, POST };
