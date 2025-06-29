// apps/web/components/ProtectedPage.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedPageProps {
    children: React.ReactNode;
    requiredRole?: 'INSTRUCTOR' | 'ADMIN';
}

const ProtectedPage: React.FC<ProtectedPageProps> = ({ children, requiredRole }) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        if (requiredRole && session.user.role !== requiredRole) {
            router.push('/');
            return;
        }
    }, [session, status, router, requiredRole]);

    if (status === 'loading') {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    if (requiredRole && session.user.role !== requiredRole) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedPage;
