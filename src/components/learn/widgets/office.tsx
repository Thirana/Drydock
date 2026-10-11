"use client";

import { useState } from "react";
import { intToIp, ipToInt, networkOf } from "@/lib/net/ipv4";
import { Swatch } from "../swatch";
import { Select, Steps } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Chapter 6's office: one router, a staff network and a warehouse network.
 * Pick a sender and a target and the drawing lights the path the packet
 * takes, then the steps say why.
 */

type Device = "fd" | "ml" | "op" | "sc" | "pp" | "lp" | "api";

const OFFICE: Record<Device, { n: string; ip: string; x: number; net: 0 | 1 | 2 }> = {
  fd: { n: "Front desk PC", ip: "172.16.1.10", x: 32, net: 1 },
  ml: { n: "Manager laptop", ip: "172.16.1.11", x: 174, net: 1 },
  op: { n: "Office printer", ip: "172.16.1.20", x: 314, net: 1 },
  sc: { n: "Stock scanner", ip: "172.16.2.10", x: 510, net: 2 },
  pp: { n: "Packing PC", ip: "172.16.2.11", x: 652, net: 2 },
  lp: { n: "Label printer", ip: "172.16.2.20", x: 792, net: 2 },
  api: { n: "kade-api", ip: "34.87.120.15", x: 0, net: 0 },
};
const LAN: Device[] = ["fd", "ml", "op", "sc", "pp", "lp"];
const SWITCH_X = { 1: 241, 2: 719 } as const;

function pathOf(src: Device, dst: Device) {
  const S = OFFICE[src];
  const D = OFFICE[dst];
  if (!D.net) return { kind: "net" as const, segs: [`h-${src}`, `sw${S.net}`, "isp"] };
  if (S.net === D.net) return { kind: "same" as const, segs: [`h-${src}`, `h-${dst}`] };
  return { kind: "cross" as const, segs: [`h-${src}`, `sw${S.net}`, `sw${D.net}`, `h-${dst}`] };
}

function OfficeDrawing({ src, dst, only }: { src?: Device; dst?: Device; only?: string[] }) {
  const path = src && dst && src !== dst ? pathOf(src, dst) : { kind: "none" as const, segs: [] as string[] };
  // `only`: the segments of one hop the reader picked; otherwise the whole path.
  const lit = (id: string) => ((only ?? path.segs).includes(id) ? " hl" : "");
  const role = (k: Device) => (k === src ? " src" : k === dst ? " dst" : "");
  const routerUsed = path.kind === "cross" || path.kind === "net";
  // With nothing picked, colour each level by its role: devices plum, the
  // gear that forwards teal, the internet side green. With a pick, plum and
  // green belong to the sender and target instead.
  const overview = !src || !dst;
  return (
    <svg
      viewBox="0 0 960 506"
      role="img"
      aria-label="Kadé office: router with eth0 to the ISP, eth1 to the staff network and eth2 to the warehouse network; each network has a switch and three devices."
    >
      {/* Each device rises to a bus under its switch, then into the switch
          (square bends, DESIGN.md "The Bend Arrow Rule"). A lit path is
          drawn last so the shared bus shows it. */}
      {[...LAN]
        .sort((a, b) => (lit(`h-${a}`) ? 1 : 0) - (lit(`h-${b}`) ? 1 : 0))
        .map((k) => (
          <path
            key={k}
            className={`w${lit(`h-${k}`)}`}
            d={`M${OFFICE[k].x + 67} 396 V370 H${SWITCH_X[OFFICE[k].net as 1 | 2]} V344`}
          />
        ))}
      <path className={`w${lit("sw1")}`} d="M241 304 V200 H340" />
      <path className={`w${lit("sw2")}`} d="M719 304 V200 H620" />
      <line className={`w${lit("isp")}`} x1="480" y1="130" x2="480" y2="70" />
      <rect className={`n teal${routerUsed ? " via" : ""}`} x="340" y="130" width="280" height="90" rx="2" />
      <text className="t" x="356" y="156">Office router</text>
      <text className="s" x="356" y="178">eth0 198.51.100.20 (to ISP)</text>
      <text className="s" x="356" y="198">eth1 172.16.1.1 · eth2 172.16.2.1</text>
      <text className="s" x="300" y="192">eth1</text>
      <text className="s" x="626" y="192">eth2</text>
      <text className="s" x="488" y="104">eth0</text>
      <rect className={`n${overview ? " green" : dst === "api" ? " dst" : ""}`} x="380" y="16" width="200" height="54" rx="2" />
      <text className="t" x="396" y="40">ISP → internet</text>
      <text className="s" x="396" y="59">kade-api 34.87.120.15</text>
      <rect className="zone" x="16" y="250" width="452" height="240" rx="2" />
      <text className="s" x="32" y="272">staff · 172.16.1.0/24</text>
      <rect className="zone" x="492" y="250" width="452" height="240" rx="2" />
      <text className="s" x="508" y="272">warehouse · 172.16.2.0/24</text>
      <rect className="n teal" x="166" y="304" width="150" height="40" rx="2" />
      <text className="mid" x="241" y="329">switch</text>
      <rect className="n teal" x="644" y="304" width="150" height="40" rx="2" />
      <text className="mid" x="719" y="329">switch</text>
      {LAN.map((k) => (
        <g key={k}>
          <rect className={`n${overview ? " plum" : role(k)}`} x={OFFICE[k].x} y="396" width="135" height="62" rx="2" />
          <text className="t" x={OFFICE[k].x + 12} y="422">{OFFICE[k].n}</text>
          <text className="s" x={OFFICE[k].x + 12} y="442">.{OFFICE[k].ip.split(".")[3]}</text>
        </g>
      ))}
    </svg>
  );
}

