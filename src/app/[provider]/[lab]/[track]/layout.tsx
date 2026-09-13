import Link from "next/link";
import { notFound } from "next/navigation";
import { TrackNav } from "@/components/layout/track-nav";
import { LogoLockup } from "@/components/ui/logo";
import { Eyebrow } from "@/components/ui/typography";
import { getTrack, labHref, trackHref, viewHref } from "@/lib/content/registry";
import { trackStats } from "@/lib/content/stats";
import { cn } from "@/lib/utils";

/** App shell: sidebar on lg+, sticky header with pill nav below. */
export default async function TrackLayout({
  children,
  params,
}: LayoutProps<"/[provider]/[lab]/[track]">) {
  const { provider, lab, track } = await params;
  const ctx = getTrack(provider, lab, track);
  if (!ctx) notFound();

  const nav = ctx.track.views.map((v) => ({
    href: viewHref(ctx, v.slug),
    label: v.title,
    icon: v.icon,
  }));

  return (
    <div className="bg-gl-bg text-gl-text flex min-h-screen flex-1">
      <aside className="no-scrollbar border-gl-border bg-gl-bg-subtle sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col overflow-y-auto border-r px-4 py-[22px] lg:flex">
        <LogoLockup
          size={20}
          className="mb-6 px-2 py-1"
          textClassName="text-[15px]"
        />

        <Link
          href={labHref(ctx)}
          className="border-gl-border bg-gl-surface hover:bg-gl-surface-2 mb-5 block rounded-xl border px-3.5 py-3 transition-colors"
        >
          <Eyebrow faint>{ctx.provider.name} · Lab</Eyebrow>
          <p className="text-gl-text mt-1 text-[14px] font-bold tracking-[-0.015em]">
            {ctx.lab.title}
          </p>
          <p className="text-gl-text-muted text-[12px]">
            {ctx.track.title} track
          </p>
        </Link>

        <TrackNav items={nav} variant="sidebar" />

        <div className="mt-6">
          <Eyebrow faint className="mb-2.5 px-2.5">
            Tracks
          </Eyebrow>
          <ul className="flex flex-col gap-0.5">
            {ctx.lab.tracks.map((t) => {
              const active = t.slug === ctx.track.slug;
              return (
                <li key={t.slug}>
                  <Link
                    href={trackHref({ ...ctx, track: t })}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] transition-colors",
                      active
                        ? "text-gl-text"
                        : "text-gl-text-muted hover:text-gl-text",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2 rounded-full",
                        active ? "bg-gl-primary" : "bg-gl-text-faint",
                      )}
                    />
                    <span className="flex-1 truncate">{t.title}</span>
                    <span className="text-gl-text-faint font-mono text-[11px]">
                      {trackStats(t)?.defects ?? ""}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {ctx.lab.disclaimer && (
          <p className="border-gl-border text-gl-text-faint mt-auto border-t px-2 pt-3 text-[11.5px] leading-snug">
            {ctx.lab.disclaimer}
          </p>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-gl-border bg-gl-bg/80 sticky top-0 z-50 border-b backdrop-blur-2xl lg:hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <LogoLockup size={20} textClassName="text-[15px]" />
            <Link
              href={labHref(ctx)}
              className="text-gl-text-muted hover:text-gl-text truncate text-[12.5px] font-medium"
            >
              {ctx.lab.title} · {ctx.track.title}
            </Link>
          </div>
          <TrackNav items={nav} variant="pills" />
        </div>
        {children}
      </div>
    </div>
  );
}
