import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerStorage, ThrottlerModuleOptions } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './throttler.guard';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomThrottlerGuard,
        {
          provide: 'THROTTLER:MODULE_OPTIONS',
          useValue: {} as ThrottlerModuleOptions,
        },
        {
          provide: ThrottlerStorage,
          useValue: {
            getRecord: jest.fn(),
            addRecord: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<CustomThrottlerGuard>(CustomThrottlerGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getTracker', () => {
    it('should return IP when user is not authenticated', async () => {
      const req = {
        ip: '192.168.1.1',
        connection: { remoteAddress: '192.168.1.1' },
      };

      const result = await guard['getTracker'](req);
      expect(result).toBe('192.168.1.1');
    });

    it('should return IP-userId when user is authenticated', async () => {
      const req = {
        ip: '192.168.1.1',
        user: { id: 'user-123' },
      };

      const result = await guard['getTracker'](req);
      expect(result).toBe('192.168.1.1-user-123');
    });

    it('should use connection.remoteAddress when ip is not available', async () => {
      const req = {
        connection: { remoteAddress: '10.0.0.1' },
        user: { id: 'user-456' },
      };

      const result = await guard['getTracker'](req);
      expect(result).toBe('10.0.0.1-user-456');
    });

    it('should return unknown when no IP is available', async () => {
      const req = {
        connection: {},
      };

      const result = await guard['getTracker'](req);
      expect(result).toBe('unknown');
    });
  });

  describe('generateKey', () => {
    it('should generate key with route information', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            route: { path: '/api/users' },
            url: '/api/users',
          }),
        }),
      } as ExecutionContext;

      const result = guard['generateKey'](mockContext, 'suffix', 'name');
      expect(result).toBe('suffix-GET-/api/users-name');
    });

    it('should use url when route.path is not available', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            url: '/api/auth/login',
          }),
        }),
      } as ExecutionContext;

      const result = guard['generateKey'](mockContext, 'test', 'throttle');
      expect(result).toBe('test-POST-/api/auth/login-throttle');
    });

    it('should handle different HTTP methods', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'DELETE',
            route: { path: '/api/workshops/:id' },
          }),
        }),
      } as ExecutionContext;

      const result = guard['generateKey'](mockContext, 'limit', 'delete');
      expect(result).toBe('limit-DELETE-/api/workshops/:id-delete');
    });
  });
});
