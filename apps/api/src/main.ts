// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Polyfill for crypto.randomUUID in Node.js 18
if (!globalThis.crypto) {
    globalThis.crypto = { randomUUID } as any;
}

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));

    // Configure CORS for production and development
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://skillsharehub-production.up.railway.app',
        process.env.FRONTEND_URL,
        // Allow all Vercel preview deployments
        /^https:\/\/skillsharehub-.*\.vercel\.app$/,
    ].filter(Boolean);

    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    });

    // Serve static files
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });

    // Swagger API Documentation
    if (process.env.NODE_ENV !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('SkillShare Hub API')
            .setDescription('API completa para a plataforma de workshops SkillShare Hub')
            .setVersion('1.0')
            .addTag('auth', 'Autenticação e autorização')
            .addTag('users', 'Gerenciamento de usuários')
            .addTag('workshops', 'Gerenciamento de workshops')
            .addTag('enrollments', 'Inscrições em workshops')
            .addTag('notifications', 'Sistema de notificações')
            .addTag('analytics', 'Métricas e dashboard')
            .addBearerAuth()
            .addServer('http://localhost:3001', 'Servidor de desenvolvimento')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api-docs', app, document, {
            customSiteTitle: 'SkillShare Hub API',
            customfavIcon: '/favicon.ico',
            customCss: '.swagger-ui .topbar { display: none }',
        });

        console.log('📚 API Documentation available at: http://localhost:3001/api-docs');
    }

    const port = process.env.API_PORT || process.env.PORT || 3001;
    await app.listen(port);
    console.log(`API running on port ${port}`);
}

bootstrap();
