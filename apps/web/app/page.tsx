// apps/web/app/page.tsx
import { Suspense } from 'react';
import LandingHero from '../components/LandingHero';
import FeaturedWorkshops from '../components/FeaturedWorkshops';
import WorkshopCategories from '../components/WorkshopCategories';

export default function HomePage() {
    return (
        <div>
            {/* Hero Section */}
            <LandingHero />

            {/* Featured Workshops Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Workshops em Destaque
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Descubra os workshops mais populares da nossa plataforma
                        </p>
                    </div>
                    
                    <Suspense fallback={
                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
                            ))}
                        </div>
                    }>
                        <FeaturedWorkshops />
                    </Suspense>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Explore por Categoria
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Encontre workshops na área que mais te interessa
                        </p>
                    </div>
                    
                    <WorkshopCategories />
                </div>
            </section>

            {/* How it Works Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Como funciona?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Simples e fácil de usar
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl font-bold text-blue-600">1</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Cadastre-se</h3>
                            <p className="text-gray-600">Crie sua conta gratuita em menos de 2 minutos.</p>
                        </div>
                        
                        <div className="text-center p-6">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl font-bold text-green-600">2</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Escolha um Workshop</h3>
                            <p className="text-gray-600">Navegue pelos workshops disponíveis e encontre o ideal.</p>
                        </div>
                        
                        <div className="text-center p-6">
                            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl font-bold text-purple-600">3</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Comece a Aprender</h3>
                            <p className="text-gray-600">Participe do workshop e desenvolva suas habilidades.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
