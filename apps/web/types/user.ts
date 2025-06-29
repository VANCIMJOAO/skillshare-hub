// apps/web/types/user.ts
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
    status?: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: 'STUDENT' | 'INSTRUCTOR';
}

export interface LoginDto {
    email: string;
    password: string;
}
