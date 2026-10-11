import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { legible } from "../../legible";
import { arrowHead, type ArrowHue } from "../../diagram-defs";

/*
 * Drawing pieces for the GCP widgets. The notes name colours (blue, purple,
 * orange...); the course legend gives them meaning (DESIGN.md, Drawing hues):
 * teal your VPC, plum run by Google, amber firewall and access rules, green
 * allowed traffic and replies, ink for networks outside GCP, red for problems.
 */

export type Colour = "blue" | "purple" | "orange" | "green" | "red" | "cyan" | "yellow" | "muted" | "";

const BOX: Record<string, string | undefined> = {
  blue: "teal",
  purple: "plum",
  orange: "amber",
  green: "green",
  red: "fault",
  yellow: "mark",
};
const WIRE: Record<string, ArrowHue> = {
  blue: "teal",
  purple: "plum",
  orange: "amber",
  green: "green",
  red: "fault",
};

/** The box class for a notes colour. */
export const boxHue = (c?: string) => (c ? BOX[c] : undefined);
/** The wire and arrowhead hue for a notes colour (outside networks and grey stay muted). */
export const wireHue = (c?: string): ArrowHue => (c && WIRE[c]) || "muted";

/** A box. `c` is a notes colour; `className` adds state (cur, src, dst, off). */
export function Box({
  x,
  y,
  w,
  h,
  c,
  className,
  style,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  c?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return <rect className={cn("n", boxHue(c), className)} x={x} y={y} width={w} height={h} rx="2" style={style} />;
}

/** A dashed boundary: a VPC, a region, a zone. */
export function Zone({ x, y, w, h, c }: { x: number; y: number; w: number; h: number; c?: string }) {
  const hue = c === "blue" ? "teal" : c === "purple" ? "plum" : c === "red" ? "fault" : undefined;
  return <rect className={cn("zone", hue)} x={x} y={y} width={w} height={h} rx="2" />;
}

/**
 * Text. `k` takes the notes' classes: t (title), s (sub-line), f (faint),
 * mid, bn (on a dot), and c-red for words about something broken. Other
 * colour classes are dropped: text in a drawing stays in ink.
 */
export function T({
  x,
  y,
  k = "s",
  size,
  bold,
  end,
  children,
  className,
}: {
  x: number;
  y: number;
  k?: string;
  size?: number;
  bold?: boolean;
  end?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const cls = k
    .split(/\s+/)
    .map((c) => (c === "c-red" ? "flt" : c.startsWith("c-") ? "" : c))
    .filter(Boolean);
  return (
    <text
      className={cn(cls, className)}
      x={x}
      y={y}
      style={{
        ...(size ? { fontSize: `${legible(size)}px` } : null),
        ...(bold ? { fontWeight: 600 } : null),
        ...(end ? { textAnchor: "end" } : null),
      }}
    >
      {children}
    </text>
  );
}

/** A wire, with an arrowhead unless `plain`. */
export function Wire({
  x1,
  y1,
  x2,
  y2,
  c,
  dash,
  plain,
  cur,
  width,
  start,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c?: string;
  dash?: boolean;
  plain?: boolean;
  cur?: boolean;
  width?: number;
  /** Arrowheads at both ends. */
  start?: boolean;
}) {
  const hue: ArrowHue = cur ? "accent" : wireHue(c);
  return (
    <line
      className={cn("w", cur ? "cur" : hue !== "muted" && hue, dash && "dash")}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      strokeWidth={width}
      markerEnd={plain ? undefined : arrowHead(hue)}
      markerStart={start ? arrowHead(hue) : undefined}
    />
  );
}

/** A tick or a cross in a dot: ink when it passes, red when it is stopped. */
export function Mark({ cx, cy, ok, r = 11 }: { cx: number; cy: number; ok: boolean; r?: number }) {
  return (
    <>
      <circle className={ok ? "ok" : "bad"} cx={cx} cy={cy} r={r} />
      <text className="bn" x={cx} y={cy + 4} style={{ fontSize: "13px" }}>
        {ok ? "✓" : "✕"}
      </text>
    </>
  );
}

/** A small capitals heading inside a drawing ("CONNECTION TABLE"). */
export function Caps({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <text className="f" x={x} y={y} style={{ fontSize: `${legible(11)}px`, letterSpacing: ".05em" }}>
      {children}
    </text>
  );
}

/** The drawing itself: a viewBox, an accessible name, the figure styles. */
export function Drawing({
  w = 960,
  h,
  label,
  children,
  className,
}: {
  w?: number;
  h: number;
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("dd-fig", className)}>
      <svg viewBox={`0 0 ${w} ${h}`} role={label ? "img" : undefined} aria-label={label}>
        {children}
      </svg>
    </div>
  );
}

export type BarTone = "ok" | "bad" | "warn" | "wait" | "off";
/** A span on a timeline: from, to, how it is going, and its words. */
export type Bar = [from: number, to: number, tone: BarTone, label?: string];

const BAR_CLASS: Record<BarTone, string> = {
  ok: "n green",
  bad: "n fault",
  warn: "n mark",
  wait: "n dash",
  off: "n",
};

/**
 * Lanes of spans over time: a VM serving, booting, draining, failing. Green
 * is serving, red is failing, the highlighter is a warning, dashes are waiting.
 */
export function Timeline({
  span,
  lanes,
  ticks,
  tick = (t) => `${t} s`,
  marks = [],
  extra,
  x0 = 170,
  label,
}: {
  span: [number, number];
  lanes: { label: string; sub?: string; bars: Bar[] }[];
  ticks: number[];
  tick?: (t: number) => string;
  /** Vertical lines at a moment, with words at the top. */
  marks?: { at: number; text: string; fault?: boolean }[];
  /** More drawing, given the time-to-x scale. */
  extra?: (at: (t: number) => number) => ReactNode;
  x0?: number;
  label: string;
}) {
  const at = (t: number) => x0 + ((t - span[0]) / (span[1] - span[0])) * (930 - x0);
  const top = 30;
  const bottom = top + 60 * lanes.length;
  return (
    <Drawing h={bottom + 24} label={label}>
      {marks.map((m) => (
        <g key={m.at}>
          <line className={cn("w dash", m.fault && "fault")} x1={at(m.at)} y1={top - 10} x2={at(m.at)} y2={bottom - 14} />
          <T x={at(m.at) + 4} y={top - 14} k={m.fault ? "s c-red" : "s"} bold size={11}>
            {m.text}
          </T>
        </g>
      ))}
      {lanes.map((lane, i) => {
        const y = top + 60 * i;
        return (
          <g key={lane.label}>
            <T x={16} y={y + 16} k="t" size={12.5}>
              {lane.label}
            </T>
            {lane.sub && (
              <T x={16} y={y + 34} k="f" size={11}>
                {lane.sub}
              </T>
            )}
            {lane.bars.map(([a, b, tone, words], j) => (
              <g key={j}>
                <rect className={BAR_CLASS[tone]} x={at(a)} y={y} width={Math.max(at(b) - at(a) - 2, 2)} height={30} rx="2" />
                {words && at(b) - at(a) > 6.6 * words.length + 14 && (
                  <T x={at(a) + 8} y={y + 20} k={tone === "bad" ? "s c-red" : "s"} bold={tone === "ok"} size={11}>
                    {words}
                  </T>
                )}
              </g>
            ))}
          </g>
        );
      })}
      {extra?.(at)}
      {ticks.map((t) => (
        <T key={t} x={at(t)} y={bottom + 12} k="f mid" size={11}>
          {tick(t)}
        </T>
      ))}
    </Drawing>
  );
}
