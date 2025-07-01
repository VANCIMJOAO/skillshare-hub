// apps/web/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Navigation from '@/components/Navigation';
import { Toaster } from 'sonner';

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
                    <Navigation />
                    <main>{children}</main>
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
