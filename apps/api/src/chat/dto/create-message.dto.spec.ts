import { Test, TestingModule } from '@nestjs/testing';
import { CreateMessageDto, EditMessageDto } from './create-message.dto';
import { validate } from 'class-validator';

describe('Chat DTOs', () => {
  describe('CreateMessageDto', () => {
    it('should be valid with required fields', async () => {
      const dto = new CreateMessageDto();
      dto.message = 'Hello world';
      dto.workshopId = 'workshop-1';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should have default type as text', () => {
      const dto = new CreateMessageDto();
      expect(dto.type).toBe('text');
    });

    it('should be invalid without message', async () => {
      const dto = new CreateMessageDto();
      dto.workshopId = 'workshop-1';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('message');
    });

    it('should be invalid without workshopId', async () => {
      const dto = new CreateMessageDto();
      dto.message = 'Hello';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('workshopId');
    });

    it('should handle optional attachmentUrl', () => {
      const dto = new CreateMessageDto();
      dto.message = 'Hello';
      dto.workshopId = 'workshop-1';
      dto.attachmentUrl = 'https://example.com/file.jpg';

      expect(dto.attachmentUrl).toBe('https://example.com/file.jpg');
    });
  });

  describe('EditMessageDto', () => {
    it('should be valid with message', async () => {
      const dto = new EditMessageDto();
      dto.message = 'Updated message';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should be invalid without message', async () => {
      const dto = new EditMessageDto();

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
