import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, PaymentMethod } from './entities/payment.entity';

describe('PaymentsController', () => {
    let controller: PaymentsController;
    let paymentsService: jest.Mocked<PaymentsService>;

    const mockPaymentsService = {
        createPayment: jest.fn(),
        processPayment: jest.fn(),
        refundPayment: jest.fn(),
        getUserPayments: jest.fn(),
        getPaymentStats: jest.fn(),
        getPaymentById: jest.fn(),
    };

    const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
    };

    const mockRequest = { user: mockUser };

    const mockPayment = {
        id: 'payment-1',
        userId: 'user-1',
        workshopId: 'workshop-1',
        amount: 99.99,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.CREDIT_CARD,
        stripeSessionId: 'session-1',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentsController],
            providers: [
                {
                    provide: PaymentsService,
                    useValue: mockPaymentsService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<PaymentsController>(PaymentsController);
        paymentsService = module.get<PaymentsService>(PaymentsService) as jest.Mocked<PaymentsService>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createPayment', () => {
        it('should create a payment successfully', async () => {
            const createPaymentDto: CreatePaymentDto = {
                workshopId: 'workshop-1',
                method: PaymentMethod.CREDIT_CARD,
                amount: 99.99,
            };

            mockPaymentsService.createPayment.mockResolvedValue(mockPayment);

            const result = await controller.createPayment(createPaymentDto, mockRequest);

            expect(paymentsService.createPayment).toHaveBeenCalledWith(createPaymentDto, mockUser.id);
            expect(result).toBe(mockPayment);
        });
    });

    describe('processPayment', () => {
        it('should process a payment successfully', async () => {
            const paymentId = 'payment-1';
            const processPaymentDto: ProcessPaymentDto = {
                paymentId,
                paymentMethodDetails: 'card-details',
            };
            const processedPayment = { ...mockPayment, status: PaymentStatus.COMPLETED };

            mockPaymentsService.processPayment.mockResolvedValue(processedPayment);

            const result = await controller.processPayment(paymentId, processPaymentDto, mockRequest);

            expect(paymentsService.processPayment).toHaveBeenCalledWith(
                { ...processPaymentDto, paymentId },
                mockUser.id
            );
            expect(result).toBe(processedPayment);
        });
    });

    describe('refundPayment', () => {
        it('should refund payment successfully', async () => {
            const paymentId = 'payment-1';
            const refundPaymentDto: RefundPaymentDto = {
                paymentId,
                reason: 'User requested refund',
            };
            const refundedPayment = { ...mockPayment, status: PaymentStatus.REFUNDED };

            mockPaymentsService.refundPayment.mockResolvedValue(refundedPayment);

            const result = await controller.refundPayment(paymentId, refundPaymentDto, mockRequest);

            expect(paymentsService.refundPayment).toHaveBeenCalledWith(
                { ...refundPaymentDto, paymentId },
                mockUser.id
            );
            expect(result).toBe(refundedPayment);
        });
    });

    describe('getUserPayments', () => {
        it('should get user payments successfully', async () => {
            const mockPaginatedPayments = {
                data: [mockPayment],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
                },
            };

            mockPaymentsService.getUserPayments.mockResolvedValue(mockPaginatedPayments);

            const result = await controller.getUserPayments(1, 10, mockRequest);

            expect(paymentsService.getUserPayments).toHaveBeenCalledWith(mockUser.id, 1, 10);
            expect(result).toBe(mockPaginatedPayments);
        });
    });

    describe('getPaymentStats', () => {
        it('should get payment stats successfully', async () => {
            const mockStats = {
                totalSpent: 199.98,
                totalPayments: 2,
                completedPayments: 1,
                pendingPayments: 1,
            };

            mockPaymentsService.getPaymentStats.mockResolvedValue(mockStats);

            const result = await controller.getPaymentStats(mockRequest);

            expect(paymentsService.getPaymentStats).toHaveBeenCalledWith(mockUser.id);
            expect(result).toBe(mockStats);
        });
    });

    describe('getPaymentById', () => {
        it('should get payment by ID successfully', async () => {
            const paymentId = 'payment-1';

            mockPaymentsService.getPaymentById.mockResolvedValue(mockPayment);

            const result = await controller.getPaymentById(paymentId, mockRequest);

            expect(paymentsService.getPaymentById).toHaveBeenCalledWith(paymentId, mockUser.id);
            expect(result).toBe(mockPayment);
        });
    });

    describe('getAvailablePaymentMethods', () => {
        it('should get available payment methods successfully', async () => {
            const result = await controller.getAvailablePaymentMethods();

            expect(result).toHaveProperty('methods');
            expect(Array.isArray(result.methods)).toBe(true);
            expect(result.methods.length).toBeGreaterThan(0);
        });
    });
});
