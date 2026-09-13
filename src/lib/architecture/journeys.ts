import type { ArchitectureModel, Journey } from "./types";

/** Whether the journey has switched to its post-fix design at this point. */
export function hasSwitched(journey: Journey, closed: Set<string>) {
  return !!journey.switchAt && closed.has(journey.switchAt);
}

export function journeyPath(journey: Journey, closed: Set<string>) {
  return hasSwitched(journey, closed) && journey.pathAfter
    ? journey.pathAfter
    : journey.path;
}

export function journeyContext(journey: Journey, closed: Set<string>) {
  return hasSwitched(journey, closed) && journey.contextAfter
    ? journey.contextAfter
    : (journey.context ?? []);
}

export function visibleHops(journey: Journey, closed: Set<string>) {
  return journey.hops.filter(
    (h) =>
      (!h.whileOpen || !closed.has(h.whileOpen)) &&
      (!h.afterClosed || closed.has(h.afterClosed)),
  );
}

export function failingHopCount(journey: Journey, closed: Set<string>) {
  return visibleHops(journey, closed).filter((h) => h.fails).length;
}

/** What the map needs to trace a journey: lit boxes, hop numbers, failures. */
export interface JourneyHighlight {
  lit: Set<string>;
  failing: Set<string>;
  order: Map<string, number>;
  /** `from|to` keys of edges between lit boxes. */
  edges: Set<string>;
}

export const edgeKey = (from: string, to: string) => `${from}|${to}`;

export const EMPTY_HIGHLIGHT: JourneyHighlight = {
  lit: new Set(),
  failing: new Set(),
  order: new Map(),
  edges: new Set(),
};

export function journeyHighlight(
  model: ArchitectureModel,
  journey: Journey,
  closed: Set<string>,
): JourneyHighlight {
  const path = journeyPath(journey, closed);
  const lit = new Set([...path, ...journeyContext(journey, closed)]);
  const failing = new Set(
    visibleHops(journey, closed)
      .filter((h) => h.fails && h.at)
      .map((h) => h.at!),
  );
  const order = new Map(path.map((id, i) => [id, i + 1]));
  const edges = new Set(
    model.edges
      .filter((e) => lit.has(e.from) && lit.has(e.to))
      .map((e) => edgeKey(e.from, e.to)),
  );
  return { lit, failing, order, edges };
}
