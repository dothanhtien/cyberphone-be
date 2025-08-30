import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Category } from './entities/category.entity';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let categoryRepository: jest.Mocked<Repository<Category>>;
  let categoriesService: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            save: jest.fn(),
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    categoryRepository = module.get(getRepositoryToken(Category));
    categoriesService = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new category if slug is new', async () => {
      categoryRepository.findOne.mockResolvedValue(null);
      categoryRepository.save.mockImplementation((cat) =>
        Promise.resolve(cat as Category),
      );

      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
        slug: 'Test-Category',
      };
      const result = await categoriesService.create(createCategoryDto);

      expect(result.name).toBe('Test Category');
      expect(result.slug).toBe('test-category');
      expect(result.isActive).toBe(true);
    });

    it('should create a new category if slug exists but inactive', async () => {
      const id = uuidv4();
      categoryRepository.findOne.mockResolvedValue({
        id,
        name: 'Old Category',
        slug: 'test-category',
        isActive: false,
      } as Category);

      const saveSpy = jest
        .spyOn(categoryRepository, 'save')
        .mockImplementation((cat) => Promise.resolve(cat as Category));

      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
        slug: 'Test-Category',
      };
      const result = await categoriesService.create(createCategoryDto);

      expect(result.name).toBe('Test Category');
      expect(result.slug).toBe('test-category');
      expect(result.isActive).toBe(true);
      expect(result.id).toBe(id);
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ id }));
    });

    it('should throw BadRequestException if slug exists and active', async () => {
      categoryRepository.findOne.mockResolvedValue({
        id: uuidv4(),
        isActive: true,
      } as Category);

      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
        slug: 'Test-Category',
      };
      await expect(categoriesService.create(createCategoryDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      categoryRepository.findAndCount.mockResolvedValue([
        [{ id: uuidv4() } as Category],
        1,
      ]);
      const result = await categoriesService.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.currentPage).toBe(1);
      expect(result.itemsPerPage).toBe(10);
    });

    it('should use default page/limit if not provided', async () => {
      categoryRepository.findAndCount.mockResolvedValue([
        [{ id: uuidv4() } as Category],
        1,
      ]);
      const result = await categoriesService.findAll({});

      expect(result.currentPage).toBe(1);
      expect(result.itemsPerPage).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if no category found', async () => {
      categoryRepository.query.mockResolvedValue([]);
      await expect(categoriesService.findOne('Test')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return a category tree', async () => {
      categoryRepository.query.mockResolvedValue([
        {
          id: '1',
          name: 'Root',
          slug: 'root',
          parentId: null,
          isActive: true,
          children: [],
        },
        {
          id: '2',
          name: 'Child',
          slug: 'child',
          parentId: '1',
          isActive: true,
          children: [],
        },
        {
          id: '3',
          name: 'Grandchild',
          slug: 'grandchild',
          parentId: '2',
          isActive: true,
          children: [],
        },
      ]);

      const result: Category = (await categoriesService.findOne('1'))!;

      expect(result.id).toBe('1');
      expect(result.children).toHaveLength(1);
      expect(result.children[0].id).toBe('2');
      expect(result.children[0].children[0].id).toBe('3');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if category not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);
      await expect(
        categoriesService.update('1', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if slug already exists and active', async () => {
      categoryRepository.findOne
        .mockResolvedValueOnce({
          id: '1',
          slug: 'old',
          isActive: true,
        } as Category)
        .mockResolvedValueOnce({
          id: '2',
          slug: 'new',
          isActive: true,
        } as Category);

      const updateCategoryDto: UpdateCategoryDto = { slug: 'new' };
      await expect(
        categoriesService.update('1', updateCategoryDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if parentId = id', async () => {
      categoryRepository.findOne.mockResolvedValue({
        id: '1',
        slug: 'old',
        isActive: true,
      } as Category);
      await expect(
        categoriesService.update('1', { parentId: '1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if parentId is descendant', async () => {
      categoryRepository.findOne.mockResolvedValue({
        id: '1',
        slug: 'old',
        isActive: true,
      } as Category);
      categoryRepository.query.mockResolvedValue([{ id: '2', parentId: '1' }]);

      await expect(
        categoriesService.update('1', { parentId: '2' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update successfully with valid parentId', async () => {
      categoryRepository.findOne
        .mockResolvedValueOnce({
          id: '1',
          slug: 'old',
          isActive: true,
        } as Category)
        .mockResolvedValueOnce({
          id: '10',
          slug: 'parent',
          isActive: true,
        } as Category);
      categoryRepository.query.mockResolvedValue([]);
      categoryRepository.save.mockImplementation((cat) =>
        Promise.resolve(cat as Category),
      );

      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated',
        parentId: '10',
      };
      const result = await categoriesService.update('1', updateCategoryDto);

      expect(result.name).toBe('Updated');
      expect(result.parentId).toBe('10');
    });
  });

  describe('getDescendants', () => {
    it('should return descendants from query', async () => {
      categoryRepository.query.mockResolvedValue([
        { id: '2', parentId: '1' },
        { id: '3', parentId: '2' },
      ]);
      const result = await categoriesService.getDescendants('1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
    });

    it('should return empty array if no descendants', async () => {
      categoryRepository.query.mockResolvedValue([]);
      const result = await categoriesService.getDescendants('1');
      expect(result).toHaveLength(0);
    });
  });
});
