import { getDb } from "./db.js";
import { badRequest, readJson, requireUser } from "./admin-auth.js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await readJson(request);
  if (!body) return badRequest("Missing game details.");

  const name = String(body.name ?? "").trim();

  if (!name) return badRequest("Enter a game name.");

  const db = getDb();
  const existing = await db.execute({ sql: "SELECT id FROM games WHERE lower(name) = lower(?)", args: [name] });
  if (existing.rows[0]) return badRequest("That game already exists.");

  const game = await db.execute({
    sql: "INSERT INTO games (name, page_slug) VALUES (?, ?)",
    args: [name, null]
  });

  return Response.json({ ok: true, gameId: Number(game.lastInsertRowid) });
}
