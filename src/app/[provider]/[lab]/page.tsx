import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram";
import { DiagramFrame } from "@/components/architecture/diagram-frame";
import { ViewGuide, ViewGuideItem } from "@/components/layout/view-guide";
import { HarbourWalkthrough } from "@/components/site/harbour-walkthrough";
import { PageShell } from "@/components/site/page-shell";
import { StatPills } from "@/components/site/stat-pills";
import { ButtonLink } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { IconArrow } from "@/components/ui/icons";
import {
  allLabs,
  getLab,
  labHref,
  providerHref,
  trackHref,
  viewHref,
} from "@/lib/content/registry";
import { getFeaturedTrack } from "@/lib/content/featured";
import { labStats, trackStats } from "@/lib/content/stats";

export const dynamicParams = false;

export function generateStaticParams() {
  return allLabs().map(({ provider, lab }) => ({
    provider: provider.slug,
    lab: lab.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[provider]/[lab]">): Promise<Metadata> {
  const { provider, lab } = await params;
  const ctx = getLab(provider, lab);
  return ctx ? { title: ctx.lab.title, description: ctx.lab.summary } : {};
}

export default async function LabPage({
  params,
}: PageProps<"/[provider]/[lab]">) {
  const { provider, lab } = await params;
  const ctx = getLab(provider, lab);
  if (!ctx) notFound();
  const stats = labStats(ctx.lab);
  const first = ctx.lab.tracks[0];
  const firstCtx = first && { ...ctx, track: first };
  const register =
    firstCtx && first.views.some((v) => v.slug === "defects")
      ? viewHref(firstCtx, "defects")
      : undefined;
  const showcase = ctx.lab.tracks.find((t) => t.architecture);
  const featured = getFeaturedTrack();
  const walkthrough = featured?.labHref === labHref(ctx) ? featured : undefined;

  return (
    <PageShell>
      <section className="pt-12 pb-14 sm:pt-16 lg:pt-20">
        <nav aria-label="Breadcrumb" className="text-[15px]">
          <Link
            href={providerHref(ctx.provider)}
            className="text-ink-muted hover:text-ink inline-flex min-h-11 items-center underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:decoration-accent"
          >
            {ctx.provider.name}
          </Link>
          <span aria-hidden="true" className="text-ink-faint mx-2">
            /
          </span>
          <span aria-current="page" className="text-ink">
            {ctx.lab.title}
          </span>
        </nav>
        <div className="mt-2 grid gap-x-12 gap-y-8 lg:grid-cols-12 lg:items-end">
          <h1 className="dd-head animate-rise text-ink text-[52px] sm:text-[64px] lg:col-span-6 lg:text-[76px]">
            {ctx.lab.title}
          </h1>
          <div className="lg:col-span-6 lg:pb-4">
            <p className="text-ink-body max-w-[46ch] text-[20px] leading-[1.5] text-pretty">
              {ctx.lab.summary}
              {ctx.lab.disclaimer && (
                <span className="text-ink font-semibold">
                  {" "}
                  {ctx.lab.disclaimer}
                </span>
              )}
            </p>
            {firstCtx && (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <ButtonLink
                  href={trackHref(firstCtx)}
                  size="lg"
                  trailing={<IconArrow size={14} />}
                >
                  Open {ctx.lab.title}
                </ButtonLink>
                {register && (
                  <ButtonLink href={register} variant="secondary" size="lg">
                    Read the defect register
                  </ButtonLink>
                )}
              </div>
            )}
          </div>
        </div>

        {stats && (
          <StatPills
            stats={stats}
            size="lg"
            className="border-rule mt-12 border-t pt-4"
          />
        )}

        {showcase?.architecture && (
          <div className="animate-rise animation-delay-300 mt-14">
            <DiagramFrame
              title={`${ctx.lab.title} · ${showcase.title}`}
              meta="Phase 0 · As found"
            >
              <ArchitectureDiagram
                model={showcase.architecture}
                phase={0}
                className="min-w-[720px] lg:min-w-0"
              />
            </DiagramFrame>
          </div>
        )}
      </section>

      {walkthrough && <HarbourWalkthrough featured={walkthrough} />}

      <section aria-labelledby="tracks-title" className="py-16 sm:py-20">
        <FadeIn className="mb-10">
          <div className="border-rule border-t pt-10">
            <h2
              id="tracks-title"
              className="dd-head text-ink text-[28px] sm:text-[32px]"
            >
              Inside {ctx.lab.title}
            </h2>
            <p className="text-ink-body mt-2 text-[18px] leading-[1.55]">
              Every track starts at phase 0, as found.
            </p>
          </div>
        </FadeIn>

        <div className="flex flex-col gap-16">
          {ctx.lab.tracks.map((track) => {
            const trackCtx = { ...ctx, track };
            const trackStat =
              ctx.lab.tracks.length > 1 ? trackStats(track) : undefined;
            return (
              <FadeIn key={track.slug} delay={130}>
                <article className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
                  <div className="flex flex-col lg:col-span-4">
                    <h3 className="dd-head text-ink text-[30px]">
                      {track.title}
                    </h3>
                    <p className="text-ink-body mt-4 text-[17px] leading-[1.6] text-pretty">
                      {track.summary}
                    </p>
                    <dl className="border-rule divide-rule mt-7 divide-y border-t">
                      {track.meta.map((m) => (
                        <div
                          key={m.label}
                          className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 py-3 text-[15px] leading-[1.5]"
                        >
                          <dt className="text-ink-muted">{m.label}</dt>
                          <dd className="text-ink min-w-0">{m.value}</dd>
                        </div>
                      ))}
                    </dl>
                    {trackStat && (
                      <StatPills stats={trackStat} className="mt-5" />
                    )}
                    {ctx.lab.tracks.length > 1 && (
                      <div className="mt-7 lg:mt-auto lg:pt-7">
                        <ButtonLink
                          href={trackHref(trackCtx)}
                          trailing={<IconArrow size={13} />}
                        >
                          Open the {track.title.toLowerCase()} track
                        </ButtonLink>
                      </div>
                    )}
                  </div>
                  <ViewGuide className="my-0 lg:col-span-8">
                    {track.views.map((view, i) => (
                      <ViewGuideItem
                        key={view.slug}
                        href={viewHref(trackCtx, view.slug)}
                        title={view.title}
                        frame={i + 1}
                      >
                        {view.description}
                      </ViewGuideItem>
                    ))}
                  </ViewGuide>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
