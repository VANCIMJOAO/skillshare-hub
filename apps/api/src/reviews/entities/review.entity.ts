// apps/api/src/reviews/entities/review.entity.ts
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

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @Column({ type: 'uuid', name: 'workshop_id' })
    workshopId: string;

    @Column({ type: 'integer' })
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Workshop, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workshop_id' })
    workshop: Workshop;
}
