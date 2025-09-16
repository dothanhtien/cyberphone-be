import { Test, TestingModule } from '@nestjs/testing';
import { unlink } from 'fs/promises';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Category } from './entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

jest.mock('fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));

describe('CategoriesController', () => {
  let categoriesController: CategoriesController;
  let categoriesService: jest.Mocked<CategoriesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            getLogoPath: jest.fn(),
          },
        },
      ],
    }).compile();

    categoriesController =
      module.get<CategoriesController>(CategoriesController);
    categoriesService = module.get(CategoriesService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockUser: User = { id: 'user-1' } as User;

  describe('create', () => {
    it('should call categoriesService.create with createdBy set', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
        slug: 'Test-Category',
      };

      const returned = {
        ...createCategoryDto,
        createdBy: mockUser.id,
      } as Category;

      const categoriesServiceCreateSpy = jest
        .spyOn(categoriesService, 'create')
        .mockResolvedValue(returned);

      const result = await categoriesController.create(
        createCategoryDto,
        undefined,
        mockUser,
      );

      expect(categoriesServiceCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createCategoryDto,
          createdBy: mockUser.id,
        }),
      );
      expect(result).toEqual(returned);
    });

    it('should set logoUrl when logo is provided', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
        slug: 'test-category',
      };
      const mockLogo = { filename: 'logo.png' } as Express.Multer.File;

      const returned = {
        ...createCategoryDto,
        createdBy: mockUser.id,
        logoUrl: `/uploads/categories/${mockLogo.filename}`,
      } as Category;

      const categoriesServiceCreateSpy = jest
        .spyOn(categoriesService, 'create')
        .mockResolvedValue(returned);

      const result = await categoriesController.create(
        createCategoryDto,
        mockLogo,
        mockUser,
      );

      expect(categoriesServiceCreateSpy).toHaveBeenCalledWith({
        ...createCategoryDto,
        createdBy: mockUser.id,
        logoUrl: `/uploads/categories/${mockLogo.filename}`,
      });
      expect(result).toEqual(returned);
    });
  });

  describe('findAll', () => {
    it('should call categoriesService.findAll with query', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };
      const returned = {
        items: [],
        totalCount: 0,
        currentPage: 1,
        itemsPerPage: 10,
      };

      const categoriesServiceFindAllSpy = jest
        .spyOn(categoriesService, 'findAll')
        .mockResolvedValue(returned);

      const result = await categoriesController.findAll(query);

      expect(categoriesServiceFindAllSpy).toHaveBeenCalledWith(query);
      expect(result).toEqual(returned);
    });
  });

  describe('findOne', () => {
    it('should call categoriesService.findOne with id', async () => {
      const returned = { id: 'cat-1', name: 'Category' };

      const categoriesServiceFindOneSpy = jest
        .spyOn(categoriesService, 'findOne')
        .mockResolvedValue(returned as Category);

      const result = await categoriesController.findOne('cat-1');

      expect(categoriesServiceFindOneSpy).toHaveBeenCalledWith('cat-1');
      expect(result).toEqual(returned);
    });
  });

  describe('update', () => {
    it('should call categoriesService.update with updatedBy set', async () => {
      const dto: UpdateCategoryDto = { name: 'Updated' };
      const returned = { ...dto, updatedBy: mockUser.id };

      const categoriesServiceGetLogoPathSpy = jest
        .spyOn(categoriesService, 'getLogoPath')
        .mockResolvedValue(null);
      const categoriesServiceUpdateSpy = jest
        .spyOn(categoriesService, 'update')
        .mockResolvedValue(returned as Category);

      const result = await categoriesController.update(
        'cat-1',
        dto,
        undefined,
        mockUser,
      );

      expect(categoriesServiceUpdateSpy).toHaveBeenCalledWith('cat-1', {
        ...dto,
        updatedBy: mockUser.id,
      });
      expect(result).toEqual(returned);
      expect(categoriesServiceGetLogoPathSpy).toHaveBeenCalledWith('cat-1');
      expect(unlink).not.toHaveBeenCalled();
    });

    it('should set logoUrl when logo is provided', async () => {
      const dto: UpdateCategoryDto = { name: 'Updated' };
      const mockLogo = { filename: 'new-logo.png' } as Express.Multer.File;

      jest.spyOn(categoriesService, 'getLogoPath').mockResolvedValue('old.png');
      const returned = {
        ...dto,
        updatedBy: mockUser.id,
        logoUrl: `/uploads/categories/${mockLogo.filename}`,
      };

      const categoriesServiceUpdateSpy = jest
        .spyOn(categoriesService, 'update')
        .mockResolvedValue(returned as Category);

      const result = await categoriesController.update(
        'cat-1',
        dto,
        mockLogo,
        mockUser,
      );

      expect(categoriesServiceUpdateSpy).toHaveBeenCalledWith('cat-1', {
        ...dto,
        updatedBy: mockUser.id,
        logoUrl: `/uploads/categories/${mockLogo.filename}`,
      });
      expect(result).toEqual(returned);
    });

    it('should delete old logo when removeLogo is true', async () => {
      const dto: UpdateCategoryDto = { name: 'Updated', removeLogo: true };

      jest
        .spyOn(categoriesService, 'getLogoPath')
        .mockResolvedValue('old-logo.png');
      jest.spyOn(categoriesService, 'update').mockResolvedValue({
        ...dto,
        updatedBy: mockUser.id,
      } as Category);

      jest.mocked(unlink).mockResolvedValue(undefined);

      await categoriesController.update('cat-1', dto, undefined, mockUser);

      expect(unlink).toHaveBeenCalledWith(
        expect.stringContaining('old-logo.png'),
      );
    });
  });

  describe('deactiveCategory', () => {
    it('should call categoriesService.update to set isActive false and return true', async () => {
      const categoriesServiceUpdateSpy = jest
        .spyOn(categoriesService, 'update')
        .mockResolvedValue({
          isActive: false,
        } as Category);

      const result = await categoriesController.deactiveCategory(
        'cat-1',
        mockUser,
      );

      expect(categoriesServiceUpdateSpy).toHaveBeenCalledWith('cat-1', {
        isActive: false,
        updatedBy: mockUser.id,
      });
      expect(result).toBe(true);
    });
  });
});
