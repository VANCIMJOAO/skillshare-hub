// apps/api/src/workshops/dto/workshops-filter.dto.ts
import { IsOptional, IsEnum, IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { WorkshopMode } from '../entities/workshop.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum SortBy {
    TITLE = 'title',
    PRICE = 'price',
    START_DATE = 'startsAt',
    CREATED_AT = 'createdAt',
    POPULARITY = 'popularity'
}

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC'
}

export class WorkshopsFilterDto extends PaginationDto {
    @IsOptional()
    @IsEnum(WorkshopMode)
    mode?: WorkshopMode;

    @IsOptional()
    @IsString()
    search?: string; // Busca por título e descrição

    @IsOptional()
    @IsString()
    category?: string; // Filtro por categoria/instrutor

    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @IsDateString()
    startDate?: string; // Data de início mínima

    @IsOptional()
    @IsDateString()
    endDate?: string; // Data de início máxima

    @IsOptional()
    @IsEnum(SortBy)
    sortBy?: SortBy;

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    availableOnly?: boolean; // Apenas com vagas disponíveis
}
