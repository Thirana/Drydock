"use client";

import { useMemo, useState } from "react";
import { arrowHead } from "@/components/learn/diagram-defs";
import { Tag } from "@/components/site/landing/harbour-drawing";
import {
  chainOf,
  connectionsAsFound,
  containers,
  type Connection,
} from "@/lib/architecture/atlas";
import { boxIndex } from "@/lib/architecture/state";
import { textWidth, wrapText } from "@/lib/architecture/text-fit";
import type {
  ArchGroup,
  ArchNode,
  ArchitectureModel,
  EdgeState,
} from "@/lib/architecture/types";
import { cn } from "@/lib/utils";
import { DefectLink } from "./defect-link";
import { DiagramFrame } from "./diagram-frame";
import { FactList } from "./fact-list";
import { selectable } from "./svg";

/** The section drawn as the "Lives in" tree instead of a column. */
const SCOPES = "Scopes and subnets";

const COL_W = 188;
const GAP = 44;
const CHIP_H = 52;
const STEP = 72;
const TOP = 80;
/** The band above the columns where long wires cross. */
const BAND_Y = 30;
const LANE = 6;
const INSET = 28;

const EASE = "transition-[opacity,fill,stroke] duration-300";
const WIRE: Record<EdgeState, string> = {
  ok: "w green",
  broken: "w fault dash",
  idle: "w dash",
};
const HEAD = { ok: "green", broken: "fault", idle: "muted" } as const;
/** What a connection with no label of its own says. */
const SAYS: Record<EdgeState, string> = {
  ok: "allowed",
  broken: "should not exist",
  idle: "not in use",
};
const TEXT: Record<EdgeState, string> = {
  ok: "text-ink",
  broken: "text-fault",
  idle: "text-ink-faint",
};

interface Spot {
  col: number;
  x: number;
  y: number;
  cy: number;
}

const colX = (col: number) => col * (COL_W + GAP);
const right = (col: number) => colX(col) + COL_W;

/**
 * A wire from one chip to another in 90° elbows, through the empty channels
 * between columns. Wires that skip a column climb to the band above them.
 * Each wire keeps its own lane so a chip's wires never sit on each other.
 */
function route(a: Spot, b: Spot, lane: number) {
  const off = 8 + lane * LANE;
  const band = BAND_Y + lane * LANE;
  if (b.col === a.col) {
    return `M${right(a.col)} ${a.cy} H${right(a.col) + off} V${b.cy} H${right(b.col) + 3}`;
  }
  if (b.col > a.col) {
    const out = right(a.col) + off;
    if (b.col === a.col + 1)
      return `M${right(a.col)} ${a.cy} H${out} V${b.cy} H${colX(b.col) - 3}`;
    return `M${right(a.col)} ${a.cy} H${out} V${band} H${colX(b.col) - GAP + off} V${b.cy} H${colX(b.col) - 3}`;
  }
  const out = colX(a.col) - off;
  if (b.col === a.col - 1)
    return `M${colX(a.col)} ${a.cy} H${out} V${b.cy} H${right(b.col) + 3}`;
  return `M${colX(a.col)} ${a.cy} H${out} V${band} H${right(b.col) + off} V${b.cy} H${right(b.col) + 3}`;
}

/** A chip's title, and the sub-line it moves to when the title is too long. */
function fitTitle(label: string) {
  if (textWidth(label, 15, "sans") <= COL_W - INSET) return { title: label };
  const [head, ...rest] = label.split(" · ");
  return rest.length
    ? { title: head, spill: rest.join(" · ") }
    : { title: label, small: true };
}

/** The first line of a sub-line that fits the chip. */
function firstLine(text: string) {
  const { lines } = wrapText(text, COL_W - INSET, 13, "mono");
  return lines.length > 1 ? `${lines[0].replace(/ ·$/, "")} …` : lines[0];
}

/**
 * Every component in the order a request meets it - a column per section -
 * with the scopes they sit in as a tree beside them. Picking one draws only
 * its own connections and opens its sheet, whose links walk on to the next.
 */
