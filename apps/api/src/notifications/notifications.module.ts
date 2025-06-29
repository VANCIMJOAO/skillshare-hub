// apps/api/src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsScheduler } from './notifications.scheduler';
import { Notification } from './entities/notification.entity';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { User } from '../users/entities/user.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { Enrollment } from '../workshops/entities/enrollment.entity';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Notification,
            NotificationPreferences,
            User,
            Workshop,
            Enrollment
        ]),
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
        MailModule,
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService, NotificationsGateway, NotificationsScheduler],
    exports: [NotificationsService],
})
export class NotificationsModule { }
