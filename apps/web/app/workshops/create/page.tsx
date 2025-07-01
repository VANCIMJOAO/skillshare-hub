'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const workshopSchema = z.object({
    title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
    category: z.string().min(1, 'Categoria é obrigatória'),
    date: z.string().min(1, 'Data é obrigatória'),
    duration: z.number().min(30, 'Duração mínima de 30 minutos'),
    maxParticipants: z.number().min(1, 'Deve ter pelo menos 1 participante'),
});

type WorkshopFormData = z.infer<typeof workshopSchema>;

const categories = [
    'Programação',
    'Design',
    'Marketing',
    'Negócios',
    'Tecnologia',
    'Criatividade'
];

export default function CreateWorkshopPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<WorkshopFormData>({
        resolver: zodResolver(workshopSchema)
    });

    // Redirect if not authenticated
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session) {
        router.push('/auth/signin');
        return null;
    }

    const onSubmit = async (data: WorkshopFormData) => {
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://skillsharehub-production.up.railway.app';
            const response = await fetch(`${apiUrl}/api/workshops`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    instructorId: session.user.id,
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao criar workshop');
            }

            const workshop = await response.json();

            toast({
                title: 'Sucesso!',
                description: 'Workshop criado com sucesso.',
            });

            router.push(`/workshops/${workshop.id}`);
        } catch (error) {
            console.error('Erro ao criar workshop:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível criar o workshop. Tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Criar Novo Workshop</CardTitle>
                        <CardDescription>
                            Compartilhe seu conhecimento criando um workshop para a comunidade
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Título */}
                            <div>
                                <Label htmlFor="title">Título do Workshop</Label>
                                <Input
                                    id="title"
                                    {...register('title')}
                                    placeholder="Ex: Introdução ao React"
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Descrição */}
                            <div>
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    {...register('description')}
                                    placeholder="Descreva o que será abordado no workshop..."
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                                )}
                            </div>

                            {/* Categoria */}
                            <div>
                                <Label htmlFor="category">Categoria</Label>
                                <select
                                    id="category"
                                    {...register('category')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Selecione uma categoria</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                                )}
                            </div>

                            {/* Data e Hora */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="date">Data e Hora</Label>
                                    <Input
                                        id="date"
                                        type="datetime-local"
                                        {...register('date')}
                                    />
                                    {errors.date && (
                                        <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="duration">Duração (minutos)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        {...register('duration', { valueAsNumber: true })}
                                        placeholder="120"
                                        min="30"
                                    />
                                    {errors.duration && (
                                        <p className="text-sm text-red-600 mt-1">{errors.duration.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Máximo de Participantes */}
                            <div>
                                <Label htmlFor="maxParticipants">Máximo de Participantes</Label>
                                <Input
                                    id="maxParticipants"
                                    type="number"
                                    {...register('maxParticipants', { valueAsNumber: true })}
                                    placeholder="20"
                                    min="1"
                                    max="100"
                                />
                                {errors.maxParticipants && (
                                    <p className="text-sm text-red-600 mt-1">{errors.maxParticipants.message}</p>
                                )}
                            </div>

                            {/* Botões */}
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    {isLoading ? 'Criando...' : 'Criar Workshop'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
