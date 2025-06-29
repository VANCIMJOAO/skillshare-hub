import { validate } from 'class-validator';
import { CreateWorkshopDto } from './create-workshop.dto';
import { WorkshopMode } from '../entities/workshop.entity';

describe('CreateWorkshopDto', () => {
  it('should be valid with all required fields', async () => {
    const dto = new CreateWorkshopDto();
    dto.title = 'Test Workshop';
    dto.description = 'A test workshop description';
    dto.price = 100;
    dto.mode = WorkshopMode.ONLINE;
    dto.startsAt = '2025-07-15T10:00:00Z';
    dto.endsAt = '2025-07-15T12:00:00Z';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when title is empty', async () => {
    const dto = new CreateWorkshopDto();
    dto.title = '';
    dto.description = 'A test workshop description';
    dto.price = 100;
    dto.mode = WorkshopMode.ONLINE;
    dto.startsAt = '2025-07-15T10:00:00Z';
    dto.endsAt = '2025-07-15T12:00:00Z';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
  });

  it('should fail validation when description is empty', async () => {
    const dto = new CreateWorkshopDto();
    dto.title = 'Test Workshop';
    dto.description = '';
    dto.price = 100;
    dto.mode = WorkshopMode.ONLINE;
    dto.startsAt = '2025-07-15T10:00:00Z';
    dto.endsAt = '2025-07-15T12:00:00Z';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
  });

  it('should fail validation when price is negative', async () => {
    const dto = new CreateWorkshopDto();
    dto.title = 'Test Workshop';
    dto.description = 'A test workshop description';
    dto.price = -10;
    dto.mode = WorkshopMode.ONLINE;
    dto.startsAt = '2025-07-15T10:00:00Z';
    dto.endsAt = '2025-07-15T12:00:00Z';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(error => error.property === 'price')).toBe(true);
  });

  it('should fail validation when startsAt is missing', async () => {
    const dto = new CreateWorkshopDto();
    dto.title = 'Test Workshop';
    dto.description = 'A test workshop description';
    dto.price = 100;
    dto.mode = WorkshopMode.ONLINE;
    dto.endsAt = '2025-07-15T12:00:00Z';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(error => error.property === 'startsAt')).toBe(true);
  });

  it('should fail validation when endsAt is missing', async () => {
    const dto = new CreateWorkshopDto();
    dto.title = 'Test Workshop';
    dto.description = 'A test workshop description';
    dto.price = 100;
    dto.mode = WorkshopMode.ONLINE;
    dto.startsAt = '2025-07-15T10:00:00Z';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(error => error.property === 'endsAt')).toBe(true);
  });

  it('should accept optional fields', async () => {
    const dto = new CreateWorkshopDto();
    dto.title = 'Test Workshop';
    dto.description = 'A test workshop description';
    dto.price = 100;
    dto.mode = WorkshopMode.ONLINE;
    dto.startsAt = '2025-07-15T10:00:00Z';
    dto.endsAt = '2025-07-15T12:00:00Z';
    dto.maxParticipants = 20;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should handle different workshop modes', async () => {
    const dtoOnline = new CreateWorkshopDto();
    dtoOnline.title = 'Online Workshop';
    dtoOnline.description = 'An online workshop';
    dtoOnline.price = 100;
    dtoOnline.mode = WorkshopMode.ONLINE;
    dtoOnline.startsAt = '2025-07-15T10:00:00Z';
    dtoOnline.endsAt = '2025-07-15T12:00:00Z';

    const dtoPresential = new CreateWorkshopDto();
    dtoPresential.title = 'Presential Workshop';
    dtoPresential.description = 'A presential workshop';
    dtoPresential.price = 150;
    dtoPresential.mode = WorkshopMode.PRESENTIAL;
    dtoPresential.startsAt = '2025-07-15T10:00:00Z';
    dtoPresential.endsAt = '2025-07-15T12:00:00Z';

    const errorsOnline = await validate(dtoOnline);
    const errorsPresential = await validate(dtoPresential);

    expect(errorsOnline).toHaveLength(0);
    expect(errorsPresential).toHaveLength(0);
  });

  it('should handle zero price for free workshops', async () => {
    const dto = new CreateWorkshopDto();
    dto.title = 'Free Workshop';
    dto.description = 'A free workshop';
    dto.price = 0;
    dto.mode = WorkshopMode.ONLINE;
    dto.startsAt = '2025-07-15T10:00:00Z';
    dto.endsAt = '2025-07-15T12:00:00Z';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
