import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

describe('AnalyticsController', () => {
    let controller: AnalyticsController;
    let service: AnalyticsService;
    let logger: Logger;

    const mockDashboardMetrics = {
        users: {
            total: 100,
            active: 85,
            newThisMonth: 12,
            roleDistribution: {
                STUDENT: 80,
                INSTRUCTOR: 15,
                ADMIN: 5,
            },
        },
        workshops: {
            total: 50,
            active: 30,
            completed: 15,
            cancelled: 5,
            averageRating: 4.2,
        },
        enrollments: {
            total: 250,
            thisMonth: 45,
            completionRate: 0.8,
        },
        revenue: {
            total: 15000,
            thisMonth: 2500,
            averagePerWorkshop: 300,
        },
    };

    const mockAnalyticsService = {
        getDashboardMetrics: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AnalyticsController],
            providers: [
                {
                    provide: AnalyticsService,
                    useValue: mockAnalyticsService,
                },
            ],
        }).compile();

        controller = module.get<AnalyticsController>(AnalyticsController);
        service = module.get<AnalyticsService>(AnalyticsService);
        logger = new Logger(AnalyticsController.name);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getDashboardMetrics', () => {
        it('should return dashboard metrics successfully', async () => {
            mockAnalyticsService.getDashboardMetrics.mockResolvedValue(mockDashboardMetrics);

            const result = await controller.getDashboardMetrics();

            expect(service.getDashboardMetrics).toHaveBeenCalled();
            expect(result).toEqual(mockDashboardMetrics);
        });

        it('should handle errors and throw HttpException', async () => {
            const error = new Error('Database connection failed');
            mockAnalyticsService.getDashboardMetrics.mockRejectedValue(error);

            await expect(controller.getDashboardMetrics()).rejects.toThrow(
                new HttpException('Failed to fetch dashboard metrics', HttpStatus.INTERNAL_SERVER_ERROR),
            );

            expect(service.getDashboardMetrics).toHaveBeenCalled();
        });
    });

    describe('getHealthCheck', () => {
        it('should return health check information', () => {
            const beforeTime = new Date();
            const result = controller.getHealthCheck();
            const afterTime = new Date();

            expect(result).toHaveProperty('status', 'ok');
            expect(result).toHaveProperty('service', 'analytics');
            expect(result).toHaveProperty('timestamp');

            // Check if timestamp is within reasonable range
            const resultTime = new Date(result.timestamp);
            expect(resultTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
            expect(resultTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
        });

        it('should have correct health check structure', () => {
            const result = controller.getHealthCheck();

            expect(typeof result.status).toBe('string');
            expect(typeof result.timestamp).toBe('string');
            expect(typeof result.service).toBe('string');
            expect(Object.keys(result)).toEqual(['status', 'timestamp', 'service']);
        });
    });
});
