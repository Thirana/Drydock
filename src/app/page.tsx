import Link from "next/link";
import type { ReactNode } from "react";
import { CourseParts, LearningPath } from "@/components/learn/path";
import { FigMap } from "@content/learn/fundamentals/figures/00-the-kade-scenario";
import { FigTarget, FigToday } from "@content/learn/gcp/figures/00-kade-on-gcp";
import { DiagramDefs } from "@/components/learn/diagram-defs";
import { Figure } from "@/components/learn/figure";
import { MapSwitch, type MapView } from "@/components/site/landing/map-switch";
import { HarbourFollow } from "@/components/site/landing/harbour-follow";
import { RequestDrawing } from "@/components/site/landing/request-drawing";
import { TryStage, type TryMove } from "@/components/site/landing/try-stage";
import { PageShell } from "@/components/site/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { IconArrow } from "@/components/ui/icons";
import type { FeaturedTrack } from "@/lib/content/featured";
import { getFeaturedTrack } from "@/lib/content/featured";
import {
  chapterByNum,
  chapterHref,
  courseHref,
  getCourse,
} from "@/lib/content/learn";

/** Distinct interactive figures across both courses. */
const WIDGETS = 158;

/** The About section where the standard advice gets argued with. */
const PUSH_BACK_ANCHOR = "where-i-would-push-back-on-the-textbook-answer";

export default function HomePage() {
  const featured = getFeaturedTrack();

  return (
    <PageShell>
      <Hero />
      <Try />
      <Path />
      <Courses />
      {featured && <Harbour featured={featured} />}
    </PageShell>
  );
}

function Hero() {
  const first = chapterByNum("fundamentals", "1");
  const gcp = getCourse("gcp");

  return (
    <section className="pt-12 pb-16 sm:pt-20 sm:pb-24">
      <DiagramDefs />
      <div className="grid items-center gap-x-12 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="dd-head animate-rise text-ink text-[40px] leading-[1.04] text-balance sm:text-[48px] xl:text-[54px]">
            Learn how networks work. Then fix one that doesn’t.
          </h1>
          <p className="text-ink-body mt-6 max-w-[44ch] text-[19px] leading-[1.5] text-pretty sm:text-[20px]">
            Two courses and a lab, in order. Follow one request from a laptop to
            a server, see how Google Cloud does the same job, then fix a
            platform I built wrong on purpose. Free, with no sign-up.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
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
        </div>
        <RequestDrawing className="min-w-0 lg:col-span-7 lg:w-full lg:max-w-[600px] lg:justify-self-end" />
      </div>
    </section>
  );
}

