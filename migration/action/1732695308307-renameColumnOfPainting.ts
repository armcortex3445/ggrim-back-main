import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameColumnOfPainting1732695308307 implements MigrationInterface {
  name = 'RenameColumnOfPainting1732695308307';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "painting" RENAME COLUMN "completitionYear" TO "completition_year"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "painting" RENAME COLUMN "completition_year" TO "completitionYear"`,
    );
  }
}
