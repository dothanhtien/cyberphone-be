import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIdentitiesTable1775168788830 implements MigrationInterface {
  name = 'CreateIdentitiesTable1775168788830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "identities" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "type" character varying(50) NOT NULL, 
          "value" character varying(320) NOT NULL, 
          "provider" character varying(50) NOT NULL DEFAULT 'local', 
          "password_hash" text, 
          "is_verified" boolean NOT NULL DEFAULT false, 
          "user_id" uuid, 
          "customer_id" uuid, 
          CONSTRAINT "chk_identity_exactly_one_owner" CHECK (
            (
              user_id IS NOT NULL 
              AND customer_id IS NULL
            ) 
            OR (
              user_id IS NULL 
              AND customer_id IS NOT NULL
            )
          ), 
          CONSTRAINT "pk_identities_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_identities_type_value_provider" ON "identities" ("type", "value", "provider") `,
    );
    await queryRunner.query(
      `ALTER TABLE "identities" ADD CONSTRAINT "fk_identities_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "identities" ADD CONSTRAINT "fk_identities_customer_id" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "identities" DROP CONSTRAINT "fk_identities_customer_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "identities" DROP CONSTRAINT "fk_identities_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_identities_type_value_provider"`,
    );
    await queryRunner.query(`DROP TABLE "identities"`);
  }
}
