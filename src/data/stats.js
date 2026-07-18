import { parseDateToMs } from "../utils/dates";

export function getInitials(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function sortPlayersByWinsThenName(entries) {
  return [...entries].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if ((b.winRate ?? 0) !== (a.winRate ?? 0)) return (b.winRate ?? 0) - (a.winRate ?? 0);
    return a.name.localeCompare(b.name);
  });
}

export function applyTiedRanks(entries, scoreKey) {
  let currentRank = 0;
  let lastScore = null;

  return entries.map((entry, index) => {
    const score = entry[scoreKey];
    if (score !== lastScore) {
      currentRank = index + 1;
      lastScore = score;
    }

    return { ...entry, rank: currentRank };
  });
}

export function computePlayerStats(matches, prizeByPlayer) {
  const stats = {};

  matches.forEach((match) => {
    const matchMs = parseDateToMs(match.date);

    match.players.forEach((player) => {
      const name = player.trim();
      if (!name) return;
      stats[name] ??= { games: 0, wins: 0 };
      stats[name].games += 1;
    });

    match.winners.forEach((winner) => {
      const name = winner.trim();
      if (!name) return;
      stats[name] ??= { games: 0, wins: 0 };

      const cutoff = prizeByPlayer[name.toLowerCase()]?.dateMs ?? null;
      if (!matchMs || !cutoff || matchMs > cutoff) {
        stats[name].wins += 1;
      }
    });
  });

  return stats;
}

export function computePerGameStats(matches) {
  const summary = {};
  const players = {};

  matches.forEach((match) => {
    const gameName = match.game || "Unknown game";
    summary[gameName] ??= { timesPlayed: 0 };
    summary[gameName].timesPlayed += 1;

    players[gameName] ??= {};
    const statsMap = players[gameName];

    match.players.forEach((player) => {
      const name = player.trim();
      if (!name) return;
      statsMap[name] ??= { plays: 0, wins: 0 };
      statsMap[name].plays += 1;
    });

    match.winners.forEach((winner) => {
      const name = winner.trim();
      if (!name) return;
      statsMap[name] ??= { plays: 0, wins: 0 };
      statsMap[name].wins += 1;
    });
  });

  return { summary, players };
}

export function getRankedLeaderboard(playerStats) {
  const entries = Object.entries(playerStats).map(([name, stats]) => ({
    name,
    wins: stats.wins,
    games: stats.games,
    winRate: stats.games > 0 ? (stats.wins / stats.games) * 100 : 0
  }));

  return applyTiedRanks(sortPlayersByWinsThenName(entries), "wins");
}

export function getGameSummaryEntries(perGameSummary) {
  return Object.entries(perGameSummary)
    .map(([game, data]) => ({
      game,
      times: data.timesPlayed
    }))
    .sort((a, b) => {
      if (b.times !== a.times) return b.times - a.times;
      return a.game.localeCompare(b.game);
    });
}

export function getGamePlayerEntries(selectedGame, perGamePlayers) {
  let statsMap = null;

  if (selectedGame === "__ALL__") {
    statsMap = {};
    Object.values(perGamePlayers).forEach((gameMap) => {
      Object.entries(gameMap).forEach(([name, stats]) => {
        statsMap[name] ??= { plays: 0, wins: 0 };
        statsMap[name].plays += stats.plays;
        statsMap[name].wins += stats.wins;
      });
    });
  } else if (selectedGame) {
    statsMap = perGamePlayers[selectedGame];
  }

  if (!statsMap) return [];

  return Object.entries(statsMap)
    .map(([name, stats]) => ({
      name,
      plays: stats.plays,
      wins: stats.wins
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.plays !== a.plays) return b.plays - a.plays;
      return a.name.localeCompare(b.name);
    });
}
