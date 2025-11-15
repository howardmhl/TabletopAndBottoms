// Config //
const SHEET_ID = "1G2czJrtyfVnZrfXyT7R9B2n4IQm8towBW8zrXL_yBy4";
const SHEET_LOG_NAME = "log";
const SHEET_PLAYERS_NAME = "players";

function buildGvizUrl(sheetName, handlerName) {
  return (
    "https://docs.google.com/spreadsheets/d/" +
    SHEET_ID +
    "/gviz/tq?sheet=" +
    encodeURIComponent(sheetName) +
    "&headers=1&tqx=out:json;responseHandler:" +
    handlerName +
    "&t=" +
    Date.now()
  );
}

const HEADER_HINTS_LOG = {
  date:    null,
  game:    null,
  winners: null,
  players: null,
  notes:   null
};

const HEADER_HINTS_PLAYERS = {
  name: null,
  icon: null
};

// State //
let matches = [];
let playersStats = {};
let playerMeta = {};

let perGameSummary = {};
let perGamePlayers = {};
let currentSelectedGame = null;

// Header //
function findColumnIndex(headers, hintConfig, key, keywords) {
  const hint = hintConfig[key];
  if (hint) {
    const idxHint = headers.findIndex(
      h => h.trim().toLowerCase() === hint.trim().toLowerCase()
    );
    if (idxHint !== -1) return idxHint;
  }

  const lower = headers.map(h => h.trim().toLowerCase());
  for (const kw of keywords) {
    const idx = lower.findIndex(h => h.includes(kw));
    if (idx !== -1) return idx;
  }
  return -1;
}

// Stats //
function computeStats() {
  const stats = {};
  matches.forEach(m => {
    m.players.forEach(p => {
      const name = p.trim();
      if (!name) return;
      if (!stats[name]) stats[name] = { games: 0, wins: 0 };
      stats[name].games += 1;
    });
    m.winners.forEach(w => {
      const name = w.trim();
      if (!name) return;
      if (!stats[name]) stats[name] = { games: 0, wins: 0 };
      stats[name].wins += 1;
    });
  });
  playersStats = stats;
}

function computePerGameStats() {
  const summary = {};
  const perGame = {};

  matches.forEach(m => {
    const gameName = m.game || "Unknown game";

    if (!summary[gameName]) {
      summary[gameName] = { timesPlayed: 0 };
    }
    summary[gameName].timesPlayed += 1;

    if (!perGame[gameName]) {
      perGame[gameName] = {};
    }
    const statsMap = perGame[gameName];

    m.players.forEach(p => {
      const name = p.trim();
      if (!name) return;
      if (!statsMap[name]) statsMap[name] = { plays: 0, wins: 0 };
      statsMap[name].plays += 1;
    });

    m.winners.forEach(w => {
      const name = w.trim();
      if (!name) return;
      if (!statsMap[name]) statsMap[name] = { plays: 0, wins: 0 };
      statsMap[name].wins += 1;
    });
  });

  perGameSummary = summary;
  perGamePlayers = perGame;

  const games = Object.keys(perGameSummary);
  if (!currentSelectedGame || (!games.includes(currentSelectedGame) && currentSelectedGame !== "__ALL__")) {
    currentSelectedGame = "__ALL__";
  }
}

