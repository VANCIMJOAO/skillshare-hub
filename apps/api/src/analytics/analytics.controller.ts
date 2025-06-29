import { Controller, Get, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnalyticsService, DashboardMetrics } from './analytics.service';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('analytics')
@Controller('api/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
    private readonly logger = new Logger(AnalyticsController.name);

    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('dashboard')
    @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
    @ApiOperation({
        summary: 'Obter métricas do dashboard',
        description: 'Retorna métricas completas do dashboard incluindo usuários, workshops, inscrições e analytics'
    })
    @ApiResponse({
        status: 200,
        description: 'Métricas obtidas com sucesso',
        type: 'object'
    })
    @ApiResponse({
        status: 401,
        description: 'Não autorizado - token inválido'
    })
    @ApiResponse({
        status: 403,
        description: 'Acesso negado - role insuficiente'
    })
    @ApiResponse({
        status: 500,
        description: 'Erro interno do servidor'
    })
    async getDashboardMetrics(): Promise<DashboardMetrics> {
        try {
            this.logger.log('Fetching dashboard metrics');
            const metrics = await this.analyticsService.getDashboardMetrics();
            this.logger.log('Dashboard metrics fetched successfully');
            return metrics;
        } catch (error) {
            this.logger.error('Failed to fetch dashboard metrics', error.stack);
            throw new HttpException(
                'Failed to fetch dashboard metrics',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('health')
    @ApiOperation({
        summary: 'Health check do serviço analytics',
        description: 'Verifica se o serviço de analytics está funcionando'
    })
    @ApiResponse({
        status: 200,
        description: 'Serviço funcionando corretamente',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', format: 'date-time' },
                service: { type: 'string', example: 'analytics' }
            }
        }
    })
    getHealthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'analytics'
        };
    }
}
