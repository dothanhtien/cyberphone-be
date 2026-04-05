import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities';

export interface IRoleRepository {
  existsActiveById(id: string): Promise<boolean>;
}

export const ROLE_REPOSITORY = Symbol('IRoleRepository');

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  existsActiveById(id: string): Promise<boolean> {
    return this.roleRepository.exists({ where: { id, isActive: true } });
  }
}
