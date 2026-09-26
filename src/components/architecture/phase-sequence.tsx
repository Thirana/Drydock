import type { ArchitectureModel } from "@/lib/architecture/types";

/** The remediation sequence as numbered moves, each with why it sits where it does. */
export function PhaseSequence({ model }: { model: ArchitectureModel }) {
  const steps = model.phases.filter((p) => p.number > 0);
  return (
    <ol className="not-prose my-8 max-w-[760px]">
      {steps.map((p) => {
        const closes = model.defects.filter((d) => d.phase === p.number);
        return (
          <li
            key={p.number}
            className="border-rule grid grid-cols-[40px_minmax(0,1fr)] border-t py-5"
          >
            <span className="text-ink-faint font-mono text-[18px] leading-[1.35] font-bold">
              {p.number}.
            </span>
            <div>
              <h3 className="dd-head text-ink text-[20px]">
                {p.name}
                <span className="text-ink-muted ml-3 font-mono text-[14px] font-normal tracking-normal">
                  {closes.map((d) => d.id).join(" ")}
                </span>
              </h3>
              <p className="text-ink-body mt-1.5 text-[17px] leading-[1.6] text-pretty">
                {p.rationale}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
