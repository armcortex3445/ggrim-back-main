import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConstraintUnique1732712325648 implements MigrationInterface {
  name = 'AddConstraintUnique1732712325648';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "style" ADD CONSTRAINT "UQ_94e29b400febaa2e72ab6fbdf59" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag" ADD CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tag" DROP CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b"`);
    await queryRunner.query(`ALTER TABLE "style" DROP CONSTRAINT "UQ_94e29b400febaa2e72ab6fbdf59"`);
  }
}
