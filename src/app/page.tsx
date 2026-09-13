import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram";
import { HeroMap } from "@/components/site/landing/hero-map";
import { SpotlightCard } from "@/components/site/landing/spotlight-card";
import { TrackTour } from "@/components/site/landing/track-tour";
import { LabCard } from "@/components/site/lab-card";
import { PageShell } from "@/components/site/page-shell";
import { SectionIntro } from "@/components/site/section-intro";
import { StatPills } from "@/components/site/stat-pills";
import { ButtonLink } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import {
  IconArrow,
  IconEye,
  IconList,
  IconLock,
  IconSearch,
  IconSteps,
  IconWrench,
  type IconProps,
} from "@/components/ui/icons";
import { CheckBullet } from "@/components/ui/typography";
import type { FeaturedTrack } from "@/lib/content/featured";
import { getFeaturedTrack } from "@/lib/content/featured";
import { allLabs } from "@/lib/content/registry";
import { cn } from "@/lib/utils";

const FEATURE_CARD =
  "border-gl-border bg-gl-surface shadow-gl hover:shadow-gl-lg flex flex-col rounded-2xl border p-7 transition-all duration-[150ms] hover:-translate-y-0.5";

const EYEBROW =
  "text-gl-text-faint text-[10px] font-bold tracking-[0.12em] uppercase";

/** Keeps the map at the card's edges, clear of the headline. */
const CTA_MAP_MASK =
  "radial-gradient(70% 85% at 50% 50%, transparent 30%, #000 90%)";

export default function HomePage() {
  const featured = getFeaturedTrack();

  return (
    <PageShell>
      <Hero featured={featured} />
      {featured && (
        <>
          <ProblemSection featured={featured} />
          <InsideSection featured={featured} />
          <HowItWorks featured={featured} />
        </>
      )}
      <LabsSection />
      {featured && <BottomCta featured={featured} />}
    </PageShell>
  );
}

function IconTile({
  icon: Icon,
  tone,
  small,
}: {
  icon: ComponentType<IconProps>;
  tone: string;
  small?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl",
        small ? "size-10" : "size-11",
        tone,
      )}
    >
      <Icon size={small ? 18 : 22} />
    </span>
  );
}

