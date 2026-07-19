import { CheckboxGroup } from "./CheckboxGroup";

export function AddMatchForm({ form, busy, gameOptions, playerOptions, onChange, onSubmit, onTogglePlayer, onToggleWinner }) {
  return (
    <form className="admin-form compact-admin-form" onSubmit={onSubmit}>
      <label>
        Date
        <input type="date" value={form.playedOn} onChange={(event) => onChange({ ...form, playedOn: event.target.value })} required />
      </label>
      <label>
        Game
        <select value={form.gameName} onChange={(event) => onChange({ ...form, gameName: event.target.value })} required>
          <option value="">Choose game</option>
          {gameOptions.map((game) => (
            <option key={game} value={game}>
              {game}
            </option>
          ))}
        </select>
      </label>
      <CheckboxGroup label="Players" options={playerOptions} selected={form.playerNames} onToggle={onTogglePlayer} />
      <CheckboxGroup label="Winners" options={form.playerNames} selected={form.winnerNames} onToggle={onToggleWinner} />
      <label>
        Match notes
        <textarea value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} rows="3" />
      </label>
      <button className="back-button" type="submit" disabled={busy}>
        Save result
      </button>
    </form>
  );
}
