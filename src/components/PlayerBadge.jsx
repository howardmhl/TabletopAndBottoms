import { getInitials } from "../data/stats";

export function PlayerBadge({ name, playerMeta }) {
  const player = playerMeta[name.toLowerCase()];

  return (
    <span className="player-badge">
      {player?.icon ? <img src={player.icon} alt="" /> : <span className="avatar-fallback">{getInitials(name)}</span>}
      <span>{player?.name ?? name}</span>
    </span>
  );
}
