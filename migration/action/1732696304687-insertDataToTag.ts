import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertDataToTag1732696304687 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO tag (name)
        SELECT DISTINCT UNNEST(wap.tags) AS tag_name
        FROM wiki_art_painting wap
        WHERE wap.tags IS NOT NULL AND wap.tags <> '{}';
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DELETE FROM tag
    WHERE id IS NOT NULL; -- Ensure all tags are removed (customize if needed for selective removal)
  `);
  }
}
