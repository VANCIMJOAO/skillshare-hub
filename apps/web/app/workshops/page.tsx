"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Users, Search } from 'lucide-react';

interface Workshop {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    duration: number;
    maxParticipants: number;
    instructor: {
        name: string;
    };
    _count?: {
        enrollments: number;
    };
}

export default function WorkshopsPage() {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    
    const searchParams = useSearchParams();
    const categoryParam = searchParams?.get('category');

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
        fetchWorkshops();
    }, [categoryParam]);

    const fetchWorkshops = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://skillsharehub-production.up.railway.app';
            const response = await fetch(`${apiUrl}/api/workshops`);
            
            if (!response.ok) {
                throw new Error('Falha ao carregar workshops');
            }
            
            const data = await response.json();
            setWorkshops(data);
            setLoading(false);
        } catch (err) {
            console.error('Erro ao buscar workshops:', err);
            setError('Não foi possível carregar os workshops');
            setLoading(false);
        }
    };

    const filteredWorkshops = workshops.filter(workshop => {
        const matchesSearch = workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            workshop.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || 
                              workshop.category.toLowerCase() === selectedCategory.toLowerCase();
        
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(workshops.map(w => w.category)));

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Carregando workshops...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Todos os Workshops
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Descubra workshops incríveis e desenvolva suas habilidades
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Buscar workshops..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Todas as categorias</option>
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>

                    <Link href="/workshops/create">
                        <Button>
                            Criar Workshop
                        </Button>
                    </Link>
                </div>

                {/* Results */}
                {error ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">{error}</p>
                        <Button onClick={fetchWorkshops}>
                            Tentar novamente
                        </Button>
                    </div>
                ) : filteredWorkshops.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">Nenhum workshop encontrado</p>
                        <Link href="/workshops/create">
                            <Button>
                                Criar o primeiro workshop
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWorkshops.map((workshop) => (
                            <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary">
                                            {workshop.category}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg">
                                        <Link 
                                            href={`/workshops/${workshop.id}`}
                                            className="hover:text-blue-600 transition-colors"
                                        >
                                            {workshop.title}
                                        </Link>
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {workshop.description}
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(workshop.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>{workshop.duration} minutos</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {workshop._count?.enrollments || 0} / {workshop.maxParticipants} participantes
                                            </span>
                                        </div>
                                        
                                        <div className="pt-2">
                                            <p className="text-sm font-medium">
                                                Instrutor: {workshop.instructor.name}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <Link 
                                            href={`/workshops/${workshop.id}`}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                                        >
                                            Ver Detalhes
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
