import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackView } from "@/components/layout/track-view";
import { allTracks, getTrack } from "@/lib/content/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return allTracks().flatMap(({ provider, lab, track }) =>
    // The first view is served at the track URL, so it gets no route of its own.
    track.views.slice(1).map((view) => ({
      provider: provider.slug,
      lab: lab.slug,
      track: track.slug,
      view: view.slug,
    })),
  );
}

async function resolve(
  params: PageProps<"/[provider]/[lab]/[track]/[view]">["params"],
) {
  const { provider, lab, track, view } = await params;
  const ctx = getTrack(provider, lab, track);
  const match = ctx?.track.views.slice(1).find((v) => v.slug === view);
  return ctx && match ? { ctx, view: match } : undefined;
}

export async function generateMetadata({
  params,
}: PageProps<"/[provider]/[lab]/[track]/[view]">): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};
  const { ctx, view } = resolved;
  return {
    title: `${view.title} · ${ctx.lab.title} ${ctx.track.title}`,
    description: view.description,
  };
}

export default async function TrackViewPage({
  params,
}: PageProps<"/[provider]/[lab]/[track]/[view]">) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  return <TrackView ctx={resolved.ctx} view={resolved.view} />;
}
