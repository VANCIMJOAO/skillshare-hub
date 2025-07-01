// apps/web/components/AnalyticsDashboard.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Users,
    BookOpen,
    TrendingUp,
    DollarSign,
    Activity,
    Calendar,
    Award,
    BarChart3,
    RefreshCw,
    PieChart,
    LineChart
} from 'lucide-react';

interface DashboardMetrics {
    totalUsers: number;
    totalWorkshops: number;
    totalEnrollments: number;
    activeWorkshops: number;
    revenue: number;
    userGrowth: number;
    workshopGrowth: number;
    popularCategories: Array<{ category: string; count: number; percentage: number }>;
    revenueByMonth: Array<{ month: string; revenue: number; enrollments: number }>;
    usersByRole: Array<{ role: string; count: number; percentage: number }>;
    topInstructors: Array<{
        instructor: string;
        workshopsCount: number;
        enrollmentsCount: number;
        revenue: number;
    }>;
    enrollmentTrends: Array<{ date: string; enrollments: number; revenue: number }>;
}

// Componente de gráfico de barra simples
const SimpleBarChart = ({ data, title }: { data: any[], title: string }) => {
    const maxValue = Math.max(...data.map(item => item.count || item.revenue || item.enrollments));

    return (
        <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{title}</h4>
            {data.slice(0, 5).map((item, index) => (
                <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.category || item.month || item.instructor}</span>
                        <span className="font-medium">
                            {item.count || item.revenue || item.enrollments}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${((item.count || item.revenue || item.enrollments) / maxValue) * 100}%`
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

// Componente de gráfico de pizza simples
const SimplePieChart = ({ data, title }: { data: any[], title: string }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    let cumulativePercentage = 0;

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{title}</h4>
            <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                    <svg viewBox="0 0 42 42" className="w-32 h-32">
                        <circle
                            cx="21"
                            cy="21"
                            r="15.915"
                            fill="transparent"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                        />
                        {data.map((item, index) => {
                            const percentage = (item.count / total) * 100;
                            const strokeDasharray = `${percentage} ${100 - percentage}`;
                            const strokeDashoffset = -cumulativePercentage;
                            cumulativePercentage += percentage;

                            return (
                                <circle
                                    key={index}
                                    cx="21"
                                    cy="21"
                                    r="15.915"
                                    fill="transparent"
                                    stroke={colors[index % colors.length]}
                                    strokeWidth="3"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    transform="rotate(-90 21 21)"
                                />
                            );
                        })}
                    </svg>
                </div>
            </div>
            <div className="space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="text-sm text-gray-600">{item.role}</span>
                        <span className="text-sm font-medium ml-auto">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function AnalyticsDashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            setError(null);

            // Dashboard metrics data
            const mockData: DashboardMetrics = {
                totalUsers: 2547,
                totalWorkshops: 156,
                totalEnrollments: 4892,
                activeWorkshops: 89,
                revenue: 45890.50,
                userGrowth: 12.5,
                workshopGrowth: 8.3,
                popularCategories: [
                    { category: 'Programação', count: 45, percentage: 28.8 },
                    { category: 'Design', count: 32, percentage: 20.5 },
                    { category: 'Marketing', count: 28, percentage: 17.9 },
                    { category: 'Negócios', count: 24, percentage: 15.4 },
                    { category: 'Dados', count: 18, percentage: 11.5 }
                ],
                revenueByMonth: [
                    { month: 'Jan', revenue: 12500, enrollments: 245 },
                    { month: 'Fev', revenue: 15800, enrollments: 312 },
                    { month: 'Mar', revenue: 18900, enrollments: 398 },
                    { month: 'Abr', revenue: 22100, enrollments: 445 },
                    { month: 'Mai', revenue: 25600, enrollments: 512 }
                ],
                usersByRole: [
                    { role: 'Estudantes', count: 2156, percentage: 84.6 },
                    { role: 'Instrutores', count: 312, percentage: 12.3 },
                    { role: 'Admins', count: 79, percentage: 3.1 }
                ],
                topInstructors: [
                    { instructor: 'João Silva', workshopsCount: 12, enrollmentsCount: 456, revenue: 12500 },
                    { instructor: 'Maria Santos', workshopsCount: 8, enrollmentsCount: 398, revenue: 9800 },
                    { instructor: 'Pedro Costa', workshopsCount: 10, enrollmentsCount: 345, revenue: 8900 },
                    { instructor: 'Ana Oliveira', workshopsCount: 6, enrollmentsCount: 298, revenue: 7200 },
                    { instructor: 'Carlos Lima', workshopsCount: 7, enrollmentsCount: 267, revenue: 6800 }
                ],
                enrollmentTrends: []
            };

            setMetrics(mockData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6 text-center">
                        <div className="text-red-600 text-lg font-semibold mb-2">
                            Erro ao carregar dashboard
                        </div>
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button onClick={fetchMetrics} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Tentar novamente
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!metrics) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Dashboard Analytics
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Visão geral das métricas da plataforma
                    </p>
                </div>
                <Button onClick={fetchMetrics} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                </Button>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers.toLocaleString()}</p>
                                <Badge variant={metrics.userGrowth >= 0 ? "default" : "destructive"} className="mt-1">
                                    {formatPercentage(metrics.userGrowth)}
                                </Badge>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Workshops</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.totalWorkshops}</p>
                                <Badge variant={metrics.workshopGrowth >= 0 ? "default" : "destructive"} className="mt-1">
                                    {formatPercentage(metrics.workshopGrowth)}
                                </Badge>
                            </div>
                            <BookOpen className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Inscrições</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.totalEnrollments.toLocaleString()}</p>
                                <Badge variant="secondary" className="mt-1">
                                    {metrics.activeWorkshops} ativos
                                </Badge>
                            </div>
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Receita</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.revenue)}</p>
                                <Badge variant="default" className="mt-1">
                                    Mensal
                                </Badge>
                            </div>
                            <DollarSign className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Categorias Populares
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart data={metrics.popularCategories} title="" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChart className="h-5 w-5" />
                            Receita por Mês
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart data={metrics.revenueByMonth} title="" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Usuários por Tipo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SimplePieChart data={metrics.usersByRole} title="" />
                    </CardContent>
                </Card>
            </div>

            {/* Top Instructors */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Top Instrutores
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {metrics.topInstructors.slice(0, 5).map((instructor, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-blue-600">
                                            #{index + 1}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{instructor.instructor}</p>
                                        <p className="text-sm text-gray-600">
                                            {instructor.workshopsCount} workshops • {instructor.enrollmentsCount} inscrições
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="secondary">
                                    {formatCurrency(instructor.revenue)}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
