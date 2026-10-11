"use client";

import { useId, useState } from "react";
import { Select } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Chapter 20's charts: congestion windows over time. One line chart, drawn
 * in the page's hairlines; series take drawing hues and are named in a key,
 * so colour is never the only way to tell them apart (dashes help too).
 */

type Tone = "amber" | "teal" | "green" | "plum" | "fault" | "faint";

const STROKE: Record<Tone, string> = {
  amber: "var(--dd-amber)",
  teal: "var(--dd-teal)",
  green: "var(--dd-green)",
  plum: "var(--dd-plum)",
  fault: "var(--dd-fault)",
  faint: "var(--dd-ink-faint)",
};

interface Series {
  p: [number, number, (string | number)?][];
  c: Tone;
  t?: string;
  dash?: string;
  w?: number;
  dots?: boolean;
  vals?: boolean;
  area?: boolean;
}

interface ChartSpec {
  x0?: number;
  x1: number;
  y1: number;
  xt: number[];
  xl?: string[];
  yt: number[];
  xlab: string;
  ylab: string;
  bands?: { a: number; b: number; c: Tone; t: string }[];
  hl?: { y: number; c: Tone; t: string; below?: boolean; left?: boolean }[];
  marks?: { x: number; y: number; c: Tone; t?: string }[];
  series: Series[];
  aria: string;
}

export function LineChart(o: ChartSpec) {
  const W = 920;
  const H = 330;
  const L = 72;
  const R = 24;
  const T = 48;
  const B = 54;
  const pw = W - L - R;
  const ph = H - T - B;
  const x0 = o.x0 ?? 0;
  const X = (x: number) => L + ((x - x0) / (o.x1 - x0)) * pw;
  const Y = (y: number) => T + ph - (y / o.y1) * ph;
  // Legend entries laid out left to right, each as wide as its words.
  const legend = o.series
    .filter((sr) => sr.t)
    .reduce<{ sr: Series; x: number }[]>((acc, sr) => {
      const prev = acc[acc.length - 1];
      return [...acc, { sr, x: prev ? prev.x + 40 + prev.sr.t!.length * 7.2 : L }];
    }, []);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={o.aria}>
      {o.bands?.map((b) => (
        <g key={b.t + b.a}>
          <rect x={X(b.a)} y={T} width={X(b.b) - X(b.a)} height={ph} style={{ fill: STROKE[b.c], opacity: 0.08 }} />
          <text className="s" x={X(b.a) + 6} y={T + 14}>{b.t}</text>
        </g>
      ))}
      {o.yt.map((v) => (
        <g key={v}>
          <line x1={L} y1={Y(v)} x2={L + pw} y2={Y(v)} style={{ stroke: "var(--dd-rule)" }} />
          <text className="s" x={L - 8} y={Y(v) + 4} textAnchor="end">{v}</text>
        </g>
      ))}
      {o.xt.map((v, i) => (
        <text key={v} className="s mid" x={X(v)} y={T + ph + 18}>{o.xl ? o.xl[i] : v}</text>
      ))}
      <line className="w" x1={L} y1={T + ph} x2={L + pw} y2={T + ph} />
      <line className="w" x1={L} y1={T} x2={L} y2={T + ph} />
      <text className="l mid" x={L + pw / 2} y={H - 8}>{o.xlab}</text>
      <text className="l" transform={`translate(16 ${T + ph / 2}) rotate(-90)`} textAnchor="middle">{o.ylab}</text>
      {o.hl?.map((h) => (
        <g key={h.t + h.y}>
          <line x1={L} y1={Y(h.y)} x2={L + pw} y2={Y(h.y)} style={{ stroke: STROKE[h.c], strokeWidth: 1.5, strokeDasharray: "6 5" }} />
          <text className="s halo" x={h.left ? L + 8 : L + pw - 6} y={Y(h.y) + (h.below ? 16 : -6)} textAnchor={h.left ? "start" : "end"}>
            {h.t}
          </text>
        </g>
      ))}
      {o.series.map((sr, k) => {
        const pts = sr.p.map((q) => `${X(q[0]).toFixed(1)},${Y(Math.min(q[1], o.y1)).toFixed(1)}`).join(" ");
        return (
          <g key={k}>
            {sr.area && (
              <polygon
                points={`${X(sr.p[0][0])},${Y(0)} ${pts} ${X(sr.p[sr.p.length - 1][0])},${Y(0)}`}
                style={{ fill: STROKE[sr.c], opacity: 0.12 }}
              />
            )}
            <polyline
              points={pts}
              style={{ fill: "none", stroke: STROKE[sr.c], strokeWidth: sr.w ?? 2.4, strokeDasharray: sr.dash, strokeLinejoin: "round" }}
            />
            {sr.dots &&
              sr.p.map((q, i) => (
                <g key={i}>
                  <circle cx={X(q[0])} cy={Y(q[1])} r="4" style={{ fill: "var(--dd-ground)", stroke: STROKE[sr.c], strokeWidth: 2 }} />
                  {sr.vals && (
                    <text className="s mid halo" x={X(q[0])} y={Y(q[1]) - 10}>{q[2] ?? q[1]}</text>
                  )}
                </g>
              ))}
          </g>
        );
      })}
      {o.marks?.map((m, i) => (
        <g key={i}>
          <text className="mid" x={X(m.x)} y={Y(m.y) + 5} style={{ fill: STROKE[m.c], fontSize: 15.0, fontWeight: 700 }}>✕</text>
          {m.t && <text className="s halo" x={X(m.x) + 8} y={Y(m.y) - 8}>{m.t}</text>}
        </g>
      ))}
      {legend.map(({ sr, x }) => (
        <g key={sr.t}>
          <line x1={x} y1="16" x2={x + 22} y2="16" style={{ stroke: STROKE[sr.c], strokeWidth: 3, strokeDasharray: sr.dash }} />
          <text className="s" x={x + 28} y="20">{sr.t}</text>
        </g>
      ))}
    </svg>
  );
}

