// apps/api/src/payments/payments.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../workshops/entities/enrollment.entity';
import { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Workshop)
        private readonly workshopRepository: Repository<Workshop>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Enrollment)
        private readonly enrollmentRepository: Repository<Enrollment>,
    ) { }

    async createPayment(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
        const { workshopId, amount, method, description } = createPaymentDto;

        // Verify workshop exists and is not full
        const workshop = await this.workshopRepository.findOne({
            where: { id: workshopId },
            relations: ['enrollments']
        });

        if (!workshop) {
            throw new NotFoundException('Workshop not found');
        }

        // Check if workshop has available spots
        if (workshop.maxParticipants && workshop.enrollments.length >= workshop.maxParticipants) {
            throw new BadRequestException('Workshop is full');
        }

        // Check if user is already enrolled
        const existingEnrollment = await this.enrollmentRepository.findOne({
            where: { workshop: { id: workshopId }, user: { id: userId } }
        });

        if (existingEnrollment) {
            throw new BadRequestException('You are already enrolled in this workshop');
        }

        // Validate amount matches workshop price
        if (amount !== workshop.price) {
            throw new BadRequestException('Payment amount does not match workshop price');
        }

        // Create payment record
        const payment = this.paymentRepository.create({
            userId,
            workshopId,
            amount,
            method,
            description: description || `Payment for workshop: ${workshop.title}`,
            status: PaymentStatus.PENDING,
            paymentIntentId: this.generateMockPaymentIntentId(),
            metadata: {
                workshopTitle: workshop.title,
                workshopStartDate: workshop.startsAt,
            }
        });

        return await this.paymentRepository.save(payment);
    }

    async processPayment(processPaymentDto: ProcessPaymentDto, userId: string): Promise<Payment> {
        const { paymentId, paymentMethodDetails } = processPaymentDto;

        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId, userId },
            relations: ['workshop', 'user']
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        if (payment.status !== PaymentStatus.PENDING) {
            throw new BadRequestException('Payment cannot be processed in current status');
        }

        // Mock payment processing
        const success = await this.mockPaymentProcessor(payment, paymentMethodDetails);

        if (success) {
            payment.status = PaymentStatus.COMPLETED;
            payment.paidAt = new Date();
            payment.transactionId = this.generateMockTransactionId();

            // Create enrollment after successful payment
            await this.createEnrollmentAfterPayment(payment);
        } else {
            payment.status = PaymentStatus.FAILED;
            payment.failureReason = 'Mock payment processing failed';
        }

        return await this.paymentRepository.save(payment);
    }

    async refundPayment(refundPaymentDto: RefundPaymentDto, userId: string): Promise<Payment> {
        const { paymentId, reason } = refundPaymentDto;

        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId },
            relations: ['workshop', 'user']
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        // Check permissions (only user who made payment or admin can refund)
        if (payment.userId !== userId) {
            throw new ForbiddenException('You can only refund your own payments');
        }

        if (payment.status !== PaymentStatus.COMPLETED) {
            throw new BadRequestException('Only completed payments can be refunded');
        }

        // Check if workshop hasn't started yet (24 hours before start)
        const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        if (payment.workshop.startsAt < twentyFourHoursFromNow) {
            throw new BadRequestException('Cannot refund payment - workshop starts within 24 hours');
        }

        // Process refund
        payment.status = PaymentStatus.REFUNDED;
        payment.refundedAt = new Date();
        payment.failureReason = reason || 'Refund requested by user';

        // Remove enrollment
        const enrollment = await this.enrollmentRepository.findOne({
            where: { workshop: { id: payment.workshopId }, user: { id: userId } }
        });

        if (enrollment) {
            await this.enrollmentRepository.remove(enrollment);
        }

        return await this.paymentRepository.save(payment);
    }

    async getUserPayments(userId: string, page: number = 1, limit: number = 10) {
        const [payments, total] = await this.paymentRepository.findAndCount({
            where: { userId },
            relations: ['workshop'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data: payments,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getPaymentById(paymentId: string, userId: string): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId, userId },
            relations: ['workshop', 'user']
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }

    async getPaymentStats(userId: string) {
        const stats = await this.paymentRepository
            .createQueryBuilder('payment')
            .select([
                'COUNT(*) as totalPayments',
                'SUM(CASE WHEN status = :completed THEN amount ELSE 0 END) as totalSpent',
                'SUM(CASE WHEN status = :refunded THEN amount ELSE 0 END) as totalRefunded',
                'COUNT(CASE WHEN status = :completed THEN 1 END) as completedPayments',
                'COUNT(CASE WHEN status = :failed THEN 1 END) as failedPayments',
            ])
            .where('payment.userId = :userId', { userId })
            .setParameters({
                completed: PaymentStatus.COMPLETED,
                refunded: PaymentStatus.REFUNDED,
                failed: PaymentStatus.FAILED,
            })
            .getRawOne();

        return {
            totalPayments: parseInt(stats.totalpayments) || 0,
            totalSpent: parseFloat(stats.totalspent) || 0,
            totalRefunded: parseFloat(stats.totalrefunded) || 0,
            completedPayments: parseInt(stats.completedpayments) || 0,
            failedPayments: parseInt(stats.failedpayments) || 0,
        };
    }

    // Private helper methods
    private async createEnrollmentAfterPayment(payment: Payment): Promise<void> {
        // Create enrollment after successful payment
        const enrollment = this.enrollmentRepository.create({
            userId: payment.userId,
            workshopId: payment.workshopId,
        });

        await this.enrollmentRepository.save(enrollment);
    }

    private async mockPaymentProcessor(payment: Payment, paymentMethodDetails?: string): Promise<boolean> {
        // Mock payment processing - simulate different scenarios
        const random = Math.random();

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // 85% success rate for mock payments
        if (random > 0.85) {
            return false; // Payment failed
        }

        // Additional validation based on payment method
        switch (payment.method) {
            case PaymentMethod.PIX:
                // PIX payments are usually instant
                return true;
            case PaymentMethod.CREDIT_CARD:
                // Mock credit card validation
                return paymentMethodDetails?.length >= 16; // Basic validation
            case PaymentMethod.DEBIT_CARD:
                return paymentMethodDetails?.length >= 16;
            case PaymentMethod.BANK_TRANSFER:
                // Bank transfers might take longer
                return true;
            default:
                return true;
        }
    }

    private generateMockPaymentIntentId(): string {
        return `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateMockTransactionId(): string {
        return `txn_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
