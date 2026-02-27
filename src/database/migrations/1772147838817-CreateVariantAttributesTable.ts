import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVariantAttributesTable1772147838817 implements MigrationInterface {
  name = 'CreateVariantAttributesTable1772147838817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "variant_attributes" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "variant_id" uuid NOT NULL, 
          "product_attribute_id" uuid NOT NULL, 
          "attribute_value" character varying(255) NOT NULL, 
          "attribute_value_display" character varying(255), 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_variant_attributes_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_variant_attributes_product_attribute_id" ON "variant_attributes" ("product_attribute_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_variant_attributes_variant_id" ON "variant_attributes" ("variant_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_variant_attributes_variant_id_product_attribute_id_active" ON "variant_attributes" ("variant_id", "product_attribute_id") WHERE "is_active" = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "variant_attributes" ADD CONSTRAINT "fk_variant_attributes_variant_id" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "variant_attributes" ADD CONSTRAINT "fk_variant_attributes_product_attribute_id" FOREIGN KEY ("product_attribute_id") REFERENCES "product_attributes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "variant_attributes" DROP CONSTRAINT "fk_variant_attributes_product_attribute_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "variant_attributes" DROP CONSTRAINT "fk_variant_attributes_variant_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_variant_attributes_variant_id_product_attribute_id_active"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_variant_attributes_variant_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_variant_attributes_product_attribute_id"`,
    );
    await queryRunner.query(`DROP TABLE "variant_attributes"`);
  }
}
