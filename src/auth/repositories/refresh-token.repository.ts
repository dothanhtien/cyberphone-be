import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RefreshToken } from '../entities';
import { CreateRefreshTokenParams } from '../types';

export interface IRefreshTokenRepository {
  create(data: CreateRefreshTokenParams): Promise<RefreshToken>;
  findById(id: string): Promise<RefreshToken | null>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(id: string, replacedByTokenId?: string): Promise<void>;
  rotate(
    existingId: string,
    newTokenData: CreateRefreshTokenParams,
  ): Promise<RefreshToken>;
}

export const REFRESH_TOKEN_REPOSITORY = Symbol('IRefreshTokenRepository');

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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

  async rotate(
    existingId: string,
    newTokenData: CreateRefreshTokenParams,
  ): Promise<RefreshToken> {
    return this.dataSource.transaction(async (tx) => {
      const existing = await tx.findOne(RefreshToken, {
        where: { id: existingId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!existing) {
        throw new Error('TOKEN_NOT_FOUND');
      }

      if (existing.revokedAt) {
        throw new Error('CONCURRENT_ROTATION');
      }

      const newRecord = tx.create(RefreshToken, newTokenData);
      await tx.save(RefreshToken, newRecord);

      await tx.update(RefreshToken, existingId, {
        revokedAt: new Date(),
        replacedByToken: newRecord.id,
      });

      return newRecord;
    });
  }
}
