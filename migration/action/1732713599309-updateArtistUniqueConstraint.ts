import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateArtistUniqueConstraint1732713599309 implements MigrationInterface {
  name = 'UpdateArtistUniqueConstraint1732713599309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "artist" DROP CONSTRAINT "unique_artist_name"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "artist" ADD CONSTRAINT "unique_artist_name" UNIQUE ("name")`,
    );
  }
}
