// apps/api/src/workshops/dto/create-workshop.dto.ts
import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { WorkshopMode } from '../entities/workshop.entity';

export class CreateWorkshopDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0)
    price: number;

    @IsEnum(WorkshopMode)
    mode: WorkshopMode;

    @IsOptional()
    @IsString()
    location?: string;

    @IsDateString()
    startsAt: string;

    @IsDateString()
    endsAt: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    maxParticipants?: number;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}
