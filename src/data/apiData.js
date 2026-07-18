import { formatDateForDisplay, parseDateToMs } from "../utils/dates";

export async function fetchTabletopDataFromApi() {
  const response = await fetch("/.netlify/functions/tabletop-data");
  if (!response.ok) {
    throw new Error("Could not load Turso tabletop data.");
  }

  const data = await response.json();

  return {
    matches: data.matches.map((match) => ({
      date: match.played_on ?? "",
      game: match.game ?? "",
      winners: match.winners ?? [],
      players: match.players ?? [],
      notes: match.notes ?? "",
      timestamp: match.source_row ?? match.id
    })),
    players: data.players.reduce((players, player) => {
      players[player.name.toLowerCase()] = {
        name: player.name,
        icon: player.icon_url ?? ""
      };
      return players;
    }, {}),
    games: data.games.reduce((games, game) => {
      games[game.name] = {
        page: game.page_slug ?? ""
      };
      return games;
    }, {}),
    prizes: data.prizes.reduce((prizes, prize) => {
      if (!prize.player) return prizes;

      const key = prize.player.toLowerCase();
      const dateMs = parseDateToMs(prize.awarded_on);
      prizes[key] ??= {
        count: 0,
        dateMs: null,
        awardedOn: "",
        awardedOnDisplay: "",
        notes: ""
      };

      prizes[key].count += 1;

      if (dateMs && dateMs > (prizes[key].dateMs ?? 0)) {
        prizes[key].dateMs = dateMs;
        prizes[key].awardedOn = prize.awarded_on ?? "";
        prizes[key].awardedOnDisplay = formatDateForDisplay(prize.awarded_on);
        prizes[key].notes = prize.notes ?? "";
      }

      return prizes;
    }, {})
  };
}

export async function fetchBetrayalDataFromApi() {
  const response = await fetch("/.netlify/functions/betrayal-data");
  if (!response.ok) {
    throw new Error("Could not load Turso Betrayal data.");
  }

  return response.json();
}
