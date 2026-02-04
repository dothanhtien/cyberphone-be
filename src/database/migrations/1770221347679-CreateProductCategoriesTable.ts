import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductCategoriesTable1770221347679 implements MigrationInterface {
  name = 'CreateProductCategoriesTable1770221347679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "product_categories" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "product_id" uuid NOT NULL, 
          "category_id" uuid NOT NULL, 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_product_categories_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_product_categories_product_id_category_id" ON "product_categories" ("product_id", "category_id") `,
    );
    await queryRunner.query(
      `
        ALTER TABLE 
          "product_categories" 
        ADD 
          CONSTRAINT "fk_product_categories_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `,
    );
    await queryRunner.query(
      `
        ALTER TABLE 
          "product_categories" 
        ADD 
          CONSTRAINT "fk_product_categories_category_id" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_categories" DROP CONSTRAINT "fk_product_categories_category_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" DROP CONSTRAINT "fk_product_categories_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_product_categories_product_id_category_id"`,
    );
    await queryRunner.query(`DROP TABLE "product_categories"`);
  }
}
