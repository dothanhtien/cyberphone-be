import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/users/entities/user.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: jest.Mocked<ProductsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    productsController = module.get<ProductsController>(ProductsController);
    productsService = module.get(ProductsService);
  });

  const mockUser: User = { id: 'user-1' } as User;

  describe('create', () => {
    it('should call productsService.create with createdBy set', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        slug: 'TEST-PRODUCT',
        brandId: 'brand-123',
        categoryId: 'cat-123',
      };

      const returned = {
        ...createProductDto,
        createdBy: mockUser.id,
      } as Product;

      const productsServiceCreateSpy = jest
        .spyOn(productsService, 'create')
        .mockImplementation(() => Promise.resolve(returned));

      const result = await productsController.create(
        createProductDto,
        mockUser,
      );

      expect(productsServiceCreateSpy).toHaveBeenCalledWith({
        ...createProductDto,
        createdBy: mockUser.id,
      });
      expect(result).toEqual(returned);
    });
  });
});
