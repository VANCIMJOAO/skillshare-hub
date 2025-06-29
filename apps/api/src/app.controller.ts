// apps/api/src/app.controller.ts
import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    @Redirect('/api/docs', 302)
    redirectToApiDocs() {
        // Esta rota redireciona para a documentação da API
        return { url: '/api/docs' };
    }

    @Get('ping')
    ping() {
        return { 
            message: 'SkillShare Hub API is running!', 
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
    }
}
