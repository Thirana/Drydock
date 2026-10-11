"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { KeyValues, Rich, WidgetNote } from "../ui";
import { WidgetFrame } from "../widget-frame";
import { CaseExplorer, Result, type Case } from "./case-explorer";
import { Box, Caps, Drawing, Mark, T, Wire, Zone } from "./draw";
import { CheckList } from "./kit";

/* Part 5 · Growing out (chapters 14-15). */

// ── Chapter 14 ─────────────────────────────────────────────────────────────

/** Four ways to put a second VPC next to kade-vpc. */
export function VpcOptions() {
  const panels: [number, number, string, string][] = [
    [16, 16, "Not connected", "the default for staging"],
    [488, 16, "VPC peering", "two VPCs route to each other"],
    [16, 236, "Shared VPC", "one VPC, many projects use it"],
    [488, 236, "Private Service Connect", "one endpoint, one service"],
  ];
  const vpc = (x: number, y: number, label: string) => (
    <g key={`${x}${y}`}>
      <Zone x={x} y={y} w={180} h={110} c="blue" />
      <T x={x + 12} y={y + 20} size={11}>{label}</T>
    </g>
  );
  const workloads = (x: number, y: number) => (
    <g key={`w${x}`}>
      <Box x={x} y={y} w={140} h={34} c="blue" />
      <T x={x + 10} y={y + 22} size={11}>workloads</T>
    </g>
  );
  return (
    <WidgetFrame wide label="Four ways to add a second VPC">
      <Drawing h={456} label="Not connected, VPC peering, Shared VPC and Private Service Connect, side by side">
        {panels.map(([x, y, t, s], i) => (
          <g key={t}>
            <Zone x={x} y={y} w={456} h={204} />
            <T x={x + 16} y={y + 26} k="t">{`${i + 1} · ${t}`}</T>
            <T x={x + 16} y={y + 46} k="f" size={11}>{s}</T>
          </g>
        ))}
        {vpc(36, 74, "kade-vpc 10.10/16")}
        {vpc(256, 74, "staging-vpc 10.20/16")}
        <T x={236} y={134} k="x mid">✕</T>
        <T x={226} y={206} k="f mid" size={11}>nothing shared, nothing to break</T>
        {workloads(56, 100)}
        {workloads(276, 100)}
        {vpc(508, 74, "kade-vpc 10.10/16")}
        {vpc(728, 74, "staging-vpc 10.20/16")}
        <line className="w green" x1={688} y1={129} x2={728} y2={129} strokeWidth={5} />
        <T x={708} y={118} k="s mid" bold size={10.5}>peer</T>
        {workloads(528, 100)}
        {workloads(748, 100)}
        <T x={708} y={206} k="f mid" size={11}>subnet routes exchanged · ranges must not overlap</T>
        <Zone x={36} y={294} w={416} h={70} c="purple" />
        <T x={48} y={312} size={11}>host project kade-net · one VPC</T>
        <Box x={48} y={322} w={120} h={32} c="blue" />
        <T x={58} y={343} size={11}>sn-prod</T>
        <Box x={184} y={322} w={120} h={32} c="blue" />
        <T x={194} y={343} size={11}>sn-staging</T>
        <Box x={48} y={384} w={140} h={32} />
        <T x={58} y={405} size={11}>project prod</T>
        <Box x={220} y={384} w={160} h={32} />
        <T x={230} y={405} size={11}>project staging</T>
        <Wire x1={108} y1={384} x2={108} y2={357} dash />
        <Wire x1={276} y1={384} x2={244} y2={357} dash />
        {vpc(508, 294, "staging-vpc")}
        {vpc(728, 294, "kade-vpc")}
        <Box x={516} y={332} w={166} h={34} c="orange" />
        <T x={526} y={354} size={10.5}>endpoint 10.20.2.50</T>
        <Box x={748} y={332} w={140} h={34} c="green" />
        <T x={758} y={354} size={10.5}>one service only</T>
        <Wire x1={668} y1={349} x2={745} y2={349} c="orange" />
        <T x={708} y={426} k="f mid" size={11}>nothing else reachable · overlap allowed</T>
      </Drawing>
    </WidgetFrame>
  );
}

