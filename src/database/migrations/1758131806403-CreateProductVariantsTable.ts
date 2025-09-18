import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductVariantsTable1758131806403
  implements MigrationInterface
{
  name = 'CreateProductVariantsTable1758131806403';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "product_variants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "product_id" uuid NOT NULL, 
        "sku" character varying(100) NOT NULL, 
        "name" character varying(255) NOT NULL, 
        "slug" character varying(255) NOT NULL, 
        "base_price" numeric(12, 2) NOT NULL, 
        "sale_price" numeric(12, 2), 
        "cost_price" numeric(10, 2), 
        "weight_kg" numeric(6, 3) NOT NULL DEFAULT '0', 
        "stock_quantity" integer NOT NULL DEFAULT '0', 
        "low_stock_threshold" integer NOT NULL DEFAULT '5', 
        "is_active" boolean NOT NULL DEFAULT true, 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        "created_by" character varying(100), 
        "updated_at" TIMESTAMP DEFAULT now(), 
        "updated_by" character varying(100), 
        CONSTRAINT "UQ_46f236f21640f9da218a063a866" UNIQUE ("sku"), 
        CONSTRAINT "UQ_ac30e35b87801fc740d0e52b33f" UNIQUE ("slug"), 
        CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_product_variants_created_at" ON "product_variants" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_variants_is_active" ON "product_variants" ("is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_variants_slug" ON "product_variants" ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_variants_sku" ON "product_variants" ("sku") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_variants_product_id" ON "product_variants" ("product_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_6343513e20e2deab45edfce1316" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_6343513e20e2deab45edfce1316"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_variants_product_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_product_variants_sku"`);
    await queryRunner.query(`DROP INDEX "public"."idx_product_variants_slug"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_variants_is_active"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_variants_created_at"`,
    );
    await queryRunner.query(`DROP TABLE "product_variants"`);
  }
}
