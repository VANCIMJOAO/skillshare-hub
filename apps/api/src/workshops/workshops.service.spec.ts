// apps/api/src/workshops/workshops.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkshopsService } from './workshops.service';
import { Workshop, WorkshopMode } from './entities/workshop.entity';
import { WorkshopsFilterDto } from './dto/workshops-filter.dto';
import { CacheService } from '../cache/cache.service';

describe('WorkshopsService', () => {
    let service: WorkshopsService;
    let repository: Repository<Workshop>;
    let cacheService: jest.Mocked<CacheService>;

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    const mockCacheService = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        getWorkshopListKey: jest.fn(() => 'cache-key'),
        getWorkshopKey: jest.fn(() => 'workshop-key'),
        invalidatePattern: jest.fn(),
    };

    const mockWorkshop: Partial<Workshop> = {
        id: '1',
        title: 'Test Workshop',
        description: 'Test Description',
        price: 99.99,
        mode: WorkshopMode.ONLINE,
        startsAt: new Date('2025-07-01'),
        endsAt: new Date('2025-07-01'),
        ownerId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WorkshopsService,
                {
                    provide: getRepositoryToken(Workshop),
                    useValue: mockRepository,
                },
                {
                    provide: CacheService,
                    useValue: mockCacheService,
                },
            ],
        }).compile();

        service = module.get<WorkshopsService>(WorkshopsService);
        repository = module.get<Repository<Workshop>>(getRepositoryToken(Workshop));
        cacheService = module.get<CacheService>(CacheService) as jest.Mocked<CacheService>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a workshop successfully', async () => {
            const createDto = {
                title: 'New Workshop',
                description: 'New Description',
                price: 199.99,
                mode: WorkshopMode.PRESENTIAL,
                startsAt: '2025-07-15',
                endsAt: '2025-07-15',
            };

            mockRepository.create.mockReturnValue(mockWorkshop);
            mockRepository.save.mockResolvedValue(mockWorkshop);

            const result = await service.create(createDto, 'user-1');

            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createDto,
                ownerId: 'user-1',
                startsAt: new Date(createDto.startsAt),
                endsAt: new Date(createDto.endsAt),
            });
            expect(mockRepository.save).toHaveBeenCalledWith(mockWorkshop);
            expect(result).toBe(mockWorkshop);
        });
    });

    describe('findOne', () => {
        it('should return a workshop when found in cache', async () => {
            mockCacheService.get.mockResolvedValue(mockWorkshop);

            const result = await service.findOne('1');

            expect(mockCacheService.getWorkshopKey).toHaveBeenCalledWith('1');
            expect(mockCacheService.get).toHaveBeenCalledWith('workshop-key');
            expect(result).toBe(mockWorkshop);
            expect(mockRepository.findOne).not.toHaveBeenCalled();
        });

        it('should return a workshop when found', async () => {
            mockCacheService.get.mockResolvedValue(null);
            mockRepository.findOne.mockResolvedValue(mockWorkshop);

            const result = await service.findOne('1');

            expect(mockCacheService.get).toHaveBeenCalled();
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: '1' },
                relations: ['owner', 'enrollments'],
            });
            expect(mockCacheService.set).toHaveBeenCalledWith('workshop-key', mockWorkshop, 600);
            expect(result).toBe(mockWorkshop);
        });

        it('should throw NotFoundException when workshop not found', async () => {
            mockCacheService.get.mockResolvedValue(null);
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow('Workshop not found');
        });
    });

    describe('findAll', () => {
        it('should return cached workshops when available', async () => {
            const filterDto: WorkshopsFilterDto = {
                page: 1,
                limit: 10,
            };

            const cachedResult = {
                data: [mockWorkshop],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
                },
            };

            mockCacheService.get.mockResolvedValue(cachedResult);

            const result = await service.findAll(filterDto);

            expect(mockCacheService.getWorkshopListKey).toHaveBeenCalledWith(filterDto);
            expect(mockCacheService.get).toHaveBeenCalledWith('cache-key');
            expect(result).toBe(cachedResult);
            expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
        });

        it('should return paginated workshops', async () => {
            const filterDto: WorkshopsFilterDto = {
                page: 1,
                limit: 10,
            };

            mockCacheService.get.mockResolvedValue(null);

            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([[mockWorkshop], 1]),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await service.findAll(filterDto);

            expect(mockCacheService.set).toHaveBeenCalledWith('cache-key', result, 300);
            expect(result).toEqual({
                data: [mockWorkshop],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
                },
            });
        });

        it('should apply search filter when provided', async () => {
            const filterDto: WorkshopsFilterDto = {
                page: 1,
                limit: 10,
                search: 'react',
            };

            mockCacheService.get.mockResolvedValue(null);

            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([[mockWorkshop], 1]),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await service.findAll(filterDto);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                '(LOWER(workshop.title) LIKE LOWER(:search) OR LOWER(workshop.description) LIKE LOWER(:search))',
                { search: '%react%' }
            );
        });

        it('should apply mode filter when provided', async () => {
            const filterDto: WorkshopsFilterDto = {
                page: 1,
                limit: 10,
                mode: WorkshopMode.ONLINE,
            };

            mockCacheService.get.mockResolvedValue(null);

            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([[mockWorkshop], 1]),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await service.findAll(filterDto);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                'workshop.mode = :mode',
                { mode: WorkshopMode.ONLINE }
            );
        });

        it('should apply price range filters when provided', async () => {
            const filterDto: WorkshopsFilterDto = {
                page: 1,
                limit: 10,
                minPrice: 50,
                maxPrice: 200,
            };

            mockCacheService.get.mockResolvedValue(null);

            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([[mockWorkshop], 1]),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await service.findAll(filterDto);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                'workshop.price >= :minPrice',
                { minPrice: 50 }
            );
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                'workshop.price <= :maxPrice',
                { maxPrice: 200 }
            );
        });
    });

    describe('getCategories', () => {
        it('should return list of categories', async () => {
            const mockQueryBuilder = {
                leftJoin: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([
                    { category: 'JavaScript' },
                    { category: 'Python' },
                    { category: null }, // Should be filtered out
                ]),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await service.getCategories();

            expect(result).toEqual(['JavaScript', 'Python']);
        });
    });

    describe('getPriceRange', () => {
        it('should return price range', async () => {
            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockResolvedValue({ min: '50.00', max: '300.00' }),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await service.getPriceRange();

            expect(result).toEqual({ min: 50, max: 300 });
        });

        it('should return default values when no workshops exist', async () => {
            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockResolvedValue({ min: null, max: null }),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await service.getPriceRange();

            expect(result).toEqual({ min: 0, max: 1000 });
        });
    });
});
