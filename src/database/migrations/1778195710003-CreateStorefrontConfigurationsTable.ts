import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStorefrontConfigurationsTable1778195710003 implements MigrationInterface {
  name = 'CreateStorefrontConfigurationsTable1778195710003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "storefront_configurations" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "type" character varying(50) NOT NULL, 
          "title" character varying(255), 
          "key" character varying(255), 
          "icon" character varying(100), 
          "category_id" uuid, 
          "display_order" integer NOT NULL, 
          "is_active" boolean NOT NULL DEFAULT true, 
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
          "created_by" character varying(100) NOT NULL, 
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
          "updated_by" character varying(100), 
          CONSTRAINT "pk_storefront_configurations_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_storefront_configurations_type_category_id" ON "storefront_configurations" ("type", "category_id") WHERE "category_id" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_storefront_configurations_type_key" ON "storefront_configurations" ("type", "key") WHERE "key" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "storefront_configurations" ADD CONSTRAINT "fk_storefront_configurations_category_id" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "storefront_configurations" DROP CONSTRAINT "fk_storefront_configurations_category_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_storefront_configurations_type_key"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_storefront_configurations_type_category_id"`,
    );
    await queryRunner.query(`DROP TABLE "storefront_configurations"`);
  }
}
