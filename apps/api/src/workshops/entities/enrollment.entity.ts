// apps/api/src/workshops/entities/enrollment.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Workshop } from './workshop.entity';

@Entity('enrollments')
export class Enrollment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @Column({ type: 'uuid', name: 'workshop_id' })
    workshopId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.enrollments)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Workshop, (workshop) => workshop.enrollments)
    @JoinColumn({ name: 'workshop_id' })
    workshop: Workshop;
}
