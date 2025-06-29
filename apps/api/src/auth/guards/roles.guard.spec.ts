import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user-1',
          role: UserRole.STUDENT,
        },
      };

      mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;
    });

    it('should allow access when no roles are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue(null);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });

    it('should allow access when user has required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.STUDENT]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should deny access when user lacks required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should allow access when user has one of multiple required roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN, UserRole.INSTRUCTOR]);
      mockRequest.user.role = UserRole.INSTRUCTOR;

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should deny access when user has none of multiple required roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN, UserRole.INSTRUCTOR]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should handle admin role', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockRequest.user.role = UserRole.ADMIN;

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should handle instructor role', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.INSTRUCTOR]);
      mockRequest.user.role = UserRole.INSTRUCTOR;

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should handle empty roles array', () => {
      mockReflector.getAllAndOverride.mockReturnValue([]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should handle undefined user', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.STUDENT]);
      mockRequest.user = undefined;

      expect(() => guard.canActivate(mockContext)).toThrow();
    });
  });
});
