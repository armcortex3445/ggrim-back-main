import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnToQuizTable1735214325774 implements MigrationInterface {
  name = 'addColumnToQuizTable1735214325774';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quiz" ADD "examplePaintingId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "quiz" ADD CONSTRAINT "FK_97d502acbe3a6de581d9cb9f55e" FOREIGN KEY ("examplePaintingId") REFERENCES "painting"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quiz" DROP CONSTRAINT "FK_97d502acbe3a6de581d9cb9f55e"`);
    await queryRunner.query(`ALTER TABLE "quiz" DROP COLUMN "examplePaintingId"`);
  }
}
