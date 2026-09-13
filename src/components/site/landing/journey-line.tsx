"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { DEFECT_CHIP } from "@/components/architecture/defect-link";
import { SegmentedControl } from "@/components/ui/controls";
import { IconCheck } from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { journeyPath, visibleHops } from "@/lib/architecture/journeys";
import { boxIndex, closedDefects } from "@/lib/architecture/state";
import { KIND_TONE, toneColor } from "@/lib/architecture/tone";
import type { Journey, MapModel } from "@/lib/architecture/types";
import type { FeaturedTrack } from "@/lib/content/featured";
import { cn } from "@/lib/utils";

type State = "found" | "fixed";
type Direction = "right" | "left" | "down";

/** Columns in the snaking layout from `sm` up; below that the route runs straight down. */
const COLUMNS = 3;
/** Time the packet spends at each component. */
const VISIT_MS = 420;

/** Box ids with a failing hop at the given phase, and the defects behind them. */
function failuresAt(map: MapModel, journey: Journey, phase: number) {
  const failing = new Map<string, string[]>();
  for (const hop of visibleHops(journey, closedDefects(map, phase))) {
    if (!hop.fails || !hop.at) continue;
    const ids = failing.get(hop.at) ?? [];
    if (hop.fixedBy && !ids.includes(hop.fixedBy)) ids.push(hop.fixedBy);
    failing.set(hop.at, ids);
  }
  return failing;
}

/** Grid cell for hop `i`: rows alternate direction, so the route snakes. */
function cellOf(i: number) {
  const row = Math.floor(i / COLUMNS);
  const offset = i % COLUMNS;
  return { row, column: row % 2 === 0 ? offset : COLUMNS - 1 - offset };
}

/** Where the connector from hop `i` to hop `i + 1` leaves the box. */
function directionTo(i: number): Direction {
  const from = cellOf(i);
  const to = cellOf(i + 1);
  if (to.row !== from.row) return "down";
  return to.column > from.column ? "right" : "left";
}

const CONNECTOR: Record<Direction, string> = {
  right: "top-1/2 left-full h-0.5 w-10 -translate-y-1/2",
  left: "top-1/2 right-full h-0.5 w-10 -translate-y-1/2",
  down: "top-full left-1/2 h-9 w-0.5 -translate-x-1/2",
};

/**
 * One packet journey snaking through its components. A packet visits each box
 * in turn; failing hops sit in rust with their defects, and the fixed state
 * redraws the route with the repaired hops in sage.
 */
