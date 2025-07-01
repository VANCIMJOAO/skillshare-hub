'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const workshopSchema = z.object({
    title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
    price: z.number().min(0, 'Preço deve ser positivo'),
    maxParticipants: z.number().min(1, 'Deve ter pelo menos 1 participante'),
    startsAt: z.string().min(1, 'Data de início é obrigatória'),
    endsAt: z.string().min(1, 'Data de fim é obrigatória'),
    location: z.string().min(3, 'Local é obrigatório'),
    mode: z.enum(['ONLINE', 'PRESENTIAL']),
});

type WorkshopFormData = z.infer<typeof workshopSchema>;

export default function CreateWorkshopPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | undefined>();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<WorkshopFormData>({
        resolver: zodResolver(workshopSchema)
    });

    const mode = watch('mode');

    const onSubmit = async (data: WorkshopFormData) => {
        setIsLoading(true);
        try {
            const workshopData = {
                ...data,
                startsAt: new Date(data.startsAt).toISOString(),
                endsAt: new Date(data.endsAt).toISOString(),
                imageUrl,
            };

            await api.post('/workshops', workshopData);

            toast({
                title: 'Workshop criado com sucesso!',
                description: 'Seu workshop foi criado e está disponível para inscrições.',
            });

            router.push('/instructor/dashboard');
        } catch (error: any) {
            toast({
                title: 'Erro ao criar workshop',
                description: error.response?.data?.message || 'Ocorreu um erro inesperado',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Criar Novo Workshop</CardTitle>
                    <CardDescription>
                        Preencha as informações do seu workshop
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Título */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Título *</Label>
                            <Input
                                id="title"
                                {...register('title')}
                                placeholder="Ex: Introdução ao React"
                                disabled={isLoading}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-600">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Descrição */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição *</Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Descreva seu workshop, o que os participantes vão aprender..."
                                rows={4}
                                disabled={isLoading}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description.message}</p>
                            )}
                        </div>

                        {/* Modalidade */}
                        <div className="space-y-2">
                            <Label htmlFor="mode">Modalidade *</Label>
                            <Select value={mode} onValueChange={(value: 'ONLINE' | 'PRESENTIAL') => setValue('mode', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a modalidade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ONLINE">Online</SelectItem>
                                    <SelectItem value="PRESENTIAL">Presencial</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.mode && (
                                <p className="text-sm text-red-600">{errors.mode.message}</p>
                            )}
                        </div>

                        {/* Preço e Participantes */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Preço (R$) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    {...register('price', { valueAsNumber: true })}
                                    placeholder="0.00"
                                    disabled={isLoading}
                                />
                                {errors.price && (
                                    <p className="text-sm text-red-600">{errors.price.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxParticipants">Máx. Participantes *</Label>
                                <Input
                                    id="maxParticipants"
                                    type="number"
                                    {...register('maxParticipants', { valueAsNumber: true })}
                                    placeholder="20"
                                    disabled={isLoading}
                                />
                                {errors.maxParticipants && (
                                    <p className="text-sm text-red-600">{errors.maxParticipants.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Datas */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startsAt">Data de Início *</Label>
                                <Input
                                    id="startsAt"
                                    type="datetime-local"
                                    {...register('startsAt')}
                                    disabled={isLoading}
                                />
                                {errors.startsAt && (
                                    <p className="text-sm text-red-600">{errors.startsAt.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endsAt">Data de Fim *</Label>
                                <Input
                                    id="endsAt"
                                    type="datetime-local"
                                    {...register('endsAt')}
                                    disabled={isLoading}
                                />
                                {errors.endsAt && (
                                    <p className="text-sm text-red-600">{errors.endsAt.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Local */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Local *</Label>
                            <Input
                                id="location"
                                {...register('location')}
                                placeholder={mode === 'ONLINE' ? 'Ex: Link será enviado por email' : 'Ex: Rua das Flores, 123 - São Paulo'}
                                disabled={isLoading}
                            />
                            {errors.location && (
                                <p className="text-sm text-red-600">{errors.location.message}</p>
                            )}
                        </div>

                        {/* Upload de Imagem */}
                        <div className="space-y-2">
                            <Label>Imagem do Workshop</Label>
                            <ImageUpload
                                value={imageUrl}
                                onChange={setImageUrl}
                                disabled={isLoading}
                            />
                            <p className="text-sm text-gray-500">
                                Adicione uma imagem atrativa para seu workshop. Recomendamos imagens em formato landscape (16:9).
                            </p>
                        </div>

                        {/* Botões */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isLoading}
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
    );
}
