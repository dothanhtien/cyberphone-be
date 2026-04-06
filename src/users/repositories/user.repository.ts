import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Not } from 'typeorm';
import { UserCreateEntityDto } from '../dto/entity-inputs';
import { User } from '../entities';
import { buildPaginationParams } from '@/common/utils';
import { PaginatedEntity } from '@/common/types';

export interface IUserRepository {
  create(dto: UserCreateEntityDto): Promise<User>;
  existsActiveByEmail(email: string): Promise<boolean>;
  existsActiveByPhone(phone: string): Promise<boolean>;
  existsActiveByRoleId(roleId: string): Promise<boolean>;
  existsActiveByEmailExcludingId(
    email: string,
    excludeId?: string,
  ): Promise<boolean>;
  existsActiveByPhoneExcludingId(
    phone: string,
    excludeId?: string,
  ): Promise<boolean>;
  findOneActiveById(id: string): Promise<User | null>;
  findOneActiveByIdentifier(identifier: string): Promise<User | null>;
  findAllActive(page: number, limit: number): Promise<PaginatedEntity<User>>;
  update(
    id: string,
    updateUserDto: Partial<User>,
  ): Promise<{ id: string } | null>;
  updateLastLogin(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(dto: UserCreateEntityDto): Promise<User> {
    return this.userRepository.save(dto);
  }

  existsActiveByEmail(email: string): Promise<boolean> {
    return this.existsActive({ email });
  }

  existsActiveByPhone(phone: string): Promise<boolean> {
    return this.existsActive({ phone });
  }

  existsActiveByEmailExcludingId(
    email: string,
    excludeId?: string,
  ): Promise<boolean> {
    return this.existsActiveWithExclude({ email }, excludeId);
  }

  existsActiveByPhoneExcludingId(
    phone: string,
    excludeId?: string,
  ): Promise<boolean> {
    return this.existsActiveWithExclude({ phone }, excludeId);
  }

  existsActiveByRoleId(roleId: string): Promise<boolean> {
    return this.existsActive({ roleId });
  }

  findOneActiveById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isActive: true },
    });
  }

  findOneActiveByIdentifier(identifier: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [
        { phone: identifier, isActive: true },
        { email: identifier, isActive: true },
      ],
      relations: ['role'],
    });
  }

  async findAllActive(
    page: number,
    limit: number,
  ): Promise<PaginatedEntity<User>> {
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

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLogin: new Date() });
  }

  private existsActive(where: FindOptionsWhere<User>): Promise<boolean> {
    return this.userRepository.exists({
      where: {
        ...where,
        isActive: true,
      },
    });
  }

  private async existsActiveWithExclude(
    where: FindOptionsWhere<User>,
    excludeId?: string,
  ): Promise<boolean> {
    const existing = await this.userRepository.count({
      where: {
        ...where,
        isActive: true,
        ...(excludeId ? { id: Not(excludeId) } : {}),
      },
    });

    return existing > 0;
  }

  async update(
    id: string,
    updateUserDto: Partial<User>,
  ): Promise<{ id: string } | null> {
    const result = await this.userRepository.update(id, updateUserDto);

    if (result.affected === 0) return null;

    return { id };
  }
}
