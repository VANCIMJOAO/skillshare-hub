// apps/api/src/notifications/entities/notification-preferences.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notification_preferences')
export class NotificationPreferences {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.notificationPreferences)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    // Email notifications
    @Column({ default: true })
    emailEnabled: boolean;

    @Column({ default: true })
    emailWorkshopReminders: boolean;

    @Column({ default: true })
    emailEnrollmentConfirmations: boolean;

    @Column({ default: true })
    emailWorkshopUpdates: boolean;

    @Column({ default: true })
    emailNewWorkshops: boolean;

    @Column({ default: false })
    emailMarketingUpdates: boolean;

    // Push notifications
    @Column({ default: true })
    pushEnabled: boolean;

    @Column({ default: true })
    pushWorkshopReminders: boolean;

    @Column({ default: true })
    pushEnrollmentConfirmations: boolean;

    @Column({ default: true })
    pushWorkshopUpdates: boolean;

    @Column({ default: false })
    pushNewWorkshops: boolean;

    // In-app notifications
    @Column({ default: true })
    inAppEnabled: boolean;

    @Column({ default: true })
    inAppWorkshopReminders: boolean;

    @Column({ default: true })
    inAppEnrollmentConfirmations: boolean;

    @Column({ default: true })
    inAppWorkshopUpdates: boolean;

    @Column({ default: true })
    inAppNewWorkshops: boolean;

    @Column({ default: true })
    inAppSystemAnnouncements: boolean;

    // Frequency settings
    @Column({ default: 'immediate' }) // immediate, hourly, daily, weekly
    reminderFrequency: string;

    @Column({ default: 24 }) // hours before workshop
    reminderHoursBefore: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
