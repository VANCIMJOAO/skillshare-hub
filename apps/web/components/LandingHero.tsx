"use client";

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function LandingHero() {
    const { data: session } = useSession();

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        SkillShare Hub
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Plataforma para compartilhar e aprender novas habilidades através de workshops práticos e interativos.
                    </p>
                    
                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        {session ? (
                            <>
                                <Link 
                                    href="/dashboard" 
                                    className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    Ir para Dashboard
                                </Link>
                                <Link 
                                    href="/workshops/create" 
                                    className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                >
                                    Criar Workshop
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link 
                                    href="/auth/register" 
                                    className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    Começar Agora Grátis
                                </Link>
                                <Link 
                                    href="/auth/signin" 
                                    className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                >
                                    Fazer Login
                                </Link>
                            </>
                        )}
                    </div>
                    
                    {/* Features */}
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-2xl">📚</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Workshops Diversos</h3>
                            <p className="text-gray-600">Desde programação até design, encontre o curso perfeito para suas necessidades.</p>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-2xl">👥</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Comunidade Ativa</h3>
                            <p className="text-gray-600">Conecte-se com outros estudantes e instrutores especializados.</p>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-2xl">🏆</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Certificados</h3>
                            <p className="text-gray-600">Receba certificados reconhecidos ao concluir os workshops.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
