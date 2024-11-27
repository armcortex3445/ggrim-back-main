import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertRelationPaintingAndStyle1732706663187 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Retrieve Painting-WikiArtPainting relationships and styles
    const paintings: { paintingId: string; styles: string[] }[] = await queryRunner.query(`
            SELECT
            p.id AS "paintingId",
            w.styles AS "styles"
            FROM
            painting p
            JOIN wiki_art_painting w ON p."wikiArtPaintingWikiArtId" = w."wikiArtId"
            WHERE
            w.styles IS NOT NULL AND ARRAY_LENGTH(w.styles, 1) > 0
        `);

    // Step 2: Retrieve Style entries
    const styles: { styleId: string; name: string }[] = await queryRunner.query(`
            SELECT
            id AS "styleId",
            name
            FROM
            style
        `);

    // Create a mapping for quick lookup of Style IDs by name
    const styleMap = new Map(styles.map((style: any) => [style.name, style.styleId]));

    // Step 3: Insert relationships into the join table
    const insertPromises = [];
    for (const painting of paintings) {
      const { paintingId, styles: styleNames } = painting;

      // Find corresponding Style IDs for the painting's Styles
      for (const styleName of styleNames) {
        const styleId = styleMap.get(styleName);
        if (styleId) {
          insertPromises.push(
            queryRunner.query(
              `
                    INSERT INTO painting_styles_style ("paintingId", "styleId")
                    VALUES ($1, $2)
                    `,
              [paintingId, styleId],
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
    await queryRunner.query(`DELETE FROM painting_styles_style`);
  }
}
