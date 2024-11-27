import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertRelationPaintingAndTag1732697476181 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Retrieve Painting-WikiArtPainting relationships and tags
    const paintings = await queryRunner.query(`
        SELECT
        p.id AS "paintingId",
        w.tags AS "tags"
        FROM
        painting p
        JOIN wiki_art_painting w ON p."wikiArtPaintingWikiArtId" = w."wikiArtId"
        WHERE
        w.tags IS NOT NULL AND ARRAY_LENGTH(w.tags, 1) > 0
    `);

    // Step 2: Retrieve Tag entries
    const tags = await queryRunner.query(`
        SELECT
        id AS "tagId",
        name
        FROM
        tag
    `);

    // Create a mapping for quick lookup of Tag IDs by name
    const tagMap = new Map(tags.map((tag: any) => [tag.name, tag.tagId]));

    // Step 3: Insert relationships into the join table
    const insertPromises = [];
    for (const painting of paintings) {
      const { paintingId, tags: tagNames } = painting;

      // Find corresponding Tag IDs for the painting's tags
      for (const tagName of tagNames) {
        const tagId = tagMap.get(tagName);
        if (tagId) {
          insertPromises.push(
            queryRunner.query(
              `
                INSERT INTO painting_tags_tag ("paintingId", "tagId")
                VALUES ($1, $2)
                `,
              [paintingId, tagId],
            ),
          );
        }
      }
    }

    // Execute all insertions
    await Promise.all(insertPromises);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove all entries from the join table
    await queryRunner.query(`DELETE FROM painting_tags_tag`);
  }
}
