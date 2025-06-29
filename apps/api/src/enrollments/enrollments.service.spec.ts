import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from '../workshops/entities/enrollment.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { NotificationsService } from '../notifications/notifications.service';

describe('EnrollmentsService', () => {
    let service: EnrollmentsService;
    let enrollmentRepository: Repository<Enrollment>;
    let workshopRepository: Repository<Workshop>;
    let notificationsService: NotificationsService;

    const mockWorkshop = {
        id: 'workshop-1',
        title: 'Test Workshop',
        ownerId: 'instructor-1',
        startsAt: new Date(Date.now() + 86400000), // Tomorrow
        maxParticipants: 20,
        enrollments: [],
    };

    const mockEnrollment = {
        id: 'enrollment-1',
        workshopId: 'workshop-1',
        userId: 'user-1',
        createdAt: new Date(),
        workshop: mockWorkshop,
    };

    const mockEnrollmentRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
    };

    const mockWorkshopRepository = {
        findOne: jest.fn(),
    };

    const mockNotificationsService = {
        createWorkshopEnrollmentNotification: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EnrollmentsService,
                {
                    provide: getRepositoryToken(Enrollment),
                    useValue: mockEnrollmentRepository,
                },
                {
                    provide: getRepositoryToken(Workshop),
                    useValue: mockWorkshopRepository,
                },
                {
                    provide: NotificationsService,
                    useValue: mockNotificationsService,
                },
            ],
        }).compile();

        service = module.get<EnrollmentsService>(EnrollmentsService);
        enrollmentRepository = module.get<Repository<Enrollment>>(getRepositoryToken(Enrollment));
        workshopRepository = module.get<Repository<Workshop>>(getRepositoryToken(Workshop));
        notificationsService = module.get<NotificationsService>(NotificationsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('enroll', () => {
        it('should successfully enroll user in workshop', async () => {
            const workshopId = 'workshop-1';
            const userId = 'user-1';

            mockWorkshopRepository.findOne.mockResolvedValue(mockWorkshop);
            mockEnrollmentRepository.findOne.mockResolvedValue(null);
            mockEnrollmentRepository.create.mockReturnValue(mockEnrollment);
            mockEnrollmentRepository.save.mockResolvedValue(mockEnrollment);
            mockNotificationsService.createWorkshopEnrollmentNotification.mockResolvedValue(undefined);

            const result = await service.enroll(workshopId, userId);

            expect(workshopRepository.findOne).toHaveBeenCalledWith({
                where: { id: workshopId },
                relations: ['enrollments'],
            });
            expect(enrollmentRepository.findOne).toHaveBeenCalledWith({
                where: { workshopId, userId },
            });
            expect(enrollmentRepository.create).toHaveBeenCalledWith({
                workshopId,
                userId,
            });
            expect(enrollmentRepository.save).toHaveBeenCalledWith(mockEnrollment);
            expect(notificationsService.createWorkshopEnrollmentNotification).toHaveBeenCalledWith(
                userId,
                mockWorkshop.title,
                workshopId,
            );
            expect(result).toEqual(mockEnrollment);
        });

        it('should throw NotFoundException when workshop does not exist', async () => {
            const workshopId = 'workshop-1';
            const userId = 'user-1';

            mockWorkshopRepository.findOne.mockResolvedValue(null);

            await expect(service.enroll(workshopId, userId)).rejects.toThrow(
                new NotFoundException('Workshop not found'),
            );
        });

        it('should throw ConflictException when user is already enrolled', async () => {
            const workshopId = 'workshop-1';
            const userId = 'user-1';

            mockWorkshopRepository.findOne.mockResolvedValue(mockWorkshop);
            mockEnrollmentRepository.findOne.mockResolvedValue(mockEnrollment);

            await expect(service.enroll(workshopId, userId)).rejects.toThrow(
                new ConflictException('User is already enrolled in this workshop'),
            );
        });

        it('should throw BadRequestException when instructor tries to enroll in own workshop', async () => {
            const workshopId = 'workshop-1';
            const userId = 'instructor-1'; // Same as workshop owner

            mockWorkshopRepository.findOne.mockResolvedValue(mockWorkshop);
            mockEnrollmentRepository.findOne.mockResolvedValue(null);

            await expect(service.enroll(workshopId, userId)).rejects.toThrow(
                new BadRequestException('Instructors cannot enroll in their own workshops'),
            );
        });

        it('should throw ConflictException when workshop is full', async () => {
            const workshopId = 'workshop-1';
            const userId = 'user-1';
            const fullWorkshop = {
                ...mockWorkshop,
                maxParticipants: 1,
                enrollments: [mockEnrollment], // Already at capacity
            };

            mockWorkshopRepository.findOne.mockResolvedValue(fullWorkshop);
            mockEnrollmentRepository.findOne.mockResolvedValue(null);

            await expect(service.enroll(workshopId, userId)).rejects.toThrow(
                new ConflictException('Workshop is full'),
            );
        });

        it('should throw BadRequestException when trying to enroll in past workshop', async () => {
            const workshopId = 'workshop-1';
            const userId = 'user-1';
            const pastWorkshop = {
                ...mockWorkshop,
                startsAt: new Date(Date.now() - 86400000), // Yesterday
            };

            mockWorkshopRepository.findOne.mockResolvedValue(pastWorkshop);
            mockEnrollmentRepository.findOne.mockResolvedValue(null);

            await expect(service.enroll(workshopId, userId)).rejects.toThrow(
                new BadRequestException('Cannot enroll in past workshops'),
            );
        });
    });

    describe('unenroll', () => {
        it('should successfully unenroll user from workshop', async () => {
            const workshopId = 'workshop-1';
            const userId = 'user-1';

            mockEnrollmentRepository.findOne.mockResolvedValue(mockEnrollment);
            mockEnrollmentRepository.remove.mockResolvedValue(undefined);

            await service.unenroll(workshopId, userId);

            expect(enrollmentRepository.findOne).toHaveBeenCalledWith({
                where: { workshopId, userId },
                relations: ['workshop'],
            });
            expect(enrollmentRepository.remove).toHaveBeenCalledWith(mockEnrollment);
        });

        it('should throw NotFoundException when enrollment does not exist', async () => {
            const workshopId = 'workshop-1';
            const userId = 'user-1';

            mockEnrollmentRepository.findOne.mockResolvedValue(null);

            await expect(service.unenroll(workshopId, userId)).rejects.toThrow(
                new NotFoundException('Enrollment not found'),
            );
        });

        it('should throw BadRequestException when trying to unenroll from started workshop', async () => {
            const workshopId = 'workshop-1';
            const userId = 'user-1';
            const startedWorkshop = {
                ...mockWorkshop,
                startsAt: new Date(Date.now() - 3600000), // Started 1 hour ago
            };
            const enrollmentWithStartedWorkshop = {
                ...mockEnrollment,
                workshop: startedWorkshop,
            };

            mockEnrollmentRepository.findOne.mockResolvedValue(enrollmentWithStartedWorkshop);

            await expect(service.unenroll(workshopId, userId)).rejects.toThrow(
                new BadRequestException('Cannot unenroll from workshops that have already started'),
            );
        });
    });

    describe('findUserEnrollments', () => {
        it('should return user enrollments', async () => {
            const userId = 'user-1';
            const enrollments = [mockEnrollment];

            mockEnrollmentRepository.find.mockResolvedValue(enrollments);

            const result = await service.findUserEnrollments(userId);

            expect(enrollmentRepository.find).toHaveBeenCalledWith({
                where: { userId },
                relations: ['workshop', 'workshop.owner'],
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual(enrollments);
        });
    });

    describe('findWorkshopEnrollments', () => {
        it('should return workshop enrollments', async () => {
            const workshopId = 'workshop-1';
            const enrollments = [mockEnrollment];

            mockEnrollmentRepository.find.mockResolvedValue(enrollments);

            const result = await service.findWorkshopEnrollments(workshopId);

            expect(enrollmentRepository.find).toHaveBeenCalledWith({
                where: { workshopId },
                relations: ['user'],
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual(enrollments);
        });
    });

    describe('isUserEnrolled', () => {
        it('should return true when user is enrolled', async () => {
            const workshopId = 'workshop-1';
            const userId = 'user-1';

            mockEnrollmentRepository.findOne.mockResolvedValue(mockEnrollment);

            const result = await service.isUserEnrolled(workshopId, userId);

            expect(enrollmentRepository.findOne).toHaveBeenCalledWith({
                where: { workshopId, userId },
            });
            expect(result).toBe(true);
        });

        it('should return false when user is not enrolled', async () => {
            const workshopId = 'workshop-1';
            const userId = 'user-1';

            mockEnrollmentRepository.findOne.mockResolvedValue(null);

            const result = await service.isUserEnrolled(workshopId, userId);

            expect(result).toBe(false);
        });
    });

    describe('getEnrollmentStats', () => {
        it('should return enrollment statistics', async () => {
            const workshopId = 'workshop-1';
            const workshopWithEnrollments = {
                ...mockWorkshop,
                enrollments: [mockEnrollment, { ...mockEnrollment, id: 'enrollment-2' }],
            };

            mockWorkshopRepository.findOne.mockResolvedValue(workshopWithEnrollments);

            const result = await service.getEnrollmentStats(workshopId);

            expect(workshopRepository.findOne).toHaveBeenCalledWith({
                where: { id: workshopId },
                relations: ['enrollments'],
            });
            expect(result).toEqual({
                totalEnrollments: 2,
                availableSpots: 18,
                isFull: false,
            });
        });

        it('should handle workshop without max participants', async () => {
            const workshopId = 'workshop-1';
            const workshopWithoutLimit = {
                ...mockWorkshop,
                maxParticipants: null,
                enrollments: [mockEnrollment],
            };

            mockWorkshopRepository.findOne.mockResolvedValue(workshopWithoutLimit);

            const result = await service.getEnrollmentStats(workshopId);

            expect(result).toEqual({
                totalEnrollments: 1,
                availableSpots: Infinity,
                isFull: false,
            });
        });

        it('should throw NotFoundException when workshop does not exist', async () => {
            const workshopId = 'workshop-1';

            mockWorkshopRepository.findOne.mockResolvedValue(null);

            await expect(service.getEnrollmentStats(workshopId)).rejects.toThrow(
                new NotFoundException('Workshop not found'),
            );
        });
    });

    describe('additional edge cases', () => {
        it('should handle workshop with zero max participants', async () => {
            const workshop = {
                ...mockWorkshop,
                maxParticipants: 0,
            };
            const enrollments = [];

            mockWorkshopRepository.findOne.mockResolvedValue(workshop);
            mockEnrollmentRepository.find.mockResolvedValue(enrollments);

            const result = await service.getEnrollmentStats('workshop-1');

            expect(result).toEqual({
                totalEnrollments: 0,
                availableSpots: Infinity,
                isFull: false,
            });
        });

        it('should handle workshop with null max participants', async () => {
            const workshop = {
                ...mockWorkshop,
                maxParticipants: null,
            };
            const enrollments = [];

            mockWorkshopRepository.findOne.mockResolvedValue(workshop);
            mockEnrollmentRepository.find.mockResolvedValue(enrollments);

            const result = await service.getEnrollmentStats('workshop-1');

            expect(result).toEqual({
                totalEnrollments: 0,
                availableSpots: Infinity,
                isFull: false,
            });
        });

        it('should handle enrollment in workshop that starts exactly now', async () => {
            const pastDate = new Date(Date.now() - 1000); // 1 second ago
            const workshop = {
                ...mockWorkshop,
                startsAt: pastDate,
            };

            mockWorkshopRepository.findOne.mockResolvedValue(workshop);

            await expect(service.enroll('user-1', 'workshop-1')).rejects.toThrow(BadRequestException);
        });

        it('should handle unenroll from workshop that starts in 1 minute', async () => {
            const pastDate = new Date(Date.now() - 1000); // 1 second ago
            const workshop = {
                ...mockWorkshop,
                startsAt: pastDate,
            };
            const enrollment = { ...mockEnrollment, workshop };

            mockEnrollmentRepository.findOne.mockResolvedValue(enrollment);

            await expect(service.unenroll('user-1', 'workshop-1')).rejects.toThrow(BadRequestException);
        });
    });
});
