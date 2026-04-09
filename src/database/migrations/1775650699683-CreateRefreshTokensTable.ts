import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokensTable1775650699683 implements MigrationInterface {
  name = 'CreateRefreshTokensTable1775650699683';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "refresh_tokens" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "identity_id" uuid NOT NULL, 
          "token_hash" text NOT NULL, 
          "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, 
          "revoked_at" TIMESTAMP WITH TIME ZONE, 
          "replaced_by_token" uuid, 
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
          CONSTRAINT "pk_refresh_tokens_id" PRIMARY KEY ("id")
        )
      `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_refresh_tokens_token_hash" ON "refresh_tokens" ("token_hash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_refresh_tokens_identity_id" ON "refresh_tokens" ("identity_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "fk_refresh_tokens_identity_id" FOREIGN KEY ("identity_id") REFERENCES "identities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "fk_refresh_tokens_identity_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_refresh_tokens_identity_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_refresh_tokens_token_hash"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_refresh_tokens_expires_at"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
