'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardPage() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Carregando...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Acesso negado</h1>
                    <p className="mb-4">Você precisa estar logado para acessar esta página.</p>
                    <Link href="/auth/signin" className="text-blue-600 hover:underline">
                        Fazer login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold">SkillShare Hub</h1>
                        <div className="flex items-center gap-4">
                            <span>Olá, {session?.user?.name}!</span>
                            <Link href="/api/auth/signout" className="text-red-600 hover:underline">
                                Sair
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <div className="grid gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold mb-4">🎉 Login realizado com sucesso!</h2>
                        <p className="text-gray-600 mb-4">
                            Bem-vindo ao SkillShare Hub! Seu login foi realizado com sucesso.
                        </p>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-green-800 mb-2">Informações da sessão:</h3>
                            <ul className="text-green-700 space-y-1">
                                <li><strong>Email:</strong> {session?.user?.email}</li>
                                <li><strong>Nome:</strong> {session?.user?.name}</li>
                                <li><strong>Status:</strong> Logado ✅</li>
                            </ul>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Link 
                                href="/" 
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center"
                            >
                                Voltar ao início
                            </Link>
                            <Link 
                                href="/workshops" 
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-center"
                            >
                                Ver workshops
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">🚀 Portfolio Demo</h3>
                        <p className="text-gray-600 mb-4">
                            Este é um projeto de demonstração do SkillShare Hub, mostrando:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>Autenticação funcional com NextAuth</li>
                            <li>Interface moderna com React e Next.js</li>
                            <li>Backend APIs em NestJS</li>
                            <li>Deploy em produção (Vercel + Railway)</li>
                            <li>Arquitetura full-stack escalável</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
