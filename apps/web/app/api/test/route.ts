// Test API route to verify deployment
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    console.log('🧪 TEST API ROUTE CALLED:', {
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL,
        nextauthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
        apiUrl: process.env.NEXT_PUBLIC_API_URL
    });

    return NextResponse.json({
        status: 'API Working',
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL,
        nextauthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        message: 'API routes are working correctly'
    });
}
