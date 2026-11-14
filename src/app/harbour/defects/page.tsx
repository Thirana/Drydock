import type { Metadata } from "next";
import Link from "next/link";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import { PageHeader } from "@/components/harbour/page-header";
import { Pager } from "@/components/harbour/pager";
import { SearchMeta } from "@/components/site/search-meta";
import { IconArrowRight } from "@/components/ui/icons";
import { SEVERITIES } from "@/lib/architecture/state";
import {
  defectHref,
  harbour,
  journeysHref,
  journeysThrough,
  orderedDefects,
} from "@/lib/content/harbour";

const LEAD =
  "Every entry is deliberate and realistic, and each has a page of its own: what it is, what it can cause, how you would find it, and the change that closes it. They are listed in the order they have to be fixed, which is the argument this whole case study is making.";

export const metadata: Metadata = {
  title: `Defects · ${harbour.title}`,
  description: LEAD,
};

/** The register: every defect, grouped by the phase that closes it. */
export default function DefectsPage() {
  const model = harbour.architecture;
  const ordered = orderedDefects();
  const steps = model.phases.filter((p) => p.number > 0);

  return (
    <>
      <div data-pagefind-body>
        <SearchMeta title="Defects" where={`${harbour.title} · Case study`} />
        <PageHeader
          eyebrow="Part 4 of the case study"
          title="Defects"
          lead={<p>{LEAD}</p>}
          aside={
            <dl className="border-ink grid grid-cols-2 border-t-2">
              {SEVERITIES.map((s) => (
                <div key={s} className="border-rule border-b py-3">
                  <dt>
                    <SeverityBadge severity={s} />
                  </dt>
                  <dd className="text-ink mt-0.5 font-mono text-[26px] font-bold">
                    {model.defects.filter((d) => d.severity === s).length}
                  </dd>
                </div>
              ))}
            </dl>
          }
        />

        <div className="mx-auto w-full max-w-[1200px] space-y-14 px-5 pt-14 pb-20 sm:px-8">
          {steps.map((p) => {
            const defects = ordered.filter((d) => d.phase === p.number);
            if (!defects.length) return null;
            return (
              <section key={p.number} aria-labelledby={`phase-${p.number}`}>
                <h2
                  id={`phase-${p.number}`}
                  className="border-ink flex flex-wrap items-baseline gap-x-3 border-b pb-2.5"
                >
                  <span className="text-ink-faint font-mono text-[20px] font-bold">
                    {p.number}.
                  </span>
                  <span className="dd-head text-ink text-[24px]">{p.name}</span>
                  <span className="text-ink-muted ml-auto text-[15px]">
                    closes {defects.length}
                  </span>
                </h2>
                <p className="text-ink-muted mt-3 max-w-[72ch] text-[15.5px] leading-[1.55]">
                  {p.goal}
                </p>
                <ol className="mt-3">
                  {defects.map((d) => {
                    const journeys = journeysThrough(d.id).length;
                    return (
                      <li key={d.id} className="border-rule border-b">
                        <Link
                          href={defectHref(d.id)}
                          className="group hover:bg-sunk grid grid-cols-[52px_minmax(0,1fr)_20px] items-baseline gap-x-3 py-4 transition-colors sm:grid-cols-[64px_minmax(0,1fr)_200px_20px]"
                        >
                          <span className="text-fault font-mono text-[16px] font-bold">
                            {d.id}
                          </span>
                          <span className="min-w-0">
                            <span className="text-ink group-hover:text-accent block text-[18px] leading-[1.35] font-semibold transition-colors">
                              {d.title}
                            </span>
                            <span className="text-ink-body mt-1 block text-[15.5px] leading-[1.5] text-pretty">
                              {d.symptom}
                            </span>
                          </span>
                          <span className="col-start-2 row-start-2 mt-1.5 flex flex-wrap items-baseline gap-x-4 sm:col-start-auto sm:row-start-auto sm:mt-0 sm:flex-col sm:gap-y-1">
                            <SeverityBadge severity={d.severity} />
                            {journeys > 0 && (
                              <span className="text-ink-muted text-[14px]">
                                breaks {journeys}{" "}
                                {journeys === 1 ? "journey" : "journeys"}
                              </span>
                            )}
                            {d.blockedBy.length > 0 && (
                              <span className="text-ink-muted text-[14px]">
                                after{" "}
                                <span className="text-ink font-mono font-semibold">
                                  {d.blockedBy.join(", ")}
                                </span>
                              </span>
                            )}
                          </span>
                          <IconArrowRight
                            size={12}
                            className="text-ink-faint group-hover:text-accent col-start-3 row-start-1 size-4 self-center transition-all duration-200 group-hover:translate-x-1 sm:col-start-4"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      </div>

      <Pager
        prev={{ href: journeysHref, label: "Packet journeys" }}
        next={{
          href: defectHref(ordered[0].id),
          label: ordered[0].title,
          mark: ordered[0].id,
          description:
            "Start with the first one to close, and read them in the order they are fixed.",
        }}
        note={harbour.disclaimer}
      />
    </>
  );
}
