import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site/page-shell";
import { StatPills } from "@/components/site/stat-pills";
import { ButtonLink } from "@/components/ui/button";
import { ICONS, IconArrow, IconMap } from "@/components/ui/icons";
import { Eyebrow, SectionHeader } from "@/components/ui/typography";
import {
  allLabs,
  getLab,
  providerHref,
  trackHref,
  viewHref,
} from "@/lib/content/registry";
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

  return (
    <PageShell>
      <section className="pt-12 pb-12 sm:pt-16">
        <Link
          href={providerHref(ctx.provider)}
          className="text-gl-text-muted hover:text-gl-text text-[11px] font-bold tracking-[0.12em] uppercase transition-colors"
        >
          {ctx.provider.name} · Lab
        </Link>
        <h1 className="text-gl-text mt-3 text-[36px] leading-[1.08] font-bold tracking-[-0.025em] text-balance sm:text-[44px] sm:tracking-[-0.028em]">
          {ctx.lab.title}
        </h1>
        <p className="text-gl-text-muted mt-4 max-w-[640px] text-[17px] leading-[1.55] text-pretty">
          {ctx.lab.summary}
        </p>
        {stats && <StatPills stats={stats} size="lg" className="mt-7" />}
      </section>

      <section className="pb-16 sm:pb-20">
        <SectionHeader>Tracks</SectionHeader>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {ctx.lab.tracks.map((track) => {
            const trackCtx = { ...ctx, track };
            const trackStat = trackStats(track);
            return (
              <article
                key={track.slug}
                className="border-gl-border bg-gl-surface shadow-gl flex flex-col rounded-2xl border p-7"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    aria-hidden="true"
                    className="bg-gl-primary-soft text-gl-primary inline-flex size-11 items-center justify-center rounded-md"
                  >
                    <IconMap size={22} />
                  </span>
                  <div>
                    <Eyebrow faint>Track</Eyebrow>
                    <h2 className="text-gl-text mt-0.5 text-[20px] leading-[1.3] font-bold tracking-[-0.015em]">
                      {track.title}
                    </h2>
                  </div>
                </div>
                <p className="text-gl-text-muted mt-4 text-[14.5px] leading-[1.6] text-pretty">
                  {track.summary}
                </p>
                {trackStat && <StatPills stats={trackStat} className="mt-5" />}
                <div className="border-gl-border mt-6 border-t pt-5">
                  <Eyebrow faint className="mb-3">
                    Inside
                  </Eyebrow>
                  <ul className="flex flex-wrap gap-2">
                    {track.views.map((view) => {
                      const Icon = view.icon ? ICONS[view.icon] : null;
                      return (
                        <li key={view.slug}>
                          <Link
                            href={viewHref(trackCtx, view.slug)}
                            className="border-gl-border bg-gl-surface-2 text-gl-text-muted hover:text-gl-text hover:border-gl-border-input inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors"
                          >
                            {Icon && <Icon size={14} />}
                            {view.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="mt-7">
                  <ButtonLink
                    href={trackHref(trackCtx)}
                    trailing={<IconArrow size={13} />}
                  >
                    Open track
                  </ButtonLink>
                </div>
              </article>
            );
          })}
        </div>
        {ctx.lab.disclaimer && (
          <p className="border-gl-primary text-gl-text-muted mt-10 border-l-2 pl-4 text-[14px] leading-[1.7]">
            {ctx.lab.disclaimer}
          </p>
        )}
      </section>
    </PageShell>
  );
}
