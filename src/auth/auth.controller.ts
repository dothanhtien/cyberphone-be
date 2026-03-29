import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoggedInUser, Public } from './decorators';
import { LocalAuthGuard, JwtAuthGuard } from './guards';
import type { RequestWithUser } from '@/common/types/requests.type';
import { User } from '@/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  login(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@LoggedInUser() loggedInUser: User) {
    return loggedInUser;
  }
}
