import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UpdateProfileDto } from './dto';
import { ProfileService } from './profile.service';
import { LoggedInUser } from '@/auth/decorators';
import { type AuthUser } from '@/auth/types';
import { NonEmptyBodyPipe } from '@/common/pipes';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@LoggedInUser() authUser: AuthUser) {
    return this.profileService.getProfile(authUser);
  }

  @Patch()
  updateProfile(
    @Body(new NonEmptyBodyPipe()) dto: UpdateProfileDto,
    @LoggedInUser() authUser: AuthUser,
  ) {
    return this.profileService.updateProfile(dto, authUser);
  }
}
