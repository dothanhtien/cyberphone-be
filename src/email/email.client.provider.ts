import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export const EMAIL_TRANSPORTER = 'EMAIL_TRANSPORTER';

export const EmailClientProvider = {
  provide: EMAIL_TRANSPORTER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const port = Number(configService.getOrThrow<string>('SMTP_PORT'));
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
