import { harbour } from "@content/harbour";
import { boundsOf, fitAspect } from "@/lib/architecture/geometry";
import { boxIndex, byPhaseThenSeverity } from "@/lib/architecture/state";
import type {
  ArchGroup,
  ArchNode,
  Defect,
  Journey,
  JourneyHop,
  MapModel,
  Rect,
} from "@/lib/architecture/types";
import {
  defectsHref,
  harbourHref,
  journeysHref,
  platformHref,
} from "./harbour-routes";
import type { IconName } from "./types";

export { harbour };
export * from "./harbour-routes";

const model = harbour.architecture;

/** The case study's parts, in reading order: the strip under the top bar. */
export const sections: {
  href: string;
  label: string;
  icon: IconName;
  description: string;
}[] = [
  {
    href: harbourHref,
    label: "Overview",
    icon: "book",
    description:
      "Who Harbour is, how its platform came to be this way, and how to read the rest.",
  },
  {
    href: platformHref,
    label: "Platform",
    icon: "map",
    description:
      "How it is built: the map, the address plan, every component and the load balancer.",
  },
  {
    href: journeysHref,
    label: "Packet journeys",
    icon: "route",
    description: `${model.journeys.length} flows, each traced hop by hop. Read them as found, then flip to the fixed design and see what changes.`,
  },
  {
    href: defectsHref,
    label: "Defects",
    icon: "alert",
    description: `All ${model.defects.length}: what each one is, what it can cause, how you would find it, and the change that closes it.`,
  },
];

export function getPlatformPage(slug: string) {
  return harbour.platform.find((p) => p.slug === slug);
}

export function getJourney(slug: string) {
  return model.journeys.find((j) => j.slug === slug);
}

/** A defect by its URL segment: "d3a" finds D3a. */
export function getDefect(segment: string) {
  return model.defects.find((d) => d.id.toLowerCase() === segment);
}

/** Register order: by the phase that closes them, then by severity. */
export function orderedDefects(): Defect[] {
  return [...model.defects].sort(byPhaseThenSeverity);
}

export function phaseOf(number: number) {
  return model.phases.find((p) => p.number === number);
}

/** Every defect a journey runs into, in the order they close. */
export function defectsOn(journey: Journey): Defect[] {
  const ids = new Set(
    [
      journey.switchAt,
      ...journey.hops.flatMap((h) => [h.fixedBy, h.whileOpen]),
    ].filter((id): id is string => !!id),
  );
  return orderedDefects().filter((d) => ids.has(d.id));
}

/** What the map needs to draw itself, without the prose: small enough to hand to a client component. */
export function mapModel(): MapModel {
  return {
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
  };
}

/** Box id → its label on the map. */
export function boxLabels(): Record<string, string> {
  return Object.fromEntries(
    [...model.groups, ...model.nodes].map((b) => [b.id, b.label]),
  );
}

/**
 * The part of the map framing these boxes, padded, and kept between a wide
 * strip and a square so it neither turns into a sliver nor a tower.
 */
export function cropAround(ids: Iterable<string>): Rect {
  const boxes = boxIndex(model);
  const framed = [...new Set(ids)]
    .map((id) => boxes.get(id))
    .filter((b): b is ArchGroup | ArchNode => !!b);
  if (!framed.length) return { x: 0, y: 0, ...model.viewBox };
  const rect = boundsOf(framed, 56);
  const aspect = rect.width / rect.height;
  return aspect > 2.6
    ? fitAspect(rect, 2.6, model.viewBox)
    : aspect < 1.25
      ? fitAspect(rect, 1.25, model.viewBox)
      : rect;
}

/** A journey's frame on the map: every box it touches, as found and fixed, so the switch never moves it. */
/** A defect's frame on the map: the boxes it sits on, changes, and the paths it opens or closes. */
export function defectCrop(d: Defect): Rect {
  return cropAround(defectBoxes(d));
}

/** The boxes a defect sits on or changes, and the ends of the paths it opens or closes. */
export function defectBoxes(d: Defect): string[] {
  return [
    ...[...model.groups, ...model.nodes]
      .filter((b) => b.defects?.includes(d.id))
      .map((b) => b.id),
    ...Object.keys(d.applies),
    ...model.edges
      .filter(
        (e) =>
          e.closedBy === d.id ||
          e.opensWith === d.id ||
          e.changedBy?.defect === d.id,
      )
      .flatMap((e) => [e.from, e.to]),
  ];
}

/** The journeys a defect shows up on, with the hops where it fails. */
export function journeysThrough(
  id: string,
): { journey: Journey; failing: JourneyHop[] }[] {
  return model.journeys
    .filter((j) => defectsOn(j).some((d) => d.id === id))
    .map((journey) => ({
      journey,
      failing: journey.hops.filter((h) => h.fixedBy === id),
    }));
}
