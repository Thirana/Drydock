"use client";

import { useRef, useState, type ReactNode } from "react";
import { useSharedPhase } from "@/hooks/use-shared-phase";
import { ToggleChip } from "@/components/ui/controls";

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
  const [phase, setPhase] = useSharedPhase(
    model.name,
    model.phases.at(-1)?.number ?? 0,
  );
  const [layer, setLayer] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const panel = useRef<HTMLElement>(null);
  const select = (id: string | null) => {
    setSelected(id);
    // The sheet opens under the drawing; bring it up to meet the reader.
    if (id)
      requestAnimationFrame(() =>
        panel.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
      );
  };

  const phaseName = model.phases.find((p) => p.number === phase)?.name;
  const overlayName = model.overlays.find((o) => o.key === layer)?.label;

  return (
    <div className="not-prose space-y-8">
      <PhaseRail model={model} phase={phase} onChange={setPhase} />

      <div className="space-y-4">
        <div
          role="group"
          aria-label="Overlay"
          className="flex flex-wrap items-center gap-2"
        >
          <span className="dd-label mr-1 w-full sm:w-auto">Overlay</span>
          {model.overlays.map((overlay) => (
            <ToggleChip
              key={overlay.key}
              active={layer === overlay.key}
              onClick={() => setLayer(overlay.key)}
            >
              {overlay.label}
            </ToggleChip>
          ))}
        </div>

        {invite && (
          <p className="text-ink-muted text-[16px] leading-[1.55]">{invite}</p>
        )}
      </div>

      <DiagramFrame
        title="Architecture map"
        meta={`Phase ${phase} · ${phaseName} · ${overlayName}`}
      >
        <ArchitectureDiagram
          model={model}
          phase={phase}
          layer={layer}
          selectedId={selected}
          onSelect={select}
        />
      </DiagramFrame>

      <section
        ref={panel}
        aria-live="polite"
        className="border-rule min-h-[200px] scroll-mt-24 border-t"
      >
        {selected ? (
          <ComponentPanel
            model={model}
            id={selected}
            defectsHref={defectsHref}
            onBack={() => select(null)}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2 pt-4 pb-2">
              {overviewTitle && (
                <h3 className="dd-head text-ink text-[24px]">
                  {overviewTitle}
                </h3>
              )}
              <span className="text-ink-muted text-[15px]">
                Click any box to open it.
              </span>
            </div>
            <div className="[&_h4]:text-ink [&_p]:text-ink-body [&_h4]:mt-5 [&_h4]:text-[17px] [&_h4]:font-bold [&_p]:mt-1 [&_p]:max-w-[64ch] [&_p]:text-[16.5px] [&_p]:leading-[1.55]">
              {children}
            </div>
          </>
        )}
      </section>

      <div className="border-rule border-t pt-8">
        <PhaseCard model={model} phase={phase} defectsHref={defectsHref} />
      </div>
    </div>
  );
}