// Players //
function getInitials(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function renderPlayerCell(name) {
  const meta = playerMeta[name.toLowerCase()];
  if (meta && meta.icon) {
    const safeUrl = meta.icon.replace(/"/g, "&quot;");
    return `
      <div class="player-cell">
        <div class="avatar" style="background-image:url('${safeUrl}')"></div>
        <span>${name}</span>
      </div>
    `;
  } else {
    const initials = getInitials(name);
    return `
      <div class="player-cell">
        <div class="avatar avatar-initials">${initials}</div>
        <span>${name}</span>
      </div>
    `;
  }
}

// Simple View //
function renderSimpleLeaderboard() {
  const tbody = document.getElementById("simple-leaderboard-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const entries = Object.entries(playersStats).map(([name, stats]) => {
    const points = stats.wins;
    return { name, points };
  });

  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.name.localeCompare(b.name);
  });

  if (entries.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="3" class="small">No games found yet. Add rows to your sheet.</td>`;
    tbody.appendChild(tr);
    return;
  }

  let currentRank = 0;
  let lastPoints = null;

  entries.forEach((p, index) => {
    if (p.points !== lastPoints) {
      currentRank = index + 1;
      lastPoints = p.points;
    }
    p.rank = currentRank;
  });

  entries.forEach(p => {
    const tr = document.createElement("tr");
    let rankClass = "";
    if (p.rank === 1) rankClass = "top1";
    else if (p.rank === 2) rankClass = "top2";
    else if (p.rank === 3) rankClass = "top3";

    tr.innerHTML = `
      <td class="rank ${rankClass}">${p.rank}</td>
      <td>${renderPlayerCell(p.name)}</td>
      <td>${p.points}</td>
    `;
    tbody.appendChild(tr);
  });

  const label = document.getElementById("simple-games-label");
  if (label) {
    label.textContent = `Games logged: ${matches.length}`;
  }
}

// Detailed View //
function renderGamesSummary() {
  const tbody = document.getElementById("games-summary-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const entries = Object.entries(perGameSummary).map(([game, data]) => ({
    game,
    times: data.timesPlayed
  }));

  entries.sort((a, b) => {
    if (b.times !== a.times) return b.times - a.times;
    return a.game.localeCompare(b.game);
  });

  if (entries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="small">No games found yet.</td></tr>`;
    return;
  }

  entries.forEach((e, index) => {
    const tr = document.createElement("tr");
    const highlightClass = (e.game === currentSelectedGame) ? "top1" : "";
    tr.innerHTML = `
      <td class="rank ${highlightClass}">${index + 1}</td>
      <td>${e.game}</td>
      <td>${e.times}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Custom dropdown + hidden select renderer
 */
function renderGameSelect() {
  const select = document.getElementById("game-select");
  const dropdown = document.querySelector(".game-dropdown");
  const dropdownMenu = document.getElementById("game-dropdown-menu");
  const dropdownLabel = document.getElementById("game-dropdown-label");

  if (!select) return;

  const games = Object.keys(perGameSummary).sort((a, b) => a.localeCompare(b));
  const previous = currentSelectedGame;

  select.innerHTML = "";
  if (dropdownMenu) dropdownMenu.innerHTML = "";

  if (games.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No games yet";
    select.appendChild(opt);

    if (dropdownLabel) dropdownLabel.textContent = "No games yet";
    if (dropdownMenu) {
      const div = document.createElement("div");
      div.className = "game-dropdown-empty";
      div.textContent = "Log a game to see stats here.";
      dropdownMenu.appendChild(div);
    }

    currentSelectedGame = null;
    return;
  }

  if (!previous || (!games.includes(previous) && previous !== "__ALL__")) {
    currentSelectedGame = "__ALL__";
  }

  function addSelectOption(value, text) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = text;
    if (value === currentSelectedGame) opt.selected = true;
    select.appendChild(opt);
  }

  function createMenuItem(value, label) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "game-dropdown-item";
    btn.dataset.value = value;

    if (value === currentSelectedGame) {
      btn.classList.add("active");
    }

    btn.innerHTML = `
      <span>${label}</span>
      <span class="game-dropdown-item-badge"></span>
    `;
    return btn;
  }

  addSelectOption("__ALL__", "All");
  if (dropdownMenu) {
    dropdownMenu.appendChild(createMenuItem("__ALL__", "All games"));
  }

  games.forEach(g => {
    addSelectOption(g, g);
    if (dropdownMenu) {
      dropdownMenu.appendChild(createMenuItem(g, g));
    }
  });

  if (dropdownLabel) {
    if (currentSelectedGame === "__ALL__") {
      dropdownLabel.textContent = "All games";
    } else {
      dropdownLabel.textContent = currentSelectedGame || "Select game";
    }
  }

  if (dropdownMenu) {
    dropdownMenu.querySelectorAll(".game-dropdown-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const value = btn.dataset.value || null;
        currentSelectedGame = value;

        select.value = value;

        if (dropdownLabel) {
          dropdownLabel.textContent = value === "__ALL__" ? "All games" : value;
        }

        if (dropdown) dropdown.classList.remove("open");

        renderGamePlayerTable();
        renderGamesSummary();
        updatePlayersTitle();
      });
    });
  }
}

function renderGamePlayerTable() {
  const tbody = document.getElementById("game-player-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!currentSelectedGame) {
    tbody.innerHTML = `<tr><td colspan="3" class="small"></td></tr>`;
    return;
  }

  let statsMap;

  if (currentSelectedGame === "__ALL__") {
    const aggregate = {};
    Object.values(perGamePlayers).forEach(gameMap => {
      Object.entries(gameMap).forEach(([name, st]) => {
        if (!aggregate[name]) aggregate[name] = { plays: 0, wins: 0 };
        aggregate[name].plays += st.plays;
        aggregate[name].wins  += st.wins;
      });
    });
    statsMap = aggregate;
  } else {
    statsMap = perGamePlayers[currentSelectedGame];
  }

  if (!statsMap || Object.keys(statsMap).length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="small"></td></tr>`;
    return;
  }

  const entries = Object.entries(statsMap).map(([name, st]) => ({
    name,
    plays: st.plays,
    wins: st.wins
  }));

  entries.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.plays !== a.plays) return b.plays - a.plays;
    return a.name.localeCompare(b.name);
  });

  entries.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${renderPlayerCell(e.name)}</td>
      <td>${e.plays}</td>
      <td>${e.wins}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderDetailLeaderboard() {
  renderGamesSummary();
  renderGameSelect();
  renderGamePlayerTable();
  updatePlayersTitle();
  const label = document.getElementById("detail-games-label");
  if (label) label.textContent = `Games logged: ${matches.length}`;
}

