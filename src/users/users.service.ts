import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUserDto,
  UserCreateEntityDto,
  UpdateUserDto,
  UserResponseDto,
  UserUpdateEntityDto,
} from './dto';
import { User } from './entities';
import { UserMapper } from './mappers';
import {
  type IRoleRepository,
  type IUserRepository,
  ROLE_REPOSITORY,
  USER_REPOSITORY,
} from './repositories';
import { PaginationQueryDto } from '@/common/dto';
import { PaginatedEntity } from '@/common/types';
import {
  extractPaginationParams,
  getErrorStack,
  isUniqueConstraintError,
  maskIdentifier,
  sanitizeEntityInput,
} from '@/common/utils';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { phone, email } = createUserDto;

    const maskedPhone = maskIdentifier(phone);
    const maskedEmail = email ? maskIdentifier(email) : undefined;

    this.logger.log(
      `[create] Creating user phone=${maskedPhone}, email=${maskedEmail}`,
    );

    try {
      const [isPhoneExists, isEmailExist, isRoleExist] = await Promise.all([
        this.userRepository.existsActiveByPhone(createUserDto.phone),
        email
          ? this.userRepository.existsActiveByEmail(email)
          : Promise.resolve(false),
        this.roleRepository.existsActiveById(createUserDto.roleId),
      ]);

      if (isEmailExist) {
        throw new BadRequestException('Email already exists');
      }

      if (isPhoneExists) {
        throw new BadRequestException('Phone already exists');
      }

      if (!isRoleExist) {
        throw new BadRequestException('Role not found');
      }

      const user = sanitizeEntityInput(UserCreateEntityDto, createUserDto);

      const savedUser = await this.userRepository.create(user);

      this.logger.log(`[create] User created successfully id=${savedUser.id}`);

      return { id: savedUser.id };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        this.logger.warn(
          `[create] Unique constraint violation phone=${maskedPhone}, email=${maskedEmail}`,
        );

        throw new ConflictException('Phone or Email already exists');
      }

      this.logger.error(
        `[create] Failed to create user phone=${maskedPhone}, email=${maskedEmail}`,
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
      `[findOneActiveByIdentifier] Fetching user identifier=${maskIdentifier(identifier)}`,
    );
    return this.userRepository.findOneActiveByIdentifier(identifier);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    this.logger.debug(`[update] Updating user id=${id}`);

    const userExists = await this.userRepository.findOneActiveById(id);

    if (!userExists) {
      throw new NotFoundException('User not found');
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

    if (updateUserDto.email) {
      const exists = await this.userRepository.existsActiveByEmailExcludingId(
        updateUserDto.email,
        id,
      );

      if (exists) {
        throw new BadRequestException('Email already exists');
      }
    }

    // TODO: review role update permmision
    if (updateUserDto.roleId) {
      const roleExists = await this.roleRepository.existsActiveById(
        updateUserDto.roleId,
      );

      if (!roleExists) {
        throw new BadRequestException('Role not found');
      }
    }

    try {
      // TODO: update password via identities table

      const result = await this.userRepository.update(
        id,
        sanitizeEntityInput(UserUpdateEntityDto, updateUserDto),
      );
      this.logger.log(`[update] User updated successfully id=${id}`);
      return result;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Phone or Email already exists');
      }

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

  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.userRepository.updateLastLogin(id);

      this.logger.debug(
        `[updateLastLogin] Last login updated successfully id=${id}`,
      );
    } catch (error) {
      this.logger.error(
        `[updateLastLogin] Failed to update last login id=${id}`,
        getErrorStack(error),
      );

      throw error;
    }
  }
}
