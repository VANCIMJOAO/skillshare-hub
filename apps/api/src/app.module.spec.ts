import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  }, 30000); // 30 second timeout

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should compile successfully', async () => {
    expect(module).toBeDefined();
    expect(module.get).toBeDefined();
  });

  it('should have ConfigModule imported', () => {
    const configModule = module.get(ConfigModule);
    expect(configModule).toBeDefined();
  });
});
