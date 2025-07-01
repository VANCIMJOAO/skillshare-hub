// apps/web/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import { Toaster } from 'sonner';

// Force dynamic rendering to avoid pre-render errors
export const dynamic = 'force-dynamic'
export const revalidate = 0

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'SkillShare Hub',
    description: 'Platform for sharing and learning new skills through workshops',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <Providers>
                    <div className="min-h-screen bg-gray-50">
                        <Navbar />
                        <main>{children}</main>
                    </div>
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
