"use client";

import { useState, type ReactNode } from "react";
import { ToggleChip } from "@/components/ui/controls";
import { IconArrowRight } from "@/components/ui/icons";
import { toneColor } from "@/lib/architecture/tone";
import type { ArchitectureModel } from "@/lib/architecture/types";
import { ArchitectureDiagram } from "./architecture-diagram";
import { ComponentPanel } from "./component-panel";
import { DiagramFrame } from "./diagram-frame";
import { PhaseCard } from "./phase-card";
import { PhaseRail } from "./phase-rail";

interface MapExplorerProps {
  model: ArchitectureModel;
  defectsHref: string;
  invite?: string;
  overviewTitle?: string;
  /** Shown in the detail panel while nothing is selected. */
  children?: ReactNode;
}

export function MapExplorer({
  model,
  defectsHref,
  invite,
  overviewTitle,
  children,
}: MapExplorerProps) {
  const [phase, setPhase] = useState(0);
  const [layer, setLayer] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const phaseName = model.phases.find((p) => p.number === phase)?.name;
  const overlayName = model.overlays.find((o) => o.key === layer)?.label;

  return (
    <div className="not-prose space-y-4">
      <PhaseRail model={model} phase={phase} onChange={setPhase} />
      <PhaseCard model={model} phase={phase} defectsHref={defectsHref} />

      <div
        role="group"
        aria-label="Overlay"
        className="flex flex-wrap items-center gap-2 pt-2"
      >
        <span className="text-gl-text-faint mr-1 text-[10px] font-bold tracking-[0.12em] uppercase">
          Overlay
        </span>
        {model.overlays.map((overlay) => (
          <ToggleChip
            key={overlay.key}
            active={layer === overlay.key}
            onClick={() => setLayer(overlay.key)}
          >
            {overlay.tone && (
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ background: toneColor(overlay.tone) }}
              />
            )}
            {overlay.label}
          </ToggleChip>
        ))}
      </div>

      {invite && (
        <p className="text-gl-text-muted flex items-start gap-2 text-[13.5px] leading-[1.55]">
          <IconArrowRight size={12} className="text-gl-primary mt-[5px]" />
          {invite}
        </p>
      )}

      <section
        aria-live="polite"
        className="border-gl-border bg-gl-surface shadow-gl min-h-[240px] overflow-hidden rounded-xl border"
      >
        {selected ? (
          <ComponentPanel
            model={model}
            id={selected}
            defectsHref={defectsHref}
            onBack={() => setSelected(null)}
          />
        ) : (
          <>
            <div className="border-gl-border flex flex-wrap items-baseline justify-between gap-2 border-b px-5 py-4 sm:px-6">
              {overviewTitle && (
                <h3 className="text-gl-text text-[18px] leading-snug font-bold tracking-[-0.018em]">
                  {overviewTitle}
                </h3>
              )}
              <span className="text-gl-text-faint font-mono text-[11px]">
                click any box to drill in
              </span>
            </div>
            <div className="[&_h4]:text-gl-text [&_p]:text-gl-text-muted px-5 py-4 sm:px-6 [&_h4]:mt-4 [&_h4]:text-[14px] [&_h4]:font-semibold [&_h4:first-child]:mt-0 [&_p]:mt-1 [&_p]:max-w-[78ch] [&_p]:text-[13.5px] [&_p]:leading-[1.6]">
              {children}
            </div>
          </>
        )}
      </section>

      <DiagramFrame
        title="Architecture map"
        meta={`Phase ${phase} · ${phaseName} · ${overlayName}`}
      >
        <ArchitectureDiagram
          model={model}
          phase={phase}
          layer={layer}
          selectedId={selected}
          onSelect={setSelected}
        />
      </DiagramFrame>
    </div>
  );
}
