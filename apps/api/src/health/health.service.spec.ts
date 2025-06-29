// apps/api/src/health/health.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/typeorm';
import { HealthService } from './health.service';

describe('HealthService', () => {
    let service: HealthService;
    let mockConnection: any;

    beforeEach(async () => {
        mockConnection = {
            isConnected: true,
            query: jest.fn().mockResolvedValue([{ count: '5' }]),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HealthService,
                {
                    provide: getConnectionToken(),
                    useValue: mockConnection,
                },
            ],
        }).compile();

        service = module.get<HealthService>(HealthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getHealthStatus', () => {
        it('should return health status with database connected', async () => {
            const result = await service.getHealthStatus();

            expect(result).toHaveProperty('status', 'ok');
            expect(result).toHaveProperty('database', 'connected');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('uptime');
            expect(result).toHaveProperty('version');
            expect(result).toHaveProperty('environment');
            expect(result).toHaveProperty('memory');
        });

        it('should return error status when database is disconnected', async () => {
            mockConnection.isConnected = false;

            const result = await service.getHealthStatus();

            expect(result).toHaveProperty('status', 'error');
            expect(result).toHaveProperty('database', 'disconnected');
        });

        it('should handle database query errors', async () => {
            mockConnection.query.mockRejectedValue(new Error('DB Error'));

            const result = await service.getHealthStatus();

            expect(result).toHaveProperty('status', 'error');
            expect(result).toHaveProperty('database', 'error');
        });
    });

    describe('getDetailedHealthStatus', () => {
        it('should return detailed health information', async () => {
            const result = await service.getDetailedHealthStatus();

            expect(result).toHaveProperty('services');
            expect(result).toHaveProperty('metrics');
            expect(result.services).toHaveProperty('database');
            expect(result.services).toHaveProperty('api');
            expect(result.services).toHaveProperty('websocket');
            expect(result.metrics).toHaveProperty('totalUsers');
            expect(result.metrics).toHaveProperty('totalWorkshops');
        });
    });
});