const CHARTS: Record<string, () => { spec: ChartSpec; caption: string }> = {
  slowstart() {
    const a: [number, number][] = [[0, 10], [1, 20], [2, 40], [3, 80]];
    for (let t = 4; t <= 12; t++) a.push([t, 80 + (t - 3)]);
    const b: [number, number][] = [[0, 1], [1, 2], [2, 4], [3, 8], [4, 16], [5, 32], [6, 64], [7, 80]];
    for (let t = 8; t <= 12; t++) b.push([t, 80 + (t - 7)]);
    return {
      spec: {
        x1: 12, y1: 100, xt: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], yt: [0, 20, 40, 60, 80, 100],
        xlab: "round trips", ylab: "cwnd (segments)",
        bands: [
          { a: 0, b: 3, c: "plum", t: "slow start (today)" },
          { a: 3, b: 12, c: "green", t: "congestion avoidance: +1 per round trip" },
        ],
        hl: [{ y: 80, c: "fault", t: "ssthresh = 80", below: true }],
        series: [
          { p: a, c: "amber", t: "start at 10 segments (today)", dots: true },
          { p: b, c: "teal", t: "start at 1 (textbook)", dash: "6 4", dots: true },
        ],
        aria: "Slow start doubling then linear growth",
      },
      caption:
        "Both lines double every round trip until ssthresh, then grow by one segment per round trip. Starting at 10 reaches full speed 3 to 4 round trips sooner, about 150 ms on the 41 ms path to kade-api.",
    };
  },
  fair() {
    let A = 50;
    let B = 4;
    const pa: [number, number][] = [];
    const pb: [number, number][] = [];
    for (let t = 0; t <= 70; t++) {
      pa.push([t, A]);
      pb.push([t, B]);
      if (A + B > 60) {
        A /= 2;
        B /= 2;
        pa.push([t, A]);
        pb.push([t, B]);
      } else {
        A += 1;
        B += 1;
      }
    }
    return {
      spec: {
        x1: 70, y1: 70, xt: [0, 10, 20, 30, 40, 50, 60, 70], yt: [0, 10, 20, 30, 40, 50, 60, 70],
        xlab: "round trips", ylab: "cwnd (segments)",
        hl: [{ y: 30, c: "green", t: "fair share = 30 each" }],
        series: [
          { p: pa, c: "amber", t: "backup job (started big)" },
          { p: pb, c: "teal", t: "new download", dash: "6 4" },
        ],
        aria: "Two AIMD flows converge to equal shares",
      },
      caption:
        "The link fits 60 segments per round trip in total. Each overflow halves both flows. The gap between them halves too, while +1 each keeps it the same, so after a few cycles both sawtooth around the same share.",
    };
  },
  minwin() {
    const rw = (t: number) => (t >= 24 && t < 40 ? 18 : 60);
    const c: [number, number][] = [];
    let cw = 10;
    let sth = 1e9;
    for (let t = 0; t <= 60; t++) {
      c.push([t, cw]);
      const eff = Math.min(cw, rw(t));
      if (eff > 48) {
        sth = Math.max(Math.min(cw, 49) / 2, 2);
        cw = sth;
        c.push([t, cw]);
      } else if (cw > rw(t)) {
        /* receiver-limited: cwnd is not used, so it does not grow */
      } else if (cw < sth) cw = Math.min(cw * 2, sth > 1e8 ? cw * 2 : sth);
      else cw += 1;
    }
    const r: [number, number][] = [];
    for (let t = 0; t <= 60; t++) r.push([t, rw(t)]);
    const rr: [number, number][] = [];
    r.forEach((q, i) => {
      if (i && q[1] !== r[i - 1][1]) rr.push([q[0], r[i - 1][1]]);
      rr.push(q);
    });
    const m = c.map((q) => [q[0], Math.min(q[1], rw(q[0]))] as [number, number]);
    return {
      spec: {
        x1: 60, y1: 70, xt: [0, 10, 20, 30, 40, 50, 60], yt: [0, 10, 20, 30, 40, 50, 60, 70],
        xlab: "round trips", ylab: "segments",
        bands: [{ a: 24, b: 40, c: "fault", t: "kade-db's app busy: rwnd shrinks" }],
        series: [
          { p: m, c: "green", t: "allowed in flight = min", w: 6, area: true },
          { p: c, c: "amber", t: "cwnd (network)", w: 1.8 },
          { p: rr, c: "teal", t: "rwnd (receiver)", w: 1.8, dash: "6 4" },
        ],
        aria: "The allowed amount is the minimum of cwnd and rwnd",
      },
      caption:
        "Most of the time rwnd is large and cwnd (the network) is the limit. While the receiving app is busy, rwnd drops below cwnd and the receiver becomes the limit, even though the network could carry more. cwnd stays flat meanwhile: TCP does not grow a window it is not using.",
    };
  },
  mathis() {
    const ps = [0.00001, 0.0001, 0.001, 0.005, 0.01, 0.02, 0.05];
    const lab = ["0.001%", "0.01%", "0.1%", "0.5%", "1%", "2%", "5%"];
    const th = (rtt: number, p: number) => (1.22 * 1460 * 8) / (rtt * Math.sqrt(p)) / 1e6;
    const a = ps.map((p, i) => [i, Math.min(th(0.041, p), 100), th(0.041, p) >= 100 ? ">100" : th(0.041, p).toFixed(1)] as [number, number, string]);
    const b = ps.map((p, i) => [i, Math.min(th(0.2, p), 100)] as [number, number]);
    return {
      spec: {
        x1: 6, y1: 100, xt: [0, 1, 2, 3, 4, 5, 6], xl: lab, yt: [0, 20, 40, 60, 80, 100],
        xlab: "packet loss rate", ylab: "best speed (Mbit/s)",
        series: [
          { p: a, c: "amber", t: "RTT 41 ms (home → kade-api)", dots: true, vals: true },
          { p: b, c: "teal", t: "RTT 200 ms (a far region)", dash: "6 4", dots: true },
        ],
        aria: "Throughput falls sharply as loss rate grows",
      },
      caption:
        "An estimate for loss-based TCP (Reno-style), capped at 100 Mbit/s for the chart. The farther path (dashed) suffers even more at the same loss rate.",
    };
  },
  bloat() {
    const big: [number, number][] = [];
    const aqm: [number, number][] = [];
    for (let t = 0; t <= 60; t++) {
      const up = t >= 15 && t < 45;
      big.push([t, up ? Math.min(10 + (t - 15) * 120, 620) : t >= 45 && t < 48 ? 620 - (t - 45) * 200 : 10]);
      aqm.push([t, up ? 24 : 10]);
    }
    return {
      spec: {
        x1: 60, y1: 700, xt: [0, 10, 20, 30, 40, 50, 60], yt: [0, 100, 200, 300, 400, 500, 600, 700],
        xlab: "time (seconds)", ylab: "delay (ms)",
        bands: [{ a: 15, b: 45, c: "amber", t: "backup upload running" }],
        hl: [{ y: 150, c: "fault", t: "above ~150 ms, calls feel laggy" }],
        series: [
          { p: big, c: "fault", t: "big dumb queue" },
          { p: aqm, c: "green", t: "with fq_codel (AQM)", dash: "6 4" },
        ],
        aria: "Delay jumps during an upload with a big queue, stays low with AQM",
      },
      caption:
        "Measured with ping from the office while the backup uploads. The upload speed is about the same in both cases; only the waiting in the queue differs.",
    };
  },
};

