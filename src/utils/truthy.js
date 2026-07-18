export function truthy(value) {
  return ["true", "yes", "y", "1", "x"].includes(String(value).trim().toLowerCase());
}
