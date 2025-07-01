// apps/web/components/WorkshopCard.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Workshop } from '@/types/workshop';
import { CalendarDays, MapPin, User, DollarSign, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface WorkshopCardProps {
    workshop: Workshop;
    showActions?: boolean;
    onEdit?: (workshop: Workshop) => void;
    onDelete?: (workshop: Workshop) => void;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({
    workshop,
    showActions = false,
    onEdit,
    onDelete,
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            {workshop.imageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${workshop.imageUrl}`}
                        alt={workshop.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            {workshop.title}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm text-gray-600">
                            {workshop.description}
                        </CardDescription>
                    </div>
                    <Badge variant={workshop.mode === 'ONLINE' ? 'default' : 'secondary'}>
                        {workshop.mode === 'ONLINE' ? 'Online' : 'Presencial'}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span className="font-semibold text-green-600">
                            {formatPrice(workshop.price)}
                        </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        <span>
                            {formatDate(workshop.startsAt)} - {formatDate(workshop.endsAt)}
                        </span>
                    </div>

                    {workshop.location && (
                        <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="mr-2 h-4 w-4" />
                            <span>{workshop.location}</span>
                        </div>
                    )}

                    {workshop.owner && (
                        <div className="flex items-center text-sm text-gray-600">
                            <User className="mr-2 h-4 w-4" />
                            <span>{workshop.owner.name}</span>
                        </div>
                    )}

                    {/* Botão Ver Detalhes - sempre visível */}
                    <div className="pt-4">
                        <Link href={`/workshops/${workshop.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ver Detalhes
                            </Button>
                        </Link>
                    </div>

                    {showActions && (
                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit?.(workshop)}
                            >
                                Editar
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDelete?.(workshop)}
                            >
                                Excluir
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default WorkshopCard;