// Cards //
function renderPlayerStatCards() {
  const container = document.getElementById("player-stat-cards");
  if (!container) return;
  container.innerHTML = "";

  const entries = Object.entries(playersStats).map(([name, stats]) => {
    const winRate = stats.games > 0 ? (stats.wins / stats.games) * 100 : 0;
    return { name, games: stats.games, wins: stats.wins, winRate };
  });

  entries.sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name));

  if (entries.length === 0) {
    container.innerHTML = `<div class="small">No players yet – log a game first!</div>`;
    return;
  }

  entries.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "stat-card";

    const badge = index === 0 ? "":""; //"👑" : "⭐";

    card.innerHTML = `
      <div class="stat-card-header">
        <div class="stat-card-name">${renderPlayerCell(p.name)}</div>
        <div class="stat-card-badge">${badge}</div>
      </div>
      <div class="stat-card-rows">
        <div class="stat-row">
          <span>Games played</span>
          <span>${p.games}</span>
        </div>
        <div class="stat-row">
          <span>Wins</span>
          <span>${p.wins}</span>
        </div>
        <div class="stat-row">
          <span>Win rate</span>
          <span>${p.winRate.toFixed(1)}%</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// History //
function renderHistory() {
  const list = document.getElementById("history-list");
  if (!list) return;
  list.innerHTML = "";

  if (matches.length === 0) {
    list.innerHTML = `<div class="small">No games for this sheet yet.</div>`;
    return;
  }

  const latest = [...matches]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);

  latest.forEach(m => {
    const div = document.createElement("div");
    div.className = "history-item";
    const winnersText = m.winners.join(", ") || "—";
    const playersText = m.players.join(", ") || "—";
    div.innerHTML = `
      <div class="history-main">
        <div>
          <span class="game-name">${m.game || "Unknown game"}</span>
          <span class="history-meta">(${m.date || "No date"})</span>
        </div>
        <span class="winner-name">Winner: ${winnersText}</span>
      </div>
      <div class="history-meta">Players: ${playersText}</div>
      ${m.notes ? `<div class="history-meta">Notes: ${m.notes}</div>` : ""}
    `;
    list.appendChild(div);
  });
}

// Sync //
function updateLastSync(errorText) {
  const el = document.getElementById("sync-status");
  if (!el) return;

  if (errorText) {
    el.textContent = errorText;
    return;
  }

  const now = new Date();
  el.dataset.timestamp = now.toISOString();
  el.textContent = "";
}

setInterval(() => {
  const el = document.getElementById("sync-status");
  if (!el || !el.dataset.timestamp) return;

  const t = new Date(el.dataset.timestamp);
  const diffMs = Date.now() - t.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin <= 0) el.textContent = "Updated just now";
  else if (diffMin === 1) el.textContent = "Updated 1 minute ago";
  else if (diffMin < 60) el.textContent = `Updated ${diffMin} minutes ago`;
  else {
    const hours = Math.floor(diffMin / 60);
    el.textContent = `Updated ${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
}, 30000);

