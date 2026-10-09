"use client";

import { useState } from "react";
import { intToIp, ipToInt, networkOf } from "@/lib/net/ipv4";
import { arrowHead } from "../diagram-defs";
import { Action, Choices, Outcome, Select, Steps, WidgetNote } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Chapters 8 to 10: what changes on each hop, how ARP finds a MAC, and how
 * NAT decides where an incoming packet goes.
 */

const HOPS = [
  {
    t: "Hop 1 · laptop → home router",
    fs: "a4:83:e7:2b:91:0c (laptop)",
    fd: "3c:84:6a:10:ee:01 (home router, LAN side)",
    ps: "192.168.1.23:52814",
    pd: "34.87.120.15:443",
    r: "The router sees its own MAC in the frame, so it takes it. Then it reads the destination IP. That is not one of its networks, so its default route sends it to the ISP.",
  },
  {
    t: "Hop 2 · home router → ISP router",
    fs: "3c:84:6a:10:ee:02 (home router, WAN side)",
    fd: "00:1f:ca:88:10:01 (ISP router)",
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
    fs: "42:01:0a:0a:01:01 (sn-app gateway)",
    fd: "42:01:0a:0a:01:0a (kade-api)",
    ps: "203.0.113.45:40001",
    pd: "10.10.1.10:443",
    r: "GCP has translated the external IP 34.87.120.15 to kade-api's internal 10.10.1.10 (1:1 NAT, chapter 10). kade-api sees its own MAC and its own IP, so it keeps the packet and passes it to the Node app on port 443.",
  },
];

type HopField = "fs" | "fd" | "ps" | "pd";
const HOP_FIELDS: [HopField, string][] = [
  ["fs", "frame · source MAC"],
  ["fd", "frame · destination MAC"],
  ["ps", "packet · source IP:port"],
  ["pd", "packet · destination IP:port"],
];

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
      <div aria-live="polite">
        <h4 className="text-ink mt-5 text-[17px] font-bold">{hop.t}</h4>
        <dl className="border-rule mt-3 grid grid-cols-1 border-t sm:grid-cols-2 sm:gap-x-8">
          {HOP_FIELDS.map(([k, label]) => {
            const changed = prev !== null && prev[k] !== hop[k];
            return (
              <div key={k} className="border-rule border-b py-2.5">
                <dt className="text-ink-muted text-[14px]">{label}</dt>
                <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                  <span className={changed ? "text-ink font-mono text-[14.5px] font-bold" : "text-ink font-mono text-[14.5px]"}>
                    {hop[k]}
                  </span>
                  {changed && <span className="text-ink-muted text-[13px]">changed</span>}
                </dd>
              </div>
            );
          })}
        </dl>
        <p className="text-ink-body mt-3 text-[15.5px] leading-[1.55] text-pretty">{hop.r}</p>
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
  const ends = { ml: 51, op: 158, gw: 265 } as Record<LanDevice, number>;
  const starts = { ml: 140, op: 158, gw: 176 } as Record<LanDevice, number>;
  const replyY = target === "op" ? 186 : 300;
  return (
    <figure className={wide ? "not-prose my-10" : "not-prose my-10 max-w-[760px]"}>
      <div className="dd-fig border-rule bg-ground overflow-x-auto rounded-[2px] border p-4 sm:p-5">
        <svg
          viewBox="0 0 920 334"
          role="img"
          aria-label={`ARP: the front desk PC broadcasts who has ${T.ip}; only ${T.n} replies with its MAC.`}
        >
          <rect className="n plum" x="20" y="118" width="210" height="90" rx="2" />
          <text className="t" x="36" y="144">Front desk PC</text>
          <text className="s" x="36" y="166">172.16.1.10</text>
          <text className="s" x="36" y="186">3c:7c:3f:10:22:01</text>
          {boxes.map(([k]) => (
            <line
              key={k}
              className="w amber dash"
              x1="230"
              y1={starts[k]}
              x2="638"
              y2={ends[k]}
              markerEnd={arrowHead("amber")}
            />
          ))}
          <line
            className="w green"
            x1="638"
            y1={replyY}
            x2="232"
            y2={target === "op" ? 192 : 200}
            markerEnd={arrowHead("green")}
          />
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
          <text className="l" x="250" y="26">1 · broadcast to ff:ff:ff:ff:ff:ff (everyone)</text>
          <text className="s" x="250" y="46">&quot;who has {T.ip}? tell 172.16.1.10&quot;</text>
          <text className="l" x="250" y={target === "op" ? 300 : 306}>2 · reply, only to the PC</text>
          <text className="s" x="250" y={target === "op" ? 318 : 324}>
            &quot;{T.ip} is at {T.mac}&quot;
          </text>
        </svg>
      </div>
      <p className="text-ink-muted mt-2 text-[14px] md:hidden">Wide by design - scroll it sideways.</p>
    </figure>
  );
}

