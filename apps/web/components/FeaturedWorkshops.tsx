"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users } from 'lucide-react';

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

export default function FeaturedWorkshops() {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWorkshops();
    }, []);

    const fetchWorkshops = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://skillsharehub-production.up.railway.app';
            const response = await fetch(`${apiUrl}/api/workshops`);
            
            if (!response.ok) {
                throw new Error('Falha ao carregar workshops');
            }
            
            const data = await response.json();
            setWorkshops(data.slice(0, 6)); // Mostrar apenas os primeiros 6
            setLoading(false);
        } catch (err) {
            console.error('Erro ao buscar workshops:', err);
            setError('Não foi possível carregar os workshops');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">{error}</p>
                <button 
                    onClick={fetchWorkshops}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (workshops.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Nenhum workshop encontrado</p>
                <Link 
                    href="/workshops/create" 
                    className="text-blue-600 hover:text-blue-700 font-medium"
                >
                    Seja o primeiro a criar um workshop
                </Link>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-3 gap-6">
            {workshops.map((workshop) => (
                <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className="mb-2">
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
    );
}
