import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entities/user.entity';

describe('UsersController', () => {
    let controller: UsersController;
    let usersService: jest.Mocked<UsersService>;

    const mockUsersService = {
        findAll: jest.fn(),
    };

    const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.STUDENT,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockAdminUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<UsersController>(UsersController);
        usersService = module.get<UsersService>(UsersService) as jest.Mocked<UsersService>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const mockUsers = [mockUser, mockAdminUser];

            mockUsersService.findAll.mockResolvedValue(mockUsers);

            const result = await controller.findAll();

            expect(usersService.findAll).toHaveBeenCalled();
            expect(result).toEqual({
                data: mockUsers,
                meta: {
                    total: mockUsers.length,
                },
            });
        });

        it('should return empty array when no users exist', async () => {
            const mockUsers = [];

            mockUsersService.findAll.mockResolvedValue(mockUsers);

            const result = await controller.findAll();

            expect(usersService.findAll).toHaveBeenCalled();
            expect(result).toEqual({
                data: mockUsers,
                meta: {
                    total: 0,
                },
            });
        });
    });
});
