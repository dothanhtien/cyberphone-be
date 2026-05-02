import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdminStorefrontSlidersService } from './admin-storefront-sliders.service';
import { SyncSlidersDto } from './dto';
import { LoggedInUser } from '@/auth/decorators';

@Controller('admin/storefront-config')
export class AdminStorefrontConfigController {
  constructor(private readonly slidersService: AdminStorefrontSlidersService) {}

  @Post('sliders')
  @UseInterceptors(
    FilesInterceptor('images', 20, { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  syncSliders(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() dto: SyncSlidersDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    return this.slidersService.syncSliders(
      dto.items,
      images ?? [],
      loggedInUserId,
    );
  }

  @Get('sliders')
  findAllSliders() {
    return this.slidersService.findAllSliders();
  }
}
