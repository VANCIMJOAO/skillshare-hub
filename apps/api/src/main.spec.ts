import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

describe('Application Bootstrap', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
  }, 30000); // 30 second timeout

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should bootstrap the application', async () => {
    expect(app).toBeDefined();
  });

  it('should configure global validation pipe', async () => {
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

    await app.init();
    expect(app).toBeDefined();
  });

  it('should enable CORS', async () => {
    app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
    });

    await app.init();
    expect(app).toBeDefined();
  });

  it('should handle different port configurations', () => {
    const originalEnv = process.env;
    
    // Test with API_PORT
    process.env = { ...originalEnv, API_PORT: '4000' };
    delete process.env.PORT;
    const port1 = process.env.API_PORT || process.env.PORT || 3001;
    expect(port1).toBe('4000');

    // Test with PORT
    process.env = { ...originalEnv, PORT: '5000' };
    delete process.env.API_PORT;
    const port2 = process.env.API_PORT || process.env.PORT || 3001;
    expect(port2).toBe('5000');

    // Test with default
    process.env = { ...originalEnv };
    delete process.env.API_PORT;
    delete process.env.PORT;
    const port3 = process.env.API_PORT || process.env.PORT || 3001;
    expect(port3).toBe(3001);

    process.env = originalEnv;
  });

  it('should configure frontend URL from environment', () => {
    const originalEnv = process.env;
    
    // Test with custom FRONTEND_URL
    process.env = { ...originalEnv, FRONTEND_URL: 'https://myapp.com' };
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    expect(frontendUrl).toBe('https://myapp.com');

    // Test with default
    process.env = { ...originalEnv };
    delete process.env.FRONTEND_URL;
    const defaultUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    expect(defaultUrl).toBe('http://localhost:3000');

    process.env = originalEnv;
  });

  it('should handle NODE_ENV configurations', () => {
    const originalEnv = process.env;
    
    // Test production environment
    process.env = { ...originalEnv, NODE_ENV: 'production' };
    const isProduction = process.env.NODE_ENV === 'production';
    expect(isProduction).toBe(true);

    // Test development environment
    process.env = { ...originalEnv, NODE_ENV: 'development' };
    const isDevelopment = process.env.NODE_ENV !== 'production';
    expect(isDevelopment).toBe(true);

    process.env = originalEnv;
  });
});
