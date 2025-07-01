'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AuthErrorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const errorParam = searchParams.get('error');
        setError(errorParam || 'Erro desconhecido');
    }, [searchParams]);

    const getErrorMessage = (error: string) => {
        switch (error) {
            case 'CredentialsSignin':
                return 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
            case 'Configuration':
                return 'Erro de configuração do servidor. Tente novamente mais tarde.';
            case 'AccessDenied':
                return 'Acesso negado. Você não tem permissão para acessar esta área.';
            case 'Verification':
                return 'Erro na verificação. O link pode ter expirado.';
            default:
                return 'Ocorreu um erro durante o login. Tente novamente.';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Erro de Autenticação
                    </h1>
                    
                    <p className="text-gray-600 mb-6">
                        {getErrorMessage(error)}
                    </p>
                </div>
                
                <div className="space-y-4">
                    <Link 
                        href="/auth/signin"
                        className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                    >
                        Tentar Novamente
                    </Link>
                    
                    <Link 
                        href="/auth/register"
                        className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
                    >
                        Criar Nova Conta
                    </Link>
                    
                    <Link 
                        href="/"
                        className="block w-full text-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Voltar para o início
                    </Link>
                </div>
                
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <strong>Debug:</strong> {error}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
