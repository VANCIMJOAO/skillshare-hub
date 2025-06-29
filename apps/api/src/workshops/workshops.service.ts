// apps/api/src/workshops/workshops.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop } from './entities/workshop.entity';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { WorkshopsFilterDto } from './dto/workshops-filter.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class WorkshopsService {
    constructor(
        @InjectRepository(Workshop)
        private readonly workshopRepository: Repository<Workshop>,
        private readonly cacheService: CacheService,
    ) { }

    async create(createWorkshopDto: CreateWorkshopDto, ownerId: string): Promise<Workshop> {
        const workshop = this.workshopRepository.create({
            ...createWorkshopDto,
            ownerId,
            startsAt: new Date(createWorkshopDto.startsAt),
            endsAt: new Date(createWorkshopDto.endsAt),
        });

        return this.workshopRepository.save(workshop);
    }

    async findAll(filterDto: WorkshopsFilterDto) {
        // Try to get from cache first
        const cacheKey = this.cacheService.getWorkshopListKey(filterDto);
        const cachedResult = await this.cacheService.get(cacheKey);

        if (cachedResult) {
            return cachedResult;
        }

        const {
            page = 1,
            limit = 10,
            mode,
            search,
            category,
            minPrice,
            maxPrice,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
            availableOnly
        } = filterDto;

        const skip = (page - 1) * limit;

        const queryBuilder = this.workshopRepository
            .createQueryBuilder('workshop')
            .leftJoinAndSelect('workshop.owner', 'owner')
            .leftJoinAndSelect('workshop.enrollments', 'enrollments')
            .select([
                'workshop',
                'owner.id',
                'owner.name',
                'owner.email',
                'enrollments.id',
            ]);

        // Filtro por modo (online/presencial)
        if (mode) {
            queryBuilder.andWhere('workshop.mode = :mode', { mode });
        }

        // Busca por texto (título e descrição)
        if (search) {
            queryBuilder.andWhere(
                '(LOWER(workshop.title) LIKE LOWER(:search) OR LOWER(workshop.description) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }

        // Filtro por categoria/instrutor
        if (category) {
            queryBuilder.andWhere(
                'LOWER(owner.name) LIKE LOWER(:category)',
                { category: `%${category}%` }
            );
        }

        // Filtro por preço mínimo
        if (minPrice !== undefined) {
            queryBuilder.andWhere('workshop.price >= :minPrice', { minPrice });
        }

        // Filtro por preço máximo
        if (maxPrice !== undefined) {
            queryBuilder.andWhere('workshop.price <= :maxPrice', { maxPrice });
        }

        // Filtro por data de início
        if (startDate) {
            queryBuilder.andWhere('workshop.startsAt >= :startDate', { startDate });
        }

        // Filtro por data final
        if (endDate) {
            queryBuilder.andWhere('workshop.startsAt <= :endDate', { endDate });
        }

        // Apenas workshops com vagas disponíveis
        if (availableOnly) {
            queryBuilder.andWhere(
                '(workshop.maxParticipants IS NULL OR ' +
                '(SELECT COUNT(*) FROM enrollments e WHERE e.workshopId = workshop.id) < workshop.maxParticipants)'
            );
        }

        // Ordenação
        const sortField = sortBy === 'popularity' ?
            '(SELECT COUNT(*) FROM enrollments e WHERE e.workshopId = workshop.id)' :
            `workshop.${sortBy}`;

        queryBuilder.orderBy(sortField, sortOrder);

        const [workshops, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const result = {
            data: workshops,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };

        // Cache the result for 5 minutes
        await this.cacheService.set(cacheKey, result, 300);

        return result;
    }

    async findOne(id: string): Promise<Workshop> {
        // Try to get from cache first
        const cacheKey = this.cacheService.getWorkshopKey(id);
        const cachedWorkshop = await this.cacheService.get<Workshop>(cacheKey);

        if (cachedWorkshop) {
            return cachedWorkshop;
        }

        const workshop = await this.workshopRepository.findOne({
            where: { id },
            relations: ['owner', 'enrollments'],
        });

        if (!workshop) {
            throw new NotFoundException('Workshop not found');
        }

        // Cache the workshop for 10 minutes
        await this.cacheService.set(cacheKey, workshop, 600);

        return workshop;
    }

    async update(id: string, updateWorkshopDto: UpdateWorkshopDto, user: User): Promise<Workshop> {
        const workshop = await this.findOne(id);

        if (workshop.ownerId !== user.id && user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only update your own workshops');
        }

        const updateData: any = {};

        if (updateWorkshopDto.title !== undefined) {
            updateData.title = updateWorkshopDto.title;
        }
        if (updateWorkshopDto.description !== undefined) {
            updateData.description = updateWorkshopDto.description;
        }
        if (updateWorkshopDto.price !== undefined) {
            updateData.price = updateWorkshopDto.price;
        }
        if (updateWorkshopDto.mode !== undefined) {
            updateData.mode = updateWorkshopDto.mode;
        }
        if (updateWorkshopDto.location !== undefined) {
            updateData.location = updateWorkshopDto.location;
        }
        if (updateWorkshopDto.startsAt !== undefined) {
            updateData.startsAt = new Date(updateWorkshopDto.startsAt);
        }
        if (updateWorkshopDto.endsAt !== undefined) {
            updateData.endsAt = new Date(updateWorkshopDto.endsAt);
        }

        await this.workshopRepository.update(id, updateData);

        // Invalidate cache for this workshop and listings
        await this.cacheService.del(this.cacheService.getWorkshopKey(id));
        await this.cacheService.invalidatePattern('workshops:list');

        return this.findOne(id);
    }

    async remove(id: string, user: User): Promise<void> {
        const workshop = await this.findOne(id);

        if (workshop.ownerId !== user.id && user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only delete your own workshops');
        }

        await this.workshopRepository.delete(id);

        // Invalidate cache for this workshop and listings
        await this.cacheService.del(this.cacheService.getWorkshopKey(id));
        await this.cacheService.invalidatePattern('workshops:list');
    }

    async findByOwner(ownerId: string): Promise<Workshop[]> {
        return this.workshopRepository.find({
            where: { ownerId },
            relations: ['owner'],
            order: { createdAt: 'DESC' },
        });
    }

    // Método temporário para seed - criar workshops sem autenticação
    async createSeed(createWorkshopDto: CreateWorkshopDto): Promise<Workshop> {
        const workshop = this.workshopRepository.create({
            ...createWorkshopDto,
            ownerId: 'd0874715-df3f-4ea8-adab-e8142fcbd2a7', // ID do admin que criamos
            startsAt: new Date(createWorkshopDto.startsAt),
            endsAt: new Date(createWorkshopDto.endsAt),
        });

        return this.workshopRepository.save(workshop);
    }

    async getCategories(): Promise<string[]> {
        const result = await this.workshopRepository
            .createQueryBuilder('workshop')
            .leftJoin('workshop.owner', 'owner')
            .select('DISTINCT owner.name', 'category')
            .getRawMany();

        return result.map(item => item.category).filter(Boolean);
    }

    async getPriceRange(): Promise<{ min: number; max: number }> {
        const result = await this.workshopRepository
            .createQueryBuilder('workshop')
            .select('MIN(workshop.price)', 'min')
            .addSelect('MAX(workshop.price)', 'max')
            .getRawOne();

        return {
            min: parseFloat(result.min) || 0,
            max: parseFloat(result.max) || 1000,
        };
    }
}
