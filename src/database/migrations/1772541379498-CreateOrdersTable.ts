import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTable1772541379498 implements MigrationInterface {
  name = 'CreateOrdersTable1772541379498';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "orders" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "code" character varying(50) NOT NULL, 
          "cart_id" uuid NOT NULL, 
          "revision" integer NOT NULL DEFAULT '1', 
          "customer_id" uuid, 
          "shipping_name" character varying(255) NOT NULL, 
          "shipping_phone" character varying(30) NOT NULL, 
          "shipping_email" character varying(320), 
          "shipping_address_line1" character varying(255) NOT NULL, 
          "shipping_address_line2" character varying(255), 
          "shipping_city" character varying(100) NOT NULL, 
          "shipping_state" character varying(100), 
          "shipping_district" character varying(100) NOT NULL, 
          "shipping_ward" character varying(100) NOT NULL, 
          "shipping_postal_code" character varying(20), 
          "shipping_country" character varying(100) NOT NULL DEFAULT 'Vietnam', 
          "shipping_note" text, 
          "payment_method" character varying(50) NOT NULL, 
          "payment_status" character varying(50) NOT NULL DEFAULT 'pending', 
          "shipping_method" character varying(100) NOT NULL, 
          "shipping_fee" numeric(12, 2) NOT NULL DEFAULT '0', 
          "shipping_tracking_code" character varying(100), 
          "estimated_delivery_date" date, 
          "actual_delivery_date" TIMESTAMP WITH TIME ZONE, 
          "items_total" numeric(12, 2) NOT NULL, 
          "discount_total" numeric(12, 2) NOT NULL DEFAULT '0', 
          "tax_total" numeric(12, 2) NOT NULL DEFAULT '0', 
          "shipping_total" numeric(12, 2) NOT NULL DEFAULT '0', 
          "order_total" numeric(12, 2) NOT NULL, 
          "order_status" character varying(50) NOT NULL DEFAULT 'pending', 
          "cancelled_at" TIMESTAMP WITH TIME ZONE, 
          "cancelled_reason" text, 
          "refund_amount" numeric(12, 2), 
          "refund_reason" text, 
          "note" text, 
          "admin_note" text, 
          "ip_address" character varying(45), 
          "user_agent" text, 
          "device_type" character varying(50) NOT NULL DEFAULT 'unknown', 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "idx_orders_code" UNIQUE ("code"), 
          CONSTRAINT "pk_orders_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_cart_revision" ON "orders" ("cart_id", "revision") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_payment_status" ON "orders" ("payment_status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_order_status" ON "orders" ("order_status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_customer_id" ON "orders" ("customer_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "fk_orders_cart_id" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "fk_orders_customer_id" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "fk_orders_customer_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "fk_orders_cart_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_orders_customer_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_order_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_payment_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_cart_revision"`);
    await queryRunner.query(`DROP TABLE "orders"`);
  }
}
