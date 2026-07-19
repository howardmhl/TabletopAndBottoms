import { ADD_GAME, ADD_MATCH, ADD_PRIZE } from "./adminConstants";

export function AdminMenu({ onSelect }) {
  return (
    <div className="admin-choice-grid">
      <button className="admin-choice-card" type="button" onClick={() => onSelect(ADD_MATCH)}>
        <span>Add game result</span>
        <small>Record a played game, who joined, and who won.</small>
      </button>
      <button className="admin-choice-card" type="button" onClick={() => onSelect(ADD_PRIZE)}>
        <span>Prize Cash Out</span>
        <small>Award the current leader and reset their active score.</small>
      </button>
      <button className="admin-choice-card" type="button" onClick={() => onSelect(ADD_GAME)}>
        <span>Add new game</span>
        <small>Add another game to the dropdown for future results.</small>
      </button>
    </div>
  );
}
