import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { User, UserRole } from '../users/entities/user.entity';

describe('NotificationsController', () => {
    let controller: NotificationsController;
    let service: NotificationsService;

    const mockUser: User = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        role: UserRole.STUDENT,
        createdAt: new Date(),
        updatedAt: new Date(),
        workshops: [],
        enrollments: [],
        notifications: [],
        notificationPreferences: null,
    };

    const mockNotification = {
        id: 'notification-1',
        title: 'Workshop Reminder',
        message: 'Your workshop starts in 1 hour',
        type: 'workshop_reminder',
        isRead: false,
        createdAt: new Date(),
    };

    const mockNotificationsService = {
        getNotificationsForUser: jest.fn(),
        getUnreadCount: jest.fn(),
        markAsRead: jest.fn(),
        markAllAsRead: jest.fn(),
        deleteNotification: jest.fn(),
        getNotificationPreferences: jest.fn(),
        updateNotificationPreferences: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotificationsController],
            providers: [
                {
                    provide: NotificationsService,
                    useValue: mockNotificationsService,
                },
            ],
        }).compile();

        controller = module.get<NotificationsController>(NotificationsController);
        service = module.get<NotificationsService>(NotificationsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getNotifications', () => {
        it('should return user notifications', async () => {
            const filterDto = { page: 1, limit: 10 };
            const notifications = [mockNotification];
            mockNotificationsService.getNotificationsForUser.mockResolvedValue(notifications);

            const result = await controller.getNotifications(mockUser, filterDto);

            expect(service.getNotificationsForUser).toHaveBeenCalledWith(mockUser.id, filterDto);
            expect(result).toEqual(notifications);
        });
    });

    describe('getUnreadCount', () => {
        it('should return unread count', async () => {
            const unreadCount = 5;
            mockNotificationsService.getUnreadCount.mockResolvedValue(unreadCount);

            const result = await controller.getUnreadCount(mockUser);

            expect(service.getUnreadCount).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual({ unreadCount });
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            const notificationId = 'notification-1';
            mockNotificationsService.markAsRead.mockResolvedValue(undefined);

            await controller.markAsRead(mockUser, notificationId);

            expect(service.markAsRead).toHaveBeenCalledWith(notificationId, mockUser.id);
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications as read', async () => {
            mockNotificationsService.markAllAsRead.mockResolvedValue(undefined);

            await controller.markAllAsRead(mockUser);

            expect(service.markAllAsRead).toHaveBeenCalledWith(mockUser.id);
        });
    });

    describe('deleteNotification', () => {
        it('should delete notification', async () => {
            const notificationId = 'notification-1';
            mockNotificationsService.deleteNotification.mockResolvedValue(undefined);

            await controller.deleteNotification(notificationId, mockUser);

            expect(service.deleteNotification).toHaveBeenCalledWith(notificationId, mockUser.id);
        });
    });

    describe('getPreferences', () => {
        it('should return user notification preferences', async () => {
            const preferences = {
                workshopReminders: true,
                marketingEmails: false,
                systemUpdates: true,
            };
            mockNotificationsService.getNotificationPreferences.mockResolvedValue(preferences);

            const result = await controller.getPreferences(mockUser);

            expect(service.getNotificationPreferences).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual(preferences);
        });
    });

    describe('updatePreferences', () => {
        it('should update user notification preferences', async () => {
            const updateDto = {
                emailWorkshopReminders: false,
                pushEnabled: true,
            };
            const updatedPreferences = {
                emailWorkshopReminders: false,
                pushEnabled: true,
                emailEnabled: true,
            };
            mockNotificationsService.updateNotificationPreferences.mockResolvedValue(updatedPreferences);

            const result = await controller.updatePreferences(mockUser, updateDto);

            expect(service.updateNotificationPreferences).toHaveBeenCalledWith(mockUser.id, updateDto);
            expect(result).toEqual(updatedPreferences);
        });
    });
});