function stepsFor(src: Device, dst: Device) {
  const S = OFFICE[src];
  const D = OFFICE[dst];
  const sn = intToIp(networkOf(ipToInt(S.ip)!, 24));
  const dn = intToIp(networkOf(ipToInt(D.ip)!, 24));
  const gw = S.net === 1 ? "172.16.1.1 (router eth1)" : "172.16.2.1 (router eth2)";
  const netName = (n: number) => (n === 1 ? "staff" : "warehouse");
  const lower = (t: string) => t[0].toLowerCase() + t.slice(1);
  const target = D.net ? `the ${lower(D.n)}` : "kade-api";
  const and = (
    <>
      {S.n} first checks: is {target} on my own network? Its mask, 255.255.255.0, says only the first
      three numbers name the network. Its own address gives <code>{sn}</code>; {target}’s gives{" "}
      <code>{dn}</code>.
    </>
  );
  if (sn === dn)
    return [
      <>
        {and} <b className="text-ink">They match: same network.</b>
      </>,
      `It sends straight to the ${lower(D.n)} (${D.ip}). The ${netName(S.net)} switch passes the frame across.`,
      "The router is not used.",
    ];
  if (D.net)
    return [
      <>
        {and} <b className="text-ink">They differ: different networks.</b>
      </>,
      `It hands the packet to its default gateway, ${gw}.`,
      <>
        The router looks up {D.ip}: <code>{dn}/24</code> is directly connected on eth{D.net}.
      </>,
      `The router sends it out eth${D.net}, and the ${netName(D.net)} switch delivers it to the ${lower(D.n)}.`,
    ];
  return [
    <>
      {and} <b className="text-ink">They differ: different networks.</b>
    </>,
    `It hands the packet to its default gateway, ${gw}.`,
    <>
      The router looks up 34.87.120.15. None of its connected networks match, so it uses its default route{" "}
      <code>0.0.0.0/0</code> → the ISP (198.51.100.1), out eth0.
    </>,
    `The ISP’s routers pass it on, hop by hop, to kade-api in GCP. On the way out, NAT swaps the private source ${S.ip} for 198.51.100.20.`,
  ];
}


