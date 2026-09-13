import type { NodeKind, Tone } from "./types";

/** Tones resolve to CSS custom properties defined in globals.css. */
export const toneColor = (tone: Tone) => `var(--tone-${tone})`;

export const KIND_TONE: Record<NodeKind, Tone> = {
  compute: "compute",
  data: "data",
  edge: "edge",
  ext: "external",
  net: "lineStrong",
};
