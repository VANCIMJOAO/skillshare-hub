// apps/api/src/notifications/dto/notifications-filter.dto.ts
import { IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationStatus, NotificationPriority } from '../entities/notification.entity';

export class NotificationsFilterDto {
    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @IsOptional()
    @IsEnum(NotificationStatus)
    status?: NotificationStatus;

    @IsOptional()
    @IsEnum(NotificationPriority)
    priority?: NotificationPriority;

    @IsOptional()
    @IsDateString()
    fromDate?: string;

    @IsOptional()
    @IsDateString()
    toDate?: string;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    unreadOnly?: boolean;

    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    limit?: number = 20;
}