// Cards //
function updatePlayersTitle() {
  const title = document.getElementById("players-title");
  if (!title) return;

  const value = currentSelectedGame;
  if (value === "__ALL__") {
    title.textContent = "All Games";
  } else if (!value) {
    title.textContent = "";
  } else {
    title.textContent = `${value}`;
  }
}

// Loading //
function loadGamesSheet() {
  const simpleBody = document.getElementById("simple-leaderboard-body");
  if (simpleBody) {
    simpleBody.innerHTML = `<tr><td colspan="3" class="small">Fetching data from "log"…</td></tr>`;
  }

  const gamesSummaryBody = document.getElementById("games-summary-body");
  if (gamesSummaryBody) {
    gamesSummaryBody.innerHTML = `<tr><td colspan="3" class="small">Fetching game stats…</td></tr>`;
  }

  const gamePlayerBody = document.getElementById("game-player-body");
  if (gamePlayerBody) {
    gamePlayerBody.innerHTML = `<tr><td colspan="3" class="small">Fetching game stats…</td></tr>`;
  }

  const old = document.getElementById("sheet-jsonp-games");
  if (old) old.remove();

  const script = document.createElement("script");
  script.id = "sheet-jsonp-games";
  script.src = buildGvizUrl(SHEET_LOG_NAME, "handleGamesSheet");
  document.body.appendChild(script);
}

function loadPlayersSheet() {
  const old = document.getElementById("sheet-jsonp-players");
  if (old) old.remove();

  const script = document.createElement("script");
  script.id = "sheet-jsonp-players";
  script.src = buildGvizUrl(SHEET_PLAYERS_NAME, "handlePlayersSheet");
  document.body.appendChild(script);
}

// JSONP handlers //
window.handleGamesSheet = function(json) {
  try {
    const table = json.table;
    const cols = table.cols || [];
    const rows = table.rows || [];

    const headers = cols.map(c => (c.label || c.id || "").trim());
    if (!headers.length) {
      throw new Error("No columns in log sheet");
    }

    const idxDate    = findColumnIndex(headers, HEADER_HINTS_LOG, "date",    ["date"]);
    const idxGame    = findColumnIndex(headers, HEADER_HINTS_LOG, "game",    ["game"]);
    const idxWinners = findColumnIndex(headers, HEADER_HINTS_LOG, "winners", ["winner", "winners", "victor"]);
    const idxPlayers = findColumnIndex(headers, HEADER_HINTS_LOG, "players", ["player", "players", "participants"]);
    const idxNotes   = findColumnIndex(headers, HEADER_HINTS_LOG, "notes",   ["note", "notes", "comment"]);

    matches = rows.map((row, idx) => {
      const cells = row.c || [];
      const safe = i => {
        const cell = cells[i];
        if (!cell || cell.v == null) return "";
        return String(cell.v);
      };

      const date       = idxDate    !== -1 ? safe(idxDate)    : "";
      const game       = idxGame    !== -1 ? safe(idxGame)    : "";
      const winnersStr = idxWinners !== -1 ? safe(idxWinners) : "";
      const playersStr = idxPlayers !== -1 ? safe(idxPlayers) : "";
      const notes      = idxNotes   !== -1 ? safe(idxNotes)   : "";

      const winners = winnersStr
        .split(/[;,]/)
        .map(s => s.trim())
        .filter(Boolean);

      const playersArr = playersStr
        .split(/[;,]/)
        .map(s => s.trim())
        .filter(Boolean);

      return {
        date,
        game,
        winners,
        players: playersArr,
        notes,
        timestamp: idx
      };
    }).filter(m => m.game || m.players.length || m.winners.length);

    computeStats();
    computePerGameStats();

    renderSimpleLeaderboard();
    renderDetailLeaderboard();
    renderPlayerStatCards();
    renderHistory();
    updateLastSync();
  } catch (err) {
    console.error("Games sheet parse error:", err);

    const simpleBody = document.getElementById("simple-leaderboard-body");
    if (simpleBody) {
      simpleBody.innerHTML = `<tr><td colspan="3" class="small">
        Error reading "log" sheet: ${err.message}.
      </td></tr>`;
    }

    const gamesSummaryBody = document.getElementById("games-summary-body");
    if (gamesSummaryBody) {
      gamesSummaryBody.innerHTML = `<tr><td colspan="3" class="small">
        Error reading "log" sheet: ${err.message}.
      </td></tr>`;
    }

    const gamePlayerBody = document.getElementById("game-player-body");
    if (gamePlayerBody) {
      gamePlayerBody.innerHTML = `<tr><td colspan="3" class="small">
        Error reading "log" sheet: ${err.message}.
      </td></tr>`;
    }

    updateLastSync("Error syncing log sheet");
  }
};

