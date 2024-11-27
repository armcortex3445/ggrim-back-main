import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePaintingFKConstraint1732713494774 implements MigrationInterface {
  name = 'UpdatePaintingFKConstraint1732713494774';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "painting" DROP CONSTRAINT "FK_68effaf7fce95617a345e22996d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "painting" DROP CONSTRAINT "FK_6a1d7f737e3ef017cf7f8f0b3b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "painting" ADD CONSTRAINT "FK_68effaf7fce95617a345e22996d" FOREIGN KEY ("artistId") REFERENCES "artist"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "painting" DROP CONSTRAINT "FK_68effaf7fce95617a345e22996d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "painting" ADD CONSTRAINT "FK_6a1d7f737e3ef017cf7f8f0b3b7" FOREIGN KEY ("artistId") REFERENCES "artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "painting" ADD CONSTRAINT "FK_68effaf7fce95617a345e22996d" FOREIGN KEY ("artistId") REFERENCES "artist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
