'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Workshop } from '@/types/workshop';
import { User } from '@/types/user';
import {
    Users,
    BookOpen,
    TrendingUp,
    DollarSign,
    Search,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

interface AdminStats {
    totalUsers: number;
    totalWorkshops: number;
    totalRevenue: number;
    activeWorkshops: number;
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();

    // Função utilitária para formatar preços de forma segura
    const formatPrice = (price: any): string => {
        const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
        return numPrice.toFixed(2);
    };

    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalWorkshops: 0,
        totalRevenue: 0,
        activeWorkshops: 0
    });
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (status === 'loading') return;
        if (!session || session.user.role !== 'ADMIN') {
            router.push('/');
            return;
        }
        loadData();
    }, [session, status, router]);

    const loadData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                loadStats(),
                loadWorkshops(),
                loadUsers()
            ]);
        } catch (error: any) {
            toast({
                title: 'Erro ao carregar dados',
                description: error.message || 'Ocorreu um erro inesperado',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await api.get<AdminStats>('/admin/stats');
            setStats(response);
        } catch (error) {
            // Mock stats for now
            setStats({
                totalUsers: 0,
                totalWorkshops: 0,
                totalRevenue: 0,
                activeWorkshops: 0
            });
        }
    };

    const loadWorkshops = async () => {
        try {
            const response = await api.get<{ data: Workshop[] }>('/workshops?limit=100');
            setWorkshops(response.data);
        } catch (error: any) {
            console.error('Erro ao carregar workshops:', error);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await api.get<{ data: User[] }>('/users');
            setUsers(response.data);
        } catch (error: any) {
            console.error('Erro ao carregar usuários:', error);
        }
    };

    const handleDeleteWorkshop = async (workshopId: string) => {
        if (!confirm('Tem certeza que deseja excluir este workshop?')) return;

        try {
            await api.delete(`/workshops/${workshopId}`);
            setWorkshops(workshops.filter(w => w.id !== workshopId));
            toast({
                title: 'Workshop excluído',
                description: 'O workshop foi excluído com sucesso.',
            });
        } catch (error: any) {
            toast({
                title: 'Erro ao excluir workshop',
                description: error.message || 'Ocorreu um erro inesperado',
                variant: 'destructive',
            });
        }
    };

    const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await api.patch(`/users/${userId}`, { status: newStatus });

            setUsers(users.map(user =>
                user.id === userId ? { ...user, status: newStatus } : user
            ));

            toast({
                title: 'Status do usuário atualizado',
                description: `Usuário ${newStatus === 'ACTIVE' ? 'ativado' : 'desativado'} com sucesso.`,
            });
        } catch (error: any) {
            toast({
                title: 'Erro ao atualizar usuário',
                description: error.message || 'Ocorreu um erro inesperado',
                variant: 'destructive',
            });
        }
    };

    const filteredWorkshops = workshops.filter(workshop =>
        workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workshop.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (status === 'loading' || loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600">Carregando painel administrativo...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-gray-600 mt-2">
                    Gerencie usuários, workshops e visualize estatísticas da plataforma
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="workshops">Workshops</TabsTrigger>
                    <TabsTrigger value="users">Usuários</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{users.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Usuários registrados
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total de Workshops</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{workshops.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Workshops cadastrados
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Workshops Ativos</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {workshops.filter(w => new Date(w.startsAt) > new Date()).length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Futuros ou em andamento
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    R$ {(() => {
                                        if (workshops.length === 0) return '0.00';
                                        const total = workshops.reduce((acc, w) => {
                                            return acc + (typeof w.price === 'number' ? w.price : parseFloat(w.price) || 0);
                                        }, 0);
                                        return formatPrice(total);
                                    })()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Valor total dos workshops
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Workshops */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Workshops Recentes</CardTitle>
                            <CardDescription>
                                Últimos workshops cadastrados na plataforma
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {workshops.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">
                                        Nenhum workshop cadastrado ainda
                                    </p>
                                ) : (
                                    workshops.slice(0, 5).map((workshop) => (
                                        <div key={workshop.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{workshop.title}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {workshop.owner?.name} • R$ {Number(workshop.price || 0).toFixed(2)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(workshop.startsAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">
                                                {workshop.mode === 'ONLINE' ? 'Online' : 'Presencial'}
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="workshops" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar workshops..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64"
                            />
                        </div>
                        <Button asChild>
                            <Link href="/workshops/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Workshop
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {filteredWorkshops.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {searchTerm ? 'Nenhum workshop encontrado com esse termo' : 'Nenhum workshop cadastrado ainda'}
                                    </p>
                                    {!searchTerm && (
                                        <Button asChild className="mt-4">
                                            <Link href="/workshops/create">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Criar Primeiro Workshop
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            filteredWorkshops.map((workshop) => (
                                <Card key={workshop.id}>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold">{workshop.title}</h3>
                                                    <Badge variant={workshop.mode === 'ONLINE' ? 'default' : 'secondary'}>
                                                        {workshop.mode === 'ONLINE' ? 'Online' : 'Presencial'}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-600 text-sm mb-2">{workshop.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>Instrutor: {workshop.owner?.name}</span>
                                                    <span>Preço: R$ {Number(workshop.price || 0).toFixed(2)}</span>
                                                    <span>{format(new Date(workshop.startsAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link href={`/workshops/${workshop.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDeleteWorkshop(workshop.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar usuários..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                        />
                    </div>

                    <div className="grid gap-4">
                        {filteredUsers.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {searchTerm ? 'Nenhum usuário encontrado com esse termo' : 'Nenhum usuário cadastrado ainda'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredUsers.map((user) => (
                                <Card key={user.id}>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold">{user.name}</h3>
                                                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'INSTRUCTOR' ? 'default' : 'secondary'}>
                                                        {user.role}
                                                    </Badge>
                                                    <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                        {user.status || 'ACTIVE'}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-600 text-sm">{user.email}</p>
                                                <p className="text-gray-500 text-xs">
                                                    Cadastrado em {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleToggleUserStatus(user.id, user.status || 'ACTIVE')}
                                                >
                                                    {(user.status || 'ACTIVE') === 'ACTIVE' ? (
                                                        <UserX className="h-4 w-4" />
                                                    ) : (
                                                        <UserCheck className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
