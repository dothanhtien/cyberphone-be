import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { RequestWithUser } from '@/common/types/requests.type';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoggedInUser } from './decorators/logged-in-user.decorator';
import { User } from '@/users/entities/user.entity';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/requests/login.dto';
import { LoginResponseDto } from './dto/responses/login-response.dto';
import { UserResponseDto } from '@/users/entities/responses/user-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with identifier and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Login success', type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current logged-in user' })
  @ApiOkResponse({ description: 'User info', type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getMe(@LoggedInUser() loggedInUser: User) {
    return loggedInUser;
  }
}