function ChartFrame({ wide, label, children, caption }: { wide?: boolean; label: string; children: React.ReactNode; caption?: string }) {
  return (
    <WidgetFrame wide={wide} label={label}>
      <div className="dd-fig">{children}</div>
      {caption && <p className="text-ink-muted mt-3 max-w-[72ch] text-[14.5px] leading-[1.55] text-pretty">{caption}</p>}
    </WidgetFrame>
  );
}

/** One of chapter 20's fixed charts, by name. */
export function Chart({ chart, wide }: { chart: string; wide?: boolean }) {
  const make = CHARTS[chart];
  if (!make) throw new Error(`Chart: no chart "${chart}"`);
  const { spec, caption } = make();
  return (
    <ChartFrame wide={wide} label={spec.aria} caption={caption}>
      <LineChart {...spec} />
    </ChartFrame>
  );
}

/** Reno, CUBIC or Tahoe probing a path: the sawtooth, the losses, how much of the link gets used. */
function simCwnd(o: { alg: string; cap: number; iw: number; n: number; to: number; y1: number }) {
  const pts: [number, number][] = [];
  const marks: ChartSpec["marks"] = [];
  const ss: [number, number][] = [];
  const bands: NonNullable<ChartSpec["bands"]> = [];
  let cwnd = o.iw;
  let ssth = 1e9;
  let wmax = 0;
  let tl = 0;
  let K = 0;
  let inSS = true;
  let ssStart = 0;
  let useSum = 0;
  const C = 0.4;
  const beta = 0.7;
  const rtt = 0.25;
  const epoch = (t: number) => {
    tl = t;
    K = Math.cbrt(Math.max(wmax - cwnd, 0) / C);
  };
  for (let t = 0; t <= o.n; t++) {
    pts.push([t, cwnd]);
    ss.push([t, Math.min(ssth, o.y1)]);
    useSum += Math.min(cwnd, o.cap);
    if (o.to && t === o.to) {
      marks.push({ x: t, y: cwnd, c: "fault", t: "timeout" });
      wmax = Math.min(cwnd, o.cap + 1);
      ssth = Math.max(cwnd / 2, 2);
      cwnd = 1;
      pts.push([t, cwnd]);
      if (!inSS) {
        inSS = true;
        ssStart = t;
      }
      continue;
    }
    if (cwnd > o.cap) {
      marks.push({ x: t, y: cwnd, c: "amber" });
      if (inSS) {
        bands.push({ a: ssStart, b: t, c: "plum", t: "slow start" });
        inSS = false;
      }
      const got = Math.min(cwnd, o.cap + 1);
      if (o.alg === "tahoe") {
        ssth = Math.max(got / 2, 2);
        cwnd = 1;
        inSS = true;
        ssStart = t;
      } else if (o.alg === "cubic") {
        wmax = got;
        cwnd = Math.max(got * beta, 2);
        ssth = cwnd;
        epoch(t);
      } else {
        ssth = Math.max(got / 2, 2);
        cwnd = ssth;
      }
      pts.push([t, cwnd]);
      continue;
    }
    if (cwnd < ssth) {
      cwnd = Math.min(cwnd * 2, ssth > 1e8 ? cwnd * 2 : Math.max(ssth, cwnd + 1));
      if (cwnd >= ssth && inSS) {
        bands.push({ a: ssStart, b: t + 1, c: "plum", t: "slow start" });
        inSS = false;
        if (o.alg === "cubic" && wmax) epoch(t + 1);
      }
    } else if (o.alg === "cubic" && wmax) {
      const T = (t + 1 - tl) * rtt;
      cwnd = Math.max(C * Math.pow(T - K, 3) + wmax, cwnd + 0.3);
    } else cwnd += 1;
  }
  if (inSS) bands.push({ a: ssStart, b: o.n, c: "plum", t: "slow start" });
  return { pts, marks, ss, bands, use: useSum / ((o.n + 1) * o.cap) };
}

