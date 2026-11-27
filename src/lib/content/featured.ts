import { SEVERITIES } from "@/lib/architecture/state";
import type {
  ArchitectureModel,
  Defect,
  Severity,
} from "@/lib/architecture/types";
import {
  defectHref,
  defectsHref,
  harbour,
  harbourHref,
  journeysHref,
  platformHref,
  sections,
} from "./harbour";
import { caseStats, type CaseStats } from "./stats";
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

/** A defect with everything needed to follow it from finding to fix. */
export interface FollowedDefect extends FeaturedDefect {
  explanation: string;
  detection: string;
  remediation: string;
}

/** Serializable snapshot of the case study, for marketing previews. */
export interface FeaturedTrack {
  /** The case study's name. */
  name: string;
  href: string;
  mapHref: string;
  journeysHref: string;
  defectsHref: string;
  /** The followed defect's own page. */
  followedHref: string;
  totals: CaseStats;
  phases: {
    number: number;
    name: string;
    closes: number;
    closedSoFar: number;
  }[];
  /** Every defect, as the phase rail hangs it. */
  trims: Pick<Defect, "id" | "title" | "severity" | "phase" | "blockedBy">[];
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
  /** The defect that waits on the most other fixes. */
  blocked?: { defect: FeaturedDefect; blockers: FeaturedDefect[] };
  /** The first phase where the wrong order causes an outage. */
  riskiest?: { number: number; name: string; verify: string };
  /** The case study's parts after the overview. */
  sections: {
    href: string;
    label: string;
    description: string;
    icon: IconName;
  }[];
}

/** The case study, condensed for the home page. */
export function getFeaturedTrack(): FeaturedTrack | undefined {
  const model = harbour.architecture;
  const totals = caseStats(model);
  if (!model.defects.length) return undefined;

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
  const byPhase = (a: FeaturedDefect, b: FeaturedDefect) => a.phase - b.phase;
  const followedSource = findBypass(model, bySeverity) ?? bySeverity[0];
  const mostBlocked = [...model.defects].sort(
    (a, b) => b.blockedBy.length - a.blockedBy.length,
  )[0];
  const riskiest = sortedPhases.find((p) => p.riskLevel === "high");

  return {
    name: harbour.title,
    href: harbourHref,
    mapHref: platformHref,
    journeysHref,
    defectsHref,
    followedHref: defectHref(followedSource.id),
    totals,
    phases,
    trims: model.defects.map((d) => ({
      id: d.id,
      title: d.title,
      severity: d.severity,
      phase: d.phase,
      blockedBy: d.blockedBy,
    })),
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
    sections: sections.slice(1),
  };
}

/** The first defect, in the given order, whose fix removes a path from the map. */
function findBypass(model: ArchitectureModel, candidates: Defect[]) {
  return candidates.find((defect) =>
    model.edges.some((e) => e.closedBy === defect.id),
  );
}
