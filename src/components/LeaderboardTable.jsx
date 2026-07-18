import { EmptyState } from "./StatusCards";
import { PlayerBadge } from "./PlayerBadge";

export function LeaderboardTable({ entries, playerMeta }) {
  if (!entries.length) {
    return <EmptyState title="No matches yet" text="Once games have been logged, rankings will appear here." />;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Current wins</th>
            <th>Current games</th>
            <th>Prizes</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.name}>
              <td className="rank-cell">#{entry.rank}</td>
              <td>
                <PlayerBadge name={entry.name} playerMeta={playerMeta} />
              </td>
              <td>{entry.wins}</td>
              <td>{entry.games}</td>
              <td>{entry.prizesClaimed > 0 ? <PrizePill entry={entry} /> : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PrizePill({ entry }) {
  return (
    <span className="prize-tooltip-wrap" tabIndex="0">
      <span className="prize-pill">{entry.prizesClaimed} claimed</span>
      <span className="prize-tooltip" role="tooltip">
        Last cashed out{entry.lastPrizeAwardedOnDisplay ? ` on ${entry.lastPrizeAwardedOnDisplay}` : ""}.
      </span>
    </span>
  );
}


