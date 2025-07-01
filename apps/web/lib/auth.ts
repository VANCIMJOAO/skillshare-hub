// apps/web/lib/auth.ts
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
                console.log('🔍 AUTHORIZE START:', {
                    hasCredentials: !!credentials,
                    hasEmail: !!credentials?.email,
                    hasPassword: !!credentials?.password,
                    email: credentials?.email,
                    passwordLength: credentials?.password?.length || 0,
                    timestamp: new Date().toISOString(),
                    env: process.env.NODE_ENV
                });

                try {
                    if (!credentials?.email || !credentials?.password) {
                        console.log('❌ AUTHORIZE FAIL: Missing credentials', {
                            email: credentials?.email,
                            password: credentials?.password ? '[HIDDEN]' : 'null'
                        });
                        return null;
                    }

                    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                    console.log('🌐 API CALL PREP:', {
                        apiUrl,
                        endpoint: `${apiUrl}/auth/login`,
                        email: credentials.email,
                        hasPassword: !!credentials.password
                    });

                    // Validate against backend API
                    const response = await fetch(`${apiUrl}/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    console.log('📡 API RESPONSE:', {
                        status: response.status,
                        statusText: response.statusText,
                        ok: response.ok,
                        url: response.url,
                        headers: Object.fromEntries(response.headers.entries())
                    });

                    if (response.ok) {
                        const user = await response.json();
                        console.log('✅ LOGIN SUCCESS:', {
                            userId: user.id,
                            userEmail: user.email,
                            userName: user.name,
                            userRole: user.role,
                            fullUser: user
                        });
                        
                        const returnUser = {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role || 'STUDENT',
                        };
                        
                        console.log('🔄 RETURNING USER:', returnUser);
                        return returnUser;
                    } else {
                        const errorText = await response.text();
                        console.log('❌ API LOGIN FAIL:', {
                            status: response.status,
                            statusText: response.statusText,
                            errorBody: errorText,
                            url: response.url
                        });
                        return null;
                    }
                } catch (error) {
                    console.error('💥 AUTHORIZE ERROR:', {
                        error: error,
                        message: error instanceof Error ? error.message : 'Unknown error',
                        stack: error instanceof Error ? error.stack : null,
                        apiUrl: process.env.NEXT_PUBLIC_API_URL
                    });
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            console.log('🔑 JWT CALLBACK:', {
                hasToken: !!token,
                hasUser: !!user,
                tokenSub: token?.sub,
                tokenEmail: token?.email,
                tokenName: token?.name,
                tokenRole: (token as any)?.role,
                userObject: user,
                timestamp: new Date().toISOString()
            });

            if (user) {
                console.log('👤 JWT: Setting user data in token');
                token.email = user.email;
                token.name = user.name;
                token.role = (user as any).role || 'STUDENT';
                
                console.log('🔄 JWT: Updated token:', {
                    email: token.email,
                    name: token.name,
                    role: token.role
                });
            }
            return token;
        },
        async session({ session, token }) {
            console.log('📊 SESSION CALLBACK:', {
                hasSession: !!session,
                hasToken: !!token,
                hasSessionUser: !!session?.user,
                tokenData: {
                    sub: token?.sub,
                    email: token?.email,
                    name: token?.name,
                    role: (token as any)?.role
                },
                sessionUser: session?.user,
                timestamp: new Date().toISOString()
            });

            if (token && session.user) {
                console.log('🔄 SESSION: Setting user data from token');
                session.user.id = token.sub || '';
                session.user.email = token.email || '';
                session.user.name = token.name || '';
                (session.user as any).role = token.role || 'STUDENT';
                
                console.log('✅ SESSION: Final session user:', session.user);
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            console.log('🔀 REDIRECT CALLBACK:', { 
                url, 
                baseUrl,
                isCallback: url.includes('/api/auth/callback'),
                isDashboard: url.includes('/dashboard'),
                startsWithBase: url.startsWith(baseUrl),
                timestamp: new Date().toISOString()
            });
            
            // Sempre redirecionar para dashboard após login bem-sucedido
            if (url.includes('/api/auth/callback') || url.includes('/dashboard')) {
                const redirectUrl = `${baseUrl}/dashboard`;
                console.log('🎯 REDIRECT: Going to dashboard:', redirectUrl);
                return redirectUrl;
            }
            
            // Para qualquer outra URL, usar o baseUrl
            if (url.startsWith(baseUrl)) {
                console.log('🔄 REDIRECT: Using provided URL:', url);
                return url;
            }
            
            // Fallback seguro
            console.log('🏠 REDIRECT: Fallback to baseUrl:', baseUrl);
            return baseUrl;
        },
        async signIn({ user, account, profile }) {
            console.log('🚪 SIGNIN CALLBACK:', { 
                user, 
                account, 
                profile,
                hasUser: !!user,
                accountProvider: account?.provider,
                accountType: account?.type,
                timestamp: new Date().toISOString()
            });
            
            const result = user ? true : false;
            console.log('✅ SIGNIN RESULT:', result);
            return result;
        },
    },
    // Remover completamente configuração de páginas personalizadas
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
    debug: true, // Always enable debug for now
};

// Log da configuração inicial
console.log('🔧 NEXTAUTH CONFIG LOADED:', {
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    nodeEnv: process.env.NODE_ENV,
    debug: true,
    timestamp: new Date().toISOString()
});
