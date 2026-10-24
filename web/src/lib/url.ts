/**
 * Normalizes a submitted URL to the canonical form the contract keys listings by: lowercase host
 * without a leading "www.", no query string, no fragment, no trailing slash. Returns null when the
 * input does not look like a real site.
 */
export function normalizeUrl(input: string): string | null {
  let raw = input.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (!host.includes(".")) return null;

  const path = parsed.pathname.replace(/\/+$/, "");
  return `https://${host}${path}`;
}

export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
