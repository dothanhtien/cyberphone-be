import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesTable1769691889014 implements MigrationInterface {
  name = 'CreateCategoriesTable1769691889014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "categories" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "name" character varying(255) NOT NULL, 
          "slug" character varying(255) NOT NULL, 
          "description" text, 
          "parent_id" uuid, 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_categories_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_categories_slug_active" ON "categories" ("slug") WHERE "is_active" = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "fk_categories_parent_id" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "fk_categories_parent_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."uq_categories_slug_active"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
