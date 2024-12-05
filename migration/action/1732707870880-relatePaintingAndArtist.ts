import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelatePaintingAndArtist1732707870880 implements MigrationInterface {
  name = 'RelatePaintingAndArtist1732707870880';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "artist" ("created_date" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_date" TIMESTAMP(6) WITH TIME ZONE DEFAULT now(), "deleted_date" TIMESTAMP(6) WITH TIME ZONE, "version" integer, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "image_url" character varying, "birth_date" TIME, "death_date" TIME, "info_url" character varying, CONSTRAINT "PK_55b76e71568b5db4d01d3e394ed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "painting" ADD "artistId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "painting" ADD CONSTRAINT "FK_68effaf7fce95617a345e22996d" FOREIGN KEY ("artistId") REFERENCES "artist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "painting" DROP CONSTRAINT "FK_68effaf7fce95617a345e22996d"`,
    );
    await queryRunner.query(`ALTER TABLE "painting" DROP COLUMN "artistId"`);
    await queryRunner.query(`DROP TABLE "artist"`);
  }
}
