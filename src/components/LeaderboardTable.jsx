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
            <th>Wins</th>
            <th>Games</th>
            <th>Win rate</th>
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
              <td>{Math.round(entry.winRate)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
