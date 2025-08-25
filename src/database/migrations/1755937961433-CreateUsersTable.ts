import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1755937961433 implements MigrationInterface {
  name = 'CreateUsersTable1755937961433';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."user_roles_enum" AS ENUM(
        'admin', 'manager', 'sale', 'customer'
      )  
    `);

    await queryRunner.query(`
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
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), 
        CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), 
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."user_roles_enum"`);
  }
}
