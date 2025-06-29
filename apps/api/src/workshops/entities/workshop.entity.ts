// apps/api/src/workshops/entities/workshop.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Enrollment } from './enrollment.entity';

export enum WorkshopMode {
    ONLINE = 'ONLINE',
    PRESENTIAL = 'PRESENTIAL',
}

@Entity('workshops')
export class Workshop {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({
        type: 'enum',
        enum: WorkshopMode,
        default: WorkshopMode.ONLINE,
    })
    mode: WorkshopMode;

    @Column({ type: 'varchar', length: 500, nullable: true })
    imageUrl?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    location: string;

    @Column({ type: 'timestamp', name: 'starts_at' })
    startsAt: Date;

    @Column({ type: 'timestamp', name: 'ends_at' })
    endsAt: Date;

    @Column({ type: 'int', name: 'max_participants', nullable: true })
    maxParticipants: number;

    @Column({ type: 'uuid', name: 'owner_id' })
    ownerId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.workshops)
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @OneToMany(() => Enrollment, (enrollment) => enrollment.workshop)
    enrollments: Enrollment[];
}
