// apps/api/src/notifications/entities/notification.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
    WORKSHOP_ENROLLMENT = 'WORKSHOP_ENROLLMENT',
    WORKSHOP_REMINDER = 'WORKSHOP_REMINDER',
    WORKSHOP_CANCELLED = 'WORKSHOP_CANCELLED',
    WORKSHOP_UPDATED = 'WORKSHOP_UPDATED',
    NEW_WORKSHOP_CREATED = 'NEW_WORKSHOP_CREATED',
    ENROLLMENT_CONFIRMED = 'ENROLLMENT_CONFIRMED',
    PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
    CERTIFICATE_READY = 'CERTIFICATE_READY',
    SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}

export enum NotificationStatus {
    UNREAD = 'UNREAD',
    READ = 'READ',
    ARCHIVED = 'ARCHIVED',
}

export enum NotificationPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    message: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.SYSTEM_ANNOUNCEMENT,
    })
    type: NotificationType;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.UNREAD,
    })
    status: NotificationStatus;

    @Column({
        type: 'enum',
        enum: NotificationPriority,
        default: NotificationPriority.MEDIUM,
    })
    priority: NotificationPriority;

    @Column('jsonb', { nullable: true })
    metadata: Record<string, any>;

    @Column({ nullable: true })
    actionUrl: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ type: 'timestamp', nullable: true })
    scheduledFor: Date;

    @Column({ type: 'timestamp', nullable: true })
    readAt: Date;

    @Column({ default: false })
    emailSent: boolean;

    @Column({ default: false })
    pushSent: boolean;

    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
