// apps/web/app/auth/signin/page.tsx
'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const signInSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInFormData) => {
        setIsLoading(true);
        setError('');

        try {
            // MODO DEMO: Contorna problemas do NextAuth
            // Simula login - aceita qualquer email/senha
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Salva dados do usuário no localStorage para demo
            const userData = {
                id: '1',
                email: data.email,
                name: data.email.split('@')[0],
                role: 'user',
                loggedIn: true,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('demo-user', JSON.stringify(userData));
            
            // Redireciona para dashboard
            router.push('/dashboard-noauth');
        } catch (err) {
            setError('Erro ao fazer login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        SkillShare Hub - Demo Login
                    </CardTitle>
                    <CardDescription className="text-center">
                        Digite qualquer email e senha para demonstração
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-700">
                            <strong>💡 Demo:</strong> Use qualquer email e senha para testar o login. 
                            O sistema foi configurado em modo demonstração.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                className="mt-1"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                                className="mt-1"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Entrando...' : 'Entrar (Demo)'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Não tem uma conta?{' '}
                            <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/80">
                                Registre-se
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
