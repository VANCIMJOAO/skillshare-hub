// apps/api/src/enrollments/enrollments.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../workshops/entities/enrollment.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EnrollmentsService {
    constructor(
        @InjectRepository(Enrollment)
        private readonly enrollmentRepository: Repository<Enrollment>,
        @InjectRepository(Workshop)
        private readonly workshopRepository: Repository<Workshop>,
        private readonly notificationsService: NotificationsService,
    ) { }

    async enroll(workshopId: string, userId: string): Promise<Enrollment> {
        // Verificar se o workshop existe
        const workshop = await this.workshopRepository.findOne({
            where: { id: workshopId },
            relations: ['enrollments'],
        });

        if (!workshop) {
            throw new NotFoundException('Workshop not found');
        }

        // Verificar se o usuário já está inscrito
        const existingEnrollment = await this.enrollmentRepository.findOne({
            where: {
                workshopId,
                userId,
            },
        });

        if (existingEnrollment) {
            throw new ConflictException('User is already enrolled in this workshop');
        }

        // Verificar se o usuário é o próprio instrutor
        if (workshop.ownerId === userId) {
            throw new BadRequestException('Instructors cannot enroll in their own workshops');
        }

        // Verificar se há vagas disponíveis
        const currentEnrollments = workshop.enrollments?.length || 0;
        if (workshop.maxParticipants && currentEnrollments >= workshop.maxParticipants) {
            throw new ConflictException('Workshop is full');
        }

        // Verificar se o workshop já passou
        if (new Date(workshop.startsAt) < new Date()) {
            throw new BadRequestException('Cannot enroll in past workshops');
        }

        // Criar inscrição
        const enrollment = this.enrollmentRepository.create({
            workshopId,
            userId,
        });

        const savedEnrollment = await this.enrollmentRepository.save(enrollment);

        // Enviar notificação de confirmação de inscrição
        await this.notificationsService.createWorkshopEnrollmentNotification(
            userId,
            workshop.title,
            workshopId,
        );

        return savedEnrollment;
    }

    async unenroll(workshopId: string, userId: string): Promise<void> {
        const enrollment = await this.enrollmentRepository.findOne({
            where: {
                workshopId,
                userId,
            },
            relations: ['workshop'],
        });

        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        // Verificar se o workshop já começou (não permitir cancelamento)
        if (new Date(enrollment.workshop.startsAt) < new Date()) {
            throw new BadRequestException('Cannot unenroll from workshops that have already started');
        }

        await this.enrollmentRepository.remove(enrollment);
    }

    async findUserEnrollments(userId: string): Promise<Enrollment[]> {
        return this.enrollmentRepository.find({
            where: { userId },
            relations: ['workshop', 'workshop.owner'],
            order: { createdAt: 'DESC' },
        });
    }

    async findWorkshopEnrollments(workshopId: string): Promise<Enrollment[]> {
        return this.enrollmentRepository.find({
            where: { workshopId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async isUserEnrolled(workshopId: string, userId: string): Promise<boolean> {
        const enrollment = await this.enrollmentRepository.findOne({
            where: {
                workshopId,
                userId,
            },
        });

        return !!enrollment;
    }

    async getEnrollmentStats(workshopId: string): Promise<{
        totalEnrollments: number;
        availableSpots: number;
        isFull: boolean;
    }> {
        const workshop = await this.workshopRepository.findOne({
            where: { id: workshopId },
            relations: ['enrollments'],
        });

        if (!workshop) {
            throw new NotFoundException('Workshop not found');
        }

        const totalEnrollments = workshop.enrollments?.length || 0;
        const maxParticipants = workshop.maxParticipants || Infinity;
        const availableSpots = Math.max(0, maxParticipants - totalEnrollments);
        const isFull = totalEnrollments >= maxParticipants;

        return {
            totalEnrollments,
            availableSpots,
            isFull,
        };
    }
}