const PEERING_CASES: Case[] = [
  {
    k: "How peering works",
    take: "Both projects create their half of the peering. Once both exist, each VPC <b>learns the other's subnet routes</b>, so <code>10.10.1.20</code> can reach <code>10.20.1.10</code> directly over Google's network. Each side still needs a firewall rule allowing the other's range, and DNS names are not shared unless you add a peering zone.",
    cfg: "kade-vpc:     peering prod-to-staging  → kade-staging/staging-vpc\nstaging-vpc:  peering staging-to-prod  → kade-prod/kade-vpc\nboth halves exist → ACTIVE → subnet routes exchanged",
  },
  {
    k: "Rule 1",
    t: "no overlapping ranges",
    what: [
      ["ok", "staging uses 10.20.0.0/16"],
      ["overlap", "What if staging also used 10.10.0.0/16?"],
    ],
    take: {
      ok: "The two plans do not overlap, so every address means exactly one thing, and the peering is created. This is why chapter 0 reserved <code>10.20.0.0/16</code> for staging before staging existed.",
      overlap:
        "Both VPCs would have a <code>10.10.1.0/24</code>. A packet for <code>10.10.1.20</code> would have two possible destinations, so GCP <b>refuses to create the peering</b>. The only fix is renumbering one side, which means rebuilding its subnets. Planning ranges up front costs nothing; fixing an overlap later is expensive.",
    },
    cfg: "kade-vpc subnets:     10.10.1.0/24, 10.10.2.0/24, 10.10.3.0/24\nstaging-vpc subnets:  10.20.1.0/24, 10.20.3.0/24   ← no overlap → OK\n(10.10.1.0/24 on both sides → peering refused)",
  },
  {
    k: "Rule 2",
    t: "peering is not transitive",
    what: [
      ["vm", "staging → a VM in kade-vpc"],
      ["sql", "staging → Cloud SQL (via kade-vpc)"],
      ["third", "staging → a third VPC peered to kade-vpc"],
    ],
    take: {
      vm: "staging-vpc is peered directly with kade-vpc, so it has a route to kade-vpc's subnets. <b>This works.</b>",
      sql: "Cloud SQL lives in Google's service network, which is peered with kade-vpc (chapter 9). staging-vpc is peered with kade-vpc. Peering does not chain, so staging-vpc never learns a route to <code>10.10.32.0/20</code>. <b>No firewall rule can fix this</b>; there is no path.",
      third:
        "The same rule with three of your own VPCs: A peered to B and B peered to C does not connect A and C. A would need its own peering to C, or the VPCs would need Network Connectivity Center (section 06), which is built to connect many VPCs transitively.",
    },
    cfg: "staging-vpc ⇄ kade-vpc ⇄ Google service network (Cloud SQL)\nstaging-vpc → 10.10.1.20   ✓ direct peer\nstaging-vpc → 10.10.32.3   ✘ two peerings away\n\nA ⇄ B ⇄ C:  A → C   ✘",
  },
];

/** A VPC with its subnets listed as boxes. */
function VpcBox({ x, y, w, h, label, rows, c = "blue" }: { x: number; y: number; w: number; h: number; label: string; rows: [string, string?][]; c?: string }) {
  return (
    <g>
      <Zone x={x} y={y} w={w} h={h} c={c} />
      <T x={x + 14} y={y + 24} size={12}>{label}</T>
      {rows.map(([text, hue], i) => (
        <g key={text}>
          <Box x={x + 14} y={y + 40 + 44 * i} w={w - 28} h={34} c={hue ?? "blue"} />
          <T x={x + 26} y={y + 62 + 44 * i} size={11.5}>{text}</T>
        </g>
      ))}
    </g>
  );
}

function PeeringView({ c, what }: { c: Case; what: string }) {
  if (c.k === "How peering works") {
    return (
      <div className="space-y-4">
        <Drawing h={230} label="kade-vpc and staging-vpc joined by a peering; subnet routes exchanged">
          <VpcBox x={16} y={30} w={380} h={190} label="kade-vpc (project kade-prod)" rows={[["sn-app 10.10.1.0/24 · kade-worker 10.10.1.20"], ["sn-run 10.10.3.0/24"]]} />
          <VpcBox x={564} y={30} w={380} h={190} label="staging-vpc (project kade-staging)" rows={[["sn-app 10.20.1.0/24 · test VM 10.20.1.10"], ["sn-run 10.20.3.0/24"]]} />
          <line className="w green" x1={396} y1={125} x2={564} y2={125} strokeWidth={6} />
          <T x={480} y={110} k="s mid" bold size={11}>peering (both halves)</T>
          <T x={480} y={148} k="f mid" size={10.5}>routes exchanged</T>
        </Drawing>
        <div>
          <p className="text-ink-muted mb-2 text-[14px]">What each side learns, and what it does not</p>
          <CheckList
            items={[
              [true, "subnet routes", "10.20.1.0/24, 10.20.3.0/24 appear in kade-vpc (and the reverse)"],
              [false, "firewall rules", "each VPC still needs a rule allowing the other's range"],
              [false, "DNS", "private zones and VM names stay local unless a peering zone is added"],
              ["maybe", "custom routes", "only with export on one side and import on the other"],
            ]}
          />
        </div>
      </div>
    );
  }
  if (c.k === "Rule 1") {
    const overlap = what === "overlap";
    return (
      <div className="space-y-3">
        <Drawing h={230} label={overlap ? "Both VPCs use 10.10.1.0/24: the peering is refused" : "No overlap: the peering is active"}>
          <VpcBox x={16} y={30} w={380} h={190} label="kade-vpc" rows={[["10.10.1.0/24", overlap ? "red" : undefined], ["10.10.2.0/24"], ["10.10.3.0/24"]]} />
          <VpcBox
            x={564}
            y={30}
            w={380}
            h={190}
            label="staging-vpc"
            rows={overlap ? [["10.10.1.0/24", "red"], ["10.10.3.0/24", "red"]] : [["10.20.1.0/24"], ["10.20.3.0/24"]]}
          />
          {overlap ? (
            <>
              <line className="w fault dash" x1={396} y1={125} x2={564} y2={125} strokeWidth={4} />
              <Mark cx={480} cy={125} ok={false} r={14} />
              <T x={480} y={100} k="s mid c-red" bold size={11.5}>peering refused</T>
            </>
          ) : (
            <>
              <line className="w green" x1={396} y1={125} x2={564} y2={125} strokeWidth={6} />
              <T x={480} y={110} k="s mid" bold size={11.5}>peering ACTIVE</T>
            </>
          )}
        </Drawing>
        <Result tone={overlap ? "fault" : "ok"}>
          <b>{overlap ? "Which 10.10.1.20 is meant: kade-worker in prod, or a VM in staging?" : "Every address belongs to exactly one network"}</b>{" "}
          {overlap
            ? "GCP cannot tell, so it will not exchange the routes. Renumbering one side is the only fix."
            : "10.10.0.0/16 is prod, 10.20.0.0/16 is staging, decided in chapter 0 before staging existed."}
        </Result>
      </div>
    );
  }
  const vm = what === "vm";
  const third = what === "third";
  const vpc = (x: number, label: string, range: string, box: string, c: string, state?: string) => (
    <g key={label}>
      <Zone x={x} y={90} w={230} h={110} c={c} />
      <T x={x + 14} y={116} size={12}>{label}</T>
      <T x={x + 14} y={138} size={11}>{range}</T>
      <Box x={x + 14} y={150} w={200} h={34} c={state} />
      <T x={x + 26} y={172} size={11}>{box}</T>
    </g>
  );
  return (
    <div className="space-y-3">
      <Drawing h={296} label="staging-vpc peered to kade-vpc, which is peered to a third network">
        <Caps x={16} y={40}>staging-vpc&apos;s route table</Caps>
        <T x={16} y={62} k={vm ? "s" : "s c-red"} bold size={11.5}>
          {vm ? "has 10.10.0.0/16 subnet routes (direct peer) → reachable" : third ? "has no route to 10.30.0.0/16 → no path" : "has no route to 10.10.32.0/20 → no path"}
        </T>
        {vpc(16, "staging-vpc", "10.20.0.0/16", "test VM 10.20.1.10", "blue", "blue")}
        {vpc(365, "kade-vpc", "10.10.0.0/16", "kade-worker 10.10.1.20", "blue", vm ? "green" : "blue")}
        {vpc(714, third ? "another VPC (C)" : "Google's service network", third ? "10.30.0.0/16" : "10.10.32.0/20", third ? "a service 10.30.1.5" : "Cloud SQL 10.10.32.3", third ? "blue" : "purple", vm ? undefined : "red")}
        <line className="w green" x1={246} y1={145} x2={365} y2={145} strokeWidth={6} />
        <T x={305} y={132} k="s mid" bold size={10.5}>peering</T>
        <line className="w green" x1={595} y1={145} x2={714} y2={145} strokeWidth={6} />
        <T x={655} y={132} k="s mid" bold size={10.5}>peering</T>
        {vm ? (
          <path className="w green" d="M130 200 C 160 260, 440 260, 470 192" markerEnd="url(#dd-ah-green)" />
        ) : (
          <>
            <path className="w fault dash" d="M130 200 C 200 290, 760 290, 820 210" />
            <Mark cx={480} cy={268} ok={false} r={13} />
          </>
        )}
      </Drawing>
      <Result tone={vm ? "ok" : "fault"}>
        <b>{vm ? "Works: one peering away" : "Fails: two peerings away. Peering does not chain, and no firewall rule changes that"}</b>
      </Result>
    </div>
  );
}

