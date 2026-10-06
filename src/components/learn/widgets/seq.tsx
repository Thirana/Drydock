"use client";

import { useState } from "react";
import { arrowHead, type ArrowHue } from "../diagram-defs";
import data from "./data/fundamentals.json";
import type { SeqRow, SeqSet, SeqSim } from "./data/types";
import { Action, Choices } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Sequence diagrams: two machines, time running down, messages as arrows.
 * Used by the TCP, TLS, WebSocket, CORS and SSH chapters. Arrow colours
 * follow the notes: the data or request in amber, ACKs and replies in
 * green, application data in plum; a lost message ends in a red cross.
 */

const SETS = data.SEQSETS as unknown as Record<string, SeqSet>;
const LIFE = data.LIFE as SeqRow[];
const SIMS = data.SIMS as unknown as Record<string, SeqSim>;

/** The notes' arrow colours, as drawing hues. */
export function seqHue(c?: string): ArrowHue {
  switch (c ?? "orange") {
    case "orange":
      return "amber";
    case "green":
      return "green";
    case "purple":
      return "plum";
    case "cyan":
    case "blue":
      return "teal";
    case "red":
      return "fault";
    default:
      return "muted";
  }
}

/** The drawing itself: left lane, right lane, one row per message. */
export function SeqDrawing({
  left,
  right,
  rows,
  current,
}: {
  left: string;
  right: string;
  rows: SeqRow[];
  /** Row to draw heavier, in step-through diagrams. */
  current?: number;
}) {
  const cx = 260;
  const sx = 660;
  const top = 78;
  const gap = 52;
  const H = top + rows.length * gap + 14;
  return (
    <svg viewBox={`0 0 920 ${H}`} role="img" aria-label={`Sequence diagram between ${left} and ${right}`}>
      <rect className="n plum" x={cx - 110} y="8" width="220" height="42" rx="2" />
      <text className="t mid" x={cx} y="34">{left}</text>
      <rect className="n green" x={sx - 110} y="8" width="220" height="42" rx="2" />
      <text className="t mid" x={sx} y="34">{right}</text>
      <line className="w dash" x1={cx} y1="50" x2={cx} y2={H - 6} />
      <line className="w dash" x1={sx} y1="50" x2={sx} y2={H - 6} />
      {rows.map((r, i) => {
        const y = top + i * gap;
        const hue = seqHue(r.c);
        const strong = current === i;
        return (
          <g key={i}>
            {r.d === "note" ? (
              <text className="s mid halo" x="460" y={y + 12} fontStyle="italic">
                {r.t}
              </text>
            ) : (
              <>
                {r.lost ? (
                  <>
                    <line
                      className={`w ${hue}`}
                      x1={r.d === "r" ? cx + 2 : sx - 2}
                      y1={y}
                      x2="460"
                      y2={y + 7}
                    />
                    <text className="x" x="464" y={y + 13}>✕</text>
                  </>
                ) : (
                  <line
                    className={`w ${hue}`}
                    x1={r.d === "r" ? cx + 2 : sx - 2}
                    y1={y}
                    x2={r.d === "r" ? sx - 4 : cx + 4}
                    y2={y + 14}
                    markerEnd={arrowHead(hue)}
                    strokeWidth={strong ? 2.5 : undefined}
                  />
                )}
                <text className={strong ? "l mid halo cur" : "l mid halo"} x="460" y={y - 6}>
                  {r.t}
                </text>
                {r.s && (
                  <text className="s mid" x="460" y={y + 30}>
                    {r.s}
                  </text>
                )}
              </>
            )}
            {r.cs && (
              <text className="s" x={cx - 12} y={y + 10} textAnchor="end">
                {r.cs}
              </text>
            )}
            {r.ss && (
              <text className="s" x={sx + 12} y={y + 10}>
                {r.ss}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Frame({ wide, label, children }: { wide?: boolean; label: string; children: React.ReactNode }) {
  return (
    <WidgetFrame wide={wide} label={label}>
      <div className="dd-fig">{children}</div>
    </WidgetFrame>
  );
}

/** A named diagram from the notes: "handshake", "close", "tls13" and so on. */
export function SeqDiagram({ set, wide }: { set: string; wide?: boolean }) {
  const s = SETS[set];
  if (!s) throw new Error(`SeqDiagram: no set "${set}"`);
  const [left, right, rows] = s;
  return (
    <Frame wide={wide} label={`Sequence: ${left} and ${right}`}>
      <SeqDrawing left={left} right={right} rows={rows} />
    </Frame>
  );
}

/** Two or more diagrams of the same exchange, switched by name. */
export function SeqToggle({ sets, labels, wide }: { sets: string; labels: string; wide?: boolean }) {
  const names = sets.split(",");
  const titles = labels.split(",");
  const [at, setAt] = useState(0);
  const [left, right, rows] = SETS[names[at]];
  return (
    <WidgetFrame wide={wide} label="Compare two exchanges">
      <Choices label="Version" value={at} onChange={setAt} options={titles.map((t, i) => ({ value: i, label: t }))} />
      <div className="dd-fig mt-4" aria-live="polite">
        <SeqDrawing left={left} right={right} rows={rows} />
      </div>
    </WidgetFrame>
  );
}

/** A TCP connection's whole life, one message at a time, with both sides' states. */
export function TcpLife({ wide }: { wide?: boolean }) {
  const [k, setK] = useState(0);
  let client = "CLOSED";
  let server = "CLOSED";
  for (let i = 0; i <= k; i++) {
    if (LIFE[i].cs) client = LIFE[i].cs!;
    if (LIFE[i].ss) server = LIFE[i].ss!;
  }
  return (
    <WidgetFrame wide={wide} label="The life of a TCP connection">
      <div className="flex flex-wrap items-center gap-2">
        <Action onClick={() => setK((x) => Math.max(0, x - 1))}>← Back</Action>
        <Action primary onClick={() => setK((x) => Math.min(LIFE.length - 1, x + 1))}>
          Next step →
        </Action>
        <span className="text-ink-muted ml-2 font-mono text-[13px]">
          step {k + 1} of {LIFE.length}
        </span>
      </div>
      <div aria-live="polite">
        <p className="text-ink-muted mt-4 flex flex-wrap gap-x-8 font-mono text-[13.5px]">
          <span>
            Laptop: <b className="text-ink">{client}</b>
          </span>
          <span>
            kade-api: <b className="text-ink">{server}</b>
          </span>
        </p>
        <p className="text-ink-body mt-2 text-[15.5px] leading-[1.55] text-pretty">{LIFE[k].x}</p>
      </div>
      <div className="dd-fig mt-3">
        <SeqDrawing left="Laptop" right="kade-api" rows={LIFE.slice(0, k + 1)} current={k} />
      </div>
    </WidgetFrame>
  );
}

/** How ACKs behave when all is well, when a segment is lost, and so on. */
export function SeqSimulator({ wide }: { wide?: boolean }) {
  const keys = Object.keys(SIMS);
  const [cur, setCur] = useState(keys[0]);
  const sim = SIMS[cur];
  return (
    <WidgetFrame wide={wide} label="Sequence and acknowledgement numbers">
      <Choices label="Case" value={cur} onChange={setCur} options={keys.map((k) => ({ value: k, label: SIMS[k].n }))} />
      <div aria-live="polite">
        <p className="text-ink-body mt-4 text-[15.5px] leading-[1.55] text-pretty">{sim.x}</p>
        <div className="dd-fig mt-3">
          <SeqDrawing left="Laptop (sender)" right="kade-api (receiver)" rows={sim.rows} />
        </div>
      </div>
    </WidgetFrame>
  );
}

/** Several machines in a row, messages between any two (DNS, mail, proxies). */
export function MultiSeqDrawing({
  lanes,
  rows,
}: {
  lanes: { t: string; c: string }[];
  rows: ({ note: string } | { f: number; t: number; l: string; c?: string })[];
}) {
  const n = lanes.length;
  const x0 = 90;
  const x1 = 830;
  const X = (i: number) => (n === 1 ? 460 : x0 + (i * (x1 - x0)) / (n - 1));
  const top = 78;
  const gap = 50;
  const H = top + rows.length * gap + 10;
  const bw = Math.min(170, (x1 - x0) / Math.max(1, n - 1) - 14);
  return (
    <svg viewBox={`0 0 920 ${H}`} role="img" aria-label={`Sequence between ${lanes.map((l) => l.t).join(", ")}`}>
      {lanes.map((l, i) => {
        const hue = seqHue(l.c);
        return (
          <g key={i}>
            <rect className={hue === "muted" || hue === "fault" ? "n" : `n ${hue}`} x={X(i) - bw / 2} y="8" width={bw} height="46" rx="2" />
            <text className="mid" x={X(i)} y="36" fontSize="12.5">
              {l.t}
            </text>
            <line className="w dash" x1={X(i)} y1="54" x2={X(i)} y2={H - 4} />
          </g>
        );
      })}
      {rows.map((r, i) => {
        const y = top + i * gap;
        if ("note" in r)
          return (
            <text key={i} className="s mid halo" x="460" y={y + 6} fontStyle="italic">
              {r.note}
            </text>
          );
        const a = X(r.f);
        const b = X(r.t);
        const dir = b > a ? 1 : -1;
        const hue = seqHue(r.c);
        return (
          <g key={i}>
            <line
              className={`w ${hue}`}
              x1={a + dir * 3}
              y1={y}
              x2={b - dir * 5}
              y2={y + 10}
              markerEnd={arrowHead(hue)}
            />
            <text className="l mid halo" x={(a + b) / 2} y={y - 6}>
              {r.l}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
