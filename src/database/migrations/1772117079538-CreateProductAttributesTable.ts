import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductAttributesTable1772117079538 implements MigrationInterface {
  name = 'CreateProductAttributesTable1772117079538';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "product_attributes" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "product_id" uuid NOT NULL, 
          "attribute_key" character varying(255) NOT NULL, 
          "attribute_key_display" character varying(255) NOT NULL, 
          "display_order" integer NOT NULL DEFAULT '0', 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_product_attributes_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_product_attributes_product_id_attribute_key_display_order" ON "product_attributes" ("product_id", "attribute_key", "display_order") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_product_attributes_product_id_attribute_key_active" ON "product_attributes" ("product_id", "attribute_key") WHERE "is_active" = true`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_attributes_product_id" ON "product_attributes" ("product_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "product_attributes" ADD CONSTRAINT "fk_product_attributes_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_attributes" DROP CONSTRAINT "fk_product_attributes_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_attributes_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_product_attributes_product_id_attribute_key_active"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_product_attributes_product_id_attribute_key_display_order"`,
    );
    await queryRunner.query(`DROP TABLE "product_attributes"`);
  }
}
