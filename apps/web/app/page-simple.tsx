// apps/web/app/page-simple.tsx
export default function HomePage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-center mb-8">SkillShare Hub</h1>
            <p className="text-xl text-center text-gray-600 mb-8">
                Plataforma para compartilhar conhecimentos através de workshops
            </p>
            
            <div className="text-center">
                <a 
                    href="/auth/signin" 
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg mr-4 inline-block hover:bg-blue-700"
                >
                    Entrar
                </a>
                <a 
                    href="/auth/register" 
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-gray-700"
                >
                    Cadastrar
                </a>
            </div>
        </div>
    );
}
