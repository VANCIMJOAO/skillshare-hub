// apps/api/src/notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between, In, LessThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification, NotificationStatus, NotificationType, NotificationPriority } from './entities/notification.entity';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { NotificationsFilterDto } from './dto/notifications-filter.dto';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(NotificationPreferences)
        private preferencesRepository: Repository<NotificationPreferences>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private eventEmitter: EventEmitter2,
        private mailService: MailService,
    ) { }

    async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
        const user = await this.userRepository.findOne({
            where: { id: createNotificationDto.userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const notification = this.notificationRepository.create({
            ...createNotificationDto,
            user,
        });

        const savedNotification = await this.notificationRepository.save(notification);

        // Emit real-time event
        this.eventEmitter.emit('notification.created', {
            userId: user.id,
            notification: savedNotification,
        });

        // Send email if requested and user preferences allow
        if (createNotificationDto.sendEmail) {
            await this.handleEmailNotification(savedNotification, user);
        }

        // Handle push notification if requested
        if (createNotificationDto.sendPush) {
            await this.handlePushNotification(savedNotification, user);
        }

        return savedNotification;
    }

    async getNotificationsForUser(
        userId: string,
        filter: NotificationsFilterDto,
    ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
        const { page = 1, limit = 20, ...filterOptions } = filter;
        const skip = (page - 1) * limit;

        const whereConditions: any = { userId };

        if (filterOptions.type) {
            whereConditions.type = filterOptions.type;
        }

        if (filterOptions.status) {
            whereConditions.status = filterOptions.status;
        }

        if (filterOptions.priority) {
            whereConditions.priority = filterOptions.priority;
        }

        if (filterOptions.unreadOnly) {
            whereConditions.status = NotificationStatus.UNREAD;
        }

        if (filterOptions.fromDate && filterOptions.toDate) {
            whereConditions.createdAt = Between(
                new Date(filterOptions.fromDate),
                new Date(filterOptions.toDate),
            );
        }

        const findOptions: FindManyOptions<Notification> = {
            where: whereConditions,
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        };

        const [notifications, total] = await this.notificationRepository.findAndCount(findOptions);

        // Get unread count
        const unreadCount = await this.notificationRepository.count({
            where: { userId, status: NotificationStatus.UNREAD },
        });

        return { notifications, total, unreadCount };
    }

    async markAsRead(notificationId: string, userId: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        notification.status = NotificationStatus.READ;
        notification.readAt = new Date();

        return this.notificationRepository.save(notification);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepository.update(
            { userId, status: NotificationStatus.UNREAD },
            { status: NotificationStatus.READ, readAt: new Date() },
        );

        // Emit event for real-time update
        this.eventEmitter.emit('notifications.allRead', { userId });
    }

    async deleteNotification(notificationId: string, userId: string): Promise<void> {
        const result = await this.notificationRepository.delete({
            id: notificationId,
            userId,
        });

        if (result.affected === 0) {
            throw new NotFoundException('Notification not found');
        }
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.notificationRepository.count({
            where: { userId, status: NotificationStatus.UNREAD },
        });
    }

    // Notification Preferences
    async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
        let preferences = await this.preferencesRepository.findOne({
            where: { userId },
        });

        if (!preferences) {
            preferences = await this.createDefaultPreferences(userId);
        }

        return preferences;
    }

    async updateNotificationPreferences(
        userId: string,
        updateDto: UpdateNotificationPreferencesDto,
    ): Promise<NotificationPreferences> {
        let preferences = await this.preferencesRepository.findOne({
            where: { userId },
        });

        if (!preferences) {
            preferences = await this.createDefaultPreferences(userId);
        }

        Object.assign(preferences, updateDto);
        return this.preferencesRepository.save(preferences);
    }

    private async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
        const preferences = this.preferencesRepository.create({ userId });
        return this.preferencesRepository.save(preferences);
    }

    // Helper methods for sending notifications
    async createWorkshopEnrollmentNotification(userId: string, workshopTitle: string, workshopId: string): Promise<void> {
        await this.createNotification({
            userId,
            title: 'Inscrição Confirmada!',
            message: `Sua inscrição no workshop "${workshopTitle}" foi confirmada com sucesso.`,
            type: NotificationType.ENROLLMENT_CONFIRMED,
            priority: NotificationPriority.HIGH,
            actionUrl: `/workshops/${workshopId}`,
            metadata: { workshopId, workshopTitle },
            sendEmail: true,
            sendPush: true,
        });
    }

    async createWorkshopReminderNotification(userId: string, workshopTitle: string, workshopId: string, startsAt: Date): Promise<void> {
        await this.createNotification({
            userId,
            title: 'Lembrete de Workshop',
            message: `O workshop "${workshopTitle}" começará em breve. Não se esqueça!`,
            type: NotificationType.WORKSHOP_REMINDER,
            priority: NotificationPriority.HIGH,
            actionUrl: `/workshops/${workshopId}`,
            metadata: { workshopId, workshopTitle, startsAt },
            sendEmail: true,
            sendPush: true,
        });
    }

    async createWorkshopCancelledNotification(userId: string, workshopTitle: string, reason?: string): Promise<void> {
        await this.createNotification({
            userId,
            title: 'Workshop Cancelado',
            message: `Infelizmente, o workshop "${workshopTitle}" foi cancelado. ${reason || ''}`,
            type: NotificationType.WORKSHOP_CANCELLED,
            priority: NotificationPriority.URGENT,
            metadata: { workshopTitle, reason },
            sendEmail: true,
            sendPush: true,
        });
    }

    async createNewWorkshopNotification(userId: string, workshopTitle: string, workshopId: string, instructorName: string): Promise<void> {
        await this.createNotification({
            userId,
            title: 'Novo Workshop Disponível',
            message: `Um novo workshop "${workshopTitle}" foi criado por ${instructorName}.`,
            type: NotificationType.NEW_WORKSHOP_CREATED,
            priority: NotificationPriority.MEDIUM,
            actionUrl: `/workshops/${workshopId}`,
            metadata: { workshopId, workshopTitle, instructorName },
            sendEmail: false, // Only send if user opts in
            sendPush: false,
        });
    }

    private async handleEmailNotification(notification: Notification, user: User): Promise<void> {
        const preferences = await this.getNotificationPreferences(user.id);

        if (!preferences.emailEnabled) {
            return;
        }

        // Check specific email preferences based on notification type
        let shouldSendEmail = false;

        switch (notification.type) {
            case NotificationType.WORKSHOP_REMINDER:
                shouldSendEmail = preferences.emailWorkshopReminders;
                break;
            case NotificationType.ENROLLMENT_CONFIRMED:
                shouldSendEmail = preferences.emailEnrollmentConfirmations;
                break;
            case NotificationType.WORKSHOP_UPDATED:
            case NotificationType.WORKSHOP_CANCELLED:
                shouldSendEmail = preferences.emailWorkshopUpdates;
                break;
            case NotificationType.NEW_WORKSHOP_CREATED:
                shouldSendEmail = preferences.emailNewWorkshops;
                break;
            default:
                shouldSendEmail = true; // System announcements and other important notifications
        }

        if (shouldSendEmail) {
            await this.mailService.sendNotificationEmail(
                user.email,
                user.name,
                notification.title,
                notification.message,
                notification.actionUrl,
            );

            // Mark as email sent
            notification.emailSent = true;
            await this.notificationRepository.save(notification);
        }
    }

    private async handlePushNotification(notification: Notification, user: User): Promise<void> {
        const preferences = await this.getNotificationPreferences(user.id);

        if (!preferences.pushEnabled) {
            return;
        }

        // Check specific push preferences based on notification type
        let shouldSendPush = false;

        switch (notification.type) {
            case NotificationType.WORKSHOP_REMINDER:
                shouldSendPush = preferences.pushWorkshopReminders;
                break;
            case NotificationType.ENROLLMENT_CONFIRMED:
                shouldSendPush = preferences.pushEnrollmentConfirmations;
                break;
            case NotificationType.WORKSHOP_UPDATED:
            case NotificationType.WORKSHOP_CANCELLED:
                shouldSendPush = preferences.pushWorkshopUpdates;
                break;
            case NotificationType.NEW_WORKSHOP_CREATED:
                shouldSendPush = preferences.pushNewWorkshops;
                break;
            default:
                shouldSendPush = true;
        }

        if (shouldSendPush) {
            // Emit push notification event (will be handled by WebSocket gateway)
            this.eventEmitter.emit('notification.push', {
                userId: user.id,
                notification: {
                    title: notification.title,
                    message: notification.message,
                    actionUrl: notification.actionUrl,
                    priority: notification.priority,
                },
            });

            // Mark as push sent
            notification.pushSent = true;
            await this.notificationRepository.save(notification);
        }
    }

    async deleteOldNotifications(beforeDate: Date): Promise<number> {
        const result = await this.notificationRepository.delete({
            createdAt: LessThan(beforeDate),
        });

        return result.affected || 0;
    }
}
