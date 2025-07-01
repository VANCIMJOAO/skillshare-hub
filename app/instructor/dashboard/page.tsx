'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Users, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Workshop } from '@/types/workshop';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

export default function InstructorDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/auth/signin');
            return;
        }
        loadWorkshops();
    }, [session, status, router]);

    const loadWorkshops = async () => {
        try {
            setLoading(true);
            const response = await api.get<{ data: Workshop[] }>('/workshops/my');
            setWorkshops(response.data);
        } catch (error: any) {
            toast({
                title: 'Erro ao carregar workshops',
                description: error.message || 'Ocorreu um erro inesperado',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (workshopId: string) => {
        if (!confirm('Tem certeza que deseja excluir este workshop?')) return;

        try {
            setDeleting(workshopId);
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
        } finally {
            setDeleting(null);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600">Carregando...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Meus Workshops</h1>
                    <p className="text-gray-600 mt-2">
                        Gerencie seus workshops e acompanhe as inscrições
                    </p>
                </div>
                <Button asChild>
                    <Link href="/workshops/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Workshop
                    </Link>
                </Button>
            </div>

            {workshops.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="text-center">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Nenhum workshop encontrado
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Você ainda não criou nenhum workshop. Que tal começar agora?
                            </p>
                            <Button asChild>
                                <Link href="/workshops/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Criar Primeiro Workshop
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {workshops.map((workshop) => (
                        <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge
                                        variant="secondary"
                                        className="mb-2"
                                    >
                                        Workshop
                                    </Badge>
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
                                            onClick={() => handleDelete(workshop.id)}
                                            disabled={deleting === workshop.id}
                                        >
                                            {deleting === workshop.id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="text-xl">{workshop.title}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {workshop.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {format(new Date(workshop.startsAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        {workshop.location}
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <Users className="h-4 w-4 mr-2" />
                                        0/{workshop.maxParticipants || 0} inscritos
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-lg font-bold text-primary">
                                            R$ {workshop.price.toFixed(2)}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link href={`/workshops/${workshop.id}`}>
                                                Ver Detalhes
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