/*
 * Inside the packet, hop by hop: the frame as it leaves each device that
 * sends it. Addresses match the rest of the course: MACs from chapters 0 and 9,
 * the router's ISP side and the NAT'd port from chapter 12.
 */
const MAC: Record<Device | "r0" | "r1" | "r2" | "isp", string> = {
  fd: "3c:7c:3f:10:22:01",
  ml: "f0:18:98:6d:2e:44",
  op: "30:05:5c:8a:12:e0",
  sc: "a8:6b:ad:41:07:3e",
  pp: "54:bf:64:2c:90:15",
  lp: "00:80:92:5a:31:c4",
  api: "",
  r0: "e4:8d:8c:00:01:00",
  r1: "e4:8d:8c:00:01:01",
  r2: "e4:8d:8c:00:01:02",
  isp: "5c:5e:ab:20:00:01",
};

interface Hop {
  from: string;
  to: string;
  /** Map segments this hop crosses, to light on the drawing. */
  segs: string[];
  ethDst: string;
  ethSrc: string;
  ipSrc: string;
  ipDst: string;
  ttl: number;
  sport: string;
  dport: string;
  data: string;
}

function hopsFor(src: Device, dst: Device): Hop[] {
  const S = OFFICE[src];
  const D = OFFICE[dst];
  const kind = pathOf(src, dst).kind;
  const r = (n: number) => `r${n}` as "r1" | "r2";
  const dport = D.net ? "9100 (printing)" : "443 (HTTPS)";
  const data = D.net ? "the print job" : "the HTTPS request, encrypted";
  const sport = "52814";
  const first: Hop = {
    from: S.n,
    to: kind === "same" ? D.n : `router eth${S.net}`,
    segs: kind === "same" ? [`h-${src}`, `h-${dst}`] : [`h-${src}`, `sw${S.net}`],
    ethDst: kind === "same" ? `${MAC[dst]}|${D.n}` : `${MAC[r(S.net)]}|router eth${S.net}`,
    ethSrc: `${MAC[src]}|${S.n}`,
    ipSrc: S.ip,
    ipDst: D.ip,
    ttl: 64,
    sport,
    dport,
    data,
  };
  if (kind === "same") return [first];
  if (kind === "cross")
    return [
      first,
      {
        ...first,
        from: `router eth${D.net}`,
        to: D.n,
        segs: [`sw${D.net}`, `h-${dst}`],
        ethDst: `${MAC[dst]}|${D.n}`,
        ethSrc: `${MAC[r(D.net)]}|router eth${D.net}`,
        ttl: 63,
      },
    ];
  return [
    first,
    {
      ...first,
      from: "router eth0",
      to: "the ISP's router",
      segs: ["isp"],
      ethDst: `${MAC.isp}|the ISP's router`,
      ethSrc: `${MAC.r0}|router eth0`,
      ipSrc: "198.51.100.20",
      ttl: 63,
      sport: "40001",
    },
  ];
}

/** What a hop's frame says after, compared with the frame before. */
const NOTES = {
  same: "One hop. The switch reads the MAC addresses and passes the frame on without changing anything.",
  cross:
    "The router builds a new frame for the next network: new MACs, a new FCS, TTL down by one. The IP addresses and ports never change. Chapter 8 explains why the two kinds of address behave so differently.",
  net: "The router builds a new frame, and NAT also rewrites the source IP and port (chapter 10). After the ISP come many more hops: the MACs change on every one, the IP addresses stay the same until Google\u2019s network. Chapter 12 follows every hop.",
} as const;

/** One header field; a MAC carries its device ("mac|device") on a muted line below. */
function Field({ name, value, changed }: { name: string; value: string; changed: boolean }) {
  const [main, owner] = value.split("|");
  return (
    <span className="block">
      <span className="text-ink-muted">{name} </span>
      <span className={changed ? "dd-mark text-ink" : "text-ink"}>{main}</span>
      {owner && <span className="text-ink-muted mb-1 block pl-[4ch] font-sans text-[13px]">{owner}</span>}
    </span>
  );
}

