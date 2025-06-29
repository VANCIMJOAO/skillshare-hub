// apps/api/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    @Get()
    @ApiOperation({ summary: 'Get application health status' })
    @ApiResponse({
        status: 200,
        description: 'Health check successful',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', example: '2025-06-27T14:30:00.000Z' },
                uptime: { type: 'number', example: 12345 },
                version: { type: 'string', example: '1.0.0' },
                environment: { type: 'string', example: 'production' },
                database: { type: 'string', example: 'connected' },
                redis: { type: 'string', example: 'connected' }
            }
        }
    })
    async getHealth() {
        return this.healthService.getHealthStatus();
    }

    @Get('detailed')
    @ApiOperation({ summary: 'Get detailed health information' })
    @ApiResponse({
        status: 200,
        description: 'Detailed health information',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string' },
                timestamp: { type: 'string' },
                services: {
                    type: 'object',
                    properties: {
                        database: { type: 'object' },
                        api: { type: 'object' },
                        websocket: { type: 'object' }
                    }
                },
                metrics: {
                    type: 'object',
                    properties: {
                        totalUsers: { type: 'number' },
                        totalWorkshops: { type: 'number' },
                        activeConnections: { type: 'number' }
                    }
                }
            }
        }
    })
    async getDetailedHealth() {
        return this.healthService.getDetailedHealthStatus();
    }
}
