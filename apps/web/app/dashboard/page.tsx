'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Settings, User, LogOut, Plus, Clock, TrendingUp } from 'lucide-react';

interface Workshop {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    mode: 'ONLINE' | 'PRESENTIAL';
    price: number;
    maxParticipants: number;
    instructor: {
        id: string;
        name: string;
        email: string;
    };
}

interface Enrollment {
    id: string;
    workshop: Workshop;
    enrolledAt: string;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userWorkshops, setUserWorkshops] = useState<Enrollment[]>([]);
    const [upcomingWorkshops, setUpcomingWorkshops] = useState<Enrollment[]>([]);
    const [stats, setStats] = useState({
        totalWorkshops: 0,
        completedWorkshops: 0,
        upcomingEvents: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!session?.user?.id) return;
            
            try {
                // Fetch user's enrolled workshops
                const enrollmentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workshops/enrollments/user/${session.user.id}`);
                if (enrollmentsRes.ok) {
                    const enrollments = await enrollmentsRes.json();
                    setUserWorkshops(enrollments.slice(0, 3)); // Show only first 3
                    
                    // Filter upcoming workshops
                    const upcoming = enrollments.filter(enrollment => 
                        new Date(enrollment.workshop.startDate) > new Date()
                    ).slice(0, 3);
                    setUpcomingWorkshops(upcoming);
                    
                    setStats({
                        totalWorkshops: enrollments.length,
                        completedWorkshops: enrollments.filter(enrollment => 
                            new Date(enrollment.workshop.endDate) < new Date()
                        ).length,
                        upcomingEvents: upcoming.length
                    });
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchDashboardData();
        }
    }, [session]);

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
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <BookOpen className="h-8 w-8 text-blue-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total de Workshops</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalWorkshops}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Concluídos</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.completedWorkshops}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Clock className="h-8 w-8 text-orange-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Próximos</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <BookOpen className="h-5 w-5" />
                                        <span>Meus Workshops</span>
                                    </div>
                                    <Link href="/workshops">
                                        <Button size="sm" variant="outline">
                                            <Plus className="h-4 w-4 mr-1" />
                                            Explorar
                                        </Button>
                                    </Link>
                                </CardTitle>
                                <CardDescription>
                                    Workshops que você está inscrito
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : userWorkshops.length > 0 ? (
                                    <div className="space-y-4">
                                        {userWorkshops.map((enrollment) => (
                                            <div key={enrollment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{enrollment.workshop.title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            por {enrollment.workshop.instructor.name}
                                                        </p>
                                                        <div className="flex items-center mt-2 space-x-4">
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                {enrollment.workshop.mode === 'ONLINE' ? 'Online' : 'Presencial'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(enrollment.workshop.startDate).toLocaleDateString('pt-BR')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Link href={`/workshops/${enrollment.workshop.id}`}>
                                                        <Button size="sm" variant="ghost">
                                                            Ver
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                        {userWorkshops.length >= 3 && (
                                            <div className="text-center pt-2">
                                                <Link href="/dashboard/workshops">
                                                    <Button variant="ghost" size="sm">
                                                        Ver todos
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="text-sm text-gray-500 mt-4 mb-4">
                                            Você ainda não tem workshops inscritos
                                        </p>
                                        <Link href="/workshops">
                                            <Button size="sm">
                                                Explorar Workshops
                                            </Button>
                                        </Link>
                                    </div>
                                )}
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
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : upcomingWorkshops.length > 0 ? (
                                    <div className="space-y-4">
                                        {upcomingWorkshops.map((enrollment) => (
                                            <div key={enrollment.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{enrollment.workshop.title}</h4>
                                                        <div className="flex items-center mt-2 space-x-4">
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <Calendar className="h-4 w-4 mr-1" />
                                                                {new Date(enrollment.workshop.startDate).toLocaleDateString('pt-BR', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <Clock className="h-4 w-4 mr-1" />
                                                                {new Date(enrollment.workshop.startDate).toLocaleTimeString('pt-BR', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Link href={`/workshops/${enrollment.workshop.id}`}>
                                                        <Button size="sm" variant="outline">
                                                            Detalhes
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="text-sm text-gray-500 mt-4">
                                            Nenhum evento agendado
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ações Rápidas</CardTitle>
                                <CardDescription>
                                    Acesse rapidamente as principais funcionalidades
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Link href="/workshops">
                                        <Button variant="outline" className="w-full h-20 flex-col">
                                            <BookOpen className="h-6 w-6 mb-2" />
                                            <span className="text-xs">Explorar Workshops</span>
                                        </Button>
                                    </Link>
                                    
                                    {session?.user?.role === 'INSTRUCTOR' && (
                                        <Link href="/workshops/create">
                                            <Button variant="outline" className="w-full h-20 flex-col">
                                                <Plus className="h-6 w-6 mb-2" />
                                                <span className="text-xs">Criar Workshop</span>
                                            </Button>
                                        </Link>
                                    )}
                                    
                                    <Link href="/profile">
                                        <Button variant="outline" className="w-full h-20 flex-col">
                                            <User className="h-6 w-6 mb-2" />
                                            <span className="text-xs">Meu Perfil</span>
                                        </Button>
                                    </Link>
                                    
                                    <Link href="/profile/notifications">
                                        <Button variant="outline" className="w-full h-20 flex-col">
                                            <Settings className="h-6 w-6 mb-2" />
                                            <span className="text-xs">Configurações</span>
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
