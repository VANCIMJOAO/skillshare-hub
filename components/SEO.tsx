// apps/web/components/SEO.tsx
import Head from 'next/head';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
    keywords?: string[];
}

export default function SEO({
    title = 'SkillShare Hub - Plataforma de Workshops Educacionais',
    description = 'Descubra, crie e participe de workshops educacionais. Conecte-se com instrutores especialistas e desenvolva novas habilidades.',
    image = '/og-image.png',
    url = 'https://skillshare-hub.vercel.app',
    type = 'website',
    keywords = ['workshops', 'educação', 'cursos', 'aprendizado', 'habilidades']
}: SEOProps) {
    const fullTitle = title.includes('SkillShare Hub') ? title : `${title} | SkillShare Hub`;
    const fullUrl = url.startsWith('http') ? url : `https://skillshare-hub.vercel.app${url}`;
    const fullImage = image.startsWith('http') ? image : `https://skillshare-hub.vercel.app${image}`;

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords.join(', ')} />
            <meta name="author" content="SkillShare Hub Team" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph Meta Tags */}
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content="SkillShare Hub" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:image:alt" content={title} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:locale" content="pt_BR" />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />
            <meta name="twitter:image:alt" content={title} />
            <meta name="twitter:creator" content="@skillsharehub" />

            {/* Additional Meta Tags */}
            <meta name="theme-color" content="#0070f3" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="SkillShare Hub" />

            {/* Favicon */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />

            {/* Schema.org structured data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: 'SkillShare Hub',
                        description: description,
                        url: fullUrl,
                        applicationCategory: 'Education',
                        operatingSystem: 'Web',
                        offers: {
                            '@type': 'Offer',
                            price: '0',
                            priceCurrency: 'BRL'
                        },
                        creator: {
                            '@type': 'Organization',
                            name: 'SkillShare Hub Team'
                        }
                    })
                }}
            />
        </Head>
    );
}
