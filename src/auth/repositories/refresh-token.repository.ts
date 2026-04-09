import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities';
import { CreateRefreshTokenParams } from '../types';

export interface IRefreshTokenRepository {
  create(data: CreateRefreshTokenParams): Promise<RefreshToken>;
  findById(id: string): Promise<RefreshToken | null>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(id: string, replacedByTokenId?: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = Symbol('IRefreshTokenRepository');

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  create(data: CreateRefreshTokenParams): Promise<RefreshToken> {
    return this.refreshTokenRepository.save(data);
  }

  findById(id: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { id },
      relations: ['identity'],
    });
  }

  findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: ['identity', 'identity.user', 'identity.customer'],
    });
  }

  async revoke(id: string, replacedByTokenId?: string): Promise<void> {
    await this.refreshTokenRepository.update(id, {
      revokedAt: new Date(),
      replacedByToken: replacedByTokenId ?? null,
    });
  }
}
