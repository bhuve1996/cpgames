import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(this.config.get<string>('SMTP_PORT') ?? '587', 10),
        auth: {
          user: this.config.get<string>('SMTP_USER'),
          pass: this.config.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  async sendEventReminder(emails: string[], eventTitle: string, startsAt: Date, communityName: string) {
    if (!this.transporter || emails.length === 0) {
      this.logger.log(`[Demo] Event reminder for "${eventTitle}" to ${emails.length} recipients`);
      return emails.length;
    }

    const from = this.config.get<string>('EMAIL_FROM') ?? 'noreply@playground.app';
    const formattedDate = startsAt.toLocaleString();

    await this.transporter.sendMail({
      from,
      to: emails.join(','),
      subject: `Reminder: ${eventTitle} in ${communityName}`,
      text: `Don't forget! "${eventTitle}" in ${communityName} starts at ${formattedDate}.`,
      html: `<p>Don't forget! <strong>${eventTitle}</strong> in <strong>${communityName}</strong> starts at ${formattedDate}.</p>`,
    });

    return emails.length;
  }
}
