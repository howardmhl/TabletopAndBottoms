export function parseDateToMs(value) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;

  const text = String(value || "").trim();
  if (!text) return null;

  const serializedDate = text.match(
    /^Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})(?:,\s*(\d{1,2}),\s*(\d{1,2})(?:,\s*(\d{1,2}))?)?\)$/
  );

  if (serializedDate) {
    const [, year, month, day, hour = 0, minute = 0, second = 0] = serializedDate;
    return new Date(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second)).getTime();
  }

  const native = Date.parse(text);
  return Number.isFinite(native) ? native : null;
}

export function formatDateForDisplay(value) {
  const dateMs = parseDateToMs(value);
  if (!dateMs) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(dateMs));
}
