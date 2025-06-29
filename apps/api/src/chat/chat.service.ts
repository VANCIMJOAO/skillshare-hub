// apps/api/src/chat/chat.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../workshops/entities/enrollment.entity';
import { CreateMessageDto, EditMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatMessage)
        private readonly chatMessageRepository: Repository<ChatMessage>,
        @InjectRepository(Workshop)
        private readonly workshopRepository: Repository<Workshop>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Enrollment)
        private readonly enrollmentRepository: Repository<Enrollment>,
    ) { }

    async createMessage(createMessageDto: CreateMessageDto, userId: string): Promise<ChatMessage> {
        const { workshopId, message, type, attachmentUrl } = createMessageDto;

        // Verify workshop exists
        const workshop = await this.workshopRepository.findOne({
            where: { id: workshopId },
            relations: ['owner']
        });

        if (!workshop) {
            throw new NotFoundException('Workshop not found');
        }

        // Check if user is enrolled or is the workshop owner
        const isOwner = workshop.owner.id === userId;
        let isEnrolled = false;

        if (!isOwner) {
            const enrollment = await this.enrollmentRepository.findOne({
                where: { workshop: { id: workshopId }, user: { id: userId } }
            });
            isEnrolled = !!enrollment;
        }

        if (!isOwner && !isEnrolled) {
            throw new ForbiddenException('You must be enrolled in this workshop to send messages');
        }

        // Validate attachment for non-text messages
        if (type !== 'text' && !attachmentUrl) {
            throw new BadRequestException('Attachment URL is required for non-text messages');
        }

        const chatMessage = this.chatMessageRepository.create({
            message,
            type,
            attachmentUrl,
            userId,
            workshopId,
        });

        const savedMessage = await this.chatMessageRepository.save(chatMessage);

        // Return with user relation loaded
        const messageWithUser = await this.chatMessageRepository.findOne({
            where: { id: savedMessage.id },
            relations: ['user']
        });

        if (!messageWithUser) {
            throw new Error('Failed to retrieve saved message');
        }

        return messageWithUser;
    }

    async getWorkshopMessages(
        workshopId: string,
        userId: string,
        page: number = 1,
        limit: number = 50
    ): Promise<{ messages: ChatMessage[], total: number, hasMore: boolean }> {
        // Verify user has access to workshop
        const workshop = await this.workshopRepository.findOne({
            where: { id: workshopId },
            relations: ['owner']
        });

        if (!workshop) {
            throw new NotFoundException('Workshop not found');
        }

        const isOwner = workshop.owner.id === userId;
        let hasAccess = isOwner;

        if (!isOwner) {
            const enrollment = await this.enrollmentRepository.findOne({
                where: { workshop: { id: workshopId }, user: { id: userId } }
            });
            hasAccess = !!enrollment;
        }

        if (!hasAccess) {
            throw new ForbiddenException('You do not have access to this workshop chat');
        }

        const [messages, total] = await this.chatMessageRepository.findAndCount({
            where: {
                workshopId,
                isDeleted: false
            },
            relations: ['user'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        // Reverse to show oldest first
        messages.reverse();

        return {
            messages,
            total,
            hasMore: page * limit < total
        };
    }

    async editMessage(messageId: string, editMessageDto: EditMessageDto, userId: string): Promise<ChatMessage> {
        const message = await this.chatMessageRepository.findOne({
            where: { id: messageId },
            relations: ['user']
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        if (message.userId !== userId) {
            throw new ForbiddenException('You can only edit your own messages');
        }

        // Check if message is not too old (5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (message.createdAt < fiveMinutesAgo) {
            throw new ForbiddenException('You can only edit messages within 5 minutes of posting');
        }

        message.message = editMessageDto.message;
        message.isEdited = true;
        message.editedAt = new Date();

        return this.chatMessageRepository.save(message);
    }

    async deleteMessage(messageId: string, userId: string): Promise<void> {
        const message = await this.chatMessageRepository.findOne({
            where: { id: messageId },
            relations: ['user', 'workshop', 'workshop.owner']
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        // Users can delete their own messages, workshop owners can delete any message
        const isOwner = message.userId === userId;
        const isWorkshopOwner = message.workshop?.owner?.id === userId;

        if (!isOwner && !isWorkshopOwner) {
            throw new ForbiddenException('You can only delete your own messages or you must be the workshop owner');
        }

        message.isDeleted = true;
        await this.chatMessageRepository.save(message);
    }

    async getActiveChats(userId: string): Promise<{ workshopId: string, workshopTitle: string, lastMessage?: ChatMessage, unreadCount: number }[]> {
        // Get workshops where user is enrolled or is the owner
        const enrollments = await this.enrollmentRepository.find({
            where: { user: { id: userId } },
            relations: ['workshop']
        });

        const ownedWorkshops = await this.workshopRepository.find({
            where: { owner: { id: userId } }
        });

        const allWorkshops = [
            ...enrollments.map(e => e.workshop),
            ...ownedWorkshops
        ];

        // Remove duplicates
        const uniqueWorkshops = allWorkshops.filter((workshop, index, self) =>
            index === self.findIndex(w => w.id === workshop.id)
        );

        const chats = await Promise.all(
            uniqueWorkshops.map(async (workshop) => {
                const lastMessage = await this.chatMessageRepository.findOne({
                    where: { workshopId: workshop.id, isDeleted: false },
                    relations: ['user'],
                    order: { createdAt: 'DESC' }
                });

                // Simple unread count (messages from last hour)
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                const unreadCount = await this.chatMessageRepository.count({
                    where: {
                        workshopId: workshop.id,
                        isDeleted: false,
                        userId: userId, // Not from the current user
                        createdAt: oneHourAgo
                    }
                });

                return {
                    workshopId: workshop.id,
                    workshopTitle: workshop.title,
                    lastMessage,
                    unreadCount
                };
            })
        );

        return chats.filter(chat => chat.lastMessage); // Only return chats with messages
    }

    async getMessageById(messageId: string): Promise<ChatMessage> {
        const message = await this.chatMessageRepository.findOne({
            where: { id: messageId },
            relations: ['user']
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        return message;
    }
}
