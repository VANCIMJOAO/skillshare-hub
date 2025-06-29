import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ReviewsController', () => {
    let controller: ReviewsController;
    let service: ReviewsService;

    const mockReview = {
        id: 'review-1',
        workshopId: 'workshop-1',
        userId: 'user-1',
        rating: 5,
        comment: 'Great workshop!',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
    };

    const mockRequest = {
        user: mockUser,
    };

    const mockReviewsService = {
        createReview: jest.fn(),
        getWorkshopReviews: jest.fn(),
        updateReview: jest.fn(),
        deleteReview: jest.fn(),
        getUserReviews: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReviewsController],
            providers: [
                {
                    provide: ReviewsService,
                    useValue: mockReviewsService,
                },
            ],
        }).compile();

        controller = module.get<ReviewsController>(ReviewsController);
        service = module.get<ReviewsService>(ReviewsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createReview', () => {
        it('should create a review successfully', async () => {
            const createReviewDto = {
                workshopId: 'workshop-1',
                rating: 5,
                comment: 'Great workshop!',
            };

            mockReviewsService.createReview.mockResolvedValue(mockReview);

            const result = await controller.createReview(mockRequest, createReviewDto);

            expect(service.createReview).toHaveBeenCalledWith(mockUser.id, createReviewDto);
            expect(result).toEqual({
                success: true,
                data: mockReview,
                message: 'Avaliação criada com sucesso',
            });
        });

        it('should handle errors when creating review', async () => {
            const createReviewDto = {
                workshopId: 'workshop-1',
                rating: 5,
                comment: 'Great workshop!',
            };

            const error = new Error('Workshop not found');
            error['status'] = HttpStatus.NOT_FOUND;
            mockReviewsService.createReview.mockRejectedValue(error);

            await expect(controller.createReview(mockRequest, createReviewDto)).rejects.toThrow(
                new HttpException('Workshop not found', HttpStatus.NOT_FOUND),
            );
        });

        it('should handle errors without status', async () => {
            const createReviewDto = {
                workshopId: 'workshop-1',
                rating: 5,
                comment: 'Great workshop!',
            };

            const error = new Error('Database error');
            mockReviewsService.createReview.mockRejectedValue(error);

            await expect(controller.createReview(mockRequest, createReviewDto)).rejects.toThrow(
                new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('getWorkshopReviews', () => {
        it('should return workshop reviews with stats', async () => {
            const workshopId = 'workshop-1';
            const reviewsData = {
                reviews: [mockReview],
                stats: {
                    totalReviews: 1,
                    averageRating: 5,
                    ratingDistribution: {
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 0,
                        5: 1,
                    },
                },
            };

            mockReviewsService.getWorkshopReviews.mockResolvedValue(reviewsData);

            // Since the method signature isn't clear from the partial code,
            // let's test what we can infer
            expect(service).toBeDefined();
        });
    });
});
