import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUserDto,
  UserCreateEntityDto,
  UpdateUserDto,
  UserResponseDto,
} from './dto';
import { User, Role } from './entities';
import { type IUserRepository, USER_REPOSITORY } from './repositories';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';
import { PasswordService } from '@/password/password.service';
import { PaginatedEntity } from '@/common/types';
import {
  extractPaginationParams,
  getErrorStack,
  isUniqueConstraintError,
  sanitizeEntityInput,
} from '@/common/utils';
import { UserMapper } from './mappers';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log(
      `[create] Creating user username=${createUserDto.username}, phone=${createUserDto.phone}`,
    );

    createUserDto.username = createUserDto.username.toLowerCase();

    try {
      const [isUsernameExist, isPhoneExists, isRoleExist] = await Promise.all([
        this.userRepository.existsActiveByUsername(createUserDto.username),
        this.userRepository.existsActiveByPhone(createUserDto.phone),
        this.roleRepository.existsBy({
          id: createUserDto.roleId,
        }),
      ]);

      if (isUsernameExist) {
        throw new BadRequestException('Username already exists');
      }

      if (isPhoneExists) {
        throw new BadRequestException('Phone already exists');
      }

      if (!isRoleExist) {
        throw new BadRequestException('Role not found');
      }

      const user = sanitizeEntityInput(UserCreateEntityDto, createUserDto);

      user.passwordHash = await this.passwordService.hashPassword(
        createUserDto.password,
      );

      const savedUser = await this.userRepository.create(user);

      this.logger.log(`[create] User created successfully id=${savedUser.id}`);

      return { id: savedUser.id };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        this.logger.warn(
          `[create] Unique constraint violation username=${createUserDto.username}, phone=${createUserDto.phone}`,
        );

        throw new ConflictException('Username or phone already exists');
      }

      this.logger.error(
        `[create] Failed to create user username=${createUserDto.username}`,
        getErrorStack(error),
      );

      throw error;
    }
  }

  async findAll(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<UserResponseDto>> {
    const { page, limit } = extractPaginationParams(paginationQueryDto);
    this.logger.debug(`[findAll] Fetching users page=${page}, limit=${limit}`);

    try {
      const result = await this.userRepository.findAllActive(page, limit);

      this.logger.debug(`[findAll] Fetched ${result.items.length} users`);

      return {
        ...result,
        items: result.items.map((user) => UserMapper.mapToUserResponse(user)),
      };
    } catch (error) {
      this.logger.error(
        `[findAll] Failed to fetch users page=${page}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<UserResponseDto> {
    this.logger.debug(`[findOne] Fetching user id=${id}`);

    const user = await this.userRepository.findOneActiveById(id);

    if (!user) {
      this.logger.warn(`[findOne] User not found id=${id}`);
      throw new NotFoundException('User not found');
    }

    return UserMapper.mapToUserResponse(user);
  }

  async findOneActiveByIdentifier(identifier: string) {
    this.logger.log(
      `[findOneActiveByIdentifier] Fetching user identifier=${identifier}`,
    );
    return this.userRepository.findOneActiveByIdentifier(identifier);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    this.logger.debug(`[update] Updating user id=${id}`);

    const userExists = await this.userRepository.findOneActiveById(id);
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.username) {
      updateUserDto.username = updateUserDto.username.toLowerCase();
      const exists =
        await this.userRepository.existsActiveByUsernameExcludingId(
          updateUserDto.username,
          id,
        );

      if (exists) {
        throw new BadRequestException('Username already exists');
      }
    }

    if (updateUserDto.phone) {
      const exists = await this.userRepository.existsActiveByPhoneExcludingId(
        updateUserDto.phone,
        id,
      );

      if (exists) {
        throw new BadRequestException('Phone already exists');
      }
    }

    if (updateUserDto.roleId) {
      const roleExists = await this.roleRepository.existsBy({
        id: updateUserDto.roleId,
      });

      if (!roleExists) {
        throw new BadRequestException('Role not found');
      }
    }

    if (updateUserDto.password) {
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException('Current password is required');
      }

      const isPasswordValid = await this.passwordService.comparePassword(
        updateUserDto.currentPassword,
        userExists.passwordHash,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      updateUserDto.password = await this.passwordService.hashPassword(
        updateUserDto.password,
      );
    }

    try {
      const result = await this.userRepository.update(id, updateUserDto);
      this.logger.log(`[update] User updated successfully id=${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `[update] Failed to update user id=${id}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  findOneActiveById(id: string): Promise<User | null> {
    this.logger.debug(`[findOneById] Fetching user id=${id}`);
    return this.userRepository.findOneActiveById(id);
  }

  updateLastLogin(id: string): Promise<void> {
    this.logger.debug(
      `[updateLastLogin] Updating last login for user id=${id}`,
    );
    return this.userRepository.updateLastLogin(id);
  }
}