/** Pick an algorithm and a path, and watch the congestion window find its limit. */
export function CwndSim({ wide }: { wide?: boolean }) {
  const [cap, setCap] = useState(40);
  const [alg, setAlg] = useState("reno");
  const [iw, setIw] = useState("10");
  const [timeout, setWithTimeout] = useState(false);
  const capId = useId();
  const y1 = Math.max(90, Math.ceil((cap * 1.5) / 10) * 10);
  const r = simCwnd({ alg, cap, iw: Number(iw), n: 80, to: timeout ? 45 : 0, y1 });
  const yt: number[] = [];
  for (let v = 0; v <= y1; v += y1 > 120 ? 30 : 10) yt.push(v);
  return (
    <WidgetFrame wide={wide} label="Congestion window simulator">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="grid min-w-[240px] gap-1.5">
          <label htmlFor={capId} className="text-ink-muted text-[14px]">
            Path capacity: <b className="text-ink">{cap}</b> segments per round trip
          </label>
          <input id={capId} type="range" min={15} max={80} value={cap} onChange={(e) => setCap(Number(e.target.value))} className="accent-ink" />
        </div>
        <Select
          label="Algorithm"
          value={alg}
          onChange={setAlg}
          options={[
            { value: "reno", label: "Reno (AIMD, halves)" },
            { value: "cubic", label: "CUBIC (Linux default)" },
            { value: "tahoe", label: "Tahoe (back to 1)" },
          ]}
        />
        <Select
          label="Initial window"
          value={iw}
          onChange={setIw}
          options={[
            { value: "10", label: "10 segments (today)" },
            { value: "1", label: "1 segment (textbook)" },
          ]}
        />
        <label className="text-ink-body flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px]">
          <input type="checkbox" checked={timeout} onChange={(e) => setWithTimeout(e.target.checked)} className="accent-ink size-4" />
          Timeout at round trip 45
        </label>
      </div>
      <div className="dd-fig mt-4" aria-live="polite">
        <LineChart
          x1={80}
          y1={y1}
          xt={[0, 10, 20, 30, 40, 50, 60, 70, 80]}
          yt={yt}
          xlab="round trips (41 ms each)"
          ylab="cwnd (segments)"
          bands={r.bands}
          hl={[{ y: cap, c: "fault", t: "" }]}
          marks={r.marks}
          series={[
            { p: r.pts, c: "amber", t: "cwnd" },
            { p: r.ss.filter((p) => p[1] < y1), c: "faint", t: "ssthresh", dash: "4 4", w: 1.5 },
          ]}
          aria="Congestion window over time"
        />
      </div>
      <ul className="text-ink-muted mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[14px]">
        <li>dashed red line: path capacity (above it, the queue overflows)</li>
        <li>amber ✕: loss seen by duplicate ACKs</li>
        <li>red ✕: timeout</li>
        <li>losses: {r.marks.length}</li>
        <li>link used: about {Math.round(r.use * 100)}%</li>
      </ul>
    </WidgetFrame>
  );
}
