'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardNoAuthPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirecionar para o dashboard real
        router.replace('/dashboard');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Redirecionando...</p>
        </div>
    );
}
