// apps/api/src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/entities/user.entity';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;
    let configService: ConfigService;

    const mockUsersService = {
        create: jest.fn(),
        findByEmail: jest.fn(),
        findById: jest.fn(),
        validatePassword: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
        signAsync: jest.fn(),
        verify: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn(),
    };

    const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@test.com',
        role: UserRole.STUDENT,
        passwordHash: 'hashedPassword',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
        configService = module.get<ConfigService>(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const registerDto: RegisterDto = {
                name: 'New User',
                email: 'new@test.com',
                password: 'password123',
                role: UserRole.STUDENT,
            };

            const createdUser = { ...mockUser, ...registerDto };
            const tokens = {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            };

            mockUsersService.create.mockResolvedValue(createdUser);
            mockJwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
            mockConfigService.get.mockReturnValue('secret');

            const result = await service.register(registerDto);

            expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
            expect(result).toEqual({
                user: {
                    id: createdUser.id,
                    name: createdUser.name,
                    email: createdUser.email,
                    role: createdUser.role,
                },
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            });
        });

        it('should throw BadRequestException when user creation fails', async () => {
            const registerDto: RegisterDto = {
                name: 'New User',
                email: 'existing@test.com',
                password: 'password123',
                role: UserRole.STUDENT,
            };

            mockUsersService.create.mockRejectedValue(new Error('Email already exists'));

            await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            const loginDto: LoginDto = {
                email: 'test@test.com',
                password: 'password123',
            };

            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            mockUsersService.validatePassword.mockResolvedValue(true);
            mockJwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
            mockConfigService.get.mockReturnValue('secret');

            const result = await service.login(loginDto);

            expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
            expect(mockUsersService.validatePassword).toHaveBeenCalledWith(mockUser, loginDto.password);
            expect(result).toEqual({
                user: {
                    id: mockUser.id,
                    name: mockUser.name,
                    email: mockUser.email,
                    role: mockUser.role,
                },
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            });
        });

        it('should throw UnauthorizedException for invalid email', async () => {
            const loginDto: LoginDto = {
                email: 'invalid@test.com',
                password: 'password123',
            };

            mockUsersService.findByEmail.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            expect(mockUsersService.validatePassword).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException for invalid password', async () => {
            const loginDto: LoginDto = {
                email: 'test@test.com',
                password: 'wrongpassword',
            };

            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            mockUsersService.validatePassword.mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('refresh', () => {
        it('should refresh tokens successfully', async () => {
            const refreshToken = 'valid-refresh-token';
            const payload = { sub: 'user-1', email: 'test@test.com' };

            mockJwtService.verify.mockReturnValue(payload);
            mockUsersService.findById.mockResolvedValue(mockUser);
            mockJwtService.signAsync.mockResolvedValueOnce('new-access-token').mockResolvedValueOnce('new-refresh-token');
            mockConfigService.get.mockReturnValue('refresh-secret');

            const result = await service.refresh(refreshToken);

            expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken, {
                secret: 'refresh-secret',
            });
            expect(mockUsersService.findById).toHaveBeenCalledWith(payload.sub);
            expect(result).toEqual({
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
            });
        });

        it('should throw UnauthorizedException for invalid refresh token', async () => {
            const refreshToken = 'invalid-refresh-token';

            mockJwtService.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
        });
    });
});
