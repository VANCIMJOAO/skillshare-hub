"use client";

// Landing page melhorada
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    BookOpen,
    Users,
    Trophy,
    Star,
    Play,
    CheckCircle,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';

const stats = [
    { label: 'Workshops Ativos', value: '150+', icon: BookOpen },
    { label: 'Estudantes', value: '2.5k+', icon: Users },
    { label: 'Instrutores', value: '50+', icon: Trophy },
    { label: 'Satisfação', value: '4.9★', icon: Star },
];

const features = [
    {
        icon: BookOpen,
        title: 'Workshops Diversos',
        description: 'Desde programação até design, encontre o curso perfeito para você.',
        color: 'bg-blue-50 text-blue-600'
    },
    {
        icon: Users,
        title: 'Comunidade Ativa',
        description: 'Conecte-se com outros estudantes e instrutores especializados.',
        color: 'bg-green-50 text-green-600'
    },
    {
        icon: Trophy,
        title: 'Certificados',
        description: 'Receba certificados reconhecidos ao concluir os workshops.',
        color: 'bg-purple-50 text-purple-600'
    },
];

const testimonials = [
    {
        name: 'Ana Silva',
        role: 'Desenvolvedora Frontend',
        content: 'O SkillShare Hub transformou minha carreira. Aprendi React e consegui meu primeiro emprego!',
        avatar: '👩‍💻'
    },
    {
        name: 'Carlos Santos',
        role: 'Designer UX',
        content: 'Plataforma incrível! A qualidade dos workshops e a interação com outros alunos é excepcional.',
        avatar: '👨‍🎨'
    },
];

export default function LandingHero() {
    const [playingDemo, setPlayingDemo] = useState(false);

    return (
        <>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="relative container mx-auto px-4 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Nova plataforma de workshops
                                </Badge>
                                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                                    Aprenda com os
                                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {' '}melhores{' '}
                                    </span>
                                    instrutores
                                </h1>
                                <p className="text-xl text-gray-600 max-w-lg">
                                    Descubra workshops práticos, conecte-se com especialistas e
                                    transforme sua carreira com conhecimento de qualidade.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                                    Explorar Workshops
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setPlayingDemo(true)}
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    Ver Demo
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="flex justify-center mb-2">
                                            <stat.icon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                        <div className="text-sm text-gray-600">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Button
                                        size="lg"
                                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                                        onClick={() => setPlayingDemo(true)}
                                    >
                                        <Play className="h-8 w-8" />
                                    </Button>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-gray-600">Interface intuitiva</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-gray-600">Notificações em tempo real</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-gray-600">Dashboards personalizados</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Por que escolher o SkillShare Hub?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Uma plataforma completa que conecta conhecimento e oportunidades
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
                                <CardContent className="p-8 text-center">
                                    <div className={`w-16 h-16 rounded-full ${feature.color} flex items-center justify-center mx-auto mb-6`}>
                                        <feature.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">
                            O que nossos alunos dizem
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="border-0 shadow-md">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 mb-6 italic">
                                        "{testimonial.content}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{testimonial.avatar}</div>
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {testimonial.name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {testimonial.role}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto space-y-8 text-white">
                        <h2 className="text-4xl font-bold">
                            Pronto para começar sua jornada?
                        </h2>
                        <p className="text-xl opacity-90">
                            Junte-se a milhares de estudantes que já transformaram suas carreiras
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                Criar Conta Gratuita
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                Falar com Vendas
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
