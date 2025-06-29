// apps/web/lib/api.ts
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async getAuthHeaders() {
        const session = await getSession();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (session?.accessToken) {
            headers.Authorization = `Bearer ${session.accessToken}`;
        }

        return headers;
    }

    async get<T>(endpoint: string): Promise<T> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async put<T>(endpoint: string, data?: any): Promise<T> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async patch<T>(endpoint: string, data?: any): Promise<T> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PATCH',
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async delete<T>(endpoint: string): Promise<T> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
export const api = apiClient;
