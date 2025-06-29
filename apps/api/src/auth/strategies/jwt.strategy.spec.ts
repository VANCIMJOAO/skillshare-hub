import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserRole } from '../../users/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-jwt-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object when payload is valid', async () => {
      const payload: JwtPayload = {
        sub: 'user-1',
        email: 'test@example.com',
        role: UserRole.STUDENT,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        role: UserRole.STUDENT,
      });
    });

    it('should handle instructor role', async () => {
      const payload: JwtPayload = {
        sub: 'user-2',
        email: 'instructor@example.com',
        role: UserRole.INSTRUCTOR,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-2',
        email: 'instructor@example.com',
        role: UserRole.INSTRUCTOR,
      });
    });

    it('should handle admin role', async () => {
      const payload: JwtPayload = {
        sub: 'user-3',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-3',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });
    });
  });

  describe('constructor', () => {
    it('should configure strategy with JWT secret from config', () => {
      mockConfigService.get.mockReturnValue('test-secret');
      
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });
});
