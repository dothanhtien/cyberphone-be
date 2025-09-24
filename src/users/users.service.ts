import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { PasswordService } from 'src/common/password/password.service';
import { User } from './entities/user.entity';
import { PaginatedEntity } from 'src/common/interfaces/pagination.interface';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.trim().toLowerCase();

    const isEmailExist = await this.userRepository.existsBy({
      email,
      isActive: true,
    });

    if (isEmailExist) {
      throw new BadRequestException('Email or Phone already exists');
    }

    if (createUserDto.phone) {
      const isPhoneExist = await this.userRepository.existsBy({
        phone: createUserDto.phone,
        isActive: true,
      });

      if (isPhoneExist) {
        throw new BadRequestException('Phone already exists');
      }
    }

    const newUser = plainToInstance(User, createUserDto, {
      excludeExtraneousValues: true,
    });

    newUser.email = email;
    newUser.passwordHash = await this.passwordService.hashPassword(
      createUserDto.password,
    );

    return this.userRepository.save(newUser);
  }

  async findAll(
    getUsersDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<User>> {
    const page = getUsersDto.page || 1;
    const limit = getUsersDto.limit || 10;

    const [users, totalCount] = await this.userRepository.findAndCount({
      where: { isActive: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: users,
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.email) {
      updateUserDto.email = updateUserDto.email.trim().toLowerCase();
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const isEmailTaken = await this.userRepository.existsBy({
        email: updateUserDto.email,
        isActive: true,
      });
      if (isEmailTaken) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const isPhoneTaken = await this.userRepository.existsBy({
        phone: updateUserDto.phone,
        isActive: true,
      });
      if (isPhoneTaken) throw new BadRequestException('Phone already exists');
    }

    if (updateUserDto.password) {
      user.passwordHash = await this.passwordService.hashPassword(
        updateUserDto.password,
      );
    }

    const updates = Object.fromEntries(
      Object.entries(updateUserDto).filter(([, value]) => value !== undefined),
    );

    Object.assign(user, updates);

    const dataToUpdate = plainToInstance(User, user, {
      excludeExtraneousValues: true,
    });

    return this.userRepository.save(dataToUpdate);
  }
}
