export function normalizeAppLink(href) {
  if (!href) return "";

  const trimmed = href.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.toLowerCase().includes("betrayal")) return "/betrayal";

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function openGameView(link, onOpenBetrayal) {
  if (link === "/betrayal") {
    onOpenBetrayal();
    return;
  }

  window.location.href = link;
}
