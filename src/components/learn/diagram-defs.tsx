/**
 * Arrowheads for course figures, one per hue. Render once per page; drawings
 * point at them with `markerEnd="url(#dd-ah-amber)"`. Fills come from the
 * `.dd-mk-*` classes in globals.css, so they follow the theme.
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
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path className={`dd-mk-${hue}`} d="M0,0 L10,5 L0,10 z" />
          </marker>
        ))}
      </defs>
    </svg>
  );
}
