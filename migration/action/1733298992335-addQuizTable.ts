import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuizTable1733298992335 implements MigrationInterface {
  name = 'AddQuizTable1733298992335';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "quiz" ("created_date" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_date" TIMESTAMP(6) WITH TIME ZONE DEFAULT now(), "deleted_date" TIMESTAMP(6) WITH TIME ZONE, "version" integer, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "category" character varying NOT NULL, "correct_count" integer NOT NULL DEFAULT '0', "incorrect_count" integer NOT NULL DEFAULT '0', "time_limit" integer NOT NULL DEFAULT '20', "type" character varying NOT NULL, CONSTRAINT "PK_422d974e7217414e029b3e641d0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "quiz_distractor_paintings_painting" ("quizId" uuid NOT NULL, "paintingId" uuid NOT NULL, CONSTRAINT "PK_c50b84fa1fe5e3c4b3a6bd47399" PRIMARY KEY ("quizId", "paintingId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_47eaa587a32ffa4db0222ded6b" ON "quiz_distractor_paintings_painting" ("quizId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff2378a286cb752def60f991dd" ON "quiz_distractor_paintings_painting" ("paintingId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "quiz_answer_paintings_painting" ("quizId" uuid NOT NULL, "paintingId" uuid NOT NULL, CONSTRAINT "PK_63e7c0d5736618891a779b75593" PRIMARY KEY ("quizId", "paintingId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5131ed94f07d784d233242b857" ON "quiz_answer_paintings_painting" ("quizId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8db6addfed02f52039f22b50e8" ON "quiz_answer_paintings_painting" ("paintingId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_distractor_paintings_painting" ADD CONSTRAINT "FK_47eaa587a32ffa4db0222ded6b1" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_distractor_paintings_painting" ADD CONSTRAINT "FK_ff2378a286cb752def60f991ddc" FOREIGN KEY ("paintingId") REFERENCES "painting"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_answer_paintings_painting" ADD CONSTRAINT "FK_5131ed94f07d784d233242b8572" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_answer_paintings_painting" ADD CONSTRAINT "FK_8db6addfed02f52039f22b50e87" FOREIGN KEY ("paintingId") REFERENCES "painting"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quiz_answer_paintings_painting" DROP CONSTRAINT "FK_8db6addfed02f52039f22b50e87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_answer_paintings_painting" DROP CONSTRAINT "FK_5131ed94f07d784d233242b8572"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_distractor_paintings_painting" DROP CONSTRAINT "FK_ff2378a286cb752def60f991ddc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_distractor_paintings_painting" DROP CONSTRAINT "FK_47eaa587a32ffa4db0222ded6b1"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_8db6addfed02f52039f22b50e8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5131ed94f07d784d233242b857"`);
    await queryRunner.query(`DROP TABLE "quiz_answer_paintings_painting"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ff2378a286cb752def60f991dd"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_47eaa587a32ffa4db0222ded6b"`);
    await queryRunner.query(`DROP TABLE "quiz_distractor_paintings_painting"`);
    await queryRunner.query(`DROP TABLE "quiz"`);
  }
}
