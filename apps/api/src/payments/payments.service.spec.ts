// apps/api/src/payments/payments.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../workshops/entities/enrollment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('PaymentsService', () => {
    let service: PaymentsService;
    let paymentRepository: jest.Mocked<Repository<Payment>>;
    let workshopRepository: jest.Mocked<Repository<Workshop>>;
    let userRepository: jest.Mocked<Repository<User>>;
    let enrollmentRepository: jest.Mocked<Repository<Enrollment>>;

    beforeEach(async () => {
        const mockPaymentRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            createQueryBuilder: jest.fn(),
        };

        const mockWorkshopRepository = {
            findOne: jest.fn(),
        };

        const mockUserRepository = {
            findOne: jest.fn(),
        };

        const mockEnrollmentRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                {
                    provide: getRepositoryToken(Payment),
                    useValue: mockPaymentRepository,
                },
                {
                    provide: getRepositoryToken(Workshop),
                    useValue: mockWorkshopRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: getRepositoryToken(Enrollment),
                    useValue: mockEnrollmentRepository,
                },
            ],
        }).compile();

        service = module.get<PaymentsService>(PaymentsService);
        paymentRepository = module.get(getRepositoryToken(Payment));
        workshopRepository = module.get(getRepositoryToken(Workshop));
        userRepository = module.get(getRepositoryToken(User));
        enrollmentRepository = module.get(getRepositoryToken(Enrollment));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createPayment', () => {
        const mockUserId = 'user-123';
        const mockWorkshopId = 'workshop-456';
        const createPaymentDto: CreatePaymentDto = {
            workshopId: mockWorkshopId,
            amount: 100,
            method: PaymentMethod.CREDIT_CARD,
            description: 'Test payment',
        };

        const mockWorkshop = {
            id: mockWorkshopId,
            title: 'Test Workshop',
            price: 100,
            maxParticipants: 10,
            enrollments: [],
        };

        it('should create payment successfully', async () => {
            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue(null);

            const mockPayment = {
                id: 'payment-789',
                ...createPaymentDto,
                userId: mockUserId,
                status: PaymentStatus.PENDING,
            };

            paymentRepository.create.mockReturnValue(mockPayment as any);
            paymentRepository.save.mockResolvedValue(mockPayment as any);

            const result = await service.createPayment(createPaymentDto, mockUserId);

            expect(workshopRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockWorkshopId },
                relations: ['enrollments']
            });
            expect(enrollmentRepository.findOne).toHaveBeenCalledWith({
                where: { workshop: { id: mockWorkshopId }, user: { id: mockUserId } }
            });
            expect(paymentRepository.create).toHaveBeenCalled();
            expect(paymentRepository.save).toHaveBeenCalled();
            expect(result).toEqual(mockPayment);
        });

        it('should throw NotFoundException when workshop does not exist', async () => {
            workshopRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createPayment(createPaymentDto, mockUserId)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when workshop is full', async () => {
            const fullWorkshop = {
                ...mockWorkshop,
                maxParticipants: 1,
                enrollments: [{ id: 'enrollment-1' }],
            };
            workshopRepository.findOne.mockResolvedValue(fullWorkshop as any);

            await expect(
                service.createPayment(createPaymentDto, mockUserId)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when user is already enrolled', async () => {
            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue({ id: 'existing-enrollment' } as any);

            await expect(
                service.createPayment(createPaymentDto, mockUserId)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when amount does not match workshop price', async () => {
            const invalidPaymentDto = { ...createPaymentDto, amount: 150 };
            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createPayment(invalidPaymentDto, mockUserId)
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('getPaymentById', () => {
        const mockUserId = 'user-123';
        const mockPaymentId = 'payment-456';

        it('should return payment when found', async () => {
            const mockPayment = {
                id: mockPaymentId,
                userId: mockUserId,
                amount: 100,
                status: PaymentStatus.COMPLETED,
            };

            paymentRepository.findOne.mockResolvedValue(mockPayment as any);

            const result = await service.getPaymentById(mockPaymentId, mockUserId);

            expect(paymentRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockPaymentId, userId: mockUserId },
                relations: ['workshop', 'user']
            });
            expect(result).toEqual(mockPayment);
        });

        it('should throw NotFoundException when payment not found', async () => {
            paymentRepository.findOne.mockResolvedValue(null);

            await expect(
                service.getPaymentById(mockPaymentId, mockUserId)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getUserPayments', () => {
        const mockUserId = 'user-123';

        it('should return paginated payments', async () => {
            const mockPayments = [
                { id: 'payment-1', amount: 100 },
                { id: 'payment-2', amount: 200 },
            ];
            const total = 10;

            paymentRepository.findAndCount.mockResolvedValue([mockPayments as any, total]);

            const result = await service.getUserPayments(mockUserId, 1, 5);

            expect(paymentRepository.findAndCount).toHaveBeenCalledWith({
                where: { userId: mockUserId },
                relations: ['workshop'],
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 5,
            });

            expect(result).toEqual({
                data: mockPayments,
                meta: {
                    page: 1,
                    limit: 5,
                    total: 10,
                    totalPages: 2,
                },
            });
        });
    });

    describe('getPaymentStats', () => {
        const mockUserId = 'user-123';

        it('should return payment statistics', async () => {
            const mockStats = {
                totalpayments: '5',
                totalspent: '500.00',
                totalrefunded: '100.00',
                completedpayments: '4',
                failedpayments: '1',
            };

            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                setParameters: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockResolvedValue(mockStats),
            };

            paymentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

            const result = await service.getPaymentStats(mockUserId);

            expect(result).toEqual({
                totalPayments: 5,
                totalSpent: 500,
                totalRefunded: 100,
                completedPayments: 4,
                failedPayments: 1,
            });
        });

        it('should handle null values in stats', async () => {
            const mockStats = {
                totalpayments: null,
                totalspent: null,
                totalrefunded: null,
                completedpayments: null,
                failedpayments: null,
            };

            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                setParameters: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockResolvedValue(mockStats),
            };

            paymentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

            const result = await service.getPaymentStats(mockUserId);

            expect(result).toEqual({
                totalPayments: 0,
                totalSpent: 0,
                totalRefunded: 0,
                completedPayments: 0,
                failedPayments: 0,
            });
        });
    });
});
