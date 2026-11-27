import type { Metadata } from "next";
import Link from "next/link";
import { DefectLink } from "@/components/architecture/defect-link";
import { PageHeader } from "@/components/harbour/page-header";
import { Pager } from "@/components/harbour/pager";
import { SearchMeta } from "@/components/site/search-meta";
import { IconArrowRight, IconCheck, IconX } from "@/components/ui/icons";
import { failingHopCount } from "@/lib/architecture/journeys";
import { closedDefects } from "@/lib/architecture/state";
import {
  defectsHref,
  defectsOn,
  harbour,
  journeyHref,
  platformHref,
  sections,
} from "@/lib/content/harbour";
import { cn } from "@/lib/utils";

const LEAD =
  "Each journey follows one real flow through Harbour, hop by hop, with what the packet looks like at every step. Read it as found, then switch to the fixed design and watch which steps change.";

export const metadata: Metadata = {
  title: `Packet journeys · ${harbour.title}`,
  description: LEAD,
};

/** Every journey, with how it fares as found and what breaks it. */
export default function JourneysPage() {
  const model = harbour.architecture;
  const asFound = closedDefects(model, 0);
  const fixed = closedDefects(model, model.phases.at(-1)?.number ?? 0);
  const defects = sections[3];

  return (
    <>
      <div data-pagefind-body>
        <SearchMeta
          title="Packet journeys"
          where={`${harbour.title} · Case study`}
        />
        <PageHeader
          eyebrow="Part 3 of the case study"
          title="Packet journeys"
          lead={<p>{LEAD}</p>}
        />
        <section
          aria-label="Journeys"
          className="mx-auto w-full max-w-[1200px] px-5 pt-12 pb-20 sm:px-8"
        >
          <ol className="border-ink border-t">
            {model.journeys.map((j, i) => {
              const failing = failingHopCount(j, asFound);
              const onPath = defectsOn(j);
              return (
                <li key={j.slug} className="border-rule border-b">
                  <div className="grid gap-x-8 gap-y-3 py-7 lg:grid-cols-[48px_minmax(0,1fr)_300px]">
                    <span className="text-ink-faint font-mono text-[20px] font-bold">
                      {i + 1}.
                    </span>
                    <div className="min-w-0">
                      <h2 className="dd-head text-[24px] sm:text-[26px]">
                        <Link
                          href={journeyHref(j.slug)}
                          className="text-accent decoration-accent/40 group inline-flex items-baseline gap-2 underline decoration-[1.5px] underline-offset-4 transition-colors hover:decoration-current"
                        >
                          {j.title}
                          <IconArrowRight
                            size={12}
                            className="size-4 shrink-0 self-center transition-transform duration-200 group-hover:translate-x-1"
                          />
                        </Link>
                      </h2>
                      <p className="text-ink-muted mt-2 font-mono text-[14px]">
                        {j.summary}
                      </p>
                      <p className="text-ink-body mt-3 max-w-[64ch] text-[16.5px] leading-[1.6] text-pretty">
                        {j.intro}
                      </p>
                    </div>
                    <dl className="grid content-start gap-y-2 text-[15px] lg:pt-1.5">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <dt className="text-ink-muted w-[84px]">As found</dt>
                        <dd
                          className={cn(
                            "inline-flex items-center gap-1.5 font-semibold",
                            failing ? "text-fault" : "text-ink",
                          )}
                        >
                          {failing ? (
                            <IconX size={9} />
                          ) : (
                            <IconCheck size={11} />
                          )}
                          {failing
                            ? `${failing} ${failing === 1 ? "step fails" : "steps fail"}`
                            : "works"}
                        </dd>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <dt className="text-ink-muted w-[84px]">Fixed</dt>
                        <dd
                          className={cn(
                            "inline-flex items-center gap-1.5 font-semibold",
                            failingHopCount(j, fixed)
                              ? "text-fault"
                              : "text-green",
                          )}
                        >
                          {failingHopCount(j, fixed) ? (
                            <>
                              <IconX size={9} />
                              {failingHopCount(j, fixed)} still fail
                            </>
                          ) : (
                            <>
                              <IconCheck size={11} />
                              every step succeeds
                            </>
                          )}
                        </dd>
                      </div>
                      {onPath.length > 0 && (
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <dt className="text-ink-muted w-[84px]">Defects</dt>
                          <dd className="flex flex-wrap gap-x-2.5 gap-y-1">
                            {onPath.map((d) => (
                              <DefectLink key={d.id} id={d.id} />
                            ))}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="text-ink-muted mt-6 max-w-[64ch] text-[15.5px] leading-[1.55]">
            New to the names on these routes? The{" "}
            <Link href={platformHref} className="dd-link">
              platform map
            </Link>{" "}
            draws every box, and the{" "}
            <Link href={defectsHref} className="dd-link">
              defects
            </Link>{" "}
            take each failure apart.
          </p>
        </section>
      </div>

      <Pager
        prev={{ href: platformHref, label: "Platform" }}
        next={{
          href: defects.href,
          label: defects.label,
          mark: "4.",
          description: defects.description,
        }}
        note={harbour.disclaimer}
      />
    </>
  );
}
