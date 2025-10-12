import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductAssetsTable1759602618123
  implements MigrationInterface
{
  name = 'CreateProductAssetsTable1759602618123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."image_types_enum" AS ENUM('thumbnail', 'gallery')`,
    );
    await queryRunner.query(
      `
        CREATE TABLE "product_assets" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "product_id" uuid NOT NULL, 
          "variant_id" uuid, 
          "url" character varying(512) NOT NULL, 
          "type" "public"."image_types_enum" NOT NULL DEFAULT 'gallery', 
          "alt_text" character varying(255), 
          "sort_order" integer NOT NULL DEFAULT '0', 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_product_assets_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_assets_product_id_sort_order" ON "product_assets" ("product_id", "sort_order") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_assets_type" ON "product_assets" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_assets_sort_order" ON "product_assets" ("sort_order") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_assets_product_id" ON "product_assets" ("product_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "product_assets" ADD CONSTRAINT "fk_product_assets_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_assets" ADD CONSTRAINT "fk_product_assets_variant_id" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_assets" DROP CONSTRAINT "fk_product_assets_variant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_assets" DROP CONSTRAINT "fk_product_assets_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_assets_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_assets_sort_order"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_product_assets_type"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_assets_product_id_sort_order"`,
    );
    await queryRunner.query(`DROP TABLE "product_assets"`);
    await queryRunner.query(`DROP TYPE "public"."image_types_enum"`);
  }
}
