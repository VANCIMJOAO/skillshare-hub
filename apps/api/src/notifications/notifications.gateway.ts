// apps/api/src/notifications/notifications.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

    handleConnection(client: Socket) {
        console.log(`WebSocket client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`WebSocket client disconnected: ${client.id}`);

        // Remove socket from user mappings
        for (const [userId, socketIds] of this.userSockets.entries()) {
            if (socketIds.has(client.id)) {
                socketIds.delete(client.id);
                if (socketIds.size === 0) {
                    this.userSockets.delete(userId);
                }
                break;
            }
        }
    }

    @SubscribeMessage('join-user')
    @UseGuards(JwtAuthGuard)
    handleJoinUser(
        @MessageBody() data: { userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { userId } = data;

        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }

        this.userSockets.get(userId)!.add(client.id);
        client.join(`user_${userId}`);

        console.log(`User ${userId} joined notifications room with socket ${client.id}`);

        return { success: true, message: 'Joined notifications room' };
    }

    @SubscribeMessage('leave-user')
    handleLeaveUser(
        @MessageBody() data: { userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { userId } = data;

        client.leave(`user_${userId}`);

        const socketIds = this.userSockets.get(userId);
        if (socketIds) {
            socketIds.delete(client.id);
            if (socketIds.size === 0) {
                this.userSockets.delete(userId);
            }
        }

        console.log(`User ${userId} left notifications room`);

        return { success: true, message: 'Left notifications room' };
    }

    // Event listeners for notification events
    @OnEvent('notification.created')
    handleNotificationCreated(payload: { userId: string; notification: any }) {
        const { userId, notification } = payload;

        // Send to specific user
        this.server.to(`user_${userId}`).emit('new-notification', {
            notification,
            timestamp: new Date().toISOString(),
        });

        console.log(`Real-time notification sent to user ${userId}: ${notification.title}`);
    }

    @OnEvent('notifications.allRead')
    handleAllNotificationsRead(payload: { userId: string }) {
        const { userId } = payload;

        this.server.to(`user_${userId}`).emit('all-notifications-read', {
            timestamp: new Date().toISOString(),
        });

        console.log(`All notifications marked as read for user ${userId}`);
    }

    @OnEvent('notification.push')
    handlePushNotification(payload: { userId: string; notification: any }) {
        const { userId, notification } = payload;

        // Send push notification via WebSocket for now
        // In a real app, this would integrate with FCM, Apple Push, etc.
        this.server.to(`user_${userId}`).emit('push-notification', {
            notification,
            timestamp: new Date().toISOString(),
        });

        console.log(`Push notification sent to user ${userId}: ${notification.title}`);
    }

    // Utility method to send notification to specific user
    sendNotificationToUser(userId: string, event: string, data: any) {
        this.server.to(`user_${userId}`).emit(event, {
            ...data,
            timestamp: new Date().toISOString(),
        });
    }

    // Get connected users count
    getConnectedUsersCount(): number {
        return this.userSockets.size;
    }

    // Check if user is connected
    isUserConnected(userId: string): boolean {
        return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
    }
}
