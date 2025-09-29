import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductVariantsTable1759078378154
  implements MigrationInterface
{
  name = 'CreateProductVariantsTable1759078378154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "product_variants" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "product_id" uuid NOT NULL, 
          "sku" character varying(100) NOT NULL, 
          "name" character varying(255) NOT NULL, 
          "slug" character varying(255) NOT NULL, 
          "base_price" numeric(12, 2) NOT NULL, 
          "sale_price" numeric(12, 2), 
          "cost_price" numeric(10, 2), 
          "weight_kg" numeric(6, 3), 
          "stock_quantity" integer, 
          "low_stock_threshold" integer, 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_product_variants_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_product_variants_slug_active" ON "product_variants" ("slug") WHERE "is_active" = true`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_product_variants_sku_active" ON "product_variants" ("sku") WHERE "is_active" = true`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_variants_created_at" ON "product_variants" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_variants_is_active" ON "product_variants" ("is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_variants_product_id" ON "product_variants" ("product_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "fk_product_variants_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "fk_product_variants_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_variants_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_variants_is_active"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_variants_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_product_variants_sku_active"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_product_variants_slug_active"`,
    );
    await queryRunner.query(`DROP TABLE "product_variants"`);
  }
}
