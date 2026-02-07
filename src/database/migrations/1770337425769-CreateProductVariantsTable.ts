import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductVariantsTable1770337425769 implements MigrationInterface {
  name = 'CreateProductVariantsTable1770337425769';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "product_variants" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "product_id" uuid NOT NULL, 
          "sku" character varying(100) NOT NULL, 
          "name" character varying(255) NOT NULL, 
          "price" numeric(12, 2) NOT NULL, 
          "sale_price" numeric(12, 2), 
          "cost_price" numeric(12, 2), 
          "stock_quantity" integer NOT NULL DEFAULT '0', 
          "stock_status" character varying(100) NOT NULL DEFAULT 'in_stock', 
          "low_stock_threshold" integer NOT NULL DEFAULT '5', 
          "is_default" boolean NOT NULL DEFAULT false, 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_product_variants_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_variants_stock_status" ON "product_variants" ("stock_status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_variants_product_id" ON "product_variants" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_product_variants_sku_active" ON "product_variants" ("sku") WHERE "is_active" = true`,
    );
    await queryRunner.query(
      `
        ALTER TABLE 
          "product_variants" 
        ADD 
          CONSTRAINT "fk_product_variants_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "fk_product_variants_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_product_variants_sku_active"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_variants_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_variants_stock_status"`,
    );
    await queryRunner.query(`DROP TABLE "product_variants"`);
  }
}
