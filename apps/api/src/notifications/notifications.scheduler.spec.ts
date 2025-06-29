import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { NotificationsScheduler } from './notifications.scheduler';
import { Workshop } from '../workshops/entities/workshop.entity';
import { Enrollment } from '../workshops/entities/enrollment.entity';
import { NotificationsService } from './notifications.service';

describe('NotificationsScheduler', () => {
  let scheduler: NotificationsScheduler;
  let workshopRepository: jest.Mocked<Repository<Workshop>>;
  let enrollmentRepository: jest.Mocked<Repository<Enrollment>>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const mockWorkshopRepository = {
      createQueryBuilder: jest.fn(),
    };

    const mockEnrollmentRepository = {
      find: jest.fn(),
    };

    const mockNotificationsService = {
      createNotification: jest.fn(),
      createWorkshopReminderNotification: jest.fn().mockResolvedValue({ id: 'notification-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsScheduler,
        {
          provide: getRepositoryToken(Workshop),
          useValue: mockWorkshopRepository,
        },
        {
          provide: getRepositoryToken(Enrollment),
          useValue: mockEnrollmentRepository,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    scheduler = module.get<NotificationsScheduler>(NotificationsScheduler);
    workshopRepository = module.get(getRepositoryToken(Workshop));
    enrollmentRepository = module.get(getRepositoryToken(Enrollment));
    notificationsService = module.get<NotificationsService>(NotificationsService) as jest.Mocked<NotificationsService>;

    // Mock logger to prevent console output during tests
    loggerSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    loggerSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  describe('sendWorkshopReminders', () => {
    it('should send reminders for upcoming workshops', async () => {
      const mockWorkshop = {
        id: 'workshop-1',
        title: 'Test Workshop',
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        enrollments: [],
      };

      const mockEnrollment = {
        id: 'enrollment-1',
        workshopId: 'workshop-1',
        userId: 'user-1',
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockWorkshop]),
      };

      workshopRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      enrollmentRepository.find.mockResolvedValue([mockEnrollment] as any);
      notificationsService.createNotification.mockResolvedValue(undefined);

      await scheduler.sendWorkshopReminders();

      expect(workshopRepository.createQueryBuilder).toHaveBeenCalledWith('workshop');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(enrollmentRepository.find).toHaveBeenCalledWith({
        where: { workshopId: 'workshop-1' },
        relations: ['user'],
      });
      expect(notificationsService.createWorkshopReminderNotification).toHaveBeenCalledWith(
        'user-1',
        mockWorkshop.title,
        mockWorkshop.id,
        mockWorkshop.startsAt,
      );
    });

    it('should handle no upcoming workshops', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      workshopRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await scheduler.sendWorkshopReminders();

      expect(enrollmentRepository.find).not.toHaveBeenCalled();
      expect(notificationsService.createNotification).not.toHaveBeenCalled();
    });

    it('should handle workshops with no enrollments', async () => {
      const mockWorkshop = {
        id: 'workshop-1',
        title: 'Test Workshop',
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        enrollments: [],
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockWorkshop]),
      };

      workshopRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      enrollmentRepository.find.mockResolvedValue([]);

      await scheduler.sendWorkshopReminders();

      expect(enrollmentRepository.find).toHaveBeenCalledWith({
        where: { workshopId: 'workshop-1' },
        relations: ['user'],
      });
      expect(notificationsService.createNotification).not.toHaveBeenCalled();
    });

    it('should handle multiple workshops and enrollments', async () => {
      const mockWorkshops = [
        {
          id: 'workshop-1',
          title: 'React Workshop',
          startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          enrollments: [],
        },
        {
          id: 'workshop-2',
          title: 'Node.js Workshop',
          startsAt: new Date(Date.now() + 25 * 60 * 60 * 1000),
          enrollments: [],
        },
      ];

      const mockEnrollments = [
        {
          id: 'enrollment-1',
          workshopId: 'workshop-1',
          userId: 'user-1',
          user: { id: 'user-1', name: 'John', email: 'john@example.com' },
        },
        {
          id: 'enrollment-2',
          workshopId: 'workshop-1',
          userId: 'user-2',
          user: { id: 'user-2', name: 'Jane', email: 'jane@example.com' },
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockWorkshops),
      };

      workshopRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      enrollmentRepository.find
        .mockResolvedValueOnce(mockEnrollments as any)
        .mockResolvedValueOnce([]);

      await scheduler.sendWorkshopReminders();

      expect(notificationsService.createWorkshopReminderNotification).toHaveBeenCalledTimes(2);
      expect(notificationsService.createWorkshopReminderNotification).toHaveBeenCalledWith(
        'user-1',
        'React Workshop',
        'workshop-1',
        mockWorkshops[0].startsAt,
      );
      expect(notificationsService.createWorkshopReminderNotification).toHaveBeenCalledWith(
        'user-2',
        'React Workshop',
        'workshop-1',
        mockWorkshops[0].startsAt,
      );
    });

    it('should handle errors during notification creation', async () => {
      const mockWorkshop = {
        id: 'workshop-1',
        title: 'Test Workshop',
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        enrollments: [],
      };

      const mockEnrollment = {
        id: 'enrollment-1',
        workshopId: 'workshop-1',
        user: { id: 'user-1', name: 'John', email: 'john@example.com' },
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockWorkshop]),
      };

      workshopRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      enrollmentRepository.find.mockResolvedValue([mockEnrollment] as any);
      notificationsService.createNotification.mockRejectedValue(new Error('Notification failed'));

      // Should not throw error, just log it
      await expect(scheduler.sendWorkshopReminders()).resolves.toBeUndefined();
    });
  });

  describe('cleanupOldNotifications', () => {
    it('should be a scheduled method', () => {
      // This test verifies that the scheduler has the cleanupOldNotifications method
      expect(typeof scheduler.cleanupOldNotifications).toBe('function');
    });
  });

  describe('date calculations', () => {
    it('should calculate tomorrow correctly', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      workshopRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await scheduler.sendWorkshopReminders();

      // Verify that the where clauses were called with date parameters
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'workshop.startsAt > :tomorrow',
        expect.objectContaining({ tomorrow: expect.any(Date) })
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'workshop.startsAt < :dayAfterTomorrow',
        expect.objectContaining({ dayAfterTomorrow: expect.any(Date) })
      );
    });
  });
});
