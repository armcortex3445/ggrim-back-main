import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertDataToArtist1732708357269 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE artist ADD CONSTRAINT unique_artist_name UNIQUE (name);`);
    await queryRunner.query(`
            INSERT INTO artist (name)
            SELECT DISTINCT "artistName" AS artist_name
            FROM wiki_art_painting wap
            WHERE wap."artistName" IS NOT NULL;
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM artist
        WHERE id IS NOT NULL; -- Ensure all artists are removed (customize if needed for selective removal)
      `);
  }
}
