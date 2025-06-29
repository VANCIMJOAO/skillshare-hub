// apps/api/src/common/interfaces/api-response.interface.ts
export interface ApiResponse<T> {
    data: T;
    message?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
    errors?: string[];
}
