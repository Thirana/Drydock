import { useId, type SVGProps } from "react";
import { anchor, orthogonalRoute, pathData } from "@/lib/architecture/geometry";
import { edgeKey, type JourneyHighlight } from "@/lib/architecture/journeys";
import {
  boxIndex,
  closedDefects,
  patchesAt,
  resolveBox,
  resolveEdge,
  type ResolvedBox,
} from "@/lib/architecture/state";
import {
  labelSpot,
  splitInTwo,
  textWidth,
  wrapText,
} from "@/lib/architecture/text-fit";
import { KIND_TONE, toneColor } from "@/lib/architecture/tone";
import type {
  ArchEdge,
  ArchGroup,
  ArchNode,
  MapModel,
  Rect,
} from "@/lib/architecture/types";
import { cn } from "@/lib/utils";
import {
  ArrowMarker,
  DefectMarks,
  HopBadge,
  markerIdFrom,
  selectable,
} from "./svg";

interface ArchitectureDiagramProps {
  model: MapModel;
  phase: number;
  /** Region of the map to show. Defaults to the whole viewBox. */
  crop?: Rect;
  /** Merged over the defaults; pass `min-w-0` to let the map shrink. */
  className?: string;
  /**
   * Boxes held back, with their edges. Passing this animates boxes in and out
   * as the set changes.
   */
  hidden?: ReadonlySet<string>;
  /** Overlay key. Ignored while tracing a journey. */
  layer?: string;
  selectedId?: string | null;
  /** Limits which boxes can be selected; the rest stay inert and out of the tab order. */
  selectableIds?: ReadonlySet<string>;
  /** Trace a journey instead of applying an overlay. */
  highlight?: JourneyHighlight | null;
  onSelect?: (id: string) => void;
}

const SELECTED = "var(--dd-sel)";

