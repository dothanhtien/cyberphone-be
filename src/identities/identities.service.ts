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
import { maskIdentifier, sanitizeEntityInput } from '@/common/utils';

@Injectable()
export class IdentitiesService {
  private readonly logger = new Logger(IdentitiesService.name);

  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IIdentityRepository,
  ) {}

  create(data: CreateIdentityParams, tx: EntityManager) {
    const entity = sanitizeEntityInput(IdentityCreateEntity, data);

    return this.identityRepository.create(entity, tx);
  }

  existsByValue({
    value,
    provider = AuthProvider.LOCAL,
    tx,
  }: {
    value: string;
    provider?: AuthProvider;
    tx: EntityManager;
  }) {
    return this.identityRepository.existsByValue({ value, provider, tx });
  }

  findOneLocal(identifier: string) {
    const type = this.detectType(identifier);
    const value = this.normalize(identifier, type);

    return this.identityRepository.findOne({
      type,
      value,
      provider: AuthProvider.LOCAL,
    });
  }

  private detectType(identifier: string): IdentityType {
    this.logger.debug(
      `[detectType] Detecting type identifier=${maskIdentifier(identifier)}`,
    );

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
