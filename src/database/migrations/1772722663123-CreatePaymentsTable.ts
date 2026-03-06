import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsTable1772722663123 implements MigrationInterface {
  name = 'CreatePaymentsTable1772722663123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "payments" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "order_id" uuid NOT NULL, 
          "transaction_id" character varying(100), 
          "amount" numeric(12, 2) NOT NULL, 
          "currency" character varying(3) NOT NULL DEFAULT 'VND', 
          "order_info" character varying, 
          "provider" character varying(50) NOT NULL, 
          "payment_method" character varying(50), 
          "status" character varying(50) NOT NULL DEFAULT 'pending', 
          "failure_reason" text, 
          "raw_response" jsonb, 
          "paid_at" TIMESTAMP WITH TIME ZONE, 
          "refunded_at" TIMESTAMP WITH TIME ZONE, 
          "refund_transaction_id" character varying(100), 
          "confirmed_by" character varying(100), 
          "confirmed_at" TIMESTAMP WITH TIME ZONE, 
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
          CONSTRAINT "pk_payments_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payments_created_at" ON "payments" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payments_paid_at" ON "payments" ("paid_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payments_status" ON "payments" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payments_provider" ON "payments" ("provider") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payments_transaction_id" ON "payments" ("transaction_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payments_order_id" ON "payments" ("order_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_payments_order_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_payments_transaction_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_payments_provider"`);
    await queryRunner.query(`DROP INDEX "public"."idx_payments_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_payments_paid_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_payments_created_at"`);
    await queryRunner.query(`DROP TABLE "payments"`);
  }
}
