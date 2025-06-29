// apps/api/src/auth/interfaces/jwt-payload.interface.ts
import { UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}
