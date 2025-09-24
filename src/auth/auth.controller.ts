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
import { LocalAuthGuard } from './local-auth.guard';
import type { RequestHasUser } from '@/common/interfaces/request-with-user.interface';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { User } from '@/users/entities/user.entity';
import { CurrentUser } from './decorators/current-user.decorator';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UsersService } from '@/users/users.service';
import { NonEmptyBodyPipe } from '@/common/pipes/non-empty-body.pipe';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @Public()
  register(@Body(new NonEmptyBodyPipe()) createUserDto: CreateUserDto) {
    createUserDto.role = undefined;
    createUserDto.createdBy = undefined;
    return this.usersService.create(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: RequestHasUser) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
