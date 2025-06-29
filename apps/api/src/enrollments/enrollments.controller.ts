// apps/api/src/enrollments/enrollments.controller.ts
import {
    Controller,
    Post,
    Delete,
    Get,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentsService) { }

    @Post(':workshopId')
    @HttpCode(HttpStatus.CREATED)
    async enroll(
        @Param('workshopId') workshopId: string,
        @CurrentUser() user: User,
    ): Promise<ApiResponse<any>> {
        const enrollment = await this.enrollmentsService.enroll(workshopId, user.id);

        return {
            data: enrollment,
            message: 'Successfully enrolled in workshop',
        };
    }

    @Delete(':workshopId')
    @HttpCode(HttpStatus.OK)
    async unenroll(
        @Param('workshopId') workshopId: string,
        @CurrentUser() user: User,
    ): Promise<ApiResponse<null>> {
        await this.enrollmentsService.unenroll(workshopId, user.id);

        return {
            data: null,
            message: 'Successfully unenrolled from workshop',
        };
    }

    @Get('my')
    async getMyEnrollments(@CurrentUser() user: User): Promise<ApiResponse<any[]>> {
        const enrollments = await this.enrollmentsService.findUserEnrollments(user.id);

        return {
            data: enrollments,
        };
    }

    @Get('workshop/:workshopId')
    async getWorkshopEnrollments(
        @Param('workshopId') workshopId: string,
    ): Promise<ApiResponse<any[]>> {
        const enrollments = await this.enrollmentsService.findWorkshopEnrollments(workshopId);

        return {
            data: enrollments,
        };
    }

    @Get('check/:workshopId')
    async checkEnrollment(
        @Param('workshopId') workshopId: string,
        @CurrentUser() user: User,
    ): Promise<ApiResponse<{ isEnrolled: boolean }>> {
        const isEnrolled = await this.enrollmentsService.isUserEnrolled(workshopId, user.id);

        return {
            data: { isEnrolled },
        };
    }

    @Get('stats/:workshopId')
    async getEnrollmentStats(
        @Param('workshopId') workshopId: string,
    ): Promise<ApiResponse<any>> {
        const stats = await this.enrollmentsService.getEnrollmentStats(workshopId);

        return {
            data: stats,
        };
    }
}
