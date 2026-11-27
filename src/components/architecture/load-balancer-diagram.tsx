import { arrowHead } from "@/components/learn/diagram-defs";
import { Tag } from "@/components/site/landing/harbour-drawing";
import { pathData } from "@/lib/architecture/geometry";
import type { LoadBalancerChain, Owner } from "@/lib/architecture/types";
import { cn } from "@/lib/utils";
import { BoxText, selectable } from "./svg";

interface ChainBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  hue?: Owner;
  defects?: string[];
}

/** No defect on the chain is closed here: it is drawn as found. */
const NONE_CLOSED: ReadonlySet<string> = new Set();

const EASE = "transition-opacity duration-300";
const FADED = 0.4;

/**
 * The proxy load balancer link by link, in the course drawings' vocabulary.
 * Each lane is one load balancer; an arrow means "points at". The health
 * check probes' path is allowed traffic, so it is green.
 *
 * The selected link shows how far a request has come: its lane is lit up to
 * it, the hops it has passed in green, and what is still ahead faded. A
 * selected probe-path box lights the probe path and the MIG it checks.
 */
export function LoadBalancerDiagram({
  chain,
  selectedId,
  onSelect,
}: {
  chain: LoadBalancerChain;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { grid } = chain;
  const cellX = (column: number) => grid.x + column * grid.columnStep;
  const cellY = (row: number) => grid.y + row * grid.rowStep;

  const boxes: ChainBox[] = [
    ...chain.lanes.flatMap((lane, row) =>
      lane.links.map((link, column) => ({
        ...link,
        hue: link.hue ?? "plum",
        x: cellX(column),
        y: cellY(row),
        w: grid.cellWidth,
        h: grid.cellHeight,
      })),
    ),
    ...chain.extras,
  ];

  const row = chain.lanes.findIndex((l) =>
    l.links.some((k) => k.id === selectedId),
  );
  const column =
    row < 0 ? -1 : chain.lanes[row].links.findIndex((k) => k.id === selectedId);
  const probes = row < 0;
  /** The box a probe checks: the last link of the lane that has a health check. */
  const probed = chain.lanes.at(-1)?.links.at(-1)?.id;
  const shown = (id: string) => {
    if (probes) return chain.extras.some((e) => e.id === id) || id === probed;
    const links = chain.lanes[row].links;
    const at = links.findIndex((k) => k.id === id);
    return at >= 0 && at <= column;
  };

  return (
    <svg
      className="mx-auto block h-auto w-full min-w-[960px]"
      style={{ maxWidth: chain.viewBox.width }}
      viewBox={`0 0 ${chain.viewBox.width} ${chain.viewBox.height}`}
      aria-label="Load balancer component chain"
    >
      {chain.lanes.map((lane, r) => (
        <g key={lane.label}>
          <text
            className={cn("s", EASE)}
            x={grid.x}
            y={cellY(r) - 30}
            opacity={r === row ? 1 : FADED}
          >
            {lane.label}
          </text>
          {lane.links.slice(1).map((link, i) => {
            const y = cellY(r) + grid.cellHeight / 2;
            const passed = r === row && i + 1 <= column;
            return (
              <path
                key={link.id}
                className={cn(passed ? "w green" : "w", EASE)}
                opacity={r === row ? 1 : FADED}
                d={`M${cellX(i) + grid.cellWidth} ${y} H${cellX(i + 1) - 3}`}
                markerEnd={arrowHead(passed ? "green" : "muted")}
              />
            );
          })}
        </g>
      ))}

      {chain.wires.map((points, i) => (
        <path
          key={i}
          className={cn("w green", EASE)}
          opacity={probes ? 1 : FADED}
          d={pathData(points)}
          markerEnd={arrowHead("green")}
        />
      ))}

      {boxes.map((box) => (
        <g
          key={box.id}
          className={EASE}
          opacity={shown(box.id) ? 1 : FADED}
          {...selectable(box.label, () => onSelect(box.id))}
        >
          <rect
            className={cn("n", box.hue, box.id === selectedId && "sel")}
            x={box.x}
            y={box.y}
            width={box.w}
            height={box.h}
            rx="2"
          />
          <BoxText
            x={box.x}
            y={box.y}
            w={box.w}
            h={box.h}
            title={box.label}
            sub={box.sub}
          />
          {box.defects && (
            <Tag
              x={box.x + box.w}
              y={box.y - 7}
              ids={box.defects}
              closed={NONE_CLOSED}
            />
          )}
        </g>
      ))}

      {chain.annotations.map((note) =>
        note.lines.map((line, i) => (
          <text
            key={`${note.x}-${note.y}-${i}`}
            className={cn("s f", EASE)}
            opacity={probes ? 1 : FADED}
            x={note.x}
            y={note.y + i * 20}
          >
            {line}
          </text>
        )),
      )}
    </svg>
  );
}
