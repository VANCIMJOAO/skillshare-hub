// apps/web/app/workshops/[id]/WorkshopDetails.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Workshop } from '@/types/workshop';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import ReviewSystem from '@/components/ReviewSystem';
import WorkshopChat from '@/components/WorkshopChat';
import PaymentCheckout from '@/components/PaymentCheckout';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    DollarSign,
    User,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface WorkshopDetailsProps {
    workshop: Workshop;
}

interface EnrollmentStatus {
    isEnrolled: boolean;
    totalEnrollments: number;
    availableSpots: number;
    isFull: boolean;
}

export default function WorkshopDetails({ workshop }: WorkshopDetailsProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();

    const [isEnrolling, setIsEnrolling] = useState(false);
    const [showPaymentCheckout, setShowPaymentCheckout] = useState(false);
    const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>({
        isEnrolled: false,
        totalEnrollments: 0,
        availableSpots: 0,
        isFull: false
    });

    const isOwner = session?.user?.id === workshop.ownerId;
    const canEdit = isOwner || session?.user?.role === 'ADMIN';
    const isLoggedIn = !!session;
    const isStudent = session?.user?.role === 'STUDENT';

    useEffect(() => {
        if (session && workshop.id) {
            loadEnrollmentStatus();
        }
    }, [session, workshop.id]);

    const loadEnrollmentStatus = async () => {
        try {
            const [statusResponse, statsResponse] = await Promise.all([
                api.get(`/enrollments/check/${workshop.id}`),
                api.get(`/enrollments/stats/${workshop.id}`)
            ]) as [
                    { data: { data: { isEnrolled: boolean } } },
                    { data: { data: { totalEnrollments: number; availableSpots: number; isFull: boolean } } }
                ];

            setEnrollmentStatus({
                isEnrolled: statusResponse.data.data.isEnrolled,
                totalEnrollments: statsResponse.data.data.totalEnrollments,
                availableSpots: statsResponse.data.data.availableSpots,
                isFull: statsResponse.data.data.isFull
            });
        } catch (error: any) {
            console.error('Error loading enrollment status:', error);
        }
    };

    const handleEnroll = async () => {
        if (!session) {
            router.push('/auth/signin');
            return;
        }

        // If workshop is paid, show payment checkout
        if (workshop.price > 0) {
            setShowPaymentCheckout(true);
            return;
        }

        // For free workshops, proceed with direct enrollment
        setIsEnrolling(true);
        try {
            await api.post(`/enrollments/${workshop.id}`);

            toast({
                title: 'Inscrição realizada!',
                description: 'Você foi inscrito no workshop com sucesso.',
            });

            await loadEnrollmentStatus();
        } catch (error: any) {
            toast({
                title: 'Erro na inscrição',
                description: error.response?.data?.message || 'Ocorreu um erro ao se inscrever',
                variant: 'destructive',
            });
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleUnenroll = async () => {
        if (!confirm('Tem certeza que deseja cancelar sua inscrição?')) return;

        setIsEnrolling(true);
        try {
            await api.delete(`/enrollments/${workshop.id}`);

            toast({
                title: 'Inscrição cancelada',
                description: 'Sua inscrição foi cancelada com sucesso.',
            });

            await loadEnrollmentStatus();
        } catch (error: any) {
            toast({
                title: 'Erro ao cancelar inscrição',
                description: error.response?.data?.message || 'Ocorreu um erro ao cancelar a inscrição',
                variant: 'destructive',
            });
        } finally {
            setIsEnrolling(false);
        }
    };

    const handlePaymentSuccess = async (paymentId: string) => {
        try {
            // Enroll the user after successful payment
            await api.post(`/enrollments/${workshop.id}`);

            toast({
                title: 'Pagamento realizado com sucesso!',
                description: 'Você foi inscrito no workshop. Comprovante enviado por email.',
            });

            setShowPaymentCheckout(false);
            await loadEnrollmentStatus();
        } catch (error: any) {
            toast({
                title: 'Erro após pagamento',
                description: 'Pagamento realizado, mas houve erro na inscrição. Entre em contato conosco.',
                variant: 'destructive',
            });
        }
    };

    const handlePaymentCancel = () => {
        setShowPaymentCheckout(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isWorkshopPast = new Date(workshop.startsAt) < new Date();
    const canEnroll = isLoggedIn && !isOwner && !isWorkshopPast && !enrollmentStatus.isFull;

    const renderEnrollmentButton = () => {
        if (!isLoggedIn) {
            return (
                <Button asChild size="lg" className="w-full">
                    <Link href="/auth/signin">
                        Fazer login para se inscrever
                    </Link>
                </Button>
            );
        }

        if (isOwner) {
            return (
                <div className="text-center text-gray-600">
                    Você é o instrutor deste workshop
                </div>
            );
        }

        if (isWorkshopPast) {
            return (
                <Button disabled size="lg" className="w-full">
                    Workshop já realizado
                </Button>
            );
        }

        if (enrollmentStatus.isFull) {
            return (
                <Button disabled size="lg" className="w-full">
                    Workshop lotado
                </Button>
            );
        }

        if (enrollmentStatus.isEnrolled) {
            return (
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                        <CheckCircle className="h-5 w-5" />
                        Você está inscrito!
                    </div>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={handleUnenroll}
                        disabled={isEnrolling}
                    >
                        {isEnrolling ? 'Cancelando...' : 'Cancelar Inscrição'}
                    </Button>
                </div>
            );
        }

        return (
            <Button
                size="lg"
                className="w-full"
                onClick={handleEnroll}
                disabled={isEnrolling || !canEnroll}
            >
                {isEnrolling
                    ? 'Inscrevendo...'
                    : workshop.price > 0
                        ? `Inscrever-se - R$ ${Number(workshop.price).toFixed(2).replace('.', ',')}`
                        : 'Inscrever-se Gratuitamente'
                }
            </Button>
        );
    };

    const getDuration = () => {
        const start = new Date(workshop.startsAt);
        const end = new Date(workshop.endsAt);
        const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;

        if (hours > 0 && minutes > 0) {
            return `${hours}h ${minutes}min`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${minutes}min`;
        }
    };

    const getModeLabel = (mode: string) => {
        return mode === 'ONLINE' ? 'Online' : 'Presencial';
    };

    const getModeColor = (mode: string) => {
        return mode === 'ONLINE'
            ? 'bg-blue-100 text-blue-800 border-blue-200'
            : 'bg-green-100 text-green-800 border-green-200';
    };


    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className={getModeColor(workshop.mode)}>
                                    {getModeLabel(workshop.mode)}
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {workshop.title}
                            </h1>
                            <p className="text-gray-600 text-lg">
                                {workshop.description}
                            </p>
                        </div>

                        {canEdit && (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/workshops/${workshop.id}/edit`}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Informações principais */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Detalhes do Workshop
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Data</p>
                                            <p className="text-base">{formatDate(workshop.startsAt)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                            <Clock className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Horário</p>
                                            <p className="text-base">
                                                {formatTime(workshop.startsAt)} - {formatTime(workshop.endsAt)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                                            <Clock className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Duração</p>
                                            <p className="text-base">{getDuration()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                                            <MapPin className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Local</p>
                                            <p className="text-base">{workshop.location || 'Não informado'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Instrutor */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Instrutor
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback>
                                            {workshop.owner?.name
                                                ?.split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase() || 'I'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{workshop.owner?.name || 'Instrutor'}</p>
                                        <p className="text-sm text-gray-500">{workshop.owner?.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Inscrição */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">
                                    <span className="text-2xl font-bold text-green-600">
                                        R$ {Number(workshop.price).toFixed(2).replace('.', ',')}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Inscritos:</span>
                                    <span className="font-medium">
                                        {enrollmentStatus.totalEnrollments || 0}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Vagas disponíveis:</span>
                                    <span className="font-medium">
                                        {enrollmentStatus.availableSpots || workshop.maxParticipants || 'Ilimitadas'}
                                    </span>
                                </div>

                                {renderEnrollmentButton()}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Informações</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span>Máximo {workshop.maxParticipants || '∞'} participantes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-gray-400" />
                                    <span>Preço: R$ {Number(workshop.price).toFixed(2).replace('.', ',')}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Sistema de Reviews */}
                <div className="mt-12">
                    <ReviewSystem
                        workshopId={workshop.id}
                        userCanReview={enrollmentStatus.isEnrolled && isStudent}
                        showCreateForm={enrollmentStatus.isEnrolled && isStudent}
                    />
                </div>

                {/* Chat do Workshop - Apenas para usuários inscritos */}
                {enrollmentStatus.isEnrolled && (
                    <div className="mt-12">
                        <WorkshopChat
                            workshopId={workshop.id}
                            workshopTitle={workshop.title}
                            userRole={isOwner ? 'owner' : 'enrolled'}
                        />
                    </div>
                )}
            </div>

            {/* Payment Checkout Modal */}
            {showPaymentCheckout && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <PaymentCheckout
                            workshop={{
                                id: workshop.id,
                                title: workshop.title,
                                price: workshop.price,
                                startsAt: workshop.startsAt,
                                endsAt: workshop.endsAt,
                                mode: workshop.mode.toLowerCase() as 'online' | 'presencial',
                                instructor: {
                                    name: workshop.owner?.name || 'Instrutor',
                                    avatar: undefined
                                }
                            }}
                            onPaymentSuccess={handlePaymentSuccess}
                            onCancel={handlePaymentCancel}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
