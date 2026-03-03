import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderItemsTable1772554471656 implements MigrationInterface {
  name = 'CreateOrderItemsTable1772554471656';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "order_items" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "order_id" uuid NOT NULL, 
          "product_id" uuid NOT NULL, 
          "variant_id" uuid NOT NULL, 
          "product_name" character varying(255) NOT NULL, 
          "variant_name" character varying(255) NOT NULL, 
          "sku" character varying(100) NOT NULL, 
          "attributes" json, 
          "unit_price" numeric(12, 2) NOT NULL, 
          "sale_price" numeric(12, 2), 
          "quantity" integer NOT NULL, 
          "item_total" numeric(12, 2) NOT NULL, 
          CONSTRAINT "pk_order_items_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_items_product_id" ON "order_items" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_items_variant_id" ON "order_items" ("variant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_items_order_id" ON "order_items" ("order_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "fk_order_items_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "fk_order_items_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "fk_order_items_variant_id" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "fk_order_items_variant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "fk_order_items_product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "fk_order_items_order_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_order_items_order_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_order_items_variant_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_order_items_product_id"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
  }
}
