import type { ArchitectureModel } from "@/lib/architecture/types";
import { cn } from "@/lib/utils";

/** Step through the remediation sequence. Shared by the map and journeys. */
export function PhaseRail({
  model,
  phase,
  onChange,
}: {
  model: ArchitectureModel;
  phase: number;
  onChange: (phase: number) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Remediation phase"
      className="no-scrollbar overflow-x-auto"
    >
      <div className="border-gl-border bg-gl-bg-subtle flex min-w-max gap-1 rounded-[12px] border p-1">
        {model.phases.map((p) => {
          const active = p.number === phase;
          const closes = model.defects.filter(
            (d) => d.phase === p.number,
          ).length;
          return (
            <button
              key={p.number}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(p.number)}
              className={cn(
                "flex min-w-[132px] flex-1 flex-col items-start gap-1 rounded-[9px] border px-3 py-2.5 text-left transition-colors duration-[120ms]",
                active
                  ? "border-gl-border bg-gl-surface shadow-gl"
                  : "hover:bg-gl-surface/60 border-transparent",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mb-1 h-1 w-full rounded-full transition-colors duration-300",
                  p.number <= phase ? "bg-gl-primary" : "bg-gl-border",
                )}
              />
              <span
                className={cn(
                  "font-mono text-[10px] font-semibold tracking-[0.12em] uppercase",
                  active ? "text-gl-primary" : "text-gl-text-faint",
                )}
              >
                Phase {p.number}
              </span>
              <span
                className={cn(
                  "text-[13px] font-semibold",
                  active ? "text-gl-text" : "text-gl-text-muted",
                )}
              >
                {p.name}
              </span>
              <span className="text-gl-text-faint font-mono text-[11px]">
                {p.number === 0
                  ? `${model.defects.length} open`
                  : `+${closes} closed`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
