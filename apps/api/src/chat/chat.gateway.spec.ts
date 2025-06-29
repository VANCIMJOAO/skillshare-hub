import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;
  let jwtService: JwtService;

  const mockChatService = {
    createMessage: jest.fn(),
    getWorkshopMessages: jest.fn(),
    deleteMessage: jest.fn(),
    getMessageById: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: mockChatService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    let mockClient: Partial<AuthenticatedSocket>;

    beforeEach(() => {
      mockClient = {
        id: 'socket-123',
        handshake: {
          auth: { token: 'valid-token' },
          headers: {},
        } as any,
        disconnect: jest.fn(),
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };
    });

    it('should authenticate user with valid token', async () => {
      const mockPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'STUDENT',
      };

      mockJwtService.verify.mockReturnValue(mockPayload);

      await gateway.handleConnection(mockClient as AuthenticatedSocket);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(mockClient.userId).toBe('user-123');
      expect(mockClient.user).toEqual(mockPayload);
    });

    it('should disconnect client when no token provided', async () => {
      const mockClientNoAuth = {
        ...mockClient,
        handshake: {
          auth: {},
          headers: {},
        } as any,
      };

      await gateway.handleConnection(mockClientNoAuth as AuthenticatedSocket);

      expect(mockClientNoAuth.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client with invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await gateway.handleConnection(mockClient as AuthenticatedSocket);

      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should extract token from authorization header', async () => {
      const mockClientWithHeader = {
        ...mockClient,
        handshake: {
          auth: {},
          headers: { authorization: 'Bearer header-token' },
        } as any,
      };

      const mockPayload = { sub: 'user-456' };
      mockJwtService.verify.mockReturnValue(mockPayload);

      await gateway.handleConnection(mockClientWithHeader as AuthenticatedSocket);

      expect(jwtService.verify).toHaveBeenCalledWith('header-token');
    });
  });

  describe('handleDisconnect', () => {
    it('should handle user disconnection', () => {
      const mockClient: Partial<AuthenticatedSocket> = {
        id: 'socket-123',
        userId: 'user-123',
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };

      gateway.handleDisconnect(mockClient as AuthenticatedSocket);

      expect(mockClient.userId).toBeDefined();
    });

    it('should handle disconnection for unauthenticated client', () => {
      const mockClient: Partial<AuthenticatedSocket> = {
        id: 'socket-123',
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };

      expect(() => {
        gateway.handleDisconnect(mockClient as AuthenticatedSocket);
      }).not.toThrow();
    });
  });

  describe('message handlers', () => {
    let mockClient: Partial<AuthenticatedSocket>;

    beforeEach(() => {
      mockClient = {
        id: 'socket-123',
        userId: 'user-123',
        user: { name: 'John Doe' },
        join: jest.fn(),
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };
    });

    it('should handle join workshop', async () => {
      const data = { workshopId: 'workshop-1' };
      
      await gateway.handleJoinWorkshop(mockClient as AuthenticatedSocket, data);

      expect(mockClient.join).toHaveBeenCalledWith('workshop_workshop-1');
      // Note: handleJoinWorkshop doesn't return a value, it emits events via client
    });

    it('should handle send message', async () => {
      const data = {
        workshopId: 'workshop-1',
        message: 'Hello world',
      };

      const mockMessage = {
        id: 'msg-1',
        message: 'Hello world',
        userId: 'user-123',
        workshopId: 'workshop-1',
        createdAt: new Date(),
      };

      mockChatService.createMessage.mockResolvedValue(mockMessage);

      await gateway.handleSendMessage(mockClient as AuthenticatedSocket, data);

      expect(chatService.createMessage).toHaveBeenCalledWith(data, 'user-123');
    });

    it('should handle typing indicators', async () => {
      const data = { workshopId: 'workshop-1' };

      await gateway.handleTypingStart(mockClient as AuthenticatedSocket, data);

      expect(mockClient.to).toHaveBeenCalledWith('workshop_workshop-1');
    });
  });
});
