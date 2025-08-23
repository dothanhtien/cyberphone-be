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
import { PaginatedUsers } from './interfaces';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const emailExists = await this.userRepository.existsBy({
      email: createUserDto.email,
    });
    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    const newUser = plainToInstance(User, createUserDto);
    newUser.passwordHash = await this.passwordService.hashPassword(
      createUserDto.password,
    );
    return this.userRepository.save(newUser);
  }

  async findAll(getUsersDto: GetUsersDto): Promise<PaginatedUsers> {
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
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const exists = await this.userRepository.existsBy({
        email: updateUserDto.email,
      });
      if (exists) throw new BadRequestException('Email already exists');
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

    return this.userRepository.save(user);
  }
}
