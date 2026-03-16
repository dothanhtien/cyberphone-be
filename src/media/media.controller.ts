import {
  Controller,
  Post,
  UseInterceptors,
  Body,
  UploadedFiles,
  Get,
  Query,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GetMediasDto, UploadMediasDto } from './dto';
import { MediaService } from './media.service';
import { LoggedInUser } from '@/auth/decorators';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadMediasDto: UploadMediasDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    uploadMediasDto.createdBy = loggedInUserId;
    return this.mediaService.upload(uploadMediasDto, files);
  }

  @Get()
  getFiles(@Query() getMediasDto: GetMediasDto) {
    return this.mediaService.findAll(getMediasDto);
  }

  @Delete(':id')
  deleteFile(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    return this.mediaService.delete(id, loggedInUserId);
  }
}
