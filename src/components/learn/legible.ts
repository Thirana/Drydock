/**
 * Text sizes inside course drawings, in drawing units. Drawings are drawn
 * 920-960 units wide and shown near 1:1, so a unit is about a pixel. The
 * notes' original sizes (9.5-12.5) read at 8-10px on screen; this keeps their
 * order but lifts them: x1.15, never below 12, to the nearest half. Sizes of
 * 15 and up were already legible and stay.
 */
export function legible(size: number) {
  if (size >= 15) return size;
  return Math.max(12, Math.round(size * 1.15 * 2) / 2);
}
