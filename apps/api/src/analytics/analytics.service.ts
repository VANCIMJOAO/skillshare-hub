import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop } from '../workshops/entities/workshop.entity';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../workshops/entities/enrollment.entity';

export interface DashboardMetrics {
    totalUsers: number;
    totalWorkshops: number;
    totalEnrollments: number;
    activeWorkshops: number;
    revenue: number;
    userGrowth: number;
    workshopGrowth: number;
    popularCategories: Array<{ category: string; count: number; percentage: number }>;
    revenueByMonth: Array<{ month: string; revenue: number; enrollments: number }>;
    usersByRole: Array<{ role: string; count: number; percentage: number }>;
    topInstructors: Array<{
        instructor: string;
        workshopsCount: number;
        enrollmentsCount: number;
        revenue: number
    }>;
    enrollmentTrends: Array<{ date: string; enrollments: number; revenue: number }>;
}

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Workshop)
        private readonly workshopRepository: Repository<Workshop>,
        @InjectRepository(Enrollment)
        private readonly enrollmentRepository: Repository<Enrollment>,
    ) { }

    async getDashboardMetrics(): Promise<DashboardMetrics> {
        try {
            const [
                totalUsers,
                totalWorkshops,
                totalEnrollments,
                activeWorkshops,
                revenue,
                userGrowth,
                workshopGrowth,
                popularCategories,
                revenueByMonth,
                usersByRole,
                topInstructors,
                enrollmentTrends
            ] = await Promise.all([
                this.getTotalUsers(),
                this.getTotalWorkshops(),
                this.getTotalEnrollments(),
                this.getActiveWorkshops(),
                this.getTotalRevenue(),
                this.getUserGrowth(),
                this.getWorkshopGrowth(),
                this.getPopularCategories(),
                this.getRevenueByMonth(),
                this.getUsersByRole(),
                this.getTopInstructors(),
                this.getEnrollmentTrends()
            ]);

            return {
                totalUsers,
                totalWorkshops,
                totalEnrollments,
                activeWorkshops,
                revenue,
                userGrowth,
                workshopGrowth,
                popularCategories,
                revenueByMonth,
                usersByRole,
                topInstructors,
                enrollmentTrends
            };
        } catch (error) {
            this.logger.error('Error generating dashboard metrics', error);
            throw error;
        }
    }

    private async getTotalUsers(): Promise<number> {
        return this.userRepository.count();
    }

    private async getTotalWorkshops(): Promise<number> {
        return this.workshopRepository.count();
    }

    private async getTotalEnrollments(): Promise<number> {
        return this.enrollmentRepository.count();
    }

    private async getActiveWorkshops(): Promise<number> {
        const now = new Date();
        return this.workshopRepository
            .createQueryBuilder('workshop')
            .where('workshop.startsAt > :now', { now })
            .getCount();
    }

    private async getTotalRevenue(): Promise<number> {
        const result = await this.workshopRepository
            .createQueryBuilder('workshop')
            .leftJoin('workshop.enrollments', 'enrollment')
            .select('SUM(workshop.price)', 'total')
            .where('enrollment.id IS NOT NULL')
            .getRawOne();

        return parseFloat(result?.total || '0');
    }

    private async getUserGrowth(): Promise<number> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [totalUsers, newUsers] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.count({
                where: {
                    createdAt: { $gte: thirtyDaysAgo } as any
                }
            })
        ]);

        return totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0;
    }

    private async getWorkshopGrowth(): Promise<number> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [totalWorkshops, newWorkshops] = await Promise.all([
            this.workshopRepository.count(),
            this.workshopRepository.count({
                where: {
                    createdAt: { $gte: thirtyDaysAgo } as any
                }
            })
        ]);

        return totalWorkshops > 0 ? (newWorkshops / totalWorkshops) * 100 : 0;
    }

    private async getPopularCategories(): Promise<Array<{ category: string; count: number; percentage: number }>> {
        const categories = await this.workshopRepository
            .createQueryBuilder('workshop')
            .leftJoin('workshop.owner', 'owner')
            .select('owner.name', 'category')
            .addSelect('COUNT(*)', 'count')
            .groupBy('owner.name')
            .orderBy('count', 'DESC')
            .limit(5)
            .getRawMany();

        const totalWorkshops = await this.getTotalWorkshops();

        return categories.map(cat => ({
            category: cat.category || 'Sem categoria',
            count: parseInt(cat.count),
            percentage: totalWorkshops > 0 ? (cat.count / totalWorkshops) * 100 : 0
        }));
    }

    private async getRevenueByMonth(): Promise<Array<{ month: string; revenue: number; enrollments: number }>> {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyData = await this.enrollmentRepository
            .createQueryBuilder('enrollment')
            .leftJoin('enrollment.workshop', 'workshop')
            .select("DATE_TRUNC('month', enrollment.createdAt)", 'month')
            .addSelect('SUM(workshop.price)', 'revenue')
            .addSelect('COUNT(*)', 'enrollments')
            .where('enrollment.createdAt >= :date', { date: sixMonthsAgo })
            .groupBy("DATE_TRUNC('month', enrollment.createdAt)")
            .orderBy('month')
            .getRawMany();

        return monthlyData.map(data => ({
            month: new Date(data.month).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'short'
            }),
            revenue: parseFloat(data.revenue || '0'),
            enrollments: parseInt(data.enrollments)
        }));
    }

    private async getUsersByRole(): Promise<Array<{ role: string; count: number; percentage: number }>> {
        const roleData = await this.userRepository
            .createQueryBuilder('user')
            .select('user.role', 'role')
            .addSelect('COUNT(*)', 'count')
            .groupBy('user.role')
            .getRawMany();

        const totalUsers = await this.getTotalUsers();

        return roleData.map(data => ({
            role: data.role,
            count: parseInt(data.count),
            percentage: totalUsers > 0 ? (data.count / totalUsers) * 100 : 0
        }));
    }

    private async getTopInstructors(): Promise<Array<{
        instructor: string;
        workshopsCount: number;
        enrollmentsCount: number;
        revenue: number
    }>> {
        const instructorData = await this.userRepository
            .createQueryBuilder('user')
            .leftJoin('user.workshops', 'workshop')
            .leftJoin('workshop.enrollments', 'enrollment')
            .select('user.name', 'instructor')
            .addSelect('COUNT(DISTINCT workshop.id)', 'workshopsCount')
            .addSelect('COUNT(enrollment.id)', 'enrollmentsCount')
            .addSelect('SUM(workshop.price)', 'revenue')
            .where('user.role = :role', { role: 'INSTRUCTOR' })
            .groupBy('user.id')
            .orderBy('enrollmentsCount', 'DESC')
            .limit(5)
            .getRawMany();

        return instructorData.map(data => ({
            instructor: data.instructor,
            workshopsCount: parseInt(data.workshopsCount),
            enrollmentsCount: parseInt(data.enrollmentsCount),
            revenue: parseFloat(data.revenue || '0')
        }));
    }

    private async getEnrollmentTrends(): Promise<Array<{ date: string; enrollments: number; revenue: number }>> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const trendsData = await this.enrollmentRepository
            .createQueryBuilder('enrollment')
            .leftJoin('enrollment.workshop', 'workshop')
            .select("DATE_TRUNC('day', enrollment.createdAt)", 'date')
            .addSelect('COUNT(*)', 'enrollments')
            .addSelect('SUM(workshop.price)', 'revenue')
            .where('enrollment.createdAt >= :date', { date: thirtyDaysAgo })
            .groupBy("DATE_TRUNC('day', enrollment.createdAt)")
            .orderBy('date')
            .getRawMany();

        return trendsData.map(data => ({
            date: new Date(data.date).toISOString().split('T')[0],
            enrollments: parseInt(data.enrollments),
            revenue: parseFloat(data.revenue || '0')
        }));
    }

    async getWorkshopAnalytics(workshopId: string) {
        const workshop = await this.workshopRepository
            .createQueryBuilder('workshop')
            .leftJoinAndSelect('workshop.enrollments', 'enrollment')
            .leftJoinAndSelect('enrollment.user', 'user')
            .where('workshop.id = :id', { id: workshopId })
            .getOne();

        if (!workshop) {
            throw new Error('Workshop not found');
        }

        const enrollmentsByDay = await this.enrollmentRepository
            .createQueryBuilder('enrollment')
            .select("DATE_TRUNC('day', enrollment.createdAt)", 'date')
            .addSelect('COUNT(*)', 'count')
            .where('enrollment.workshopId = :workshopId', { workshopId })
            .groupBy("DATE_TRUNC('day', enrollment.createdAt)")
            .orderBy('date')
            .getRawMany();

        return {
            workshop: {
                id: workshop.id,
                title: workshop.title,
                totalEnrollments: workshop.enrollments?.length || 0,
                revenue: (workshop.enrollments?.length || 0) * workshop.price,
                enrollmentRate: workshop.maxParticipants
                    ? ((workshop.enrollments?.length || 0) / workshop.maxParticipants) * 100
                    : 100
            },
            enrollmentTrend: enrollmentsByDay.map(day => ({
                date: new Date(day.date).toISOString().split('T')[0],
                enrollments: parseInt(day.count)
            })),
            demographics: {
                studentRoles: workshop.enrollments?.reduce((acc, enrollment) => {
                    const role = enrollment.user?.role || 'unknown';
                    acc[role] = (acc[role] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>) || {}
            }
        };
    }
}
