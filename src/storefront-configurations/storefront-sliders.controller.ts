import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SyncStorefrontSlidersDto } from './dto';
import { StorefrontSlidersService } from './storefront-sliders.service';
import { LoggedInUser, Public, Roles } from '@/auth/decorators';
import { UserRole } from '@/users/enums';

@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller('storefront-configurations/sliders')
export class StorefrontSlidersController {
  constructor(
    private readonly storefrontSlidersService: StorefrontSlidersService,
  ) {}

  @Public()
  @Get()
  getStorefrontSliders() {
    return this.storefrontSlidersService.findAllStorefrontSliders();
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 20, { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  syncStorefrontSliders(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() dto: SyncStorefrontSlidersDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    return this.storefrontSlidersService.syncStorefrontSliders(
      dto.items,
      images ?? [],
      loggedInUserId,
    );
  }
}
