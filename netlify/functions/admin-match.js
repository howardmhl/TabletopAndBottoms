import { getDb } from "./db.js";
import { badRequest, readJson, requireUser } from "./admin-auth.js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await readJson(request);
  if (!body) return badRequest("Missing match details.");

  const playedOn = String(body.playedOn ?? "").trim();
  const gameName = String(body.gameName ?? "").trim();
  const playerNames = normalizeNames(body.playerNames);
  const winnerNames = normalizeNames(body.winnerNames);
  const notes = String(body.notes ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(playedOn)) return badRequest("Choose a valid date.");
  if (!gameName) return badRequest("Choose a game.");
  if (playerNames.length === 0) return badRequest("Choose at least one player.");
  if (winnerNames.length === 0) return badRequest("Choose at least one winner.");

  const playerSet = new Set(playerNames.map((name) => name.toLowerCase()));
  const invalidWinners = winnerNames.filter((name) => !playerSet.has(name.toLowerCase()));
  if (invalidWinners.length > 0) return badRequest("Winners must also be selected as players.");

  const db = getDb();
  const game = await findOne(db, "SELECT id FROM games WHERE lower(name) = lower(?)", [gameName]);
  if (!game) return badRequest("Unknown game.");

  const players = await getPlayersByName(db, playerNames);
  if (players.length !== playerNames.length) return badRequest("One or more selected players could not be found.");

  const winners = players.filter((player) => winnerNames.some((name) => name.toLowerCase() === player.name.toLowerCase()));

  const insertMatch = await db.execute({
    sql: "INSERT INTO matches (played_on, game_id, notes) VALUES (?, ?, ?)",
    args: [playedOn, game.id, notes]
  });
  const matchId = Number(insertMatch.lastInsertRowid);

  for (const player of players) {
    await db.execute({ sql: "INSERT INTO match_players (match_id, player_id) VALUES (?, ?)", args: [matchId, player.id] });
  }

  for (const winner of winners) {
    await db.execute({ sql: "INSERT INTO match_winners (match_id, player_id) VALUES (?, ?)", args: [matchId, winner.id] });
  }

  return Response.json({ ok: true, matchId });
}

function normalizeNames(value) {
  return Array.isArray(value) ? value.map((name) => String(name).trim()).filter(Boolean) : [];
}

async function findOne(db, sql, args) {
  const result = await db.execute({ sql, args });
  return result.rows[0] ?? null;
}

async function getPlayersByName(db, names) {
  const players = [];

  for (const name of names) {
    const player = await findOne(db, "SELECT id, name FROM players WHERE lower(name) = lower(?)", [name]);
    if (player) players.push(player);
  }

  return players;
}
