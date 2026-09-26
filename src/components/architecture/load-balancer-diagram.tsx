import { useId } from "react";
import { pathData } from "@/lib/architecture/geometry";
import { wrapText } from "@/lib/architecture/text-fit";
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
              rx={0}
              strokeWidth={selected ? 2 : 1}
              strokeDasharray={hasDefects && !selected ? "5 4" : undefined}
              className={cn(
                "transition-[fill] duration-150",
                selected
                  ? "fill-gl-surface-2"
                  : "fill-gl-surface group-hover:fill-gl-surface-2",
              )}
              style={{
                stroke: selected ? "var(--dd-sel)" : toneColor(box.tone),
              }}
            />
            {(() => {
              // Label and sub-lines, centred as one block so short boxes fit too.
              const sub = box.sub
                ? wrapText(box.sub, box.w - 26, 11, "mono")
                : null;
              const lines = sub?.lines ?? [];
              const block = 13 + (lines.length ? 5 + lines.length * 14 : 0);
              const top = box.y + Math.max(8, (box.h - block) / 2);
              return (
                <>
                  <text
                    x={box.x + 14}
                    y={top + 11}
                    fontSize={13}
                    fontWeight={600}
                    className="fill-gl-text"
                  >
                    {box.label}
                  </text>
                  {lines.map((line, i) => (
                    <text
                      key={i}
                      x={box.x + 14}
                      y={top + 29 + i * 14}
                      fontSize={11}
                      className="fill-gl-text-muted font-mono"
                    >
                      {line}
                    </text>
                  ))}
                </>
              );
            })()}
            {hasDefects && (
              <DefectMarks
                x={box.x + box.w - 8}
                y={box.y}
                ids={box.defects!}
                tag
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
