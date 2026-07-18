import { getDb } from "./db.js";
import { badRequest, readJson, requireUser } from "./admin-auth.js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await readJson(request);
  if (!body) return badRequest("Missing prize details.");

  const playerName = String(body.playerName ?? "").trim();
  const awardedOn = String(body.awardedOn ?? "").trim();
  const notes = String(body.notes ?? "").trim();

  if (!playerName) return badRequest("Choose a player.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(awardedOn)) return badRequest("Choose a valid prize date.");

  const db = getDb();
  const playerResult = await db.execute({ sql: "SELECT id FROM players WHERE lower(name) = lower(?)", args: [playerName] });
  const player = playerResult.rows[0];
  if (!player) return badRequest("Unknown player.");

  const prize = await db.execute({
    sql: "INSERT INTO prizes (player_id, awarded_on, notes) VALUES (?, ?, ?)",
    args: [player.id, awardedOn, notes]
  });

  return Response.json({ ok: true, prizeId: Number(prize.lastInsertRowid) });
}
