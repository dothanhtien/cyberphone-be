import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartItemsTable1772255482143 implements MigrationInterface {
  name = 'CreateCartItemsTable1772255482143';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "cart_items" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "cart_id" uuid NOT NULL, 
          "variant_id" uuid NOT NULL, 
          "quantity" integer NOT NULL, 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "uq_cart_items_cart_variant" UNIQUE ("cart_id", "variant_id"), 
          CONSTRAINT "pk_cart_items_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "fk_cart_items_cart_id" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "fk_cart_items_variant_id" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "fk_cart_items_variant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "fk_cart_items_cart_id"`,
    );
    await queryRunner.query(`DROP TABLE "cart_items"`);
  }
}
