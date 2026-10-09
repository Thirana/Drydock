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
  ml: { n: "Manager laptop", ip: "172.16.1.11", x: 173, net: 1 },
  op: { n: "Office printer", ip: "172.16.1.20", x: 314, net: 1 },
  sc: { n: "Stock scanner", ip: "172.16.2.10", x: 510, net: 2 },
  pp: { n: "Packing PC", ip: "172.16.2.11", x: 651, net: 2 },
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

function OfficeDrawing({ src, dst }: { src?: Device; dst?: Device }) {
  const path = src && dst && src !== dst ? pathOf(src, dst) : { kind: "none" as const, segs: [] as string[] };
  const lit = (id: string) => (path.segs.includes(id) ? " hl" : "");
  const role = (k: Device) => (k === src ? " src" : k === dst ? " dst" : "");
  const routerUsed = path.kind === "cross" || path.kind === "net";
  return (
    <svg
      viewBox="0 0 960 470"
      role="img"
      aria-label="Kadé office: router with eth0 to the ISP, eth1 to the staff network and eth2 to the warehouse network; each network has a switch and three devices."
    >
      {LAN.map((k) => (
        <line
          key={k}
          className={`w${lit(`h-${k}`)}`}
          x1={OFFICE[k].x + 67}
          y1="360"
          x2={SWITCH_X[OFFICE[k].net as 1 | 2]}
          y2="318"
        />
      ))}
      <path className={`w${lit("sw1")}`} d="M241 278 V200 H340" />
      <path className={`w${lit("sw2")}`} d="M719 278 V200 H620" />
      <line className={`w${lit("isp")}`} x1="480" y1="130" x2="480" y2="70" />
      <rect className={`n teal${routerUsed ? " via" : ""}`} x="340" y="130" width="280" height="90" rx="2" />
      <text className="t" x="356" y="156">Office router</text>
      <text className="s" x="356" y="178">eth0 198.51.100.20 (to ISP)</text>
      <text className="s" x="356" y="198">eth1 172.16.1.1 · eth2 172.16.2.1</text>
      <text className="s" x="300" y="192">eth1</text>
      <text className="s" x="626" y="192">eth2</text>
      <text className="s" x="488" y="104">eth0</text>
      <rect className={`n${dst === "api" ? " dst" : ""}`} x="380" y="16" width="200" height="54" rx="2" />
      <text className="t" x="396" y="40">ISP → internet</text>
      <text className="s" x="396" y="59">kade-api 34.87.120.15</text>
      <rect className="zone" x="16" y="250" width="452" height="204" rx="2" />
      <text className="s" x="32" y="272">staff · 172.16.1.0/24</text>
      <rect className="zone" x="492" y="250" width="452" height="204" rx="2" />
      <text className="s" x="508" y="272">warehouse · 172.16.2.0/24</text>
      <rect className="n" x="166" y="278" width="150" height="40" rx="2" />
      <text className="mid" x="241" y="303">switch</text>
      <rect className="n" x="644" y="278" width="150" height="40" rx="2" />
      <text className="mid" x="719" y="303">switch</text>
      {LAN.map((k) => (
        <g key={k}>
          <rect className={`n${role(k)}`} x={OFFICE[k].x} y="360" width="135" height="62" rx="2" />
          <text className="t" x={OFFICE[k].x + 12} y="386">{OFFICE[k].n}</text>
          <text className="s" x={OFFICE[k].x + 12} y="406">.{OFFICE[k].ip.split(".")[3]}</text>
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
  const and = (
    <>
      {S.n} ANDs both addresses with 255.255.255.0: its own gives <code>{sn}</code>,{" "}
      {D.net ? `the ${lower(D.n)}` : "kade-api"}’s gives <code>{dn}</code>.
    </>
  );
  if (sn === dn)
    return [
      <>
        {and} <b className="text-ink">Equal: same network.</b>
      </>,
      `It sends straight to the ${lower(D.n)} (${D.ip}). The ${netName(S.net)} switch passes the frame across.`,
      "The router is not used.",
    ];
  if (D.net)
    return [
      <>
        {and} <b className="text-ink">Different networks.</b>
      </>,
      `It hands the packet to its default gateway, ${gw}.`,
      <>
        The router looks up {D.ip}: <code>{dn}/24</code> is directly connected on eth{D.net}.
      </>,
      `The router sends it out eth${D.net}, and the ${netName(D.net)} switch delivers it to the ${lower(D.n)}.`,
    ];
  return [
    <>
      {and} <b className="text-ink">Different networks.</b>
    </>,
    `It hands the packet to its default gateway, ${gw}.`,
    <>
      The router looks up 34.87.120.15. None of its connected networks match, so it uses its default route{" "}
      <code>0.0.0.0/0</code> → the ISP (198.51.100.1), out eth0.
    </>,
    `The ISP’s routers pass it on, hop by hop, to kade-api in GCP. On the way out, NAT swaps the private source ${S.ip} for 198.51.100.20.`,
  ];
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
        <OfficeDrawing src={src} dst={dst} />
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
          </>
        ) : (
          <p className="text-ink-muted mt-4 text-[14.5px]">
            Three networks meet at the router: staff on eth1, warehouse on eth2, the ISP on eth0.
          </p>
        )}
      </div>
    </WidgetFrame>
  );
}
