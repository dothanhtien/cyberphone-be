import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMediaAssetsTable1769819737337 implements MigrationInterface {
  name = 'CreateMediaAssetsTable1769819737337';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."media_assets_resource_type_enum" AS ENUM('image', 'video', 'document', 'audio', 'other')`,
    );
    await queryRunner.query(
      `
        CREATE TABLE "media_assets" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "public_id" character varying(255) NOT NULL, 
          "url" text NOT NULL, 
          "resource_type" "public"."media_assets_resource_type_enum" NOT NULL DEFAULT 'other', 
          "ref_type" character varying(100) NOT NULL, 
          "ref_id" character varying(100) NOT NULL, 
          "metadata" jsonb, 
          "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP DEFAULT now(), 
          "updated_by" character varying(100), 
          "deleted_at" TIMESTAMP WITH TIME ZONE, 
          "deleted_by" character varying(100), 
          CONSTRAINT "pk_media_assets_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "unq_media_assets_public_id" ON "media_assets" ("public_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_media_assets_ref_type_ref_id" ON "media_assets" ("ref_type", "ref_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_media_assets_ref_type_ref_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."unq_media_assets_public_id"`);
    await queryRunner.query(`DROP TABLE "media_assets"`);
    await queryRunner.query(
      `DROP TYPE "public"."media_assets_resource_type_enum"`,
    );
  }
}
