import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderSequence1772542822305 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE SEQUENCE IF NOT EXISTS order_sequence
      START 1
      INCREMENT 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP SEQUENCE IF EXISTS order_sequence
    `);
  }
}