/** Five real figures from the chapters, in the order a request meets them. */
function Try() {
  const from = (course: string, num: string, cta = "Read the chapter") => {
    const ch = chapterByNum(course, num);
    return ch
      ? {
          label: `Taught in ${course === "gcp" ? "GCP " : ""}chapter ${ch.chapter.num}, ${ch.chapter.title}`,
          cta,
          href: chapterHref(ch),
        }
      : undefined;
  };
  const drafts: (Omit<TryMove, "source"> & { source?: TryMove["source"] })[] = [
    {
      key: "dns",
      name: "Resolve a name",
      title: "Where is api.kade.lk?",
      prompt:
        "Before anything is sent, the laptop needs an address. Look the name up, look again a minute later, then once the answer's 300 s TTL has run out.",
      source: from("fundamentals", "22"),
    },
    {
      key: "nat",
      name: "Leave home",
      title: "How does a private address reach the internet?",
      prompt:
        "192.168.1.23 means nothing outside your home. Watch the router rewrite the packet on the way out, and undo it on the way back.",
      source: from("fundamentals", "10"),
    },
    {
      key: "lb",
      name: "Cross the load balancer",
      title: "Which VM gets the request?",
      prompt:
        "The load balancer only sends traffic to VMs that pass its health check. Fail one, then block the probes the way a firewall clean-up once did.",
      source: from("gcp", "12.1"),
    },
    {
      key: "firewall",
      name: "Pass the firewall",
      title: "Will the firewall let it in?",
      prompt:
        "Every packet that reaches kade-api-1 is checked against the VPC's firewall rules. Pick who is knocking, and on which port.",
      source: from("gcp", "5.1"),
    },
    {
      key: "same-net",
      name: "Reach the database",
      title: "Is kade-db on the same network?",
      prompt:
        "kade-api at 10.10.1.10/24 wants to reach kade-db at 10.10.2.5. AND each address with the mask: if the networks match, the packet goes straight across; if not, it goes to the gateway. Change any of the three values.",
      source: from("fundamentals", "4"),
    },
  ];
  const moves = drafts.filter((m): m is TryMove => Boolean(m.source));

  return (
    <section
      aria-labelledby="try-title"
      className="border-rule border-t py-16 sm:py-20"
    >
      <FadeIn className="mb-10 max-w-[720px]">
        <Intro id="try-title" title="Try five steps of that request.">
          <p>
            You learn it by trying it. The two courses hold {WIDGETS} figures
            you can change by hand. Here are five small ones, one for each step
            Kadé’s request takes, in order. Each chapter goes much further.
          </p>
        </Intro>
      </FadeIn>
      <TryStage moves={moves} />
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

/** The whole guide as three moves. */
function Path() {
  return (
    <section
      aria-labelledby="path-title"
      className="border-rule border-t py-16 sm:py-20"
    >
      <FadeIn className="max-w-[720px]">
        <Intro id="path-title" title="Three stages, in this order.">
          <p>
            The courses teach and the lab tests. Each stage uses what the one
            before it taught, and the lab’s defects link back to the chapter
            that explains them.
          </p>
        </Intro>
      </FadeIn>
      <FadeIn delay={130}>
        <LearningPath className="mt-10" />
      </FadeIn>
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
        <KadeMaps />
      </FadeIn>
      <FadeIn className="mt-16">
        <CourseParts />
      </FadeIn>
    </section>
  );
}

/** Kadé's map at three points in the courses: the drawings chapter 0 of each course opens with. */
function KadeMaps() {
  const fundamentals = getCourse("fundamentals");
  const gcp = getCourse("gcp");
  const f0 = chapterByNum("fundamentals", "0");
  const g0 = chapterByNum("gcp", "0");
  if (!fundamentals || !gcp || !f0 || !g0) return null;

  const views: MapView[] = [
    {
      value: "whole",
      label: "Whole map",
      source: { label: "Fundamentals chapter 0", href: chapterHref(f0) },
      figure: (
        <Figure
          wide
          hues={["plum", "teal", "green"]}
          legend={fundamentals.legend}
          drawing={<FigMap />}
        >
          <p>
            Solid boxes exist today. Dashed boxes join the map when a chapter
            needs them.
          </p>
        </Figure>
      ),
    },
    {
      value: "today",
      label: "Cloud today",
      source: { label: "GCP chapter 0", href: chapterHref(g0) },
      figure: (
        <Figure
          wide
          hues={["plum", "teal", "green"]}
          legend={gcp.legend}
          drawing={<FigToday />}
        >
          <p>
            Traffic from shoppers takes the right path: DNS, then the load
            balancer, then kade-api on port 8080. Everything around that path is
            either too open or missing. Solid lines work today; red dashed lines
            are problems.
          </p>
        </Figure>
      ),
    },
    {
      value: "target",
      label: "Cloud at the end",
      source: { label: "GCP chapter 0", href: chapterHref(g0) },
      figure: (
        <Figure
          wide
          hues={["plum", "teal", "green", "amber"]}
          legend={gcp.legend}
          drawing={<FigTarget />}
        >
          <p>
            Shoppers now reach Kadé only through Cloudflare and the load
            balancer. Nothing in kade-vpc has an external IP. Admin access goes
            through IAP, outgoing calls through Cloud NAT, and the database is
            reachable only on a private IP.
          </p>
        </Figure>
      ),
    },
  ];
  return <MapSwitch views={views} />;
}

/** The lab, condensed: one defect followed from finding to fix, in the same frame as the five steps. */
function Harbour({ featured }: { featured: FeaturedTrack }) {
  const d = featured.followed.defect;
  const { blockers } = featured.followed;
  const alongside = featured.trims
    .filter((t) => t.phase === d.phase && t.id !== d.id)
    .map((t) => t.id);
  const order = `${d.id} closes in phase ${d.phase}, ${d.phaseName}${
    alongside.length ? `, together with ${alongside.join(", ")}` : ""
  }. ${
    blockers.length
      ? `${blockers.map((b) => b.id).join(", ")} has to close first.`
      : "Nothing has to close before it."
  }`;

  return (
    <section
      id="harbour"
      aria-labelledby="harbour-title"
      className="border-rule scroll-mt-8 border-t py-16 sm:py-20"
    >
      <div className="grid items-start gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <FadeIn>
          <h2
            id="harbour-title"
            className="dd-head text-ink text-[28px] sm:text-[32px]"
          >
            Then prove it on {featured.lab}.
          </h2>
          <p className="text-ink-body mt-4 text-[18px] leading-[1.6] text-pretty">
            {featured.lab} is a marketplace platform on Google Cloud with{" "}
            {featured.totals.defects} defects planted on purpose. Knowing each
            fix is the easy half: the fixes block each other, so the order is
            the argument.
          </p>
          <p className="text-ink-body mt-3 text-[18px] leading-[1.6] text-pretty">
            Here is one of them, {d.id}, followed the way the lab follows all{" "}
            {featured.totals.defects}.
          </p>
          <p className="text-ink-muted mt-5 text-[16px] leading-[1.55] text-pretty">
            I’m Thirana. I broke {featured.lab} on purpose, and{" "}
            <Link
              href={`${featured.href}#${PUSH_BACK_ANCHOR}`}
              className="dd-link"
            >
              in a few places I’d argue with the textbook fix
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <ButtonLink
              href={featured.labHref}
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
        <FadeIn delay={130} className="min-w-0 [&_figure]:my-0">
          <HarbourFollow
            defect={d}
            order={order}
            phases={featured.phases.map(({ number, name }) => ({
              number,
              name,
            }))}
          />
        </FadeIn>
      </div>
    </section>
  );
}
