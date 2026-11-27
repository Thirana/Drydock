import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DefectLink } from "@/components/architecture/defect-link";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import { JourneyWalk } from "@/components/harbour/journey-walk";
import { PageHeader } from "@/components/harbour/page-header";
import { Pager } from "@/components/harbour/pager";
import { SearchMeta } from "@/components/site/search-meta";
import {
  boxLabels,
  defectsHref,
  defectsOn,
  getJourney,
  harbour,
  journeyHref,
  journeysHref,
} from "@/lib/content/harbour";

export const dynamicParams = false;

export function generateStaticParams() {
  return harbour.architecture.journeys.map((j) => ({ journey: j.slug }));
}

async function resolve(
  params: PageProps<"/harbour/journeys/[journey]">["params"],
) {
  const { journey } = await params;
  return getJourney(journey);
}

export async function generateMetadata({
  params,
}: PageProps<"/harbour/journeys/[journey]">): Promise<Metadata> {
  const journey = await resolve(params);
  return journey
    ? {
        title: `${journey.title} · ${harbour.title}`,
        description: journey.intro,
      }
    : {};
}

/** One packet journey: why it matters, then the walk, as found or fixed. */
export default async function JourneyPage({
  params,
}: PageProps<"/harbour/journeys/[journey]">) {
  const journey = await resolve(params);
  if (!journey) notFound();

  const model = harbour.architecture;
  const all = model.journeys;
  const index = all.indexOf(journey);
  const prev = all[index - 1];
  const next = all[index + 1];
  const onPath = defectsOn(journey);

  return (
    <>
      <div data-pagefind-body>
        <SearchMeta
          title={journey.title}
          where={`${harbour.title} · Packet journeys`}
        />
        <PageHeader
          eyebrow={
            <Link
              href={journeysHref}
              className="hover:text-ink transition-colors"
            >
              Packet journey {index + 1} of {all.length}
            </Link>
          }
          title={journey.title}
          lead={<p>{journey.intro}</p>}
          aside={
            onPath.length > 0 && (
              <div className="border-ink border-t-2 pt-3">
                <p className="dd-label text-ink-muted">Defects on this path</p>
                <ul className="mt-2">
                  {onPath.map((d) => (
                    <li
                      key={d.id}
                      className="border-rule grid grid-cols-[48px_minmax(0,1fr)] items-baseline gap-x-2 border-b py-2.5"
                    >
                      <DefectLink id={d.id} />
                      <span className="min-w-0">
                        <span className="text-ink block text-[15.5px] leading-[1.4]">
                          {d.title}
                        </span>
                        <span className="mt-0.5 flex flex-wrap gap-x-3">
                          <SeverityBadge severity={d.severity} />
                          <span className="text-ink-muted text-[14px]">
                            closes in phase {d.phase}
                          </span>
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={defectsHref}
                  className="dd-link mt-3 inline-block text-[15px]"
                >
                  All {model.defects.length} defects
                </Link>
              </div>
            )
          }
        />
      </div>

      <JourneyWalk
        journey={journey}
        defectIds={model.defects.map((d) => d.id)}
        labels={boxLabels()}
        defects={Object.fromEntries(
          onPath.map((d) => [d.id, { title: d.title, phase: d.phase }]),
        )}
      />

      <Pager
        prev={
          prev
            ? { href: journeyHref(prev.slug), label: prev.title }
            : { href: journeysHref, label: "All journeys" }
        }
        next={
          next
            ? {
                href: journeyHref(next.slug),
                label: next.title,
                mark: `${index + 2}.`,
                description: next.intro,
              }
            : {
                href: defectsHref,
                label: "Defects",
                description: `All ${model.defects.length}, one page each: what it is, what it can cause, and the change that closes it.`,
              }
        }
        note={harbour.disclaimer}
      />
    </>
  );
}
