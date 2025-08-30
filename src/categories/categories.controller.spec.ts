import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Category } from './entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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
          },
        },
      ],
    }).compile();

    categoriesController =
      module.get<CategoriesController>(CategoriesController);
    categoriesService = module.get(CategoriesService);
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

      const mockCategoriesServiceCreate = jest
        .spyOn(categoriesService, 'create')
        .mockImplementation(() => Promise.resolve(returned));

      const result = await categoriesController.create(
        createCategoryDto,
        mockUser,
      );

      expect(mockCategoriesServiceCreate).toHaveBeenCalledWith({
        ...createCategoryDto,
        createdBy: mockUser.id,
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

      const mockCategoriesServiceFindAll = jest
        .spyOn(categoriesService, 'findAll')
        .mockImplementation(() => Promise.resolve(returned));

      const result = await categoriesController.findAll(query);

      expect(mockCategoriesServiceFindAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(returned);
    });
  });

  describe('findOne', () => {
    it('should call categoriesService.findOne with id', async () => {
      const returned = { id: 'cat-1', name: 'Category' };

      const mockCategoriesServiceFindOne = jest
        .spyOn(categoriesService, 'findOne')
        .mockImplementation(() => Promise.resolve(returned as Category));

      const result = await categoriesController.findOne('cat-1');

      expect(mockCategoriesServiceFindOne).toHaveBeenCalledWith('cat-1');
      expect(result).toEqual(returned);
    });
  });

  describe('update', () => {
    it('should call categoriesService.update with updatedBy set', async () => {
      const dto: UpdateCategoryDto = { name: 'Updated' };
      const returned = { ...dto, updatedBy: mockUser.id };

      const mockCategoriesServiceUpdate = jest
        .spyOn(categoriesService, 'update')
        .mockImplementation(() => Promise.resolve(returned as Category));

      const result = await categoriesController.update('cat-1', dto, mockUser);

      expect(mockCategoriesServiceUpdate).toHaveBeenCalledWith('cat-1', {
        ...dto,
        updatedBy: mockUser.id,
      });
      expect(result).toEqual(returned);
    });
  });

  describe('deactiveCategory', () => {
    it('should call categoriesService.update to set isActive false and return true', async () => {
      const mockCategoriesServiceUpdate = jest
        .spyOn(categoriesService, 'update')
        .mockImplementation(() =>
          Promise.resolve({ isActive: false } as Category),
        );

      categoriesService.update.mockResolvedValue({
        isActive: false,
      } as Category);

      const result = await categoriesController.deactiveCategory(
        'cat-1',
        mockUser,
      );

      expect(mockCategoriesServiceUpdate).toHaveBeenCalledWith('cat-1', {
        isActive: false,
        updatedBy: mockUser.id,
      });
      expect(result).toBe(true);
    });
  });
});
