import Link from "next/link";
import type { ReactNode } from "react";
import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram";
import { CommandBlock } from "@/components/architecture/command-block";
import { DEFECT_CHIP } from "@/components/architecture/defect-link";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import { HeroMap } from "@/components/site/landing/hero-map";
import { RegisterEntry } from "@/components/site/landing/register-entry";
import { ViewGuide, ViewGuideItem } from "@/components/layout/view-guide";
import { LabCard } from "@/components/site/lab-card";
import { PageShell } from "@/components/site/page-shell";
import { SectionIntro } from "@/components/site/section-intro";
import { ButtonLink } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { IconArrow, IconArrowRight } from "@/components/ui/icons";
import type { FeaturedDefect, FeaturedTrack } from "@/lib/content/featured";
import { getFeaturedTrack } from "@/lib/content/featured";
import { allLabs, labHref } from "@/lib/content/registry";
import { cn } from "@/lib/utils";

/** The About section where the standard advice gets argued with. */
const PUSH_BACK_ANCHOR = "where-i-would-push-back-on-the-textbook-answer";

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
  return (
    <section className="relative pt-16 pb-16 sm:pt-24">
      <div className="max-w-[820px]">
        <h1 className="dd-head animate-rise text-ink text-[48px] leading-[1.02] sm:text-[64px] lg:text-[76px]">
          Broken on purpose.
          <br />
          Fixed in order.
        </h1>
        <p className="text-ink-body mt-6 max-w-[40ch] text-[20px] leading-[1.5] text-pretty sm:text-[22px]">
          Explore a cloud platform built deliberately wrong. Trace packets hop
          by hop, find each defect with a real command, and close them phase by
          phase - in the order that won’t lock you out. Free, with no sign-up.
        </p>
        {featured && (
          <p className="text-ink-muted mt-4 max-w-[52ch] text-[17px] leading-[1.55] text-pretty">
            I’m Thirana. I broke {featured.lab} on purpose, and{" "}
            <Link
              href={`${featured.href}#${PUSH_BACK_ANCHOR}`}
              className="dd-link"
            >
              in a few places I’d argue with the textbook fix
            </Link>
            .
          </p>
        )}
        <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
          <ButtonLink
            href={featured?.href ?? "#labs"}
            size="lg"
            trailing={<IconArrow size={14} />}
          >
            {featured ? `Open ${featured.lab}` : "Browse labs"}
          </ButtonLink>
          {featured && (
            <ButtonLink href="#score" variant="ghost" size="lg">
              See how it works
            </ButtonLink>
          )}
        </div>
      </div>

      {featured && (
        <div id="score" className="mt-20 scroll-mt-8">
          <HeroMap
            lab={featured.lab}
            track={featured.track}
            mapHref={featured.mapHref}
            map={featured.map}
            phases={featured.phases}
            trims={featured.trims}
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
  const d = featured.followed.defect;
  return (
    <div>
      <AsFound featured={featured} />
      <Chapter
        id="follow"
        title={`Follow ${d.id} from finding to fix.`}
        lead={`${d.title}. Three steps: confirm it with a real command, see where it sits in the order, then make the change that closes it.`}
      >
        <div className="space-y-16">
          <Find featured={featured} />
          <Order featured={featured} />
          <Fix featured={featured} />
        </div>
      </Chapter>
      <EveryAngle featured={featured} />
      <Healthy featured={featured} />
    </div>
  );
}

/** One step inside a chapter: a plain subheading and its lead. */
function Step({
  title,
  lead,
  children,
}: {
  title: ReactNode;
  lead: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="text-ink text-[22px] leading-[1.3] font-bold">{title}</h3>
      <p className="text-ink-body mt-2 mb-7 max-w-[62ch] text-[17px] leading-[1.6] text-pretty">
        {lead}
      </p>
      {children}
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
      className="border-rule scroll-mt-8 border-t py-16 sm:py-20"
    >
      <FadeIn className="mb-10 max-w-[720px]">
        <h2
          id={`${id}-title`}
          className="dd-head text-ink text-[28px] sm:text-[32px]"
        >
          {title}
        </h2>
        <p className="text-ink-body mt-4 text-[19px] leading-[1.55] text-pretty">
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
      title={<>Knowing the fix is the easy half.</>}
      lead="Every defect started as a reasonable shortcut that nobody revisited. The hard part is seeing it - and knowing what has to happen first."
    >
      <div
        className={cn(
          "grid items-start gap-10",
          bypass && "xl:grid-cols-12 xl:gap-12",
        )}
      >
        {bypass && (
          <figure className="xl:col-span-7">
            <div className="border-rule bg-ground rounded-[2px] border">
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
            </div>
            <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-3 text-[15px]">
              <DefectId id={bypass.defect.id} />
              <span className="text-ink font-semibold">
                {bypass.defect.title}
              </span>
              <span className="text-ink-muted">as found</span>
            </figcaption>
          </figure>
        )}
        <ol className={cn("border-rule border-t", bypass && "xl:col-span-5")}>
          {problems.map((p) => (
            <li key={p.title} className="border-rule border-b py-6">
              <div>
                <h3 className="text-ink text-[19px] font-bold">{p.title}</h3>
                <p className="text-ink-body mt-2 text-[16.5px] leading-[1.6] text-pretty">
                  {p.body}
                </p>
              </div>
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
    <Step
      title={<>Find it with a real command.</>}
      lead={`Every defect ships with the command that surfaces it, so you confirm the finding before you change anything.`}
    >
      <div className="grid items-start gap-10 xl:grid-cols-12 xl:gap-12">
        <div className="xl:col-span-5">
          <h3 className="grid grid-cols-[48px_minmax(0,1fr)] items-baseline gap-x-2">
            <DefectId id={d.id} />
            <span>
              <span className="dd-head text-ink block text-[24px]">
                {d.title}
              </span>
              <SeverityBadge severity={d.severity} className="mt-1" />
            </span>
          </h3>
          <div className="xl:pl-[56px]">
            <p className="text-ink mt-4 text-[18px] leading-[1.5] font-medium text-pretty">
              {d.symptom}
            </p>
            <p className="text-ink-body mt-3 text-[16.5px] leading-[1.6] text-pretty">
              {d.explanation}
            </p>
          </div>
        </div>
        <div className="min-w-0 xl:col-span-7">
          <CommandBlock label="detect">{d.detection}</CommandBlock>
        </div>
      </div>
    </Step>
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
    <Step title="Put the fixes in order." lead={lead}>
      <div className="grid items-start gap-12 xl:grid-cols-2">
        <div className="border-rule border-t">
          <h4 className="text-ink pt-4 text-[18px] font-bold">
            What {d.id} is tied to
          </h4>
          {blockers.length > 0 && (
            <DependencyGroup label="Lands first">
              {blockers.map((b) => (
                <DependencyRow key={b.id} defect={b} />
              ))}
            </DependencyGroup>
          )}
          <DependencyGroup label="This one">
            <DependencyRow defect={d} focus />
          </DependencyGroup>
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

        <div className="border-rule border-t">
          <h4 className="text-ink pt-4 text-[18px] font-bold">
            The remediation sequence
          </h4>
          <ol className="mt-3">
            {steps.map((p) => {
              const here = p.number === d.phase;
              return (
                <li
                  key={p.number}
                  className="border-rule grid grid-cols-[32px_minmax(0,1fr)_auto] items-baseline gap-x-2 border-t py-3"
                >
                  <span
                    className={cn(
                      "font-mono text-[15px] font-bold",
                      here ? "text-accent" : "text-ink-faint",
                    )}
                  >
                    {p.number}.
                  </span>
                  <span className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className={cn(
                        "text-[17px]",
                        here ? "text-accent font-bold" : "text-ink",
                      )}
                    >
                      {p.name}
                    </span>
                    {riskiest?.number === p.number && (
                      <span className="text-fault text-[14px] font-semibold">
                        high risk
                      </span>
                    )}
                    {here && (
                      <span className="text-ink-muted text-[14px]">
                        {d.id} closes here
                      </span>
                    )}
                  </span>
                  <span className="text-ink-muted text-[14px] tabular-nums">
                    closes {p.closes}
                  </span>
                </li>
              );
            })}
          </ol>
          {riskiest && (
            <div className="mt-6 grid grid-cols-[32px_minmax(0,1fr)] gap-x-2">
              <span
                aria-hidden="true"
                className="text-ink pt-[2px] font-mono text-[15px] font-bold"
              >
                !?
              </span>
              <div>
                <p className="text-ink text-[16px] font-semibold">
                  Phase {riskiest.number} is high risk if the order is wrong.
                  Verify before moving on:
                </p>
                <p className="text-ink-body mt-1.5 text-[16px] leading-[1.55]">
                  {riskiest.verify}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Step>
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
    <div className="mt-5">
      <p className="dd-label text-ink-muted">{label}</p>
      <ol className="border-rule mt-2 border-t">{children}</ol>
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
        "border-rule grid grid-cols-[64px_minmax(0,1fr)] items-baseline gap-3 border-b py-3",
        focus && "border-fault border-b-2",
      )}
    >
      <span
        className={cn(
          "font-mono text-[14px] font-bold",
          focus ? "text-fault" : "text-ink",
        )}
      >
        {defect.id}
      </span>
      <span className="min-w-0">
        <span
          className={cn("text-ink text-[16.5px]", focus && "font-semibold")}
        >
          {defect.title}
        </span>
        <span className="text-ink-muted mt-0.5 block text-[14.5px]">
          phase {defect.phase}
          {note && ` · ${note}`}
        </span>
      </span>
    </li>
  );
}

function Fix({ featured }: { featured: FeaturedTrack }) {
  const d = featured.followed.defect;

  return (
    <Step
      title={<>Make the change that closes it.</>}
      lead="Every register entry pairs the finding with the before, the after and the change itself - and the map, journeys and badges update as it lands."
    >
      <div className="max-w-[960px]">
        <RegisterEntry defect={d} />
        <ButtonLink
          href={`${featured.defectsHref}#${d.id}`}
          variant="ghost"
          className="mt-4"
          trailing={<IconArrowRight size={12} />}
        >
          See {d.id} in the full register
        </ButtonLink>
      </div>
    </Step>
  );
}

function EveryAngle({ featured }: { featured: FeaturedTrack }) {
  return (
    <Chapter
      id="every-angle"
      title="One platform, every angle."
      lead="Each lab is one fictional platform. Its views run from the whole map down to the command that closes each defect."
    >
      <ViewGuide className="my-0">
        {featured.views.map((v, i) => (
          <ViewGuideItem
            key={v.slug}
            href={v.href}
            title={v.title}
            frame={i + 2}
          >
            {v.description}
          </ViewGuideItem>
        ))}
      </ViewGuide>
    </Chapter>
  );
}

function Healthy({ featured }: { featured: FeaturedTrack }) {
  const labs = allLabs();
  return (
    <Chapter
      id="labs"
      title="Start at move 0."
      lead="Every track opens as found, with every defect in place. Close them one phase at a time until the last journey passes."
    >
      <ul className="max-w-[760px]">
        {labs.map((ctx) => {
          const isFeatured = ctx.lab.title === featured.lab;
          return (
            <li
              key={`${ctx.provider.slug}/${ctx.lab.slug}`}
              className="border-rule border-t py-6"
            >
              <h3 className="text-ink text-[22px] font-bold">
                {ctx.lab.title}
              </h3>
              <p className="text-ink-body mt-1.5 max-w-[56ch] text-[17px] leading-[1.55] text-pretty">
                {ctx.lab.summary}
                {ctx.lab.disclaimer && <> {ctx.lab.disclaimer}</>}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3">
                <ButtonLink
                  href={isFeatured ? featured.href : labHref(ctx)}
                  trailing={<IconArrow size={14} />}
                >
                  Open {ctx.lab.title}
                </ButtonLink>
                {isFeatured && (
                  <ButtonLink href={featured.defectsHref} variant="ghost">
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
        <div className="grid grid-cols-1 gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
          {labs.map((ctx) => (
            <LabCard key={`${ctx.provider.slug}/${ctx.lab.slug}`} ctx={ctx} />
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
