import { providers } from "@content/index";
import type { Lab, Provider, Track } from "./types";

export { providers };

export interface LabContext {
  provider: Provider;
  lab: Lab;
}

export interface TrackContext extends LabContext {
  track: Track;
}

function assertUniqueSlugs(where: string, items: { slug: string }[]) {
  const seen = new Set<string>();
  for (const { slug } of items) {
    if (seen.has(slug)) throw new Error(`Duplicate slug "${slug}" in ${where}`);
    seen.add(slug);
  }
}

assertUniqueSlugs("providers", providers);
for (const p of providers) {
  assertUniqueSlugs(`/${p.slug}`, p.labs);
  for (const l of p.labs) {
    assertUniqueSlugs(`/${p.slug}/${l.slug}`, l.tracks);
    for (const t of l.tracks)
      assertUniqueSlugs(`/${p.slug}/${l.slug}/${t.slug}`, t.views);
  }
}

export function getProvider(slug: string) {
  return providers.find((p) => p.slug === slug);
}

export function getLab(
  providerSlug: string,
  labSlug: string,
): LabContext | undefined {
  const provider = getProvider(providerSlug);
  const lab = provider?.labs.find((l) => l.slug === labSlug);
  return provider && lab ? { provider, lab } : undefined;
}

export function getTrack(
  providerSlug: string,
  labSlug: string,
  trackSlug: string,
): TrackContext | undefined {
  const ctx = getLab(providerSlug, labSlug);
  const track = ctx?.lab.tracks.find((t) => t.slug === trackSlug);
  return ctx && track ? { ...ctx, track } : undefined;
}

export function allLabs(): LabContext[] {
  return providers.flatMap((provider) =>
    provider.labs.map((lab) => ({ provider, lab })),
  );
}

export function allTracks(): TrackContext[] {
  return allLabs().flatMap((ctx) =>
    ctx.lab.tracks.map((track) => ({ ...ctx, track })),
  );
}

/** Every lab, across providers. */
export const labsHref = "/labs";

export function providerHref(provider: Provider) {
  return `/${provider.slug}`;
}

export function labHref({ provider, lab }: LabContext) {
  return `/${provider.slug}/${lab.slug}`;
}

export function trackHref(ctx: TrackContext) {
  return `${labHref(ctx)}/${ctx.track.slug}`;
}

/** The index view lives at the track URL itself. */
export function viewHref(ctx: TrackContext, viewSlug: string) {
  return viewSlug === ctx.track.views[0].slug
    ? trackHref(ctx)
    : `${trackHref(ctx)}/${viewSlug}`;
}
