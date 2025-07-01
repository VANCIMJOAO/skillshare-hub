'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen,
    Users,
    PlusCircle,
    Settings,
    CheckCircle,
    ArrowRight,
    Play
} from 'lucide-react';
import Link from 'next/link';

export default function GettingStartedPage() {
    const { data: session } = useSession();

    const adminSteps = [
        {
            title: 'Acesse o Painel Administrativo',
            description: 'Gerencie usuários, workshops e visualize estatísticas',
            icon: Settings,
            href: '/admin',
            color: 'bg-red-100 text-red-700',
        },
        {
            title: 'Criar Workshop de Exemplo',
            description: 'Crie seu primeiro workshop para testar a plataforma',
            icon: PlusCircle,
            href: '/workshops/create',
            color: 'bg-blue-100 text-blue-700',
        },
        {
            title: 'Visualizar Workshops',
            description: 'Veja todos os workshops na página inicial',
            icon: BookOpen,
            href: '/',
            color: 'bg-green-100 text-green-700',
        },
    ];

    const instructorSteps = [
        {
            title: 'Acesse seu Dashboard',
            description: 'Gerencie seus workshops e acompanhe inscrições',
            icon: Users,
            href: '/instructor/dashboard',
            color: 'bg-purple-100 text-purple-700',
        },
        {
            title: 'Criar Primeiro Workshop',
            description: 'Compartilhe seu conhecimento criando workshops',
            icon: PlusCircle,
            href: '/workshops/create',
            color: 'bg-blue-100 text-blue-700',
        },
        {
            title: 'Visualizar Workshop',
            description: 'Veja como seus workshops aparecem para os alunos',
            icon: BookOpen,
            href: '/',
            color: 'bg-green-100 text-green-700',
        },
    ];

    const studentSteps = [
        {
            title: 'Explorar Workshops',
            description: 'Descubra workshops interessantes na página inicial',
            icon: BookOpen,
            href: '/',
            color: 'bg-green-100 text-green-700',
        },
        {
            title: 'Ver Detalhes',
            description: 'Clique em um workshop para ver mais informações',
            icon: ArrowRight,
            href: '/',
            color: 'bg-blue-100 text-blue-700',
        },
        {
            title: 'Gerenciar Perfil',
            description: 'Atualize suas informações pessoais',
            icon: Users,
            href: '/profile',
            color: 'bg-purple-100 text-purple-700',
        },
    ];

    const getStepsForRole = () => {
        if (!session) return studentSteps;

        switch (session.user.role) {
            case 'ADMIN':
                return adminSteps;
            case 'INSTRUCTOR':
                return instructorSteps;
            default:
                return studentSteps;
        }
    };

    const steps = getStepsForRole();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Bem-vindo ao SkillShare Hub! 🎉
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                    Sua plataforma para compartilhar e aprender novas habilidades
                </p>
                {session && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <span className="text-gray-600">Logado como:</span>
                        <Badge variant={
                            session.user.role === 'ADMIN' ? 'destructive' :
                                session.user.role === 'INSTRUCTOR' ? 'default' :
                                    'secondary'
                        }>
                            {session.user.role}
                        </Badge>
                        <span className="font-semibold">{session.user.name}</span>
                    </div>
                )}
            </div>

            {/* Sistema funcionando */}
            <Card className="mb-8 border-green-200 bg-green-50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-green-800">Sistema Funcionando!</CardTitle>
                    </div>
                    <CardDescription className="text-green-700">
                        Parabéns! Sua aplicação SkillShare Hub está rodando perfeitamente.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-green-700">
                    <p className="mb-2">✅ Frontend Next.js 14 configurado</p>
                    <p className="mb-2">✅ Backend NestJS 10 funcionando</p>
                    <p className="mb-2">✅ Autenticação JWT implementada</p>
                    <p className="mb-2">✅ Base de dados PostgreSQL conectada</p>
                    <p>✅ Sistema de roles (Admin, Instrutor, Estudante)</p>
                </CardContent>
            </Card>

            {/* Próximos passos */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Próximos Passos
                </h2>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${step.color}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <Badge variant="outline" className="mb-2">
                                                Passo {index + 1}
                                            </Badge>
                                            <CardTitle className="text-lg">{step.title}</CardTitle>
                                        </div>
                                    </div>
                                    <CardDescription>
                                        {step.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild className="w-full">
                                        <Link href={step.href}>
                                            <Play className="h-4 w-4 mr-2" />
                                            Começar
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Funcionalidades implementadas */}
            <Card>
                <CardHeader>
                    <CardTitle>Funcionalidades Implementadas</CardTitle>
                    <CardDescription>
                        Explore tudo que sua aplicação pode fazer
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <h3 className="font-semibold mb-2">🔐 Autenticação</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Login e registro de usuários</li>
                                <li>• Sistema de roles (Admin, Instrutor, Estudante)</li>
                                <li>• Proteção de rotas</li>
                                <li>• Perfil do usuário</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">📚 Workshops</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Criar e editar workshops</li>
                                <li>• Visualizar detalhes</li>
                                <li>• Dashboard do instrutor</li>
                                <li>• Filtros e busca</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">👥 Administração</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Painel administrativo</li>
                                <li>• Gerenciar usuários</li>
                                <li>• Estatísticas da plataforma</li>
                                <li>• Controle de workshops</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">🎨 Interface</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Design moderno com Tailwind CSS</li>
                                <li>• Componentes ShadCN/UI</li>
                                <li>• Responsivo para mobile</li>
                                <li>• Notificações toast</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Ajuda */}
            <div className="mt-8 text-center text-sm text-gray-500">
                <p>
                    Precisa de ajuda? Esta aplicação foi desenvolvida com as melhores práticas
                    de desenvolvimento full-stack TypeScript.
                </p>
            </div>
        </div>
    );
}
