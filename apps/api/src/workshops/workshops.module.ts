// apps/api/src/workshops/workshops.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkshopsService } from './workshops.service';
import { WorkshopsController } from './workshops.controller';
import { Workshop } from './entities/workshop.entity';
import { Enrollment } from './entities/enrollment.entity';
import { CacheAppModule } from '../cache/cache.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Workshop, Enrollment]),
        CacheAppModule,
    ],
    controllers: [WorkshopsController],
    providers: [WorkshopsService],
    exports: [WorkshopsService],
})
export class WorkshopsModule { }