/** One frame laid out like chapter 1's: Ethernet header, IP header, TCP header, data, FCS. */
function FrameStrip({ hop, prev }: { hop: Hop; prev?: Hop }) {
  const c = (k: keyof Hop) => prev !== undefined && prev[k] !== hop[k];
  const cell = "rounded-[2px] border px-3 py-2.5";
  return (
    <div className="mt-3 grid gap-[3px] font-mono text-[13px] leading-[1.55] lg:grid-cols-[1.45fr_1.05fr_0.9fr_0.85fr_0.6fr]">
      <div className={`${cell} border-teal bg-teal-soft`}>
        <span className="text-ink mb-1 block font-sans text-[13.5px] font-semibold">Ethernet header</span>
        <Field name="dst" value={hop.ethDst} changed={c("ethDst")} />
        <Field name="src" value={hop.ethSrc} changed={c("ethSrc")} />
      </div>
      <div className={`${cell} border-green bg-green-soft`}>
        <span className="text-ink mb-1 block font-sans text-[13.5px] font-semibold">IP header</span>
        <Field name="src" value={hop.ipSrc} changed={c("ipSrc")} />
        <Field name="dst" value={hop.ipDst} changed={c("ipDst")} />
        <Field name="TTL" value={String(hop.ttl)} changed={c("ttl")} />
      </div>
      <div className={`${cell} border-amber bg-amber-soft`}>
        <span className="text-ink mb-1 block font-sans text-[13.5px] font-semibold">TCP header</span>
        <Field name="src" value={hop.sport} changed={c("sport")} />
        <Field name="dst" value={hop.dport} changed={c("dport")} />
      </div>
      <div className={`${cell} border-plum bg-plum-soft`}>
        <span className="text-ink mb-1 block font-sans text-[13.5px] font-semibold">Data</span>
        <span className="text-ink block font-sans text-[14px]">{hop.data}</span>
      </div>
      <div className={`${cell} border-teal bg-teal-soft`}>
        <span className="text-ink mb-1 block font-sans text-[13.5px] font-semibold">FCS</span>
        <span className={prev ? "dd-mark text-ink font-sans text-[14px]" : "text-ink block font-sans text-[14px]"}>
          {prev ? "new" : "checks the frame"}
        </span>
      </div>
    </div>
  );
}

/** The hop-by-hop panel: closed by default; picking a hop lights it on the map. */
function PacketHops({
  src,
  dst,
  open,
  onOpen,
  at,
  onAt,
}: {
  src: Device;
  dst: Device;
  open: boolean;
  onOpen: (open: boolean) => void;
  at: number | null;
  onAt: (at: number | null) => void;
}) {
  const hops = hopsFor(src, dst);
  const kind = pathOf(src, dst).kind as "same" | "cross" | "net";
  return (
    <div className="border-green/70 mt-5 rounded-[2px] border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          onOpen(!open);
          onAt(null);
        }}
        className="group hover:bg-green-soft flex min-h-12 w-full items-center gap-3 px-4 text-left transition-colors"
      >
        <span className="text-ink text-[16px] font-bold">Inside the packet, hop by hop</span>
        <span className="text-ink-muted hidden text-[14px] sm:inline">
          {hops.length} {hops.length === 1 ? "hop" : "hops"}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className={`ml-auto size-3.5 transition-transform duration-300 ${open ? "text-accent rotate-180" : "text-ink-muted"}`}
          style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.8 }}
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </button>
      {open && (
        <div className="border-green/40 border-t px-4 pb-5">
          <ol>
            {hops.map((hop, i) => {
              const on = at === i;
              return (
                <li key={i} className={i ? "border-rule mt-5 border-t pt-5" : "pt-4"}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => onAt(on ? null : i)}
                    className="group flex w-full flex-wrap items-baseline gap-x-3 gap-y-1 text-left"
                  >
                    <span className={`font-mono text-[14px] font-bold ${on ? "text-accent" : "text-ink-faint"}`}>
                      Hop {i + 1}
                    </span>
                    <span className="text-ink text-[16px] font-semibold">
                      {hop.from} → {hop.to}
                    </span>
                    <span className="dd-link text-[14px]">{on ? "shown on the map" : "show on the map"}</span>
                  </button>
                  <FrameStrip hop={hop} prev={hops[i - 1]} />
                </li>
              );
            })}
          </ol>
          <p className="text-ink-body mt-4 text-[15px] leading-[1.55] text-pretty">
            {hops.length > 1 && <span className="dd-mark">Highlighted</span>}
            {hops.length > 1 ? " fields changed since the hop before. " : ""}
            {NOTES[kind]}
          </p>
        </div>
      )}
    </div>
  );
}

