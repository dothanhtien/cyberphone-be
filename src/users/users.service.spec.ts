import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { PasswordService } from 'src/common/password/password.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';

describe('UsersService', () => {
  let userRepository: Repository<User>;
  let usersService: UsersService;
  let passwordService: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: PasswordService,
          useValue: { hashPassword: jest.fn() },
        },
      ],
    }).compile();

    userRepository = module.get(getRepositoryToken(User));
    usersService = module.get<UsersService>(UsersService);
    passwordService = module.get(PasswordService);
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'Test@Example.com',
        fullName: 'Test User',
        password: 'secret',
        passwordConfirmation: 'secret',
      };

      jest.spyOn(userRepository, 'existsBy').mockResolvedValue(false);
      jest.spyOn(passwordService, 'hashPassword').mockResolvedValue('hashed');
      jest
        .spyOn(userRepository, 'save')
        .mockImplementation((user) => Promise.resolve(user as User));

      const result = await usersService.create(createUserDto);

      expect(result.email).toBe('test@example.com');
      expect(result.passwordHash).toBe('hashed');
    });

    it('should throw if email exists', async () => {
      const dto: CreateUserDto = {
        email: 'Test@Example.com',
        fullName: 'Test User',
        password: 'secret',
        passwordConfirmation: 'secret',
      };

      jest.spyOn(userRepository, 'existsBy').mockImplementation((query) => {
        let result: boolean = false;
        if ('email' in query && query.email === 'test@example.com') {
          result = true;
        }
        return Promise.resolve(result);
      });

      await expect(usersService.create(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if phone exists', async () => {
      const dto: CreateUserDto = {
        email: 'Test@Example.com',
        fullName: 'Test User',
        password: 'secret',
        passwordConfirmation: 'secret',
        phone: '012345678',
      };

      jest.spyOn(userRepository, 'existsBy').mockImplementation((query) => {
        let result: boolean = false;
        if ('phone' in query && query.phone === '012345678') {
          result = true;
        }
        return Promise.resolve(result);
      });

      await expect(usersService.create(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [{ id: '1', email: 'Test@Example.com' }] as User[];
      jest.spyOn(userRepository, 'findAndCount').mockResolvedValue([users, 1]);

      const getUsersDto: GetUsersDto = { page: 1, limit: 10 };
      const result = await usersService.findAll(getUsersDto);

      expect(result.items).toEqual(users);
      expect(result.totalCount).toBe(1);
      expect(result.currentPage).toBe(1);
      expect(result.itemsPerPage).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return user if exists', async () => {
      const user = { id: '1', email: 'Test@Example.com' } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await usersService.findOne('1');
      expect(result).toBe(user);
    });

    it('should throw if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(usersService.findOne('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneByEmailOrPhone', () => {
    it('should return user if exists', async () => {
      const user = {
        id: '1',
        email: 'Test@Example.com',
        phone: '0987654321',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const emailResult =
        await usersService.findOneByEmailOrPhone('test@example.com');
      const phoneResult =
        await usersService.findOneByEmailOrPhone('0987654321');

      expect(emailResult).toBe(user);
      expect(phoneResult).toBe(user);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await usersService.findOneByEmailOrPhone(
        'nonexistent@example.com',
      );
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {});

    it('should throw if user not found', async () => {});

    it('should throw if new email already exists', async () => {});

    it('should throw if new phone already exists', async () => {});
  });
});
