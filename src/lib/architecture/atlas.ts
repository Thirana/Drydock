import { resolveEdge } from "./state";
import type { ArchitectureModel, Box, EdgeState } from "./types";

/** Who talks to whom, as found. */
export interface Connection {
  from: string;
  to: string;
  label?: string;
  state: EdgeState;
}

const NOTHING_CLOSED: ReadonlySet<string> = new Set();

/** The map's edges that exist before any fix, then the links the map leaves off. */
export function connectionsAsFound(
  model: Pick<ArchitectureModel, "edges" | "links">,
): Connection[] {
  const drawn = model.edges.flatMap((edge) => {
    const e = resolveEdge(edge, NOTHING_CLOSED);
    return e
      ? [{ from: e.from, to: e.to, label: e.label, state: e.state ?? "ok" }]
      : [];
  });
  const extra = (model.links ?? []).map((l) => ({
    ...l,
    state: l.state ?? "ok",
  }));
  return [...drawn, ...extra];
}

const within = (a: Box, b: Box) =>
  a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;

/** Box id → the smallest group drawn around it on the map. Boxes outside every group are left out. */
export function containers(model: Pick<ArchitectureModel, "groups" | "nodes">) {
  const parent = new Map<string, string>();
  for (const box of [...model.groups, ...model.nodes]) {
    let best: Box | undefined;
    for (const group of model.groups) {
      if (group.id === box.id || !within(box, group)) continue;
      if (!best || group.w * group.h < best.w * best.h) best = group;
    }
    if (best) parent.set(box.id, best.id);
  }
  return parent;
}

/** The groups around a box, innermost first. */
export function chainOf(id: string, parent: ReadonlyMap<string, string>) {
  const chain: string[] = [];
  for (let p = parent.get(id); p; p = parent.get(p)) chain.push(p);
  return chain;
}
