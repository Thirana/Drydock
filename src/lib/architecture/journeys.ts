import type { Journey } from "./types";

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
