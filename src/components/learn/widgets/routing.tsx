"use client";

import { useId, useState } from "react";
import { fmt } from "@/lib/net/bytes";
import { bin32, ipError, ipToInt, maskOf } from "@/lib/net/ipv4";
import { cn } from "@/lib/utils";
import { BitCell } from "./bits";
import data from "./data/fundamentals.json";
import type { RouteHop, RouteRow, TraceHop } from "./data/types";
import { Field, FieldError } from "./field";
import { Action, Choices, KeyValues, Outcome, WidgetNote } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Chapters 12 and 13: routing tables, longest prefix match, hop by hop, and
 * traceroute walking the path one TTL at a time.
 */

const RH = data.RH as unknown as RouteHop[];
const R3T = data.R3T as unknown as RouteRow[];
const TR = data.TR as TraceHop[];

function matches(table: RouteRow[], ip: string) {
  const n = ipToInt(ip)!;
  return table.map(([dest]) => {
    const [a, p] = (dest.includes("/") ? dest : `${dest}/32`).split("/");
    const m = maskOf(Number(p));
    return ((n & m) >>> 0) === ((ipToInt(a)! & m) >>> 0);
  });
}

/** A routing table with the chosen row marked and the others that matched said so. */
function RouteTable({
  rows,
  matched,
  chosen,
  title = "Destination",
}: {
  rows: RouteRow[];
  matched: boolean[];
  chosen: number;
  title?: string;
}) {
  return (
    <table className="w-full min-w-[620px] border-collapse text-left">
      <thead>
        <tr className="border-ink border-b">
          {[title, "Next hop", "Iface", "Note"].map((h) => (
            <th key={h} className="text-ink py-2 pr-4 text-[14px] font-bold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r[0]} className="border-rule border-b align-top">
            <td className="py-2 pr-4 font-mono text-[14px]">
              <span className={i === chosen ? "dd-mark text-ink font-bold" : "text-ink"}>{r[0]}</span>
            </td>
            <td className="text-ink py-2 pr-4 font-mono text-[14px]">{r[1]}</td>
            <td className="text-ink py-2 pr-4 font-mono text-[14px]">{r[2]}</td>
            <td className="text-ink-body py-2 text-[14.5px]">
              {r[3]}
              {i === chosen ? (
                <b className="text-ink"> ← chosen</b>
              ) : matched[i] ? (
                <span className="text-ink-muted"> · matches</span>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const HOP_FIELDS: [keyof RouteHop, string][] = [
  ["fs", "frame · source MAC"],
  ["fd", "frame · destination MAC"],
  ["ps", "IP · source (with port)"],
  ["pd", "IP · destination (with port)"],
  ["ttl", "IP · TTL"],
];

/** Each router on the way: its table, its choice, and what the packet looks like leaving it. */
export function RouteHops({ wide }: { wide?: boolean }) {
  const [at, setAt] = useState(0);
  const hop = RH[at];
  const prev = at ? RH[at - 1] : null;
  const dest = hop.pd.split(":")[0] === "10.10.1.10" ? "34.87.120.15" : hop.pd.split(":")[0];
  return (
    <WidgetFrame wide={wide} label="Routing, hop by hop">
      <Choices
        label="Router"
        value={at}
        onChange={setAt}
        options={RH.map((h, i) => ({ value: i, label: h.t.split(" · ")[1] }))}
      />
      <div aria-live="polite">
        <h4 className="text-ink mt-5 text-[17px] font-bold">{hop.t} · looks up 34.87.120.15</h4>
        <div className="mt-3 overflow-x-auto">
          <RouteTable rows={hop.tb} matched={matches(hop.tb, dest)} chosen={hop.w} />
        </div>
        <p className="text-ink-body mt-3 text-[15.5px] leading-[1.55] text-pretty">{hop.dec}</p>
        <dl className="border-rule mt-3 grid grid-cols-1 border-t sm:grid-cols-2 sm:gap-x-8">
          {HOP_FIELDS.map(([k, label]) => {
            const changed = prev !== null && prev[k] !== hop[k];
            return (
              <div key={k} className="border-rule border-b py-2.5">
                <dt className="text-ink-muted text-[14px]">{label}</dt>
                <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                  <span className={cn("text-ink font-mono text-[14.5px]", changed && "font-bold")}>{String(hop[k])}</span>
                  {changed && <span className="text-ink-muted text-[13px]">changed</span>}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </WidgetFrame>
  );
}

/** Longest prefix match, bit by bit: each route compares only its first /N bits. */
export function LpmBits({ ip, routes, wide }: { ip: string; routes: string; wide?: boolean }) {
  const n = ipToInt(ip)!;
  const ib = bin32(n);
  const rs = routes.split(",").map((r) => {
    const [a, p] = r.split("/");
    const net = ipToInt(a)!;
    const m = maskOf(Number(p));
    return { r, net, p: Number(p), ok: ((n & m) >>> 0) === ((net & m) >>> 0) };
  });
  const best = rs.filter((x) => x.ok).sort((a, b) => b.p - a.p)[0];
  return (
    <WidgetFrame wide={wide} label={`Longest prefix match for ${ip}`}>
      <div className="min-w-[680px] space-y-2">
        <div className="grid grid-cols-[112px_auto_minmax(120px,1fr)] items-center gap-3">
          <span className="text-ink-muted font-mono text-[12.5px] leading-[1.3]">
            destination
            <br />
            <span className="text-ink">{ip}</span>
          </span>
          <span className="flex gap-[1px]" aria-hidden="true">
            {[...ib].map((b, i) => (
              <BitCell key={i} bit={b} size="xs" className={i % 8 === 7 && i < 31 ? "mr-[6px]" : undefined} />
            ))}
          </span>
          <span className="text-ink font-mono text-[14px]">{ip}</span>
        </div>
        {rs.map((x) => {
          const nb = bin32(x.net);
          let firstBad = -1;
          return (
            <div
              key={x.r}
              className={cn(
                "border-rule grid grid-cols-[112px_auto_minmax(120px,1fr)] items-center gap-3 border-t pt-2",
                x === best && "border-ink",
              )}
            >
              <span className="text-ink font-mono text-[13px]">{x.r}</span>
              <span className="flex gap-[1px]" aria-hidden="true">
                {[...nb].map((b, i) => {
                  const compared = i < x.p;
                  const same = b === ib[i];
                  if (compared && !same && firstBad < 0) firstBad = i;
                  return (
                    <span
                      key={i}
                      className={cn(
                        "grid h-[19px] w-[11px] place-items-center rounded-[2px] border font-mono text-[10px]",
                        !compared && "border-transparent text-ink-faint",
                        compared && same && "border-green bg-green-soft text-ink",
                        compared && !same && "border-ink bg-mark text-ink font-bold",
                        i % 8 === 7 && i < 31 && "mr-[6px]",
                      )}
                    >
                      {compared ? b : "·"}
                    </span>
                  );
                })}
              </span>
              <span className="text-[13.5px]">
                {x.ok ? (
                  x === best ? (
                    <b className="text-ink">match · /{x.p} · wins</b>
                  ) : (
                    <span className="text-ink-body">match · /{x.p}</span>
                  )
                ) : (
                  <span className="text-ink-muted">no match (bit {firstBad + 1} differs)</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      <WidgetNote>
        Only the first /N bits of each route are compared (the rest are shown as dots). Green = same as the
        destination, highlighted = different. /0 compares nothing, so it always matches. Among the matches, the one comparing
        the most bits wins.
      </WidgetNote>
    </WidgetFrame>
  );
}

const QUICK = ["34.87.120.15", "34.10.1.1", "8.8.8.8", "198.51.100.20", "192.0.2.6"];

/** R3's routing table: type a destination, see which route wins. */
export function LpmTool({ wide }: { wide?: boolean }) {
  const [value, setValue] = useState(QUICK[0]);
  const errorId = useId();
  const error = ipError(value);
  let body = null;
  if (!error) {
    const mt = matches(R3T, value.trim());
    let best = -1;
    let len = -1;
    R3T.forEach((r, i) => {
      const l = Number(r[0].split("/")[1]);
      if (mt[i] && l > len) {
        len = l;
        best = i;
      }
    });
    const w = R3T[best];
    body = (
      <>
        <div className="overflow-x-auto">
          <RouteTable rows={R3T} matched={mt} chosen={best} title="R3’s table" />
        </div>
        <div className="mt-4">
          <Outcome>
            {value.trim()} → {w[0]} ({w[3]}) → {w[1] === "direct" ? "deliver directly" : `next hop ${w[1]}`} out {w[2]}
          </Outcome>
        </div>
      </>
    );
  }
  return (
    <WidgetFrame wide={wide} label="Longest prefix match on R3">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <Field label="Destination IP" value={value} onChange={setValue} invalid={!!error} describedBy={errorId} />
        <Choices label="Examples" value={QUICK.includes(value.trim()) ? value.trim() : null} onChange={setValue} options={QUICK.map((q) => ({ value: q, label: q }))} />
      </div>
      <div className="mt-6" aria-live="polite">
        {error ? <FieldError id={errorId}>{error}</FieldError> : body}
      </div>
    </WidgetFrame>
  );
}

function Arrow() {
  return (
    <svg aria-hidden="true" width="24" height="10" viewBox="0 0 24 10" className="text-ink-faint mx-1 shrink-0">
      <path d="M2 5h18M16 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** traceroute, one probe at a time: TTL 1 dies at the first router, TTL 2 at the second, … */
export function TraceSim({ wide }: { wide?: boolean }) {
  const [n, setN] = useState(0);
  const done = n > 0 && !!TR[n - 1].dest;
  const hop = n > 0 ? TR[n - 1] : null;
  const lines = TR.slice(0, n).map((h, i) =>
    h.ip ? ` ${i + 1}  ${h.ip.padEnd(14)} ${h.rtt!.map((r) => `${r} ms`.padStart(8)).join(" ")}` : ` ${i + 1}  * * *`,
  );
  return (
    <WidgetFrame wide={wide} label="traceroute, probe by probe">
      <ol className="flex flex-wrap items-center gap-y-2">
        {[{ c: "Front desk PC", ip: "sender" } as TraceHop, ...TR].map((h, i) => {
          const idx = i - 1;
          const reached = i === 0 || (n > 0 && idx < n - 1);
          const last = n > 0 && idx === n - 1;
          return (
            <li key={h.c} className="flex items-center">
              {i > 0 && <Arrow />}
              <span
                className={cn(
                  "inline-flex min-h-11 flex-col justify-center rounded-[2px] border px-2.5 py-1 text-[13.5px] leading-[1.25]",
                  last && h.dest && "border-ink border-[1.5px] font-semibold",
                  last && !h.dest && h.ip && "border-fault",
                  last && !h.ip && "border-ink-faint border-dashed",
                  !last && (reached ? "border-ink-faint" : "border-rule text-ink-muted"),
                )}
              >
                <span className="text-ink">{h.c}</span>
                <span className="text-ink-muted font-mono text-[11px]">
                  {i === 0 ? "sender" : n > 0 && idx < n ? `TTL ${n - idx}→${n - idx - 1}` : (h.ip ?? "silent")}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <div aria-live="polite" className="mt-4">
        <p className="text-ink-body text-[15.5px] leading-[1.55] text-pretty [&_code]:font-mono [&_code]:text-[0.92em]">
          {!hop && "Press the button to send the first probe, with TTL = 1."}
          {hop?.dest && (
            <>
              <b className="text-ink">TTL {n}:</b> the probe reaches kade-api itself. The destination answers (port
              unreachable, echo reply or a TCP reply, depending on the mode), so traceroute stops. Trace complete.
            </>
          )}
          {hop && !hop.dest && !hop.ip && (
            <>
              <b className="text-ink">TTL {n}:</b> the TTL reaches 0 at a router inside Google, but that router does not
              send Time Exceeded. traceroute waits for each of its 3 probes, then prints <code>* * *</code> and moves on.
            </>
          )}
          {hop && !hop.dest && hop.ip && (
            <>
              <b className="text-ink">TTL {n}:</b> each router before it lowers the TTL by 1. At <b className="text-ink">{hop.c}</b>{" "}
              it reaches 0, so the router drops the probe and sends ICMP Time Exceeded from <code>{hop.ip}</code>. That
              IP becomes line {n}.
            </>
          )}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Action primary onClick={() => !done && setN((x) => x + 1)}>
          {done ? "Done" : `Send probe with TTL = ${n + 1}`}
        </Action>
        <Action onClick={() => setN(0)}>Reset</Action>
      </div>
      <pre className="border-rule text-ink-body mt-4 overflow-x-auto rounded-[2px] border px-4 py-3 font-mono text-[13px] leading-[1.6]">
        {["traceroute to api.kade.lk (34.87.120.15), 64 hops max", ...lines].join("\n")}
      </pre>
    </WidgetFrame>
  );
}

const PLACES: [string, number][] = [
  ["Colombo → Singapore", 3300],
  ["Colombo → Mumbai", 1600],
  ["Singapore → Iowa", 15500],
  ["Same city", 30],
];

/** Distance sets the floor: light in fibre covers about 200 km per millisecond. */
export function LatCalc({ wide }: { wide?: boolean }) {
  const [km, setKm] = useState("3300");
  const [size, setSize] = useState("1500");
  const [speed, setSpeed] = useState("100");
  const errorId = useId();
  const d = parseFloat(km);
  const b = parseFloat(size);
  const mb = parseFloat(speed);
  const ok = d >= 0 && b > 0 && mb > 0;
  const one = d / 200;
  const tx = ((b * 8) / (mb * 1e6)) * 1000;
  return (
    <WidgetFrame wide={wide} label="Latency calculator">
      <Choices
        label="Routes"
        value={PLACES.find(([, v]) => String(v) === km)?.[0] ?? null}
        onChange={(name) => setKm(String(PLACES.find(([p]) => p === name)![1]))}
        options={PLACES.map(([p]) => ({ value: p, label: p }))}
      />
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3">
        <Field label="Cable distance (km)" value={km} onChange={setKm} short inputMode="numeric" describedBy={errorId} invalid={!ok} />
        <Field label="Packet size (bytes)" value={size} onChange={setSize} short inputMode="numeric" describedBy={errorId} invalid={!ok} />
        <Field label="Link speed (Mbit/s)" value={speed} onChange={setSpeed} short inputMode="numeric" describedBy={errorId} invalid={!ok} />
      </div>
      <div className="mt-6" aria-live="polite">
        {!ok ? (
          <FieldError id={errorId}>Enter positive numbers.</FieldError>
        ) : (
          <>
            <KeyValues
              items={[
                ["One-way, light in fibre", `${d} ÷ 200 km/ms = ${one.toFixed(1)} ms`],
                ["Best possible RTT", <><b key="r">{(one * 2).toFixed(1)} ms</b> before any queues or processing</>],
                ["Transmission of one packet", `${fmt(b)} × 8 bits ÷ ${fmt(mb)} Mbit/s = ${tx < 0.1 ? tx.toFixed(3) : tx.toFixed(2)} ms per link`],
              ]}
            />
            <WidgetNote>
              Cable routes are longer than straight lines: Colombo to Singapore is about 2,700 km direct but more by
              cable, which fits the ~35 ms part of the 41 ms ping.
            </WidgetNote>
          </>
        )}
      </div>
    </WidgetFrame>
  );
}
