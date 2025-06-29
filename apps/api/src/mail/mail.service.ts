// apps/api/src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    async sendWelcomeEmail(email: string, name: string): Promise<void> {
        console.log(`📧 Sending welcome email to ${email} (${name})`);
        // TODO: Implement real email sending
    }

    async sendWorkshopConfirmation(email: string, workshopTitle: string): Promise<void> {
        console.log(`📧 Sending workshop confirmation to ${email} for "${workshopTitle}"`);
        // TODO: Implement real email sending
    }

    async sendPasswordReset(email: string, resetToken: string): Promise<void> {
        console.log(`📧 Sending password reset to ${email} with token: ${resetToken}`);
        // TODO: Implement real email sending
    }

    async sendNotificationEmail(
        email: string,
        name: string,
        title: string,
        message: string,
        actionUrl?: string,
    ): Promise<void> {
        console.log(`📧 Sending notification email to ${email} (${name})`);
        console.log(`   Title: ${title}`);
        console.log(`   Message: ${message}`);
        if (actionUrl) {
            console.log(`   Action URL: ${actionUrl}`);
        }
        // TODO: Implement real email sending with proper template
    }
}
