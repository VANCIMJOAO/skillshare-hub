import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AnalyticsService, DashboardMetrics } from './analytics.service';
import { Workshop } from '../workshops/entities/workshop.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Enrollment } from '../workshops/entities/enrollment.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let userRepository: Repository<User>;
  let workshopRepository: Repository<Workshop>;
  let enrollmentRepository: Repository<Enrollment>;

  const mockUserRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockWorkshopRepository = {
    count: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEnrollmentRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Workshop),
          useValue: mockWorkshopRepository,
        },
        {
          provide: getRepositoryToken(Enrollment),
          useValue: mockEnrollmentRepository,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    workshopRepository = module.get<Repository<Workshop>>(getRepositoryToken(Workshop));
    enrollmentRepository = module.get<Repository<Enrollment>>(getRepositoryToken(Enrollment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics successfully', async () => {
      // Mock basic counts
      mockUserRepository.count.mockResolvedValue(100);
      mockWorkshopRepository.count.mockResolvedValue(50); // totalWorkshops
      mockEnrollmentRepository.count.mockResolvedValue(250);

      // Mock query builders for complex queries
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
        getRawOne: jest.fn(),
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getCount: jest.fn(),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockWorkshopRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockEnrollmentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock getCount for active workshops
      mockQueryBuilder.getCount.mockResolvedValue(30);

      // Mock complex query results with proper return values
      mockQueryBuilder.getRawOne
        .mockResolvedValueOnce({ total: '15000' }) // revenue
        .mockResolvedValueOnce({ count: '100' }) // current month users for growth
        .mockResolvedValueOnce({ count: '0' }) // previous month users for growth  
        .mockResolvedValueOnce({ count: '50' }) // current month workshops for growth
        .mockResolvedValueOnce({ count: '0' }); // previous month workshops for growth

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([ // popularCategories
          { category: 'Programming', count: '25' },
          { category: 'Design', count: '15' },
        ])
        .mockResolvedValueOnce([ // revenueByMonth
          { month: '2025-06-01', revenue: '5000', enrollments: '80' },
          { month: '2025-05-01', revenue: '4500', enrollments: '75' },
        ])
        .mockResolvedValueOnce([ // usersByRole
          { role: 'STUDENT', count: '85' },
          { role: 'INSTRUCTOR', count: '15' },
        ])
        .mockResolvedValueOnce([ // topInstructors
          {
            instructor: 'John Doe',
            workshopsCount: '5',
            enrollmentsCount: '50',
            revenue: '2500',
          },
        ])
        .mockResolvedValueOnce([ // enrollmentTrends
          { date: '2025-06-27', enrollments: '10', revenue: '500' },
          { date: '2025-06-26', enrollments: '8', revenue: '400' },
        ]);

      const result = await service.getDashboardMetrics();

      expect(result).toEqual({
        totalUsers: 100,
        totalWorkshops: 50,
        totalEnrollments: 250,
        activeWorkshops: 30,
        revenue: 15000,
        userGrowth: 100, // When previous month is 0, growth is 100%
        workshopGrowth: 100, // When previous month is 0, growth is 100%
        popularCategories: [
          { category: 'Programming', count: 25, percentage: 50 },
          { category: 'Design', count: 15, percentage: 30 },
        ],
        revenueByMonth: [
          { month: 'jun. de 2025', revenue: 5000, enrollments: 80 },
          { month: 'mai. de 2025', revenue: 4500, enrollments: 75 },
        ],
        usersByRole: [
          { role: 'STUDENT', count: 85, percentage: 85 },
          { role: 'INSTRUCTOR', count: 15, percentage: 15 },
        ],
        topInstructors: [
          {
            instructor: 'John Doe',
            workshopsCount: 5,
            enrollmentsCount: 50,
            revenue: 2500,
          },
        ],
        enrollmentTrends: [
          { date: '2025-06-27', enrollments: 10, revenue: 500 },
          { date: '2025-06-26', enrollments: 8, revenue: 400 },
        ],
      });

      // Verify that the repositories were called
      expect(userRepository.count).toHaveBeenCalled();
      expect(workshopRepository.count).toHaveBeenCalled();
      expect(enrollmentRepository.count).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock the repository to throw an error
      mockUserRepository.count.mockRejectedValue(new Error('Database error'));
      
      // Mock query builder to return empty arrays to prevent undefined map errors
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        getRawOne: jest.fn().mockResolvedValue({ count: '0' }),
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockWorkshopRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockEnrollmentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.getDashboardMetrics()).rejects.toThrow('Database error');
    });

    it('should handle null/undefined values in database results', async () => {
      mockUserRepository.count.mockResolvedValue(0);
      mockWorkshopRepository.count.mockResolvedValue(0);
      mockEnrollmentRepository.count.mockResolvedValue(0);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        getRawOne: jest.fn().mockResolvedValue(null),
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockWorkshopRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockEnrollmentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getDashboardMetrics();

      expect(result).toEqual({
        totalUsers: 0,
        totalWorkshops: 0,
        totalEnrollments: 0,
        activeWorkshops: 0,
        revenue: 0,
        userGrowth: 0,
        workshopGrowth: 0,
        popularCategories: [],
        revenueByMonth: [],
        usersByRole: [],
        topInstructors: [],
        enrollmentTrends: [],
      });
    });
  });

  describe('error handling', () => {
    it('should log errors when database queries fail', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockUserRepository.count.mockRejectedValue(new Error('Connection failed'));

      await expect(service.getDashboardMetrics()).rejects.toThrow();

      consoleSpy.mockRestore();
    });
  });
});
