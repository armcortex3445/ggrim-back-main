import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyColumnQuizTable1735216744237 implements MigrationInterface {
  name = 'ModifyColumnQuizTable1735216744237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "quiz_artists_artist" ("quizId" uuid NOT NULL, "artistId" uuid NOT NULL, CONSTRAINT "PK_06ded2a43a0450ded4b56b30aeb" PRIMARY KEY ("quizId", "artistId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0720641bd6fcc3c39883817481" ON "quiz_artists_artist" ("quizId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_046249625db687f330d0530b3f" ON "quiz_artists_artist" ("artistId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "quiz_tags_tag" ("quizId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_55b75f55f019e1c14fab77b8717" PRIMARY KEY ("quizId", "tagId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_967a66c52a31d3fdef7d8600a4" ON "quiz_tags_tag" ("quizId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_39656912e32038fc8ec251f24a" ON "quiz_tags_tag" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "quiz_styles_style" ("quizId" uuid NOT NULL, "styleId" uuid NOT NULL, CONSTRAINT "PK_a71fa38a9be168fae9ebbb3fbb7" PRIMARY KEY ("quizId", "styleId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2af58da5e7b5f28a0c4da9249f" ON "quiz_styles_style" ("quizId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_39c768de870e475e8a039e80c8" ON "quiz_styles_style" ("styleId") `,
    );
    await queryRunner.query(`ALTER TABLE "quiz" DROP COLUMN "category"`);
    await queryRunner.query(
      `ALTER TABLE "quiz_artists_artist" ADD CONSTRAINT "FK_0720641bd6fcc3c398838174810" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_artists_artist" ADD CONSTRAINT "FK_046249625db687f330d0530b3fc" FOREIGN KEY ("artistId") REFERENCES "artist"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_tags_tag" ADD CONSTRAINT "FK_967a66c52a31d3fdef7d8600a49" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_tags_tag" ADD CONSTRAINT "FK_39656912e32038fc8ec251f24a3" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_styles_style" ADD CONSTRAINT "FK_2af58da5e7b5f28a0c4da9249f9" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_styles_style" ADD CONSTRAINT "FK_39c768de870e475e8a039e80c80" FOREIGN KEY ("styleId") REFERENCES "style"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quiz_styles_style" DROP CONSTRAINT "FK_39c768de870e475e8a039e80c80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_styles_style" DROP CONSTRAINT "FK_2af58da5e7b5f28a0c4da9249f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_tags_tag" DROP CONSTRAINT "FK_39656912e32038fc8ec251f24a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_tags_tag" DROP CONSTRAINT "FK_967a66c52a31d3fdef7d8600a49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_artists_artist" DROP CONSTRAINT "FK_046249625db687f330d0530b3fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_artists_artist" DROP CONSTRAINT "FK_0720641bd6fcc3c398838174810"`,
    );
    await queryRunner.query(`ALTER TABLE "quiz" ADD "category" character varying NOT NULL`);
    await queryRunner.query(`DROP INDEX "public"."IDX_39c768de870e475e8a039e80c8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2af58da5e7b5f28a0c4da9249f"`);
    await queryRunner.query(`DROP TABLE "quiz_styles_style"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_39656912e32038fc8ec251f24a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_967a66c52a31d3fdef7d8600a4"`);
    await queryRunner.query(`DROP TABLE "quiz_tags_tag"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_046249625db687f330d0530b3f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0720641bd6fcc3c39883817481"`);
    await queryRunner.query(`DROP TABLE "quiz_artists_artist"`);
  }
}
