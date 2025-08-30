import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBrandsTable1756535664509 implements MigrationInterface {
  name = 'CreateBrandsTable1756535664509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "brands" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "name" character varying(255) NOT NULL, 
        "slug" character varying(255) NOT NULL, 
        "description" text, 
        "website_url" character varying(512), 
        "logo_url" character varying(512), 
        "is_active" boolean NOT NULL DEFAULT true, 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        "created_by" character varying(100), 
        "updated_at" TIMESTAMP DEFAULT now(), 
        "updated_by" character varying(100), 
        CONSTRAINT "UQ_b15428f362be2200922952dc268" UNIQUE ("slug"), 
        CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "brands"`);
  }
}
