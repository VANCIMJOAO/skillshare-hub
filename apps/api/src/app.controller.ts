// apps/api/src/app.controller.ts
import { Controller, Get, Redirect } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @Redirect('/api/docs', 302)
    redirectToApiDocs() {
        // Esta rota redireciona para a documentação da API
        return { url: '/api/docs' };
    }

    @Get('ping')
    ping() {
        return this.appService.ping();
    }

    @Get('status')
    getStatus() {
        return this.appService.getStatus();
    }
}
