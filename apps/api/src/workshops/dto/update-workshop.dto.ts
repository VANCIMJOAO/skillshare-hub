// apps/api/src/workshops/dto/update-workshop.dto.ts
import { WorkshopMode } from '../entities/workshop.entity';

export class UpdateWorkshopDto {
    title?: string;
    description?: string;
    price?: number;
    mode?: WorkshopMode;
    location?: string;
    startsAt?: string;
    endsAt?: string;
}
