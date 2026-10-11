"use client";

import { Fragment, useState } from "react";
import { intToIp, ipToInt, networkOf } from "@/lib/net/ipv4";
import { arrowHead } from "../diagram-defs";
import { Action, Choices, Outcome, Select, WidgetNote } from "./ui";
import { WidgetFrame } from "./widget-frame";
import { ExpandDrawing } from "../expand-drawing";
import { FitText } from "../fit-text";
import { cn } from "@/lib/utils";
import { Swatch } from "../swatch";

/*
 * Chapters 8 to 10: what changes on each hop, how ARP finds a MAC, and how
 * NAT decides where an incoming packet goes.
 */

/* A MAC or IP and, after "|", whose it is. */
const HOPS = [
  {
    t: "Hop 1 · laptop → home router",
    fs: "a4:83:e7:2b:91:0c|laptop",
    fd: "3c:84:6a:10:ee:01|home router, LAN side",
    ps: "192.168.1.23:52814",
    pd: "34.87.120.15:443",
    r: "The router sees its own MAC in the frame, so it takes it. Then it reads the destination IP. That is not one of its networks, so its default route sends it to the ISP.",
  },
  {
    t: "Hop 2 · home router → ISP router",
    fs: "3c:84:6a:10:ee:02|home router, WAN side",
    fd: "00:1f:ca:88:10:01|ISP router",
    ps: "203.0.113.45:40001",
    pd: "34.87.120.15:443",
    r: "A brand-new frame for this link. NAT has also replaced the private source (chapter 10). The ISP router reads the destination IP and picks the next router toward Google.",
  },
  {
    t: "Hop 3 · across the internet",
    fs: "a new pair on every link",
    fd: "a new pair on every link",
    ps: "203.0.113.45:40001",
    pd: "34.87.120.15:443",
    r: "Each router does the same thing: take the frame addressed to it, read the destination IP, choose the next hop, and build a new frame for the next link. The packet itself is not changed.",
  },
  {
    t: "Hop 4 · Google's network → kade-api",
    fs: "42:01:0a:0a:01:01|sn-app gateway",
    fd: "42:01:0a:0a:01:0a|kade-api",
    ps: "203.0.113.45:40001",
    pd: "10.10.1.10:443",
    r: "GCP has translated the external IP 34.87.120.15 to kade-api's internal 10.10.1.10 (1:1 NAT, chapter 10). kade-api sees its own MAC and its own IP, so it keeps the packet and passes it to the Node app on port 443.",
  },
];

type Hop = (typeof HOPS)[number];

/** The trip's stops; hop N runs from stop N to stop N + 1. */
const STOPS: { n: string; hue: "plum" | "teal" | "green" }[] = [
  { n: "Laptop", hue: "plum" },
  { n: "Home router", hue: "teal" },
  { n: "ISP router", hue: "teal" },
  { n: "sn-app gateway", hue: "teal" },
  { n: "kade-api", hue: "green" },
];

const STOP_BOX = {
  plum: "border-plum bg-plum-soft",
  teal: "border-teal bg-teal-soft",
  green: "border-green bg-green-soft",
};

/** The whole trip in one line, the current hop's link in blue. */
function HopRoute({ at }: { at: number }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1" aria-hidden="true">
      <ol className="flex min-w-[700px] items-start pb-11">
        {STOPS.map((stop, i) => (
          <Fragment key={stop.n}>
            {i > 0 && (
              <li className={cn("relative flex h-[30px] min-w-14 items-center px-1.5", i === 3 ? "flex-[2.5]" : "flex-1")}>
                <span
                  className={cn(
                    "relative block w-full",
                    i - 1 === at
                      ? "bg-accent h-[2.5px]"
                      : i - 1 < at
                        ? "bg-ink-faint h-[1.5px]"
                        : "border-rule-strong h-0 border-t-[1.5px] border-dashed",
                  )}
                >
                  {i - 1 === at && (
                    <span className="border-l-accent absolute top-1/2 -right-[2px] -translate-y-1/2 border-y-[5px] border-l-[7px] border-y-transparent" />
                  )}
                </span>
                <span
                  className={cn(
                    "absolute inset-x-0 top-[34px] text-center font-mono text-[12.5px] whitespace-nowrap",
                    i - 1 === at ? "text-accent font-bold" : "text-ink-faint",
                  )}
                >
                  hop {i}
                  {i === 3 && <span className="text-ink-muted block font-sans text-[12.5px] font-normal">many routers</span>}
                </span>
              </li>
            )}
            <li className="shrink-0">
              <span
                className={cn(
                  "text-ink flex h-[30px] items-center rounded-[2px] border-[1.25px] px-2.5 text-[14px] font-semibold whitespace-nowrap",
                  STOP_BOX[stop.hue],
                  i !== at && i !== at + 1 && "opacity-55",
                )}
              >
                {stop.n}
              </span>
            </li>
          </Fragment>
        ))}
      </ol>
    </div>
  );
}

/** One end of a pair: the address, and whose it is on a quieter line. */
function HopEnd({ name, value, changed }: { name: string; value: string; changed: boolean }) {
  const [main, owner] = value.split("|");
  return (
    <div className="min-w-0">
      <span className="text-ink-muted block text-[13px]">{name}</span>
      {owner === undefined && !main.includes(":") ? (
        <span className={cn("text-ink-body mt-0.5 inline-block text-[15px] italic", changed && "dd-mark")}>{main}</span>
      ) : (
        <span className={cn("text-ink mt-0.5 inline-block font-mono text-[15px] font-semibold", changed && "dd-mark")}>
          {main}
        </span>
      )}
      {owner && <span className="text-ink-muted block text-[13.5px]">{owner}</span>}
    </div>
  );
}

