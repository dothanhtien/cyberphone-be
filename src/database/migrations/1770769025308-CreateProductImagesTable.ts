import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductImagesTable1770769025308 implements MigrationInterface {
  name = 'CreateProductImagesTable1770769025308';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "product_images" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "product_id" uuid NOT NULL, 
          "variant_id" uuid, 
          "image_type" character varying(50) NOT NULL DEFAULT 'gallery', 
          "alt_text" character varying(255), 
          "title" character varying(255), 
          "display_order" integer NOT NULL DEFAULT '0', 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_product_images_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_images_image_type" ON "product_images" ("image_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_images_variant_id" ON "product_images" ("variant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_images_product_id" ON "product_images" ("product_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" ADD CONSTRAINT "fk_product_images_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" ADD CONSTRAINT "fk_product_images_variant_id" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_images" DROP CONSTRAINT "fk_product_images_variant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" DROP CONSTRAINT "fk_product_images_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_images_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_images_variant_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_images_image_type"`,
    );
    await queryRunner.query(`DROP TABLE "product_images"`);
  }
}
