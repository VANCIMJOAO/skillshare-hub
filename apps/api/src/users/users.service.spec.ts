// apps/api/src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
    let service: UsersService;
    let repository: Repository<User>;

    const mockRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const createUserDto: CreateUserDto = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: UserRole.STUDENT,
            };

            const user = {
                id: '1',
                ...createUserDto,
                passwordHash: 'hashed_password',
                createdAt: new Date(),
                updatedAt: new Date(),
                workshops: [],
                enrollments: [],
                notifications: [],
                notificationPreferences: null,
            } as User;

            mockRepository.findOne.mockResolvedValue(null);
            mockRepository.create.mockReturnValue(user);
            mockRepository.save.mockResolvedValue(user);

            const result = await service.create(createUserDto);

            expect(result).toEqual(user);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { email: createUserDto.email },
            });
        });

        it('should throw ConflictException if email already exists', async () => {
            const createUserDto: CreateUserDto = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: UserRole.STUDENT,
            };

            mockRepository.findOne.mockResolvedValue({ id: '1' });

            await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
        });
    });
});
