import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelatePaintingAndTag1732697239045 implements MigrationInterface {
  name = 'RelatePaintingAndTag1732697239045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "painting_tags_tag" ("paintingId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_4fd04b51195c9940e5bd8323af2" PRIMARY KEY ("paintingId", "tagId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b7cd92ff4d9f06b600b1f53665" ON "painting_tags_tag" ("paintingId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4076e14c81becbc117fc6b16be" ON "painting_tags_tag" ("tagId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "painting_tags_tag" ADD CONSTRAINT "FK_b7cd92ff4d9f06b600b1f536654" FOREIGN KEY ("paintingId") REFERENCES "painting"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "painting_tags_tag" ADD CONSTRAINT "FK_4076e14c81becbc117fc6b16be4" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "painting_tags_tag" DROP CONSTRAINT "FK_4076e14c81becbc117fc6b16be4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "painting_tags_tag" DROP CONSTRAINT "FK_b7cd92ff4d9f06b600b1f536654"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_4076e14c81becbc117fc6b16be"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b7cd92ff4d9f06b600b1f53665"`);
    await queryRunner.query(`DROP TABLE "painting_tags_tag"`);
  }
}
