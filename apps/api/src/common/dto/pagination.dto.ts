// apps/api/src/common/dto/pagination.dto.ts
import { IsOptional, IsPositive, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsPositive()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsPositive()
    @Min(1)
    limit?: number = 10;
}
