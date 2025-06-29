// apps/api/src/notifications/notifications.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { NotificationsFilterDto } from './dto/notifications-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getNotifications(
        @CurrentUser() user: User,
        @Query() filterDto: NotificationsFilterDto,
    ) {
        return this.notificationsService.getNotificationsForUser(
            user.id,
            filterDto,
        );
    }

    @Get('unread-count')
    async getUnreadCount(@CurrentUser() user: User) {
        const count = await this.notificationsService.getUnreadCount(user.id);
        return { unreadCount: count };
    }

    @Patch(':id/read')
    @HttpCode(HttpStatus.NO_CONTENT)
    async markAsRead(@CurrentUser() user: User, @Param('id') id: string) {
        await this.notificationsService.markAsRead(id, user.id);
    }

    @Patch('mark-all-read')
    @HttpCode(HttpStatus.NO_CONTENT)
    async markAllAsRead(@CurrentUser() user: User) {
        await this.notificationsService.markAllAsRead(user.id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteNotification(
        @Param('id') notificationId: string,
        @CurrentUser() user: User,
    ) {
        await this.notificationsService.deleteNotification(notificationId, user.id);
    }

    @Get('preferences')
    async getPreferences(@CurrentUser() user: User) {
        return this.notificationsService.getNotificationPreferences(user.id);
    }

    @Put('preferences')
    async updatePreferences(
        @CurrentUser() user: User,
        @Body() updateDto: UpdateNotificationPreferencesDto,
    ) {
        return this.notificationsService.updateNotificationPreferences(
            user.id,
            updateDto,
        );
    }

    // Admin only endpoint to create notifications
    @Post()
    async createNotification(@Body() createDto: CreateNotificationDto) {
        return this.notificationsService.createNotification(createDto);
    }

    // Test endpoints for development
    @Post('test/enrollment')
    async testEnrollmentNotification(
        @CurrentUser() user: User,
        @Body() body: { workshopTitle: string; workshopId: string },
    ) {
        await this.notificationsService.createWorkshopEnrollmentNotification(
            user.id,
            body.workshopTitle,
            body.workshopId,
        );
        return { message: 'Test notification sent' };
    }

    @Post('test/reminder')
    async testReminderNotification(
        @CurrentUser() user: User,
        @Body() body: { workshopTitle: string; workshopId: string },
    ) {
        await this.notificationsService.createWorkshopReminderNotification(
            user.id,
            body.workshopTitle,
            body.workshopId,
            new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        );
        return { message: 'Test reminder sent' };
    }
}
