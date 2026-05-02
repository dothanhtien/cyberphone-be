import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStorefrontConfigTables1777595779348 implements MigrationInterface {
  name = 'CreateStorefrontConfigTables1777595779348';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "storefront_sliders" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "title" character varying(255), 
          "alt_text" character varying(255), 
          "display_order" int NOT NULL,
          "is_active" boolean NOT NULL DEFAULT true,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "created_by" varchar(100) NOT NULL,
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
          "updated_by" varchar(100),
          CONSTRAINT "pk_storefront_sliders_id" PRIMARY KEY ("id")
        )
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "storefront_sliders"`);
  }
}
