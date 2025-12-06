const SHEET_ID = "1G2czJrtyfVnZrfXyT7R9B2n4IQm8towBW8zrXL_yBy4";
const SHEET_BETRAYAL_NAME = "betrayal";

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

let chapters = [];
let familiesByName = {};

function safeCell(cells, index) {
  const cell = cells[index];
  if (!cell || cell.v == null) return "";
  return String(cell.v).trim();
}

function traitorIcon(value) {
  if (!value) return "";
  const v = String(value).trim().toLowerCase();
  return v === "true" ? "✔️" : "";
}

function diedIcon(value) {
  if (!value) return "";
  const v = String(value).trim().toLowerCase();
  return v === "true" ? "☠️" : "";
}

function getFamilyColorStyles(familyName) {
  const key = (familyName || "").trim().toLowerCase();
  switch (key) {
    case "plumroy":
      return { bg: "#fecaca", border: "#fca5a5" }; //ff5959ff
    case "moonfire":
      return { bg: "#fef3c7", border: "#fde68a" }; //ffeb51ff
    case "hollowgrave":
      return { bg: "#dbeafe", border: "#bfdbfe" }; //499bffff
    case "anghelos":
      return { bg: "#f3e8ff", border: "#e9d5ff" }; //a958ffff
    default:
      return { bg: "transparent", border: "transparent" };
  }
}

function parseChapterRow(row, indexes, rowIndex) {
  const cells = row.c || [];

  const chapter = safeCell(cells, indexes.chapter);
  const date = safeCell(cells, indexes.date);
  const haunt = safeCell(cells, indexes.haunt);

  if (!chapter && !date && !haunt) return null;

  return { chapter, date, haunt, rowIndex };
}

function parseFamilyRow(row, indexes) {
  const cells = row.c || [];

  const name = safeCell(cells, indexes.name);
  const family = safeCell(cells, indexes.family);
  const age = safeCell(cells, indexes.age);
  const traitor = safeCell(cells, indexes.traitor);
  const died = safeCell(cells, indexes.died);
  const fate = safeCell(cells, indexes.fate);

  if (!name && !family && !age && !traitor && !died && !fate) return null;

  return {
    family: family || "Unknown family",
    name,
    age,
    traitor,
    died,
    fate
  };
}