/** VPC peering: how it works, and its two rules. */
export function PeeringEx() {
  return <CaseExplorer label="VPC peering examples" cases={PEERING_CASES} render={(c, what) => <PeeringView c={c} what={what} />} />;
}

/** A Shared VPC: one host project's network, used by service projects. */
export function SharedVpc() {
  const subnets: [number, string, string, string][] = [
    [48, "sn-prod-app", "10.10.1.0/24", "prod"],
    [278, "sn-prod-run", "10.10.3.0/24", "prod"],
    [508, "sn-staging-app", "10.20.1.0/24", "staging"],
    [738, "sn-staging-run", "10.20.3.0/24", "staging"],
  ];
  return (
    <WidgetFrame wide label="A Shared VPC">
      <Drawing h={386} label="Host project kade-net owns the VPC; service projects kade-prod and kade-staging use their own subnets in it">
        <Zone x={16} y={16} w={928} h={200} c="purple" />
        <T x={32} y={40} size={12}>HOST project kade-net · owns the VPC, subnets, routes and firewall rules</T>
        <Zone x={32} y={56} w={896} h={144} c="blue" />
        <T x={46} y={76} size={11.5}>shared-vpc</T>
        {subnets.map(([x, n, r, p]) => (
          <g key={n}>
            <Box x={x} y={90} w={174} h={96} c="blue" />
            <T x={x + 12} y={114} k="t" size={12}>{n}</T>
            <T x={x + 12} y={134} size={11}>{r}</T>
            <T x={x + 12} y={160} k="f" size={10.5}>resources from</T>
            <T x={x + 12} y={176} bold size={11}>{`project ${p}`}</T>
          </g>
        ))}
        <Box x={140} y={262} w={300} h={80} />
        <T x={156} y={290} k="t" size={12.5}>SERVICE project kade-prod</T>
        <T x={156} y={312} size={11}>networkUser on sn-prod-* only</T>
        <T x={156} y={330} k="f" size={11}>its own billing and IAM</T>
        <Box x={520} y={262} w={300} h={80} className="dash" />
        <T x={536} y={290} k="t" size={12.5}>SERVICE project kade-staging</T>
        <T x={536} y={312} size={11}>networkUser on sn-staging-* only</T>
        <T x={536} y={330} k="f" size={11}>its own billing and IAM</T>
        <path className="w dash" d="M260 262 C 260 230, 200 210, 170 190" markerEnd="url(#dd-ah-muted)" />
        <path className="w dash" d="M320 262 C 330 230, 360 210, 370 190" markerEnd="url(#dd-ah-muted)" />
        <path className="w dash" d="M640 262 C 640 230, 600 210, 595 190" markerEnd="url(#dd-ah-muted)" />
        <path className="w dash" d="M700 262 C 720 230, 800 210, 820 190" markerEnd="url(#dd-ah-muted)" />
        <T x={480} y={370} k="s mid" size={11.5}>
          Service projects put their VMs and Cloud Run services into the subnets they may use: one network, one plan, one rule set.
        </T>
      </Drawing>
      <WidgetNote>An example layout, not Kadé&apos;s: Kadé keeps two separate projects (section 07).</WidgetNote>
    </WidgetFrame>
  );
}

