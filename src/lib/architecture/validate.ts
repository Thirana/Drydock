import type { ArchitectureModel, Box } from "./types";

const contains = (outer: Box, inner: Box) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.w <= outer.x + outer.w &&
  inner.y + inner.h <= outer.y + outer.h;

/**
 * Checks every cross-reference in a model. Called when a track is registered,
 * so a typo in content fails `next dev` and `next build` instead of rendering
 * a silently broken diagram.
 */
export function validateArchitecture(name: string, model: ArchitectureModel) {
  const errors: string[] = [];
  const boxes = new Set([...model.groups, ...model.nodes].map((b) => b.id));
  const defects = new Set(model.defects.map((d) => d.id));
  const phases = new Set(model.phases.map((p) => p.number));
  const layers = new Set(model.overlays.map((o) => o.key));
  const chainIds = new Set([
    ...model.loadBalancer.lanes.flatMap((l) => l.links.map((k) => k.id)),
    ...model.loadBalancer.extras.map((e) => e.id),
  ]);

  const box = (id: string, where: string) =>
    boxes.has(id) || errors.push(`${where}: unknown box "${id}"`);
  const defect = (id: string | undefined, where: string) =>
    !id || defects.has(id) || errors.push(`${where}: unknown defect "${id}"`);
  const layer = (key: string, where: string) =>
    layers.has(key) || errors.push(`${where}: unknown overlay "${key}"`);

  const seen = new Set<string>();
  for (const b of [...model.groups, ...model.nodes]) {
    if (seen.has(b.id)) errors.push(`duplicate box id "${b.id}"`);
    seen.add(b.id);
    b.defects?.forEach((d) => defect(d, `box ${b.id}`));
    b.layers?.forEach((l) => layer(l, `box ${b.id}`));
    if (!model.componentSheets[b.id])
      errors.push(`box ${b.id}: no component sheet`);
  }

  for (const [id, sheet] of Object.entries(model.componentSheets)) {
    box(id, "component sheet");
    if (!model.componentSections.includes(sheet.section)) {
      errors.push(`component sheet ${id}: unknown section "${sheet.section}"`);
    }
  }

  model.edges.forEach((e, i) => {
    const where = `edge #${i} ${e.from}→${e.to}`;
    box(e.from, where);
    box(e.to, where);
    e.layers.forEach((l) => layer(l, where));
    defect(e.closedBy, where);
    defect(e.opensWith, where);
    defect(e.changedBy?.defect, where);
  });

  for (const d of model.defects) {
    if (!phases.has(d.phase))
      errors.push(`defect ${d.id}: unknown phase ${d.phase}`);
    d.blockedBy.forEach((b) => defect(b, `defect ${d.id} blockedBy`));
    Object.keys(d.applies).forEach((id) => box(id, `defect ${d.id} applies`));
  }

  for (const j of model.journeys) {
    const where = `journey "${j.shortTitle}"`;
    [
      ...j.path,
      ...(j.context ?? []),
      ...(j.pathAfter ?? []),
      ...(j.contextAfter ?? []),
    ].forEach((id) => box(id, where));
    defect(j.switchAt, where);
    for (const h of j.hops) {
      if (h.at) box(h.at, where);
      defect(h.whileOpen, where);
      defect(h.afterClosed, where);
      defect(h.fixedBy, where);
    }
  }

  if (model.showcase) {
    const index = new Map(
      [...model.groups, ...model.nodes].map((b) => [b.id, b]),
    );
    for (const c of model.showcase.callouts) {
      const where = `showcase callout ${c.defect}`;
      defect(c.defect, where);
      const at = index.get(c.at);
      if (!at) errors.push(`${where}: unknown box "${c.at}"`);
      else if (!at.defects?.includes(c.defect))
        errors.push(`${where}: box ${c.at} does not list the defect`);
      if (c.anchor) {
        const anchor = index.get(c.anchor);
        if (!anchor) errors.push(`${where}: unknown anchor box "${c.anchor}"`);
        else if (at && !contains(anchor, at))
          errors.push(`${where}: anchor ${c.anchor} does not contain ${c.at}`);
      }
    }
    const revealed = new Set<string>();
    for (const r of model.showcase.reveals ?? []) {
      const where = `showcase reveal at phase ${r.phase}`;
      if (!phases.has(r.phase)) errors.push(`${where}: unknown phase`);
      for (const id of r.boxes) {
        box(id, where);
        if (revealed.has(id)) errors.push(`${where}: box ${id} listed twice`);
        revealed.add(id);
      }
    }
    const { x, y, width, height } = model.showcase.focus;
    if (
      x < 0 ||
      y < 0 ||
      x + width > model.viewBox.width ||
      y + height > model.viewBox.height
    ) {
      errors.push("showcase focus: extends outside the viewBox");
    }
  }

  for (const id of chainIds) {
    if (!model.loadBalancer.details[id])
      errors.push(`load balancer link ${id}: no detail`);
  }
  if (!chainIds.has(model.loadBalancer.initialSelection)) {
    errors.push(
      `load balancer initialSelection "${model.loadBalancer.initialSelection}" is not a link`,
    );
  }
  model.loadBalancer.lanes
    .flatMap((l) => l.links)
    .forEach((k) =>
      k.defects?.forEach((d) => defect(d, `load balancer link ${k.id}`)),
    );

  if (errors.length) {
    throw new Error(
      `Invalid architecture model "${name}":\n  - ${errors.join("\n  - ")}`,
    );
  }
  return model;
}
