// apps/api/src/workshops/workshops.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopsController } from './workshops.controller';
import { WorkshopsService } from './workshops.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { WorkshopsFilterDto } from './dto/workshops-filter.dto';
import { WorkshopMode } from './entities/workshop.entity';

describe('WorkshopsController', () => {
    let controller: WorkshopsController;
    let service: WorkshopsService;

    const mockWorkshopsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        getCategories: jest.fn(),
        getPriceRange: jest.fn(),
        findByOwner: jest.fn(),
    };

    const mockWorkshop = {
        id: '1',
        title: 'Test Workshop',
        description: 'Test Description',
        price: 99.99,
        mode: WorkshopMode.ONLINE,
        startsAt: new Date('2025-07-01'),
        endsAt: new Date('2025-07-01'),
        ownerId: 'user-1',
    };

    const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        role: 'INSTRUCTOR',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WorkshopsController],
            providers: [
                {
                    provide: WorkshopsService,
                    useValue: mockWorkshopsService,
                },
            ],
        }).compile();

        controller = module.get<WorkshopsController>(WorkshopsController);
        service = module.get<WorkshopsService>(WorkshopsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a workshop successfully', async () => {
            const createDto: CreateWorkshopDto = {
                title: 'New Workshop',
                description: 'Description',
                price: 199.99,
                mode: WorkshopMode.ONLINE,
                startsAt: '2025-07-15',
                endsAt: '2025-07-15',
            };

            mockWorkshopsService.create.mockResolvedValue(mockWorkshop);

            const result = await controller.create(createDto, mockUser);

            expect(mockWorkshopsService.create).toHaveBeenCalledWith(createDto, mockUser.id);
            expect(result).toEqual({ data: mockWorkshop });
        });
    });

    describe('findAll', () => {
        it('should return paginated workshops', async () => {
            const filterDto: WorkshopsFilterDto = {
                page: 1,
                limit: 10,
            };

            const mockResult = {
                data: [mockWorkshop],
                meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
            };

            mockWorkshopsService.findAll.mockResolvedValue(mockResult);

            const result = await controller.findAll(filterDto);

            expect(mockWorkshopsService.findAll).toHaveBeenCalledWith(filterDto);
            expect(result).toEqual({
                data: mockResult.data,
                meta: mockResult.meta,
            });
        });

        it('should handle search filters', async () => {
            const filterDto: WorkshopsFilterDto = {
                page: 1,
                limit: 10,
                search: 'react',
                mode: WorkshopMode.ONLINE,
            };

            const mockResult = {
                data: [mockWorkshop],
                meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
            };

            mockWorkshopsService.findAll.mockResolvedValue(mockResult);

            const result = await controller.findAll(filterDto);

            expect(mockWorkshopsService.findAll).toHaveBeenCalledWith(filterDto);
            expect(result.data).toEqual(mockResult.data);
        });
    });

    describe('getCategories', () => {
        it('should return list of categories', async () => {
            const categories = ['JavaScript', 'Python', 'React'];
            mockWorkshopsService.getCategories.mockResolvedValue(categories);

            const result = await controller.getCategories();

            expect(mockWorkshopsService.getCategories).toHaveBeenCalled();
            expect(result).toEqual({ data: categories });
        });
    });

    describe('getPriceRange', () => {
        it('should return price range', async () => {
            const priceRange = { min: 50, max: 500 };
            mockWorkshopsService.getPriceRange.mockResolvedValue(priceRange);

            const result = await controller.getPriceRange();

            expect(mockWorkshopsService.getPriceRange).toHaveBeenCalled();
            expect(result).toEqual({ data: priceRange });
        });
    });

    describe('findOne', () => {
        it('should return a single workshop', async () => {
            mockWorkshopsService.findOne.mockResolvedValue(mockWorkshop);

            const result = await controller.findOne('1');

            expect(mockWorkshopsService.findOne).toHaveBeenCalledWith('1');
            expect(result).toEqual({ data: mockWorkshop });
        });
    });

    describe('findMyWorkshops', () => {
        it('should return user workshops', async () => {
            const userWorkshops = [mockWorkshop];
            mockWorkshopsService.findByOwner.mockResolvedValue(userWorkshops);

            const result = await controller.findMyWorkshops(mockUser);

            expect(mockWorkshopsService.findByOwner).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual({ data: userWorkshops });
        });
    });
});
