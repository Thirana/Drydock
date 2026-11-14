"use client";

import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Tag } from "@/components/site/landing/harbour-drawing";
import { arrowHead } from "@/components/learn/diagram-defs";
import { cn } from "@/lib/utils";

/** What a journey drawing needs to know about the walk: the state, and where the reader is. */
export interface Walk {
  fixed: boolean;
  closed: ReadonlySet<string>;
  /** Stops a visible hop fails at. */
  failing: ReadonlySet<string>;
  /** Stop id → its number on the route, for the stops on this state's route. */
  order: ReadonlyMap<string, number>;
  /** The stop of the hop being read. */
  current?: string;
  /** Drawn small, as a locator: boxes, wires and numbers, no words. */
  mini?: boolean;
  /** Opens the hop at a numbered stop when the stop is clicked. */
  onPick?: (id: string) => void;
}

const WalkContext = createContext<Walk>({
  fixed: false,
  closed: new Set(),
  failing: new Set(),
  order: new Map(),
});

export const WalkProvider = WalkContext.Provider;
export const useWalk = () => useContext(WalkContext);

type Hue = "plum" | "teal" | "green" | "amber";

const EASE = "transition-[opacity,fill,stroke] duration-300";

/** The route number on a stop's top-left corner: blue while read, red where it breaks. */
function Badge({
  x,
  y,
  n,
  current,
  broken,
}: {
  x: number;
  y: number;
  n: number;
  current: boolean;
  broken: boolean;
}) {
  // A locator is drawn at a third of the size, so its numbers grow to stay legible.
  const { mini } = useWalk();
  return (
    <g aria-hidden="true">
      <circle
        className={cn(broken && !current ? "bad" : "badge", current && "cur")}
        cx={x}
        cy={y}
        r={mini ? 26 : 11}
        style={current ? { fill: "var(--dd-accent)" } : undefined}
      />
      <text
        className="bn"
        x={x}
        y={y + (mini ? 10 : 4)}
        style={{
          ...(broken || current ? {} : { fill: "var(--dd-ink)" }),
          ...(mini ? { fontSize: "30px" } : {}),
        }}
      >
        {n}
      </text>
    </g>
  );
}

/** Click handling for a numbered stop, when the walk takes clicks. */
function usePick(
  id: string,
  numbered: boolean,
): { onClick?: () => void; style?: CSSProperties } {
  const { onPick } = useWalk();
  if (!onPick || !numbered) return {};
  return {
    onClick: () => onPick(id),
    style: { cursor: "pointer" },
  };
}

/**
 * A box the journey can stop at. Its id is the stop's id in the journey, so
 * the drawing numbers it, reddens it where a hop fails, and outlines it in
 * blue while its hop is read. Text sits where the course drawings put it.
 */
export function Stop({
  id,
  x,
  y,
  w,
  h,
  title,
  lines = [],
  hue,
  tags,
  dim,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines?: ReactNode[];
  hue?: Hue;
  /** Defect IDs on the box's top-right edge. */
  tags?: string[];
  /** Not part of the journey in this state. */
  dim?: boolean;
}) {
  const { failing, order, current, closed } = useWalk();
  const n = order.get(id);
  const broken = failing.has(id);
  const isCurrent = current === id;
  const pick = usePick(id, n !== undefined);
  return (
    <g
      {...pick}
      style={{ ...pick.style, opacity: dim ? 0.4 : 1 }}
      className={EASE}
    >
      <rect
        className={cn("n", hue, broken && "fault", isCurrent && "cur", EASE)}
        x={x}
        y={y}
        width={w}
        height={h}
        rx="2"
      />
      <text className="t" x={x + 16} y={y + 26}>
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={i} className="s" x={x + 16} y={y + 47 + i * 20}>
          {l}
        </text>
      ))}
      {tags && <Tag x={x + w} y={y - 7} ids={tags} closed={closed} />}
      {n !== undefined && (
        <Badge x={x} y={y} n={n} current={isCurrent} broken={broken} />
      )}
    </g>
  );
}

