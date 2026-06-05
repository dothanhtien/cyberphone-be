import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Transporter } from 'nodemailer';
import { EMAIL_TRANSPORTER } from './email.client.provider';
import { ForgotPasswordVars, forgotPasswordTemplate } from './templates';
import { getErrorStack } from '@/common/utils';

interface EmailTemplate {
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly from: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(EMAIL_TRANSPORTER)
    private readonly transporter: Transporter,
  ) {
    this.from = this.configService.getOrThrow<string>('EMAIL_FROM');
  }

  private async send(to: string, template: EmailTemplate): Promise<void> {
    this.logger.debug(`[send] Sending to=${to} subject="${template.subject}"`);
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
      this.logger.log(`[send] Sent to=${to}`);
    } catch (error) {
      this.logger.error(`[send] Failed to=${to}`, getErrorStack(error));
      throw error;
    }
  }

  async sendForgotPassword(
    to: string,
    vars: ForgotPasswordVars,
  ): Promise<void> {
    await this.send(to, forgotPasswordTemplate(vars));
  }
}
