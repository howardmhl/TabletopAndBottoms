export function LoginForm({ form, busy, onChange, onSubmit }) {
  return (
    <form className="admin-form compact-admin-form" onSubmit={onSubmit}>
      <label>
        Email
        <input type="email" value={form.email} onChange={(event) => onChange({ ...form, email: event.target.value })} required />
      </label>
      <label>
        Password
        <input type="password" value={form.password} onChange={(event) => onChange({ ...form, password: event.target.value })} required />
      </label>
      <button className="back-button" type="submit" disabled={busy}>
        Log in
      </button>
    </form>
  );
}
