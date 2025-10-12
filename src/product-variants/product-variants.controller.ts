import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';
import { NonEmptyBodyPipe } from '@/common/pipes/non-empty-body.pipe';
import { UploadFilesInterceptor } from '@/common/interceptors/upload-files.interceptor';
import { MulterExceptionFilter } from '@/common/filters/multer-exception.filter';
import { CreateProductAssetDto } from '@/product-assets/dto/create-product-asset.dto';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { withFileTransaction } from '@/common/helpers/with-file-transaction.helper';

@Controller('product-variants')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Post()
  @UseInterceptors(
    UploadFilesInterceptor({
      fieldName: 'assets',
      folder: 'product-assets',
    }),
  )
  @UseFilters(MulterExceptionFilter)
  create(
    @Body() createProductVariantDto: CreateProductVariantDto,
    @UploadedFiles() assets: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    let assetsMetaData: CreateProductAssetDto[] = [];
    const uploadedFilePaths: string[] = [];

    if (createProductVariantDto.assetsMetaData) {
      try {
        assetsMetaData = JSON.parse(
          createProductVariantDto.assetsMetaData,
        ) as CreateProductAssetDto[];
      } catch (err) {
        console.log(err);
        throw new BadRequestException('Invalid assetsMetaData');
      }

      if (assets.length !== assetsMetaData.length) {
        throw new BadRequestException(
          'assets count does not match assetsMetadata length',
        );
      }

      const createAssetsDto = plainToInstance(
        CreateProductAssetDto,
        assetsMetaData,
      );
      const errors = createAssetsDto
        .map((dto) => validateSync(dto, { whitelist: true }))
        .flat();

      if (errors.length) {
        throw new BadRequestException('Invalid assetsMetaData');
      }

      createProductVariantDto.assetItems = createAssetsDto.map((asset) => {
        const foundFile = assets.find((file) =>
          file.originalname.startsWith(asset.fileId),
        );

        if (!foundFile) {
          throw new BadRequestException('File not found for mapping asset');
        }

        const fileUrl = `/uploads/product-assets/${foundFile.filename}`;
        uploadedFilePaths.push(fileUrl);

        return {
          ...asset,
          url: fileUrl,
          createdBy: user.id,
        };
      });
    }

    createProductVariantDto.createdBy = user.id;

    return withFileTransaction(
      () => this.productVariantsService.create(createProductVariantDto),
      uploadedFilePaths,
    );
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new NonEmptyBodyPipe())
    updateProductVariantDto: UpdateProductVariantDto,
    @CurrentUser() user: User,
  ) {
    updateProductVariantDto.updatedBy = user.id;
    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ) {
    return this.productVariantsService.remove(id, { updatedBy: user.id });
  }
}
