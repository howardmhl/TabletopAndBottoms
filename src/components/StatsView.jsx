import { ALL_GAMES } from "../constants";
import { PlayerBadge } from "./PlayerBadge";
import { openGameView } from "../utils/links";

export function StatsView({
  games,
  gameSummary,
  selectedGame,
  selectedGamePlayers,
  selectedGameLink,
  summaryLimit,
  onSelectGame,
  onShowMore,
  onOpenBetrayal,
  playerMeta
}) {
  const visibleSummary = gameSummary.slice(0, summaryLimit);

  return (
    <div className="stats-grid">
      <section className="sub-panel">
        <div className="sub-panel-heading">
          <h3>Most played games</h3>
          <span>{gameSummary.length} games</span>
        </div>
        <div className="table-wrap compact">
          <table>
            <thead>
              <tr>
                <th>Game</th>
                <th>Played</th>
              </tr>
            </thead>
            <tbody>
              {visibleSummary.map((entry) => (
                <tr key={entry.game}>
                  <td>{entry.game}</td>
                  <td>{entry.times}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {summaryLimit < gameSummary.length ? (
          <button className="text-button" type="button" onClick={onShowMore}>
            Show more games
          </button>
        ) : null}
      </section>

      <section className="sub-panel">
        <div className="sub-panel-heading">
          <h3>Per-game records</h3>
          {selectedGameLink ? (
            <button className="text-button" type="button" onClick={() => openGameView(selectedGameLink, onOpenBetrayal)}>
              Open game page
            </button>
          ) : null}
        </div>

        <label className="select-label">
          Game
          <select value={selectedGame} onChange={(event) => onSelectGame(event.target.value)}>
            <option value={ALL_GAMES}>All games</option>
            {games.map((game) => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
          </select>
        </label>

        <div className="table-wrap compact">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Wins</th>
                <th>Plays</th>
              </tr>
            </thead>
            <tbody>
              {selectedGamePlayers.map((entry) => (
                <tr key={entry.name}>
                  <td>
                    <PlayerBadge name={entry.name} playerMeta={playerMeta} />
                  </td>
                  <td>{entry.wins}</td>
                  <td>{entry.plays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
