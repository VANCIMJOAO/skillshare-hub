// apps/api/src/health/health.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
    imports: [TypeOrmModule],
    controllers: [HealthController],
    providers: [HealthService],
    exports: [HealthService],
})
export class HealthModule { }
