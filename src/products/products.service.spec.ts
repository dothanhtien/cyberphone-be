import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Brand } from 'src/brands/entities/brand.entity';
import { Category } from 'src/categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productRepository: Repository<Product>;
  let brandRepository: Repository<Brand>;
  let categoryRepository: Repository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useClass: Repository },
        { provide: getRepositoryToken(Brand), useClass: Repository },
        { provide: getRepositoryToken(Category), useClass: Repository },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    brandRepository = module.get<Repository<Brand>>(getRepositoryToken(Brand));
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  describe('create', () => {
    const dto: CreateProductDto = {
      name: 'Test Product',
      slug: 'TEST-PRODUCT',
      brandId: 'brand-123',
      categoryId: 'cat-123',
    };

    it('should throw BadRequestException if slug already exists and active', async () => {
      const findOneSpy = jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValue({
          id: '1',
          slug: 'test-product',
          isActive: true,
        } as Product);

      await expect(productsService.create(dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { slug: 'test-product' },
      });
    });

    it('should throw BadRequestException if brand does not exist', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);
      const brandExistsSpy = jest
        .spyOn(brandRepository, 'exists')
        .mockResolvedValue(false);

      await expect(productsService.create(dto)).rejects.toThrow(
        'Brand does not exist',
      );

      expect(brandExistsSpy).toHaveBeenCalledWith({
        where: { id: dto.brandId, isActive: true },
      });
    });

    it('should throw BadRequestException if category does not exist', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(brandRepository, 'exists').mockResolvedValue(true);
      const categoryExistsSpy = jest
        .spyOn(categoryRepository, 'exists')
        .mockResolvedValue(false);

      await expect(productsService.create(dto)).rejects.toThrow(
        'Category does not exist',
      );

      expect(categoryExistsSpy).toHaveBeenCalledWith({
        where: { id: dto.categoryId, isActive: true },
      });
    });

    it('should save product when valid', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(brandRepository, 'exists').mockResolvedValue(true);
      jest.spyOn(categoryRepository, 'exists').mockResolvedValue(true);

      const savedProduct = {
        id: 'p-1',
        ...dto,
        slug: dto.slug.toLowerCase(),
        isActive: true,
      } as Product;

      const saveSpy = jest
        .spyOn(productRepository, 'save')
        .mockResolvedValue(savedProduct);

      const result = await productsService.create(dto);

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          slug: 'test-product',
          brandId: dto.brandId,
          categoryId: dto.categoryId,
          isActive: true,
        }),
      );
      expect(result).toEqual(savedProduct);
    });

    it('should allow reusing slug if existing product is inactive', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue({
        id: 'old-id',
        slug: 'test-product',
        isActive: false,
      } as Product);
      jest.spyOn(brandRepository, 'exists').mockResolvedValue(true);
      jest.spyOn(categoryRepository, 'exists').mockResolvedValue(true);

      const savedProduct = {
        id: 'new-id',
        ...dto,
        slug: 'test-product',
        isActive: true,
      } as Product;

      const saveSpy = jest
        .spyOn(productRepository, 'save')
        .mockResolvedValue(savedProduct);

      const result = await productsService.create(dto);

      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual(savedProduct);
    });
  });
});
