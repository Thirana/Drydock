import Link from "next/link";
import type { ArchitectureModel } from "@/lib/architecture/types";
import { defectHref } from "@/lib/content/harbour-routes";
import { DEFECT_CHIP } from "./defect-link";

/**
 * The remediation sequence as a route: a stop per phase, why it sits where it
 * does, and the defects it closes as IDs beside it, each linked to its page
 * and named on hover. The register on the Defects page has them in full.
 */
export function PhaseSequence({ model }: { model: ArchitectureModel }) {
  const steps = model.phases.filter((p) => p.number > 0);
  return (
    <ol className="not-prose border-rule my-10 max-w-[860px] border-t">
      {steps.map((p) => {
        const closes = model.defects.filter((d) => d.phase === p.number);
        return (
          <li
            key={p.number}
            className="border-rule grid grid-cols-[28px_minmax(0,1fr)] gap-x-4 gap-y-3 border-b py-5 sm:grid-cols-[28px_minmax(0,1fr)_168px]"
          >
            <span
              aria-hidden="true"
              className="border-ink bg-ground text-ink grid size-7 place-items-center rounded-full border font-mono text-[13px] font-bold"
            >
              {p.number}
            </span>
            <div className="min-w-0">
              <h3 className="text-ink pt-[2px] text-[19px] leading-[1.35] font-bold">
                <span className="sr-only">Phase {p.number}: </span>
                {p.name}
              </h3>
              <p className="text-ink-body mt-1 text-[16px] leading-[1.55] text-pretty">
                {p.rationale}
              </p>
            </div>
            <ul
              aria-label={`Closes in phase ${p.number}`}
              className="col-start-2 flex flex-wrap content-start gap-x-3 gap-y-1.5 sm:col-start-3 sm:pt-1"
            >
              {closes.map((d) => (
                <li key={d.id}>
                  <Link
                    href={defectHref(d.id)}
                    title={d.title}
                    className={DEFECT_CHIP}
                  >
                    {d.id}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
