export function AddGameForm({ form, busy, onChange, onSubmit }) {
  return (
    <form className="admin-form compact-admin-form" onSubmit={onSubmit}>
      <label>
        Game name
        <input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} required />
      </label>
      <button className="back-button" type="submit" disabled={busy}>
        Save game
      </button>
    </form>
  );
}
