export function LoadingState({ label }) {
  return (
    <div className="status-card">
      <span className="loader" aria-hidden="true" />
      <span>{label}...</span>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="status-card error">
      <strong>Could not load data</strong>
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({ title, text }) {
  return (
    <div className="status-card">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}
