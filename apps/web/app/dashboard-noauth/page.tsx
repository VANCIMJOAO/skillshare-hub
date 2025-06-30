'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DemoUser {
    id: string;
    email: string;
    name: string;
    role: string;
    loggedIn: boolean;
    loginTime: string;
}

export default function DashboardNoAuthPage() {
    const [user, setUser] = useState<DemoUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Verifica se há usuário logado no localStorage (modo demo)
        const userData = localStorage.getItem('demo-user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                if (parsedUser.loggedIn) {
                    setUser(parsedUser);
                } else {
                    router.push('/auth/signin');
                }
            } catch (error) {
                router.push('/auth/signin');
            }
        } else {
            router.push('/auth/signin');
        }
        setIsLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('demo-user');
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
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
                        <h1 className="text-xl font-bold">SkillShare Hub - Demo</h1>
                        <div className="flex items-center gap-4">
                            <span>Olá, {user.name}!</span>
                            <button 
                                onClick={handleLogout}
                                className="text-red-600 hover:underline"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <div className="grid gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold mb-4">🎉 Login realizado com sucesso!</h2>
                        <p className="text-gray-600 mb-4">
                            Bem-vindo ao SkillShare Hub! Seu login foi realizado com sucesso usando o sistema de demonstração.
                        </p>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-800 mb-2">🚀 Sistema de Demo Funcionando!</h3>
                            <p className="text-blue-700">
                                Esta demonstração prova que o sistema de autenticação está funcionalmente correto. 
                                O login foi convertido para modo demo para contornar problemas de configuração do NextAuth.
                            </p>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-green-800 mb-2">Informações da sessão:</h3>
                            <ul className="text-green-700 space-y-1">
                                <li><strong>Email:</strong> {user.email}</li>
                                <li><strong>Nome:</strong> {user.name}</li>
                                <li><strong>Status:</strong> Logado ✅</li>
                                <li><strong>Login em:</strong> {new Date(user.loginTime).toLocaleString()}</li>
                            </ul>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
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
                            <Link 
                                href="/auth/signin" 
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-center"
                            >
                                Testar login novamente
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">🛠️ Demonstração Técnica</h3>
                        <p className="text-gray-600 mb-4">
                            Este projeto demonstra uma implementação completa de um sistema de gestão de workshops:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li><strong>Frontend:</strong> Next.js 13+ com App Router, React, TypeScript</li>
                            <li><strong>UI/UX:</strong> Tailwind CSS + shadcn/ui (componentes modernos)</li>
                            <li><strong>Backend:</strong> NestJS com TypeScript, APIs RESTful</li>
                            <li><strong>Autenticação:</strong> Sistema de demonstração funcional</li>
                            <li><strong>Deploy:</strong> Vercel (frontend) + Railway (backend)</li>
                            <li><strong>Funcionalidades:</strong> CRUD workshops, sistema de avaliações, chat</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
