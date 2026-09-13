import Link from "next/link";
import type { ReactNode } from "react";
import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram";
import { CommandBlock } from "@/components/architecture/command-block";
import { DEFECT_CHIP } from "@/components/architecture/defect-link";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import {
  ChapterMarker,
  type Chapter as ChapterEntry,
} from "@/components/site/landing/chapter-marker";
import { HeroMap } from "@/components/site/landing/hero-map";
import { RegisterEntry } from "@/components/site/landing/register-entry";
import { TrackTour } from "@/components/site/landing/track-tour";
import { LabCard } from "@/components/site/lab-card";
import { PageShell } from "@/components/site/page-shell";
import { SectionIntro } from "@/components/site/section-intro";
import { StatPills } from "@/components/site/stat-pills";
import { ButtonLink } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { IconArrow, IconArrowRight, IconCheck } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { CheckBullet } from "@/components/ui/typography";
import type { FeaturedDefect, FeaturedTrack } from "@/lib/content/featured";
import { getFeaturedTrack } from "@/lib/content/featured";
import { allLabs, labHref } from "@/lib/content/registry";
import { labStats } from "@/lib/content/stats";
import { cn } from "@/lib/utils";

/** The About section where the standard advice gets argued with. */
const PUSH_BACK_ANCHOR = "where-i-would-push-back-on-the-textbook-answer";

/** The page walks the platform from as found to healthy, one chapter at a time. */
const CHAPTERS: ChapterEntry[] = [
  { id: "as-found", label: "As found" },
  { id: "find", label: "Find it" },
  { id: "order", label: "Order it" },
  { id: "fix", label: "Fix it" },
  { id: "every-angle", label: "Every angle" },
  { id: "healthy", label: "Healthy", healthy: true },
];

export default function HomePage() {
  const featured = getFeaturedTrack();

  return (
    <PageShell>
      <Hero featured={featured} />
      {featured ? <Chapters featured={featured} /> : <LabsSection />}
    </PageShell>
  );
}

