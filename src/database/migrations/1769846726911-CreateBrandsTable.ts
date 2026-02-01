import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBrandsTable1769846726911 implements MigrationInterface {
  name = 'CreateBrandsTable1769846726911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "brands" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "name" character varying(255) NOT NULL, 
          "slug" character varying(255) NOT NULL, 
          "description" text, 
          "website_url" text, 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_brands_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_brands_slug_active" ON "brands" ("slug") WHERE "is_active" = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."uq_brands_slug_active"`);
    await queryRunner.query(`DROP TABLE "brands"`);
  }
}
