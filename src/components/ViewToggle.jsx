export function ViewToggle({ view, onChange }) {
  return (
    <div className="segmented-control" aria-label="Leaderboard views">
      <button className={view === "leaderboard" ? "active" : ""} type="button" onClick={() => onChange("leaderboard")}>
        Rankings
      </button>
      <button className={view === "stats" ? "active" : ""} type="button" onClick={() => onChange("stats")}>
        Stats
      </button>
    </div>
  );
}
