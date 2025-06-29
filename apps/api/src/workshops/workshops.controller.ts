// apps/api/src/workshops/workshops.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { WorkshopsFilterDto } from './dto/workshops-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('workshops')
export class WorkshopsController {
    constructor(private readonly workshopsService: WorkshopsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    async create(
        @Body() createWorkshopDto: CreateWorkshopDto,
        @CurrentUser() user: any,
    ): Promise<ApiResponse<any>> {
        const workshop = await this.workshopsService.create(createWorkshopDto, user.id);

        return {
            data: workshop,
        };
    }

    @Get()
    async findAll(@Query() filterDto: WorkshopsFilterDto): Promise<ApiResponse<any>> {
        const result = await this.workshopsService.findAll(filterDto) as any;

        return {
            data: result.data,
            meta: result.meta,
        };
    }

    @Get('filters/categories')
    async getCategories(): Promise<ApiResponse<string[]>> {
        const categories = await this.workshopsService.getCategories();

        return {
            data: categories,
        };
    }

    @Get('filters/price-range')
    async getPriceRange(): Promise<ApiResponse<{ min: number; max: number }>> {
        const priceRange = await this.workshopsService.getPriceRange();

        return {
            data: priceRange,
        };
    }

    @Get('my')
    @UseGuards(JwtAuthGuard)
    async findMyWorkshops(@CurrentUser() user: any): Promise<ApiResponse<any>> {
        const workshops = await this.workshopsService.findByOwner(user.id);

        return {
            data: workshops,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ApiResponse<any>> {
        const workshop = await this.workshopsService.findOne(id);

        return {
            data: workshop,
        };
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: string,
        @Body() updateWorkshopDto: UpdateWorkshopDto,
        @CurrentUser() user: any,
    ): Promise<ApiResponse<any>> {
        const workshop = await this.workshopsService.update(id, updateWorkshopDto, user);

        return {
            data: workshop,
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ): Promise<ApiResponse<any>> {
        await this.workshopsService.remove(id, user);

        return {
            data: null,
        };
    }

    // Rota temporária para desenvolvimento - criar workshops sem autenticação
    @Post('seed')
    async createSeed(@Body() createWorkshopDto: CreateWorkshopDto): Promise<ApiResponse<any>> {
        const workshop = await this.workshopsService.createSeed(createWorkshopDto);

        return {
            data: workshop,
        };
    }
}
