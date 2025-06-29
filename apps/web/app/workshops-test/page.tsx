'use client';

import { useState, useEffect } from 'react';

export default function SimpleWorkshopsTest() {
    const [workshops, setWorkshops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchWorkshops() {
            try {
                setLoading(true);
                console.log('🔄 Fetching workshops from API...');
                
                const response = await fetch('http://localhost:3004/workshops');
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('✅ Workshops fetched:', data);
                
                setWorkshops(data.data || []);
                setError(null);
                
            } catch (err) {
                console.error('❌ Error fetching workshops:', err);
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
        
        fetchWorkshops();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando workshops...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-red-800 font-semibold mb-2">Erro ao carregar workshops</h3>
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">
                Workshops Disponíveis ({workshops.length})
            </h2>
            
            {workshops.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">Nenhum workshop encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workshops.map((workshop) => (
                        <div key={workshop.id} className="bg-white rounded-lg border shadow-sm p-6">
                            <h3 className="font-semibold text-lg mb-2">{workshop.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{workshop.description}</p>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Preço:</span>
                                    <span className="font-semibold text-green-600">R$ {workshop.price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Modo:</span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        workshop.mode === 'ONLINE' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {workshop.mode}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Instrutor:</span>
                                    <span>{workshop.owner?.name}</span>
                                </div>
                            </div>
                            
                            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                Ver Detalhes
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
