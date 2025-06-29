// apps/api/src/notifications/dto/update-notification-preferences.dto.ts
import { IsBoolean, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdateNotificationPreferencesDto {
    // Email notifications
    @IsOptional()
    @IsBoolean()
    emailEnabled?: boolean;

    @IsOptional()
    @IsBoolean()
    emailWorkshopReminders?: boolean;

    @IsOptional()
    @IsBoolean()
    emailEnrollmentConfirmations?: boolean;

    @IsOptional()
    @IsBoolean()
    emailWorkshopUpdates?: boolean;

    @IsOptional()
    @IsBoolean()
    emailNewWorkshops?: boolean;

    @IsOptional()
    @IsBoolean()
    emailMarketingUpdates?: boolean;

    // Push notifications
    @IsOptional()
    @IsBoolean()
    pushEnabled?: boolean;

    @IsOptional()
    @IsBoolean()
    pushWorkshopReminders?: boolean;

    @IsOptional()
    @IsBoolean()
    pushEnrollmentConfirmations?: boolean;

    @IsOptional()
    @IsBoolean()
    pushWorkshopUpdates?: boolean;

    @IsOptional()
    @IsBoolean()
    pushNewWorkshops?: boolean;

    // In-app notifications
    @IsOptional()
    @IsBoolean()
    inAppEnabled?: boolean;

    @IsOptional()
    @IsBoolean()
    inAppWorkshopReminders?: boolean;

    @IsOptional()
    @IsBoolean()
    inAppEnrollmentConfirmations?: boolean;

    @IsOptional()
    @IsBoolean()
    inAppWorkshopUpdates?: boolean;

    @IsOptional()
    @IsBoolean()
    inAppNewWorkshops?: boolean;

    @IsOptional()
    @IsBoolean()
    inAppSystemAnnouncements?: boolean;

    // Frequency settings
    @IsOptional()
    @IsString()
    reminderFrequency?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(168) // Max 1 week
    reminderHoursBefore?: number;
}
