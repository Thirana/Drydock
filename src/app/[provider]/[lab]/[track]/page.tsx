import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackView } from "@/components/layout/track-view";
import { allTracks, getTrack } from "@/lib/content/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return allTracks().map(({ provider, lab, track }) => ({
    provider: provider.slug,
    lab: lab.slug,
    track: track.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[provider]/[lab]/[track]">): Promise<Metadata> {
  const { provider, lab, track } = await params;
  const ctx = getTrack(provider, lab, track);
  return ctx
    ? { title: ctx.track.heading, description: ctx.track.summary }
    : {};
}

/** A track's index page renders its first view. */
export default async function TrackIndexPage({
  params,
}: PageProps<"/[provider]/[lab]/[track]">) {
  const { provider, lab, track } = await params;
  const ctx = getTrack(provider, lab, track);
  if (!ctx) notFound();
  return <TrackView ctx={ctx} view={ctx.track.views[0]} />;
}
