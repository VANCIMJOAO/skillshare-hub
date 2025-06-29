// apps/web/lib/api.ts
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

class ApiClient {
    private baseURL: string;
    private defaultTimeout: number = 10000; // 10 seconds

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

    private async fetchWithTimeout(url: string, options: RequestInit, timeout = this.defaultTimeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    async get<T>(endpoint: string): Promise<T> {
        const headers = await this.getAuthHeaders();
        const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return response.json();
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        const headers = await this.getAuthHeaders();
        const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return response.json();
    }

    async put<T>(endpoint: string, data?: any): Promise<T> {
        const headers = await this.getAuthHeaders();
        const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return response.json();
    }

    async patch<T>(endpoint: string, data?: any): Promise<T> {
        const headers = await this.getAuthHeaders();
        const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
            method: 'PATCH',
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return response.json();
    }

    async delete<T>(endpoint: string): Promise<T> {
        const headers = await this.getAuthHeaders();
        const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return response.json();
    }

    // Health check method
    async healthCheck(): Promise<boolean> {
        try {
            await this.get('/health');
            return true;
        } catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
export const api = apiClient;