/** The office, with or without a path; `pick` lets the reader choose both ends. */
export function OfficeMap({
  src: initialSrc,
  dst: initialDst,
  pick,
  wide,
}: {
  src?: string;
  dst?: string;
  pick?: string;
  wide?: boolean;
}) {
  const [src, setSrc] = useState<Device | undefined>(initialSrc as Device | undefined);
  const [dst, setDst] = useState<Device | undefined>(initialDst as Device | undefined);
  const [hopsOpen, setHopsOpen] = useState(false);
  const [hopAt, setHopAt] = useState<number | null>(null);
  // The three worked cases show their packets; "Try any pair" keeps to the steps.
  const showHops = !pick && src && dst && src !== dst;
  const only = showHops && hopsOpen && hopAt !== null ? hopsFor(src, dst)[hopAt]?.segs : undefined;
  const option = (k: Device) => ({ value: k, label: `${OFFICE[k].n} · ${OFFICE[k].ip}` });

  return (
    <WidgetFrame wide={wide} label="The Kadé office network">
      {pick && src && dst && (
        <div className="mb-5 flex flex-wrap gap-x-4 gap-y-3">
          <Select label="Sender" value={src} onChange={setSrc} options={LAN.map(option)} />
          <Select label="Target" value={dst} onChange={setDst} options={[...LAN, "api" as const].map(option)} />
        </div>
      )}
      <div className="dd-fig">
        <OfficeDrawing src={src} dst={dst} only={only} />
      </div>
      <div aria-live="polite">
        {src && dst ? (
          <>
            <ul className="text-ink-muted mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-[14px]">
              <li className="inline-flex items-center gap-2">
                <Swatch hue="plum" /> sender
              </li>
              <li className="inline-flex items-center gap-2">
                <Swatch hue="green" /> target and path
              </li>
              <li className="inline-flex items-center gap-2">
                <Swatch hue="amber" /> router used
              </li>
            </ul>
            <div className="mt-4">
              {src === dst ? (
                <p className="text-fault text-[15px]">Pick two different devices.</p>
              ) : (
                <Steps>{stepsFor(src, dst)}</Steps>
              )}
            </div>
            {showHops && (
              <PacketHops src={src} dst={dst} open={hopsOpen} onOpen={setHopsOpen} at={hopAt} onAt={setHopAt} />
            )}
          </>
        ) : (
          <>
            <ul className="text-ink-muted mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-[14px]">
              <li className="inline-flex items-center gap-2">
                <Swatch hue="plum" /> devices
              </li>
              <li className="inline-flex items-center gap-2">
                <Swatch hue="teal" /> router and switches: they pass traffic on
              </li>
              <li className="inline-flex items-center gap-2">
                <Swatch hue="green" /> the internet side, where kade-api is
              </li>
            </ul>
            <p className="text-ink-muted mt-3 text-[14.5px]">
              Three networks meet at the router: staff on eth1, warehouse on eth2, the ISP on eth0.
            </p>
          </>
        )}
      </div>
    </WidgetFrame>
  );
}
