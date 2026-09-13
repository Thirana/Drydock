import { byPhaseThenSeverity, SEVERITIES } from "@/lib/architecture/state";
import type { Defect, Severity } from "@/lib/architecture/types";
import { allTracks, trackHref, viewHref } from "./registry";
import { trackStats, type TrackStats } from "./stats";
import type { IconName } from "./types";

export interface FeaturedDefect {
  id: string;
  title: string;
  severity: Severity;
  phase: number;
  phaseName: string;
  symptom: string;
  before: string;
  after: string;
}

/** Serializable snapshot of one track, for marketing previews. */
export interface FeaturedTrack {
  provider: string;
  lab: string;
  track: string;
  href: string;
  defectsHref: string;
  totals: TrackStats;
  severityCounts: Record<Severity, number>;
  phases: {
    number: number;
    name: string;
    closes: number;
    closedSoFar: number;
  }[];
  /** Most severe defects first. */
  spotlight: FeaturedDefect[];
  /** The first defect in remediation order. */
  sample: FeaturedDefect & { detection: string };
  views: {
    href: string;
    title: string;
    description: string;
    icon?: IconName;
  }[];
}

/** The first architecture track in the registry. */
export function getFeaturedTrack(): FeaturedTrack | undefined {
  const ctx = allTracks().find((c) => c.track.architecture);
  const model = ctx?.track.architecture;
  const totals = ctx && trackStats(ctx.track);
  if (!ctx || !model || !totals || !model.defects.length) return undefined;

  const phaseName = (n: number) =>
    model.phases.find((p) => p.number === n)?.name ?? "";
  const toFeatured = (d: Defect): FeaturedDefect => ({
    id: d.id,
    title: d.title,
    severity: d.severity,
    phase: d.phase,
    phaseName: phaseName(d.phase),
    symptom: d.symptom,
    before: d.before,
    after: d.after,
  });

  let closedSoFar = 0;
  const phases = [...model.phases]
    .sort((a, b) => a.number - b.number)
    .map((p) => {
      const closes = model.defects.filter((d) => d.phase === p.number).length;
      closedSoFar += closes;
      return { number: p.number, name: p.name, closes, closedSoFar };
    });

  const bySeverity = [...model.defects].sort(
    (a, b) =>
      SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity) ||
      a.phase - b.phase,
  );
  const first = [...model.defects].sort(byPhaseThenSeverity)[0];

  return {
    provider: ctx.provider.name,
    lab: ctx.lab.title,
    track: ctx.track.title,
    href: trackHref(ctx),
    defectsHref: viewHref(ctx, "defects"),
    totals,
    severityCounts: Object.fromEntries(
      SEVERITIES.map((s) => [
        s,
        model.defects.filter((d) => d.severity === s).length,
      ]),
    ) as Record<Severity, number>,
    phases,
    spotlight: bySeverity.slice(0, 5).map(toFeatured),
    sample: { ...toFeatured(first), detection: first.detection },
    views: ctx.track.views.slice(1).map((v) => ({
      href: viewHref(ctx, v.slug),
      title: v.title,
      description: v.description,
      icon: v.icon,
    })),
  };
}
