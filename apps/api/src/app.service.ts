// apps/api/src/app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  ping(): object {
    return {
      message: 'SkillShare Hub API is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'app-service'
    };
  }

  getStatus(): object {
    return {
      status: 'ok',
      message: 'API is working',
      timestamp: new Date().toISOString()
    };
  }
}
