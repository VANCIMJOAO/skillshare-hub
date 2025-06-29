import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) { }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, url, query, params } = request;

    // Only cache GET requests
    if (method !== 'GET') {
      return next.handle();
    }

    // Generate cache key based on URL and parameters
    const cacheKey = this.generateCacheKey(url, query, params);

    // Check if data is in cache
    const cachedData = await this.cacheService.get(cacheKey);
    if (cachedData) {
      return new Observable(observer => {
        observer.next(cachedData);
        observer.complete();
      });
    }

    // If not in cache, execute request and cache response
    return next.handle().pipe(
      tap(async (data) => {
        if (data) {
          // Cache for 5 minutes by default
          await this.cacheService.set(cacheKey, data, 300);
        }
      }),
    );
  }

  private generateCacheKey(url: string, query: any, params: any): string {
    const queryString = Object.keys(query)
      .sort()
      .map(key => `${key}=${query[key]}`)
      .join('&');

    const paramsString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `cache:${url}:${paramsString}:${queryString}`;
  }
}
