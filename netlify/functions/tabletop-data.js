import { getDb, json } from "./db.js";

export async function handler() {
  try {
    const db = getDb();

    const [playersResult, gamesResult, prizesResult, matchesResult, matchPlayersResult, matchWinnersResult] =
      await Promise.all([
        db.execute("SELECT id, name, icon_url FROM players ORDER BY name"),
        db.execute("SELECT id, name, page_slug FROM games ORDER BY name"),
        db.execute(`
          SELECT prizes.id, players.name AS player, prizes.awarded_on, prizes.notes
          FROM prizes
          JOIN players ON players.id = prizes.player_id
          ORDER BY prizes.awarded_on DESC
        `),
        db.execute(`
          SELECT matches.id, matches.played_on, games.name AS game, matches.notes, matches.source_row
          FROM matches
          LEFT JOIN games ON games.id = matches.game_id
          ORDER BY COALESCE(matches.source_row, matches.id)
        `),
        db.execute(`
          SELECT match_players.match_id, players.name
          FROM match_players
          JOIN players ON players.id = match_players.player_id
          ORDER BY players.name
        `),
        db.execute(`
          SELECT match_winners.match_id, players.name
          FROM match_winners
          JOIN players ON players.id = match_winners.player_id
          ORDER BY players.name
        `)
      ]);

    const playerNamesByMatch = groupNamesByMatch(matchPlayersResult.rows);
    const winnerNamesByMatch = groupNamesByMatch(matchWinnersResult.rows);

    return json(200, {
      players: playersResult.rows,
      games: gamesResult.rows,
      prizes: prizesResult.rows,
      matches: matchesResult.rows.map((row) => ({
        ...row,
        players: playerNamesByMatch[row.id] ?? [],
        winners: winnerNamesByMatch[row.id] ?? []
      }))
    });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Unable to load tabletop data."
    });
  }
}

function groupNamesByMatch(rows) {
  return rows.reduce((groups, row) => {
    groups[row.match_id] ??= [];
    groups[row.match_id].push(row.name);
    return groups;
  }, {});
}
