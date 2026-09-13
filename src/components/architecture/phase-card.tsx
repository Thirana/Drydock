import type { ArchitectureModel, RiskLevel } from "@/lib/architecture/types";
import { cn } from "@/lib/utils";
import { DefectLink } from "./defect-link";

const RISK_STYLE: Record<RiskLevel, string> = {
  high: "bg-gl-danger-soft text-gl-danger",
  medium: "bg-gl-warning-soft text-gl-warning",
  low: "bg-gl-success-soft text-gl-success",
};

const EYEBROW =
  "text-gl-text-faint text-[10px] font-bold tracking-[0.12em] uppercase";

export function PhaseCard({
  model,
  phase,
  defectsHref,
}: {
  model: ArchitectureModel;
  phase: number;
  defectsHref: string;
}) {
  const p = model.phases.find((x) => x.number === phase);
  if (!p) return null;
  const closes = model.defects.filter((d) => d.phase === p.number);
  const details = [
    ["Changes", p.changes],
    ["Prerequisites", p.prerequisites],
    ["Risk", p.risk],
    ["Verify", p.verify],
  ] as const;

  return (
    <section
      aria-live="polite"
      className="border-gl-border bg-gl-surface shadow-gl rounded-xl border p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={EYEBROW}>
            Phase {p.number} · {p.name}
          </p>
          <p className="text-gl-text mt-2 text-[17px] leading-snug font-bold tracking-[-0.015em] text-balance">
            {p.goal}
          </p>
        </div>
        {p.riskLevel && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10.5px] leading-none font-bold tracking-[0.08em] whitespace-nowrap uppercase",
              RISK_STYLE[p.riskLevel],
            )}
          >
            {p.riskLevel} risk
          </span>
        )}
      </div>

      <dl className="mt-5 grid gap-3 md:grid-cols-2">
        {details.map(([label, value]) => (
          <div
            key={label}
            className="border-gl-border bg-gl-surface-2 rounded-xl border p-4"
          >
            <dt className={EYEBROW}>{label}</dt>
            <dd className="text-gl-text-muted mt-1.5 text-[13.5px] leading-[1.6]">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {closes.length > 0 && (
        <div className="border-gl-border mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
          <span className={cn(EYEBROW, "mr-1")}>Closes</span>
          {closes.map((d) => (
            <DefectLink key={d.id} id={d.id} defectsHref={defectsHref} />
          ))}
        </div>
      )}
    </section>
  );
}
