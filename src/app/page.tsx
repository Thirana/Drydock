import Link from "next/link";
import type { ReactNode } from "react";
import { CourseParts, LearningPath } from "@/components/learn/path";
import { SameNet } from "@/components/learn/widgets/same-net";
import { HeroMap } from "@/components/site/landing/hero-map";
import { PageShell } from "@/components/site/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { IconArrow, IconArrowRight } from "@/components/ui/icons";
import type { FeaturedTrack } from "@/lib/content/featured";
import { getFeaturedTrack } from "@/lib/content/featured";
import {
  chapterByNum,
  chapterHref,
  courseHref,
  getCourse,
} from "@/lib/content/learn";

/** The About section where the standard advice gets argued with. */
const PUSH_BACK_ANCHOR = "where-i-would-push-back-on-the-textbook-answer";

export default function HomePage() {
  const featured = getFeaturedTrack();

  return (
    <PageShell>
      <Hero />
      <Taste />
      <Courses />
      {featured && <Harbour featured={featured} />}
    </PageShell>
  );
}

function Hero() {
  const first = chapterByNum("fundamentals", "1");
  const gcp = getCourse("gcp");

  return (
    <section className="pt-16 pb-16 sm:pt-24 sm:pb-20">
      <h1 className="dd-head animate-rise text-ink max-w-[1080px] text-[48px] leading-[1.02] text-balance sm:text-[64px] lg:text-[76px]">
        Learn how networks work.
        <br />
        Then fix one that doesn’t.
      </h1>
      <p className="text-ink-body mt-6 max-w-[46ch] text-[20px] leading-[1.5] text-pretty sm:text-[22px]">
        Two courses and a lab, in order. Follow one request from a laptop to a
        server, see how Google Cloud does the same job, then fix a platform I
        built wrong on purpose. Free, with no sign-up.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
        {first && (
          <ButtonLink
            href={chapterHref(first)}
            size="lg"
            trailing={<IconArrow size={14} />}
          >
            Start with chapter 1
          </ButtonLink>
        )}
        {gcp && (
          <ButtonLink href={courseHref(gcp)} variant="ghost" size="lg">
            Jump to GCP
          </ButtonLink>
        )}
      </div>

      <LearningPath className="animate-rise animation-delay-300 mt-16 sm:mt-20" />
    </section>
  );
}

/** A section opener: the claim, then the lead. */
function Intro({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <h2 id={id} className="dd-head text-ink text-[28px] sm:text-[32px]">
        {title}
      </h2>
      <div className="text-ink-body mt-4 space-y-3 text-[18px] leading-[1.6] text-pretty sm:text-[19px]">
        {children}
      </div>
    </>
  );
}

/** One real widget, running, so the first visit shows what a chapter feels like. */
function Taste() {
  const ch = chapterByNum("fundamentals", "4");
  if (!ch) return null;

  return (
    <section
      aria-labelledby="taste-title"
      className="border-rule border-t py-16 sm:py-20"
    >
      <div className="grid items-start gap-x-12 gap-y-4 lg:grid-cols-12">
        <FadeIn className="lg:col-span-5">
          <Intro id="taste-title" title="Most chapters have something to try.">
            <p>
              This one is from chapter {ch.chapter.num}, {ch.chapter.title}.
              kade-api at 10.10.1.10/24 wants to reach kade-db at 10.10.2.5. AND
              each address with the mask: if the networks match, the packet goes
              straight across; if not, it goes to the gateway.
            </p>
            <p>Change any of the three values.</p>
          </Intro>
          <ButtonLink
            href={chapterHref(ch)}
            variant="ghost"
            className="mt-4"
            trailing={<IconArrowRight size={12} />}
          >
            Read {ch.chapter.num}. {ch.chapter.title}
          </ButtonLink>
        </FadeIn>
        <FadeIn delay={130} className="min-w-0 lg:col-span-7">
          <SameNet a="10.10.1.10" b="10.10.2.5" prefix="24" />
        </FadeIn>
      </div>
    </section>
  );
}

