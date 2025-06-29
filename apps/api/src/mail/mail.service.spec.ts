import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendWelcomeEmail', () => {
    it('should log welcome email details', async () => {
      const email = 'test@example.com';
      const name = 'John Doe';

      await service.sendWelcomeEmail(email, name);

      expect(consoleSpy).toHaveBeenCalledWith(
        `📧 Sending welcome email to ${email} (${name})`
      );
    });

    it('should handle empty name', async () => {
      const email = 'test@example.com';
      const name = '';

      await service.sendWelcomeEmail(email, name);

      expect(consoleSpy).toHaveBeenCalledWith(
        `📧 Sending welcome email to ${email} ()`
      );
    });
  });

  describe('sendWorkshopConfirmation', () => {
    it('should log workshop confirmation details', async () => {
      const email = 'test@example.com';
      const workshopTitle = 'React Advanced';

      await service.sendWorkshopConfirmation(email, workshopTitle);

      expect(consoleSpy).toHaveBeenCalledWith(
        `📧 Sending workshop confirmation to ${email} for "${workshopTitle}"`
      );
    });

    it('should handle special characters in workshop title', async () => {
      const email = 'test@example.com';
      const workshopTitle = 'Node.js & TypeScript: From Zero to Hero!';

      await service.sendWorkshopConfirmation(email, workshopTitle);

      expect(consoleSpy).toHaveBeenCalledWith(
        `📧 Sending workshop confirmation to ${email} for "${workshopTitle}"`
      );
    });
  });

  describe('sendPasswordReset', () => {
    it('should log password reset details', async () => {
      const email = 'test@example.com';
      const resetToken = 'abc123reset456';

      await service.sendPasswordReset(email, resetToken);

      expect(consoleSpy).toHaveBeenCalledWith(
        `📧 Sending password reset to ${email} with token: ${resetToken}`
      );
    });

    it('should handle complex reset token', async () => {
      const email = 'test@example.com';
      const resetToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      await service.sendPasswordReset(email, resetToken);

      expect(consoleSpy).toHaveBeenCalledWith(
        `📧 Sending password reset to ${email} with token: ${resetToken}`
      );
    });
  });

  describe('sendNotificationEmail', () => {
    it('should log notification email details without action URL', async () => {
      const email = 'test@example.com';
      const name = 'John Doe';
      const title = 'New Workshop Available';
      const message = 'A new workshop has been added to your interests.';

      await service.sendNotificationEmail(email, name, title, message);

      expect(consoleSpy).toHaveBeenCalledWith(
        `📧 Sending notification email to ${email} (${name})`
      );
      expect(consoleSpy).toHaveBeenCalledWith(`   Title: ${title}`);
      expect(consoleSpy).toHaveBeenCalledWith(`   Message: ${message}`);
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Action URL:')
      );
    });

    it('should log notification email details with action URL', async () => {
      const email = 'test@example.com';
      const name = 'Jane Smith';
      const title = 'Workshop Reminder';
      const message = 'Your workshop starts in 30 minutes.';
      const actionUrl = 'https://example.com/workshops/123';

      await service.sendNotificationEmail(email, name, title, message, actionUrl);

      expect(consoleSpy).toHaveBeenCalledWith(
        `📧 Sending notification email to ${email} (${name})`
      );
      expect(consoleSpy).toHaveBeenCalledWith(`   Title: ${title}`);
      expect(consoleSpy).toHaveBeenCalledWith(`   Message: ${message}`);
      expect(consoleSpy).toHaveBeenCalledWith(`   Action URL: ${actionUrl}`);
    });

    it('should handle long notification messages', async () => {
      const email = 'test@example.com';
      const name = 'John Doe';
      const title = 'Important Update';
      const message = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';

      await service.sendNotificationEmail(email, name, title, message);

      expect(consoleSpy).toHaveBeenCalledWith(
        `📧 Sending notification email to ${email} (${name})`
      );
      expect(consoleSpy).toHaveBeenCalledWith(`   Title: ${title}`);
      expect(consoleSpy).toHaveBeenCalledWith(`   Message: ${message}`);
    });

    it('should handle special characters in email content', async () => {
      const email = 'test@example.com';
      const name = 'José María';
      const title = 'Confirmación de Taller';
      const message = 'Tu inscripción en "JavaScript Avanzado" ha sido confirmada. ¡Nos vemos pronto!';

      await service.sendNotificationEmail(email, name, title, message);

      expect(consoleSpy).toHaveBeenCalledWith(
        `📧 Sending notification email to ${email} (${name})`
      );
      expect(consoleSpy).toHaveBeenCalledWith(`   Title: ${title}`);
      expect(consoleSpy).toHaveBeenCalledWith(`   Message: ${message}`);
    });
  });
});