function renderChapterLog() {
  const tbody = document.getElementById("chapter-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const entries = [...chapters].sort((a, b) => a.rowIndex - b.rowIndex);

  if (entries.length === 0) {
    return;
  }

  entries.forEach(ch => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="chapter-pad"><strong>${ch.chapter || "–"}</strong></td>
      <td><strong>${ch.date || "–"}</strong></td>
      <td><strong>${ch.haunt || "–"}</strong></td>
      <td><strong>${ch.notes || ""}</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

const FAMILY_PLAYERS = {
  Plumroy: "Howie",
  Moonfire: "Chris",
  Hollowgrave: "Danny",
  Anghelos: "Pat"
};

function renderFamilies() {
  const root = document.getElementById("families-root");
  if (!root) return;

  root.innerHTML = "";

  const order = (familiesByName.__order || []).filter(Boolean);
  const familyNames =
    order.length > 0
      ? order
      : Object.keys(familiesByName).filter(k => k !== "__order");

  familyNames.forEach(familyName => {
    const members = familiesByName[familyName] || [];

    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "header-row view-header";
    header.innerHTML = `<h2>${familyName} Family</h2>`;

    const colors = getFamilyColorStyles(familyName);
    header.style.background = colors.bg;
    header.style.borderRadius = "18px";
    header.style.margin = "-4px -4px 12px -4px";
    header.style.padding = "8px 16px";
    header.style.display = "flex";
    header.style.alignItems = "center";

    card.style.border = `2px solid ${colors.border}`;
    card.style.borderRadius = "18px";

    const title = header.querySelector("h2");
    if (title) {
      title.style.marginTop = "0";
      title.style.marginBottom = "0";
      title.style.lineHeight = "1.2";
    }

    card.appendChild(header);

    const table = document.createElement("table");
    table.className = "table betrayal-family-table";
    table.innerHTML = `
      <colgroup>
        <col style="width: 10%;">
        <col style="width: 5%;">
        <col style="width: 10%;">
        <col style="width: 10%;">
        <col style="width: 70%;">
      </colgroup>
      <thead>
        <tr>
          <th style="text-align:left;">Name</th>
          <th style="text-align:left;">Age</th>
          <th style="text-align:left;">Traitor?</th>
          <th style="text-align:left;">Died?</th>
          <th style="text-align:left;">Fate / Notes</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    const sortedMembers = [...members].sort((a, b) => {
        const ac = a.chapter;
        const bc = b.chapter;

        const aHasChapter = ac !== undefined && ac !== null && ac !== "";
        const bHasChapter = bc !== undefined && bc !== null && bc !== "";

        if (aHasChapter && bHasChapter) {
            if (ac !== bc) return ac - bc;

            const an = (a.name || "").toLowerCase();
            const bn = (b.name || "").toLowerCase();
            return an.localeCompare(bn);
        }

        return a.rowIndex - b.rowIndex;
    });

    sortedMembers.forEach(m => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${m.name || "–"}</td>
        <td>${m.age || "–"}</td>
        <td>${traitorIcon(m.traitor) || ""}</td>
        <td>${diedIcon(m.died) || ""}</td>
        <td>${m.fate || ""}</td>
      `;
      tbody.appendChild(tr);
    });

    card.appendChild(table);

    const footer = document.createElement("div");
    footer.style.marginTop = "6px";
    footer.style.fontSize = "0.75rem";
    footer.style.opacity = "0.6";
    footer.style.textAlign = "right";

    footer.textContent = "Played by " + (FAMILY_PLAYERS[familyName] || "Unknown");

    card.appendChild(footer);

    root.appendChild(card);
  });
}

function loadBetrayalSheet() {
  const old = document.getElementById("sheet-jsonp-betrayal");
  if (old) old.remove();

  const script = document.createElement("script");
  script.id = "sheet-jsonp-betrayal";
  script.src = buildGvizUrl(SHEET_BETRAYAL_NAME, "handleBetrayalSheet");
  document.body.appendChild(script);
}

window.handleBetrayalSheet = function (json) {
  const table = json.table;
  const cols = table.cols || [];
  const rows = table.rows || [];

  const headers = cols.map(c => (c.label || c.id || "").trim());

  const idxChapter = headers.indexOf("chapter");
  const idxDate = headers.indexOf("date");
  const idxHaunt = headers.indexOf("haunt");

  const idxName = headers.indexOf("name");
  const idxFamily = headers.indexOf("family");
  const idxAge = headers.indexOf("age");
  const idxTraitor = headers.indexOf("traitor");
  const idxDied = headers.indexOf("died");
  const idxFate = headers.indexOf("fate");

  const indexes = {
    chapter: idxChapter,
    date: idxDate,
    haunt: idxHaunt,
    name: idxName,
    family: idxFamily,
    age: idxAge,
    traitor: idxTraitor,
    died: idxDied,
    fate: idxFate
  };

  const chapterRows = [];
  const familyMap = { __order: [] };

  rows.forEach((row, rowIndex) => {
    const ch = parseChapterRow(row, indexes, rowIndex);
    if (ch) chapterRows.push(ch);

    const fam = parseFamilyRow(row, indexes);
    if (fam) {
      const famName = fam.family || "Unknown family";
      if (!familyMap[famName]) {
        familyMap[famName] = [];
        familyMap.__order.push(famName);
      }
      familyMap[famName].push(fam);
    }
  });

  chapters = chapterRows;
  familiesByName = familyMap;

  renderChapterLog();
  renderFamilies();
};

document.addEventListener("DOMContentLoaded", () => {
  loadBetrayalSheet();
});
