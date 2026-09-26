import { anchor, boundsOf, fitAspect } from "@/lib/architecture/geometry";
import { edgeKey } from "@/lib/architecture/journeys";
import { boxIndex, SEVERITIES } from "@/lib/architecture/state";
import type {
  ArchGroup,
  ArchNode,
  ArchitectureModel,
  Defect,
  MapCallout,
  MapModel,
  Rect,
  Severity,
  Side,
} from "@/lib/architecture/types";
import { allTracks, trackHref, viewHref } from "./registry";
import { trackStats, type TrackStats } from "./stats";
import type { IconName } from "./types";

export interface FeaturedDefect {
  id: string;
  title: string;
  severity: Severity;
  phase: number;
  phaseName: string;
  blockedBy: string[];
  symptom: string;
  before: string;
  after: string;
}

export interface FeaturedCallout extends Required<MapCallout> {
  title: string;
  severity: Severity;
  phase: number;
  /** Pin position, in map viewBox units. */
  x: number;
  y: number;
}

/** A defect with everything needed to follow it from finding to fix. */
export interface FollowedDefect extends FeaturedDefect {
  explanation: string;
  detection: string;
  remediation: string;
}

/** Serializable snapshot of one track, for marketing previews. */
export interface FeaturedTrack {
  provider: string;
  lab: string;
  track: string;
  href: string;
  mapHref: string;
  defectsHref: string;
  totals: TrackStats;
  phases: {
    number: number;
    name: string;
    closes: number;
    closedSoFar: number;
  }[];
  /** Every defect, as the phase rail hangs it. */
  trims: Pick<Defect, "id" | "title" | "severity" | "phase" | "blockedBy">[];
  /** Everything needed to draw the map at any phase, without the prose. */
  map: MapModel;
  /** Defects pinned on the hero map. */
  callouts: FeaturedCallout[];
  /** The part of the map shown on narrow screens. */
  focus: Rect;
  /** Box id → the phase it first appears at on the hero map. */
  revealAt: Record<string, number>;
  /**
   * The defect the landing page follows from finding it to fixing it: the
   * bypass defect when there is one, else the most severe.
   */
  followed: {
    defect: FollowedDefect;
    /** Defects that have to close first. */
    blockers: FeaturedDefect[];
    /** Defects that cannot close until this one does. */
    unblocks: FeaturedDefect[];
  };
  /** The most severe defect that opens a path around the intended one. */
  bypass?: {
    defect: FeaturedDefect;
    /** Map region framing the bypass. */
    crop: Rect;
    lit: string[];
    failing: string[];
    /** `from|to` keys of the bypass edges. */
    edges: string[];
  };
  /** The defect that waits on the most other fixes. */
  blocked?: { defect: FeaturedDefect; blockers: FeaturedDefect[] };
  /** The first phase where the wrong order causes an outage. */
  riskiest?: { number: number; name: string; verify: string };
  views: {
    slug: string;
    href: string;
    title: string;
    description: string;
    icon?: IconName;
  }[];
}

const SIDE: Record<FeaturedCallout["placement"], Side> = {
  top: "t",
  bottom: "b",
  left: "l",
  right: "r",
};

