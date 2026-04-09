import { createHash } from 'crypto';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities';
import { AuthMapper } from './mappers';
import {
  type IRefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from './repositories';
import { AuthUser } from './types';
import { getErrorStack } from '@/common/utils';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);
  private readonly expiresInSeconds: number;

  constructor(
    private readonly configService: ConfigService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {
    this.expiresInSeconds = Number(
      this.configService.getOrThrow<number>('REFRESH_TOKEN_TTL', 2592000),
    );
  }

  async create(identityId: string): Promise<string> {
    const token = uuidv4();
    const tokenHash = this.hash(token);

    await this.refreshTokenRepository.create({
      identityId,
      tokenHash,
      expiresAt: dayjs().add(this.expiresInSeconds, 'seconds').toDate(),
    });

    return token;
  }

  async rotate(
    rawToken: string,
  ): Promise<{ authUser: AuthUser; newToken: string }> {
    const tokenHash = this.hash(rawToken);

    this.logger.debug(`[rotate] Looking up refresh token`);

    let existing: RefreshToken | null;
    try {
      existing = await this.refreshTokenRepository.findByTokenHash(tokenHash);
    } catch (error) {
      this.logger.error(`[rotate] DB error`, getErrorStack(error));
      throw error;
    }

    if (!existing) {
      this.logger.debug(`[rotate] Token not found`);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existing.revokedAt) {
      this.logger.warn(`[rotate] Token already revoked id=${existing.id}`);
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (dayjs().isAfter(existing.expiresAt)) {
      this.logger.debug(`[rotate] Token expired id=${existing.id}`);
      throw new UnauthorizedException('Refresh token has expired');
    }

    const account = existing.identity.user ?? existing.identity.customer;

    if (!account) {
      this.logger.error(
        `[rotate] Identity has no owner identityId=${existing.identityId}`,
      );
      throw new UnauthorizedException('Account not found');
    }

    const newToken = uuidv4();
    const newTokenHash = this.hash(newToken);

    let newRecord: RefreshToken;
    try {
      newRecord = await this.refreshTokenRepository.rotate(existing.id, {
        identityId: existing.identityId,
        tokenHash: newTokenHash,
        expiresAt: dayjs().add(this.expiresInSeconds, 'seconds').toDate(),
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'CONCURRENT_ROTATION') {
        this.logger.warn(
          `[rotate] Concurrent rotation detected id=${existing.id}`,
        );
        throw new UnauthorizedException('Refresh token has been revoked');
      }
      this.logger.error(
        `[rotate] DB error during rotation`,
        getErrorStack(err),
      );
      throw err;
    }

    this.logger.debug(
      `[rotate] Token rotated oldId=${existing.id} newId=${newRecord.id}`,
    );

    const authUser = AuthMapper.mapToAuthUser({
      ...account,
      identityId: existing.identityId,
    });

    return { authUser, newToken };
  }

  async revoke(accountId: string, rawToken: string): Promise<void> {
    const tokenHash = this.hash(rawToken);

    let token: RefreshToken | null;
    try {
      token = await this.refreshTokenRepository.findByTokenHash(tokenHash);
    } catch (error) {
      this.logger.error(`[revoke] DB error`, getErrorStack(error));
      throw error;
    }

    if (!token) {
      this.logger.warn(`[revoke] Token not found`);
      return;
    }

    if (token.revokedAt) {
      this.logger.debug(`[revoke] Token already revoked id=${token.id}`);
      return;
    }

    const ownerAccountId = token.identity.userId ?? token.identity.customerId;
    if (ownerAccountId !== accountId) {
      this.logger.warn(
        `[revoke] Unauthorized attempt id=${token.id} accountId=${accountId}`,
      );
      throw new ForbiddenException('Not authorized to revoke this token');
    }

    await this.refreshTokenRepository.revoke(token.id);

    this.logger.debug(`[revoke] Token revoked id=${token.id}`);
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
