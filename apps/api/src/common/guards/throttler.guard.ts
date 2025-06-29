// apps/api/src/common/guards/throttler.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        // Use IP address and user ID (if authenticated) for tracking
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userId = req.user?.id;

        return userId ? `${ip}-${userId}` : ip;
    }

    protected generateKey(context: ExecutionContext, suffix: string, name: string): string {
        // Include the route in the key for more granular rate limiting
        const request = context.switchToHttp().getRequest();
        const route = `${request.method}-${request.route?.path || request.url}`;

        return `${suffix}-${route}-${name}`;
    }
}