// ── Chapter 15 ─────────────────────────────────────────────────────────────

/** Three ways to join the office to kade-vpc. */
export function HybridPaths() {
  const row = (y: number, label: string, middle: ReactNode, note: string) => (
    <g key={label}>
      <Caps x={16} y={y - 8}>{label}</Caps>
      <Box x={16} y={y} w={180} h={62} />
      <T x={30} y={y + 26} k="t" size={12.5}>Kadé office</T>
      <T x={30} y={y + 46} size={11}>172.16.0.0/16</T>
      <Box x={764} y={y} w={180} h={62} c="blue" />
      <T x={778} y={y + 26} k="t" size={12.5}>kade-vpc</T>
      <T x={778} y={y + 46} size={11}>10.10.0.0/16</T>
      {middle}
      <T x={480} y={y + 82} k="f mid" size={11}>{note}</T>
    </g>
  );
  return (
    <WidgetFrame wide label="Three ways to reach kade-vpc from the office">
      <Drawing h={428} label="Per-person access, site-to-site VPN and Interconnect between the office and kade-vpc">
        {row(
          34,
          "1 · PER PERSON, OVER THE INTERNET",
          <>
            <line className="w dash" x1={196} y1={65} x2={390} y2={65} />
            <Box x={390} y={42} w={180} h={46} c="purple" />
            <T x={404} y={70} size={11.5}>IAP / Access sign-in</T>
            <Wire x1={570} y1={65} x2={761} y2={65} c="purple" />
          </>,
          "each person signs in; one tool at a time; devices without accounts are left out",
        )}
        {row(
          176,
          "2 · SITE-TO-SITE VPN, OVER THE INTERNET",
          <>
            <Box x={196} y={194} w={568} h={26} c="green" />
            <T x={480} y={212} k="s mid" bold size={11.5}>IPsec tunnels · whole networks · private IPs both ways</T>
          </>,
          "encrypted, over the public internet; about 3 Gbps per tunnel",
        )}
        {row(
          322,
          "3 · INTERCONNECT, A PRIVATE LINK",
          <>
            <line className="w" x1={196} y1={353} x2={761} y2={353} strokeWidth={6} style={{ stroke: "var(--dd-ink-muted)" }} />
            <Box x={395} y={332} w={170} h={42} />
            <T x={409} y={358} size={11}>colocation / partner</T>
          </>,
          "physical fibre into Google; many Gbps; steady latency; not encrypted by default",
        )}
      </Drawing>
    </WidgetFrame>
  );
}

const VPN_PARTS = [
  {
    k: "HA VPN gateway",
    n: "kade-havpn",
    hold: "A regional GCP resource with two interfaces, each with its own public IP that Google assigns. It is the GCP end of every tunnel.",
    kade: "asia-southeast1 · interface 0: 34.124.x.1 · interface 1: 34.124.x.2 (Google-assigned)",
  },
  {
    k: "Peer VPN gateway",
    n: "kade-office-gw",
    hold: "A description of the office router: how many interfaces it has and their public IPs. It is not a device GCP runs, just the address book entry for the other end.",
    kade: "one interface: 198.51.100.20",
  },
  {
    k: "VPN tunnels",
    n: "kade-tunnel-0, -1",
    hold: "Each tunnel is one IPsec connection between one HA VPN interface and one peer interface, with IKE version and a shared secret. Two tunnels, one per HA interface, give 99.99% on Google's side.",
    kade: "interface 0 → 198.51.100.20 and interface 1 → 198.51.100.20 · IKEv2 · long shared secret",
  },
  {
    k: "Cloud Router",
    n: "kade-vpn-router",
    hold: "Runs BGP for the tunnels: one router interface and one BGP session per tunnel, using a /30 from the link-local range 169.254.0.0/16. It installs the routes it learns into kade-vpc.",
    kade: "ASN 64512 · 169.254.0.1/30 and 169.254.1.1/30 · BFD on",
  },
  {
    k: "Office router",
    n: "(outside GCP)",
    hold: "Kadé's own firewall or router. It must be configured to match: same IKE settings and secret, its BGP side of each /30, its ASN, and MSS clamping.",
    kade: "ASN 65010 · 169.254.0.2 and 169.254.1.2 · advertises 172.16.0.0/16",
  },
];
type PartCase = Case & { i: number };
const PART_CASES: PartCase[] = VPN_PARTS.map((p, i) => ({ k: p.k, i, take: `<b>Holds:</b> ${p.hold}` }));