/** "D1", "D1 and D2", "D1, D2 and D3". */
function joinList(items: string[]) {
  return items.length < 2
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

function DefectId({ id }: { id: string }) {
  return <span className={DEFECT_CHIP}>{id}</span>;
}

function Hero({ featured }: { featured?: FeaturedTrack }) {
  const trust = [
    "Free, no sign-up",
    "Real gcloud commands",
    "Every phase has a verify step",
  ];

  return (
    <section className="relative pt-20 pb-12 text-center sm:pt-24 sm:pb-16 lg:pt-28">
      <h1 className="text-gl-text mx-auto mb-6 max-w-[820px] text-[52px] leading-[1.02] font-bold tracking-[-0.035em] text-balance sm:text-[64px] lg:text-[78px]">
        <span className="animate-fade-up-lg inline-block">
          Broken on purpose.
        </span>
        <br />
        <span className="animate-fade-up-lg animation-delay-500 inline-block">
          Fixed in{" "}
          <span className="text-gl-primary animate-scale-in animation-delay-800 inline-block">
            order
          </span>
          .
        </span>
      </h1>

      <p
        className={cn(
          "text-gl-text-muted mx-auto max-w-[620px] text-[17px] leading-[1.55] text-pretty sm:text-[20px]",
          featured ? "mb-5" : "mb-10",
        )}
      >
        Explore a cloud platform built deliberately wrong. Trace packets hop by
        hop, find each defect with a real command, and close them phase by phase
        - in the order that won’t lock you out.
      </p>

      {featured && (
        <p className="text-gl-text-muted mx-auto mb-10 max-w-[620px] text-[15px] leading-[1.6] text-pretty">
          I’m Thirana. I broke {featured.lab} on purpose, and{" "}
          <Link
            href={`${featured.href}#${PUSH_BACK_ANCHOR}`}
            className="text-gl-text decoration-gl-border-input hover:decoration-gl-primary underline underline-offset-4 transition-colors"
          >
            in a few places I’d argue with the textbook fix
          </Link>
          .
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4">
        <ButtonLink
          href={featured?.href ?? "#labs"}
          size="lg"
          trailing={<IconArrow size={14} />}
        >
          {featured ? `Open ${featured.lab}` : "Browse labs"}
        </ButtonLink>
        {featured && (
          <ButtonLink href="#as-found" variant="secondary" size="lg">
            See how it works
          </ButtonLink>
        )}
      </div>

      <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        {trust.map((claim) => (
          <li
            key={claim}
            className="text-gl-text-muted inline-flex items-center gap-2 text-[13px] font-medium"
          >
            <CheckBullet className="bg-gl-success-soft text-gl-success" />
            {claim}
          </li>
        ))}
      </ul>

      {featured && (
        <div className="animate-fade-up-lg animation-delay-500 relative mt-16 sm:mt-20">
          <HeroMap
            lab={featured.lab}
            track={featured.track}
            mapHref={featured.mapHref}
            map={featured.map}
            phases={featured.phases}
            callouts={featured.callouts}
            focus={featured.focus}
            revealAt={featured.revealAt}
          />
        </div>
      )}
    </section>
  );
}

function Chapters({ featured }: { featured: FeaturedTrack }) {
  return (
    <div className="lg:grid lg:grid-cols-[148px_minmax(0,1fr)] lg:gap-12">
      <div className="hidden lg:block lg:pt-20">
        <ChapterMarker chapters={CHAPTERS} variant="rail" />
      </div>
      <div className="min-w-0">
        <AsFound featured={featured} />
        <Find featured={featured} />
        <Order featured={featured} />
        <Fix featured={featured} />
        <EveryAngle featured={featured} />
        <Healthy featured={featured} />
        <ChapterMarker chapters={CHAPTERS} variant="bar" />
      </div>
    </div>
  );
}

function Chapter({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: ReactNode;
  lead: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 py-12 sm:py-16 lg:py-20"
    >
      <FadeIn className="mb-8 max-w-[640px] sm:mb-10">
        <h2
          id={`${id}-title`}
          className="text-gl-text text-[32px] leading-[1.1] font-bold tracking-[-0.025em] text-balance sm:text-[40px] sm:tracking-[-0.028em]"
        >
          {title}
        </h2>
        <p className="text-gl-text-muted mt-4 text-[17px] leading-[1.55] text-pretty">
          {lead}
        </p>
      </FadeIn>
      <FadeIn delay={130}>{children}</FadeIn>
    </section>
  );
}

function AsFound({ featured }: { featured: FeaturedTrack }) {
  const { bypass, blocked, totals } = featured;
  const problems = [
    {
      title: "Invisible on the diagram",
      body: "A load balancer with a WAF looks protected - until you notice the run.app URL that walks straight around it. None of the defects are obvious from a picture.",
    },
    {
      title: "A list is not a plan",
      body: blocked
        ? `A register of ${totals.defects} findings is a list. ${blocked.defect.id} alone waits on ${blocked.blockers.length} other fixes, so the order is the real argument.`
        : `A register of ${totals.defects} findings is a list. Several cannot start until another is finished, so the order is the real argument.`,
    },
    {
      title: "The wrong order locks you out",
      body: "Delete the public SSH rule before the IAP path is verified, and nobody reaches production. Sequencing is part of the fix.",
    },
  ];

  return (
    <Chapter
      id="as-found"
      title={
        <>
          Knowing the fix is the{" "}
          <span className="text-gl-primary">easy half</span>.
        </>
      }
      lead="Every defect started as a reasonable shortcut that nobody revisited. The hard part is seeing it - and knowing what has to happen first."
    >
      <div
        className={cn(
          "grid items-start gap-8",
          bypass && "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10",
        )}
      >
        {bypass && (
          <figure className="border-gl-border bg-gl-bg shadow-gl overflow-hidden rounded-2xl border">
            <ArchitectureDiagram
              model={featured.map}
              phase={0}
              crop={bypass.crop}
              highlight={{
                lit: new Set(bypass.lit),
                failing: new Set(bypass.failing),
                order: new Map(),
                edges: new Set(bypass.edges),
              }}
              className="min-w-0"
            />
            <figcaption className="border-gl-border flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-t px-4 py-3 text-[13px]">
              <DefectId id={bypass.defect.id} />
              <span className="text-gl-text font-medium">
                {bypass.defect.title}
              </span>
              <span className="text-gl-text-muted font-mono text-[11px]">
                phase 0 · as found
              </span>
            </figcaption>
          </figure>
        )}
        <ol className="divide-gl-border border-gl-border divide-y border-y">
          {problems.map((p) => (
            <li key={p.title} className="py-5">
              <h3 className="text-gl-text text-[18px] leading-[1.3] font-bold tracking-[-0.015em]">
                {p.title}
              </h3>
              <p className="text-gl-text-muted mt-1.5 text-[15px] leading-[1.6] text-pretty">
                {p.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Chapter>
  );
}

function Find({ featured }: { featured: FeaturedTrack }) {
  const d = featured.followed.defect;

  return (
    <Chapter
      id="find"
      title={
        <>
          Find it with a <span className="text-gl-primary">real command</span>.
        </>
      }
      lead={`Every defect ships with the command that surfaces it, so you confirm the finding before you change anything. Follow ${d.id} from here to the fix.`}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <DefectId id={d.id} />
            <SeverityBadge severity={d.severity} />
          </div>
          <h3 className="text-gl-text mt-3 text-[22px] leading-[1.3] font-bold tracking-[-0.018em] text-balance">
            {d.title}
          </h3>
          <p className="text-gl-text mt-3 text-[15px] leading-[1.6] font-medium text-pretty">
            {d.symptom}
          </p>
          <p className="text-gl-text-muted mt-2 text-[15px] leading-[1.65] text-pretty">
            {d.explanation}
          </p>
        </div>
        <CommandBlock label="detect">{d.detection}</CommandBlock>
      </div>
    </Chapter>
  );
}

function Order({ featured }: { featured: FeaturedTrack }) {
  const { defect: d, blockers, unblocks } = featured.followed;
  const { riskiest } = featured;
  const steps = featured.phases.filter((p) => p.number > 0);
  const ids = (defects: FeaturedDefect[]) => joinList(defects.map((x) => x.id));

  const lead = [
    `${d.id} closes in phase ${d.phase}, ${d.phaseName}.`,
    blockers.length
      ? `It waits on ${ids(blockers)}.`
      : "Nothing has to land before it.",
    unblocks.length ? `${ids(unblocks)} cannot close until it does.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Chapter
      id="order"
      title={
        <>
          Put the fixes <span className="text-gl-primary">in order</span>.
        </>
      }
      lead={lead}
    >
      <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="border-gl-border bg-gl-surface shadow-gl rounded-2xl border p-5 sm:p-6">
          <h3 className="text-gl-text text-[15px] font-bold tracking-[-0.01em]">
            What {d.id} is tied to
          </h3>
          {blockers.length > 0 && (
            <DependencyGroup label="Lands first">
              {blockers.map((b) => (
                <DependencyRow key={b.id} defect={b} />
              ))}
            </DependencyGroup>
          )}
          <ol className="mt-4">
            <DependencyRow defect={d} focus />
          </ol>
          {unblocks.length > 0 && (
            <DependencyGroup label="Waits for it">
              {unblocks.map((u) => {
                const others = u.blockedBy.filter((id) => id !== d.id);
                return (
                  <DependencyRow
                    key={u.id}
                    defect={u}
                    note={
                      others.length
                        ? `also waits on ${joinList(others)}`
                        : undefined
                    }
                  />
                );
              })}
            </DependencyGroup>
          )}
        </div>

        <div className="border-gl-border bg-gl-surface shadow-gl rounded-2xl border p-5 sm:p-6">
          <h3 className="text-gl-text text-[15px] font-bold tracking-[-0.01em]">
            The remediation sequence
          </h3>
          <ol className="divide-gl-border mt-2 divide-y">
            {steps.map((p) => (
              <li
                key={p.number}
                className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-3"
              >
                <span className="text-gl-text-muted w-[62px] shrink-0 font-mono text-[11px]">
                  Phase {p.number}
                </span>
                <span
                  className={cn(
                    "text-gl-text min-w-0 flex-1 text-[14px]",
                    p.number === d.phase && "font-semibold",
                  )}
                >
                  {p.name}
                </span>
                {riskiest?.number === p.number && (
                  <span className="bg-gl-warning-soft text-gl-warning rounded-full pl-2 pr-[calc(0.5rem-0.08em)] py-0.5 text-[11px] font-bold tracking-[0.08em] uppercase">
                    High risk
                  </span>
                )}
                {p.number === d.phase && (
                  <span className="bg-gl-primary-soft text-gl-primary rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold">
                    {d.id} closes here
                  </span>
                )}
                <span className="text-gl-text-muted font-mono text-[11px] tabular-nums">
                  +{p.closes}
                </span>
              </li>
            ))}
          </ol>
          {riskiest && (
            <div className="border-gl-warning/30 bg-gl-warning-soft mt-4 rounded-[10px] border p-4">
              <p className="text-gl-warning text-[12.5px] font-semibold">
                Phase {riskiest.number} is high risk if the order is wrong.
                Verify before moving on:
              </p>
              <p className="text-gl-text mt-1.5 text-[13.5px] leading-[1.55]">
                {riskiest.verify}
              </p>
            </div>
          )}
        </div>
      </div>
    </Chapter>
  );
}

function DependencyGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-4">
      <p className="text-gl-text-muted px-3 text-[12.5px] font-semibold">
        {label}
      </p>
      <ol className="mt-1">{children}</ol>
    </div>
  );
}

function DependencyRow({
  defect,
  focus,
  note,
}: {
  defect: FeaturedDefect;
  focus?: boolean;
  note?: string;
}) {
  return (
    <li
      className={cn(
        "grid grid-cols-[64px_minmax(0,1fr)] items-baseline gap-3 rounded-[10px] px-3 py-2.5",
        focus && "bg-gl-danger-soft",
      )}
    >
      <span className="text-gl-text-muted font-mono text-[11px]">
        phase {defect.phase}
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "font-mono text-[12px] font-semibold",
            focus ? "text-gl-danger" : "text-gl-text-muted",
          )}
        >
          {defect.id}
        </span>{" "}
        <span
          className={cn("text-gl-text text-[14px]", focus && "font-semibold")}
        >
          {defect.title}
        </span>
        {note && (
          <span className="text-gl-text-muted mt-0.5 block text-[12.5px]">
            {note}
          </span>
        )}
      </span>
    </li>
  );
}

function Fix({ featured }: { featured: FeaturedTrack }) {
  const d = featured.followed.defect;

  return (
    <Chapter
      id="fix"
      title={
        <>
          Make the change that{" "}
          <span className="text-gl-primary">closes it</span>.
        </>
      }
      lead="Every register entry pairs the finding with the before, the after and the change itself - and the map, journeys and badges update as it lands."
    >
      <div className="max-w-[880px]">
        <RegisterEntry defect={d} />
        <Link
          href={`${featured.defectsHref}#${d.id}`}
          className="text-gl-primary hover:text-gl-primary-hover mt-4 inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold transition-colors"
        >
          See {d.id} in the full register <IconArrowRight size={12} />
        </Link>
      </div>
    </Chapter>
  );
}

function EveryAngle({ featured }: { featured: FeaturedTrack }) {
  return (
    <Chapter
      id="every-angle"
      title={
        <>
          One platform, <span className="text-gl-primary">every angle</span>.
        </>
      }
      lead="Each lab is one fictional platform. Its views run from the whole map down to the command that closes each defect."
    >
      <TrackTour
        views={featured.views}
        map={featured.map}
        journey={featured.journey}
        componentMap={featured.componentMap}
        chain={featured.chain}
        bypass={featured.bypass}
        spotlight={featured.spotlight}
        severityCounts={featured.severityCounts}
        totals={featured.totals}
        addressPlan={featured.addressPlan}
        addressMap={featured.addressMap}
      />
    </Chapter>
  );
}

function Healthy({ featured }: { featured: FeaturedTrack }) {
  const last = featured.phases.at(-1);
  const lastPhase = last?.number ?? 0;
  const open = featured.map.defects.filter((d) => d.phase > lastPhase).length;
  const labs = allLabs();

  return (
    <Chapter
      id="healthy"
      title={
        <>
          Walk it back to <span className="text-gl-primary">healthy</span>.
        </>
      }
      lead="Start with every defect open, then close them one phase at a time until the last journey goes green."
    >
      <figure className="border-gl-border bg-gl-bg shadow-gl-lg overflow-hidden rounded-2xl border">
        <figcaption className="border-gl-border bg-gl-bg-subtle flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo size={16} />
            <span className="text-gl-text text-[13px] font-bold whitespace-nowrap">
              {featured.lab} · {featured.track}
            </span>
            {last && (
              <span className="text-gl-text-muted truncate font-mono text-[11px]">
                · Phase {last.number} · {last.name}
              </span>
            )}
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap tabular-nums",
              open
                ? "border-gl-danger/30 bg-gl-danger-soft text-gl-danger"
                : "border-gl-success/30 bg-gl-success-soft text-gl-success",
            )}
          >
            {!open && <IconCheck size={11} />}
            {open
              ? `${open} of ${featured.totals.defects} defects open`
              : `all ${featured.totals.defects} defects closed`}
          </span>
        </figcaption>
        <div className="overflow-x-auto">
          <ArchitectureDiagram
            model={featured.map}
            phase={lastPhase}
            className="min-w-[720px] lg:min-w-0"
          />
        </div>
      </figure>

      <ul
        id="labs"
        className="divide-gl-border border-gl-border mt-10 scroll-mt-24 divide-y border-y"
      >
        {labs.map((ctx) => {
          const stats = labStats(ctx.lab);
          const isFeatured = ctx.lab.title === featured.lab;
          return (
            <li
              key={`${ctx.provider.slug}/${ctx.lab.slug}`}
              className="flex flex-col gap-6 py-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10"
            >
              <div className="max-w-[560px]">
                <h3 className="text-gl-text text-[22px] leading-[1.3] font-bold tracking-[-0.018em]">
                  {ctx.lab.title}
                </h3>
                <p className="text-gl-text-muted mt-2 text-[15px] leading-[1.6] text-pretty">
                  {ctx.lab.summary}
                  {ctx.lab.disclaimer && <> {ctx.lab.disclaimer}</>}
                </p>
                {stats && <StatPills stats={stats} className="mt-4" />}
              </div>
              <div className="flex flex-wrap gap-3 lg:shrink-0">
                <ButtonLink
                  href={isFeatured ? featured.href : labHref(ctx)}
                  size="lg"
                  trailing={<IconArrow size={14} />}
                >
                  Open {ctx.lab.title}
                </ButtonLink>
                {isFeatured && (
                  <ButtonLink
                    href={featured.defectsHref}
                    variant="secondary"
                    size="lg"
                  >
                    Read the defect register
                  </ButtonLink>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Chapter>
  );
}

/** Fallback when no track has an architecture to feature. */
function LabsSection() {
  const labs = allLabs();
  return (
    <section id="labs" className="scroll-mt-24 py-12 sm:py-16 lg:py-20">
      <FadeIn>
        <SectionIntro
          title="Labs"
          lead="Each lab is one fictional platform with its own tracks. Every track starts at phase 0, as found."
        />
      </FadeIn>
      <FadeIn delay={130}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {labs.map((ctx) => (
            <LabCard key={`${ctx.provider.slug}/${ctx.lab.slug}`} ctx={ctx} />
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
