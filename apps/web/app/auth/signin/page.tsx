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
        console.log('🚪 LOGIN FORM SUBMIT START:', {
            email: data.email,
            passwordLength: data.password.length,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });

        setIsLoading(true);
        setError('');

        try {
            console.log('📡 CALLING signIn with credentials provider...');
            
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false, // Não redirecionar automaticamente
            });

            console.log('📋 SIGNIN RESULT:', {
                result,
                ok: result?.ok,
                error: result?.error,
                status: result?.status,
                url: result?.url,
                timestamp: new Date().toISOString()
            });

            if (result?.error) {
                console.error('❌ LOGIN ERROR DETECTED:', {
                    error: result.error,
                    status: result.status,
                    url: result.url
                });
                setError(`Erro de login: ${result.error}`);
            } else if (result?.ok) {
                console.log('✅ LOGIN SUCCESS - Getting session...');
                
                // Verificar sessão após login
                const session = await getSession();
                console.log('📊 SESSION AFTER LOGIN:', {
                    session,
                    hasUser: !!session?.user,
                    userEmail: session?.user?.email
                });
                
                console.log('🔄 REDIRECTING TO DASHBOARD...');
                window.location.replace('/dashboard');
            } else {
                console.log('⚠️ UNKNOWN LOGIN STATE:', result);
                setError('Estado de login desconhecido. Verifique os logs.');
            }
        } catch (err) {
            console.error('💥 LOGIN EXCEPTION:', {
                error: err,
                message: err instanceof Error ? err.message : 'Unknown error',
                stack: err instanceof Error ? err.stack : null,
                timestamp: new Date().toISOString()
            });
            setError('Erro ao fazer login. Verifique os logs do console.');
        } finally {
            setIsLoading(false);
            console.log('🏁 LOGIN PROCESS FINISHED');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        Entrar no SkillHub
                    </CardTitle>
                    <CardDescription className="text-center">
                        Faça login para acessar sua conta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
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
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Não tem uma conta?{' '}
                            <Link href="/auth/register" className="font-medium text-primary hover:text-primary/80">
                                Registre-se
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
