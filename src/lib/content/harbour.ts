import { harbour } from "@content/harbour";
import { byPhaseThenSeverity } from "@/lib/architecture/state";
import type { Defect, Journey, JourneyHop } from "@/lib/architecture/types";
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

/** Box id → its label on the map. */
export function boxLabels(): Record<string, string> {
  return Object.fromEntries(
    [...model.groups, ...model.nodes].map((b) => [b.id, b.label]),
  );
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