function Hero({ featured }: { featured?: FeaturedTrack }) {
  const trust = [
    "Free and fully static",
    "Real gcloud commands",
    "Every phase has a verify step",
  ];

  return (
    <section className="relative pt-16 pb-12 text-center sm:pt-20 sm:pb-16">
      {featured && (
        <Link
          href={featured.href}
          className="border-gl-border bg-gl-surface text-gl-text-muted hover:border-gl-border-input mb-8 inline-flex items-center gap-2 rounded-full border px-3 py-1 pr-3.5 text-[12px] font-medium transition-colors"
        >
          <span className="bg-gl-primary-soft text-gl-primary rounded-full px-2 py-0.5 text-[10.5px] font-bold tracking-[0.08em] uppercase">
            New lab
          </span>
          <span className="text-gl-text sm:hidden">{featured.lab}</span>
          <span className="text-gl-text hidden sm:inline">
            {featured.lab}: {featured.totals.defects} deliberate defects on{" "}
            {featured.provider}
          </span>
          <IconArrow size={12} />
        </Link>
      )}

      <h1 className="text-gl-text mx-auto mb-6 max-w-[820px] text-[52px] leading-[1.02] font-bold tracking-[-0.035em] text-balance sm:text-[64px] lg:text-[78px]">
        <span className="animate-fade-up-lg inline-block">
          <span className="bg-gradient-to-r from-[#2EB8A0] to-[#7DDFD0] bg-clip-text text-transparent">
            Broken
          </span>{" "}
          on purpose.
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

      <p className="text-gl-text-muted mx-auto mb-10 max-w-[620px] text-[17px] leading-[1.55] text-pretty sm:text-[20px]">
        Explore cloud platforms built deliberately wrong. Trace packets hop by
        hop, find each defect with a real command, and close them phase by phase
        — in the order that won’t lock you out.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <ButtonLink
          href={featured?.href ?? "#labs"}
          size="lg"
          trailing={<IconArrow size={14} />}
        >
          {featured ? `Explore ${featured.lab}` : "Browse labs"}
        </ButtonLink>
        <ButtonLink href="#how-it-works" variant="secondary" size="lg">
          See how it works
        </ButtonLink>
      </div>

      <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        {trust.map((claim) => (
          <li
            key={claim}
            className="text-gl-text-muted inline-flex items-center gap-2 text-[13px] font-medium"
          >
            <CheckBullet />
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
          />
        </div>
      )}
    </section>
  );
}

function ProblemSection({ featured }: { featured: FeaturedTrack }) {
  const { bypass, blocked, riskiest } = featured;

  const problems: {
    icon: ComponentType<IconProps>;
    tone: string;
    title: string;
    body: string;
    preview?: ReactNode;
  }[] = [
    {
      icon: IconEye,
      tone: "bg-gl-warning-soft text-gl-warning",
      title: "Invisible on the diagram",
      body: "A load balancer with a WAF looks protected — until you notice the run.app URL that walks straight around it. None of the defects are obvious from a picture.",
      preview: bypass && <BypassPreview map={featured.map} bypass={bypass} />,
    },
    {
      icon: IconList,
      tone: "bg-gl-learn-bg text-gl-learn",
      title: "A list is not a plan",
      body: blocked
        ? `A register of ${featured.totals.defects} findings is a list. ${blocked.defect.id} alone waits on ${blocked.blockers.length} other fixes, so the order is the real argument.`
        : `A register of ${featured.totals.defects} findings is a list. Several cannot start until another is finished, so the order is the real argument.`,
      preview: blocked && <BlockedPreview blocked={blocked} />,
    },
    {
      icon: IconLock,
      tone: "bg-gl-danger-soft text-gl-danger",
      title: "The wrong order locks you out",
      body: "Delete the public SSH rule before the IAP path is verified, and nobody reaches production. Sequencing is part of the fix.",
      preview: riskiest && <RiskPreview riskiest={riskiest} />,
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <FadeIn>
        <SectionIntro
          title={
            <>
              Knowing the fix is the{" "}
              <span className="text-gl-primary">easy half</span>.
            </>
          }
          lead="Every defect started as a reasonable shortcut that nobody revisited. The hard part is seeing it — and knowing what has to happen first."
        />
      </FadeIn>
      <FadeIn delay={130}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {problems.map((p) => (
            <article key={p.title} className={cn(FEATURE_CARD, "p-5 sm:p-6")}>
              <div className="mb-[22px]">
                {p.preview ? (
                  <div
                    aria-hidden="true"
                    className="border-gl-border bg-gl-bg h-[168px] overflow-hidden rounded-xl border"
                  >
                    {p.preview}
                  </div>
                ) : (
                  <IconTile icon={p.icon} tone={p.tone} />
                )}
              </div>
              <h3 className="text-gl-text text-[20px] leading-[1.3] font-bold tracking-[-0.015em]">
                {p.title}
              </h3>
              <p className="text-gl-text-muted mt-2 text-[15px] leading-[1.6] text-pretty">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function BypassPreview({
  map,
  bypass,
}: {
  map: FeaturedTrack["map"];
  bypass: NonNullable<FeaturedTrack["bypass"]>;
}) {
  return (
    <div className="relative h-full">
      <ArchitectureDiagram
        model={map}
        phase={0}
        crop={bypass.crop}
        highlight={{
          lit: new Set(bypass.lit),
          failing: new Set(bypass.failing),
          order: new Map(),
          edges: new Set(bypass.edges),
        }}
        className="h-full min-w-0"
      />
      <span className="border-gl-danger/40 bg-gl-bg/90 text-gl-text absolute bottom-2.5 left-2.5 inline-flex max-w-[calc(100%-20px)] items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium">
        <span className="text-gl-danger font-mono text-[10px] font-bold">
          {bypass.defect.id}
        </span>
        <span className="truncate">{bypass.defect.title}</span>
      </span>
    </div>
  );
}

function BlockedPreview({
  blocked,
}: {
  blocked: NonNullable<FeaturedTrack["blocked"]>;
}) {
  const row = "grid grid-cols-[28px_8px_34px_minmax(0,1fr)] items-center gap-2";
  return (
    <ol className="flex h-full flex-col justify-center gap-2 px-4">
      {blocked.blockers.map((b) => (
        <li key={b.id} className={row}>
          <span className="text-gl-text-faint font-mono text-[10.5px]">
            P{b.phase}
          </span>
          <span className="bg-gl-primary size-1.5 rounded-full" />
          <span className="text-gl-text-muted font-mono text-[11px] font-semibold">
            {b.id}
          </span>
          <span className="text-gl-text-muted truncate text-[12px]">
            {b.title}
          </span>
        </li>
      ))}
      <li className={cn(row, "border-gl-border mt-1 border-t pt-2.5")}>
        <span className="text-gl-text-faint font-mono text-[10.5px]">
          P{blocked.defect.phase}
        </span>
        <span className="bg-gl-danger size-1.5 rounded-full" />
        <span className="text-gl-danger font-mono text-[11px] font-bold">
          {blocked.defect.id}
        </span>
        <span className="text-gl-text truncate text-[12px] font-semibold">
          {blocked.defect.title}
        </span>
      </li>
    </ol>
  );
}

function RiskPreview({
  riskiest,
}: {
  riskiest: NonNullable<FeaturedTrack["riskiest"]>;
}) {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 px-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-gl-text-muted truncate font-mono text-[11px] font-semibold">
          Phase {riskiest.number} · {riskiest.name}
        </span>
        <span className="bg-gl-danger-soft text-gl-danger shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-[0.1em] uppercase">
          High risk
        </span>
      </div>
      <p className={EYEBROW}>Verify before moving on</p>
      <p className="text-gl-text line-clamp-3 text-[12.5px] leading-[1.5]">
        {riskiest.verify}
      </p>
    </div>
  );
}

function InsideSection({ featured }: { featured: FeaturedTrack }) {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <FadeIn>
        <SectionIntro
          title={
            <>
              One platform, <span className="text-gl-primary">every angle</span>
              .
            </>
          }
          lead={`Each lab is a single fictional platform, explored ${featured.views.length} ways — from the whole map down to the command that closes each defect.`}
        />
      </FadeIn>
      <FadeIn delay={130}>
        <TrackTour
          views={featured.views}
          map={featured.map}
          journey={featured.journey}
          components={featured.components}
          chain={featured.chain}
          spotlight={featured.spotlight}
        />
      </FadeIn>
    </section>
  );
}

function HowItWorks({ featured }: { featured: FeaturedTrack }) {
  const { sample } = featured;
  const detection = sample.detection.split("\n").slice(0, 3).join("\n");
  const firstPhases = featured.phases.filter((p) => p.number > 0).slice(0, 3);

  const steps: {
    icon: ComponentType<IconProps>;
    tone: string;
    title: string;
    body: string;
    preview?: ReactNode;
  }[] = [
    {
      icon: IconSearch,
      tone: "bg-gl-primary-soft text-gl-primary",
      title: "Find it",
      body: "Every defect ships with the command that surfaces it, so you confirm the finding before changing anything.",
      preview: (
        <pre className="border-gl-border bg-gl-bg-subtle text-gl-text-muted overflow-hidden rounded-lg border p-3 text-left font-mono text-[10.5px] leading-[1.6] whitespace-pre">
          {detection}
        </pre>
      ),
    },
    {
      icon: IconSteps,
      tone: "bg-gl-warning-soft text-gl-warning",
      title: "Order it",
      body: "Defects block each other. The phase rail walks the platform through the sequence and shows what clears at each step.",
      preview: (
        <ul className="flex flex-col gap-2 text-left">
          {firstPhases.map((p, i) => (
            <li key={p.number} className="flex items-center gap-2.5">
              <span
                className={cn(
                  "h-1 rounded-full",
                  i < 2 ? "bg-gl-primary w-6" : "bg-gl-border w-3",
                )}
              />
              <span className="text-gl-text text-[12px] font-semibold">
                {p.name}
              </span>
              <span className="text-gl-text-faint ml-auto font-mono text-[11px]">
                +{p.closes}
              </span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      icon: IconWrench,
      tone: "bg-gl-learn-bg text-gl-learn",
      title: "Fix it",
      body: "Every register card pairs the finding with the before, the after and the change itself — and the map, journeys and badges update as it lands.",
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-24 py-12 sm:py-16 lg:py-20">
      <FadeIn>
        <SectionIntro
          title={
            <>
              Find it. Order it.{" "}
              <span className="text-gl-primary">Fix it.</span>
            </>
          }
          lead="The same loop for every defect, in the sequence the platform can survive."
        />
      </FadeIn>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <FadeIn delay={130}>
          <ol className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="border-gl-border bg-gl-surface shadow-gl flex gap-4 rounded-2xl border p-5 sm:p-6"
              >
                <IconTile icon={step.icon} tone={step.tone} small />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-gl-text text-[18px] leading-[1.25] font-bold tracking-[-0.018em]">
                      {step.title}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="text-gl-border font-mono text-[20px] leading-none font-bold"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-gl-text-muted mt-1.5 text-[14px] leading-[1.6] text-pretty">
                    {step.body}
                  </p>
                  {step.preview && (
                    <div aria-hidden="true" className="mt-4">
                      {step.preview}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </FadeIn>
        <FadeIn delay={260} className="lg:sticky lg:top-24">
          <SpotlightCard
            items={featured.spotlight}
            label={`${featured.lab} · ${featured.track}`}
          />
          <p className="text-gl-text-faint mt-3 text-center font-mono text-[11px]">
            from the defect register · most severe first
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

function LabsSection() {
  const labs = allLabs();
  return (
    <section id="labs" className="scroll-mt-24 py-12 sm:py-16 lg:py-20">
      <FadeIn>
        <SectionIntro
          title="Labs"
          lead="Each lab is one fictional platform with its own tracks. Pick one and start at phase 0."
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

function BottomCta({ featured }: { featured: FeaturedTrack }) {
  const lastPhase = featured.phases.at(-1)?.number ?? 0;

  return (
    <section className="py-12 sm:py-16 lg:pt-16 lg:pb-20">
      <FadeIn>
        <div className="border-gl-border bg-gl-surface relative overflow-hidden rounded-3xl border px-6 py-16 text-center sm:px-10 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-30"
            style={{ maskImage: CTA_MAP_MASK, WebkitMaskImage: CTA_MAP_MASK }}
          >
            <ArchitectureDiagram
              model={featured.map}
              phase={lastPhase}
              className="w-[115%] max-w-none min-w-[960px] shrink-0"
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background: `
                radial-gradient(55% 70% at 50% 0%, rgba(111, 200, 160, 0.13) 0%, transparent 70%),
                radial-gradient(40% 50% at 50% 100%, rgba(111, 200, 160, 0.07) 0%, transparent 70%)
              `,
            }}
          />
          <div className="relative z-10">
            <StatPills
              stats={featured.totals}
              size="lg"
              className="mb-8 justify-center"
            />
            <h2 className="text-gl-text mx-auto max-w-[700px] text-[38px] leading-[1.05] font-bold tracking-[-0.03em] text-balance sm:text-[48px] lg:text-[56px] lg:tracking-[-0.035em]">
              Walk it back to <span className="text-gl-primary">healthy</span>.
            </h2>
            <p className="text-gl-text-muted mx-auto mt-5 max-w-[520px] text-[17px] leading-[1.55] text-pretty">
              Start with every defect open, then close them one phase at a time
              until the last journey goes green.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink
                href={featured.href}
                size="lg"
                trailing={<IconArrow size={14} />}
              >
                Open {featured.lab}
              </ButtonLink>
              <ButtonLink
                href={featured.defectsHref}
                variant="secondary"
                size="lg"
              >
                Read the defect register
              </ButtonLink>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
