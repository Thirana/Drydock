import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CommandBlock } from "@/components/architecture/command-block";
import { DefectLink } from "@/components/architecture/defect-link";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import { DefectFigure } from "@/components/harbour/defect-figure";
import { PageHeader } from "@/components/harbour/page-header";
import { Pager } from "@/components/harbour/pager";
import { PageRoute } from "@/components/layout/page-route";
import { SearchMeta } from "@/components/site/search-meta";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";
import { keyFlags } from "@/lib/architecture/key-flags";
import type { Defect } from "@/lib/architecture/types";
import { lessonsByDefect } from "@/lib/content/crosslinks";
import {
  defectBoxes,
  defectCrop,
  defectHref,
  defectsHref,
  getDefect,
  harbour,
  journeyHref,
  journeysThrough,
  mapModel,
  orderedDefects,
  phaseOf,
} from "@/lib/content/harbour";

export const dynamicParams = false;

export function generateStaticParams() {
  return harbour.architecture.defects.map((d) => ({
    defect: d.id.toLowerCase(),
  }));
}

async function resolve(
  params: PageProps<"/harbour/defects/[defect]">["params"],
) {
  const { defect } = await params;
  return getDefect(defect);
}

export async function generateMetadata({
  params,
}: PageProps<"/harbour/defects/[defect]">): Promise<Metadata> {
  const d = await resolve(params);
  return d
    ? {
        title: `${d.id}: ${d.title} · ${harbour.title}`,
        description: `${d.symptom} ${d.impact[0]}`,
      }
    : {};
}

