export function CheckboxGroup({ label, options, selected, onToggle }) {
  return (
    <fieldset className="checkbox-group">
      <legend>{label}</legend>
      {options.length ? (
        <div className="checkbox-list">
          {options.map((option) => (
            <label key={option} className="checkbox-pill">
              <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="admin-help">Choose players first.</p>
      )}
    </fieldset>
  );
}
