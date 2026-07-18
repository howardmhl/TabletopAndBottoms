import { getDb, json } from "./db.js";

export async function handler() {
  try {
    const db = getDb();

    const [chaptersResult, membersResult] = await Promise.all([
      db.execute(`
        SELECT chapter, played_on AS date, haunt, source_row AS rowIndex
        FROM betrayal_chapters
        ORDER BY COALESCE(source_row, id)
      `),
      db.execute(`
        SELECT family, name, age, traitor, died, fate, chapter, source_row AS rowIndex
        FROM betrayal_family_members
        ORDER BY COALESCE(source_row, id)
      `)
    ]);

    const familiesByName = {};
    const familyOrder = [];

    membersResult.rows.forEach((member) => {
      if (!familiesByName[member.family]) {
        familiesByName[member.family] = [];
        familyOrder.push(member.family);
      }

      familiesByName[member.family].push({
        ...member,
        traitor: Boolean(member.traitor),
        died: Boolean(member.died)
      });
    });

    return json(200, {
      chapters: chaptersResult.rows,
      familiesByName,
      familyOrder
    });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Unable to load Betrayal data."
    });
  }
}
