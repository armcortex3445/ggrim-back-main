import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertDataToNewColumnsOfPainting1732694711955 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const target = `painting`;
    const source = 'wiki_art_painting';

    await queryRunner.query(`
      UPDATE ${target} p
      SET 
        image_url = wap.image,
        description = wap.description,
        "completitionYear" = wap."completitionYear",
        width = wap.width,
        height = wap.height
      FROM ${source} wap
      WHERE p."wikiArtPaintingWikiArtId" = wap."wikiArtId";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // down 메서드에서 새로 채운 데이터를 초기화
    await queryRunner.query(`
        UPDATE painting
        SET 
          image_url = NULL,
          description = '',
          "completitionYear" = NULL,
          width = NULL,
          height = NULL;
      `);
  }
}