type Caches = Partial<Record<LanDevice, Record<string, string>>>;

/** Send a packet on the office LAN and watch the ARP caches fill. */
export function ArpSim({ wide }: { wide?: boolean }) {
  const [src, setSrc] = useState<LanDevice>("fd");
  const [dst, setDst] = useState<LanDevice>("op");
  const [caches, setCaches] = useState<Caches>({});
  const [broadcasts, setBroadcasts] = useState(0);
  const [result, setResult] = useState<{ steps: React.ReactNode[]; table: LanDevice; fresh?: string } | "cleared" | "same" | null>(null);

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
    const cache = next[src]!;
    const steps: React.ReactNode[] = [
      <>
        Mask check: {sn} vs {dn}.{" "}
        <b className="text-ink">{same ? "Same network" : "Different network"}</b>, so ARP for{" "}
        {same ? "the target itself" : "the gateway"}: <code>{ask}</code>.
      </>,
    ];
    let fresh: string | undefined;
    if (cache[ask]) {
      steps.push(
        <>
          Cache hit: <code>{`${ask} → ${cache[ask]}`}</code>. <b className="text-ink">No broadcast needed.</b>
        </>,
      );
    } else {
      setBroadcasts((n) => n + 1);
      const others = (["fd", "ml", "op", "gw"] as LanDevice[])
        .filter((k) => k !== src && k !== owner)
        .map((k) => LAN[k].n.toLowerCase());
      steps.push(
        `Not in the cache. Broadcast to ff:ff:ff:ff:ff:ff: "who has ${ask}? tell ${S.ip}". The ${others.join(" and the ")} ignore it.`,
      );
      steps.push(`${LAN[owner].n} replies, only to the sender: "${ask} is at ${LAN[owner].mac}". Saved in the cache.`);
      cache[ask] = LAN[owner].mac!;
      fresh = ask;
      next[owner] = { ...(next[owner] ?? caches[owner] ?? {}), [S.ip]: S.mac! };
    }
    steps.push(
      <>
        Frame goes out: destination MAC <code>{cache[ask]}</code>
        {same ? "" : " (the router)"}, destination IP <code>{D.ip}</code>
        {same ? "" : " (unchanged)"}.
      </>,
    );
    setCaches(next);
    setResult({ steps, table: src, fresh });
  }

  const table = result && typeof result === "object" ? caches[result.table] ?? {} : {};

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
        {result && typeof result === "object" && (
          <>
            <Steps>{result.steps}</Steps>
            <table className="mt-5 w-full max-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-ink border-b">
                  <th className="text-ink py-2 pr-4 text-[14px] font-bold">{LAN[result.table].n}’s ARP table</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {Object.keys(table).length ? (
                  Object.entries(table).map(([ip, mac]) => (
                    <tr key={ip} className="border-rule border-b">
                      <td className="text-ink py-2 pr-4 font-mono text-[14px]">{ip}</td>
                      <td className="text-ink py-2 font-mono text-[14px]">
                        {mac}
                        {ip === result.fresh && <span className="text-ink-muted ml-2 font-sans text-[13px]">new</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-rule border-b">
                    <td className="text-ink-faint py-2 text-[14px]">empty</td>
                    <td />
                  </tr>
                )}
              </tbody>
            </table>
            <WidgetNote>Broadcasts sent so far: {broadcasts}</WidgetNote>
          </>
        )}
      </div>
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
