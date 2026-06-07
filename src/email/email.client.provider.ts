import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export const EMAIL_TRANSPORTER = 'EMAIL_TRANSPORTER';

export const EmailClientProvider = {
  provide: EMAIL_TRANSPORTER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const raw = configService.getOrThrow<string>('SMTP_PORT');
    const port = Number(raw);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error(
        `SMTP_PORT must be an integer between 1 and 65535, got: "${raw}"`,
      );
    }
    return nodemailer.createTransport({
      host: configService.getOrThrow<string>('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: {
        user: configService.getOrThrow<string>('SMTP_USER'),
        pass: configService.getOrThrow<string>('SMTP_PASSWORD'),
      },
    });
  },
};
