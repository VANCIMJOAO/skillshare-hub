// apps/api/src/cache/cache.interceptor.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { CacheInterceptor } from './cache.interceptor';
import { CacheService } from './cache.service';

describe('CacheInterceptor', () => {
  let interceptor: CacheInterceptor;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheInterceptor,
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    interceptor = module.get<CacheInterceptor>(CacheInterceptor);
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    let mockExecutionContext: ExecutionContext;
    let mockCallHandler: CallHandler;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        method: 'GET',
        url: '/api/workshops',
        query: { page: '1', limit: '10' },
        params: { id: '123' },
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as any;

      mockCallHandler = {
        handle: jest.fn(),
      };
    });

    it('should return cached data if available', async () => {
      const cachedData = { data: 'cached response' };
      cacheService.get.mockResolvedValue(cachedData);

      const result = await interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(cacheService.get).toHaveBeenCalledWith('cache:/api/workshops:id=123:limit=10&page=1');
      expect(mockCallHandler.handle).not.toHaveBeenCalled();

      // Test the observable
      result.subscribe(data => {
        expect(data).toEqual(cachedData);
      });
    });

    it('should execute request and cache response when not in cache', async () => {
      const responseData = { data: 'new response' };
      cacheService.get.mockResolvedValue(null);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      const result = await interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(cacheService.get).toHaveBeenCalledWith('cache:/api/workshops:id=123:limit=10&page=1');
      expect(mockCallHandler.handle).toHaveBeenCalled();

      // Test the observable and caching
      await new Promise((resolve) => {
        result.subscribe(data => {
          expect(data).toEqual(responseData);
          resolve(data);
        });
      });

      // Wait for the tap operation to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(cacheService.set).toHaveBeenCalledWith(
        'cache:/api/workshops:id=123:limit=10&page=1',
        responseData,
        300
      );
    });

    it('should not cache non-GET requests', async () => {
      mockRequest.method = 'POST';

      const result = await interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(cacheService.get).not.toHaveBeenCalled();
      expect(mockCallHandler.handle).toHaveBeenCalled();
      const result2 = mockCallHandler.handle();
      expect(result).toBe(result2);
    });

    it('should not cache response with null/undefined data', async () => {
      cacheService.get.mockResolvedValue(null);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(null));

      const result = await interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe(data => {
        expect(data).toBeNull();
        // Allow time for async tap operation
        setTimeout(() => {
          expect(cacheService.set).not.toHaveBeenCalled();
        }, 0);
      });
    });

    it('should handle empty query and params', async () => {
      mockRequest.query = {};
      mockRequest.params = {};
      cacheService.get.mockResolvedValue(null);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of({ data: 'test' }));

      const result = await interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(cacheService.get).toHaveBeenCalledWith('cache:/api/workshops::');
      expect(result).toBeDefined();
    });

    it('should sort query parameters for consistent cache keys', async () => {
      mockRequest.query = { z: 'last', a: 'first', m: 'middle' };
      mockRequest.params = { beta: '2', alpha: '1' };
      cacheService.get.mockResolvedValue(null);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of({ data: 'test' }));

      const result = await interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(cacheService.get).toHaveBeenCalledWith('cache:/api/workshops:alpha=1&beta=2:a=first&m=middle&z=last');
      expect(result).toBeDefined();
    });

    it('should handle PUT, DELETE, PATCH methods', async () => {
      const methods = ['PUT', 'DELETE', 'PATCH'];

      for (const method of methods) {
        mockRequest.method = method;
        
        const result = await interceptor.intercept(mockExecutionContext, mockCallHandler);

        expect(cacheService.get).not.toHaveBeenCalled();
        expect(mockCallHandler.handle).toHaveBeenCalled();
        const result2 = mockCallHandler.handle();
        expect(result).toBe(result2);

        // Reset mocks for next iteration
        jest.clearAllMocks();
      }
    });

    it('should handle complex query parameters', async () => {
      mockRequest.query = { 
        filter: 'active', 
        sort: 'created_at',
        'nested[prop]': 'value',
        array: ['item1', 'item2'],
      };
      mockRequest.params = {};
      cacheService.get.mockResolvedValue(null);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of({ data: 'test' }));

      const result = await interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(cacheService.get).toHaveBeenCalledWith(
        'cache:/api/workshops::array=item1,item2&filter=active&nested[prop]=value&sort=created_at'
      );
      expect(result).toBeDefined();
    });

    it('should handle special characters in URL', async () => {
      mockRequest.url = '/api/workshops/search?q=test%20query';
      mockRequest.query = {};
      mockRequest.params = {};
      cacheService.get.mockResolvedValue(null);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of({ data: 'test' }));

      const result = await interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(cacheService.get).toHaveBeenCalledWith('cache:/api/workshops/search?q=test%20query::');
      expect(result).toBeDefined();
    });
  });

  describe('generateCacheKey (private method testing via public interface)', () => {
    it('should generate consistent cache keys for same parameters', async () => {
      const mockRequest1 = {
        method: 'GET',
        url: '/api/test',
        query: { a: '1', b: '2' },
        params: { id: '123' },
      };

      const mockRequest2 = {
        method: 'GET',
        url: '/api/test',
        query: { b: '2', a: '1' }, // Different order
        params: { id: '123' },
      };

      const mockExecutionContext1 = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest1),
        }),
      } as any;

      const mockExecutionContext2 = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest2),
        }),
      } as any;

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({})),
      } as any;

      cacheService.get.mockResolvedValue(null);

      await interceptor.intercept(mockExecutionContext1, mockCallHandler);
      const firstCacheKey = cacheService.get.mock.calls[0][0];

      jest.clearAllMocks();
      cacheService.get.mockResolvedValue(null);

      await interceptor.intercept(mockExecutionContext2, mockCallHandler);
      const secondCacheKey = cacheService.get.mock.calls[0][0];

      expect(firstCacheKey).toBe(secondCacheKey);
    });
  });
});
