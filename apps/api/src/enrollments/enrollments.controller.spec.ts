import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { User, UserRole } from '../users/entities/user.entity';
import { Enrollment } from '../workshops/entities/enrollment.entity';

describe('EnrollmentsController', () => {
    let controller: EnrollmentsController;
    let service: EnrollmentsService;

    const mockUser: User = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        role: UserRole.STUDENT,
        createdAt: new Date(),
        updatedAt: new Date(),
        workshops: [],
        enrollments: [],
        notifications: [],
        notificationPreferences: null,
    };

    const mockEnrollment: Enrollment = {
        id: 'enrollment-1',
        workshopId: 'workshop-1',
        userId: 'user-1',
        createdAt: new Date(),
        workshop: null,
        user: null,
    };

    const mockEnrollmentsService = {
        enroll: jest.fn(),
        unenroll: jest.fn(),
        findUserEnrollments: jest.fn(),
        findWorkshopEnrollments: jest.fn(),
        isUserEnrolled: jest.fn(),
        getEnrollmentStats: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EnrollmentsController],
            providers: [
                {
                    provide: EnrollmentsService,
                    useValue: mockEnrollmentsService,
                },
            ],
        }).compile();

        controller = module.get<EnrollmentsController>(EnrollmentsController);
        service = module.get<EnrollmentsService>(EnrollmentsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('enroll', () => {
        it('should successfully enroll user in workshop', async () => {
            const workshopId = 'workshop-1';
            mockEnrollmentsService.enroll.mockResolvedValue(mockEnrollment);

            const result = await controller.enroll(workshopId, mockUser);

            expect(service.enroll).toHaveBeenCalledWith(workshopId, mockUser.id);
            expect(result).toEqual({
                data: mockEnrollment,
                message: 'Successfully enrolled in workshop',
            });
        });

        it('should handle enrollment errors', async () => {
            const workshopId = 'workshop-1';
            const error = new Error('Workshop not found');
            mockEnrollmentsService.enroll.mockRejectedValue(error);

            await expect(controller.enroll(workshopId, mockUser)).rejects.toThrow(error);
        });
    });

    describe('unenroll', () => {
        it('should successfully unenroll user from workshop', async () => {
            const workshopId = 'workshop-1';
            mockEnrollmentsService.unenroll.mockResolvedValue(undefined);

            const result = await controller.unenroll(workshopId, mockUser);

            expect(service.unenroll).toHaveBeenCalledWith(workshopId, mockUser.id);
            expect(result).toEqual({
                data: null,
                message: 'Successfully unenrolled from workshop',
            });
        });

        it('should handle unenrollment errors', async () => {
            const workshopId = 'workshop-1';
            const error = new Error('Enrollment not found');
            mockEnrollmentsService.unenroll.mockRejectedValue(error);

            await expect(controller.unenroll(workshopId, mockUser)).rejects.toThrow(error);
        });
    });

    describe('getMyEnrollments', () => {
        it('should return user enrollments', async () => {
            const enrollments = [mockEnrollment];
            mockEnrollmentsService.findUserEnrollments.mockResolvedValue(enrollments);

            const result = await controller.getMyEnrollments(mockUser);

            expect(service.findUserEnrollments).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual({
                data: enrollments,
            });
        });

        it('should return empty array when user has no enrollments', async () => {
            mockEnrollmentsService.findUserEnrollments.mockResolvedValue([]);

            const result = await controller.getMyEnrollments(mockUser);

            expect(result).toEqual({
                data: [],
            });
        });
    });

    describe('getWorkshopEnrollments', () => {
        it('should return workshop enrollments', async () => {
            const workshopId = 'workshop-1';
            const enrollments = [mockEnrollment];
            mockEnrollmentsService.findWorkshopEnrollments.mockResolvedValue(enrollments);

            const result = await controller.getWorkshopEnrollments(workshopId);

            expect(service.findWorkshopEnrollments).toHaveBeenCalledWith(workshopId);
            expect(result).toEqual({
                data: enrollments,
            });
        });

        it('should return empty array when workshop has no enrollments', async () => {
            const workshopId = 'workshop-1';
            mockEnrollmentsService.findWorkshopEnrollments.mockResolvedValue([]);

            const result = await controller.getWorkshopEnrollments(workshopId);

            expect(result).toEqual({
                data: [],
            });
        });
    });

    describe('checkEnrollment', () => {
        it('should return true when user is enrolled', async () => {
            const workshopId = 'workshop-1';
            mockEnrollmentsService.isUserEnrolled.mockResolvedValue(true);

            const result = await controller.checkEnrollment(workshopId, mockUser);

            expect(service.isUserEnrolled).toHaveBeenCalledWith(workshopId, mockUser.id);
            expect(result).toEqual({
                data: { isEnrolled: true },
            });
        });

        it('should return false when user is not enrolled', async () => {
            const workshopId = 'workshop-1';
            mockEnrollmentsService.isUserEnrolled.mockResolvedValue(false);

            const result = await controller.checkEnrollment(workshopId, mockUser);

            expect(result).toEqual({
                data: { isEnrolled: false },
            });
        });
    });

    describe('getEnrollmentStats', () => {
        it('should return enrollment statistics', async () => {
            const workshopId = 'workshop-1';
            const stats = {
                totalEnrollments: 5,
                availableSpots: 15,
                isFull: false,
            };
            mockEnrollmentsService.getEnrollmentStats.mockResolvedValue(stats);

            const result = await controller.getEnrollmentStats(workshopId);

            expect(service.getEnrollmentStats).toHaveBeenCalledWith(workshopId);
            expect(result).toEqual({
                data: stats,
            });
        });

        it('should handle stats for full workshop', async () => {
            const workshopId = 'workshop-1';
            const stats = {
                totalEnrollments: 20,
                availableSpots: 0,
                isFull: true,
            };
            mockEnrollmentsService.getEnrollmentStats.mockResolvedValue(stats);

            const result = await controller.getEnrollmentStats(workshopId);

            expect(result).toEqual({
                data: stats,
            });
        });
    });
});
