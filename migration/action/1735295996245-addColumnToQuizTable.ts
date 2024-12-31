import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToQuizTable1735295996245 implements MigrationInterface {
  name = 'AddColumnToQuizTable1735295996245';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quiz" ADD "description" text NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quiz" DROP COLUMN "description"`);
  }
}