/** Source → destination, side by side; stacked on a phone. */
function HopPair({ hop, prev, src, dst }: { hop: Hop; prev: Hop | null; src: "fs" | "ps"; dst: "fd" | "pd" }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-start sm:gap-4">
      <HopEnd name="from" value={hop[src]} changed={prev !== null && prev[src] !== hop[src]} />
      <span aria-hidden="true" className="text-ink-faint hidden pt-[18px] text-[16px] sm:block">
        →
      </span>
      <HopEnd name="to" value={hop[dst]} changed={prev !== null && prev[dst] !== hop[dst]} />
    </div>
  );
}

/** Four hops; the frame changes on every one, the packet almost never. */
export function HopExplorer({ wide }: { wide?: boolean }) {
  const [at, setAt] = useState(0);
  const hop = HOPS[at];
  const prev = at ? HOPS[at - 1] : null;
  return (
    <WidgetFrame wide={wide} label="What changes on each hop">
      <Choices
        label="Hop"
        value={at}
        onChange={setAt}
        options={HOPS.map((_, i) => ({ value: i, label: `Hop ${i + 1}` }))}
      />
      <div className="mt-5">
        <HopRoute at={at} />
      </div>
      <div aria-live="polite">
        <h4 className="text-ink mt-5 text-[17px] font-bold">{hop.t}</h4>
        {/* The packet rides inside the frame, as in chapter 1. */}
        <div className="border-teal mt-3 rounded-[2px] border-[1.25px] p-4">
          <p className="mb-3 text-[14.5px]">
            <span className="text-ink font-semibold">Frame</span>
            <span className="text-ink-muted"> · MAC addresses · rebuilt on every hop</span>
          </p>
          <HopPair hop={hop} prev={prev} src="fs" dst="fd" />
          <div className="border-green bg-green-soft mt-4 rounded-[2px] border-[1.25px] p-4">
            <p className="mb-3 text-[14.5px]">
              <span className="text-ink font-semibold">Packet</span>
              <span className="text-ink-muted"> · IP addresses and ports · carried inside the frame</span>
            </p>
            <HopPair hop={hop} prev={prev} src="ps" dst="pd" />
          </div>
        </div>
        <p className="text-ink-body mt-4 text-[15.5px] leading-[1.55] text-pretty">{hop.r}</p>
        {prev && (
          <p className="text-ink-muted mt-2 text-[14px]">
            <span className="dd-mark">Highlighted</span> addresses changed since hop {at}.
          </p>
        )}
      </div>
    </WidgetFrame>
  );
}

type LanDevice = "fd" | "ml" | "op" | "gw" | "lp" | "api";
const LAN: Record<LanDevice, { n: string; ip: string; mac?: string }> = {
  fd: { n: "Front desk PC", ip: "172.16.1.10", mac: "3c:7c:3f:10:22:01" },
  ml: { n: "Manager laptop", ip: "172.16.1.11", mac: "f0:18:98:6d:2e:44" },
  op: { n: "Office printer", ip: "172.16.1.20", mac: "30:05:5c:8a:12:e0" },
  gw: { n: "Router eth1", ip: "172.16.1.1", mac: "e4:8d:8c:00:01:01" },
  lp: { n: "Label printer", ip: "172.16.2.20" },
  api: { n: "kade-api", ip: "34.87.120.15" },
};

/** One ARP exchange drawn: a broadcast to everyone, one reply. */
export function ArpFan({ target, wide }: { target: "op" | "gw"; wide?: boolean }) {
  const T = LAN[target];
  const boxes: [LanDevice, number][] = [
    ["ml", 18],
    ["op", 132],
    ["gw", 246],
  ];
  // The broadcast runs level with the printer, then splits on one bus.
  const trunk = 165;
  const bus = 606;
  const branch = { ml: 51, op: 165, gw: 279 } as Record<LanDevice, number>;
  // The printer replies straight back; the router, lower down, comes back
  // under everything and into the PC from below.
  const op = target === "op";
  const reply = op ? "M640 190 H232" : "M640 292 H125 V210";
  const replyLabel = op ? 214 : 316;
  return (
    <figure className={wide ? "not-prose my-10" : "not-prose my-10 max-w-[760px]"}>
      <div className="dd-fig border-rule bg-ground overflow-x-auto rounded-[2px] border p-4 sm:p-5">
        <svg
          viewBox={`0 0 920 ${op ? 330 : 346}`}
          role="img"
          aria-label={`ARP: the front desk PC broadcasts who has ${T.ip}; only ${T.n} replies with its MAC.`}
        >
          <rect className="n plum" x="20" y="118" width="210" height="90" rx="2" />
          <text className="t" x="36" y="144">Front desk PC</text>
          <text className="s" x="36" y="166">172.16.1.10</text>
          <text className="s" x="36" y="186">3c:7c:3f:10:22:01</text>
          {boxes.map(([k]) => (
            <path
              key={k}
              className="w amber dash"
              d={`M230 ${trunk} H${bus} V${branch[k]} H638`}
              markerEnd={arrowHead("amber")}
            />
          ))}
          {/* Where the reply crosses the bus, the bus breaks behind it. */}
          {op && <path d={`M${bus - 9} 190 H${bus + 9}`} style={{ stroke: "var(--dd-ground)", strokeWidth: 9 }} />}
          <path className="w green" d={reply} markerEnd={arrowHead("green")} />
          {boxes.map(([k, y]) => {
            const me = k === target;
            return (
              <g key={k}>
                <rect className={me ? "n green" : "n"} x="640" y={y} width="262" height="66" rx="2" />
                <text className="t" x="656" y={y + 26}>{LAN[k].n}</text>
                <text className="s" x="656" y={y + 47}>
                  {LAN[k].ip} · {me ? "that's me" : "not me, ignore"}
                </text>
              </g>
            );
          })}
          <text className="l" x="250" y={trunk - 34}>1 · broadcast to ff:ff:ff:ff:ff:ff (everyone)</text>
          <text className="s" x="250" y={trunk - 14}>&quot;who has {T.ip}? tell 172.16.1.10&quot;</text>
          <text className="l" x="250" y={replyLabel}>2 · reply, only to the PC</text>
          <text className="s" x="250" y={replyLabel + 20}>
            &quot;{T.ip} is at {T.mac}&quot;
          </text>
        </svg>
      </div>
      <p className="text-ink-muted mt-2 text-[14px] md:hidden">Wide by design - scroll it sideways.</p>
      <FitText />
      <ExpandDrawing />
    </figure>
  );
}

