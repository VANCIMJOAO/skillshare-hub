// apps/api/src/notifications/notifications.scheduler.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Workshop } from '../workshops/entities/workshop.entity';
import { Enrollment } from '../workshops/entities/enrollment.entity';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
    private readonly logger = new Logger(NotificationsScheduler.name);

    constructor(
        @InjectRepository(Workshop)
        private workshopRepository: Repository<Workshop>,
        @InjectRepository(Enrollment)
        private enrollmentRepository: Repository<Enrollment>,
        private notificationsService: NotificationsService,
    ) { }

    // Envia lembretes para workshops que começam em 24 horas
    @Cron(CronExpression.EVERY_HOUR)
    async sendWorkshopReminders() {
        this.logger.debug('Checking for workshops that need reminders...');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

        // Buscar workshops que começam nas próximas 24 horas
        const upcomingWorkshops = await this.workshopRepository
            .createQueryBuilder('workshop')
            .where('workshop.startsAt > :tomorrow', { tomorrow })
            .andWhere('workshop.startsAt < :dayAfterTomorrow', { dayAfterTomorrow })
            .leftJoinAndSelect('workshop.enrollments', 'enrollments')
            .getMany();

        this.logger.debug(`Found ${upcomingWorkshops.length} workshops starting tomorrow`);

        for (const workshop of upcomingWorkshops) {
            const enrollments = await this.enrollmentRepository.find({
                where: { workshopId: workshop.id },
                relations: ['user'],
            });

            for (const enrollment of enrollments) {
                try {
                    await this.notificationsService.createWorkshopReminderNotification(
                        enrollment.userId,
                        workshop.title,
                        workshop.id,
                        workshop.startsAt,
                    );

                    this.logger.debug(
                        `Sent reminder for workshop "${workshop.title}" to user ${enrollment.userId}`,
                    );
                } catch (error) {
                    this.logger.error(
                        `Failed to send reminder for workshop "${workshop.title}" to user ${enrollment.userId}`,
                        error,
                    );
                }
            }
        }
    }

    // Limpa notificações antigas (mais de 30 dias)
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupOldNotifications() {
        this.logger.debug('Cleaning up old notifications...');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        try {
            const deletedCount = await this.notificationsService.deleteOldNotifications(thirtyDaysAgo);
            this.logger.debug(`Cleaned up ${deletedCount} old notifications`);
        } catch (error) {
            this.logger.error('Failed to cleanup old notifications', error);
        }
    }
}
