// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReviewsModule } from './reviews/reviews.module';
import { HealthModule } from './health/health.module';
import { ChatModule } from './chat/chat.module';
import { CacheAppModule } from './cache/cache.module';
import { PaymentsModule } from './payments/payments.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { User } from './users/entities/user.entity';
import { Workshop } from './workshops/entities/workshop.entity';
import { Enrollment } from './workshops/entities/enrollment.entity';
import { Notification } from './notifications/entities/notification.entity';
import { NotificationPreferences } from './notifications/entities/notification-preferences.entity';
import { Review } from './reviews/entities/review.entity';
import { ChatMessage } from './chat/entities/chat-message.entity';
import { Payment } from './payments/entities/payment.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get<string>('DATABASE_URL'),
                entities: [User, Workshop, Enrollment, Notification, NotificationPreferences, Review, ChatMessage, Payment],
                synchronize: false, // Produção: tabelas já criadas
                logging: configService.get('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
        }),

        AuthModule,
        UsersModule,
        WorkshopsModule,
        EnrollmentsModule,
        MailModule,
        UploadModule,
        NotificationsModule,
        AnalyticsModule,
        ReviewsModule,
        HealthModule,
        ChatModule,
        CacheAppModule,
        PaymentsModule,

        // Rate limiting
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000,
                limit: 10,
            },
            {
                name: 'medium',
                ttl: 10000,
                limit: 20
            },
            {
                name: 'long',
                ttl: 60000,
                limit: 100
            }
        ]),
    ],
})
export class AppModule { }
