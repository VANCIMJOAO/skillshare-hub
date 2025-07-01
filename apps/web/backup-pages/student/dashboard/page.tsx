// apps/web/app/student/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Enrollment } from '@/types/workshop';
import {
    Calendar,
    Clock,
    MapPin,
    DollarSign,
    BookOpen,
    AlertCircle,
    CheckCircle,
    Users,
    ExternalLink,
    X
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function StudentDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();

    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        if (session.user.role !== 'STUDENT') {
            router.push('/');
            return;
        }

        loadEnrollments();
    }, [session, status, router]);

    const loadEnrollments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/enrollments/my') as { data: { data: Enrollment[] } };
            setEnrollments(response.data.data);
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar suas inscrições',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEnrollment = async (workshopId: string) => {
        if (!confirm('Tem certeza que deseja cancelar sua inscrição?')) return;

        try {
            setCancellingId(workshopId);
            await api.delete(`/enrollments/${workshopId}`);

            toast({
                title: 'Inscrição cancelada',
                description: 'Sua inscrição foi cancelada com sucesso.',
            });

            await loadEnrollments();
        } catch (error: any) {
            toast({
                title: 'Erro ao cancelar inscrição',
                description: error.response?.data?.message || 'Ocorreu um erro ao cancelar a inscrição',
                variant: 'destructive',
            });
        } finally {
            setCancellingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    };

    const formatTime = (dateString: string) => {
        return format(new Date(dateString), 'HH:mm', { locale: ptBR });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const categorizeEnrollments = () => {
        const now = new Date();
        const validEnrollments = (enrollments ?? []).filter(e => e && e.workshop);
        const upcoming = validEnrollments.filter(e => new Date(e.workshop!.startsAt) > now);
        const ongoing = validEnrollments.filter(e => {
            const start = new Date(e.workshop!.startsAt);
            const end = new Date(e.workshop!.endsAt);
            return start <= now && now <= end;
        });
        const completed = validEnrollments.filter(e => new Date(e.workshop!.endsAt) < now);

        return { upcoming, ongoing, completed };
    };

    const { upcoming, ongoing, completed } = categorizeEnrollments();

    const renderWorkshopCard = (enrollment: Enrollment, showCancelButton = false) => {
        const workshop = enrollment.workshop!;
        const isUpcoming = new Date(workshop.startsAt) > new Date();
        const isPast = new Date(workshop.endsAt) < new Date();

        return (
            <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg mb-2">{workshop.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {workshop.description}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                            {isPast && (
                                <Badge variant="secondary" className="text-green-600">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Concluído
                                </Badge>
                            )}
                            {!isPast && !isUpcoming && (
                                <Badge variant="default" className="bg-blue-600">
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    Em andamento
                                </Badge>
                            )}
                            {isUpcoming && (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Próximo
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(workshop.startsAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(workshop.startsAt)} - {formatTime(workshop.endsAt)}</span>
                            </div>
                            {workshop.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{workshop.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>{formatPrice(workshop.price)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>Instrutor: {workshop.instructor}</span>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <Link href={`/workshops/${workshop.id}`}>
                                <Button variant="outline" size="sm">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Ver Detalhes
                                </Button>
                            </Link>

                            {showCancelButton && isUpcoming && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleCancelEnrollment(workshop.id)}
                                    disabled={cancellingId === workshop.id}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    {cancellingId === workshop.id ? 'Cancelando...' : 'Cancelar Inscrição'}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (status === 'loading') {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">Carregando...</div>
            </div>
        );
    }

    if (!session || session.user.role !== 'STUDENT') {
        return null;
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Meu Dashboard</h1>
                <p className="text-gray-600">
                    Gerencie suas inscrições em workshops e acompanhe seu progresso de aprendizado.
                </p>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="text-lg">Carregando suas inscrições...</div>
                </div>
            ) : (enrollments?.length ?? 0) === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Nenhuma inscrição encontrada</h3>
                        <p className="text-gray-600 mb-6">
                            Você ainda não se inscreveu em nenhum workshop. Explore nossa seleção de workshops disponíveis!
                        </p>
                        <Link href="/">
                            <Button>
                                Explorar Workshops
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <Tabs defaultValue="upcoming" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="upcoming" className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Próximos ({upcoming.length})
                        </TabsTrigger>
                        <TabsTrigger value="ongoing" className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Em Andamento ({ongoing.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Concluídos ({completed.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-6">
                        {upcoming.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600">Nenhum workshop próximo</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {upcoming.map(enrollment => renderWorkshopCard(enrollment, true))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="ongoing" className="space-y-6">
                        {ongoing.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600">Nenhum workshop em andamento</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {ongoing.map(enrollment => renderWorkshopCard(enrollment))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-6">
                        {completed.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600">Nenhum workshop concluído ainda</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {completed.map(enrollment => renderWorkshopCard(enrollment))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
