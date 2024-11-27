import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnsToPainting1732694603090 implements MigrationInterface {
  name = 'AddColumnsToPainting1732694603090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tag" ("created_date" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_date" TIMESTAMP(6) WITH TIME ZONE DEFAULT now(), "deleted_date" TIMESTAMP(6) WITH TIME ZONE, "version" integer, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "info_url" character varying, CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "painting" ADD "image_url" character varying`);
    await queryRunner.query(`ALTER TABLE "painting" ADD "description" text NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "painting" ADD "completitionYear" integer`);
    await queryRunner.query(`ALTER TABLE "painting" ADD "width" integer`);
    await queryRunner.query(`ALTER TABLE "painting" ADD "height" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "painting" DROP COLUMN "height"`);
    await queryRunner.query(`ALTER TABLE "painting" DROP COLUMN "width"`);
    await queryRunner.query(`ALTER TABLE "painting" DROP COLUMN "completitionYear"`);
    await queryRunner.query(`ALTER TABLE "painting" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "painting" DROP COLUMN "image_url"`);
    await queryRunner.query(`DROP TABLE "tag"`);
  }
}
