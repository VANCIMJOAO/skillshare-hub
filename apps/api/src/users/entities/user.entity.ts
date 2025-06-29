// apps/api/src/users/entities/user.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { Workshop } from '../../workshops/entities/workshop.entity';
import { Enrollment } from '../../workshops/entities/enrollment.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { NotificationPreferences } from '../../notifications/entities/notification-preferences.entity';

export enum UserRole {
    STUDENT = 'STUDENT',
    INSTRUCTOR = 'INSTRUCTOR',
    ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255, name: 'password_hash' })
    passwordHash: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.STUDENT,
    })
    role: UserRole;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Workshop, (workshop) => workshop.owner)
    workshops: Workshop[];

    @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
    enrollments: Enrollment[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];

    @OneToOne(() => NotificationPreferences, (preferences) => preferences.user)
    notificationPreferences: NotificationPreferences;
}
