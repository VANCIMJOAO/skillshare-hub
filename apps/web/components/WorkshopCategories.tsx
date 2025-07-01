"use client";

import Link from 'next/link';

const categories = [
    {
        name: 'Programação',
        icon: '💻',
        description: 'Desenvolvimento web, mobile e desktop',
        color: 'bg-blue-100 text-blue-800'
    },
    {
        name: 'Design',
        icon: '🎨',
        description: 'UI/UX, design gráfico e ilustração',
        color: 'bg-purple-100 text-purple-800'
    },
    {
        name: 'Marketing',
        icon: '📈',
        description: 'Marketing digital, vendas e estratégia',
        color: 'bg-green-100 text-green-800'
    },
    {
        name: 'Negócios',
        icon: '💼',
        description: 'Empreendedorismo, gestão e liderança',
        color: 'bg-yellow-100 text-yellow-800'
    },
    {
        name: 'Tecnologia',
        icon: '⚡',
        description: 'DevOps, infraestrutura e ferramentas',
        color: 'bg-red-100 text-red-800'
    },
    {
        name: 'Criatividade',
        icon: '✨',
        description: 'Arte, música e criação de conteúdo',
        color: 'bg-pink-100 text-pink-800'
    }
];

export default function WorkshopCategories() {
    return (
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
                <Link
                    key={category.name}
                    href={`/workshops?category=${category.name.toLowerCase()}`}
                    className="group"
                >
                    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="text-4xl mb-3">
                            {category.icon}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {category.description}
                        </p>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-3 ${category.color}`}>
                            Explorar
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
