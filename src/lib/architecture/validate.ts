import type { ArchitectureModel } from "./types";

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
    if (
      b.x < 0 ||
      b.y < 0 ||
      b.x + b.w > model.viewBox.width ||
      b.y + b.h > model.viewBox.height
    )
      errors.push(`box ${b.id}: extends outside the viewBox`);
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
    if (e.closedBy && e.opensWith)
      errors.push(`${where}: closedBy and opensWith together`);
    defect(e.closedBy, where);
    defect(e.opensWith, where);
    defect(e.changedBy?.defect, where);
  });

  model.links?.forEach((l, i) => {
    const where = `link #${i} ${l.from}→${l.to}`;
    box(l.from, where);
    box(l.to, where);
    if (model.edges.some((e) => e.from === l.from && e.to === l.to))
      errors.push(`${where}: the map already draws it`);
  });

  for (const d of model.defects) {
    if (!phases.has(d.phase))
      errors.push(`defect ${d.id}: unknown phase ${d.phase}`);
    d.blockedBy.forEach((b) => defect(b, `defect ${d.id} blockedBy`));
    Object.keys(d.applies).forEach((id) => box(id, `defect ${d.id} applies`));
  }

  const slugs = new Set<string>();
  for (const j of model.journeys) {
    const where = `journey "${j.shortTitle}"`;
    if (!/^[a-z0-9-]+$/.test(j.slug))
      errors.push(`${where}: slug "${j.slug}" is not URL-safe`);
    if (slugs.has(j.slug)) errors.push(`${where}: duplicate slug "${j.slug}"`);
    slugs.add(j.slug);
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

  for (const id of chainIds) {
    if (!model.loadBalancer.details[id])
      errors.push(`load balancer link ${id}: no detail`);
  }
  if (!chainIds.has(model.loadBalancer.initialSelection)) {
    errors.push(
      `load balancer initialSelection "${model.loadBalancer.initialSelection}" is not a link`,
    );
  }
  model.loadBalancer.symptoms?.forEach((s) => {
    if (s.link && !chainIds.has(s.link))
      errors.push(
        `load balancer symptom "${s.symptom}": unknown link "${s.link}"`,
      );
  });
  model.loadBalancer.lanes
    .flatMap((l) => l.links)
    .forEach((k) =>
      k.defects?.forEach((d) => defect(d, `load balancer link ${k.id}`)),
    );

  if (model.addressPlan) {
    const { region } = model.addressPlan;
    const base = region.cidr.split(".").slice(0, 2).join(".");
    const taken = new Set<number>();
    if (!region.cidr.endsWith("/16"))
      errors.push(`address plan region ${region.cidr}: not a /16`);
    for (const s of region.subnets) {
      const where = `address plan subnet ${s.name}`;
      const [ip, prefix] = s.cidr.split("/");
      const bits = Number(prefix);
      const third = Number(ip.split(".")[2]);
      if (!ip.startsWith(`${base}.`) || bits < 16 || bits > 24) {
        errors.push(
          `${where}: ${s.cidr} is not a /16-/24 inside ${region.cidr}`,
        );
        continue;
      }
      for (let i = third; i < third + 2 ** (24 - bits); i++) {
        if (taken.has(i)) errors.push(`${where}: overlaps another subnet`);
        taken.add(i);
      }
      s.defects?.forEach((d) => defect(d, where));
    }
  }

  if (errors.length) {
    throw new Error(
      `Invalid architecture model "${name}":\n  - ${errors.join("\n  - ")}`,
    );
  }
  return model;
}
