/**
 * Text fitting for the SVG diagrams. The page renders on the server, so text
 * cannot be measured; these are per-character widths of the site's faces
 * (Atkinson Hyperlegible Next / Mono), measured in the browser and rounded up
 * so estimates err wide.
 */
const EM = { mono: 0.64, sans: 0.5 } as const;

export type Face = keyof typeof EM;

export function textWidth(text: string, size: number, face: Face) {
  return text.length * size * EM[face];
}

/** Greedy line breaks between `words`, joined by spaces. */
function fill(words: string[], width: number, size: number, face: Face) {
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next, size, face) > width) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  lines.push(line);
  return lines;
}

/**
 * Break `text` into lines no wider than `width`. Prefers the " · " separators
 * the model uses between facts, then falls back to spaces. `fits` says
 * whether every line fits; `lines` is never longer than `maxLines`, the last
 * line keeping whatever remains.
 */
export function wrapText(
  text: string,
  width: number,
  size: number,
  face: Face,
  maxLines = 2,
): { lines: string[]; fits: boolean } {
  const fitsIn = (lines: string[]) =>
    lines.length <= maxLines &&
    lines.every((l) => textWidth(l, size, face) <= width);
  if (textWidth(text, size, face) <= width)
    return { lines: [text], fits: true };

  const parts = text.split(" · ");
  const byDot =
    parts.length > 1
      ? fill(
          parts.map((part, i) => (i < parts.length - 1 ? `${part} ·` : part)),
          width,
          size,
          face,
        )
      : null;
  if (byDot && fitsIn(byDot)) return { lines: byDot, fits: true };

  const bySpace = fill(text.split(" "), width, size, face);
  const lines = [
    ...bySpace.slice(0, maxLines - 1),
    bySpace.slice(maxLines - 1).join(" "),
  ].filter(Boolean);
  return { lines, fits: fitsIn(bySpace) };
}
