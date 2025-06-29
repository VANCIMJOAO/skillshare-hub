// apps/api/src/reviews/reviews.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    HttpStatus,
    HttpException
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewsService, CreateReviewDto, UpdateReviewDto } from './reviews.service';

@ApiTags('reviews')
@Controller('api/reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @ApiOperation({
        summary: 'Criar nova avaliação',
        description: 'Cria uma nova avaliação para um workshop'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                workshopId: { type: 'string', format: 'uuid' },
                rating: { type: 'integer', minimum: 1, maximum: 5 },
                comment: { type: 'string' }
            },
            required: ['workshopId', 'rating']
        }
    })
    @ApiResponse({ status: 201, description: 'Avaliação criada com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos ou usuário já avaliou' })
    @ApiResponse({ status: 404, description: 'Workshop não encontrado' })
    async createReview(@Request() req: any, @Body() createReviewDto: CreateReviewDto) {
        try {
            const review = await this.reviewsService.createReview(req.user.id, createReviewDto);
            return {
                success: true,
                data: review,
                message: 'Avaliação criada com sucesso'
            };
        } catch (error) {
            throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('workshop/:workshopId')
    @ApiOperation({
        summary: 'Obter avaliações de um workshop',
        description: 'Retorna todas as avaliações de um workshop com estatísticas'
    })
    @ApiParam({ name: 'workshopId', description: 'ID do workshop' })
    @ApiResponse({
        status: 200,
        description: 'Avaliações obtidas com sucesso',
        schema: {
            type: 'object',
            properties: {
                reviews: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            rating: { type: 'integer' },
                            comment: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            user: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    email: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                stats: {
                    type: 'object',
                    properties: {
                        totalReviews: { type: 'integer' },
                        averageRating: { type: 'number' },
                        ratingDistribution: { type: 'object' }
                    }
                }
            }
        }
    })
    async getWorkshopReviews(@Param('workshopId') workshopId: string) {
        try {
            const result = await this.reviewsService.getWorkshopReviews(workshopId);
            return {
                success: true,
                data: result
            };
        } catch (error) {
            throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('user/my-reviews')
    @ApiOperation({
        summary: 'Obter avaliações do usuário logado',
        description: 'Retorna todas as avaliações feitas pelo usuário autenticado'
    })
    @ApiResponse({ status: 200, description: 'Avaliações do usuário obtidas com sucesso' })
    async getUserReviews(@Request() req: any) {
        try {
            const reviews = await this.reviewsService.getUserReviews(req.user.id);
            return {
                success: true,
                data: reviews
            };
        } catch (error) {
            throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Atualizar avaliação',
        description: 'Atualiza uma avaliação existente do usuário'
    })
    @ApiParam({ name: 'id', description: 'ID da avaliação' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                rating: { type: 'integer', minimum: 1, maximum: 5 },
                comment: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Avaliação atualizada com sucesso' })
    @ApiResponse({ status: 403, description: 'Não autorizado a editar esta avaliação' })
    @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
    async updateReview(
        @Param('id') id: string,
        @Request() req: any,
        @Body() updateReviewDto: UpdateReviewDto
    ) {
        try {
            const review = await this.reviewsService.updateReview(id, req.user.id, updateReviewDto);
            return {
                success: true,
                data: review,
                message: 'Avaliação atualizada com sucesso'
            };
        } catch (error) {
            throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Deletar avaliação',
        description: 'Remove uma avaliação do usuário'
    })
    @ApiParam({ name: 'id', description: 'ID da avaliação' })
    @ApiResponse({ status: 200, description: 'Avaliação removida com sucesso' })
    @ApiResponse({ status: 403, description: 'Não autorizado a deletar esta avaliação' })
    @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
    async deleteReview(@Param('id') id: string, @Request() req: any) {
        try {
            await this.reviewsService.deleteReview(id, req.user.id);
            return {
                success: true,
                message: 'Avaliação removida com sucesso'
            };
        } catch (error) {
            throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('top-rated')
    @ApiOperation({
        summary: 'Workshops mais bem avaliados',
        description: 'Retorna os workshops com melhor média de avaliações'
    })
    @ApiResponse({
        status: 200,
        description: 'Top workshops obtidos com sucesso',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    workshopId: { type: 'string' },
                    averageRating: { type: 'number' },
                    totalReviews: { type: 'integer' }
                }
            }
        }
    })
    async getTopRatedWorkshops() {
        try {
            const topWorkshops = await this.reviewsService.getTopRatedWorkshops();
            return {
                success: true,
                data: topWorkshops
            };
        } catch (error) {
            throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
