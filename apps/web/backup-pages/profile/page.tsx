// apps/web/app/profile/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Shield, Edit } from 'lucide-react';
import ProtectedPage from '@/components/ProtectedPage';

function ProfileContent() {
    const { data: session } = useSession();

    if (!session) {
        return null;
    }

    const { user } = session;

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'INSTRUCTOR':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'STUDENT':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'Administrador';
            case 'INSTRUCTOR':
                return 'Instrutor';
            case 'STUDENT':
                return 'Estudante';
            default:
                return role;
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="text-lg">
                                    {user.name
                                        ?.split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="text-2xl">{user.name}</CardTitle>
                                <CardDescription className="flex items-center mt-2">
                                    <Badge className={getRoleBadgeColor(user.role)}>
                                        <Shield className="w-3 h-3 mr-1" />
                                        {getRoleLabel(user.role)}
                                    </Badge>
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                                    <User className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Nome</p>
                                    <p className="text-base">{user.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                                    <Mail className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-base">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                                    <Shield className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Tipo de Conta</p>
                                    <p className="text-base">{getRoleLabel(user.role)}</p>
                                </div>
                            </div>
                        </div>

                        {user.role === 'INSTRUCTOR' && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Recursos do Instrutor</h3>
                                <div className="space-y-2">
                                    <Button variant="outline" className="w-full justify-start">
                                        Criar Novo Workshop
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        Gerenciar Workshops
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        Ver Inscrições
                                    </Button>
                                </div>
                            </div>
                        )}

                        {user.role === 'ADMIN' && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Painel Administrativo</h3>
                                <div className="space-y-2">
                                    <Button variant="outline" className="w-full justify-start">
                                        Gerenciar Usuários
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        Moderar Workshops
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        Relatórios
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <ProtectedPage>
            <ProfileContent />
        </ProtectedPage>
    );
}
