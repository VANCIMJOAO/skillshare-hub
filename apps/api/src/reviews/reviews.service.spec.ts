import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { User } from '../users/entities/user.entity';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepository: Repository<Review>;
  let workshopRepository: Repository<Workshop>;
  let userRepository: Repository<User>;

  const mockReview = {
    id: 'review-1',
    workshopId: 'workshop-1',
    userId: 'user-1',
    rating: 5,
    comment: 'Great workshop!',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWorkshop = {
    id: 'workshop-1',
    title: 'Test Workshop',
    description: 'A test workshop',
    startsAt: new Date(Date.now() - 86400000), // Yesterday (completed)
  };

  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  const mockReviewRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockWorkshopRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
        {
          provide: getRepositoryToken(Workshop),
          useValue: mockWorkshopRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
    workshopRepository = module.get<Repository<Workshop>>(getRepositoryToken(Workshop));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReview', () => {
    const createReviewDto = {
      workshopId: 'workshop-1',
      rating: 5,
      comment: 'Great workshop!',
    };

    it('should create a review successfully', async () => {
      mockWorkshopRepository.findOne.mockResolvedValue(mockWorkshop);
      mockReviewRepository.findOne.mockResolvedValue(null); // No existing review
      mockReviewRepository.create.mockReturnValue(mockReview);
      mockReviewRepository.save.mockResolvedValue(mockReview);

      const result = await service.createReview('user-1', createReviewDto);

      expect(workshopRepository.findOne).toHaveBeenCalledWith({
        where: { id: createReviewDto.workshopId },
      });
      expect(reviewRepository.findOne).toHaveBeenCalledWith({
        where: {
          workshopId: createReviewDto.workshopId,
          userId: 'user-1',
        },
      });
      expect(reviewRepository.create).toHaveBeenCalledWith({
        workshopId: createReviewDto.workshopId,
        userId: 'user-1',
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      });
      expect(reviewRepository.save).toHaveBeenCalledWith(mockReview);
      expect(result).toEqual(mockReview);
    });

    it('should throw NotFoundException when workshop does not exist', async () => {
      mockWorkshopRepository.findOne.mockResolvedValue(null);

      await expect(service.createReview('user-1', createReviewDto)).rejects.toThrow(
        new NotFoundException('Workshop não encontrado'),
      );

      expect(reviewRepository.create).not.toHaveBeenCalled();
      expect(reviewRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user already reviewed', async () => {
      mockWorkshopRepository.findOne.mockResolvedValue(mockWorkshop);
      mockReviewRepository.findOne.mockResolvedValue(mockReview); // Existing review

      await expect(service.createReview('user-1', createReviewDto)).rejects.toThrow(
        new BadRequestException('Você já avaliou este workshop'),
      );

      expect(reviewRepository.create).not.toHaveBeenCalled();
      expect(reviewRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid rating', async () => {
      const invalidRatingDto = { ...createReviewDto, rating: 6 };
      mockWorkshopRepository.findOne.mockResolvedValue(mockWorkshop);
      mockReviewRepository.findOne.mockResolvedValue(null);

      await expect(service.createReview('user-1', invalidRatingDto)).rejects.toThrow(
        new BadRequestException('Rating deve estar entre 1 e 5'),
      );
    });

    it('should throw BadRequestException for rating below 1', async () => {
      const invalidRatingDto = { ...createReviewDto, rating: 0 };
      mockWorkshopRepository.findOne.mockResolvedValue(mockWorkshop);
      mockReviewRepository.findOne.mockResolvedValue(null);

      await expect(service.createReview('user-1', invalidRatingDto)).rejects.toThrow(
        new BadRequestException('Rating deve estar entre 1 e 5'),
      );
    });
  });

  describe('getWorkshopReviews', () => {
    it('should return workshop reviews with statistics', async () => {
      const reviewsWithUsers = [
        {
          ...mockReview,
          rating: 5,
          user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' }
        },
        {
          ...mockReview,
          id: 'review-2',
          rating: 4,
          user: { id: 'user-2', name: 'Jane Doe', email: 'jane@example.com' }
        },
        {
          ...mockReview,
          id: 'review-3',
          rating: 5,
          user: { id: 'user-3', name: 'Bob Smith', email: 'bob@example.com' }
        },
      ];

      mockReviewRepository.find.mockResolvedValue(reviewsWithUsers);

      const result = await service.getWorkshopReviews('workshop-1');

      expect(reviewRepository.find).toHaveBeenCalledWith({
        where: { workshopId: 'workshop-1' },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });

      expect(result.reviews).toHaveLength(3);
      expect(result.reviews[0]).toEqual({
        id: 'review-1',
        rating: 5,
        comment: 'Great workshop!',
        createdAt: expect.any(Date),
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      });

      expect(result.stats).toEqual({
        totalReviews: 3,
        averageRating: 4.7, // (5+4+5)/3 = 4.666... rounded to 1 decimal
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 1,
          5: 2,
        },
      });
    });

    it('should return empty reviews with zero stats', async () => {
      mockReviewRepository.find.mockResolvedValue([]);

      const result = await service.getWorkshopReviews('workshop-1');

      expect(result).toEqual({
        reviews: [],
        stats: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          },
        },
      });
    });
  });
});
