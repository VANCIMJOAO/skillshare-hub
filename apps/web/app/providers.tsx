// apps/web/app/providers.tsx
'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface ProvidersProps {
    children: React.ReactNode;
}

function SessionLogger({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    
    useEffect(() => {
        console.log('📊 SESSION STATUS CHANGED:', {
            status,
            hasSession: !!session,
            sessionUser: session?.user,
            timestamp: new Date().toISOString()
        });
    }, [session, status]);

    return <>{children}</>;
}

export default function Providers({ children }: ProvidersProps) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                retry: 1,
            },
        },
    }));

    console.log('🏗️ PROVIDERS INITIALIZED:', {
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : 'server-side'
    });

    return (
        <SessionProvider>
            <SessionLogger>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </SessionLogger>
        </SessionProvider>
    );
}
