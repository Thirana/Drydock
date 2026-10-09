import { notFound } from "next/navigation";
import { ViewStrip } from "@/components/layout/view-strip";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { mainLinks, startLearning } from "@/lib/content/nav";
import { getTrack, labHref, viewHref } from "@/lib/content/registry";

/** Track shell: the rail, then the track's views as frames on a strip. */
export default async function TrackLayout({
  children,
  params,
}: LayoutProps<"/[provider]/[lab]/[track]">) {
  const { provider, lab, track } = await params;
  const ctx = getTrack(provider, lab, track);
  if (!ctx) notFound();

  const frames = ctx.track.views.map((v) => ({
    href: viewHref(ctx, v.slug),
    label: v.title,
  }));

  return (
    <div className="bg-ground text-ink flex min-h-screen flex-1 flex-col">
      <SiteHeader links={mainLinks()} cta={startLearning()} />
      <ViewStrip
        slate={{
          href: labHref(ctx),
          provider: ctx.provider.name,
          lab: ctx.lab.title,
          track: ctx.track.title,
        }}
        frames={frames}
      />
      {children}
      <SiteFooter />
    </div>
  );
}
