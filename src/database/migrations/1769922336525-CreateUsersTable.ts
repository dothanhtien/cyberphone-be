import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1769922336525 implements MigrationInterface {
  name = 'CreateUsersTable1769922336525';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "users" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "phone" character varying(30) NOT NULL, 
          "email" character varying(320), 
          "first_name" character varying(255) NOT NULL, 
          "last_name" character varying(255) NOT NULL, 
          "last_login" TIMESTAMP WITH TIME ZONE, 
          "phone_verified" boolean NOT NULL DEFAULT false, 
          "email_verified" boolean NOT NULL DEFAULT false, 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
          "updated_by" character varying(100), 
          "role_id" uuid NOT NULL, 
          CONSTRAINT "pk_users_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_users_phone_active" ON "users" ("phone") WHERE "is_active" = true`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_users_email_active" ON "users" ("email") WHERE "is_active" = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "fk_users_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "fk_users_role_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."uq_users_email_active"`);
    await queryRunner.query(`DROP INDEX "public"."uq_users_phone_active"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
