import { useId } from "react";
import {
  anchor,
  labelPosition,
  orthogonalRoute,
  pathData,
} from "@/lib/architecture/geometry";
import { edgeKey, type JourneyHighlight } from "@/lib/architecture/journeys";
import {
  boxIndex,
  closedDefects,
  patchesAt,
  resolveBox,
  resolveEdge,
  type ResolvedBox,
} from "@/lib/architecture/state";
import { KIND_TONE, toneColor } from "@/lib/architecture/tone";
import type {
  ArchGroup,
  ArchNode,
  ArchitectureModel,
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
  model: ArchitectureModel;
  phase: number;
  /** Overlay key. Ignored while tracing a journey. */
  layer?: string;
  selectedId?: string | null;
  /** Trace a journey instead of applying an overlay. */
  highlight?: JourneyHighlight | null;
  onSelect?: (id: string) => void;
}

const SELECTED = "var(--gl-primary)";

/** The architecture map at a given phase, filtered by an overlay or a journey. */
export function ArchitectureDiagram({
  model,
  phase,
  layer = "all",
  selectedId = null,
  highlight = null,
  onSelect,
}: ArchitectureDiagramProps) {
  const markerId = markerIdFrom(useId());
  const closed = closedDefects(model, phase);
  const patches = patchesAt(model, phase);
  const boxes = boxIndex(model);
  const clickable = !highlight && onSelect;

  const boxOpacity = (box: ResolvedBox<ArchGroup | ArchNode>) => {
    if (highlight) return highlight.lit.has(box.id) ? 1 : 0.32;
    if (layer === "all") return box.dim ? 0.42 : 1;
    if (layer === "defects") return box.openDefects.length ? 1 : 0.16;
    return box.layers?.includes(layer) ? 1 : 0.16;
  };

  return (
    <svg
      className="block h-auto w-full min-w-[1240px]"
      viewBox={`0 0 ${model.viewBox.width} ${model.viewBox.height}`}
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
            opacity={boxOpacity(g)}
            {...selectable(
              g.label,
              clickable ? () => onSelect(g.id) : undefined,
            )}
          >
            <rect
              x={g.x}
              y={g.y}
              width={g.w}
              height={g.h}
              rx={12}
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
        const labelAt = e.label ? labelPosition(points) : null;
        const labelWidth = (e.label?.length ?? 0) * 5.6 + 12;

        return (
          <g key={`${e.from}-${e.to}-${i}`} opacity={opacity}>
            <path
              d={pathData(points)}
              fill="none"
              strokeWidth={layer !== "all" && opacity === 1 ? 2 : 1.4}
              strokeDasharray={e.dashed ? "7 5" : undefined}
              strokeLinejoin="round"
              markerEnd={`url(#${markerId})`}
              style={{ stroke: toneColor(e.tone) }}
            />
            {labelAt && (
              <>
                <rect
                  x={labelAt.x - labelWidth / 2}
                  y={labelAt.y - 9}
                  width={labelWidth}
                  height={17}
                  rx={4}
                  className="fill-gl-bg"
                />
                <text
                  x={labelAt.x}
                  y={labelAt.y + 3.5}
                  fontSize={11}
                  textAnchor="middle"
                  className="font-mono"
                  style={{ fill: toneColor(e.tone) }}
                >
                  {e.label}
                </text>
              </>
            )}
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
            opacity={boxOpacity(n)}
            className={clickable ? "group" : undefined}
            {...selectable(
              n.label,
              clickable ? () => onSelect(n.id) : undefined,
            )}
          >
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx={8}
              strokeWidth={selected ? 2.4 : inDefectOverlay ? 1.6 : 1}
              strokeDasharray={inDefectOverlay && !selected ? "5 4" : undefined}
              className={cn(
                "transition-[fill] duration-150",
                selected ? "fill-gl-surface-2" : "fill-gl-surface",
                clickable && !selected && "group-hover:fill-gl-surface-2",
              )}
              style={{ stroke: selected ? SELECTED : toneColor(tone) }}
            />
            <rect
              x={n.x}
              y={n.y}
              width={3}
              height={n.h}
              rx={1.5}
              opacity={inDefectOverlay ? 1 : 0.9}
              style={{ fill: toneColor(tone) }}
            />
            <text
              x={n.x + 15}
              y={n.y + (n.sub ? 24 : n.h / 2 + 4.5)}
              fontSize={13.5}
              fontWeight={600}
              letterSpacing={-0.1}
              className="fill-gl-text"
            >
              {n.label}
            </text>
            {n.sub && (
              <text
                x={n.x + 15}
                y={n.y + 41}
                fontSize={11.5}
                className="fill-gl-text-muted font-mono"
              >
                {n.sub}
              </text>
            )}
            {!highlight && n.openDefects.length > 0 && (
              <DefectMarks
                x={n.x + n.w - 10}
                y={n.y + 18}
                ids={n.openDefects}
                emphasised={layer === "defects"}
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
    </svg>
  );
}
