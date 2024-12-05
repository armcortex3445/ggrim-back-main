import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelatePaintingAndStyle1732706329520 implements MigrationInterface {
  name = 'RelatePaintingAndStyle1732706329520';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "style" ("created_date" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_date" TIMESTAMP(6) WITH TIME ZONE DEFAULT now(), "deleted_date" TIMESTAMP(6) WITH TIME ZONE, "version" integer, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "info_url" character varying, CONSTRAINT "PK_12a3ba7fe23b5386181ac6b0ac0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "painting_styles_style" ("paintingId" uuid NOT NULL, "styleId" uuid NOT NULL, CONSTRAINT "PK_0d4864c56b9e45ea109f1d9ddbb" PRIMARY KEY ("paintingId", "styleId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f68dcd14047488ff8518b93c45" ON "painting_styles_style" ("paintingId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5233496e672504a201cf48fcef" ON "painting_styles_style" ("styleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "painting_styles_style" ADD CONSTRAINT "FK_f68dcd14047488ff8518b93c45f" FOREIGN KEY ("paintingId") REFERENCES "painting"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "painting_styles_style" ADD CONSTRAINT "FK_5233496e672504a201cf48fcef3" FOREIGN KEY ("styleId") REFERENCES "style"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "painting_styles_style" DROP CONSTRAINT "FK_5233496e672504a201cf48fcef3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "painting_styles_style" DROP CONSTRAINT "FK_f68dcd14047488ff8518b93c45f"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_5233496e672504a201cf48fcef"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f68dcd14047488ff8518b93c45"`);
    await queryRunner.query(`DROP TABLE "painting_styles_style"`);
    await queryRunner.query(`DROP TABLE "style"`);
  }
}