function PartView({ c }: { c: PartCase }) {
  const on = (i: number) => (i === c.i ? "cur" : undefined);
  const part = VPN_PARTS[c.i];
  const tunnels = c.i === 2;
  return (
    <div className="space-y-4">
      <Drawing h={270} label="The parts of Kadé's HA VPN; the selected part is marked">
        <Zone x={16} y={16} w={560} h={230} c="blue" />
        <T x={32} y={38} size={12}>GCP · kade-vpc · asia-southeast1</T>
        <Box x={40} y={60} w={200} h={90} c="purple" className={on(0)} />
        <T x={54} y={86} k="t" size={12.5}>HA VPN gateway</T>
        <T x={54} y={106} size={11}>kade-havpn</T>
        <T x={54} y={124} k="f" size={10.5}>if0 · if1</T>
        <Box x={40} y={170} w={200} h={64} c="blue" className={on(3)} />
        <T x={54} y={196} k="t" size={12.5}>Cloud Router</T>
        <T x={54} y={216} size={11}>kade-vpn-router · 64512</T>
        <line className="w dash" x1={140} y1={150} x2={140} y2={168} />
        <T x={150} y={163} k="f" size={10}>BGP over the tunnels</T>
        <Box x={320} y={182} w={262} h={56} className={on(1)} />
        <T x={334} y={204} k="t" size={11.5}>Peer VPN gateway · kade-office-gw</T>
        <T x={334} y={224} k="f" size={10.5}>GCP resource: describes 198.51.100.20</T>
        <Zone x={660} y={16} w={284} h={230} />
        <T x={676} y={38} size={12}>Kadé office · 172.16.0.0/16</T>
        <Box x={684} y={90} w={236} h={90} className={on(4)} />
        <T x={698} y={116} k="t" size={12.5}>Office router</T>
        <T x={698} y={136} size={11}>198.51.100.20 · ASN 65010</T>
        <T x={698} y={154} k="f" size={10.5}>IPsec + BGP + MSS clamp</T>
        <path className={cn("w", tunnels && "cur")} d="M240 90 C 420 66, 560 66, 683 118" />
        <path className={cn("w", tunnels && "cur")} d="M240 128 C 420 150, 560 150, 683 152" />
        <T x={460} y={62} k="s mid" bold={tunnels} size={11}>tunnel 0 · 169.254.0.1 ↔ .0.2</T>
        <T x={460} y={166} k="s mid" bold={tunnels} size={11}>tunnel 1 · 169.254.1.1 ↔ .1.2</T>
        <T x={460} y={262} k="f mid" size={10.5}>both tunnels: IPsec over the public internet</T>
      </Drawing>
      <div className="border-rule border-t pt-3">
        <p className="text-ink text-[16px] font-bold">
          {part.k} · <span className="font-mono text-[15px]">{part.n}</span>
        </p>
        <KeyValues className="mt-2" items={[["Kadé's value", part.kade]]} />
      </div>
    </div>
  );
}

/** The five parts of an HA VPN, one at a time. */
export function VpnParts() {
  return <CaseExplorer label="The parts of an HA VPN" cases={PART_CASES} render={(c) => <PartView c={c} />} />;
}

const BGP_CASES: Case[] = [
  {
    k: "What each side learns",
    what: [
      ["full", "Custom advertisement (Kadé)"],
      ["default", "What if Cloud Router uses the default (subnets only)?"],
    ],
    take: {
      full: "Kadé advertises its subnets <b>plus</b> two ranges that are not subnets: Cloud SQL's <code>10.10.32.0/20</code> and Cloud DNS's <code>35.199.192.0/19</code>. The office advertises its whole <code>172.16.0.0/16</code>. Each side installs the other's list as routes through the tunnels.",
      default:
        "With the default advertisement, only kade-vpc's <b>subnets</b> are sent. The office has no route to <code>10.10.32.0/20</code>, so the accountant's reports to Cloud SQL fail, and no route to <code>35.199.192.0/19</code>, so replies to GCP's DNS forwarding queries leave the office the wrong way (chapter 8, tab C).",
    },
    cfg: "kade-vpn-router: advertisement-mode CUSTOM\n  groups: ALL_SUBNETS\n  ranges: 10.10.32.0/20, 35.199.192.0/19\noffice router: advertises 172.16.0.0/16",
  },
  {
    k: "Routing mode",
    what: [
      ["regional", "Dynamic routing: regional"],
      ["global", "Dynamic routing: global"],
    ],
    take: {
      regional:
        "The learned route to <code>172.16.0.0/16</code> is used only by resources in the Cloud Router's region, asia-southeast1. A VM in another region of kade-vpc has no path to the office.",
      global: "In global mode, the learned route is available to every region of kade-vpc. Needed as soon as Kadé runs anything in a second region.",
    },
    cfg: "gcloud compute networks update kade-vpc --bgp-routing-mode=global",
  },
];

