// apps/api/src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