export function JourneyLine({
  map,
  journey: featured,
}: {
  map: MapModel;
  journey: NonNullable<FeaturedTrack["journey"]>;
}) {
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState<State>("found");
  /** Index of the component the packet has reached; -1 before it sets off. */
  const [at, setAt] = useState(-1);
  const { journey, fixedAt } = featured;
  const fixed = state === "fixed";
  const phase = fixed ? fixedAt : 0;

  const boxes = useMemo(() => boxIndex(map), [map]);
  const failedAsFound = useMemo(
    () => failuresAt(map, journey, 0),
    [map, journey],
  );
  const failing = failuresAt(map, journey, phase);
  const stops = journeyPath(journey, closedDefects(map, phase)).flatMap(
    (id) => {
      const box = boxes.get(id);
      if (!box) return [];
      const tone = "kind" in box ? KIND_TONE[box.kind] : box.tone;
      return [{ id, label: box.label, sub: box.sub, tone }];
    },
  );
  const n = stops.length;
  const weak = failing.size;

  // The packet's run: one component at a time, once per switch.
  useEffect(() => {
    if (at >= n - 1) return;
    const timer = setTimeout(
      () => setAt(reduced ? n - 1 : at + 1),
      at < 0 ? 250 : VISIT_MS,
    );
    return () => clearTimeout(timer);
  }, [at, n, reduced]);

  const choose = (value: State) => {
    setState(value);
    setAt(-1);
  };

  if (n < 2) return null;

  return (
    <>
      <div className="border-gl-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
        <SegmentedControl<State>
          label="Journey state"
          value={state}
          onChange={choose}
          options={[
            { value: "found", label: "As found" },
            { value: "fixed", label: `After phase ${fixedAt}` },
          ]}
        />
        <span className="text-gl-text-muted min-w-0 truncate text-[12.5px]">
          {journey.title}
        </span>
      </div>

      <div className="bg-gl-bg flex flex-1 flex-col justify-center gap-6 px-5 py-7 sm:px-6">
        <ol
          aria-label={`${journey.title}, ${fixed ? `after phase ${fixedAt}` : "as found"}`}
          className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-3"
        >
          {stops.map((stop, i) => {
            const defects = failing.get(stop.id);
            const repaired = fixed && !defects && failedAsFound.has(stop.id);
            const { row, column } = cellOf(i);
            const isLast = i === n - 1;
            const next = stops[i + 1];
            const reachedNext = at > i;
            const here = at === i;
            const connectorTone = !reachedNext
              ? "bg-gl-border-input"
              : next && failing.has(next.id)
                ? "bg-gl-danger/70"
                : fixed
                  ? "bg-gl-success/70"
                  : "bg-gl-primary/70";
            return (
              <li
                key={stop.id}
                className="relative min-w-0 sm:[grid-column:var(--column)] sm:[grid-row:var(--row)]"
                style={
                  {
                    "--column": column + 1,
                    "--row": row + 1,
                  } as CSSProperties
                }
              >
                {!isLast && (
                  <>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute transition-colors duration-300 sm:hidden",
                        CONNECTOR.down,
                        connectorTone,
                      )}
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute hidden transition-colors duration-300 sm:block",
                        CONNECTOR[directionTo(i)],
                        connectorTone,
                      )}
                    />
                  </>
                )}
                <div
                  className={cn(
                    "flex h-full flex-col rounded-sm border p-3 text-left transition-[border-color,box-shadow,background-color] duration-300",
                    defects
                      ? "border-gl-danger bg-gl-danger-soft border-dashed"
                      : repaired
                        ? "border-gl-success bg-gl-surface animate-phase-swap"
                        : "bg-gl-surface",
                    here &&
                      (defects
                        ? "ring-gl-danger/50 ring-offset-gl-bg ring-2 ring-offset-2"
                        : "ring-gl-primary/50 ring-offset-gl-bg ring-2 ring-offset-2"),
                  )}
                  style={
                    defects || repaired
                      ? undefined
                      : { borderColor: toneColor(stop.tone) }
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-gl-text text-[13.5px] leading-snug font-semibold">
                      {stop.label}
                    </span>
                    <span className="text-gl-text-muted shrink-0 font-mono text-[11px] tabular-nums">
                      {i + 1}
                    </span>
                  </div>
                  {stop.sub && (
                    <span className="text-gl-text-muted mt-1 font-mono text-[11px] leading-[1.45]">
                      {stop.sub}
                    </span>
                  )}
                  {defects && defects.length > 0 && (
                    <span className="mt-auto flex flex-wrap gap-1 pt-2.5">
                      {defects.map((d) => (
                        <span key={d} className={DEFECT_CHIP}>
                          {d}
                        </span>
                      ))}
                    </span>
                  )}
                  {repaired && (
                    <span className="text-gl-success mt-auto inline-flex items-center gap-1 pt-2.5 font-mono text-[11px] font-semibold">
                      <IconCheck size={11} />
                      repaired
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <p
          aria-live="polite"
          className={cn(
            "inline-flex items-center justify-center gap-2 self-center rounded-full border px-3 py-1 font-mono text-[11.5px] font-semibold",
            weak
              ? "border-gl-danger/30 bg-gl-danger-soft text-gl-danger"
              : "border-gl-success/30 bg-gl-success-soft text-gl-success",
          )}
        >
          {weak ? (
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-current"
            />
          ) : (
            <IconCheck size={11} />
          )}
          {weak
            ? `${weak} weak hop${weak === 1 ? "" : "s"} on the way`
            : "every hop passes"}
        </p>
      </div>
    </>
  );
}
