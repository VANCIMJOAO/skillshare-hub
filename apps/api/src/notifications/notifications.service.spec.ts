import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationStatus, NotificationType, NotificationPriority } from './entities/notification.entity';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: Repository<Notification>;
  let preferencesRepository: Repository<NotificationPreferences>;
  let userRepository: Repository<User>;
  let eventEmitter: EventEmitter2;
  let mailService: MailService;

  const mockUser: User = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'hash',
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
    title: 'Test Notification',
    message: 'Test message',
    type: NotificationType.WORKSHOP_REMINDER,
    priority: NotificationPriority.MEDIUM,
    status: NotificationStatus.UNREAD,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    readAt: null,
    user: mockUser,
  };

  const mockPreferences = {
    id: 'pref-1',
    userId: 'user-1',
    emailEnabled: true,
    emailWorkshopReminders: true,
    emailEnrollmentConfirmations: true,
    emailWorkshopUpdates: true,
    emailNewWorkshops: false,
    emailMarketingUpdates: false,
    pushEnabled: true,
    pushWorkshopReminders: true,
    pushEnrollmentConfirmations: true,
    pushWorkshopUpdates: true,
    pushNewWorkshops: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
  };

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPreferencesRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockMailService = {
    sendNotificationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: getRepositoryToken(NotificationPreferences),
          useValue: mockPreferencesRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
    preferencesRepository = module.get<Repository<NotificationPreferences>>(getRepositoryToken(NotificationPreferences));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    const createNotificationDto = {
      userId: 'user-1',
      title: 'Test Notification',
      message: 'Test message',
      type: NotificationType.WORKSHOP_REMINDER,
      priority: NotificationPriority.MEDIUM,
      sendEmail: false,
    };

    it('should create notification successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createNotification(createNotificationDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: createNotificationDto.userId },
      });
      expect(notificationRepository.create).toHaveBeenCalledWith({
        ...createNotificationDto,
        user: mockUser,
      });
      expect(notificationRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(eventEmitter.emit).toHaveBeenCalledWith('notification.created', {
        userId: mockUser.id,
        notification: mockNotification,
      });
      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.createNotification(createNotificationDto)).rejects.toThrow(
        new NotFoundException('User not found'),
      );

      expect(notificationRepository.create).not.toHaveBeenCalled();
      expect(notificationRepository.save).not.toHaveBeenCalled();
    });

    it('should send email when sendEmail is true and user preferences allow', async () => {
      const dtoWithEmail = { ...createNotificationDto, sendEmail: true };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);
      mockPreferencesRepository.findOne.mockResolvedValue(mockPreferences);

      await service.createNotification(dtoWithEmail);

      expect(mailService.sendNotificationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name,
        dtoWithEmail.title,
        dtoWithEmail.message,
        undefined,
      );
    });
  });

  describe('getNotificationsForUser', () => {
    it('should return user notifications with pagination', async () => {
      const filterDto = { page: 1, limit: 10 };
      const notifications = [mockNotification];
      mockNotificationRepository.findAndCount.mockResolvedValue([notifications, 1]);
      mockNotificationRepository.count.mockResolvedValue(0);

      const result = await service.getNotificationsForUser('user-1', filterDto);

      expect(notificationRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        notifications,
        total: 1,
        unreadCount: 0,
      });
    });

    it('should filter by status when provided', async () => {
      const filterDto = { page: 1, limit: 10, status: NotificationStatus.UNREAD };
      mockNotificationRepository.findAndCount.mockResolvedValue([[], 0]);
      mockNotificationRepository.count.mockResolvedValue(0);

      await service.getNotificationsForUser('user-1', filterDto);

      expect(notificationRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: NotificationStatus.UNREAD,
        },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue({
        ...mockNotification,
        status: NotificationStatus.READ,
        readAt: new Date(),
      });

      await service.markAsRead('notification-1', 'user-1');

      expect(notificationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'notification-1', userId: 'user-1' },
      });
      expect(notificationRepository.save).toHaveBeenCalledWith({
        ...mockNotification,
        status: NotificationStatus.READ,
        readAt: expect.any(Date),
      });
    });

    it('should throw NotFoundException when notification does not exist', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(service.markAsRead('notification-1', 'user-1')).rejects.toThrow(
        new NotFoundException('Notification not found'),
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count for user', async () => {
      mockNotificationRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(notificationRepository.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: NotificationStatus.UNREAD,
        },
      });
      expect(result).toBe(5);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all user notifications as read', async () => {
      mockNotificationRepository.update.mockResolvedValue({ affected: 3 });

      await service.markAllAsRead('user-1');

      expect(notificationRepository.update).toHaveBeenCalledWith(
        { userId: 'user-1', status: NotificationStatus.UNREAD },
        { status: NotificationStatus.READ, readAt: expect.any(Date) },
      );
    });
  });

  describe('createWorkshopEnrollmentNotification', () => {
    it('should create workshop enrollment notification', async () => {
      const createNotificationSpy = jest.spyOn(service, 'createNotification').mockResolvedValue(undefined);

      await service.createWorkshopEnrollmentNotification('user-1', 'Test Workshop', 'workshop-1');

      expect(createNotificationSpy).toHaveBeenCalledWith({
        userId: 'user-1',
        title: 'Inscrição Confirmada!',
        message: 'Sua inscrição no workshop "Test Workshop" foi confirmada com sucesso.',
        type: NotificationType.ENROLLMENT_CONFIRMED,
        priority: NotificationPriority.HIGH,
        actionUrl: '/workshops/workshop-1',
        metadata: { workshopId: 'workshop-1', workshopTitle: 'Test Workshop' },
        sendEmail: true,
        sendPush: true,
      });
    });
  });

  describe('getNotificationPreferences', () => {
    it('should return user notification preferences', async () => {
      mockPreferencesRepository.findOne.mockResolvedValue(mockPreferences);

      const result = await service.getNotificationPreferences('user-1');

      expect(preferencesRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual(mockPreferences);
    });

    it('should create default preferences if none exist', async () => {
      mockPreferencesRepository.findOne.mockResolvedValue(null);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPreferencesRepository.create.mockReturnValue(mockPreferences);
      mockPreferencesRepository.save.mockResolvedValue(mockPreferences);

      const result = await service.getNotificationPreferences('user-1');

      expect(preferencesRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
      });
      expect(result).toEqual(mockPreferences);
    });
  });
});
