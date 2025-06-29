// apps/web/app/page.tsx
import { Suspense } from 'react';
import FixedWorkshopsList from './components/FixedWorkshopsList';
import LandingHero from '../components/LandingHero';

export default function HomePage() {
    return (
        <div>
            {/* Hero Section Moderna */}
            <LandingHero />

            {/* Lista de Workshops */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Workshops em Destaque
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Explore nossa seleção de workshops mais populares e comece sua jornada de aprendizado hoje mesmo.
                    </p>
                </div>

                <Suspense fallback={<WorkshopsListSkeleton />}>
                    <FixedWorkshopsList />
                </Suspense>
            </section>
        </div>
    );
}

function WorkshopsListSkeleton() {
    return (
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
    );
}
