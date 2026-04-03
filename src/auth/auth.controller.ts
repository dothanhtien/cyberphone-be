import {
  Body,
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
import { RegisterDto } from './dto';
import { LocalAuthGuard, JwtAuthGuard } from './guards';
import { AuthMapper } from './mappers';
import { type AuthUser, type RequestWithUser } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/register')
  create(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  login(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@LoggedInUser() loggedInUser: AuthUser) {
    return AuthMapper.mapToAuthResponse(loggedInUser);
  }
}
