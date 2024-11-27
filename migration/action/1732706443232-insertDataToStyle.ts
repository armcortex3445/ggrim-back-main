import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertDataToStyle1732706443232 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO style (name)
        SELECT DISTINCT UNNEST(wap.styles) AS style_name
        FROM wiki_art_painting wap
        WHERE wap.styles IS NOT NULL AND wap.styles <> '{}';
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DELETE FROM style
    WHERE id IS NOT NULL; -- Ensure all styles are removed (customize if needed for selective removal)
  `);
  }
}
