// apps/api/src/payments/dto/create-payment.dto.ts
import { IsEnum, IsNumber, IsString, IsOptional, IsUUID, Min } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
    @IsUUID()
    workshopId: string;

    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @IsOptional()
    @IsString()
    description?: string;
}

export class ProcessPaymentDto {
    @IsUUID()
    paymentId: string;

    @IsOptional()
    @IsString()
    paymentMethodDetails?: string; // Card details, PIX code, etc. (mock data)
}

export class RefundPaymentDto {
    @IsUUID()
    paymentId: string;

    @IsOptional()
    @IsString()
    reason?: string;
}
