// apps/web/app/workshops/[id]/page.tsx
import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Workshop } from '@/types/workshop';
import WorkshopDetails from './WorkshopDetails';

interface PageProps {
    params: {
        id: string;
    };
}

async function getWorkshop(id: string): Promise<Workshop | null> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workshops/${id}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        return null;
    }
}

export default async function WorkshopPage({ params }: PageProps) {
    const workshop = await getWorkshop(params.id);

    if (!workshop) {
        notFound();
    }

    return <WorkshopDetails workshop={workshop} />;
}
