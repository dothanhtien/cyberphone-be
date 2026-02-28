import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartsTable1772245023149 implements MigrationInterface {
  name = 'CreateCartsTable1772245023149';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "carts" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "user_id" uuid, 
          "session_id" character varying(100) NOT NULL, 
          "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "uq_carts_session_id" UNIQUE ("session_id"), 
          CONSTRAINT "pk_carts_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_carts_user_id_active" ON "carts" ("user_id") WHERE "is_active" = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "fk_carts_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "fk_carts_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."uq_carts_user_id_active"`);
    await queryRunner.query(`DROP TABLE "carts"`);
  }
}
