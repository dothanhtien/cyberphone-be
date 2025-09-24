import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import type { RequestHasUser } from '@/common/interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: RequestHasUser) {
    return req.user;
  }
}
