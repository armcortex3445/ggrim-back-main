import { MigrationInterface, QueryRunner } from 'typeorm';

export class InheritCustomEntity1732690052023 implements MigrationInterface {
  name = 'InheritCustomEntity1732690052023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "painting" ADD "created_date" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "painting" ADD "updated_date" TIMESTAMP(6) WITH TIME ZONE DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "painting" ADD "deleted_date" TIMESTAMP(6) WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "painting" ADD "version" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "painting" DROP COLUMN "version"`);
    await queryRunner.query(`ALTER TABLE "painting" DROP COLUMN "deleted_date"`);
    await queryRunner.query(`ALTER TABLE "painting" DROP COLUMN "updated_date"`);
    await queryRunner.query(`ALTER TABLE "painting" DROP COLUMN "created_date"`);
  }
}
