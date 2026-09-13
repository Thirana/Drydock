import type { ArchitectureModel } from "@/lib/architecture/types";

/** The remediation sequence as step cards, straight from the phase data. */
export function PhaseSequence({ model }: { model: ArchitectureModel }) {
  return (
    <ol className="not-prose my-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {model.phases
        .filter((p) => p.number > 0)
        .map((p) => {
          const closes = model.defects.filter(
            (d) => d.phase === p.number,
          ).length;
          return (
            <li
              key={p.number}
              className="border-gl-border bg-gl-surface shadow-gl flex flex-col gap-3 rounded-2xl border p-6"
            >
              <div className="flex items-start justify-between">
                <span className="bg-gl-primary-soft text-gl-primary inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] leading-none font-semibold tracking-[0.08em] uppercase">
                  Phase {p.number}
                </span>
              </div>
              <h3 className="text-gl-text text-[18px] leading-[1.25] font-bold tracking-[-0.018em]">
                {p.name}
              </h3>
              <p className="text-gl-text-muted flex-1 text-[14px] leading-[1.6] text-pretty">
                {p.rationale}
              </p>
              <p className="text-gl-text-muted font-mono text-[11px]">
                closes {closes} {closes === 1 ? "defect" : "defects"}
              </p>
            </li>
          );
        })}
    </ol>
  );
}
