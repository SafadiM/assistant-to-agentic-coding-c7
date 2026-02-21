import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1771659023883 implements MigrationInterface {
    name = 'InitialMigration1771659023883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "value" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_002b633ec0d45f5c6f928fea292" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_03f58fb0f3cccd983dded221bf" ON "configs" ("key") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_03f58fb0f3cccd983dded221bf"`);
        await queryRunner.query(`DROP TABLE "configs"`);
    }

}
