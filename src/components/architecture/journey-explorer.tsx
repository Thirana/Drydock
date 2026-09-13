"use client";

import { useState } from "react";
import { ToggleChip } from "@/components/ui/controls";
import {
  IconArrowRight,
  IconCheck,
  IconRoute,
  IconX,
} from "@/components/ui/icons";
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

const EYEBROW =
  "text-gl-text-faint text-[10px] font-bold tracking-[0.12em] uppercase";

export function JourneyExplorer({
  model,
  defectsHref,
}: {
  model: ArchitectureModel;
  defectsHref: string;
}) {
  const [phase, setPhase] = useState(0);
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
    <div className="not-prose space-y-4">
      <PhaseRail model={model} phase={phase} onChange={setPhase} />

      <div
        role="group"
        aria-label="Journey"
        className="flex flex-wrap items-center gap-2 pt-2"
      >
        <span className={cn(EYEBROW, "mr-1")}>Journey</span>
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
                  "ml-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[10.5px] leading-none font-semibold",
                  failures
                    ? "bg-gl-danger-soft text-gl-danger"
                    : "bg-gl-success-soft text-gl-success",
                )}
              >
                {failures ? (
                  <>
                    {failures}
                    <IconX size={8} />
                  </>
                ) : (
                  <IconCheck size={9} />
                )}
              </span>
            </ToggleChip>
          );
        })}
      </div>

      <p className="text-gl-text-muted flex items-start gap-2 text-[13.5px] leading-[1.55]">
        <IconArrowRight size={12} className="text-gl-primary mt-[5px]" />
        {journey
          ? "Numbers follow the hops below. Hover a hop to pick out its box."
          : "Pick a phase above, then a journey to trace it on the map at that point."}
      </p>

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
          aria-live="polite"
          className="border-gl-border bg-gl-surface shadow-gl overflow-hidden rounded-xl border"
        >
          <div className="border-gl-border border-b px-5 py-4 sm:px-6">
            <p className={EYEBROW}>Journey · Phase {phase}</p>
            <h3 className="text-gl-text mt-1 text-[18px] leading-snug font-bold tracking-[-0.018em]">
              {journey.title}
            </h3>
            <p className="text-gl-text-muted mt-1 font-mono text-[12px]">
              {switched && journey.summaryAfter
                ? journey.summaryAfter
                : journey.summary}
            </p>
            {switched && journey.noteAfter && (
              <p className="border-gl-primary text-gl-text-muted mt-3 border-l-2 pl-3 text-[13px] leading-[1.6]">
                {journey.noteAfter}
              </p>
            )}
          </div>
          <ol>
            {visibleHops(journey, closed).map((hop, i) => {
              const number = hop.at ? order.get(hop.at) : undefined;
              return (
                <li
                  key={i}
                  onMouseEnter={hop.at ? () => setHoverId(hop.at!) : undefined}
                  onMouseLeave={hop.at ? () => setHoverId(null) : undefined}
                  className={cn(
                    "border-gl-border grid gap-2 border-b px-5 py-3.5 transition-colors last:border-b-0 sm:grid-cols-[220px_1fr] sm:gap-5 sm:px-6",
                    hop.at && "hover:bg-gl-surface-2",
                    hop.fails && "bg-gl-danger-soft/40",
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "inline-flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-semibold",
                        number === undefined
                          ? "border-gl-border text-gl-text-faint"
                          : hop.fails
                            ? "border-gl-danger/50 text-gl-danger"
                            : "border-gl-primary/40 text-gl-primary",
                      )}
                    >
                      {number ?? "·"}
                    </span>
                    <span
                      className={cn(
                        "pt-[3px] font-mono text-[12px] font-medium",
                        hop.fails ? "text-gl-danger" : "text-gl-text",
                      )}
                    >
                      {hop.where}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gl-text text-[14px] leading-[1.55]">
                      {hop.what}
                    </p>
                    <p className="text-gl-text-muted mt-1 text-[13px] leading-[1.55]">
                      {hop.why}
                    </p>
                    {(hop.fails || hop.fixedBy) && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {hop.fails && (
                          <span className="bg-gl-danger-soft text-gl-danger rounded-full px-2 py-0.5 text-[10.5px] font-bold tracking-[0.08em] uppercase">
                            Fails here
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
        <div className="border-gl-border bg-gl-surface shadow-gl flex flex-col items-center gap-2 rounded-xl border px-6 py-12 text-center">
          <IconRoute size={32} className="text-gl-text-faint" />
          <p className="text-gl-text mt-1 text-[17px] font-bold tracking-[-0.015em]">
            No journey selected
          </p>
          <p className="text-gl-text-muted max-w-[360px] text-[14px] leading-relaxed">
            Pick a journey above to trace it hop by hop on the map, at the phase
            you’ve selected.
          </p>
        </div>
      )}
    </div>
  );
}
