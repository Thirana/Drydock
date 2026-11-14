"use client";

import { useMemo } from "react";
import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram";
import { DiagramLegend } from "@/components/architecture/diagram-frame";
import { IconCheck } from "@/components/ui/icons";
import { useHarbourState } from "@/hooks/use-harbour-state";
import { edgeKey } from "@/lib/architecture/journeys";
import type { MapModel, Rect } from "@/lib/architecture/types";
import { cn } from "@/lib/utils";
import { StateSwitch } from "./state-switch";

const NONE: ReadonlySet<string> = new Set();

/**
 * Where a defect sits on the map, as found or with only this defect closed.
 * Everything it touches is lit; the rest of the platform fades back.
 */
export function DefectFigure({
  map,
  id,
  crop,
  boxes,
  before,
  after,
}: {
  map: MapModel;
  id: string;
  crop: Rect;
  /** Boxes the defect sits on, changes, or connects. */
  boxes: string[];
  before: string;
  after: string;
}) {
  const [state, setState] = useHarbourState();
  const fixed = state === "fixed";
  const closed = useMemo(() => (fixed ? new Set([id]) : NONE), [fixed, id]);

  const highlight = useMemo(() => {
    const lit = new Set(boxes);
    const failing = new Set(
      fixed
        ? []
        : [...map.groups, ...map.nodes]
            .filter((b) => b.defects?.includes(id))
            .map((b) => b.id),
    );
    const edges = new Set(
      map.edges
        .filter((e) => lit.has(e.from) && lit.has(e.to))
        .map((e) => edgeKey(e.from, e.to)),
    );
    return { lit, failing, order: new Map<string, number>(), edges };
  }, [boxes, fixed, id, map]);

  return (
    <figure data-pagefind-ignore>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-3">
        <StateSwitch
          value={state}
          onChange={setState}
          fixedLabel={`${id} fixed`}
        />
        <DiagramLegend />
      </div>
      <div className="border-rule bg-ground overflow-x-auto rounded-[2px] border">
        <ArchitectureDiagram
          model={map}
          phase={0}
          closed={closed}
          crop={crop}
          highlight={highlight}
          className="min-w-[720px] lg:min-w-0"
        />
      </div>
      <figcaption
        key={state}
        className="animate-fade-in mt-3 grid max-w-[68ch] grid-cols-[76px_minmax(0,1fr)] items-baseline gap-x-3"
      >
        <span
          className={cn(
            "dd-label inline-flex items-center gap-1.5",
            fixed ? "text-green" : "text-fault",
          )}
        >
          {fixed && <IconCheck size={11} />}
          {fixed ? "Fixed" : "As found"}
        </span>
        <span className="text-ink text-[16px] leading-[1.55]">
          {fixed ? after : before}
        </span>
      </figcaption>
    </figure>
  );
}
