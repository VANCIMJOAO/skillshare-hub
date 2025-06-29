// apps/api/src/chat/chat.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chat-message.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../workshops/entities/enrollment.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ChatService', () => {
    let service: ChatService;
    let chatMessageRepository: jest.Mocked<Repository<ChatMessage>>;
    let workshopRepository: jest.Mocked<Repository<Workshop>>;
    let userRepository: jest.Mocked<Repository<User>>;
    let enrollmentRepository: jest.Mocked<Repository<Enrollment>>;

    beforeEach(async () => {
        const mockChatMessageRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            createQueryBuilder: jest.fn(),
            count: jest.fn(),
        };

        const mockWorkshopRepository = {
            findOne: jest.fn(),
            find: jest.fn(),
        };

        const mockUserRepository = {
            findOne: jest.fn(),
        };

        const mockEnrollmentRepository = {
            findOne: jest.fn(),
            find: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                {
                    provide: getRepositoryToken(ChatMessage),
                    useValue: mockChatMessageRepository,
                },
                {
                    provide: getRepositoryToken(Workshop),
                    useValue: mockWorkshopRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: getRepositoryToken(Enrollment),
                    useValue: mockEnrollmentRepository,
                },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);
        chatMessageRepository = module.get(getRepositoryToken(ChatMessage));
        workshopRepository = module.get(getRepositoryToken(Workshop));
        userRepository = module.get(getRepositoryToken(User));
        enrollmentRepository = module.get(getRepositoryToken(Enrollment));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createMessage', () => {
        const mockUserId = 'user-123';
        const mockWorkshopId = 'workshop-456';
        const createMessageDto: CreateMessageDto = {
            workshopId: mockWorkshopId,
            message: 'Hello world!',
            type: 'text',
        };

        const mockWorkshop = {
            id: mockWorkshopId,
            title: 'Test Workshop',
            owner: { id: 'owner-123' },
        };

        it('should create message when user is workshop owner', async () => {
            const ownerUserId = 'owner-123';
            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);

            const mockMessage = {
                id: 'message-789',
                ...createMessageDto,
                userId: ownerUserId,
                isDeleted: false,
                createdAt: new Date(),
            };

            chatMessageRepository.create.mockReturnValue(mockMessage as any);
            chatMessageRepository.save.mockResolvedValue(mockMessage as any);
            chatMessageRepository.findOne.mockResolvedValue(mockMessage as any);

            const result = await service.createMessage(createMessageDto, ownerUserId);

            expect(workshopRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockWorkshopId },
                relations: ['owner']
            });
            expect(enrollmentRepository.findOne).not.toHaveBeenCalled();
            expect(chatMessageRepository.create).toHaveBeenCalled();
            expect(chatMessageRepository.save).toHaveBeenCalledWith(mockMessage);
            expect(result).toEqual(mockMessage);
        });

        it('should create message when user is enrolled', async () => {
            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue({ id: 'enrollment-123' } as any);

            const mockMessage = {
                id: 'message-789',
                ...createMessageDto,
                userId: mockUserId,
                isDeleted: false,
                createdAt: new Date(),
            };

            chatMessageRepository.create.mockReturnValue(mockMessage as any);
            chatMessageRepository.save.mockResolvedValue(mockMessage as any);
            chatMessageRepository.findOne.mockResolvedValue(mockMessage as any);

            const result = await service.createMessage(createMessageDto, mockUserId);

            expect(workshopRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockWorkshopId },
                relations: ['owner']
            });
            expect(enrollmentRepository.findOne).toHaveBeenCalledWith({
                where: { workshop: { id: mockWorkshopId }, user: { id: mockUserId } }
            });
            expect(result).toEqual(mockMessage);
        });

        it('should throw NotFoundException when workshop does not exist', async () => {
            workshopRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createMessage(createMessageDto, mockUserId)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user is not enrolled and not owner', async () => {
            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createMessage(createMessageDto, mockUserId)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('getMessageById', () => {
        const mockMessageId = 'message-123';

        it('should return message when found', async () => {
            const mockMessage = {
                id: mockMessageId,
                message: 'Hello!',
                isDeleted: false,
                user: { id: 'user-123', name: 'Test User' },
            };

            chatMessageRepository.findOne.mockResolvedValue(mockMessage as any);

            const result = await service.getMessageById(mockMessageId);

            expect(chatMessageRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockMessageId },
                relations: ['user']
            });
            expect(result).toEqual(mockMessage);
        });

        it('should throw NotFoundException when message not found', async () => {
            chatMessageRepository.findOne.mockResolvedValue(null);

            await expect(
                service.getMessageById(mockMessageId)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getWorkshopMessages', () => {
        const mockWorkshopId = 'workshop-123';
        const mockUserId = 'user-456';

        it('should return messages when user has access', async () => {
            const mockWorkshop = {
                id: mockWorkshopId,
                owner: { id: 'owner-123' },
            };

            const mockMessages = [
                { id: 'msg-1', message: 'Hello' },
                { id: 'msg-2', message: 'World' },
            ];

            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue({ id: 'enrollment-123' } as any);
            chatMessageRepository.findAndCount.mockResolvedValue([mockMessages as any, 2]);

            const result = await service.getWorkshopMessages(mockWorkshopId, mockUserId, 1, 10);

            expect(workshopRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockWorkshopId },
                relations: ['owner']
            });
            expect(result).toEqual({
                messages: mockMessages,
                total: 2,
                hasMore: false,
            });
        });

        it('should throw NotFoundException when workshop does not exist', async () => {
            workshopRepository.findOne.mockResolvedValue(null);

            await expect(
                service.getWorkshopMessages(mockWorkshopId, mockUserId, 1, 10)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user has no access', async () => {
            const mockWorkshop = {
                id: mockWorkshopId,
                owner: { id: 'owner-123' },
            };

            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue(null);

            await expect(
                service.getWorkshopMessages(mockWorkshopId, mockUserId, 1, 10)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('deleteMessage', () => {
        const mockMessageId = 'message-123';
        const mockUserId = 'user-456';

        it('should soft delete message when user is owner', async () => {
            const mockMessage = {
                id: mockMessageId,
                userId: mockUserId,
                message: 'Test message',
                isDeleted: false,
                workshop: {
                    id: 'workshop-123',
                    owner: {
                        id: 'owner-456'
                    }
                }
            };

            chatMessageRepository.findOne.mockResolvedValue(mockMessage as any);
            chatMessageRepository.save.mockResolvedValue({
                ...mockMessage,
                isDeleted: true,
            } as any);

            await service.deleteMessage(mockMessageId, mockUserId);

            expect(chatMessageRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockMessageId },
                relations: ['user', 'workshop', 'workshop.owner']
            });
            expect(chatMessageRepository.save).toHaveBeenCalledWith({
                ...mockMessage,
                isDeleted: true,
            });
        });

        it('should throw NotFoundException when message does not exist', async () => {
            chatMessageRepository.findOne.mockResolvedValue(null);

            await expect(
                service.deleteMessage(mockMessageId, mockUserId)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user is not message owner', async () => {
            const mockMessage = {
                id: mockMessageId,
                userId: 'other-user',
                message: 'Test message',
                isDeleted: false,
                workshop: {
                    id: 'workshop-123',
                    owner: {
                        id: 'owner-456'
                    }
                }
            };

            chatMessageRepository.findOne.mockResolvedValue(mockMessage as any);

            await expect(
                service.deleteMessage(mockMessageId, mockUserId)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('additional service methods', () => {
        const mockWorkshop = {
            id: 'workshop-1',
            title: 'Test Workshop',
            owner: { id: 'owner-123' },
        };

        const mockMessage = {
            id: 'message-123',
            message: 'Test message',
            workshopId: 'workshop-1',
            userId: 'user-1',
            type: 'text',
            createdAt: new Date(),
            isDeleted: false,
            isEdited: false,
            user: { id: 'user-1' },
            workshop: { id: 'workshop-1' },
        } as any;

        it('should handle message with very long content', async () => {
            const longContent = 'a'.repeat(1000);
            const createMessageDto = {
                message: longContent,
                workshopId: 'workshop-1',
                type: 'text',
            };

            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue({ id: 'enrollment-123' } as any);
            chatMessageRepository.create.mockReturnValue(mockMessage as any);
            chatMessageRepository.save.mockResolvedValue(mockMessage as any);
            chatMessageRepository.findOne.mockResolvedValue(mockMessage as any);

            const result = await service.createMessage(createMessageDto, 'user-1');

            expect(result).toEqual(mockMessage);
            expect(chatMessageRepository.create).toHaveBeenCalledWith({
                message: longContent,
                workshopId: 'workshop-1',
                userId: 'user-1',
                type: 'text',
            });
        });

        it('should handle message with attachmentUrl', async () => {
            const createMessageDto = {
                message: 'Check this out!',
                workshopId: 'workshop-1',
                type: 'image',
                attachmentUrl: 'https://example.com/image.jpg',
            };

            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue({ id: 'enrollment-123' } as any);
            
            const savedMessage = {
                ...mockMessage,
                type: 'image',
                attachmentUrl: 'https://example.com/image.jpg',
            };
            
            chatMessageRepository.create.mockReturnValue(savedMessage as any);
            chatMessageRepository.save.mockResolvedValue(savedMessage as any);
            chatMessageRepository.findOne.mockResolvedValue(savedMessage as any);

            const result = await service.createMessage(createMessageDto, 'user-1');

            expect(result.type).toBe('image');
            expect(result.attachmentUrl).toBe('https://example.com/image.jpg');
        });

        it('should handle getWorkshopMessages with empty results', async () => {
            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue({ id: 'enrollment-123' } as any);
            chatMessageRepository.findAndCount.mockResolvedValue([[], 0]);

            const result = await service.getWorkshopMessages('workshop-1', 'user-1', 1, 10);

            expect(result).toEqual({
                messages: [],
                total: 0,
                hasMore: false,
            });
        });

        it('should handle pagination edge cases', async () => {
            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue({ id: 'enrollment-123' } as any);
            chatMessageRepository.findAndCount.mockResolvedValue([[mockMessage], 1]);

            // Test with page 0 (results in negative skip)
            await service.getWorkshopMessages('workshop-1', 'user-1', 0, 20);

            expect(chatMessageRepository.findAndCount).toHaveBeenCalledWith({
                where: { workshopId: 'workshop-1', isDeleted: false },
                relations: ['user'],
                order: { createdAt: 'DESC' },
                skip: -20, // (0 - 1) * 20 = -20
                take: 20,
            });
        });

        it('should handle very large limit in pagination', async () => {
            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue({ id: 'enrollment-123' } as any);
            chatMessageRepository.findAndCount.mockResolvedValue([[mockMessage], 1]);

            const result = await service.getWorkshopMessages('workshop-1', 'user-1', 1, 1000);

            expect(chatMessageRepository.findAndCount).toHaveBeenCalledWith({
                where: { workshopId: 'workshop-1', isDeleted: false },
                relations: ['user'],
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 1000,
            });
            expect(result.hasMore).toBe(false);
        });

        it('should throw BadRequestException for non-text message without attachment', async () => {
            const createMessageDto = {
                message: 'Check this out!',
                workshopId: 'workshop-1',
                type: 'image',
                // Missing attachmentUrl
            };

            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue({ id: 'enrollment-123' } as any);

            await expect(
                service.createMessage(createMessageDto, 'user-1')
            ).rejects.toThrow('Attachment URL is required for non-text messages');
        });

        it('should handle error when retrieving saved message fails', async () => {
            const createMessageDto = {
                message: 'Test message',
                workshopId: 'workshop-1',
                type: 'text',
            };

            workshopRepository.findOne.mockResolvedValue(mockWorkshop as any);
            enrollmentRepository.findOne.mockResolvedValue({ id: 'enrollment-123' } as any);
            chatMessageRepository.create.mockReturnValue(mockMessage as any);
            chatMessageRepository.save.mockResolvedValue(mockMessage as any);
            // First call returns null, second call should not happen
            chatMessageRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createMessage(createMessageDto, 'user-1')
            ).rejects.toThrow('Failed to retrieve saved message');
        });
    });

    describe('editMessage', () => {
        const mockMessageId = 'message-123';
        const mockUserId = 'user-456';
        const editMessageDto = { message: 'Updated message' };

        it('should edit message when user is owner and within time limit', async () => {
            const mockMessage = {
                id: mockMessageId,
                userId: mockUserId,
                message: 'Original message',
                createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
                isEdited: false,
                editedAt: null,
            };

            chatMessageRepository.findOne.mockResolvedValue(mockMessage as any);
            chatMessageRepository.save.mockResolvedValue({
                ...mockMessage,
                message: editMessageDto.message,
                isEdited: true,
                editedAt: expect.any(Date),
            } as any);

            const result = await service.editMessage(mockMessageId, editMessageDto, mockUserId);

            expect(chatMessageRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockMessageId },
                relations: ['user']
            });
            expect(chatMessageRepository.save).toHaveBeenCalledWith({
                ...mockMessage,
                message: editMessageDto.message,
                isEdited: true,
                editedAt: expect.any(Date),
            });
            expect(result.message).toBe(editMessageDto.message);
            expect(result.isEdited).toBe(true);
        });

        it('should throw NotFoundException when message does not exist', async () => {
            chatMessageRepository.findOne.mockResolvedValue(null);

            await expect(
                service.editMessage(mockMessageId, editMessageDto, mockUserId)
            ).rejects.toThrow('Message not found');
        });

        it('should throw ForbiddenException when user is not message owner', async () => {
            const mockMessage = {
                id: mockMessageId,
                userId: 'other-user',
                message: 'Original message',
                createdAt: new Date(Date.now() - 2 * 60 * 1000),
            };

            chatMessageRepository.findOne.mockResolvedValue(mockMessage as any);

            await expect(
                service.editMessage(mockMessageId, editMessageDto, mockUserId)
            ).rejects.toThrow('You can only edit your own messages');
        });

        it('should throw ForbiddenException when message is too old', async () => {
            const mockMessage = {
                id: mockMessageId,
                userId: mockUserId,
                message: 'Original message',
                createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
            };

            chatMessageRepository.findOne.mockResolvedValue(mockMessage as any);

            await expect(
                service.editMessage(mockMessageId, editMessageDto, mockUserId)
            ).rejects.toThrow('You can only edit messages within 5 minutes of posting');
        });
    });

    describe('getActiveChats', () => {
        const mockUserId = 'user-123';

        it('should return active chats for user', async () => {
            const mockEnrollments = [
                {
                    workshop: {
                        id: 'workshop-1',
                        title: 'Workshop 1',
                    }
                },
                {
                    workshop: {
                        id: 'workshop-2',
                        title: 'Workshop 2',
                    }
                }
            ];

            const mockOwnedWorkshops = [
                {
                    id: 'workshop-3',
                    title: 'My Workshop',
                }
            ];

            const mockLastMessage = {
                id: 'message-1',
                message: 'Last message',
                user: { id: 'other-user', name: 'Other User' },
            };

            enrollmentRepository.find.mockResolvedValue(mockEnrollments as any);
            workshopRepository.find.mockResolvedValue(mockOwnedWorkshops as any);
            chatMessageRepository.findOne.mockResolvedValue(mockLastMessage as any);
            chatMessageRepository.count.mockResolvedValue(2);

            const result = await service.getActiveChats(mockUserId);

            expect(enrollmentRepository.find).toHaveBeenCalledWith({
                where: { user: { id: mockUserId } },
                relations: ['workshop']
            });
            expect(workshopRepository.find).toHaveBeenCalledWith({
                where: { owner: { id: mockUserId } }
            });
            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({
                workshopId: 'workshop-1',
                workshopTitle: 'Workshop 1',
                lastMessage: mockLastMessage,
                unreadCount: 2,
            });
        });

        it('should handle duplicate workshops in enrollments and owned', async () => {
            const mockEnrollments = [
                {
                    workshop: {
                        id: 'workshop-1',
                        title: 'Workshop 1',
                    }
                }
            ];

            const mockOwnedWorkshops = [
                {
                    id: 'workshop-1', // Same workshop
                    title: 'Workshop 1',
                }
            ];

            const mockLastMessage = {
                id: 'message-1',
                message: 'Last message',
                user: { id: 'other-user', name: 'Other User' },
            };

            enrollmentRepository.find.mockResolvedValue(mockEnrollments as any);
            workshopRepository.find.mockResolvedValue(mockOwnedWorkshops as any);
            chatMessageRepository.findOne.mockResolvedValue(mockLastMessage as any);
            chatMessageRepository.count.mockResolvedValue(0);

            const result = await service.getActiveChats(mockUserId);

            expect(result).toHaveLength(1); // Should remove duplicates
            expect(result[0].workshopId).toBe('workshop-1');
        });

        it('should filter out chats without messages', async () => {
            const mockEnrollments = [
                {
                    workshop: {
                        id: 'workshop-1',
                        title: 'Workshop 1',
                    }
                }
            ];

            enrollmentRepository.find.mockResolvedValue(mockEnrollments as any);
            workshopRepository.find.mockResolvedValue([]);
            chatMessageRepository.findOne.mockResolvedValue(null); // No last message
            chatMessageRepository.count.mockResolvedValue(0);

            const result = await service.getActiveChats(mockUserId);

            expect(result).toHaveLength(0); // Should filter out chats without messages
        });
    });

    describe('deleteMessage enhanced tests', () => {
        const mockMessageId = 'message-123';
        const mockUserId = 'user-456';

        it('should allow workshop owner to delete any message', async () => {
            const mockMessage = {
                id: mockMessageId,
                userId: 'other-user', // Different user
                message: 'Test message',
                isDeleted: false,
                workshop: {
                    id: 'workshop-123',
                    owner: {
                        id: mockUserId // User is workshop owner
                    }
                }
            };

            chatMessageRepository.findOne.mockResolvedValue(mockMessage as any);
            chatMessageRepository.save.mockResolvedValue({
                ...mockMessage,
                isDeleted: true,
            } as any);

            await service.deleteMessage(mockMessageId, mockUserId);

            expect(chatMessageRepository.save).toHaveBeenCalledWith({
                ...mockMessage,
                isDeleted: true,
            });
        });
    });
});