/** The two ARP messages, field by field; a mark on the question and the answer. */
const ARP_MESSAGES = [
  {
    n: "1 · Request",
    how: "broadcast: every device on the network gets it",
    hue: "amber" as const,
    op: "operation 1, request",
    to: ["ff:ff:ff:ff:ff:ff", "everyone"],
    from: ["3c:7c:3f:10:22:01", "the PC"],
    sender: { mac: "3c:7c:3f:10:22:01", ip: "172.16.1.10" },
    target: { mac: "00:00:00:00:00:00", ip: "172.16.1.20" },
    mark: "target" as const,
    note: "unknown: this is the question",
  },
  {
    n: "2 · Reply",
    how: "unicast: only the PC gets it",
    hue: "green" as const,
    op: "operation 2, reply",
    to: ["3c:7c:3f:10:22:01", "only the PC"],
    from: ["30:05:5c:8a:12:e0", "the printer"],
    sender: { mac: "30:05:5c:8a:12:e0", ip: "172.16.1.20" },
    target: { mac: "3c:7c:3f:10:22:01", ip: "172.16.1.10" },
    mark: "sender" as const,
    note: "the answer. Sender and target have swapped: the printer speaks now",
  },
];

const ARP_HUE = {
  amber: { card: "border-amber/70", cell: "border-amber bg-amber-soft" },
  green: { card: "border-green/70", cell: "border-green bg-green-soft" },
};

