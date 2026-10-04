"use client";

import { useState } from "react";
import { useSharedPhase } from "@/hooks/use-shared-phase";
import { ToggleChip } from "@/components/ui/controls";
import { IconCheck, IconRoute, IconX } from "@/components/ui/icons";
import {
  EMPTY_HIGHLIGHT,
  failingHopCount,
  hasSwitched,
  journeyHighlight,
  journeyPath,
  visibleHops,
} from "@/lib/architecture/journeys";
import { closedDefects, defectIndex } from "@/lib/architecture/state";
import type { ArchitectureModel } from "@/lib/architecture/types";
import { cn } from "@/lib/utils";
import { ArchitectureDiagram } from "./architecture-diagram";
import { DefectLink } from "./defect-link";
import { DiagramFrame } from "./diagram-frame";
import { PhaseRail } from "./phase-rail";

export function JourneyExplorer({
  model,
  defectsHref,
}: {
  model: ArchitectureModel;
  defectsHref: string;
}) {
  const [phase, setPhase] = useSharedPhase(
    model.name,
    model.phases.at(-1)?.number ?? 0,
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const closed = closedDefects(model, phase);
  const defects = defectIndex(model);
  const journey = selected === null ? null : model.journeys[selected];
  const order = new Map(
    journey ? journeyPath(journey, closed).map((id, i) => [id, i + 1]) : [],
  );
  const switched = journey ? hasSwitched(journey, closed) : false;

  return (
    <div className="not-prose space-y-10">
      <PhaseRail model={model} phase={phase} onChange={setPhase} />

      <div className="space-y-4">
        <div
          role="group"
          aria-label="Journey"
          className="flex flex-wrap items-center gap-2"
        >
          <span className="dd-label mr-1 w-full sm:w-auto">Journey</span>
          {model.journeys.map((j, i) => {
            const failures = failingHopCount(j, closed);
            return (
              <ToggleChip
                key={j.title}
                active={selected === i}
                onClick={() => {
                  setSelected(selected === i ? null : i);
                  setHoverId(null);
                }}
              >
                {j.shortTitle}
                <span
                  aria-label={
                    failures ? `${failures} failing hops` : "all hops succeed"
                  }
                  className={cn(
                    "inline-flex items-center gap-0.5 font-mono text-[13.5px] font-bold",
                    failures ? "text-fault" : "text-ink-faint",
                  )}
                >
                  {failures ? (
                    <>
                      {failures}
                      <IconX size={8} />
                    </>
                  ) : (
                    <IconCheck size={10} />
                  )}
                </span>
              </ToggleChip>
            );
          })}
        </div>

        <p className="text-ink-muted text-[16px] leading-[1.55]">
          {journey
            ? "Numbers follow the hops below. Hover a hop to pick out its box."
            : "Pick a phase above, then a journey to trace it on the map at that point."}
        </p>
      </div>

      <DiagramFrame
        title="Packet journey"
        meta={
          journey ? `${journey.shortTitle} · Phase ${phase}` : `Phase ${phase}`
        }
      >
        <ArchitectureDiagram
          model={model}
          phase={phase}
          selectedId={hoverId}
          highlight={
            journey ? journeyHighlight(model, journey, closed) : EMPTY_HIGHLIGHT
          }
        />
      </DiagramFrame>

      {journey ? (
        <section
          key={`${selected}-${phase}`}
          aria-live="polite"
          className="animate-fade-in border-rule border-t"
        >
          <div className="pt-4 pb-5">
            <h3 className="dd-head text-ink text-[26px]">{journey.title}</h3>
            <p className="text-ink-muted mt-1.5 text-[15.5px]">
              After move {phase}:{" "}
              {switched && journey.summaryAfter
                ? journey.summaryAfter
                : journey.summary}
            </p>
            {switched && journey.noteAfter && (
              <div className="mt-4 grid max-w-[68ch] grid-cols-[28px_minmax(0,1fr)] gap-x-2">
                <span
                  aria-hidden="true"
                  className="text-accent pt-[2px] font-mono text-[15px] font-bold"
                >
                  !?
                </span>
                <p className="text-ink-body text-[16px] leading-[1.6]">
                  {journey.noteAfter}
                </p>
              </div>
            )}
          </div>
          <ol className="border-rule border-t">
            {visibleHops(journey, closed).map((hop, i) => {
              const number = hop.at ? order.get(hop.at) : undefined;
              return (
                <li
                  key={i}
                  onMouseEnter={hop.at ? () => setHoverId(hop.at!) : undefined}
                  onMouseLeave={hop.at ? () => setHoverId(null) : undefined}
                  className={cn(
                    "border-rule grid gap-2 border-b py-4 transition-colors sm:grid-cols-[260px_minmax(0,1fr)] sm:gap-6",
                    hop.at && "hover:bg-sunk",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "w-7 shrink-0 font-mono text-[16px] font-bold",
                        number === undefined
                          ? "text-ink-faint"
                          : hop.fails
                            ? "text-fault"
                            : "text-ink",
                      )}
                    >
                      {number !== undefined ? `${number}.` : "·"}
                    </span>
                    <span
                      className={cn(
                        "pt-[2px] font-mono text-[14.5px] font-semibold",
                        hop.fails ? "text-fault" : "text-ink",
                      )}
                    >
                      {hop.where}
                    </span>
                  </div>
                  <div className="min-w-0 sm:pt-[2px]">
                    <p className="text-ink text-[17px] leading-[1.5]">
                      {hop.what}
                    </p>
                    <p className="text-ink-body mt-1 text-[16px] leading-[1.55]">
                      {hop.why}
                    </p>
                    {(hop.fails || hop.fixedBy) && (
                      <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        {hop.fails && (
                          <span className="text-fault inline-flex items-center gap-1.5 text-[15px] font-bold">
                            <IconX size={9} /> Fails here
                          </span>
                        )}
                        {hop.fixedBy && (
                          <DefectLink
                            id={hop.fixedBy}
                            defectsHref={defectsHref}
                          >
                            {hop.fixedBy} · phase{" "}
                            {defects.get(hop.fixedBy)?.phase}
                          </DefectLink>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ) : (
        <div className="border-rule flex flex-col gap-2 border-t py-10">
          <IconRoute size={28} className="text-ink-muted" />
          <p className="dd-head text-ink mt-2 text-[22px]">
            No journey selected
          </p>
          <p className="text-ink-body max-w-[48ch] text-[16px] leading-relaxed">
            Pick a journey above to trace it hop by hop on the map, at the phase
            you have selected.
          </p>
        </div>
      )}
    </div>
  );
}
