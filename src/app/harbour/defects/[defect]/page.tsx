import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CommandBlock } from "@/components/architecture/command-block";
import { DefectLink } from "@/components/architecture/defect-link";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import { DefectView } from "@/components/harbour/defect-view";
import { PageHeader } from "@/components/harbour/page-header";
import { Pager } from "@/components/harbour/pager";
import { SearchMeta } from "@/components/site/search-meta";
import {
  IconArrowRight,
  IconCheck,
  IconChevronDown,
} from "@/components/ui/icons";
import { keyFlags } from "@/lib/architecture/key-flags";
import type { Defect } from "@/lib/architecture/types";
import { lessonsByDefect } from "@/lib/content/crosslinks";
import {
  defectHref,
  defectsHref,
  getDefect,
  harbour,
  journeyHref,
  journeysThrough,
  orderedDefects,
  phaseOf,
} from "@/lib/content/harbour";
import { cn } from "@/lib/utils";

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

      <DefectView id={d.id} before={d.before} after={d.after}>
        <article data-pagefind-body>
          <SearchMeta
            title={`${d.id}: ${d.title}`}
            where={`${harbour.title} · Defects`}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="dd-head text-ink text-[26px] sm:text-[30px]">
              Notes
            </h2>
            <p className="text-ink-muted text-[15px]">open one at a time</p>
          </div>
          <div className="border-rule mt-5 border-t">
            <Note n={1} title="What it can cause" preview={d.impact[0]}>
              <ul className="max-w-[68ch] space-y-3">
                {d.impact.map((line) => (
                  <li
                    key={line}
                    className="grid grid-cols-[20px_minmax(0,1fr)] gap-x-2"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-fault mt-[10px] size-[7px] rounded-[1px]"
                    />
                    <span className="text-ink text-[17px] leading-[1.6] text-pretty">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </Note>

            <Note n={2} title="Why it is wrong" preview={d.concept}>
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
            </Note>

            <Note
              n={3}
              title="How you would find it"
              preview={firstCommand(d.detection)}
              mono
            >
              <CommandBlock label="detect">{d.detection}</CommandBlock>
            </Note>

            <Note n={4} title="The change that closes it" preview={d.after}>
              {/* Beside the notes on wide screens, the change sits in the side column. */}
              <dl className="border-rule mb-6 grid border-y sm:grid-cols-2 lg:hidden">
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
            </Note>

            <Note
              n={5}
              title="When to fix it"
              preview={`Phase ${d.phase}, ${phase?.name ?? ""}${
                blockers.length
                  ? ` - after ${blockers.map((x) => x.id).join(", ")}`
                  : ""
              }`}
            >
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
            </Note>

            {journeys.length > 0 && (
              <Note
                n={6}
                title="Journeys it breaks"
                preview={journeys
                  .map(({ journey }) => journey.title)
                  .join(" · ")}
              >
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
              </Note>
            )}
          </div>
        </article>
      </DefectView>

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

/** The first command of a detection script, for a one-line preview. */
function firstCommand(script: string) {
  const lines = script.split("\n");
  let i = lines.findIndex((l) => l.trim() && !l.trim().startsWith("#"));
  if (i < 0) return "";
  // A command runs on past a trailing backslash or an open quote.
  let command = "";
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    const glue = !command || /[(,]$/.test(command) ? "" : " ";
    command += glue + line.replace(/\\$/, "").trim();
    const openQuote = (command.match(/"/g)?.length ?? 0) % 2 === 1;
    if (!line.endsWith("\\") && !openQuote) break;
  }
  return command.replace(/\s+/g, " ");
}

/**
 * One note in the toggle list. Native <details>, so the text is in the page
 * for search and find-in-page, and the shared name lets one open at a time.
 * Closed, it shows a line of what is inside.
 */
function Note({
  n,
  title,
  preview,
  mono,
  children,
}: {
  n: number;
  title: string;
  preview?: string;
  /** The preview is a command. */
  mono?: boolean;
  children: ReactNode;
}) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <details
      name="defect-notes"
      className="group border-rule open:border-l-accent border-b border-l-2 border-l-transparent transition-colors duration-300"
    >
      <summary className="hover:bg-sunk/60 grid cursor-pointer list-none grid-cols-[30px_minmax(0,1fr)_auto] items-start gap-x-3 py-4 pr-2 pl-4 transition-colors duration-150 [&::-webkit-details-marker]:hidden">
        <span className="text-ink group-open:text-accent pt-[3px] font-mono text-[16px] font-bold">
          {n}.
        </span>
        <span className="min-w-0">
          <h3
            id={id}
            className="text-ink scroll-mt-20 text-[19px] leading-[1.35] font-bold"
          >
            {title}
          </h3>
          {preview && (
            <span
              className={cn(
                "text-ink-body mt-1 group-open:hidden",
                mono
                  ? "block truncate font-mono text-[14px]"
                  : "line-clamp-2 text-[16px] leading-[1.5] sm:line-clamp-1",
              )}
            >
              {preview}
            </span>
          )}
        </span>
        <IconChevronDown
          size={14}
          className="text-ink-muted mt-2 transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="pr-2 pb-7 pl-4 sm:pl-[58px]">{children}</div>
    </details>
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
