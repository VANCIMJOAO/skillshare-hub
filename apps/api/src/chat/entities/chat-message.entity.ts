// apps/api/src/chat/entities/chat-message.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Workshop } from '../../workshops/entities/workshop.entity';

@Entity('chat_message')
export class ChatMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    message: string;

    @Column({ type: 'enum', enum: ['text', 'image', 'file'], default: 'text' })
    type: string;

    @Column({ nullable: true })
    attachmentUrl?: string;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Workshop, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workshopId' })
    workshop: Workshop;

    @Column()
    workshopId: string;

    @Column({ default: false })
    isEdited: boolean;

    @Column({ nullable: true })
    editedAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ default: false })
    isDeleted: boolean;
}
