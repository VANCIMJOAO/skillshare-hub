// apps/api/src/cache/cache.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from './cache.service';

describe('CacheService', () => {
    let service: CacheService;
    let cacheManager: jest.Mocked<Cache>;

    beforeEach(async () => {
        const mockCacheManager = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
            wrap: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CacheService,
                {
                    provide: CACHE_MANAGER,
                    useValue: mockCacheManager,
                },
            ],
        }).compile();

        service = module.get<CacheService>(CacheService);
        cacheManager = module.get<Cache>(CACHE_MANAGER) as jest.Mocked<Cache>;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('get', () => {
        it('should get value from cache', async () => {
            const testKey = 'test-key';
            const testValue = { data: 'test' };
            cacheManager.get.mockResolvedValue(testValue);

            const result = await service.get(testKey);

            expect(cacheManager.get).toHaveBeenCalledWith(testKey);
            expect(result).toEqual(testValue);
        });

        it('should return undefined for non-existent key', async () => {
            const testKey = 'non-existent';
            cacheManager.get.mockResolvedValue(undefined);

            const result = await service.get(testKey);

            expect(cacheManager.get).toHaveBeenCalledWith(testKey);
            expect(result).toBeUndefined();
        });
    });

    describe('set', () => {
        it('should set value in cache with TTL', async () => {
            const testKey = 'test-key';
            const testValue = { data: 'test' };
            const ttl = 300;

            await service.set(testKey, testValue, ttl);

            expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, ttl);
        });

        it('should set value in cache without TTL', async () => {
            const testKey = 'test-key';
            const testValue = { data: 'test' };

            await service.set(testKey, testValue);

            expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
        });
    });

    describe('del', () => {
        it('should delete value from cache', async () => {
            const testKey = 'test-key';

            await service.del(testKey);

            expect(cacheManager.del).toHaveBeenCalledWith(testKey);
        });
    });

    describe('reset', () => {
        it('should reset entire cache', async () => {
            await service.reset();

            expect(cacheManager.reset).toHaveBeenCalled();
        });
    });

    describe('getOrSet', () => {
        it('should return cached value if exists', async () => {
            const testKey = 'test-key';
            const cachedValue = { data: 'cached' };
            cacheManager.get.mockResolvedValue(cachedValue);

            const factory = jest.fn();
            const result = await service.getOrSet(testKey, factory);

            expect(cacheManager.get).toHaveBeenCalledWith(testKey);
            expect(factory).not.toHaveBeenCalled();
            expect(result).toEqual(cachedValue);
        });

        it('should call factory and cache result if not cached', async () => {
            const testKey = 'test-key';
            const factoryValue = { data: 'fresh' };
            const ttl = 300;

            cacheManager.get.mockResolvedValue(undefined);
            const factory = jest.fn().mockResolvedValue(factoryValue);

            const result = await service.getOrSet(testKey, factory, ttl);

            expect(cacheManager.get).toHaveBeenCalledWith(testKey);
            expect(factory).toHaveBeenCalled();
            expect(cacheManager.set).toHaveBeenCalledWith(testKey, factoryValue, ttl);
            expect(result).toEqual(factoryValue);
        });
    });

    describe('wrap', () => {
        it('should wrap function call with caching', async () => {
            const testKey = 'test-key';
            const wrappedValue = { data: 'wrapped' };
            const fn = jest.fn().mockResolvedValue(wrappedValue);
            const ttl = 300;

            cacheManager.wrap.mockResolvedValue(wrappedValue);

            const result = await service.wrap(testKey, fn, ttl);

            expect(cacheManager.wrap).toHaveBeenCalledWith(testKey, fn, ttl);
            expect(result).toEqual(wrappedValue);
        });
    });

    describe('key generators', () => {
        it('should generate workshop key', () => {
            const workshopId = 'workshop-123';
            const key = service.getWorkshopKey(workshopId);
            expect(key).toBe('workshop:workshop-123');
        });

        it('should generate user key', () => {
            const userId = 'user-456';
            const key = service.getUserKey(userId);
            expect(key).toBe('user:user-456');
        });

        it('should generate workshop list key', () => {
            const filters = { page: 1, category: 'tech' };
            const key = service.getWorkshopListKey(filters);
            expect(key).toBe('workshops:list:category:tech|page:1');
        });

        it('should generate analytics key', () => {
            const userId = 123;
            const timeRange = '30d';
            const key = service.getAnalyticsKey(userId, timeRange);
            expect(key).toBe('analytics:123:30d');
        });

        it('should generate analytics key without parameters', () => {
            const key = service.getAnalyticsKey();
            expect(key).toBe('analytics:global:all');
        });
    });

    describe('invalidatePattern', () => {
        it('should invalidate workshop pattern', async () => {
            await service.invalidatePattern('workshop');

            expect(cacheManager.del).toHaveBeenCalledWith('workshops:list');
        });

        it('should handle user pattern', async () => {
            await service.invalidatePattern('user');
            
            // Just ensure the method doesn't throw
            expect(true).toBe(true);
        });

        it('should handle analytics pattern', async () => {
            await service.invalidatePattern('analytics');
            
            // Just ensure the method doesn't throw
            expect(true).toBe(true);
        });

        it('should handle unknown pattern', async () => {
            await service.invalidatePattern('unknown');
            
            // Just ensure the method doesn't throw
            expect(true).toBe(true);
        });
    });

    describe('getWorkshopListKey', () => {
        it('should generate key with complex filters', async () => {
            const filters = {
                category: 'programming',
                minPrice: 100,
                maxPrice: 500,
                search: 'javascript',
            };

            const key = service.getWorkshopListKey(filters);

            expect(key).toBe('workshops:list:category:programming|maxPrice:500|minPrice:100|search:javascript');
        });

        it('should generate key with single filter', async () => {
            const filters = { category: 'design' };

            const key = service.getWorkshopListKey(filters);

            expect(key).toBe('workshops:list:category:design');
        });

        it('should generate key with empty filters', async () => {
            const filters = {};

            const key = service.getWorkshopListKey(filters);

            expect(key).toBe('workshops:list:');
        });

        it('should handle special characters in filters', async () => {
            const filters = {
                search: 'node.js & react',
                category: 'web-dev',
            };

            const key = service.getWorkshopListKey(filters);

            expect(key).toBe('workshops:list:category:web-dev|search:node.js & react');
        });
    });

    describe('getAnalyticsKey', () => {
        it('should generate key with user and time range', async () => {
            const key = service.getAnalyticsKey(123, '30days');

            expect(key).toBe('analytics:123:30days');
        });

        it('should generate key with user only', async () => {
            const key = service.getAnalyticsKey(456);

            expect(key).toBe('analytics:456:all');
        });

        it('should generate key with time range only', async () => {
            const key = service.getAnalyticsKey(undefined, '7days');

            expect(key).toBe('analytics:global:7days');
        });

        it('should generate global key with no parameters', async () => {
            const key = service.getAnalyticsKey();

            expect(key).toBe('analytics:global:all');
        });
    });

    describe('error handling', () => {
        it('should handle cache get errors', async () => {
            cacheManager.get.mockRejectedValue(new Error('Cache error'));

            await expect(service.get('test-key')).rejects.toThrow('Cache error');
        });

        it('should handle cache set errors', async () => {
            cacheManager.set.mockRejectedValue(new Error('Cache error'));

            await expect(service.set('test-key', 'value')).rejects.toThrow('Cache error');
        });

        it('should handle getOrSet factory errors', async () => {
            cacheManager.get.mockResolvedValue(undefined);
            const factory = jest.fn().mockRejectedValue(new Error('Factory error'));

            await expect(service.getOrSet('test-key', factory)).rejects.toThrow('Factory error');
        });

        it('should handle wrap function errors', async () => {
            const fn = jest.fn().mockRejectedValue(new Error('Function error'));
            cacheManager.wrap.mockRejectedValue(new Error('Function error'));

            await expect(service.wrap('test-key', fn)).rejects.toThrow('Function error');
        });
    });

    describe('complex scenarios', () => {
        it('should handle getOrSet with null value from factory', async () => {
            cacheManager.get.mockResolvedValue(undefined);
            const factory = jest.fn().mockResolvedValue(null);

            const result = await service.getOrSet('test-key', factory);

            expect(result).toBeNull();
            expect(factory).toHaveBeenCalled();
            expect(cacheManager.set).toHaveBeenCalledWith('test-key', null, undefined);
        });

        it('should handle getOrSet with zero value', async () => {
            cacheManager.get.mockResolvedValue(undefined);
            const factory = jest.fn().mockResolvedValue(0);

            const result = await service.getOrSet('test-key', factory);

            expect(result).toBe(0);
            expect(factory).toHaveBeenCalled();
            expect(cacheManager.set).toHaveBeenCalledWith('test-key', 0, undefined);
        });

        it('should handle getOrSet with empty string', async () => {
            cacheManager.get.mockResolvedValue(undefined);
            const factory = jest.fn().mockResolvedValue('');

            const result = await service.getOrSet('test-key', factory);

            expect(result).toBe('');
            expect(factory).toHaveBeenCalled();
            expect(cacheManager.set).toHaveBeenCalledWith('test-key', '', undefined);
        });
    });
});