/** The architecture map at a given phase, filtered by an overlay or a journey. */
export function ArchitectureDiagram({
  model,
  phase,
  crop,
  className,
  hidden,
  layer = "all",
  selectedId = null,
  selectableIds,
  highlight = null,
  onSelect,
}: ArchitectureDiagramProps) {
  const view = crop ?? { x: 0, y: 0, ...model.viewBox };
  const markerId = markerIdFrom(useId());
  const closed = closedDefects(model, phase);
  const patches = patchesAt(model, phase);
  const boxes = boxIndex(model);
  const clickable = !highlight && onSelect;
  const selectHandler = (id: string) =>
    onSelect && !highlight && (!selectableIds || selectableIds.has(id))
      ? () => onSelect(id)
      : undefined;

  /** Opacity for a box or edge; faded and scaled in and out when `hidden` is in use. */
  const visibility = (
    ids: string[],
    opacity: number,
    scale: boolean,
  ): SVGProps<SVGGElement> => {
    if (!hidden) return { opacity };
    const shown = ids.every((id) => !hidden.has(id));
    return {
      pointerEvents: shown ? undefined : "none",
      style: {
        opacity: shown ? opacity : 0,
        transform: shown || !scale ? undefined : "scale(0.9)",
        transformBox: "fill-box",
        transformOrigin: "center",
        transition:
          "opacity 500ms ease, transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
      },
    };
  };

  const boxOpacity = (box: ResolvedBox<ArchGroup | ArchNode>) => {
    if (highlight) return highlight.lit.has(box.id) ? 1 : 0.32;
    if (layer === "all") return box.dim ? 0.42 : 1;
    if (layer === "defects") return box.openDefects.length ? 1 : 0.16;
    return box.layers?.includes(layer) ? 1 : 0.16;
  };

  // Every box an edge label must stay clear of, and the labels collected
  // while edges draw, so they can be painted above the boxes.
  const nodeRects = model.nodes.map((n) => ({
    x: n.x,
    y: n.y,
    width: n.w,
    height: n.h,
  }));
  const edgeLabels: {
    key: string;
    ids: string[];
    opacity: number;
    at: { x: number; y: number };
    width: number;
    lines: string[];
    tone: ArchEdge["tone"];
  }[] = [];

  return (
    <svg
      className={cn("block h-auto w-full min-w-[1240px]", className)}
      viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
      role={clickable ? undefined : "img"}
      aria-label={model.name}
    >
      <ArrowMarker id={markerId} />

      {model.groups.map((group) => {
        const g = resolveBox(group, patches, closed);
        const tone =
          layer === "defects" && g.openDefects.length ? "danger" : g.tone;
        const selected = selectedId === g.id;
        const hop = highlight?.order.get(g.id);
        return (
          <g
            key={g.id}
            {...visibility([g.id], boxOpacity(g), true)}
            {...selectable(g.label, selectHandler(g.id))}
          >
            <rect
              x={g.x}
              y={g.y}
              width={g.w}
              height={g.h}
              rx={0}
              opacity={0.85}
              strokeWidth={selected ? 2 : 1}
              strokeDasharray={g.dashed ? "6 5" : undefined}
              style={{
                fill: selected
                  ? "var(--diagram-selection-wash)"
                  : "var(--diagram-group-wash)",
                stroke: selected ? SELECTED : toneColor(tone),
              }}
            />
            <text
              x={g.x + 16}
              y={g.y + 21}
              fontSize={12.5}
              fontWeight={500}
              letterSpacing={0.3}
              className="font-mono"
              style={{ fill: toneColor(tone) }}
            >
              {g.label}
            </text>
            {g.sub && (
              <text
                x={g.x + 16}
                y={g.y + 37}
                fontSize={11.5}
                className="fill-gl-text-faint font-mono"
              >
                {g.sub}
              </text>
            )}
            {!highlight && g.openDefects.length > 0 && (
              <DefectMarks
                x={g.x + g.w - 14}
                y={g.y + 21}
                ids={g.openDefects}
                emphasised={layer === "defects"}
              />
            )}
            {hop !== undefined && (
              <HopBadge
                x={g.x + g.w - 20}
                y={g.y + 20}
                number={hop}
                failing={!!highlight?.failing.has(g.id)}
              />
            )}
          </g>
        );
      })}

      {model.edges.map((edge, i) => {
        const e = resolveEdge(edge, closed);
        const from = boxes.get(edge.from);
        const to = boxes.get(edge.to);
        if (!e || !from || !to) return null;

        const opacity = highlight
          ? highlight.edges.has(edgeKey(e.from, e.to))
            ? 1
            : 0.18
          : layer === "all"
            ? e.dim
              ? 0.35
              : 0.9
            : layer === "defects"
              ? e.defect
                ? 1
                : 0.1
              : e.layers.includes(layer)
                ? 1
                : 0.09;

        const p1 = anchor(from, e.fromSide, e.fromOffset);
        const p2 = anchor(to, e.toSide, e.toOffset);
        const points = e.via
          ? [p1, ...e.via, p2]
          : orthogonalRoute(p1, p2, e.fromSide, e.toSide);
        const oneLine = e.label ? textWidth(e.label, 11, "mono") + 12 : 0;
        const spot = e.label ? labelSpot(points, oneLine, nodeRects) : null;
        if (e.label && spot) {
          // The stretch's margins may be spent; a box edge may not.
          const room = spot.room + 16;
          const halves = oneLine > room ? splitInTwo(e.label) : null;
          const twoLine = halves
            ? Math.max(...halves.map((h) => textWidth(h, 10, "mono"))) + 8
            : Infinity;
          if (oneLine <= room || twoLine <= room)
            edgeLabels.push({
              key: `${e.from}-${e.to}-${i}`,
              ids: [e.from, e.to],
              opacity,
              at: spot.at,
              width: oneLine <= room ? oneLine : twoLine,
              lines: oneLine <= room ? [e.label] : halves!,
              tone: e.tone,
            });
        }

        return (
          <g
            key={`${e.from}-${e.to}-${i}`}
            {...visibility([e.from, e.to], opacity, false)}
          >
            <path
              d={pathData(points)}
              fill="none"
              strokeWidth={layer !== "all" && opacity === 1 ? 2 : 1.4}
              strokeDasharray={e.dashed ? "7 5" : undefined}
              strokeLinejoin="round"
              markerEnd={`url(#${markerId})`}
              style={{ stroke: toneColor(e.tone) }}
            />
          </g>
        );
      })}

      {model.nodes.map((node) => {
        const n = resolveBox(node, patches, closed);
        const inDefectOverlay = layer === "defects" && n.openDefects.length > 0;
        const failing = !!highlight?.failing.has(n.id);
        const tone = failing || inDefectOverlay ? "danger" : KIND_TONE[n.kind];
        const selected = selectedId === n.id;
        const hop = highlight?.order.get(n.id);
        return (
          <g
            key={n.id}
            {...visibility([n.id], boxOpacity(n), true)}
            className={selectHandler(n.id) ? "group" : undefined}
            {...selectable(n.label, selectHandler(n.id))}
          >
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx={0}
              strokeWidth={selected ? 2.4 : inDefectOverlay ? 1.6 : 1}
              strokeDasharray={inDefectOverlay && !selected ? "5 4" : undefined}
              className={cn(
                "transition-[fill] duration-150",
                selected ? "fill-gl-surface-2" : "fill-gl-surface",
                selectHandler(n.id) &&
                  !selected &&
                  "group-hover:fill-gl-surface-2",
              )}
              style={{ stroke: selected ? SELECTED : toneColor(tone) }}
            />
            {(() => {
              const sub = n.sub ? wrapText(n.sub, n.w - 24, 11, "mono") : null;
              const twoLines = (sub?.lines.length ?? 0) > 1;
              const labelY = !sub
                ? n.y + n.h / 2 + 4.5
                : twoLines
                  ? n.y + 19
                  : n.y + 24;
              return (
                <>
                  <text
                    x={n.x + 13}
                    y={labelY}
                    fontSize={13.5}
                    fontWeight={600}
                    letterSpacing={-0.1}
                    className="fill-gl-text"
                  >
                    {n.label}
                  </text>
                  {sub?.lines.map((line, i) => (
                    <text
                      key={i}
                      x={n.x + 13}
                      y={twoLines ? n.y + 34 + i * 13 : n.y + 41}
                      fontSize={11}
                      className="fill-gl-text-muted font-mono"
                      // Only squeezes when even two lines cannot hold it.
                      {...(!sub.fits && textWidth(line, 11, "mono") > n.w - 24
                        ? {
                            textLength: n.w - 24,
                            lengthAdjust: "spacingAndGlyphs",
                          }
                        : {})}
                    >
                      {line}
                    </text>
                  ))}
                </>
              );
            })()}
            {!highlight && n.openDefects.length > 0 && (
              <DefectMarks
                x={n.x + n.w - 8}
                y={n.y}
                ids={n.openDefects}
                emphasised={layer === "defects"}
                tag
              />
            )}
            {hop !== undefined && (
              <HopBadge
                x={n.x + n.w - 17}
                y={n.y + 17}
                number={hop}
                failing={failing}
              />
            )}
          </g>
        );
      })}

      {edgeLabels.map((label) => {
        const two = label.lines.length > 1;
        return (
          <g key={label.key} {...visibility(label.ids, label.opacity, false)}>
            <rect
              x={label.at.x - label.width / 2}
              y={label.at.y - (two ? 14 : 9)}
              width={label.width}
              height={two ? 27 : 17}
              className="fill-gl-bg"
            />
            {label.lines.map((line, i) => (
              <text
                key={i}
                x={label.at.x}
                y={label.at.y + (two ? -2.5 + i * 11 : 3.5)}
                fontSize={two ? 10 : 11}
                textAnchor="middle"
                className="font-mono"
                style={{ fill: toneColor(label.tone) }}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