window.handlePlayersSheet = function(json) {
  try {
    const table = json.table;
    const cols = table.cols || [];
    const rows = table.rows || [];

    const headers = cols.map(c => (c.label || c.id || "").trim());
    if (!headers.length) {
      throw new Error("No columns in players sheet");
    }

    const idxName = findColumnIndex(headers, HEADER_HINTS_PLAYERS, "name", ["name", "player"]);
    const idxIcon = findColumnIndex(headers, HEADER_HINTS_PLAYERS, "icon", ["icon", "avatar", "image", "img", "url", "photo"]);

    const meta = {};
    rows.forEach(row => {
      const cells = row.c || [];
      const safe = i => {
        const cell = cells[i];
        if (!cell || cell.v == null) return "";
        return String(cell.v);
      };

      const name = idxName !== -1 ? safe(idxName).trim() : "";
      if (!name) return;
      const icon = idxIcon !== -1 ? safe(idxIcon).trim() : "";

      meta[name.toLowerCase()] = {
        name,
        icon
      };
    });

    playerMeta = meta;

    renderSimpleLeaderboard();
    renderDetailLeaderboard();
    renderPlayerStatCards();
  } catch (err) {
    console.error("Players sheet parse error:", err);
    updateLastSync("Error syncing players sheet");
  }
};

// Tabs //
function setupTabs() {
  const tabSimple = document.getElementById("tab-simple");
  const tabDetail = document.getElementById("tab-detail");
  const viewSimple = document.getElementById("view-simple");
  const viewDetail = document.getElementById("view-detail");

  if (!tabSimple || !tabDetail || !viewSimple || !viewDetail) return;

  tabSimple.addEventListener("click", () => {
    tabSimple.classList.add("active");
    tabDetail.classList.remove("active");
    viewSimple.classList.remove("hidden");
    viewDetail.classList.add("hidden");
  });

  tabDetail.addEventListener("click", () => {
    tabDetail.classList.add("active");
    tabSimple.classList.remove("active");
    viewDetail.classList.remove("hidden");
    viewSimple.classList.add("hidden");
  });
}

function setupGameSelectListener() {
  const select = document.getElementById("game-select");
  if (!select || select.dataset.bound) return;
  select.addEventListener("change", (e) => {
    const value = e.target.value || null;
    currentSelectedGame = value;
    renderGamePlayerTable();
    renderGamesSummary();
    updatePlayersTitle();
  });
  select.dataset.bound = "1";
}

function setupCustomGameDropdownToggle() {
  const dropdown = document.querySelector(".game-dropdown");
  const toggle = document.getElementById("game-dropdown-toggle");
  const menu = document.getElementById("game-dropdown-menu");
  if (!dropdown || !toggle || !menu || toggle.dataset.bound) return;

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });

  toggle.dataset.bound = "1";
}

function setupRefreshButton() {
  const refreshBtn = document.getElementById("refresh-btn");
  if (!refreshBtn) return;
  refreshBtn.addEventListener("click", () => {
    loadGamesSheet();
    loadPlayersSheet();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupGameSelectListener();
  setupCustomGameDropdownToggle();
  setupRefreshButton();
  loadGamesSheet();
  loadPlayersSheet();
});
