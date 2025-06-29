// apps/api/src/health/health.service.ts
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class HealthService {
    constructor(
        @InjectConnection()
        private readonly connection: Connection,
    ) { }

    async getHealthStatus() {
        const uptime = process.uptime();
        const timestamp = new Date().toISOString();

        // Check database connection
        let databaseStatus = 'disconnected';
        try {
            if (this.connection.isConnected) {
                await this.connection.query('SELECT 1');
                databaseStatus = 'connected';
            }
        } catch (error) {
            databaseStatus = 'error';
        }

        return {
            status: databaseStatus === 'connected' ? 'ok' : 'error',
            timestamp,
            uptime: Math.floor(uptime),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            database: databaseStatus,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
            }
        };
    }

    async getDetailedHealthStatus() {
        const basicHealth = await this.getHealthStatus();

        // Get additional metrics
        const metrics = await this.getMetrics();

        return {
            ...basicHealth,
            services: {
                database: {
                    status: basicHealth.database,
                    responseTime: await this.getDatabaseResponseTime()
                },
                api: {
                    status: 'healthy',
                    responseTime: '< 100ms'
                },
                websocket: {
                    status: 'active',
                    connections: 0 // TODO: Implement active connections count
                }
            },
            metrics
        };
    }

    private async getMetrics() {
        try {
            // Get basic metrics from database
            const [userCount, workshopCount] = await Promise.all([
                this.connection.query('SELECT COUNT(*) as count FROM "user"'),
                this.connection.query('SELECT COUNT(*) as count FROM "workshop"')
            ]);

            return {
                totalUsers: parseInt(userCount[0]?.count || '0'),
                totalWorkshops: parseInt(workshopCount[0]?.count || '0'),
                activeConnections: 0 // TODO: Implement WebSocket connection count
            };
        } catch (error) {
            return {
                totalUsers: 0,
                totalWorkshops: 0,
                activeConnections: 0
            };
        }
    }

    private async getDatabaseResponseTime(): Promise<string> {
        try {
            const start = Date.now();
            await this.connection.query('SELECT 1');
            const end = Date.now();
            return `${end - start}ms`;
        } catch (error) {
            return 'error';
        }
    }
}
