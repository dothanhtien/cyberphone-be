import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartsTable1772245023149 implements MigrationInterface {
  name = 'CreateCartsTable1772245023149';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "carts" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "customer_id" uuid, 
          "session_id" character varying(100) NOT NULL, 
          "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, 
          "status" character varying(50) NOT NULL DEFAULT 'active',  
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_carts_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_carts_customer_id" ON "carts" ("customer_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_active_cart_per_customer" ON "carts" ("customer_id") WHERE "status" = 'active' AND "customer_id" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "fk_carts_customer_id" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "fk_carts_customer_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_carts_customer_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."uq_active_cart_per_customer"`,
    );

    await queryRunner.query(`DROP TABLE "carts"`);
  }
}
