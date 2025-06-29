// apps/web/components/WorkshopFilters.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { WorkshopFilters as IWorkshopFilters, FilterOptions } from '@/types/workshop';
import { api } from '@/lib/api';
import {
    Search,
    X,
    SlidersHorizontal,
    Calendar,
    DollarSign,
    Users,
    ArrowUpDown
} from 'lucide-react';

interface WorkshopFiltersProps {
    filters: IWorkshopFilters;
    onFiltersChange: (filters: IWorkshopFilters) => void;
    onClearFilters: () => void;
    resultsCount?: number;
}

const WorkshopFilters = ({
    filters,
    onFiltersChange,
    onClearFilters,
    resultsCount
}: WorkshopFiltersProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchText, setSearchText] = useState(filters.search || '');
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        categories: [],
        priceRange: { min: 0, max: 1000 }
    });

    const updateFilter = useCallback((key: keyof IWorkshopFilters, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value,
            page: 1 // Reset page when filters change
        });
    }, [filters, onFiltersChange]);

    useEffect(() => {
        loadFilterOptions();
    }, []);

    // Debounce para busca por texto
    useEffect(() => {
        const timer = setTimeout(() => {
            // Apenas atualizar se o valor realmente mudou e não é igual ao filtro atual
            if (searchText !== filters.search) {
                updateFilter('search', searchText || undefined);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, updateFilter]);

    // Sincronizar o estado local com os filtros externos
    useEffect(() => {
        if (filters.search !== searchText) {
            setSearchText(filters.search || '');
        }
    }, []);

    const loadFilterOptions = async () => {
        try {
            const [categoriesResponse, priceRangeResponse] = await Promise.all([
                api.get('/workshops/filters/categories'),
                api.get('/workshops/filters/price-range')
            ]);

            setFilterOptions({
                categories: (categoriesResponse as any).data.data || [],
                priceRange: (priceRangeResponse as any).data.data || { min: 0, max: 1000 }
            });
        } catch (error) {
            console.error('Error loading filter options:', error);
        }
    };

    const hasActiveFilters = Object.keys(filters).some(key => {
        const value = filters[key as keyof IWorkshopFilters];
        // Não considerar página, limite como filtros ativos
        if (key === 'page' || key === 'limit') return false;
        // Qualquer valor não-undefined é considerado um filtro ativo
        return value !== undefined && value !== '' && value !== null;
    });

    const getActiveFiltersCount = () => {
        return Object.keys(filters).filter(key => {
            const value = filters[key as keyof IWorkshopFilters];
            // Não considerar página, limite como filtros ativos
            if (key === 'page' || key === 'limit') return false;
            // Qualquer valor não-undefined é considerado um filtro ativo
            return value !== undefined && value !== '' && value !== null;
        }).length;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Buscar Workshops
                        {resultsCount !== undefined && (
                            <Badge variant="secondary" className="ml-2">
                                {resultsCount} resultados
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilters}
                                className="text-red-600 hover:text-red-700"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Limpar ({getActiveFiltersCount()})
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <SlidersHorizontal className="w-4 h-4 mr-1" />
                            Filtros {isExpanded ? '▲' : '▼'}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Busca por texto */}
                <div className="space-y-2">
                    <Label>Buscar por título ou descrição</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Digite sua busca..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {isExpanded && (
                    <div className="space-y-4 pt-4 border-t">
                        {/* Modo e Categoria */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Modo</Label>
                                <Select
                                    value={filters.mode || ''}
                                    onValueChange={(value) => updateFilter('mode', value === '' ? undefined : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos os modos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todos os modos</SelectItem>
                                        <SelectItem value="ONLINE">Online</SelectItem>
                                        <SelectItem value="PRESENTIAL">Presencial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <Select
                                    value={filters.category || ''}
                                    onValueChange={(value) => updateFilter('category', value === '' ? undefined : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas as categorias" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todas as categorias</SelectItem>
                                        {filterOptions.categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Faixa de Preços */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Faixa de Preços
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Input
                                        type="number"
                                        placeholder={`Mín: R$ ${filterOptions.priceRange.min}`}
                                        value={filters.minPrice || ''}
                                        onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        min={filterOptions.priceRange.min}
                                        max={filterOptions.priceRange.max}
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="number"
                                        placeholder={`Máx: R$ ${filterOptions.priceRange.max}`}
                                        value={filters.maxPrice || ''}
                                        onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        min={filterOptions.priceRange.min}
                                        max={filterOptions.priceRange.max}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Datas */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Período
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                    <Input
                                        type="date"
                                        value={filters.startDate || ''}
                                        onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
                                        placeholder="Data início"
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="date"
                                        value={filters.endDate || ''}
                                        onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
                                        placeholder="Data fim"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ordenação */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <ArrowUpDown className="w-4 h-4" />
                                Ordenação
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Select
                                    value={filters.sortBy || ''}
                                    onValueChange={(value) => updateFilter('sortBy', value || 'createdAt')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="createdAt">Mais recentes</SelectItem>
                                        <SelectItem value="title">Título</SelectItem>
                                        <SelectItem value="price">Preço</SelectItem>
                                        <SelectItem value="startsAt">Data de início</SelectItem>
                                        <SelectItem value="popularity">Popularidade</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.sortOrder || ''}
                                    onValueChange={(value) => updateFilter('sortOrder', value || 'DESC')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Ordem" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DESC">Decrescente</SelectItem>
                                        <SelectItem value="ASC">Crescente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Apenas com vagas */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="availableOnly"
                                checked={filters.availableOnly || false}
                                onChange={(e) => updateFilter('availableOnly', e.target.checked || undefined)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="availableOnly" className="flex items-center gap-2 cursor-pointer">
                                <Users className="w-4 h-4" />
                                Apenas workshops com vagas disponíveis
                            </Label>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default WorkshopFilters;
