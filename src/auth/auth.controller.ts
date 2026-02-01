import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import type { RequestWithUser } from '@/common/types/requests.type';

@Controller('auth')
export class AuthController {
  constructor() {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req: RequestWithUser) {
    return req.user;
  }
}
