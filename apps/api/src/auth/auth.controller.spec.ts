import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: jest.Mocked<AuthService>;

    const mockAuthService = {
        login: jest.fn(),
        register: jest.fn(),
        refresh: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(ThrottlerGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService) as jest.Mocked<AuthService>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const mockResult = {
                access_token: 'jwt-token',
                user: {
                    id: '1',
                    email: 'test@example.com',
                    name: 'Test User',
                },
            };

            mockAuthService.login.mockResolvedValue(mockResult);

            const result = await controller.login(loginDto);

            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(result).toEqual({
                data: mockResult,
            });
        });
    });

    describe('register', () => {
        it('should register user successfully', async () => {
            const registerDto: RegisterDto = {
                email: 'newuser@example.com',
                password: 'password123',
                name: 'New User',
            };

            const mockResult = {
                access_token: 'jwt-token',
                user: {
                    id: '2',
                    email: 'newuser@example.com',
                    name: 'New User',
                },
            };

            mockAuthService.register.mockResolvedValue(mockResult);

            const result = await controller.register(registerDto);

            expect(authService.register).toHaveBeenCalledWith(registerDto);
            expect(result).toEqual({
                data: mockResult,
            });
        });
    });

    describe('refresh', () => {
        it('should refresh token successfully', async () => {
            const refreshToken = 'refresh-token';
            const mockResult = {
                access_token: 'new-jwt-token',
                refresh_token: 'new-refresh-token',
            };

            mockAuthService.refresh.mockResolvedValue(mockResult);

            const result = await controller.refresh(refreshToken);

            expect(authService.refresh).toHaveBeenCalledWith(refreshToken);
            expect(result).toEqual({
                data: mockResult,
            });
        });
    });

    describe('getProfile', () => {
        it('should return user profile', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                role: 'USER',
            };

            const result = await controller.getProfile(mockUser);

            expect(result).toEqual({
                data: mockUser,
            });
        });
    });
});
