'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Settings, User, LogOut } from 'lucide-react';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const handleLogout = () => {
        signOut({ callbackUrl: '/' });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-gray-500" />
                                <span className="text-sm text-gray-700">
                                    {session.user?.name || session.user?.email}
                                </span>
                                <Badge variant="secondary">
                                    {session.user?.role || 'STUDENT'}
                                </Badge>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleLogout}
                                className="flex items-center space-x-1"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sair</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BookOpen className="h-5 w-5" />
                                    <span>Meus Workshops</span>
                                </CardTitle>
                                <CardDescription>
                                    Workshops que você está inscrito
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Você ainda não tem workshops inscritos
                                    </p>
                                    <Link href="/workshops">
                                        <Button size="sm">
                                            Explorar Workshops
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Próximos Eventos</span>
                                </CardTitle>
                                <CardDescription>
                                    Seus próximos workshops agendados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500">
                                        Nenhum evento agendado
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5" />
                                    <span>Configurações</span>
                                </CardTitle>
                                <CardDescription>
                                    Gerencie sua conta e preferências
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Link href="/profile">
                                        <Button variant="outline" size="sm" className="w-full">
                                            Editar Perfil
                                        </Button>
                                    </Link>
                                    <Link href="/profile/notifications">
                                        <Button variant="outline" size="sm" className="w-full">
                                            Notificações
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Bem-vindo ao SkillHub!</CardTitle>
                                <CardDescription>
                                    Sua plataforma de aprendizado está funcionando perfeitamente
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="font-semibold text-blue-900">Sistema</div>
                                        <div className="text-sm text-blue-700">✅ Funcionando</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="font-semibold text-green-900">Autenticação</div>
                                        <div className="text-sm text-green-700">✅ Ativa</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <div className="font-semibold text-purple-900">API</div>
                                        <div className="text-sm text-purple-700">✅ Conectada</div>
                                    </div>
                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <div className="font-semibold text-orange-900">CORS</div>
                                        <div className="text-sm text-orange-700">✅ Configurado</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
