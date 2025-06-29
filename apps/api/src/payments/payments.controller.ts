// apps/api/src/payments/payments.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Payment } from './entities/payment.entity';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new payment for workshop enrollment' })
    @ApiResponse({ status: 201, description: 'Payment created successfully', type: Payment })
    @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
    @ApiResponse({ status: 404, description: 'Workshop not found' })
    async createPayment(
        @Body() createPaymentDto: CreatePaymentDto,
        @Request() req: any,
    ): Promise<Payment> {
        return await this.paymentsService.createPayment(createPaymentDto, req.user.id);
    }

    @Post(':id/process')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Process a pending payment' })
    @ApiResponse({ status: 200, description: 'Payment processed successfully', type: Payment })
    @ApiResponse({ status: 400, description: 'Payment cannot be processed' })
    @ApiResponse({ status: 404, description: 'Payment not found' })
    async processPayment(
        @Param('id') paymentId: string,
        @Body() processPaymentDto: ProcessPaymentDto,
        @Request() req: any,
    ): Promise<Payment> {
        return await this.paymentsService.processPayment(
            { ...processPaymentDto, paymentId },
            req.user.id
        );
    }

    @Post(':id/refund')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refund a completed payment' })
    @ApiResponse({ status: 200, description: 'Payment refunded successfully', type: Payment })
    @ApiResponse({ status: 400, description: 'Payment cannot be refunded' })
    @ApiResponse({ status: 403, description: 'Not authorized to refund this payment' })
    @ApiResponse({ status: 404, description: 'Payment not found' })
    async refundPayment(
        @Param('id') paymentId: string,
        @Body() refundPaymentDto: RefundPaymentDto,
        @Request() req: any,
    ): Promise<Payment> {
        return await this.paymentsService.refundPayment(
            { ...refundPaymentDto, paymentId },
            req.user.id
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get current user payments with pagination' })
    @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
    async getUserPayments(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Request() req: any,
    ) {
        return await this.paymentsService.getUserPayments(req.user.id, page, limit);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get current user payment statistics' })
    @ApiResponse({ status: 200, description: 'Payment stats retrieved successfully' })
    async getPaymentStats(@Request() req: any) {
        return await this.paymentsService.getPaymentStats(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get payment by ID' })
    @ApiResponse({ status: 200, description: 'Payment retrieved successfully', type: Payment })
    @ApiResponse({ status: 404, description: 'Payment not found' })
    async getPaymentById(
        @Param('id') paymentId: string,
        @Request() req: any,
    ): Promise<Payment> {
        return await this.paymentsService.getPaymentById(paymentId, req.user.id);
    }

    // Mock endpoints for payment methods information
    @Get('methods/available')
    @ApiOperation({ summary: 'Get available payment methods' })
    @ApiResponse({ status: 200, description: 'Available payment methods' })
    async getAvailablePaymentMethods() {
        return {
            methods: [
                {
                    id: 'credit_card',
                    name: 'Credit Card',
                    description: 'Pay with Visa, Mastercard, or American Express',
                    fees: '2.9% + $0.30',
                    processingTime: 'Instant',
                    icon: 'credit-card'
                },
                {
                    id: 'debit_card',
                    name: 'Debit Card',
                    description: 'Pay directly from your bank account',
                    fees: '1.5% + $0.25',
                    processingTime: 'Instant',
                    icon: 'credit-card'
                },
                {
                    id: 'pix',
                    name: 'PIX',
                    description: 'Instant payment via PIX (Brazil)',
                    fees: 'Free',
                    processingTime: 'Instant',
                    icon: 'pix'
                },
                {
                    id: 'bank_transfer',
                    name: 'Bank Transfer',
                    description: 'Transfer directly from your bank',
                    fees: '$1.00',
                    processingTime: '1-3 business days',
                    icon: 'bank'
                },
                {
                    id: 'paypal',
                    name: 'PayPal',
                    description: 'Pay with your PayPal account',
                    fees: '3.4% + $0.30',
                    processingTime: 'Instant',
                    icon: 'paypal'
                }
            ]
        };
    }

    @Get('methods/:method/simulate')
    @ApiOperation({ summary: 'Simulate payment method for testing' })
    @ApiResponse({ status: 200, description: 'Payment simulation result' })
    async simulatePaymentMethod(
        @Param('method') method: string,
        @Query('amount') amount: number,
    ) {
        // Mock simulation for different payment methods
        const simulationResults = {
            credit_card: {
                success: Math.random() > 0.1, // 90% success rate
                processingTime: Math.floor(Math.random() * 3000) + 1000, // 1-4 seconds
                fees: amount * 0.029 + 0.30,
            },
            debit_card: {
                success: Math.random() > 0.05, // 95% success rate
                processingTime: Math.floor(Math.random() * 2000) + 500, // 0.5-2.5 seconds
                fees: amount * 0.015 + 0.25,
            },
            pix: {
                success: Math.random() > 0.02, // 98% success rate
                processingTime: Math.floor(Math.random() * 1000) + 200, // 0.2-1.2 seconds
                fees: 0,
            },
            bank_transfer: {
                success: Math.random() > 0.03, // 97% success rate
                processingTime: 24 * 60 * 60 * 1000, // 24 hours (simulated)
                fees: 1.00,
            },
            paypal: {
                success: Math.random() > 0.08, // 92% success rate
                processingTime: Math.floor(Math.random() * 2000) + 800, // 0.8-2.8 seconds
                fees: amount * 0.034 + 0.30,
            },
        };

        return simulationResults[method] || {
            success: false,
            error: 'Payment method not supported',
        };
    }
}
