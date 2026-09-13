import { useId } from "react";
import { pathData } from "@/lib/architecture/geometry";
import { toneColor } from "@/lib/architecture/tone";
import type { LoadBalancerChain, Tone } from "@/lib/architecture/types";
import { cn } from "@/lib/utils";
import { ArrowMarker, DefectMarks, markerIdFrom, selectable } from "./svg";

interface ChainBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  tone: Tone;
  defects?: string[];
}

export function LoadBalancerDiagram({
  chain,
  selectedId,
  onSelect,
}: {
  chain: LoadBalancerChain;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const markerId = markerIdFrom(useId());
  const { grid } = chain;
  const cellX = (column: number) => grid.x + column * grid.columnStep;
  const cellY = (row: number) => grid.y + row * grid.rowStep;

  const boxes: ChainBox[] = [
    ...chain.lanes.flatMap((lane, row) =>
      lane.links.map((link, column) => ({
        ...link,
        x: cellX(column),
        y: cellY(row),
        w: grid.cellWidth,
        h: grid.cellHeight,
        tone: lane.tone,
      })),
    ),
    ...chain.extras,
  ];

  return (
    <svg
      className="block h-auto w-full min-w-[900px]"
      viewBox={`0 0 ${chain.viewBox.width} ${chain.viewBox.height}`}
      aria-label="Load balancer component chain"
    >
      <ArrowMarker id={markerId} />

      {chain.lanes.map((lane, row) => (
        <g key={lane.label}>
          <text
            x={grid.x}
            y={cellY(row) - 26}
            fontSize={12}
            fontWeight={500}
            className="font-mono"
            style={{ fill: toneColor(lane.tone) }}
          >
            {lane.label}
          </text>
          {lane.links.slice(1).map((link, i) => {
            const y = cellY(row) + grid.cellHeight / 2;
            return (
              <path
                key={link.id}
                d={`M${cellX(i) + grid.cellWidth} ${y} L${cellX(i + 1)} ${y}`}
                strokeWidth={1.4}
                opacity={0.75}
                markerEnd={`url(#${markerId})`}
                style={{ stroke: toneColor(lane.tone) }}
              />
            );
          })}
        </g>
      ))}

      {chain.wires.map((wire, i) => (
        <path
          key={i}
          d={pathData(wire.points)}
          strokeWidth={1.4}
          opacity={0.8}
          markerEnd={`url(#${markerId})`}
          style={{ stroke: toneColor(wire.tone) }}
        />
      ))}

      {boxes.map((box) => {
        const selected = box.id === selectedId;
        const hasDefects = !!box.defects?.length;
        return (
          <g
            key={box.id}
            className="group"
            {...selectable(box.label, () => onSelect(box.id))}
          >
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              rx={8}
              strokeWidth={selected ? 2 : 1}
              strokeDasharray={hasDefects && !selected ? "5 4" : undefined}
              className={cn(
                "transition-[fill] duration-150",
                selected
                  ? "fill-gl-surface-2"
                  : "fill-gl-surface group-hover:fill-gl-surface-2",
              )}
              style={{
                stroke: selected ? "var(--gl-primary)" : toneColor(box.tone),
              }}
            />
            <rect
              x={box.x}
              y={box.y}
              width={3}
              height={box.h}
              rx={1.5}
              style={{ fill: toneColor(hasDefects ? "danger" : box.tone) }}
            />
            <text
              x={box.x + 14}
              y={box.y + 27}
              fontSize={13}
              fontWeight={600}
              className="fill-gl-text"
            >
              {box.label}
            </text>
            <text
              x={box.x + 14}
              y={box.y + 45}
              fontSize={11}
              className="fill-gl-text-muted font-mono"
            >
              {box.sub}
            </text>
            {hasDefects && (
              <DefectMarks
                x={box.x + box.w - 10}
                y={box.y + 19}
                ids={box.defects!}
              />
            )}
          </g>
        );
      })}

      {chain.annotations.map((note) =>
        note.lines.map((line, i) => (
          <text
            key={`${note.x}-${note.y}-${i}`}
            x={note.x}
            y={note.y + i * 16}
            fontSize={11}
            className="fill-gl-text-faint font-mono"
          >
            {line}
          </text>
        )),
      )}
    </svg>
  );
}