function BgpView({ c, what }: { c: Case; what: string }) {
  if (c.k === "What each side learns") {
    const full = what === "full";
    const ads: [string, boolean][] = [
      ["10.10.1.0/24  sn-app", true],
      ["10.10.2.0/24  sn-data", true],
      ["10.10.3.0/24  sn-run", true],
      ["10.10.32.0/20  Cloud SQL range", full],
      ["35.199.192.0/19  DNS forwarding", full],
    ];
    return (
      <div className="space-y-3">
        <Drawing h={280} label="What kade-vpn-router and the office router advertise to each other">
          <Box x={16} y={20} w={380} h={250} c="blue" />
          <T x={32} y={46} k="t" size={13}>kade-vpn-router advertises →</T>
          {ads.map(([t, ok], i) => (
            <g key={t}>
              <Box x={32} y={62 + 40 * i} w={348} h={32} c={ok ? "green" : "red"} className={ok ? undefined : "dash"} />
              <T x={44} y={83 + 40 * i} k={ok ? "s" : "s c-red"} size={11.5}>{`${ok ? "✓ " : "✕ "}${t}`}</T>
            </g>
          ))}
          <Box x={564} y={20} w={380} h={250} />
          <T x={580} y={46} k="t" size={13}>← office router advertises</T>
          <Box x={580} y={62} w={348} h={32} c="green" />
          <T x={592} y={83} size={11.5}>✓ 172.16.0.0/16  whole office</T>
          <T x={580} y={130} k="f" size={11}>installed in kade-vpc as dynamic</T>
          <T x={580} y={148} k="f" size={11}>routes (chapter 4), next hop: the</T>
          <T x={580} y={166} k="f" size={11}>tunnels, priority from BGP</T>
          <line className="w green" x1={396} y1={100} x2={564} y2={100} strokeWidth={4} />
          <line className="w green" x1={396} y1={160} x2={564} y2={160} strokeWidth={4} />
          <T x={480} y={90} k="s mid" bold size={10.5}>tunnel 0 · BGP</T>
          <T x={480} y={150} k="s mid" bold size={10.5}>tunnel 1 · BGP</T>
        </Drawing>
        <Result tone={full ? "ok" : "fault"}>
          <b>{full ? "Office reaches subnets, Cloud SQL, and DNS replies come back" : "Office reaches subnets only: Cloud SQL and DNS forwarding replies have no route"}</b>
        </Result>
      </div>
    );
  }
  const global = what === "global";
  return (
    <div className="space-y-3">
      <Drawing h={240} label={`Dynamic routing mode ${global ? "global" : "regional"}: which regions use the learned route`}>
        <Zone x={16} y={16} w={928} h={220} c="blue" />
        <T x={32} y={38} size={12}>kade-vpc (global network)</T>
        <Zone x={32} y={52} w={440} h={168} />
        <T x={46} y={72} size={11.5}>region asia-southeast1</T>
        <Box x={46} y={86} w={190} h={60} c="blue" />
        <T x={58} y={110} k="t" size={12}>Cloud Router</T>
        <T x={58} y={128} size={10.5}>learns 172.16.0.0/16</T>
        <Box x={256} y={86} w={200} h={60} c="green" />
        <T x={268} y={110} k="t" size={12}>kade-worker</T>
        <T x={268} y={128} size={10.5}>✓ route to the office</T>
        <Zone x={488} y={52} w={440} h={168} />
        <T x={502} y={72} size={11.5}>region asia-south1 (a future second region)</T>
        <Box x={502} y={86} w={220} h={60} c={global ? "green" : "red"} />
        <T x={514} y={110} k="t" size={12}>a VM here</T>
        <T x={514} y={128} k={global ? "s" : "s c-red"} size={10.5}>{global ? "✓ route to the office" : "✕ no route to the office"}</T>
        <path className={cn("w", global ? "green" : "fault dash")} d="M236 150 C 300 200, 560 200, 600 150" markerEnd={global ? "url(#dd-ah-green)" : undefined} />
        <T x={420} y={206} k={global ? "s mid" : "s mid c-red"} bold size={11}>
          {global ? "learned routes shared with every region" : "learned routes stay in the router's region"}
        </T>
      </Drawing>
      <Result tone={global ? "ok" : "warn"}>
        <b>{global ? "Global: every region can reach the office" : "Regional: fine for Kadé today, because everything runs in asia-southeast1"}</b>
      </Result>
    </div>
  );
}

/** What BGP advertises over the VPN, and where the learned routes apply. */
export function BgpEx() {
  return <CaseExplorer label="BGP over the VPN" cases={BGP_CASES} render={(c, what) => <BgpView c={c} what={what} />} />;
}

const FAILOVER_CASES: Case[] = [
  {
    k: "Active/active",
    what: [
      ["up", "Both tunnels up"],
      ["down", "What if tunnel 0 fails?"],
    ],
    take: {
      up: "Both tunnels advertise the office route with the <b>same priority</b>, so kade-vpc has two equal routes and shares connections across them (ECMP, chapter 4 example D). Uses both tunnels' bandwidth.",
      down: "Tunnel 0 dies. Its BGP session drops (in about a second with BFD, up to a minute without), its route is <b>withdrawn</b>, and all traffic continues on tunnel 1. Nobody changes anything by hand.",
    },
    cfg: "office-0: advertised-route-priority 100\noffice-1: advertised-route-priority 100\n→ two equal routes to 172.16.0.0/16 (ECMP)",
  },
  {
    k: "Active/passive",
    what: [
      ["up", "Both tunnels up"],
      ["down", "What if tunnel 0 fails?"],
    ],
    take: {
      up: "Tunnel 1's routes carry a worse priority (a higher number), so all traffic uses tunnel 0 while it is up. Tunnel 1 waits. Used when the office side cannot handle traffic arriving on two paths at once.",
      down: "Tunnel 0's routes are withdrawn, so the backup routes through tunnel 1 become the best ones and traffic moves over. When tunnel 0 returns, traffic moves back.",
    },
    cfg: "office-0: advertised-route-priority 100\noffice-1: advertised-route-priority 200\n→ tunnel 0 preferred; tunnel 1 only when tunnel 0 is down",
  },
];

