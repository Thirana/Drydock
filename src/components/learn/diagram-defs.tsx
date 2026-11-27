/**
 * Arrowheads for course figures, one per hue. Render once per page; drawings
 * point at them with `markerEnd="url(#dd-ah-amber)"`. Fills come from the
 * `.dd-mk-*` classes in globals.css, so they follow the theme.
 *
 * Heads are sized in drawing units, not by stroke width, so a thick
 * highlighted wire gets the same head as a thin one. The wire stops inside
 * the head (refX 7), so even a 3-unit wire never shows a blunt end beside
 * the tip; the tip lands 3 units past the wire's end.
 */

export const ARROW_HUES = [
  "muted",
  "plum",
  "teal",
  "green",
  "amber",
  "fault",
  "accent",
] as const;

export type ArrowHue = (typeof ARROW_HUES)[number];

export const arrowHead = (hue: ArrowHue) => `url(#dd-ah-${hue})`;

export function DiagramDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      className="absolute"
    >
      <defs>
        {ARROW_HUES.map((hue) => (
          <marker
            key={hue}
            id={`dd-ah-${hue}`}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerUnits="userSpaceOnUse"
            markerWidth="10"
            markerHeight="10"
            orient="auto-start-reverse"
          >
            <path className={`dd-mk-${hue}`} d="M0,0 L10,5 L0,10 z" />
          </marker>
        ))}
      </defs>
    </svg>
  );
}
