import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoggedInUser, Public } from './decorators';
import { RegisterDto } from './dto';
import { AuthMapper } from './mappers';
import { LocalAuthGuard, JwtAuthGuard } from './guards';
import { type AuthUser, type RequestWithUser } from './types';
import { REFRESH_TOKEN_COOKIE } from '@/common/constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('/register')
  create(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...result } = await this.authService.login(req.user);
    this.setRefreshTokenCookie(res, refreshToken);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@LoggedInUser() loggedInUser: AuthUser) {
    return AuthMapper.mapToAuthResponse(loggedInUser);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/refresh-token')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;

    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const { refreshToken, ...result } = await this.authService.refresh(token);

    this.setRefreshTokenCookie(res, refreshToken);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  logout(
    @LoggedInUser() user: AuthUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;

    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE, this.getRefreshTokenCookieOptions());

    return this.authService.revoke(user.id, token);
  }

  private getRefreshTokenCookieOptions() {
    const domain = this.configService.get<string>('COOKIE_DOMAIN');
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const expiresInSeconds = Number(
      this.configService.get<number>('REFRESH_TOKEN_TTL', 2592000),
    );

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: expiresInSeconds * 1000,
      ...(domain && { domain }),
    } as const;
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie(
      REFRESH_TOKEN_COOKIE,
      token,
      this.getRefreshTokenCookieOptions(),
    );
  }
}
