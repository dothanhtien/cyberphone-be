import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { BrandCreateEntityInput, BrandUpdateEntityInput } from '../dto';
import { Brand } from '../entities';
import { BrandWithExtras } from '../types';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';
import { getErrorStack, isUniqueConstraintError } from '@/common/utils';

export interface IBrandRepository {
  create(data: BrandCreateEntityInput, tx: EntityManager): Promise<Brand>;
  update(
    id: string,
    data: BrandUpdateEntityInput,
    tx: EntityManager,
  ): Promise<Brand>;
  findActiveByIdWithProductCount(
    id: string,
  ): Promise<(Brand & { productCount: number }) | null>;
  findOneWithLogo(id: string): Promise<BrandWithExtras | null>;
  findAllWithLogo(limit: number, offset: number): Promise<BrandWithExtras[]>;
  countAllActive(): Promise<number>;
  existsActiveById(id: string): Promise<boolean>;
  existsActiveBySlug(slug: string, excludeId?: string): Promise<boolean>;
}

export const BRAND_REPOSITORY = Symbol('IBrandRepository');

@Injectable()
export class BrandRepository implements IBrandRepository {
  private readonly logger = new Logger(BrandRepository.name);

  constructor(
    @InjectRepository(Brand)
    private readonly repository: Repository<Brand>,
  ) {}

  async create(
    data: BrandCreateEntityInput,
    tx: EntityManager,
  ): Promise<Brand> {
    try {
      const brand = await tx.save(Brand, data);
      this.logger.debug(`Brand created id=${brand.id}`);
      return brand;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        this.logger.warn(`Unique constraint violation on slug`);
        throw new ConflictException('Brand with this slug already exists');
      }
      this.logger.error(`Failed to create brand entity`, getErrorStack(error));
      throw error;
    }
  }

  update(
    id: string,
    data: BrandUpdateEntityInput,
    tx: EntityManager,
  ): Promise<Brand> {
    return tx.save(Brand, { id, ...data });
  }

  findActiveByIdWithProductCount(
    id: string,
  ): Promise<(Brand & { productCount: number }) | null> {
    return this.repository
      .createQueryBuilder('brand')
      .select(['brand'])
      .where('brand.id = :id AND brand.isActive = true', { id })
      .loadRelationCountAndMap('brand.productCount', 'brand.products')
      .getOne() as Promise<(Brand & { productCount: number }) | null>;
  }

  async findOneWithLogo(id: string): Promise<BrandWithExtras | null> {
    const { entities, raw } = await this.baseBrandQuery()
      .select(['b', 'm.url AS logo'])
      .where('b.id = :id AND b.is_active = true', { id })
      .getRawAndEntities();

    if (!entities.length) return null;

    return {
      ...entities[0],
      logo: (raw[0] as { logo: string | null })?.logo ?? null,
    };
  }

  findAllWithLogo(limit: number, offset: number): Promise<BrandWithExtras[]> {
    return this.baseBrandQuery()
      .leftJoin('products', 'p', 'p.brand_id = b.id AND p.is_active = true')
      .select([
        'b.id AS id',
        'b.name AS name',
        'b.slug AS slug',
        'b.is_active AS "isActive"',
        'b.created_at AS "createdAt"',
        'b.created_by AS "createdBy"',
        'b.updated_at AS "updatedAt"',
        'b.updated_by AS "updatedBy"',
      ])
      .addSelect('m.url', 'logo')
      .addSelect('COUNT(p.id)', 'productCount')
      .where('b.is_active = true')
      .groupBy('b.id, m.url')
      .orderBy('COALESCE(b.updated_at, b.created_at)', 'DESC')
      .offset(offset)
      .limit(limit)
      .getRawMany<BrandWithExtras>();
  }

  countAllActive(): Promise<number> {
    return this.repository.count({ where: { isActive: true } });
  }

  existsActiveById(id: string): Promise<boolean> {
    return this.repository.exists({ where: { id, isActive: true } });
  }

  existsActiveBySlug(slug: string, excludeId?: string): Promise<boolean> {
    return this.repository.exists({
      where: {
        slug,
        isActive: true,
        ...(excludeId && { id: Not(excludeId) }),
      },
    });
  }

  private baseBrandQuery() {
    return this.repository.createQueryBuilder('b').leftJoin(
      'media_assets',
      'm',
      `
        m.ref_type = :refType
        AND m.ref_id::uuid = b.id
        AND m.is_active = true
        AND m.usage_type = :usageType
      `,
      { refType: MediaAssetRefType.BRAND, usageType: MediaAssetUsageType.LOGO },
    );
  }
}
