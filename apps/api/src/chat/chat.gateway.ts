// apps/api/src/chat/chat.gateway.ts
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto, EditMessageDto } from './dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    user?: any;
}

@WebSocketGateway({
    namespace: '/chat',
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);
    private activeUsers = new Map<string, Set<string>>(); // workshopId -> Set<userId>
    private userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
    ) { }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            // Extract and validate JWT token
            const token = client.handshake.auth.token ||
                client.handshake.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                this.logger.warn('Connection rejected: No token provided');
                client.disconnect();
                return;
            }

            // Validate JWT token
            try {
                const payload = this.jwtService.verify(token);
                client.userId = payload.sub;
                client.user = payload;
            } catch (error) {
                this.logger.warn('Connection rejected: Invalid token');
                client.disconnect();
                return;
            }

            // Track user connections
            if (!this.userSockets.has(client.userId)) {
                this.userSockets.set(client.userId, new Set());
            }
            this.userSockets.get(client.userId).add(client.id);

            this.logger.log(`User ${client.userId} connected with socket ${client.id}`);

        } catch (error) {
            this.logger.error('Connection error:', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        if (client.userId) {
            // Remove from user sockets tracking
            if (this.userSockets.has(client.userId)) {
                this.userSockets.get(client.userId).delete(client.id);
                if (this.userSockets.get(client.userId).size === 0) {
                    this.userSockets.delete(client.userId);
                }
            }

            // Remove user from all workshop rooms
            this.activeUsers.forEach((users, workshopId) => {
                if (users.has(client.userId)) {
                    users.delete(client.userId);
                    client.to(`workshop_${workshopId}`).emit('user_left', {
                        userId: client.userId,
                        activeCount: users.size
                    });
                }
            });

            this.logger.log(`User ${client.userId} disconnected: ${client.id}`);
        }
    }

    @SubscribeMessage('join_workshop')
    async handleJoinWorkshop(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { workshopId: string }
    ) {
        try {
            const { workshopId } = data;
            const userId = client.userId;

            if (!userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }

            // Join the workshop room
            await client.join(`workshop_${workshopId}`);

            // Add to active users
            if (!this.activeUsers.has(workshopId)) {
                this.activeUsers.set(workshopId, new Set());
            }
            this.activeUsers.get(workshopId).add(userId);

            // Notify others in the room
            client.to(`workshop_${workshopId}`).emit('user_joined', {
                userId,
                activeCount: this.activeUsers.get(workshopId).size
            });

            // Send recent messages
            const { messages } = await this.chatService.getWorkshopMessages(workshopId, userId, 1, 20);
            client.emit('recent_messages', { messages });

            // Send current online users
            const onlineUsers = Array.from(this.activeUsers.get(workshopId) || []);
            client.emit('online_users', { users: onlineUsers });

            this.logger.log(`User ${userId} joined workshop ${workshopId}`);
        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('leave_workshop')
    async handleLeaveWorkshop(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { workshopId: string }
    ) {
        const { workshopId } = data;
        const userId = client.userId;

        if (!userId) return;

        await client.leave(`workshop_${workshopId}`);

        if (this.activeUsers.has(workshopId)) {
            this.activeUsers.get(workshopId).delete(userId);
            client.to(`workshop_${workshopId}`).emit('user_left', {
                userId,
                activeCount: this.activeUsers.get(workshopId).size
            });
        }

        this.logger.log(`User ${userId} left workshop ${workshopId}`);
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() createMessageDto: CreateMessageDto
    ) {
        try {
            const userId = client.userId;
            if (!userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }

            const message = await this.chatService.createMessage(createMessageDto, userId);

            // Broadcast to all users in the workshop room
            this.server.to(`workshop_${createMessageDto.workshopId}`).emit('new_message', message);

            this.logger.log(`Message sent by ${userId} in workshop ${createMessageDto.workshopId}`);
        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('edit_message')
    async handleEditMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { messageId: string; editMessageDto: EditMessageDto }
    ) {
        try {
            const userId = client.userId;
            if (!userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }

            const updatedMessage = await this.chatService.editMessage(data.messageId, data.editMessageDto, userId);

            // Broadcast to all users in the workshop room
            this.server.to(`workshop_${updatedMessage.workshopId}`).emit('message_edited', updatedMessage);

        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('delete_message')
    async handleDeleteMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { messageId: string }
    ) {
        try {
            const userId = client.userId;
            if (!userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }

            // Get message info before deletion
            const messageInfo = await this.chatService.getMessageById(data.messageId);
            await this.chatService.deleteMessage(data.messageId, userId);

            // Broadcast to all users in the workshop room
            this.server.to(`workshop_${messageInfo.workshopId}`).emit('message_deleted', {
                messageId: data.messageId,
                workshopId: messageInfo.workshopId
            });

        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('typing_start')
    async handleTypingStart(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { workshopId: string }
    ) {
        const userId = client.userId;
        if (!userId) return;

        client.to(`workshop_${data.workshopId}`).emit('user_typing', {
            userId,
            isTyping: true
        });
    }

    @SubscribeMessage('typing_stop')
    async handleTypingStop(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { workshopId: string }
    ) {
        const userId = client.userId;
        if (!userId) return;

        client.to(`workshop_${data.workshopId}`).emit('user_typing', {
            userId,
            isTyping: false
        });
    }

    @SubscribeMessage('get_online_users')
    async handleGetOnlineUsers(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { workshopId: string }
    ) {
        const onlineUsers = Array.from(this.activeUsers.get(data.workshopId) || []);
        client.emit('online_users', { users: onlineUsers });
    }

    // Method to send notifications to specific users
    async sendNotificationToUser(userId: string, notification: any) {
        const userSocketIds = this.userSockets.get(userId);
        if (userSocketIds) {
            userSocketIds.forEach(socketId => {
                this.server.to(socketId).emit('notification', notification);
            });
        }
    }

    // Method to broadcast to all users in a workshop
    async broadcastToWorkshop(workshopId: string, event: string, data: any) {
        this.server.to(`workshop_${workshopId}`).emit(event, data);
    }
}
