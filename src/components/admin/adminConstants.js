export const ADMIN_MENU = "menu";
export const ADD_MATCH = "match";
export const ADD_PRIZE = "prize";
export const ADD_GAME = "game";

export function createMatchForm() {
  return {
    playedOn: todayIsoDate(),
    gameName: "",
    playerNames: [],
    winnerNames: [],
    notes: ""
  };
}

export function createPrizeForm(playerName = "") {
  return {
    awardedOn: todayIsoDate(),
    playerName,
    notes: ""
  };
}

export function createGameForm() {
  return {
    name: ""
  };
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}
