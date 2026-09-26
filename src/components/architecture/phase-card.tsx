import type { ArchitectureModel } from "@/lib/architecture/types";
import { DefectLink } from "./defect-link";

/** The move under the marker, written out: goal, then the four things to know. */
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
    [
      "Risk",
      p.riskLevel
        ? `${p.riskLevel[0].toUpperCase()}${p.riskLevel.slice(1)} risk. ${p.risk}`
        : p.risk,
    ],
    ["Verify", p.verify],
  ] as const;

  return (
    <section aria-live="polite" key={p.number} className="animate-fade-in">
      <h3 className="dd-head text-ink text-[24px]">
        <span className="text-accent font-mono">{p.number}.</span>{" "}
        {p.number === 0 ? "As found" : p.name}
      </h3>
      <p className="text-ink-body mt-2 max-w-[62ch] text-[18px] leading-[1.55]">
        {p.goal}
        {closes.length > 0 && (
          <span className="text-ink-muted">
            {" "}
            Closes{" "}
            {closes.map((d, i) => (
              <span key={d.id}>
                {i > 0 && (i === closes.length - 1 ? " and " : ", ")}
                <DefectLink id={d.id} defectsHref={defectsHref} />
              </span>
            ))}
            .
          </span>
        )}
      </p>
      <dl className="mt-5 grid gap-x-10 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label} className="border-rule border-t py-3.5">
            <dt className="dd-label">{label}</dt>
            <dd className="text-ink-body mt-1 text-[16px] leading-[1.55]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
