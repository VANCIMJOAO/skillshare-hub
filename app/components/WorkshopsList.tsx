// apps/web/app/components/WorkshopsList.tsx
'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { WorkshopsResponse, WorkshopFilters as IWorkshopFilters } from '@/types/workshop';
import WorkshopCard from '@/components/WorkshopCard';
import WorkshopFilters from '@/components/WorkshopFilters';
import { Button } from '@/components/ui/button';

export default function WorkshopsList() {
    // Estado para os filtros
    const [filters, setFilters] = useState<IWorkshopFilters>({
        page: 1,
        limit: 9
    });

    // Query para buscar workshops com os filtros aplicados
    const { data, isLoading, error } = useQuery({
        queryKey: ['workshops', filters],
        queryFn: async (): Promise<WorkshopsResponse> => {
            const params = new URLSearchParams();

            // Adiciona todos os parâmetros de filtro
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '' && value !== 'all') {
                    params.append(key, value.toString());
                }
            });

            console.log('🔄 Fetching workshops with filters:', filters);
            const result = await apiClient.get(`/workshops?${params.toString()}`);
            console.log('✅ Workshops fetched:', result);
            return result as WorkshopsResponse;
        },
    });

    // Função para atualizar filtros
    const handleFiltersChange = useCallback((newFilters: IWorkshopFilters) => {
        setFilters(newFilters);
    }, []);

    // Função para limpar filtros
    const handleClearFilters = useCallback(() => {
        setFilters({
            page: 1,
            limit: 9
        });
    }, []);

    // Função para mudança de página
    const handlePageChange = useCallback((newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Skeleton do filtro */}
                <div className="bg-white rounded-lg border shadow-sm p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded mb-4"></div>
                </div>

                {/* Skeleton da grid */}
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
                <p className="text-red-600 mb-4">Erro ao carregar workshops: {(error as Error).message}</p>
                <Button onClick={() => window.location.reload()}>
                    Tentar novamente
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Componente de Filtros */}
            <WorkshopFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                resultsCount={data?.meta?.total}
            />

            {/* Workshops Grid */}
            {data?.data.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">
                        Nenhum workshop encontrado com os filtros aplicados.
                    </p>
                    <Button
                        variant="outline"
                        onClick={handleClearFilters}
                        className="mt-4"
                    >
                        Limpar filtros
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.data.map((workshop) => (
                        <WorkshopCard key={workshop.id} workshop={workshop} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {data?.meta && data.meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                        variant="outline"
                        disabled={filters.page === 1}
                        onClick={() => handlePageChange((filters.page || 1) - 1)}
                    >
                        Anterior
                    </Button>

                    <div className="flex items-center gap-2">
                        {/* Páginas numéricas */}
                        {Array.from({ length: Math.min(5, data.meta.totalPages) }, (_, i) => {
                            const currentPage = filters.page || 1;
                            let pageNumber;

                            if (data.meta.totalPages <= 5) {
                                pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                                pageNumber = i + 1;
                            } else if (currentPage >= data.meta.totalPages - 2) {
                                pageNumber = data.meta.totalPages - 4 + i;
                            } else {
                                pageNumber = currentPage - 2 + i;
                            }

                            return (
                                <Button
                                    key={pageNumber}
                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNumber)}
                                >
                                    {pageNumber}
                                </Button>
                            );
                        })}
                    </div>

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
