import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1758727624222 implements MigrationInterface {
  name = 'CreateUsersTable1758727624222';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_roles_enum" AS ENUM('admin', 'manager', 'sale', 'customer')`,
    );
    await queryRunner.query(
      `
        CREATE TABLE "users" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "email" character varying(255) NOT NULL, 
          "phone" character varying(30), 
          "password_hash" text NOT NULL, 
          "full_name" character varying(255) NOT NULL, 
          "avatar_url" text, 
          "role" "public"."user_roles_enum" NOT NULL DEFAULT 'customer', 
          "last_login" TIMESTAMP, 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "created_by" character varying(100), 
          "updated_at" TIMESTAMP DEFAULT now(), 
          "updated_by" character varying(100), 
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."uq_users_email_active"`);
    await queryRunner.query(`DROP INDEX "public"."uq_users_phone_active"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."user_roles_enum"`);
  }
}
