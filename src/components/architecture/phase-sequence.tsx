import Link from "next/link";
import type { ArchitectureModel } from "@/lib/architecture/types";
import { defectHref } from "@/lib/content/harbour-routes";
import { cn } from "@/lib/utils";

/**
 * The remediation sequence as a route: a stop per phase, why it sits where it
 * does, and the defects it closes, each linked to its own page with what it
 * waits for.
 */
export function PhaseSequence({ model }: { model: ArchitectureModel }) {
  const steps = model.phases.filter((p) => p.number > 0);
  return (
    <ol className="not-prose my-10 max-w-[760px]">
      {steps.map((p, i) => {
        const closes = model.defects.filter((d) => d.phase === p.number);
        const last = i === steps.length - 1;
        return (
          <li
            key={p.number}
            className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-4"
          >
            {!last && (
              <span
                aria-hidden="true"
                className="bg-rule-strong absolute top-8 bottom-1 left-[13.5px] w-px"
              />
            )}
            <span
              aria-hidden="true"
              className="border-ink bg-ground text-ink relative grid size-7 place-items-center rounded-full border font-mono text-[13px] font-bold"
            >
              {p.number}
            </span>
            <div className={cn(!last && "pb-10")}>
              <h3 className="dd-head text-ink pt-px text-[21px]">
                <span className="sr-only">Phase {p.number}: </span>
                {p.name}
              </h3>
              <p className="text-ink-body mt-1.5 text-[17px] leading-[1.6] text-pretty">
                {p.rationale}
              </p>
              <ul className="border-rule mt-4 border-t">
                {closes.map((d) => {
                  const row = (
                    <>
                      <span className="text-fault font-mono text-[14px] font-bold">
                        {d.id}
                      </span>
                      <span className="min-w-0">
                        <span className="text-ink group-hover:text-accent block text-[16px] leading-[1.4] transition-colors">
                          {d.title}
                        </span>
                        <span className="text-ink-muted mt-0.5 block text-[13.5px]">
                          <span
                            className={cn(
                              d.severity === "critical" &&
                                "text-fault font-semibold",
                            )}
                          >
                            {d.severity}
                          </span>
                          {d.blockedBy.length > 0 && (
                            <>
                              {" "}
                              · after{" "}
                              {d.blockedBy.map((id, k) => (
                                <span key={id}>
                                  {k > 0 && ", "}
                                  <span className="font-mono">{id}</span>
                                </span>
                              ))}
                            </>
                          )}
                        </span>
                      </span>
                    </>
                  );
                  const grid =
                    "grid grid-cols-[48px_minmax(0,1fr)] items-baseline gap-x-2 py-2.5";
                  return (
                    <li key={d.id} className="border-rule border-b">
                      <Link
                        href={defectHref(d.id)}
                        className={cn("group", grid)}
                      >
                        {row}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
