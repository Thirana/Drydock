import type {
  ArchEdge,
  ArchGroup,
  ArchNode,
  ArchitectureModel,
  BoxPatch,
  Defect,
  MapModel,
} from "./types";

/** Defect ids closed at or before `phase`. */
export function closedDefects(model: Pick<MapModel, "defects">, phase: number) {
  return new Set(
    model.defects.filter((d) => d.phase <= phase).map((d) => d.id),
  );
}

/** Box id → merged patch from every defect closed at or before `phase`. */
export function patchesAt(model: Pick<MapModel, "defects">, phase: number) {
  const patches: Record<string, BoxPatch> = {};
  [...model.defects]
    .sort((a, b) => a.phase - b.phase)
    .filter((d) => d.phase <= phase)
    .forEach((d) => {
      for (const [id, patch] of Object.entries(d.applies)) {
        patches[id] = { ...patches[id], ...patch };
      }
    });
  return patches;
}

export type ResolvedBox<T extends ArchGroup | ArchNode> = T & {
  openDefects: string[];
};

/** A box as it looks at a phase: patched, with only its still-open defects. */
export function resolveBox<T extends ArchGroup | ArchNode>(
  box: T,
  patches: Record<string, BoxPatch>,
  closed: Set<string>,
): ResolvedBox<T> {
  return {
    ...box,
    ...patches[box.id],
    openDefects: (box.defects ?? []).filter((d) => !closed.has(d)),
  };
}

/** An edge as it looks at a phase, or null if it does not exist then. */
export function resolveEdge(
  edge: ArchEdge,
  closed: Set<string>,
): ArchEdge | null {
  if (edge.closedBy && closed.has(edge.closedBy)) return null;
  if (edge.opensWith && !closed.has(edge.opensWith)) return null;
  if (edge.changedBy && closed.has(edge.changedBy.defect)) {
    return { ...edge, ...edge.changedBy.set };
  }
  return edge;
}

export function boxIndex(model: Pick<ArchitectureModel, "groups" | "nodes">) {
  const index = new Map<string, ArchGroup | ArchNode>();
  for (const box of [...model.groups, ...model.nodes]) index.set(box.id, box);
  return index;
}

export function defectIndex(model: ArchitectureModel) {
  return new Map<string, Defect>(model.defects.map((d) => [d.id, d]));
}

export const SEVERITIES = ["critical", "high", "medium", "low"] as const;

const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 } as const;

/** Register order: by remediation phase, then by severity. */
export function byPhaseThenSeverity(
  a: Pick<Defect, "phase" | "severity">,
  b: Pick<Defect, "phase" | "severity">,
) {
  return (
    a.phase - b.phase || SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
  );
}
