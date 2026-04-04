import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { IdentityCreateEntity } from './dto';
import { AuthProvider, IdentityType } from './enums';
import { IDENTITY_REPOSITORY, type IIdentityRepository } from './repositories';
import { CreateIdentityParams } from './types';
import {
  getErrorStack,
  maskIdentifier,
  sanitizeEntityInput,
} from '@/common/utils';

@Injectable()
export class IdentitiesService {
  private readonly logger = new Logger(IdentitiesService.name);

  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IIdentityRepository,
  ) {}

  async create(data: CreateIdentityParams, tx: EntityManager) {
    const maskedPhone = maskIdentifier(data.phone);
    const maskedEmail = data.email ? maskIdentifier(data.email) : undefined;

    this.logger.debug(
      `[create] Start phone=${maskedPhone}, email=${maskedEmail}, provider=${data.provider}`,
    );

    try {
      const entities = [
        sanitizeEntityInput(IdentityCreateEntity, {
          value: data.phone,
          type: IdentityType.PHONE,
          provider: data.provider,
          passwordHash: data.passwordHash,
          customerId: data.customerId,
          userId: data.userId,
        }),
      ];

      if (data.email) {
        entities.push(
          sanitizeEntityInput(IdentityCreateEntity, {
            value: data.email,
            type: IdentityType.EMAIL,
            provider: data.provider,
            passwordHash: data.passwordHash,
            customerId: data.customerId,
            userId: data.userId,
          }),
        );
      }

      const result = await this.identityRepository.save(entities, tx);

      this.logger.debug(
        `[create] Success phone=${maskedPhone}, email=${maskedEmail}, count=${result.length}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `[create] Failed phone=${maskedPhone}, email=${maskedEmail}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async existsByValues({
    values,
    provider = AuthProvider.LOCAL,
    tx,
  }: {
    values: string[];
    provider?: AuthProvider;
    tx: EntityManager;
  }) {
    const maskedValues = values.map(maskIdentifier);

    this.logger.debug(
      `[existsByValues] Checking values=${maskedValues.join(',')}, provider=${provider}`,
    );

    try {
      return await this.identityRepository.existsByValues({
        values,
        provider,
        tx,
      });
    } catch (error) {
      this.logger.error(
        `[existsByValues] Failed values=${maskedValues.join(',')}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async findOne(identifier: string, provider: AuthProvider) {
    const maskedIdentifier = maskIdentifier(identifier);

    this.logger.debug(
      `[findOne] Start identifier=${maskedIdentifier}, provider=${provider}`,
    );

    try {
      const type = this.detectType(identifier);
      const value = this.normalize(identifier, type);

      const identity = await this.identityRepository.findOne({
        type,
        value,
        provider,
      });

      if (!identity) {
        this.logger.debug(`[findOne] Not found identifier=${maskedIdentifier}`);
      }

      return identity;
    } catch (error) {
      this.logger.error(
        `[findOne] Failed identifier=${maskedIdentifier}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  private detectType(identifier: string): IdentityType {
    if (identifier.includes('@')) return IdentityType.EMAIL;
    if (/^\d+$/.test(identifier)) return IdentityType.PHONE;

    throw new BadRequestException(
      `Identifier must be one of: ${Object.values(IdentityType).join(', ')}`,
    );
  }

  private normalize(
    identifier: string,
    type: IdentityType = IdentityType.EMAIL,
  ) {
    if (type === IdentityType.EMAIL) {
      return identifier.toLowerCase().trim();
    }

    return identifier.trim();
  }
}
