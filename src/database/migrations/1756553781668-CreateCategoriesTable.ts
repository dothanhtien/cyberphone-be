import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesTable1756553781668 implements MigrationInterface {
  name = 'CreateCategoriesTable1756553781668';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "name" character varying(255) NOT NULL, 
        "slug" character varying(255) NOT NULL, 
        "description" text, 
        "logo_url" character varying(512), 
        "parent_id" uuid, 
        "is_active" boolean NOT NULL DEFAULT true, 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        "created_by" character varying(100), 
        "updated_at" TIMESTAMP DEFAULT now(), 
        "updated_by" character varying(100), 
        CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), 
        CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE 
        "categories" 
      ADD 
        CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE 
      SET 
        NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"`,
    );
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
