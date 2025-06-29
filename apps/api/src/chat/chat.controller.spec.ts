import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto, EditMessageDto } from './dto/create-message.dto';

describe('ChatController', () => {
    let controller: ChatController;
    let chatService: jest.Mocked<ChatService>;

    const mockChatService = {
        getWorkshopMessages: jest.fn(),
        createMessage: jest.fn(),
        editMessage: jest.fn(),
        deleteMessage: jest.fn(),
    };

    const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
    };

    const mockRequest = { user: mockUser };

    const mockMessage = {
        id: 'message-1',
        message: 'Hello, world!',
        type: 'text',
        workshopId: 'workshop-1',
        userId: 'user-1',
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChatController],
            providers: [
                {
                    provide: ChatService,
                    useValue: mockChatService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<ChatController>(ChatController);
        chatService = module.get<ChatService>(ChatService) as jest.Mocked<ChatService>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getWorkshopMessages', () => {
        it('should get workshop messages successfully', async () => {
            const workshopId = 'workshop-1';
            const page = 1;
            const limit = 50;

            const mockPaginatedMessages = {
                data: [mockMessage],
                meta: {
                    page: 1,
                    limit: 50,
                    total: 1,
                    totalPages: 1,
                },
            };

            mockChatService.getWorkshopMessages.mockResolvedValue(mockPaginatedMessages);

            const result = await controller.getWorkshopMessages(workshopId, page, limit, mockRequest);

            expect(chatService.getWorkshopMessages).toHaveBeenCalledWith(workshopId, mockUser.id, page, limit);
            expect(result).toBe(mockPaginatedMessages);
        });

        it('should use default pagination values', async () => {
            const workshopId = 'workshop-1';

            const mockPaginatedMessages = {
                data: [mockMessage],
                meta: {
                    page: 1,
                    limit: 50,
                    total: 1,
                    totalPages: 1,
                },
            };

            mockChatService.getWorkshopMessages.mockResolvedValue(mockPaginatedMessages);

            await controller.getWorkshopMessages(workshopId, undefined, undefined, mockRequest);

            expect(chatService.getWorkshopMessages).toHaveBeenCalledWith(workshopId, mockUser.id, 1, 50);
        });
    });

    describe('sendMessage', () => {
        it('should send a message successfully', async () => {
            const createMessageDto: CreateMessageDto = {
                message: 'Hello, world!',
                type: 'text',
                workshopId: 'workshop-1',
            };

            mockChatService.createMessage.mockResolvedValue(mockMessage);

            const result = await controller.sendMessage(createMessageDto, mockRequest);

            expect(chatService.createMessage).toHaveBeenCalledWith(createMessageDto, mockUser.id);
            expect(result).toBe(mockMessage);
        });
    });

    describe('editMessage', () => {
        it('should edit a message successfully', async () => {
            const messageId = 'message-1';
            const editMessageDto: EditMessageDto = { message: 'Updated message' };
            const updatedMessage = { ...mockMessage, message: 'Updated message', isEdited: true };

            mockChatService.editMessage.mockResolvedValue(updatedMessage);

            const result = await controller.editMessage(messageId, editMessageDto, mockRequest);

            expect(chatService.editMessage).toHaveBeenCalledWith(messageId, editMessageDto, mockUser.id);
            expect(result).toBe(updatedMessage);
        });
    });

    describe('deleteMessage', () => {
        it('should delete a message successfully', async () => {
            const messageId = 'message-1';

            mockChatService.deleteMessage.mockResolvedValue(true);

            const result = await controller.deleteMessage(messageId, mockRequest);

            expect(chatService.deleteMessage).toHaveBeenCalledWith(messageId, mockUser.id);
            expect(result).toEqual({ message: 'Message deleted successfully' });
        });
    });
});
