import { arrowHead } from "@/components/learn/diagram-defs";
import { Tag } from "@/components/site/landing/harbour-drawing";
import { anchor, orthogonalRoute, pathData } from "@/lib/architecture/geometry";
import {
  closedDefects,
  boxIndex,
  patchesFor,
  resolveBox,
  resolveEdge,
  type ResolvedBox,
} from "@/lib/architecture/state";
import type {
  ArchGroup,
  ArchNode,
  EdgeState,
  MapModel,
  Side,
} from "@/lib/architecture/types";
import { cn } from "@/lib/utils";
import { BoxText, selectable } from "./svg";

interface ArchitectureDiagramProps {
  model: MapModel;
  phase: number;
  /** Overlay key: `all`, `defects`, or a layer the boxes and edges list. */
  layer?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

/** Fades between phases and overlays, as the journey drawings do. */
const EASE = "transition-[opacity,fill,stroke] duration-300";

const WIRE: Record<EdgeState, string> = {
  ok: "w green",
  broken: "w fault dash",
  idle: "w dash",
};
const HEAD = { ok: "green", broken: "fault", idle: "muted" } as const;
const BACK_OFF: Record<Side, [number, number]> = {
  l: [-3, 0],
  r: [3, 0],
  t: [0, -3],
  b: [0, 3],
};

/**
 * The architecture map at a given phase, filtered by an overlay, in the
 * course drawings' vocabulary: boxes take the hue of whoever runs them,
 * allowed traffic is green, the defect is red, what is not built yet is a
 * dashed outline.
 */
export function ArchitectureDiagram({
  model,
  phase,
  layer = "all",
  selectedId = null,
  onSelect,
}: ArchitectureDiagramProps) {
  const closed = closedDefects(model, phase);
  const patches = patchesFor(model, closed);
  const boxes = boxIndex(model);
  const pick = (id: string) => (onSelect ? () => onSelect(id) : undefined);

  const boxOpacity = (box: ResolvedBox<ArchGroup | ArchNode>) => {
    if (layer === "all") return box.dim ? 0.4 : 1;
    if (layer === "defects") return box.openDefects.length ? 1 : 0.16;
    return box.layers?.includes(layer) ? 1 : 0.16;
  };
  // In the defects overlay, every box with an open defect turns red.
  const faulty = (box: ResolvedBox<ArchGroup | ArchNode>) =>
    !!box.fault || (layer === "defects" && box.openDefects.length > 0);

  const edges = model.edges.flatMap((edge, i) => {
    const e = resolveEdge(edge, closed);
    const from = boxes.get(edge.from);
    const to = boxes.get(edge.to);
    if (!e || !from || !to) return [];
    const state = e.state ?? "ok";
    const opacity =
      layer === "all"
        ? 1
        : layer === "defects"
          ? state === "broken"
            ? 1
            : 0.1
          : e.layers.includes(layer)
            ? 1
            : 0.09;
    const p1 = anchor(from, e.fromSide, e.fromOffset);
    const p2 = anchor(to, e.toSide, e.toOffset);
    const route = e.via
      ? [p1, ...e.via, p2]
      : orthogonalRoute(p1, p2, e.fromSide, e.toSide);
    // The arrowhead's tip lands 3 past the wire's end: stop short of the box.
    const [dx, dy] = BACK_OFF[e.toSide];
    const points = [...route.slice(0, -1), { x: p2.x + dx, y: p2.y + dy }];
    return [{ key: `${e.from}-${e.to}-${i}`, e, state, opacity, points }];
  });

  return (
    <svg
      className="block h-auto w-full min-w-[1200px]"
      viewBox={`0 0 ${model.viewBox.width} ${model.viewBox.height}`}
      role={onSelect ? undefined : "img"}
      aria-label={model.name}
    >
      {model.groups.map((group) => {
        const g = resolveBox(group, patches, closed);
        const fault = faulty(g);
        const look = g.ghost
          ? cn("zone", fault ? "fault" : g.hue)
          : g.panel
            ? cn("zone panel", fault && "fault")
            : cn("zone", fault ? "fault" : g.hue);
        return (
          <g
            key={g.id}
            className={EASE}
            opacity={boxOpacity(g)}
            {...selectable(g.label, pick(g.id))}
          >
            <rect
              className={cn(look, selectedId === g.id && "sel", EASE)}
              x={g.x}
              y={g.y}
              width={g.w}
              height={g.h}
              rx="2"
              pointerEvents={onSelect ? "all" : undefined}
            />
            <text className="s" x={g.x + 16} y={g.y + 22}>
              {g.label}
            </text>
            {g.sub && (
              <text
                className={g.fault ? "s flt" : "s"}
                x={g.x + 16}
                y={g.y + 40}
              >
                {g.sub}
              </text>
            )}
            {g.defects && (
              <Tag
                x={g.x + g.w - 10}
                y={g.y + 22}
                ids={g.defects}
                closed={closed}
              />
            )}
          </g>
        );
      })}

      {edges.map(({ key, state, opacity, points }) => (
        <path
          key={key}
          className={cn(WIRE[state], EASE)}
          d={pathData(points)}
          opacity={opacity}
          strokeWidth={layer !== "all" && opacity === 1 ? 2.25 : undefined}
          strokeLinejoin="round"
          markerEnd={arrowHead(HEAD[state])}
        />
      ))}

      {model.nodes.map((node) => {
        const n = resolveBox(node, patches, closed);
        return (
          <g
            key={n.id}
            className={EASE}
            opacity={boxOpacity(n)}
            {...selectable(n.label, pick(n.id))}
          >
            <rect
              className={cn(
                n.ghost ? "ghost" : cn("n", faulty(n) ? "fault" : n.hue),
                selectedId === n.id && "sel",
                EASE,
              )}
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx="2"
              pointerEvents={onSelect ? "all" : undefined}
            />
            <BoxText
              x={n.x}
              y={n.y}
              w={n.w}
              h={n.h}
              title={n.label}
              sub={n.sub}
              faint={n.ghost}
            />
            {n.defects && (
              <Tag
                x={n.x + n.w}
                y={n.y - 7}
                ids={n.defects}
                closed={closed}
              />
            )}
          </g>
        );
      })}

      {edges.map(({ key, e, state, opacity }) =>
        e.label && e.labelAt ? (
          <text
            key={key}
            className={cn(state === "broken" ? "flt" : "l", "halo mid", EASE)}
            x={e.labelAt.x}
            y={e.labelAt.y + 4.5}
            opacity={opacity}
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            {e.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}
