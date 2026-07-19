export function PrizeCashOutForm({ form, busy, playerOptions, onChange, onSubmit }) {
  return (
    <form className="admin-form compact-admin-form" onSubmit={onSubmit}>
      <label>
        Date
        <input type="date" value={form.awardedOn} onChange={(event) => onChange({ ...form, awardedOn: event.target.value })} required />
      </label>
      <label>
        Player
        <select value={form.playerName} onChange={(event) => onChange({ ...form, playerName: event.target.value })} required>
          <option value="">Choose player</option>
          {playerOptions.map((player) => (
            <option key={player} value={player}>
              {player}
            </option>
          ))}
        </select>
      </label>
      <label>
        Notes
        <textarea value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} rows="3" />
      </label>
      <button className="back-button" type="submit" disabled={busy}>
        Save cash-out
      </button>
    </form>
  );
}
