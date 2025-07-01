'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { WorkshopFilters as IWorkshopFilters } from '@/types/workshop';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Simplified workshop type based on actual API response
interface ApiWorkshop {
    id: string;
    title: string;
    description: string;
    price: string;
    mode: 'ONLINE' | 'PRESENTIAL';
    imageUrl?: string;
    location?: string;
    startsAt: string;
    endsAt: string;
    maxParticipants?: number;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    owner?: {
        id: string;
        name: string;
        email: string;
    };
    enrollments?: any[];
}

interface ApiResponse {
    data: ApiWorkshop[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function FixedWorkshopsList() {
    const [filters, setFilters] = useState<IWorkshopFilters>({
        page: 1,
        limit: 9
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ['workshops', filters],
        queryFn: async (): Promise<ApiResponse> => {
            const params = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '' && value !== 'all') {
                    params.append(key, value.toString());
                }
            });

            console.log('🔄 Fetching workshops with filters:', filters);
            const result = await apiClient.get(`/workshops?${params.toString()}`);
            console.log('✅ Workshops fetched:', result);
            return result as ApiResponse;
        },
        retry: 3,
        retryDelay: 1000,
    });

    const handlePageChange = useCallback((newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-lg border shadow-sm p-6 animate-pulse"
                        >
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        console.error('❌ Workshop fetch error:', error);
        return (
            <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="text-red-800 font-semibold mb-2">Erro ao carregar workshops</h3>
                    <p className="text-red-600 text-sm mb-4">
                        {(error as Error).message}
                    </p>
                    <Button 
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Tentar novamente
                    </Button>
                </div>
            </div>
        );
    }

    if (!data || data.data.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                    Nenhum workshop encontrado.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Workshops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.data.map((workshop) => (
                    <div key={workshop.id} className="bg-white rounded-lg border shadow-sm hover:shadow-lg transition-shadow">
                        <div className="p-6">
                            <h3 className="font-semibold text-lg mb-2">{workshop.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{workshop.description}</p>
                            
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Preço:</span>
                                    <span className="font-semibold text-green-600">R$ {workshop.price}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Modo:</span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        workshop.mode === 'ONLINE' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {workshop.mode}
                                    </span>
                                </div>
                                {workshop.owner && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Instrutor:</span>
                                        <span className="font-medium">{workshop.owner.name}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Início:</span>
                                    <span>{new Date(workshop.startsAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                            
                            <Link href={`/workshops/${workshop.id}`} className="w-full">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Ver Detalhes
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {data.meta && data.meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                        variant="outline"
                        disabled={filters.page === 1}
                        onClick={() => handlePageChange((filters.page || 1) - 1)}
                    >
                        Anterior
                    </Button>

                    <span className="text-sm text-gray-600">
                        Página {filters.page} de {data.meta.totalPages}
                    </span>

                    <Button
                        variant="outline"
                        disabled={filters.page === data.meta.totalPages}
                        onClick={() => handlePageChange((filters.page || 1) + 1)}
                    >
                        Próxima
                    </Button>
                </div>
            )}
        </div>
    );
}