/** Request and reply as frames: Ethernet header, no IP header, the ARP message, FCS. */
export function ArpMessages({ wide }: { wide?: boolean }) {
  const cell = "rounded-[2px] border px-3.5 py-3";
  const head = "text-ink mb-2 block text-[14px] font-semibold";
  return (
    <WidgetFrame wide={wide} label="Inside an ARP request and an ARP reply">
      <div className="@container space-y-5">
        {ARP_MESSAGES.map((m) => (
          <section key={m.n} className={cn("rounded-[2px] border p-4", ARP_HUE[m.hue].card)}>
            <p className="mb-3 text-[15px]">
              <span className="text-ink font-bold">{m.n}</span>
              <span className="text-ink-muted"> · {m.how}</span>
            </p>
            <div className="grid gap-[3px] @min-[700px]:grid-cols-[1.15fr_0.5fr_2fr_0.4fr]">
              <div className={cn(cell, "border-teal bg-teal-soft")}>
                <span className={head}>Ethernet header</span>
                {[
                  ["to", m.to],
                  ["from", m.from],
                ].map(([k, [mac, who]]) => (
                  <p key={k as string} className="mt-1.5 first-of-type:mt-0">
                    <span className="text-ink-muted mr-2 text-[13px]">{k as string}</span>
                    <span className="text-ink font-mono text-[14px] font-semibold">{mac}</span>
                    <span className="text-ink-muted block text-[13px]">{who}</span>
                  </p>
                ))}
              </div>
              <div className="border-rule-strong flex items-center justify-center rounded-[2px] border border-dashed px-2 py-3 text-center">
                <span className="text-ink-faint text-[13.5px] leading-[1.35]">no IP header</span>
              </div>
              <div className={cn(cell, ARP_HUE[m.hue].cell)}>
                <span className={head}>
                  ARP message <span className="text-ink-muted font-normal">· {m.op}</span>
                </span>
                {/* Narrow: each party's MAC and IP stacked under its name. */}
                <dl className="space-y-2 @min-[520px]:hidden">
                  {(["sender", "target"] as const).map((k) => (
                    <div key={k}>
                      <dt className="text-ink text-[14px] font-semibold capitalize">{k}</dt>
                      <dd className="text-ink font-mono text-[14px] font-semibold">
                        <span className="text-ink-muted mr-2 font-sans text-[13px] font-normal">MAC</span>
                        <span className={m.mark === k ? "dd-mark" : undefined}>{m[k].mac}</span>
                      </dd>
                      <dd className="text-ink font-mono text-[14px] font-semibold">
                        <span className="text-ink-muted mr-2 font-sans text-[13px] font-normal">IP</span>
                        {m[k].ip}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="hidden grid-cols-[auto_auto_1fr] items-baseline gap-x-4 gap-y-1 @min-[520px]:grid">
                  <span />
                  <span className="text-ink-muted text-[13px]">MAC</span>
                  <span className="text-ink-muted text-[13px]">IP</span>
                  {(["sender", "target"] as const).map((k) => (
                    <Fragment key={k}>
                      <span className="text-ink text-[14px] font-semibold capitalize">{k}</span>
                      <span className="text-ink font-mono text-[14px] font-semibold">
                        <span className={m.mark === k ? "dd-mark" : undefined}>{m[k].mac}</span>
                      </span>
                      <span className="text-ink font-mono text-[14px] font-semibold">{m[k].ip}</span>
                    </Fragment>
                  ))}
                </div>
                <p className="text-ink-body mt-2 text-[13.5px] leading-[1.45]">
                  <span className="dd-mark">{m.mark} MAC</span>: {m.note}.
                </p>
              </div>
              <div className={cn(cell, "border-teal bg-teal-soft flex items-center justify-center")}>
                <span className="text-ink text-[14px] font-semibold">FCS</span>
              </div>
            </div>
          </section>
        ))}
      </div>
      <ul className="text-ink-muted mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-[14px]">
        <li className="inline-flex items-center gap-2">
          <Swatch hue="teal" /> the frame (chapter 1, wrap 3)
        </li>
        <li className="inline-flex items-center gap-2">
          <Swatch hue="amber" /> request
        </li>
        <li className="inline-flex items-center gap-2">
          <Swatch hue="green" /> reply
        </li>
      </ul>
    </WidgetFrame>
  );
}

type Caches = Partial<Record<LanDevice, Record<string, string>>>;

/** What one Send did, for the drawing and the tables under it. */
interface ArpRun {
  src: LanDevice;
  dst: LanDevice;
  /** Who answers the ARP: the target itself, or the gateway. */
  owner: LanDevice;
  same: boolean;
  sn: string;
  dn: string;
  ask: string;
  /** The MAC came from the sender's cache: no broadcast. */
  hit: boolean;
}

const ON_LAN: LanDevice[] = ["fd", "ml", "op", "gw"];
/** Each column's centre: the four on the staff network, then beyond the router. */
const COL: Record<LanDevice, number> = { fd: 105, ml: 275, op: 445, gw: 615, lp: 815, api: 815 };
const ROW_GAP = 112;
/** Labels cross the dotted column lines; a wide halo hides them between words too. */
const HALO = { strokeWidth: 10 };

/**
 * One Send as a sequence: every device on the staff network is a column,
 * time runs down, and each message is a level arrow with its words on it.
 */
function ArpSequence({ run }: { run: ArpRun }) {
  const { src, dst, owner, same, ask, hit } = run;
  const S = LAN[src];
  const O = LAN[owner];
  const x = (k: LanDevice) => COL[k];
  // Rows, top to bottom: the cache hit or the request and reply, the frame,
  // and the router passing it on when the target is elsewhere.
  const frame = hit ? 1 : 2;
  const rows = frame + (same ? 1 : 2);
  const y = (i: number) => 182 + i * ROW_GAP;
  const H = y(rows - 1) + 44;
  const hue = (k: LanDevice) =>
    k === src ? "n plum" : k === owner && same ? "n green" : k === "gw" && !same ? "n teal" : "n";
  /** A level arrow from one column to another, stopping on the far line. */
  const arrow = (from: LanDevice, to: LanDevice, row: number) => {
    const dir = x(to) > x(from) ? 1 : -1;
    return `M${x(from)} ${y(row)} H${x(to) - dir * 3}`;
  };
  /**
   * Words above an arrow, starting just past its left end - or further left,
   * so they stay inside the staff network (widths estimated per character).
   */
  const words = (from: LanDevice, to: LanDevice, row: number, title: string, line: string) => {
    const width = Math.max(title.length * 6.8, line.length * 8.1);
    const left = Math.min(Math.min(x(from), x(to)) + 14, 694 - width);
    return (
      <>
        <text className="l halo" style={HALO} x={left} y={y(row) - 38}>{title}</text>
        <text className="s halo" style={HALO} x={left} y={y(row) - 16}>{line}</text>
      </>
    );
  };
  const others = ON_LAN.filter((k) => k !== src);
  return (
    <svg
      viewBox={`0 0 920 ${H}`}
      role="img"
      aria-label={
        hit
          ? `${S.n} finds ${ask} in its ARP cache, so no broadcast, and sends the frame to ${O.n}.`
          : `${S.n} broadcasts who has ${ask}; ${O.n} replies with its MAC; then the frame goes to ${O.n}.`
      }
    >
      <rect className="zone teal" x="14" y="10" width="692" height={H - 18} rx="2" />
      <text className="l" x="30" y="32">Staff network · 172.16.1.0/24</text>
      {/* Beyond the router: the target if it lives there, else an empty slot. */}
      {same ? (
        <>
          <rect className="ghost" x="735" y="48" width="160" height="58" rx="2" />
          <text className="l mid f" x="815" y="82">other networks</text>
        </>
      ) : (
        <>
          <rect className="n green" x="735" y="48" width="160" height="58" rx="2" />
          <text className="t" x="751" y="72">{LAN[dst].n}</text>
          <text className="s" x="751" y="92">{LAN[dst].ip}</text>
        </>
      )}
      <path className="w dash" d={`M815 106 V${H - 8}`} style={{ strokeDasharray: "2 5" }} />
      {ON_LAN.map((k) => (
        <g key={k}>
          <path className="w dash" d={`M${x(k)} 106 V${H - 8}`} style={{ strokeDasharray: "2 5" }} />
          <rect className={hue(k)} x={x(k) - 80} y="48" width="160" height="58" rx="2" />
          <text className="t" x={x(k) - 64} y="72">{LAN[k].n}</text>
          <text className="s" x={x(k) - 64} y="92">{LAN[k].ip}</text>
        </g>
      ))}

      {hit ? (
        <g>
          <circle className="ok" cx={x(src)} cy={y(0)} r="5" />
          <text className="l halo" style={HALO} x={x(src) + 14} y={y(0) - 12}>1 · found in its own ARP cache: no broadcast</text>
          <text className="s halo" style={HALO} x={x(src) + 14} y={y(0) + 10}>{`${ask} → ${O.mac}`}</text>
        </g>
      ) : (
        <>
          <g>
            {others.map((k) => (
              <path key={k} className="w amber dash" d={arrow(src, k, 0)} markerEnd={arrowHead("amber")} />
            ))}
            {words(src, others.at(-1)!, 0, "1 · ARP request, broadcast to ff:ff:ff:ff:ff:ff", `"who has ${ask}? tell ${S.ip}"`)}
            {others.map((k) => (
              <text key={k} className={k === owner ? "mid cur halo" : "l mid halo"} style={HALO} x={x(k)} y={y(0) + 24}>
                {k === owner ? "that's me" : "not me, ignore"}
              </text>
            ))}
            <text className="l mid f halo" style={HALO} x="815" y={y(0) + 4}>never reaches here</text>
          </g>
          <g>
            <path className="w green" d={arrow(owner, src, 1)} markerEnd={arrowHead("green")} />
            {words(owner, src, 1, "2 · ARP reply, only to the sender", `"${ask} is at ${O.mac}"`)}
          </g>
        </>
      )}

      <g>
        <path className="w plum" style={{ strokeWidth: 2 }} d={arrow(src, owner, frame)} markerEnd={arrowHead("plum")} />
        {words(
          src,
          owner,
          frame,
          `${frame + 1} · the frame goes out`,
          `to MAC ${O.mac} · IP ${LAN[dst].ip}`,
        )}
      </g>
      {!same && (
        <g>
          <path className="w teal" style={{ strokeWidth: 2 }} d={`M615 ${y(frame + 1)} H812`} markerEnd={arrowHead("teal")} />
          <text className="l halo" style={HALO} x="629" y={y(frame + 1) - 38}>{`${frame + 2} · router sends it on`}</text>
          <text className="s halo" style={HALO} x="629" y={y(frame + 1) - 16}>new frame, same IP</text>
        </g>
      )}
    </svg>
  );
}

/** One device's ARP table, the entry just learned highlighted. */
function ArpTable({ who, table, fresh, note }: { who: LanDevice; table: Record<string, string>; fresh?: string; note?: string }) {
  const entries = Object.entries(table);
  return (
    <div className="border-rule rounded-[2px] border px-4 py-3">
      <p className="text-ink text-[14.5px] font-semibold">{LAN[who].n}&rsquo;s ARP table</p>
      {note && <p className="text-ink-muted text-[13.5px]">{note}</p>}
      <ul className="mt-2 space-y-1 font-mono text-[14px]">
        {entries.length ? (
          entries.map(([ip, mac]) => (
            <li key={ip} className="text-ink">
              <span className={ip === fresh ? "dd-mark" : undefined}>
                {ip} → {mac}
              </span>
              {ip === fresh && <span className="text-ink-muted ml-2 font-sans text-[13px]">new</span>}
            </li>
          ))
        ) : (
          <li className="text-ink-faint font-sans">empty</li>
        )}
      </ul>
    </div>
  );
}

/** Send a packet on the office LAN and watch the ARP caches fill. */
export function ArpSim({ wide }: { wide?: boolean }) {
  const [src, setSrc] = useState<LanDevice>("fd");
  const [dst, setDst] = useState<LanDevice>("op");
  const [caches, setCaches] = useState<Caches>({});
  const [broadcasts, setBroadcasts] = useState(0);
  const [result, setResult] = useState<ArpRun | "cleared" | "same" | null>(null);

  const option = (k: LanDevice) => ({ value: k, label: `${LAN[k].n} · ${LAN[k].ip}` });

  function send() {
    if (src === dst) return setResult("same");
    const S = LAN[src];
    const D = LAN[dst];
    const sn = intToIp(networkOf(ipToInt(S.ip)!, 24));
    const dn = intToIp(networkOf(ipToInt(D.ip)!, 24));
    const same = sn === dn;
    const ask = same ? D.ip : "172.16.1.1";
    const owner = (Object.keys(LAN) as LanDevice[]).find((k) => LAN[k].ip === ask)!;
    const next: Caches = { ...caches, [src]: { ...(caches[src] ?? {}) } };
    const hit = !!next[src]![ask];
    if (!hit) {
      setBroadcasts((n) => n + 1);
      next[src]![ask] = LAN[owner].mac!;
      // The owner learns the asker from the request itself.
      next[owner] = { ...(next[owner] ?? {}), [S.ip]: S.mac! };
    }
    setCaches(next);
    setResult({ src, dst, owner, same, sn, dn, ask, hit });
  }

  const run = result && typeof result === "object" ? result : null;

  return (
    <WidgetFrame wide={wide} label="ARP simulator">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Select label="Sender" value={src} onChange={setSrc} options={(["fd", "ml", "op"] as LanDevice[]).map(option)} />
        <Select
          label="Target"
          value={dst}
          onChange={setDst}
          options={(["op", "ml", "fd", "gw", "lp", "api"] as LanDevice[]).map(option)}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Action primary onClick={send}>
          Send
        </Action>
        <Action
          onClick={() => {
            setCaches({});
            setBroadcasts(0);
            setResult("cleared");
          }}
        >
          Clear all ARP caches
        </Action>
      </div>
      <div className="mt-5" aria-live="polite">
        {result === null && <WidgetNote>Press Send to start. All ARP caches start empty.</WidgetNote>}
        {result === "cleared" && <WidgetNote>All caches cleared. The next Send will broadcast again.</WidgetNote>}
        {result === "same" && <p className="text-fault text-[15px]">Pick two different devices.</p>}
        {run && (
          <>
            <p className="text-ink-body text-[15.5px] leading-[1.55] text-pretty">
              <span className="text-ink font-semibold">Mask check:</span>{" "}
              <code className="bg-code text-ink rounded-[2px] px-1 font-mono text-[0.88em]">{run.sn}</code> vs{" "}
              <code className="bg-code text-ink rounded-[2px] px-1 font-mono text-[0.88em]">{run.dn}</code>.{" "}
              {run.same ? "Same network, so ARP asks for the target itself." : "Different network, so ARP asks for the gateway, 172.16.1.1."}
            </p>
            <div className="dd-fig mt-4">
              <ArpSequence run={run} />
            </div>
            <ul className="text-ink-muted mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[14px]">
              <li className="inline-flex items-center gap-2">
                <Swatch hue="plum" /> sender
              </li>
              <li className="inline-flex items-center gap-2">
                <Swatch hue="green" /> target
              </li>
              {!run.same && (
                <li className="inline-flex items-center gap-2">
                  <Swatch hue="teal" /> router: answers the ARP, passes the packet on
                </li>
              )}
            </ul>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ArpTable who={run.src} table={caches[run.src] ?? {}} fresh={run.hit ? undefined : run.ask} />
              {!run.hit && (
                <ArpTable
                  who={run.owner}
                  table={caches[run.owner] ?? {}}
                  fresh={LAN[run.src].ip}
                  note="It learned the sender from the request, for free."
                />
              )}
            </div>
            <WidgetNote>
              Broadcasts sent so far: {broadcasts}.{" "}
              {run.hit ? "Clear the caches to see the broadcast again." : "Press Send again: this time the cache answers."}
            </WidgetNote>
          </>
        )}
      </div>
    </WidgetFrame>
  );
}

/*
 * What NAT rewrites, field by field. "nat": NAT's own change; "hop": what
 * every router changes anyway, NAT or not.
 */
type Change = "nat" | "hop" | undefined;
interface NatField {
  k: string;
  v: string;
  who?: string;
  c?: Change;
}
interface NatFrame {
  where: string;
  eth: NatField[];
  ip: NatField[];
  tcp: NatField[];
  fcs: NatField;
}

const NAT_DIRS = {
  out: {
    label: "Going out",
    before: {
      where: "Before · on the home LAN",
      eth: [
        { k: "dst", v: "3c:84:6a:10:ee:01", who: "home router, LAN side" },
        { k: "src", v: "a4:83:e7:2b:91:0c", who: "laptop" },
      ],
      ip: [
        { k: "src", v: "192.168.1.23" },
        { k: "dst", v: "34.87.120.15" },
        { k: "TTL", v: "64" },
        { k: "checksum", v: "valid" },
      ],
      tcp: [
        { k: "src port", v: "52814" },
        { k: "dst port", v: "443" },
        { k: "checksum", v: "valid" },
      ],
      fcs: { k: "", v: "checks this frame" },
    },
    after: {
      where: "After · on the internet side (WAN)",
      eth: [
        { k: "dst", v: "00:1f:ca:88:10:01", who: "ISP router" },
        { k: "src", v: "3c:84:6a:10:ee:02", who: "home router, WAN side" },
      ],
      ip: [
        { k: "src", v: "203.0.113.45", c: "nat" },
        { k: "dst", v: "34.87.120.15" },
        { k: "TTL", v: "63", c: "hop" },
        { k: "checksum", v: "recalculated", c: "nat" },
      ],
      tcp: [
        { k: "src port", v: "40001", c: "nat" },
        { k: "dst port", v: "443" },
        { k: "checksum", v: "recalculated", c: "nat" },
      ],
      fcs: { k: "", v: "new for this frame", c: "hop" },
    },
    steps: [
      <>
        Writes a row in the NAT table: <code>192.168.1.23:52814 ↔ 203.0.113.45:40001</code> (section 5).
      </>,
      <>Replaces the private source IP and port with its public ones.</>,
      <>Recalculates both checksums, because the values they cover changed.</>,
    ],
  },
  back: {
    label: "Reply coming back",
    before: {
      where: "Before · arriving from the internet (WAN)",
      eth: [
        { k: "dst", v: "3c:84:6a:10:ee:02", who: "home router, WAN side" },
        { k: "src", v: "00:1f:ca:88:10:01", who: "ISP router" },
      ],
      ip: [
        { k: "src", v: "34.87.120.15" },
        { k: "dst", v: "203.0.113.45" },
        { k: "TTL", v: "52" },
        { k: "checksum", v: "valid" },
      ],
      tcp: [
        { k: "src port", v: "443" },
        { k: "dst port", v: "40001" },
        { k: "checksum", v: "valid" },
      ],
      fcs: { k: "", v: "checks this frame" },
    },
    after: {
      where: "After · on the home LAN",
      eth: [
        { k: "dst", v: "a4:83:e7:2b:91:0c", who: "laptop" },
        { k: "src", v: "3c:84:6a:10:ee:01", who: "home router, LAN side" },
      ],
      ip: [
        { k: "src", v: "34.87.120.15" },
        { k: "dst", v: "192.168.1.23", c: "nat" },
        { k: "TTL", v: "51", c: "hop" },
        { k: "checksum", v: "recalculated", c: "nat" },
      ],
      tcp: [
        { k: "src port", v: "443" },
        { k: "dst port", v: "52814", c: "nat" },
        { k: "checksum", v: "recalculated", c: "nat" },
      ],
      fcs: { k: "", v: "new for this frame", c: "hop" },
    },
    steps: [
      <>
        Looks up <code>203.0.113.45:40001</code> in the NAT table and finds <code>192.168.1.23:52814</code>.
      </>,
      <>Replaces the public destination IP and port with the laptop&apos;s private ones.</>,
      <>Recalculates both checksums, as on the way out.</>,
    ],
  },
} satisfies Record<string, { label: string; before: NatFrame; after: NatFrame; steps: React.ReactNode[] }>;

/** One header field: name, value, and how it changed. */
function NatValue({ f }: { f: NatField }) {
  return (
    <p className="mt-1 first-of-type:mt-0">
      {f.k && <span className="text-ink-muted mr-1 text-[13px]">{f.k}</span>}{" "}
      <span
        className={cn(
          "text-ink font-mono text-[14px]",
          f.c === "nat" ? "dd-mark font-bold" : "font-semibold",
        )}
      >
        {f.v}
      </span>
      {f.c === "hop" && <span className="text-ink-faint ml-2 text-[12.5px]">every hop</span>}
      {f.who && <span className="text-ink-muted block text-[13px]">{f.who}</span>}
    </p>
  );
}

/** A frame laid out like chapter 1's: Ethernet header, IP header, TCP header, data, FCS. */
function NatFrameStrip({ frame, after }: { frame: NatFrame; after?: boolean }) {
  const cell = "min-w-0 rounded-[2px] border px-3 py-2.5";
  const head = "text-ink mb-1.5 block text-[13.5px] font-semibold";
  // After the router, the whole frame is new: say so once, on its parts.
  const rebuilt = after && <span className="text-ink-faint block text-[12.5px] font-normal">rebuilt every hop</span>;
  return (
    <div>
      <p className="text-ink mb-2 text-[14.5px] font-semibold">{frame.where}</p>
      <div className="grid gap-[3px] @min-[700px]:grid-cols-[minmax(0,1.45fr)_minmax(0,1.2fr)_minmax(0,1.1fr)_minmax(0,0.75fr)_minmax(0,0.65fr)]">
        <div className={cn(cell, "border-teal bg-teal-soft")}>
          <span className={head}>Ethernet header{rebuilt}</span>
          {frame.eth.map((f) => (
            <NatValue key={f.k} f={f} />
          ))}
        </div>
        <div className={cn(cell, "border-green bg-green-soft")}>
          <span className={head}>IP header</span>
          {frame.ip.map((f) => (
            <NatValue key={f.k} f={f} />
          ))}
        </div>
        <div className={cn(cell, "border-amber bg-amber-soft")}>
          <span className={head}>TCP header</span>
          {frame.tcp.map((f) => (
            <NatValue key={f.k} f={f} />
          ))}
        </div>
        <div className={cn(cell, "border-plum bg-plum-soft")}>
          <span className={head}>Data</span>
          <p className="text-ink text-[14px]">HTTPS, encrypted</p>
          <p className="text-ink-muted mt-1 text-[13px]">never touched</p>
        </div>
        <div className={cn(cell, "border-teal bg-teal-soft")}>
          <span className={head}>FCS</span>
          <p className="text-ink text-[14px]">{frame.fcs.v}</p>
          {after && <p className="text-ink-faint mt-1 text-[12.5px]">every hop</p>}
        </div>
      </div>
    </div>
  );
}

/** One packet just before and just after the home router's NAT, either way. */
export function NatRewrite({ wide }: { wide?: boolean }) {
  const [dir, setDir] = useState<keyof typeof NAT_DIRS>("out");
  const d = NAT_DIRS[dir];
  return (
    <WidgetFrame wide={wide} label="What NAT rewrites in a packet">
      <Choices
        label="Direction"
        value={dir}
        onChange={setDir}
        options={(Object.keys(NAT_DIRS) as (keyof typeof NAT_DIRS)[]).map((k) => ({ value: k, label: NAT_DIRS[k].label }))}
      />
      <div className="@container mt-5" aria-live="polite">
        <NatFrameStrip frame={d.before} />
        {/* The router between the two: what it did to this packet. */}
        <div className="my-3 flex gap-3">
          <div aria-hidden="true" className="flex w-5 shrink-0 flex-col items-center">
            <span className="bg-ink-faint w-[1.5px] flex-1" />
            <span className="border-t-ink-faint border-x-[5px] border-t-[7px] border-x-transparent" />
          </div>
          <div className="border-teal flex-1 rounded-[2px] border-[1.25px] px-4 py-3">
            <p className="text-ink text-[14.5px] font-semibold">
              Home router <span className="text-ink-muted font-normal">· NAT</span>
            </p>
            <ol className="text-ink-body mt-1.5 ml-5 list-decimal space-y-1 text-[14.5px] leading-[1.5] marker:font-mono marker:text-[12.5px] marker:text-ink-faint [&_code]:bg-code [&_code]:text-ink [&_code]:rounded-[2px] [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em]">
              {d.steps.map((step, i) => (
                <li key={i} className="pl-1 text-pretty">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <NatFrameStrip frame={d.after} after />
      </div>
      <ul className="text-ink-muted mt-4 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[14px]">
        <li>
          <span className="dd-mark text-ink font-mono text-[13px] font-bold">value</span> rewritten by NAT
        </li>
        <li>
          <span className="text-ink-faint text-[12.5px]">every hop</span> changed by any router, NAT or not
        </li>
        <li className="inline-flex items-center gap-2">
          <Swatch hue="teal" /> frame
        </li>
        <li className="inline-flex items-center gap-2">
          <Swatch hue="green" /> IP
        </li>
        <li className="inline-flex items-center gap-2">
          <Swatch hue="amber" /> TCP
        </li>
        <li className="inline-flex items-center gap-2">
          <Swatch hue="plum" /> data (chapter 1)
        </li>
      </ul>
    </WidgetFrame>
  );
}

const NAT_ROWS = [
  { d: "Laptop, tab 1", priv: "192.168.1.23:52814", port: 40001 },
  { d: "Laptop, tab 2", priv: "192.168.1.23:52815", port: 40002 },
  { d: "Phone, Kadé app", priv: "192.168.1.40:61022", port: 40003 },
  { d: "Smart TV", priv: "192.168.1.52:49200", port: 40004 },
];
const NAT_TESTS = [40001, 40003, 40004, 22, 8443];

/** The home router's NAT table: does an incoming packet match a row? */
export function NatLookup({ wide }: { wide?: boolean }) {
  const [forward, setForward] = useState(false);
  const [port, setPort] = useState<number | null>(null);

  let outcome: string | null = null;
  if (port !== null) {
    const row = NAT_ROWS.find((r) => r.port === port);
    if (row)
      outcome = `Packet to 203.0.113.45:${port} matches a row. Destination rewritten to ${row.priv} and sent to the ${row.d.toLowerCase()}.`;
    else if (port === 8443 && forward)
      outcome = "Matches the forwarding rule. Sent to 192.168.1.23:3000, the Node app on your laptop.";
    else
      outcome = `A new request from the internet to port ${port}. No row matches, so the router does not know which device should get it. Dropped.`;
  }

  const rows = [
    ...NAT_ROWS.map((r) => ({ key: String(r.port), d: r.d, priv: r.priv, pub: `203.0.113.45:${r.port}`, port: r.port })),
    ...(forward ? [{ key: "fwd", d: "Forwarding rule", priv: "192.168.1.23:3000", pub: "203.0.113.45:8443", port: 8443 }] : []),
  ];

  return (
    <WidgetFrame wide={wide} label="NAT table lookup">
      <Choices
        label="Incoming packet"
        value={port}
        onChange={setPort}
        options={NAT_TESTS.map((t) => ({
          value: t,
          label: t < 1024 || t === 8443 ? `New request to port ${t}` : `Reply to port ${t}`,
        }))}
      />
      <label className="text-ink-body mt-4 flex cursor-pointer items-center gap-2.5 text-[15px]">
        <input
          type="checkbox"
          checked={forward}
          onChange={(e) => setForward(e.target.checked)}
          className="accent-ink size-4"
        />
        Add a port forwarding rule: 8443 → laptop port 3000 (section 6)
      </label>
      <table className="mt-5 w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-ink border-b">
            {["Row", "Private side", "Public side"].map((h) => (
              <th key={h} className="text-ink py-2 pr-4 text-[14px] font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const hit = port === r.port && (r.key !== "fwd" || forward);
            return (
              <tr key={r.key} className="border-rule border-b">
                <td className={hit ? "text-ink py-2 pr-4 text-[15px] font-semibold" : "text-ink py-2 pr-4 text-[15px]"}>{r.d}</td>
                <td className="text-ink py-2 pr-4 font-mono text-[14px]">{r.priv}</td>
                <td className="py-2 font-mono text-[14px]">
                  <span className={hit ? "dd-mark text-ink font-bold" : "text-ink"}>{r.pub}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4" aria-live="polite">
        {outcome ? <Outcome>{outcome}</Outcome> : <WidgetNote>Pick an incoming packet above.</WidgetNote>}
      </div>
    </WidgetFrame>
  );
}