/** A stop that is a boundary, not a box: a subnet the journey passes through. */
export function ZoneStop({
  id,
  x,
  y,
  w,
  h,
  label,
  sub,
  subFault,
  tags,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  /** The sub-line names the fault. */
  subFault?: boolean;
  tags?: string[];
}) {
  const { failing, order, current, closed, mini } = useWalk();
  const n = order.get(id);
  const broken = failing.has(id);
  const isCurrent = current === id;
  const pick = usePick(id, n !== undefined);
  return (
    <g {...pick}>
      <rect
        className={cn("zone", broken && "fault", EASE)}
        x={x}
        y={y}
        width={w}
        height={h}
        rx="2"
        style={
          isCurrent
            ? {
                stroke: "var(--dd-accent)",
                strokeWidth: mini ? 7 : 2.5,
                strokeDasharray: "none",
              }
            : undefined
        }
      />
      <text className="s" x={x + 16} y={y + 22}>
        {label}
      </text>
      {sub && (
        <text className={cn("s", subFault && "flt")} x={x + 16} y={y + 40}>
          {sub}
        </text>
      )}
      {tags && <Tag x={x + w - 8} y={y + 22} ids={tags} closed={closed} />}
      {n !== undefined && (
        <Badge x={x} y={y} n={n} current={isCurrent} broken={broken} />
      )}
    </g>
  );
}

/** A box that is not a stop: context the journey passes by. */
export function Plain({
  x,
  y,
  w,
  h,
  title,
  lines = [],
  hue,
  broken,
  dim,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines?: ReactNode[];
  hue?: Hue;
  broken?: boolean;
  dim?: boolean;
}) {
  return (
    <g style={{ opacity: dim ? 0.4 : 1 }} className={EASE}>
      <rect
        className={cn("n", hue, broken && "fault", EASE)}
        x={x}
        y={y}
        width={w}
        height={h}
        rx="2"
      />
      <text className="t" x={x + 16} y={y + 26}>
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={i} className="s" x={x + 16} y={y + 47 + i * 20}>
          {l}
        </text>
      ))}
    </g>
  );
}

/** A labelled boundary: outside GCP, a VPC, Google's side. */
export function Zone({
  x,
  y,
  w,
  h,
  label,
  hue,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  hue?: "teal" | "plum";
}) {
  return (
    <g>
      <rect
        className={cn("zone", hue)}
        x={x}
        y={y}
        width={w}
        height={h}
        rx="2"
      />
      <text className="s" x={x + 16} y={y + 22}>
        {label}
      </text>
    </g>
  );
}

/**
 * A wire, always 90° elbows. `ok` is traffic that is allowed and arrives,
 * `broken` a path that should not exist or does not work, `idle` one that
 * exists but this journey does not use.
 */
export function Wire({
  d,
  state = "ok",
}: {
  d: string;
  state?: "ok" | "broken" | "idle";
}) {
  return (
    <path
      className={cn(
        "w",
        state === "ok" && "green",
        state === "broken" && "fault dash",
        state === "idle" && "dash",
        EASE,
      )}
      d={d}
      markerEnd={arrowHead(
        state === "ok" ? "green" : state === "broken" ? "fault" : "muted",
      )}
    />
  );
}

/** Words on a wire; red when they name the fault. */
export function Words({
  x,
  y,
  children,
  fault,
  end,
}: {
  x: number;
  y: number;
  children: ReactNode;
  fault?: boolean;
  end?: boolean;
}) {
  return (
    <text
      // `.l` would keep its muted ink over `.flt`, so fault words take only `.flt`.
      className={fault ? "flt halo" : "l halo"}
      x={x}
      y={y}
      style={{
        fontSize: "13px",
        fontWeight: 600,
        textAnchor: end ? "end" : undefined,
      }}
    >
      {children}
    </text>
  );
}

/** A cross where a path is stopped. */
export function Cross({ x, y }: { x: number; y: number }) {
  return (
    <text className="x halo" x={x} y={y + 6}>
      ✕
    </text>
  );
}
