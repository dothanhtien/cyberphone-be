import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomersTable1769922336526 implements MigrationInterface {
  name = 'CreateCustomersTable1769922336526';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "customers" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "phone" character varying(30) NOT NULL, 
          "email" character varying(320), 
          "first_name" character varying(255) NOT NULL, 
          "last_name" character varying(255) NOT NULL, 
          "date_of_birth" date, 
          "gender" character varying(100) DEFAULT 'other', 
          "last_login" TIMESTAMP WITH TIME ZONE, 
          "phone_verified" boolean NOT NULL DEFAULT false, 
          "email_verified" boolean NOT NULL DEFAULT false, 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
          "created_by" character varying(100), 
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_customers_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_customers_phone_active" ON "customers" ("phone") WHERE "is_active" = true`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_customers_email_active" ON "customers" ("email") WHERE "is_active" = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."uq_customers_email_active"`);
    await queryRunner.query(`DROP INDEX "public"."uq_customers_phone_active"`);
    await queryRunner.query(`DROP TABLE "customers"`);
  }
}