/** One defect, taken apart: what it is, what it can cause, why, how to find it, the fix, and where it sits. */
export default async function DefectPage({
  params,
}: PageProps<"/harbour/defects/[defect]">) {
  const d = await resolve(params);
  if (!d) notFound();

  const model = harbour.architecture;
  const ordered = orderedDefects();
  const index = ordered.indexOf(d);
  const prev = ordered[index - 1];
  const next = ordered[index + 1];
  const phase = phaseOf(d.phase);
  const blockers = ordered.filter((x) => d.blockedBy.includes(x.id));
  const unblocks = ordered.filter((x) => x.blockedBy.includes(d.id));
  const shared = ordered.filter((x) => x.phase === d.phase && x !== d);
  const journeys = journeysThrough(d.id);
  const lessons = lessonsByDefect([d])[d.id] ?? [];

  return (
    <>
      <PageHeader
        eyebrow={
          <Link
            href={defectsHref}
            className="hover:text-ink inline-flex flex-wrap items-baseline gap-x-3 transition-colors"
          >
            <span className="text-fault font-mono font-bold">{d.id}</span>
            Defect {index + 1} of {ordered.length}, in the order they close
          </Link>
        }
        title={d.title}
        lead={
          <p className="text-ink">
            <span className="dd-mark">{d.symptom}</span>
          </p>
        }
        aside={
          <dl className="border-ink border-t-2">
            <Fact label="Severity">
              <SeverityBadge severity={d.severity} />
            </Fact>
            <Fact label="Closes in">
              phase {d.phase}, {phase?.name}
            </Fact>
            <Fact label="Closed by">{d.topic}</Fact>
            {journeys.length > 0 && (
              <Fact label="Breaks">
                {journeys.length}{" "}
                {journeys.length === 1 ? "journey" : "journeys"}
              </Fact>
            )}
          </dl>
        }
      />

      <div className="mx-auto grid w-full max-w-[1200px] gap-x-16 px-5 pt-6 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_220px]">
        <article id="defect-body" data-pagefind-body className="min-w-0">
          <SearchMeta
            title={`${d.id}: ${d.title}`}
            where={`${harbour.title} · Defects`}
          />

          <Section title="What it can cause">
            <ul className="max-w-[68ch] space-y-3">
              {d.impact.map((line) => (
                <li
                  key={line}
                  className="grid grid-cols-[20px_minmax(0,1fr)] gap-x-2"
                >
                  <span
                    aria-hidden="true"
                    className="bg-fault mt-[11px] size-[7px] rounded-[1px]"
                  />
                  <span className="text-ink text-[18px] leading-[1.6] text-pretty">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Where it sits">
            <p className="text-ink-body mb-6 max-w-[68ch] text-[17px] leading-[1.6]">
              Everything {d.id} touches is lit. Switch to fixed to see the
              platform with only this defect closed.
            </p>
            <DefectFigure
              map={mapModel()}
              id={d.id}
              crop={defectCrop(d)}
              boxes={defectBoxes(d)}
              before={d.before}
              after={d.after}
            />
          </Section>

          <Section title="Why it is wrong">
            <p className="text-ink-body max-w-[68ch] text-[18px] leading-[1.65] text-pretty">
              {d.explanation}
            </p>
            <div className="border-rule mt-6 grid max-w-[68ch] gap-x-5 gap-y-1 border-t pt-4 sm:grid-cols-[110px_minmax(0,1fr)]">
              <p className="dd-label text-ink">The idea</p>
              <p className="text-ink-body text-[16.5px] leading-[1.6]">
                {d.concept}
              </p>
            </div>
            {lessons.length > 0 && (
              <div className="border-rule mt-4 grid max-w-[68ch] gap-x-5 gap-y-1 border-t pt-4 sm:grid-cols-[110px_minmax(0,1fr)]">
                <p className="dd-label text-ink">Learn it</p>
                <ul className="space-y-1.5 text-[16.5px] leading-[1.5]">
                  {lessons.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="dd-link">
                        {l.section ?? l.chapter}
                      </Link>
                      <span className="text-ink-muted"> · {l.where}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          <Section title="How you would find it">
            <CommandBlock label="detect">{d.detection}</CommandBlock>
          </Section>

          <Section title="The change that closes it">
            <dl className="border-rule mb-6 grid border-y sm:grid-cols-2">
              <div className="border-rule py-4 sm:border-r sm:pr-5">
                <dt className="dd-label text-fault">As found</dt>
                <dd className="text-ink mt-1.5 text-[15.5px] leading-[1.55]">
                  {d.before}
                </dd>
              </div>
              <div className="border-rule border-t py-4 sm:border-t-0 sm:pl-5">
                <dt className="dd-label text-green inline-flex items-center gap-1.5">
                  <IconCheck size={11} /> Fixed
                </dt>
                <dd className="text-ink mt-1.5 text-[15.5px] leading-[1.55]">
                  {d.after}
                </dd>
              </div>
            </dl>
            <CommandBlock
              label="fix"
              marks={keyFlags(d.remediation, d.after, d.before)}
            >
              {d.remediation}
            </CommandBlock>
          </Section>

          <Section title="When to fix it">
            <p className="text-ink-body max-w-[68ch] text-[17px] leading-[1.6] text-pretty">
              Phase {d.phase}, {phase?.name}
              {shared.length > 0 && (
                <>
                  , together with <IdList defects={shared} />
                </>
              )}
              . {phase?.rationale ?? phase?.goal}
            </p>
            <div className="border-rule mt-6 grid gap-x-10 gap-y-5 border-t pt-5 sm:grid-cols-2">
              <Order
                label="Cannot start until"
                defects={blockers}
                empty="Nothing. It can start as soon as its phase does."
              />
              <Order
                label="Unblocks"
                defects={unblocks}
                empty="Nothing waits on it."
              />
            </div>
          </Section>

          {journeys.length > 0 && (
            <Section title="Journeys it breaks">
              <ul className="border-rule border-t">
                {journeys.map(({ journey, failing }) => (
                  <li key={journey.slug} className="border-rule border-b">
                    <Link
                      href={journeyHref(journey.slug)}
                      className="group hover:bg-sunk grid gap-1 py-4 transition-colors sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6"
                    >
                      <span className="min-w-0">
                        <span className="text-accent block text-[18px] font-bold">
                          {journey.title}
                        </span>
                        {failing.length > 0 && (
                          <span className="text-ink-body mt-1 block text-[16px] leading-[1.55]">
                            Fails at{" "}
                            <span className="text-fault font-mono text-[14.5px] font-semibold">
                              {failing.map((h) => h.where).join(", ")}
                            </span>
                            : {failing[0].why}
                          </span>
                        )}
                      </span>
                      <IconArrowRight
                        size={12}
                        className="text-accent size-4 self-center transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </article>
        <aside className="hidden lg:block">
          <div className="sticky top-24 pt-12">
            <PageRoute container="defect-body" />
          </div>
        </aside>
      </div>

      <Pager
        prev={
          prev
            ? { href: defectHref(prev.id), label: prev.title, mark: prev.id }
            : { href: defectsHref, label: "All defects" }
        }
        next={
          next
            ? {
                href: defectHref(next.id),
                label: next.title,
                mark: next.id,
                description: next.symptom,
              }
            : undefined
        }
        end={
          <>
            That is all {model.defects.length}, and the whole case study.{" "}
            <Link href={defectsHref} className="dd-link">
              Back to the register
            </Link>
          </>
        }
        note={harbour.disclaimer}
      />
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <section
      aria-labelledby={id}
      className="border-rule mt-14 border-t pt-8 first-of-type:mt-8 first-of-type:border-t-0"
    >
      <h2
        id={id}
        className="dd-head text-ink mb-6 scroll-mt-24 text-[26px] sm:text-[30px]"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-rule grid grid-cols-[96px_minmax(0,1fr)] items-baseline gap-x-3 border-b py-2.5">
      <dt className="text-ink-muted text-[14.5px]">{label}</dt>
      <dd className="text-ink text-[15.5px] leading-[1.45]">{children}</dd>
    </div>
  );
}

function IdList({ defects }: { defects: Defect[] }) {
  return (
    <>
      {defects.map((x, i) => (
        <span key={x.id}>
          {i > 0 && (i === defects.length - 1 ? " and " : ", ")}
          <DefectLink id={x.id} />
        </span>
      ))}
    </>
  );
}

function Order({
  label,
  defects,
  empty,
}: {
  label: string;
  defects: Defect[];
  empty: string;
}) {
  return (
    <div>
      <p className="dd-label text-ink-muted">{label}</p>
      {defects.length ? (
        <ul className="mt-2 space-y-2">
          {defects.map((x) => (
            <li
              key={x.id}
              className="grid grid-cols-[48px_minmax(0,1fr)] items-baseline gap-x-2"
            >
              <DefectLink id={x.id} />
              <span className="text-ink text-[15.5px] leading-[1.4]">
                {x.title}{" "}
                <span className="text-ink-muted text-[14px]">
                  · phase {x.phase}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-body mt-2 text-[15.5px]">{empty}</p>
      )}
    </div>
  );
}
