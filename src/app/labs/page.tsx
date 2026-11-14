import type { Metadata } from "next";
import Link from "next/link";
import { DiagramDefs } from "@/components/learn/diagram-defs";
import { DefectRoute } from "@/components/site/defect-route";
import { HarbourPhases } from "@/components/site/landing/harbour-phases";
import { LabList } from "@/components/site/lab-list";
import { PageShell } from "@/components/site/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { IconArrow } from "@/components/ui/icons";
import { getFeaturedTrack } from "@/lib/content/featured";
import { courseHref, courses } from "@/lib/content/learn";
import { allLabs } from "@/lib/content/registry";

const LEAD =
  "Deliberately broken cloud architectures, and how to fix them step by step. Each lab is one fictional platform, and every track opens as found.";

export const metadata: Metadata = { title: "Labs", description: LEAD };

export default function LabsPage() {
  const gcp = courses.find((c) => c.slug === "gcp");
  const featured = getFeaturedTrack();

  return (
    <PageShell>
      <DiagramDefs />
      <section className="pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20">
        <div className="grid items-center gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h1 className="dd-head animate-rise text-ink text-[52px] sm:text-[64px] lg:text-[76px]">
              Labs
            </h1>
            <p className="text-ink-body mt-5 max-w-[46ch] text-[19px] leading-[1.5] text-pretty sm:text-[20px]">
              {LEAD}
            </p>
            {gcp && (
              <p className="text-ink-muted mt-3 max-w-[52ch] text-[16px] leading-[1.55]">
                New to this? Every defect links to the chapter that teaches it,
                in{" "}
                <Link href={courseHref(gcp)} className="dd-link">
                  {gcp.title}
                </Link>
                .
              </p>
            )}
            {featured && (
              <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
                <ButtonLink
                  href={featured.labHref}
                  size="lg"
                  trailing={<IconArrow size={14} />}
                >
                  Open {featured.lab}
                </ButtonLink>
                <ButtonLink
                  href={featured.defectsHref}
                  variant="ghost"
                  size="lg"
                >
                  Read the defect register
                </ButtonLink>
              </div>
            )}
          </div>
          {featured && (
            <figure className="hidden min-w-0 md:block lg:col-span-7 lg:w-full lg:max-w-[600px] lg:justify-self-end">
              <HarbourPhases
                phases={featured.phases.map(({ number, name }) => ({
                  number,
                  name,
                }))}
                trims={featured.trims.map(({ id, phase }) => ({ id, phase }))}
              />
              <figcaption className="text-ink-muted mt-3 max-w-[60ch] text-[15px] leading-[1.5] text-pretty">
                {featured.lab}’s front door, phase by phase. The lab draws the
                whole platform; step through to see which defects each phase
                closes.
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      {featured && (
        <section
          aria-labelledby="order-title"
          className="border-rule border-t py-16 sm:py-20"
        >
          <FadeIn className="mb-12 max-w-[720px]">
            <h2
              id="order-title"
              className="dd-head text-ink text-[28px] sm:text-[32px]"
            >
              {featured.totals.defects} defects, in the order they close.
            </h2>
            <p className="text-ink-body mt-4 text-[18px] leading-[1.6] text-pretty sm:text-[19px]">
              Knowing each fix is the easy half. The fixes block each other, so{" "}
              {featured.lab} closes them in {featured.phases.length - 1} phases,
              and “after” names what has to close first.
            </p>
          </FadeIn>
          <FadeIn delay={130}>
            <DefectRoute
              phases={featured.phases}
              trims={featured.trims}
              defectsHref={featured.defectsHref}
            />
          </FadeIn>
        </section>
      )}

      <section
        aria-labelledby="all-labs-title"
        className="border-rule border-t pt-16 pb-20 sm:pt-20 sm:pb-24"
      >
        <h2
          id="all-labs-title"
          className="dd-head text-ink mb-8 text-[28px] sm:text-[32px]"
        >
          All labs
        </h2>
        <LabList labs={allLabs()} showProvider />
      </section>
    </PageShell>
  );
}
