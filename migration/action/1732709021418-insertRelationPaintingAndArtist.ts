import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertRelationPaintingAndArtist1732709021418 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. WikiArtPainting에서 artistName을 기반으로 Artist를 찾고, 해당 artistId를 Painting 테이블의 artistId로 업데이트
    await queryRunner.query(`
            UPDATE "painting"
            SET "artistId" = (
                SELECT "id"
                FROM "artist"
                WHERE "artist"."name" = "wiki_art_painting"."artistName"
                LIMIT 1
            )
            FROM "wiki_art_painting"
            WHERE "painting"."wikiArtPaintingWikiArtId" = "wiki_art_painting"."wikiArtId"
        `);

    // 2. 각 Painting과 Artist 테이블 간의 관계 설정
    await queryRunner.query(`
            ALTER TABLE "painting"
            ADD CONSTRAINT "FK_6a1d7f737e3ef017cf7f8f0b3b7"
            FOREIGN KEY ("artistId")
            REFERENCES "artist"("id")
            ON DELETE RESTRICT
            ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 관계를 되돌리기 위해서 외래 키 제약을 삭제
    await queryRunner.query(`
            ALTER TABLE "painting" DROP CONSTRAINT "FK_6a1d7f737e3ef017cf7f8f0b3b7"
        `);
  }
}
