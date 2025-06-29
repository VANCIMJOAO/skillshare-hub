// apps/web/types/workshop.ts
export interface Workshop {
    id: string;
    title: string;
    description: string;
    instructor: string;
    category: string;
    price: number;
    mode: 'ONLINE' | 'PRESENTIAL';
    location?: string;
    imageUrl?: string;
    startDate: string; // startsAt
    endDate: string; // endsAt
    maxParticipants?: number;
    currentParticipants?: number;
    requirements?: string[];
    materials?: string[];
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    owner?: {
        id: string;
        name: string;
        email: string;
    };
    enrollments?: Enrollment[];
    // Compatibility fields
    startsAt: string;
    endsAt: string;
}

export interface Enrollment {
    id: string;
    userId: string;
    workshopId: string;
    createdAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    workshop?: Workshop;
}

export interface CreateWorkshopDto {
    title: string;
    description: string;
    price: number;
    mode: 'ONLINE' | 'PRESENTIAL';
    location?: string;
    startsAt: string;
    endsAt: string;
    maxParticipants?: number;
    imageUrl?: string;
}

export interface UpdateWorkshopDto extends Partial<CreateWorkshopDto> { }

export interface WorkshopsResponse {
    data: Workshop[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface WorkshopFilters {
    search?: string;
    mode?: 'ONLINE' | 'PRESENTIAL' | 'all';
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: 'title' | 'price' | 'startsAt' | 'createdAt' | 'popularity';
    sortOrder?: 'ASC' | 'DESC';
    availableOnly?: boolean;
    page?: number;
    limit?: number;
}

export interface FilterOptions {
    categories: string[];
    priceRange: {
        min: number;
        max: number;
    };
}
