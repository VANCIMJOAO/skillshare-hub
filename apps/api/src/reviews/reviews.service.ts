// apps/api/src/reviews/reviews.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { User } from '../users/entities/user.entity';

export interface CreateReviewDto {
    workshopId: string;
    rating: number;
    comment?: string;
}

export interface UpdateReviewDto {
    rating?: number;
    comment?: string;
}

export interface ReviewWithUser {
    id: string;
    rating: number;
    comment?: string;
    createdAt: Date;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export interface WorkshopReviewsResponse {
    reviews: ReviewWithUser[];
    stats: {
        totalReviews: number;
        averageRating: number;
        ratingDistribution: {
            [key: number]: number;
        };
    };
}

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        @InjectRepository(Workshop)
        private readonly workshopRepository: Repository<Workshop>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async createReview(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
        const { workshopId, rating, comment } = createReviewDto;

        // Validar rating
        if (rating < 1 || rating > 5) {
            throw new BadRequestException('Rating deve estar entre 1 e 5');
        }

        // Verificar se o workshop existe
        const workshop = await this.workshopRepository.findOne({
            where: { id: workshopId }
        });

        if (!workshop) {
            throw new NotFoundException('Workshop não encontrado');
        }

        // Verificar se o usuário já fez review deste workshop
        const existingReview = await this.reviewRepository.findOne({
            where: {
                userId,
                workshopId
            }
        });

        if (existingReview) {
            throw new BadRequestException('Você já avaliou este workshop');
        }

        // Criar review
        const review = this.reviewRepository.create({
            userId,
            workshopId,
            rating,
            comment
        });

        return await this.reviewRepository.save(review);
    }

    async getWorkshopReviews(workshopId: string): Promise<WorkshopReviewsResponse> {
        const reviews = await this.reviewRepository.find({
            where: { workshopId },
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });

        const reviewsWithUser: ReviewWithUser[] = reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            user: {
                id: review.user.id,
                name: review.user.name,
                email: review.user.email
            }
        }));

        // Calcular estatísticas
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;

        const ratingDistribution = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };

        reviews.forEach(review => {
            ratingDistribution[review.rating]++;
        });

        return {
            reviews: reviewsWithUser,
            stats: {
                totalReviews,
                averageRating: Math.round(averageRating * 10) / 10,
                ratingDistribution
            }
        };
    }

    async getUserReviews(userId: string): Promise<Review[]> {
        return await this.reviewRepository.find({
            where: { userId },
            relations: ['workshop'],
            order: { createdAt: 'DESC' }
        });
    }

    async updateReview(id: string, userId: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
        const review = await this.reviewRepository.findOne({
            where: { id },
            relations: ['user']
        });

        if (!review) {
            throw new NotFoundException('Review não encontrado');
        }

        if (review.userId !== userId) {
            throw new ForbiddenException('Você só pode editar suas próprias avaliações');
        }

        if (updateReviewDto.rating && (updateReviewDto.rating < 1 || updateReviewDto.rating > 5)) {
            throw new BadRequestException('Rating deve estar entre 1 e 5');
        }

        Object.assign(review, updateReviewDto);
        return await this.reviewRepository.save(review);
    }

    async deleteReview(id: string, userId: string): Promise<void> {
        const review = await this.reviewRepository.findOne({
            where: { id }
        });

        if (!review) {
            throw new NotFoundException('Review não encontrado');
        }

        if (review.userId !== userId) {
            throw new ForbiddenException('Você só pode deletar suas próprias avaliações');
        }

        await this.reviewRepository.remove(review);
    }

    async getTopRatedWorkshops(limit: number = 10): Promise<any[]> {
        const result = await this.reviewRepository
            .createQueryBuilder('review')
            .select('review.workshopId', 'workshopId')
            .addSelect('AVG(review.rating)', 'averageRating')
            .addSelect('COUNT(review.id)', 'totalReviews')
            .groupBy('review.workshopId')
            .having('COUNT(review.id) >= 3') // Mínimo 3 reviews
            .orderBy('AVG(review.rating)', 'DESC')
            .addOrderBy('COUNT(review.id)', 'DESC')
            .limit(limit)
            .getRawMany();

        return result.map(item => ({
            workshopId: item.workshopId,
            averageRating: Math.round(parseFloat(item.averageRating) * 10) / 10,
            totalReviews: parseInt(item.totalReviews)
        }));
    }
}
