/**
 * The flags in a fix command that actually close the defect: the ones whose
 * value (or setting) shows up in the "fixed" state and not in the "now" state.
 * Location and output flags never count, and at most three are returned, so
 * the highlight stays a highlight.
 */
const NEVER = new Set([
  "region",
  "zone",
  "global",
  "network",
  "project",
  "format",
  "filter",
  "location",
]);

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** "enable-private-ip-google-access" → "privateIpGoogleAccess". */
const camel = (flag: string) =>
  flag
    .replace(/^(enable|no)-/, "")
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

function mentions(text: string, value: string) {
  return new RegExp(`(^|[^\\w./-])${escape(value)}($|[^\\w./-])`, "i").test(
    text,
  );
}

export function keyFlags(command: string, after: string, before: string) {
  const found: string[] = [];
  for (const token of command.split(/\s+/)) {
    if (!token.startsWith("--") || found.includes(token)) continue;
    const at = token.indexOf("=");
    const name = at < 0 ? token.slice(2) : token.slice(2, at);
    const raw = at < 0 ? undefined : token.slice(at + 1);
    if (NEVER.has(name)) continue;
    const value = raw?.replace(/^"|"$/g, "");
    if (value && value.length >= 2) {
      // A value counts when the fixed state has it and the found state does not.
      if (mentions(after, value) && !mentions(before, value)) found.push(token);
    } else if (!value) {
      // A switch (--enable-x) counts when the fixed state names its setting;
      // the found state names it too, just with the opposite value.
      if (mentions(after, camel(name))) found.push(token);
    }
    if (found.length === 3) break;
  }
  return found;
}
