import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailClientProvider } from './email.client.provider';
import { EmailService } from './email.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailClientProvider, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
