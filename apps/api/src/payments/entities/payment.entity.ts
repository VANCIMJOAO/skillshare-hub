// apps/api/src/payments/entities/payment.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Workshop } from '../../workshops/entities/workshop.entity';

export enum PaymentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    CANCELLED = 'cancelled',
}

export enum PaymentMethod {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    PIX = 'pix',
    BANK_TRANSFER = 'bank_transfer',
    PAYPAL = 'paypal',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
    })
    method: PaymentMethod;

    @Column({ length: 255, nullable: true })
    paymentIntentId: string; // For Stripe integration (mock)

    @Column({ length: 255, nullable: true })
    transactionId: string; // External payment system transaction ID

    @Column('text', { nullable: true })
    description: string;

    @Column('jsonb', { nullable: true })
    metadata: Record<string, any>; // Additional payment data

    @Column({ nullable: true })
    failureReason: string;

    @Column({ type: 'timestamp', nullable: true })
    paidAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    refundedAt: Date;

    // Relations
    @Column()
    userId: string;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    workshopId: string;

    @ManyToOne(() => Workshop, { eager: true })
    @JoinColumn({ name: 'workshopId' })
    workshop: Workshop;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
