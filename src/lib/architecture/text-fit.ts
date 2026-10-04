import type { Point, Rect } from "./types";

/**
 * Text fitting for the SVG diagrams. The page renders on the server, so text
 * cannot be measured; these are conservative per-character widths for the
 * site's faces (Atkinson Hyperlegible Next / Mono), tuned so estimates err wide.
 */
const EM = { mono: 0.6, sans: 0.56 } as const;

export type Face = keyof typeof EM;

export function textWidth(text: string, size: number, face: Face) {
  return text.length * size * EM[face];
}

/**
 * Break `text` into at most `maxLines` lines no wider than `width`. Prefers the
 * " · " separators the model uses between facts, then spaces. The last line
 * keeps whatever remains; `fits` says whether it all fit.
 */
export function wrapText(
  text: string,
  width: number,
  size: number,
  face: Face,
  maxLines = 2,
): { lines: string[]; fits: boolean } {
  if (textWidth(text, size, face) <= width)
    return { lines: [text], fits: true };
  const byDot = text.split(" · ");
  const words =
    byDot.length > 1
      ? byDot.map((part, i) => (i < byDot.length - 1 ? `${part} ·` : part))
      : text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (
      line &&
      textWidth(next, size, face) > width &&
      lines.length < maxLines - 1
    ) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  lines.push(line);
  return {
    lines,
    fits: lines.every((l) => textWidth(l, size, face) <= width),
  };
}

/**
 * Where to put an edge label: the midpoint of the longest horizontal stretch of
 * the route that no box covers, so labels never sit under or over a box.
 * Falls back to the longest horizontal segment when nothing is free.
 */
export function labelSpot(
  points: Point[],
  width: number,
  obstacles: Rect[],
  minLength = 40,
): { at: Point; room: number } | null {
  let best: { at: Point; free: number; room: number } | null = null;
  // Routes can repeat a point where they bend zero distance; merge straight runs
  // so a single horizontal line counts as one segment.
  const run: Point[] = [];
  for (const p of points) {
    const last = run.at(-1);
    if (last && last.x === p.x && last.y === p.y) continue;
    const prev = run.at(-2);
    if (
      prev &&
      last &&
      ((prev.y === last.y && last.y === p.y) ||
        (prev.x === last.x && last.x === p.x))
    )
      run[run.length - 1] = p;
    else run.push(p);
  }
  points = run;
  for (let i = 0; i < points.length - 1; i++) {
    const [a, b] = [points[i], points[i + 1]];
    if (Math.abs(a.y - b.y) >= 1) continue;
    const y = a.y;
    const start = Math.min(a.x, b.x) + 10;
    const end = Math.max(a.x, b.x) - 14; // leave room for the arrowhead
    if (end - start < minLength) continue;

    // Free stretches of [start, end] once every box at this height is cut out.
    const blocked = obstacles
      .filter((r) => y > r.y - 12 && y < r.y + r.height + 12)
      .map((r) => [r.x - 8, r.x + r.width + 8] as const)
      .sort((p, q) => p[0] - q[0]);
    let cursor = start;
    const free: [number, number][] = [];
    for (const [from, to] of blocked) {
      if (to <= cursor) continue;
      if (from > cursor) free.push([cursor, Math.min(from, end)]);
      cursor = Math.max(cursor, to);
      if (cursor >= end) break;
    }
    if (cursor < end) free.push([cursor, end]);

    for (const [from, to] of free) {
      const length = to - from;
      if (length <= 0) continue;
      // Prefer stretches the label fits in; among those, the longest.
      const score = (length >= width ? 10000 : 0) + length;
      if (!best || score > best.free) {
        best = { at: { x: (from + to) / 2, y }, free: score, room: length };
      }
    }
  }
  return best ? { at: best.at, room: best.room } : null;
}

/** Splits a label into two lines as evenly as its words allow. */
export function splitInTwo(text: string): [string, string] | null {
  const words = text.split(" ");
  if (words.length < 2) return null;
  let bestAt = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(
      words.slice(0, i).join(" ").length - words.slice(i).join(" ").length,
    );
    if (diff < bestDiff) [bestAt, bestDiff] = [i, diff];
  }
  return [words.slice(0, bestAt).join(" "), words.slice(bestAt).join(" ")];
}
