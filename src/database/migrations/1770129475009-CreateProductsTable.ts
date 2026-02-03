import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1770129475009 implements MigrationInterface {
  name = 'CreateProductsTable1770129475009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "products" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "name" character varying(255) NOT NULL, 
          "slug" character varying(255) NOT NULL, 
          "short_description" text, 
          "long_description" text, 
          "status" character varying(100) NOT NULL, 
          "is_featured" boolean NOT NULL DEFAULT false, 
          "is_bestseller" boolean NOT NULL DEFAULT false, 
          "brand_id" uuid NOT NULL, 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_products_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_products_slug_active" ON "products" ("slug") WHERE "is_active" = true`,
    );
    await queryRunner.query(
      `
        ALTER TABLE 
          "products" 
        ADD 
          CONSTRAINT "fk_products_brand_id" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "fk_products_brand_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."uq_products_slug_active"`);
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
