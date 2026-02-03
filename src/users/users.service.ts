import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './entities/role.entity';
import { PasswordService } from '@/password/password.service';
import { toEntity } from '@/common/utils/entities';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';
import {
  buildPaginationParams,
  extractPaginationParams,
} from '@/common/utils/paginations.util';
import { PaginatedEntity } from '@/common/types/paginations.type';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    createUserDto.username = createUserDto.username.toLowerCase();

    const isUsernameExist = await this.userRepository.exists({
      where: {
        username: createUserDto.username,
        isActive: true,
      },
    });
    if (isUsernameExist) {
      throw new BadRequestException('Username already exists');
    }

    const isPhoneExists = await this.userRepository.exists({
      where: {
        phone: createUserDto.phone,
        isActive: true,
      },
    });
    if (isPhoneExists) {
      throw new BadRequestException('Phone already exists');
    }

    const isRoleExist = await this.roleRepository.existsBy({
      id: createUserDto.roleId,
    });
    if (!isRoleExist) {
      throw new BadRequestException('Role not found');
    }

    const user = toEntity(User, createUserDto);

    user.passwordHash = await this.passwordService.hashPassword(
      createUserDto.password,
    );

    return this.userRepository.save(user);
  }

  async findAll(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<User>> {
    const { page, limit } = extractPaginationParams(paginationQueryDto);

    const [users, totalCount] = await this.userRepository.findAndCount({
      where: { isActive: true },
      ...buildPaginationParams(page, limit),
      order: { updatedAt: 'DESC' },
    });

    return {
      items: users,
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id, isActive: true });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneByEmailOrPhone(identifier: string) {
    const normalizedIdentifier = identifier.trim().toLowerCase();

    return this.userRepository.findOne({
      where: [
        { username: normalizedIdentifier, isActive: true },
        { phone: normalizedIdentifier, isActive: true },
      ],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.username) {
      updateUserDto.username = updateUserDto.username.toLowerCase();
    }

    if (updateUserDto.username) {
      const exists = await this.userRepository.exists({
        where: {
          username: updateUserDto.username,
          isActive: true,
          id: Not(id),
        },
      });
      if (exists) {
        throw new BadRequestException('Username already exists');
      }
    }

    if (updateUserDto.phone) {
      const exists = await this.userRepository.exists({
        where: {
          phone: updateUserDto.phone,
          isActive: true,
          id: Not(id),
        },
      });
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
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      user.passwordHash = await this.passwordService.hashPassword(
        updateUserDto.password,
      );
    }

    this.userRepository.merge(user, toEntity(User, updateUserDto));

    return this.userRepository.save(user);
  }
}
