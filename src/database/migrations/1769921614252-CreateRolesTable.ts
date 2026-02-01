import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesTable1769921614252 implements MigrationInterface {
  name = 'CreateRolesTable1769921614252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "roles" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "name" character varying(255) NOT NULL, 
          "description" text, 
          "is_system" boolean NOT NULL DEFAULT false, 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_roles_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_roles_name_active" ON "roles" ("name", "is_active") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."uq_roles_name_active"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