function FailoverView({ c, what }: { c: Case; what: string }) {
  const down = what === "down";
  const both = c.k === "Active/active";
  const t1Busy = both || down;
  const routes: [string, string, boolean][] = [
    ["via tunnel 0", "100", !down],
    ["via tunnel 1", both ? "100" : "200", true],
  ];
  return (
    <div className="space-y-4">
      <Drawing h={214} label="kade-worker to the office over two tunnels">
        <Box x={16} y={70} w={200} h={90} c="blue" />
        <T x={30} y={98} k="t" size={13}>kade-worker</T>
        <T x={30} y={120} size={11}>→ 172.16.2.0/24</T>
        <Box x={744} y={70} w={200} h={90} />
        <T x={758} y={98} k="t" size={13}>office</T>
        <T x={758} y={120} size={11}>scanners, file server</T>
        <path className={cn("w", down ? "fault dash" : "green")} d="M216 100 C 360 40, 600 40, 741 100" strokeWidth={down ? 2 : 3} />
        <T x={480} y={26} k={down ? "s mid c-red" : "s mid"} bold size={11}>
          {`tunnel 0 · priority 100 · ${down ? "DOWN: route withdrawn" : "carrying traffic"}`}
        </T>
        {down && <Mark cx={480} cy={56} ok={false} />}
        <path className={cn("w", t1Busy && "green")} d="M216 130 C 360 190, 600 190, 741 130" strokeWidth={t1Busy ? 3 : 2} />
        <T x={480} y={200} k={t1Busy ? "s mid" : "f mid"} bold={t1Busy} size={11}>
          {`tunnel 1 · priority ${both ? 100 : 200} · ${t1Busy ? "carrying traffic" : "standing by"}`}
        </T>
      </Drawing>
      <div>
        <p className="text-ink-muted mb-2 text-[14px]">kade-vpc&apos;s routes to 172.16.0.0/16</p>
        <ul className="border-rule border-t">
          {routes.map(([via, pr, live], i) => {
            const used = live && (both || down ? i === 1 || (!down && both) : i === 0);
            return (
              <li key={via} className={cn("border-rule grid grid-cols-[minmax(0,1fr)_120px_100px] gap-x-4 border-b py-2.5 font-mono text-[13.5px]", !live && "text-ink-faint line-through")}>
                <span className={cn(used && "text-ink font-bold")}>172.16.0.0/16 {via}</span>
                <span>priority {pr}</span>
                <span className={cn("text-right font-sans text-[14px] font-semibold", !live ? "text-fault no-underline" : used ? "text-ink" : "text-ink-faint")}>
                  {live ? (used ? (both && !down ? "ECMP" : "in use") : "backup") : "withdrawn"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Two tunnels, active/active or active/passive, and what a failure does. */
export function FailoverEx() {
  return <CaseExplorer label="VPN failover" cases={FAILOVER_CASES} render={(c, what) => <FailoverView c={c} what={what} />} />;
}

/** One full-size packet, before and after IPsec wraps it. */
export function MtuBar() {
  const scale = 0.44;
  const x = (b: number) => 16 + b * scale;
  const bar = (y: number, parts: [string, number, boolean][], label: [string, string]) => {
    let at = 0;
    return (
      <g key={y}>
        {parts.map(([t, bytes, extra]) => {
          const left = x(at);
          at += bytes;
          return (
            <g key={`${t}${left}`}>
              <rect className={extra ? "n mark" : "n teal"} x={left} y={y} width={Math.max(bytes * scale - 2, 3)} height={40} rx="2" />
              {bytes * scale > 120 && (
                <T x={left + 8} y={y + 25} size={11}>
                  {t}
                </T>
              )}
            </g>
          );
        })}
        <T x={x(1560) + 20} y={y + 18} k="t" size={12}>{label[0]}</T>
        <T x={x(1560) + 20} y={y + 35} size={11}>{label[1]}</T>
      </g>
    );
  };
  return (
    <WidgetFrame wide label="A packet wrapped by IPsec">
      <Drawing h={184} label="A 1460-byte packet grows to about 1534 bytes once IPsec wraps it, past the typical 1500-byte internet MTU">
        <Caps x={16} y={22}>ONE FULL-SIZE PACKET FROM kade-worker TO THE OFFICE</Caps>
        {bar(38, [["inner packet: TCP data + headers", 1460, false]], ["1460 bytes", "what the VM sends (VPC MTU)"])}
        {bar(
          110,
          [
            ["", 20, true],
            ["", 24, true],
            ["the same inner packet", 1460, false],
            ["", 30, true],
          ],
          ["≈ 1534 bytes", "after IPsec wraps it"],
        )}
        <T x={16} y={170} size={11}>highlighted = IPsec additions: new IP header (20) + ESP header and IV (24) + padding, trailer and auth tag (≈30)</T>
        <line className="w fault dash" x1={x(1500)} y1={30} x2={x(1500)} y2={158} strokeWidth={2} />
        <T x={x(1500) - 6} y={26} k="s c-red" end size={10.5}>1500: typical internet MTU</T>
      </Drawing>
      <WidgetNote>
        Cloud VPN handles the outer packet size on Google&apos;s side. On the office side, MSS clamping keeps TCP from filling the tunnel with packets that
        will not fit once wrapped. Header sizes vary with the cipher; these are typical.
      </WidgetNote>
    </WidgetFrame>
  );
}

const FLOW_WHAT: [string, string][] = [
  ["all", "Everything set up"],
  ["noadv", "Cloud SQL range not advertised"],
  ["noexp", "PSA peering does not export routes"],
  ["nofw", "No firewall rule for the warehouse"],
  ["nofwd", "Office firewall blocks 35.199.192.0/19"],
];
const FLOW_TAKE: Record<string, Record<string, string>> = {
  scan: {
    all: "Route out: the office learned <code>10.10.1.0/24</code> over BGP. Route back: kade-vpc learned <code>172.16.0.0/16</code>. Firewall: <code>kade-warehouse-to-inventory</code> allows tcp:8443 from <code>172.16.2.0/24</code> to sa-kade-worker. All three are needed.",
    nofw: "Routes exist both ways and the tunnel is up, but kade-worker's ingress rules have nothing for <code>172.16.2.0/24</code>, so the implied deny drops it (chapter 5.1). A working VPN is not permission.",
  },
  sql: {
    all: "Two routes are needed that a subnet-only setup forgets. The office learns <code>10.10.32.0/20</code> because the Cloud Router advertises it; Google's service network learns <code>172.16.0.0/16</code> because the PSA peering exports custom routes (chapter 9, tab C).",
    noadv:
      "The office has no route to <code>10.10.32.0/20</code>, because it is not a subnet and so is not advertised by default. The accountant's report never leaves the office router.",
    noexp:
      "The request reaches Cloud SQL, but Google's service network has no route back to <code>172.16.0.0/16</code>: the VPN routes stay inside kade-vpc unless the peering exports them. The reply is lost.",
  },
  nas: {
    all: "Two steps. DNS: the forwarding zone sends <code>nas.office.kade.lan</code> to the office DNS server from <code>35.199.192.0/19</code>, and its reply comes back because Kadé advertises that range. Then kade-worker connects to <code>172.16.1.40</code> over the tunnel.",
    nofwd:
      'The office firewall drops DNS queries from <code>35.199.192.0/19</code>. kade-worker gets SERVFAIL for the name, even though it could reach <code>172.16.1.40</code> by IP. The file server "is down" only by name (chapter 8, tab C).',
  },
};
const FLOW_BREAKS: Record<string, string[]> = { scan: ["nofw"], sql: ["noadv", "noexp"], nas: ["nofwd"] };
type FlowCase = Case & { f: "scan" | "sql" | "nas" };
const FLOW_CASES: FlowCase[] = [
  { k: "Warehouse scanner → inventory API", what: FLOW_WHAT, f: "scan", take: "" },
  { k: "Accountant → Cloud SQL", what: FLOW_WHAT, f: "sql", take: "" },
  { k: "kade-worker → office file server (DNS + traffic)", what: FLOW_WHAT, f: "nas", take: "" },
];

function FlowView({ c, what }: { c: FlowCase; what: string }) {
  const relevant = FLOW_BREAKS[c.f].includes(what) ? what : null;
  const take = FLOW_TAKE[c.f][relevant ?? "all"];
  const from = { scan: ["Warehouse scanner", "172.16.2.31", ""], sql: ["Accountant PC", "172.16.1.25", ""], nas: ["kade-worker", "10.10.1.20", "blue"] }[c.f];
  const to = { scan: ["kade-worker", "10.10.1.20:8443", "blue"], sql: ["Cloud SQL kade-sql", "10.10.32.3:5432", "green"], nas: ["nas.office.kade.lan", "172.16.1.40", ""] }[c.f];
  const office = c.f === "nas" ? to : from;
  const gcp = c.f === "nas" ? from : to;
  const needs: [string, string, boolean][] = {
    scan: [
      ["route office → 10.10.1.0/24", "Cloud Router advertises all subnets", true],
      ["route kade-vpc → 172.16.0.0/16", "learned over BGP", true],
      ["firewall on kade-worker", "kade-warehouse-to-inventory · tcp:8443 from 172.16.2.0/24", what !== "nofw"],
    ] as [string, string, boolean][],
    sql: [
      ["route office → 10.10.32.0/20", "custom advertisement of the PSA range", what !== "noadv"],
      ["route Google network → 172.16.0.0/16", "PSA peering exports custom routes", what !== "noexp"],
      ["database login", "the accountant's own database user", true],
    ] as [string, string, boolean][],
    nas: [
      ["DNS: forwarding zone office.kade.lan", "query sent from 35.199.192.0/19 to 172.16.1.53", true],
      ["office firewall + route back", "allows 35.199.192.0/19; Kadé advertises it", what !== "nofwd"],
      ["traffic to 172.16.1.40", "office route learned over BGP", true],
    ] as [string, string, boolean][],
  }[c.f];
  const missing = needs.find(([, , ok]) => !ok);
  return (
    <div className="space-y-4">
      <Drawing h={132} label="The two ends of the flow, joined by the VPN tunnels">
        <Box x={16} y={40} w={220} h={80} c={office[2]} />
        <T x={30} y={68} k="t" size={12.5}>{office[0]}</T>
        <T x={30} y={90} size={11}>{office[1]}</T>
        <T x={30} y={108} k="f" size={10.5}>office side</T>
        <Box x={724} y={40} w={220} h={80} c={gcp[2]} />
        <T x={738} y={68} k="t" size={12.5}>{gcp[0]}</T>
        <T x={738} y={90} size={11}>{gcp[1]}</T>
        <T x={738} y={108} k="f" size={10.5}>{c.f === "sql" ? "Google's service network" : "kade-vpc"}</T>
        <Box x={300} y={64} w={360} h={32} c="green" />
        <T x={480} y={85} k="s mid" bold size={11.5}>HA VPN tunnels: up</T>
        <Wire x1={236} y1={80} x2={298} y2={80} plain />
        <Wire x1={660} y1={80} x2={721} y2={80} plain />
      </Drawing>
      <div>
        <p className="text-ink-muted mb-2 text-[14px]">What this flow needs</p>
        <CheckList items={needs.map(([t, d, ok]) => [ok, t, d])} />
      </div>
      <Result tone={missing ? "fault" : "ok"}>
        <b>{missing ? `Fails, although the tunnels are up: ${missing[0]}` : "Works"}</b>
      </Result>
      <p className="text-ink-body max-w-[72ch] text-[16px] leading-[1.6] text-pretty">
        <Rich text={take} />
        {what !== "all" && !relevant && <span className="text-ink-faint"> (This setting does not affect this flow.)</span>}
      </p>
    </div>
  );
}

/** Three real flows over the VPN, and the one setting each depends on. */
export function VpnFlows() {
  return <CaseExplorer label="Flows over the VPN" cases={FLOW_CASES} render={(c, what) => <FlowView c={c} what={what} />} />;
}
