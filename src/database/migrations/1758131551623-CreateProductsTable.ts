import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1758131551623 implements MigrationInterface {
  name = 'CreateProductsTable1758131551623';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "name" character varying(255) NOT NULL, 
        "slug" character varying(255) NOT NULL, 
        "short_description" character varying(500), 
        "description" text, 
        "is_featured" boolean NOT NULL DEFAULT false, 
        "meta_title" character varying(255), 
        "meta_description" character varying(500), 
        "brand_id" uuid NOT NULL, 
        "category_id" uuid NOT NULL, 
        "is_active" boolean NOT NULL DEFAULT true, 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        "created_by" character varying(100), 
        "updated_at" TIMESTAMP DEFAULT now(), 
        "updated_by" character varying(100), 
        CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_products_created_at" ON "products" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_is_active" ON "products" ("is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_name" ON "products" ("name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_products_slug" ON "products" ("slug") WHERE "is_active" = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_products_slug"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_is_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_created_at"`);
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