function Courses() {
  return (
    <section
      aria-labelledby="courses-title"
      className="border-rule border-t py-16 sm:py-20"
    >
      <FadeIn className="mb-12 max-w-[720px]">
        <Intro
          id="courses-title"
          title="One small company, from the first packet to the cloud."
        >
          <p>
            Both courses follow Kadé, an online grocery shop in Colombo, and you
            are its backend engineer. The fundamentals assume no networking
            background. The GCP course opens Kadé’s Google Cloud project and
            shows how its network really works.
          </p>
        </Intro>
      </FadeIn>
      <FadeIn delay={130}>
        <CourseParts />
      </FadeIn>
    </section>
  );
}

/** The lab, condensed: the score, and one defect's three steps pointing into the lab page. */
function Harbour({ featured }: { featured: FeaturedTrack }) {
  const d = featured.followed.defect;
  const { blockers } = featured.followed;
  const steps = [
    {
      title: "Find it with a real command",
      body: d.symptom,
      href: `${featured.labHref}#follow`,
    },
    {
      title: "Put it in order",
      body: `${d.id} closes in phase ${d.phase}, ${d.phaseName}${
        blockers.length ? `, after ${blockers.map((b) => b.id).join(", ")}` : ""
      }.`,
      href: `${featured.labHref}#follow`,
    },
    {
      title: "Make the change that closes it",
      body: "The before, the after, and the command that gets you there.",
      href: `${featured.defectsHref}#${d.id}`,
    },
  ];

  return (
    <section
      id="harbour"
      aria-labelledby="harbour-title"
      className="border-rule scroll-mt-8 border-t py-16 sm:py-20"
    >
      <FadeIn className="mb-12 max-w-[720px]">
        <Intro id="harbour-title" title={`Then prove it on ${featured.lab}.`}>
          <p>
            {featured.lab} is a marketplace platform on Google Cloud with{" "}
            {featured.totals.defects} defects planted on purpose. Knowing each
            fix is the easy half: the fixes block each other, so the order is
            the argument. Move 0 is as found, and every phase closes a few more.
          </p>
        </Intro>
        <p className="text-ink-muted mt-4 max-w-[60ch] text-[17px] leading-[1.55] text-pretty">
          I’m Thirana. I broke {featured.lab} on purpose, and{" "}
          <Link
            href={`${featured.href}#${PUSH_BACK_ANCHOR}`}
            className="dd-link"
          >
            in a few places I’d argue with the textbook fix
          </Link>
          .
        </p>
      </FadeIn>

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

      <FadeIn className="mt-16 max-w-[860px]">
        <h3 className="text-ink text-[22px] leading-[1.3] font-bold">
          <span className="text-fault font-mono">{d.id}</span>, followed from
          finding to fix
        </h3>
        <ol className="border-rule mt-5 border-t">
          {steps.map((s, i) => (
            <li key={s.title} className="border-rule border-b">
              <Link
                href={s.href}
                className="group grid grid-cols-[40px_minmax(0,1fr)] items-baseline gap-x-2 py-5"
              >
                <span className="text-ink-faint group-hover:text-accent font-mono text-[16px] font-bold transition-colors">
                  {i + 1}.
                </span>
                <span>
                  <span className="text-accent decoration-accent/40 text-[19px] font-bold underline decoration-[1.5px] underline-offset-4 transition-colors group-hover:decoration-current">
                    {s.title}
                  </span>
                  <span className="text-ink-body mt-1 block max-w-[64ch] text-[16.5px] leading-[1.55] text-pretty">
                    {s.body}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
          <ButtonLink
            href={featured.labHref}
            variant="secondary"
            size="lg"
            trailing={<IconArrow size={14} />}
          >
            Open {featured.lab}
          </ButtonLink>
          <ButtonLink href={featured.defectsHref} variant="ghost" size="lg">
            Read the defect register
          </ButtonLink>
        </div>
      </FadeIn>
    </section>
  );
}
