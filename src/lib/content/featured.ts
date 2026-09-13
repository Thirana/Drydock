import { anchor, boundsOf, fitAspect } from "@/lib/architecture/geometry";
import {
  edgeKey,
  failingHopCount,
  visibleHops,
} from "@/lib/architecture/journeys";
import { boxIndex, closedDefects, SEVERITIES } from "@/lib/architecture/state";
import type {
  AddressRange,
  ArchGroup,
  ArchNode,
  ArchitectureModel,
  Defect,
  Fact,
  Journey,
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
  /** Everything needed to draw the map at any phase, without the prose. */
  map: MapModel;
  /** Defects pinned on the hero map. */
  callouts: FeaturedCallout[];
  /** The part of the map shown on narrow screens. */
  focus: Rect;
  /** Box id → the phase it first appears at on the hero map. */
  revealAt: Record<string, number>;
  /** Most severe defects first. */
  spotlight: FeaturedDefect[];
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
  /** A journey that fails as found and passes once the sequence is done. */
  journey?: { journey: Journey; failing: number; fixedAt: number };
  /** One defective component per section. */
  components: {
    id: string;
    label: string;
    section: string;
    purpose: string;
    facts: Fact[];
  }[];
  /** The load balancer chains, link by link. */
  chain: {
    label: string;
    links: { label: string; sub: string; defects: string[] }[];
  }[];
  /** Top-level ranges of the IP plan. */
  addressPlan: AddressRange[];
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
    spotlight: bySeverity.slice(0, 5).map(toFeatured),
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
    journey: findJourney(model),
    components: findComponents(model),
    chain: model.loadBalancer.lanes.map((lane) => ({
      label: lane.label,
      links: lane.links.map((link) => ({
        label: link.label,
        sub: link.sub,
        defects: link.defects ?? [],
      })),
    })),
    addressPlan: model.addressPlan ?? [],
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

/** The journey with the most failing hops that the full sequence repairs. */
function findJourney(model: ArchitectureModel): FeaturedTrack["journey"] {
  const last = Math.max(...model.phases.map((p) => p.number));
  const asFound = closedDefects(model, 0);
  const done = closedDefects(model, last);
  const phaseOf = new Map(model.defects.map((d) => [d.id, d.phase]));

  let best: FeaturedTrack["journey"];
  for (const journey of model.journeys) {
    const failing = visibleHops(journey, asFound).filter((h) => h.fails);
    if (!failing.length || failingHopCount(journey, done)) continue;
    if (best && best.failing >= failing.length) continue;
    const fixedAt = Math.max(
      ...failing.map((h) =>
        h.fixedBy ? (phaseOf.get(h.fixedBy) ?? last) : last,
      ),
    );
    const clean = failingHopCount(journey, closedDefects(model, fixedAt)) === 0;
    best = {
      journey,
      failing: failing.length,
      fixedAt: clean ? fixedAt : last,
    };
  }
  return best;
}

/** The first component sheet with an open defect, per section. */
function findComponents(model: ArchitectureModel, count = 3) {
  const boxes = boxIndex(model);
  const picked = new Map<string, FeaturedTrack["components"][number]>();
  for (const [id, sheet] of Object.entries(model.componentSheets)) {
    const box = boxes.get(id);
    if (!box?.defects?.length || picked.has(sheet.section)) continue;
    picked.set(sheet.section, {
      id,
      label: box.label,
      section: sheet.section,
      purpose: sheet.purpose,
      facts: sheet.facts.slice(0, 2),
    });
  }
  return [...picked.values()].slice(0, count);
}