/** The first architecture track in the registry. */
export function getFeaturedTrack(): FeaturedTrack | undefined {
  const ctx = allTracks().find((c) => c.track.architecture);
  const model = ctx?.track.architecture;
  const totals = ctx && trackStats(ctx.track);
  if (!ctx || !model || !totals || !model.defects.length) return undefined;

  const boxes = boxIndex(model);
  const defectById = new Map(model.defects.map((d) => [d.id, d]));
  const phaseName = (n: number) =>
    model.phases.find((p) => p.number === n)?.name ?? "";
  const toFeatured = (d: Defect): FeaturedDefect => ({
    id: d.id,
    title: d.title,
    severity: d.severity,
    phase: d.phase,
    phaseName: phaseName(d.phase),
    blockedBy: d.blockedBy,
    symptom: d.symptom,
    before: d.before,
    after: d.after,
  });
  const hrefFor = (slug: string) =>
    ctx.track.views.some((v) => v.slug === slug)
      ? viewHref(ctx, slug)
      : trackHref(ctx);

  const sortedPhases = [...model.phases].sort((a, b) => a.number - b.number);
  let closedSoFar = 0;
  const phases = sortedPhases.map((p) => {
    const closes = model.defects.filter((d) => d.phase === p.number).length;
    closedSoFar += closes;
    return { number: p.number, name: p.name, closes, closedSoFar };
  });

  const bySeverity = [...model.defects].sort(
    (a, b) =>
      SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity) ||
      a.phase - b.phase,
  );
  const bypass = findBypass(model, bySeverity);
  const byPhase = (a: FeaturedDefect, b: FeaturedDefect) => a.phase - b.phase;
  const followedSource = bypass?.defect ?? bySeverity[0];
  const mostBlocked = [...model.defects].sort(
    (a, b) => b.blockedBy.length - a.blockedBy.length,
  )[0];
  const riskiest = sortedPhases.find((p) => p.riskLevel === "high");

  const callouts: FeaturedCallout[] = (model.showcase?.callouts ?? []).flatMap(
    (c) => {
      const defect = defectById.get(c.defect);
      const anchorId = c.anchor ?? c.at;
      const box = boxes.get(anchorId);
      if (!defect || !box) return [];
      const placement = c.placement ?? "top";
      return [
        {
          ...c,
          anchor: anchorId,
          placement,
          title: defect.title,
          severity: defect.severity,
          phase: defect.phase,
          ...anchor(box, SIDE[placement]),
        },
      ];
    },
  );

  return {
    provider: ctx.provider.name,
    lab: ctx.lab.title,
    track: ctx.track.title,
    href: trackHref(ctx),
    mapHref: hrefFor("map"),
    defectsHref: hrefFor("defects"),
    totals,
    phases,
    trims: model.defects.map((d) => ({
      id: d.id,
      title: d.title,
      severity: d.severity,
      phase: d.phase,
      blockedBy: d.blockedBy,
    })),
    map: {
      name: model.name,
      viewBox: model.viewBox,
      groups: model.groups,
      nodes: model.nodes,
      edges: model.edges,
      defects: model.defects.map(({ id, phase, applies }) => ({
        id,
        phase,
        applies,
      })),
    },
    callouts,
    focus: model.showcase?.focus ?? { x: 0, y: 0, ...model.viewBox },
    revealAt: Object.fromEntries(
      (model.showcase?.reveals ?? []).flatMap((r) =>
        r.boxes.map((id) => [id, r.phase]),
      ),
    ),
    followed: {
      defect: {
        ...toFeatured(followedSource),
        explanation: followedSource.explanation,
        detection: followedSource.detection,
        remediation: followedSource.remediation,
      },
      blockers: followedSource.blockedBy
        .flatMap((id) => {
          const d = defectById.get(id);
          return d ? [toFeatured(d)] : [];
        })
        .sort(byPhase),
      unblocks: model.defects
        .filter((d) => d.blockedBy.includes(followedSource.id))
        .map(toFeatured)
        .sort(byPhase),
    },
    bypass: bypass && { ...bypass, defect: toFeatured(bypass.defect) },
    blocked: mostBlocked.blockedBy.length
      ? {
          defect: toFeatured(mostBlocked),
          blockers: mostBlocked.blockedBy
            .flatMap((id) => {
              const d = defectById.get(id);
              return d ? [toFeatured(d)] : [];
            })
            .sort((a, b) => a.phase - b.phase),
        }
      : undefined,
    riskiest: riskiest && {
      number: riskiest.number,
      name: riskiest.name,
      verify: riskiest.verify,
    },
    views: ctx.track.views.slice(1).map((v) => ({
      slug: v.slug,
      href: viewHref(ctx, v.slug),
      title: v.title,
      description: v.description,
      icon: v.icon,
    })),
  };
}

/** The first defect, in the given order, whose fix removes a path from the map. */
function findBypass(model: ArchitectureModel, candidates: Defect[]) {
  const boxes = boxIndex(model);
  for (const defect of candidates) {
    const edges = model.edges.filter((e) => e.closedBy === defect.id);
    const lit = [...new Set(edges.flatMap((e) => [e.from, e.to]))];
    const framed = lit
      .map((id) => boxes.get(id))
      .filter((b): b is ArchGroup | ArchNode => !!b);
    if (!framed.length) continue;
    return {
      defect,
      crop: fitAspect(boundsOf(framed, 28), 2, model.viewBox),
      lit,
      failing: [...model.groups, ...model.nodes]
        .filter((b) => b.defects?.includes(defect.id))
        .map((b) => b.id),
      edges: edges.map((e) => edgeKey(e.from, e.to)),
    };
  }
  return undefined;
}
