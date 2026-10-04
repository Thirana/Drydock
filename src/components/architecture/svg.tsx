/** Arrowhead that takes the colour of the path using it. */
export function ArrowMarker({ id }: { id: string }) {
  return (
    <defs>
      <marker
        id={id}
        viewBox="0 0 10 10"
        refX={9}
        refY={5}
        markerWidth={7}
        markerHeight={7}
        orient="auto-start-reverse"
      >
        <path d="M0 0 L10 5 L0 10 z" fill="context-stroke" />
      </marker>
    </defs>
  );
}

export function DefectMarks({
  x,
  y,
  ids,
  emphasised = true,
  tag = false,
}: {
  x: number;
  y: number;
  ids: string[];
  emphasised?: boolean;
  /** Sit on the box's top edge as a small tag, clear of the box's own text. */
  tag?: boolean;
}) {
  const text = ids.join(" ");
  const width = text.length * 10.5 * 0.62 + 10;
  return (
    <g opacity={emphasised ? 1 : 0.85}>
      {tag && (
        <rect
          x={x - width + 5}
          y={y - 7}
          width={width}
          height={14}
          className="fill-gl-bg"
        />
      )}
      <text
        x={x}
        y={tag ? y + 4 : y}
        fontSize={10.5}
        fontWeight={600}
        textAnchor="end"
        className="font-mono"
        style={{ fill: "var(--tone-danger)" }}
      >
        {text}
      </text>
    </g>
  );
}

export function HopBadge({
  x,
  y,
  number,
  failing,
}: {
  x: number;
  y: number;
  number: number;
  failing: boolean;
}) {
  const color = failing ? "var(--dd-fault)" : "var(--dd-sel)";
  return (
    <g>
      <rect
        x={x - 11}
        y={y - 11}
        width={22}
        height={22}
        strokeWidth={1.8}
        style={{
          fill: "var(--dd-ground)",
          stroke: color,
        }}
      />
      <text
        x={x}
        y={y + 4}
        fontSize={11.5}
        textAnchor="middle"
        fontWeight={700}
        className="font-mono"
        style={{ fill: color }}
      >
        {number}
      </text>
    </g>
  );
}

/** Props that make an SVG group behave like a button. */
export function selectable(
  label: string,
  onSelect?: () => void,
): React.SVGProps<SVGGElement> {
  if (!onSelect) return {};
  return {
    role: "button",
    tabIndex: 0,
    "aria-label": label,
    style: { cursor: "pointer" },
    onClick: onSelect,
    onKeyDown: (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect();
      }
    },
  };
}

/** A `useId()` value made safe for `url(#…)` references. */
export function markerIdFrom(reactId: string) {
  return `arrow-${reactId.replace(/[^\w-]/g, "")}`;
}