export function ComponentAtlas({ model }: { model: ArchitectureModel }) {
  const [selected, setSelected] = useState("API");

  const { boxes, parent, connections, columns, spots, tree } = useMemo(() => {
    const boxes = boxIndex(model);
    const parent = containers(model);
    const sheets = Object.entries(model.componentSheets);
    const columns = model.componentSections
      .filter((s) => s !== SCOPES)
      .map((section) => ({
        section,
        ids: sheets.filter(([, s]) => s.section === section).map(([id]) => id),
      }));
    const spots = new Map<string, Spot>();
    columns.forEach(({ ids }, col) =>
      ids.forEach((id, row) => {
        const y = TOP + row * STEP;
        spots.set(id, { col, x: colX(col), y, cy: y + CHIP_H / 2 });
      }),
    );
    const groupIds = new Set(model.groups.map((g) => g.id));
    const childrenOf = (id?: string) =>
      model.groups.filter((g) => parent.get(g.id) === id && groupIds.has(g.id));
    const tree: { group: ArchGroup; depth: number }[] = [];
    const walk = (id: string | undefined, depth: number) =>
      childrenOf(id).forEach((group) => {
        tree.push({ group, depth });
        walk(group.id, depth + 1);
      });
    walk(undefined, 0);
    return {
      boxes,
      parent,
      connections: connectionsAsFound(model),
      columns,
      spots,
      tree,
    };
  }, [model]);

  const box = boxes.get(selected);
  const sheet = model.componentSheets[selected];
  const chain = chainOf(selected, parent);
  const isGroup = model.groups.some((g) => g.id === selected);
  /** The picked part, or a picked scope and everything inside it. */
  const scope = new Set([
    selected,
    ...(isGroup
      ? [...boxes.keys()].filter((id) => chainOf(id, parent).includes(selected))
      : []),
  ]);
  // What crosses the scope's edge; traffic inside a picked scope stays out.
  const incoming = connections.filter(
    (c) => scope.has(c.to) && !scope.has(c.from),
  );
  const outgoing = connections.filter(
    (c) => scope.has(c.from) && !scope.has(c.to),
  );
  const near = new Map<string, Connection>();
  for (const c of incoming) near.set(c.from, c);
  for (const c of outgoing) near.set(c.to, c);
  const otherEnd = (c: Connection) => (scope.has(c.from) ? c.to : c.from);

  const wires = [...incoming, ...outgoing]
    .filter((c) => spots.has(c.from) && spots.has(c.to))
    .sort((a, b) => {
      const [p, q] = [spots.get(otherEnd(a))!, spots.get(otherEnd(b))!];
      return p.col - q.col || p.y - q.y;
    });

  const rows = Math.max(...columns.map((c) => c.ids.length));
  const width = colX(columns.length);
  const height = TOP + rows * STEP - (STEP - CHIP_H) + 4;

  return (
    <div className="not-prose my-8 space-y-10">
      <DiagramFrame
        title="Component atlas"
        meta={`${box?.label ?? selected} · as found`}
        keyItems={["teal", "plum", "green", "fault", "ghost"]}
      >
        <div className="grid lg:grid-cols-[minmax(0,1fr)_252px]">
          <div className="p-4 sm:p-5">
            <svg
              className="mx-auto block h-auto w-full min-w-[1000px]"
              style={{ maxWidth: width }}
              viewBox={`0 0 ${width} ${height}`}
              aria-label="Harbour's components in the order a request meets them, with the selected component's connections"
            >
              {columns.map(({ section }, col) => (
                <text key={section} className="l" x={colX(col)} y={18}>
                  {section}
                </text>
              ))}

              {wires.map((c) => (
                <path
                  key={`${c.from}|${c.to}`}
                  className={WIRE[c.state]}
                  d={route(
                    spots.get(c.from)!,
                    spots.get(c.to)!,
                    // A busy scope wraps around; six lanes fill a channel.
                    wires.indexOf(c) % 6,
                  )}
                  markerEnd={arrowHead(HEAD[c.state])}
                />
              ))}

              {columns.flatMap(({ ids }) =>
                ids.map((id) => {
                  const b = boxes.get(id) as ArchNode | undefined;
                  if (!b) return null;
                  const { x, y } = spots.get(id)!;
                  const link = near.get(id);
                  const lit = scope.has(id) || !!link;
                  const { title, spill, small } = fitTitle(b.label);
                  const sub = link
                    ? firstLine(link.label ?? SAYS[link.state])
                    : (spill ?? (b.sub ? firstLine(b.sub) : undefined));
                  return (
                    <g
                      key={id}
                      className={EASE}
                      opacity={lit ? 1 : b.dim ? 0.2 : 0.3}
                      {...selectable(b.label, () => setSelected(id))}
                    >
                      <rect
                        className={cn(
                          b.ghost ? "ghost" : ["n", b.hue],
                          id === selected && "sel",
                        )}
                        x={x}
                        y={y}
                        width={COL_W}
                        height={CHIP_H}
                        rx={2}
                      />
                      <text
                        className={b.ghost ? "t f" : "t"}
                        x={x + 14}
                        y={sub ? y + 22 : y + CHIP_H / 2 + 5}
                        style={small ? { fontSize: 13.5 } : undefined}
                      >
                        {title}
                      </text>
                      {sub && (
                        <text
                          className={cn(
                            "s",
                            link?.state === "broken" && "flt",
                            (link?.state === "idle" || (!link && b.ghost)) &&
                              "f",
                          )}
                          x={x + 14}
                          y={y + 41}
                        >
                          {sub}
                        </text>
                      )}
                      {b.defects && (
                        <Tag
                          x={x + COL_W}
                          y={y - 6}
                          ids={b.defects}
                          closed={new Set()}
                        />
                      )}
                    </g>
                  );
                }),
              )}
            </svg>
          </div>

          <nav
            aria-label="Where the components live"
            className="border-rule border-t p-4 sm:p-5 lg:border-t-0 lg:border-l"
          >
            <p className="text-ink-muted mb-3 text-[13px] font-semibold">
              Where they live
            </p>
            <ul className="space-y-0.5">
              {tree.map(({ group, depth }) => {
                const link = near.get(group.id);
                const holds = chain.includes(group.id);
                const current = group.id === selected;
                const inside = !current && scope.has(group.id);
                return (
                  <li key={group.id} style={{ paddingLeft: depth * 14 }}>
                    <button
                      type="button"
                      onClick={() => setSelected(group.id)}
                      aria-current={current ? "true" : undefined}
                      className={cn(
                        "hover:bg-sunk/60 w-full border-l-2 py-1 pr-1 pl-2.5 text-left text-[14px] leading-[1.35] transition-colors",
                        current
                          ? "border-l-accent text-accent font-bold"
                          : holds
                            ? "border-l-accent text-ink font-semibold"
                            : inside
                              ? "text-ink border-l-transparent"
                              : link
                                ? cn("border-l-transparent", TEXT[link.state])
                                : "text-ink-muted border-l-transparent",
                      )}
                    >
                      {group.label}
                      {link && (
                        <span className="text-ink-muted block font-mono text-[12.5px] font-normal">
                          {link.label ?? SAYS[link.state]}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="text-ink-muted mt-4 text-[13px] leading-[1.5]">
              A blue edge marks the scopes around the part you picked. Pick a
              scope to light everything inside it.
            </p>
          </nav>
        </div>
      </DiagramFrame>

      <section aria-live="polite" className="border-rule border-t">
        {box && sheet && (
          <div key={selected} className="animate-fade-in">
            <div className="flex flex-wrap items-start justify-between gap-3 pt-4 pb-4">
              <div className="min-w-0">
                <h3 className="dd-head text-ink text-[26px]">{box.label}</h3>
                {box.sub && (
                  <p className="text-ink-muted mt-2 font-mono text-[13px]">
                    {box.sub}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {box.defects?.map((d) => (
                  <DefectLink key={d} id={d} />
                ))}
                <span className="border-rule-strong text-ink border px-2 py-1 text-[13.5px] font-semibold">
                  {sheet.section}
                </span>
              </div>
            </div>
            <p className="text-ink-body max-w-[68ch] text-[17px] leading-[1.6] text-pretty">
              {sheet.purpose}
            </p>
            <dl className="border-rule divide-rule mt-6 divide-y border-y">
              <Walk label="Reached from">
                <Links
                  items={incoming.map((c) => ({
                    id: c.from,
                    c,
                    via: isGroup ? `into ${boxes.get(c.to)?.label}` : undefined,
                  }))}
                  boxes={boxes}
                  onPick={setSelected}
                />
              </Walk>
              <Walk label="Reaches">
                <Links
                  items={outgoing.map((c) => ({
                    id: c.to,
                    c,
                    via: isGroup
                      ? `from ${boxes.get(c.from)?.label}`
                      : undefined,
                  }))}
                  boxes={boxes}
                  onPick={setSelected}
                />
              </Walk>
              <Walk label="Lives in">
                {chain.length ? (
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    {[...chain].reverse().map((id, i) => (
                      <span
                        key={id}
                        className="inline-flex items-baseline gap-2"
                      >
                        {i > 0 && <span className="text-ink-faint">›</span>}
                        <Pick onClick={() => setSelected(id)}>
                          {boxes.get(id)?.label ?? id}
                        </Pick>
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-ink-muted">
                    {box.hue === "plum"
                      ? "Outside your VPC - run by Google"
                      : isGroup
                        ? "Nothing - it is the outermost scope"
                        : "Outside Google"}
                  </span>
                )}
              </Walk>
            </dl>
            <div className="mt-6">
              <FactList facts={sheet.facts} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Walk({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-5">
      <dt className="text-ink-muted text-[15px]">{label}</dt>
      <dd className="text-[15.5px] leading-[1.6]">{children}</dd>
    </div>
  );
}

function Pick({
  onClick,
  className,
  children,
}: {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "decoration-rule-strong hover:decoration-accent font-semibold underline underline-offset-4 transition-colors",
        className ?? "text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Links({
  items,
  boxes,
  onPick,
}: {
  /** `via`: for a picked scope, the part inside it the connection meets. */
  items: { id: string; c: Connection; via?: string }[];
  boxes: Map<string, ArchGroup | ArchNode>;
  onPick: (id: string) => void;
}) {
  if (!items.length)
    return <span className="text-ink-muted">Nothing, as found</span>;
  return (
    <span className="flex flex-col gap-1">
      {items.map(({ id, c, via }) => (
        <span
          key={`${c.from}|${c.to}`}
          className="flex flex-wrap items-baseline gap-x-2"
        >
          <Pick onClick={() => onPick(id)} className={TEXT[c.state]}>
            {boxes.get(id)?.label ?? id}
          </Pick>
          <span
            className={cn(
              "font-mono text-[13px]",
              c.state === "broken" ? "text-fault" : "text-ink-muted",
            )}
          >
            {c.label ?? SAYS[c.state]}
          </span>
          {via && <span className="text-ink-muted text-[14px]">{via}</span>}
        </span>
      ))}
    </span>
  );
}
