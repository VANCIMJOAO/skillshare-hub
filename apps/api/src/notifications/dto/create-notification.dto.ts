// apps/api/src/notifications/dto/create-notification.dto.ts
import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsObject, IsUUID } from 'class-validator';
import { NotificationType, NotificationPriority } from '../entities/notification.entity';

export class CreateNotificationDto {
    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsEnum(NotificationType)
    type: NotificationType;

    @IsOptional()
    @IsEnum(NotificationPriority)
    priority?: NotificationPriority;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @IsOptional()
    @IsString()
    actionUrl?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsDateString()
    scheduledFor?: Date;

    @IsUUID()
    userId: string;

    @IsOptional()
    @IsBoolean()
    sendEmail?: boolean;

    @IsOptional()
    @IsBoolean()
    sendPush?: boolean;
}
