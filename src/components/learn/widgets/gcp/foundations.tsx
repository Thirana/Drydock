"use client";

import { useId, useState, type ReactNode } from "react";
import { intToIp, ipError, ipToInt, maskOf } from "@/lib/net/ipv4";
import { cn } from "@/lib/utils";
import data from "../data/gcp.json";
import { Field, FieldError } from "../field";
import { Verdict } from "../quiz";
import { Action, Choices, KeyValues, Select, Steps, WidgetNote } from "../ui";
import { WidgetFrame } from "../widget-frame";
import { CaseExplorer, Result, type Case, type Tone } from "./case-explorer";
import { Box, Drawing, T, Wire, Zone } from "./draw";
import { Check, Examples, GroupLabel, StepNav, Table } from "./kit";

/* Part 1 · Foundations (chapters 1-4). */

const inRange = (ip: number, net: number, prefix: number) => (ip & maskOf(prefix)) >>> 0 === net;
const cidr = (c: string) => {
  const [base, bits] = c.split("/");
  return { net: ipToInt(base)!, p: Number(bits) };
};

// ── Chapter 1 ──────────────────────────────────────────────────────────────

const PKTWALK = data.PKTWALK as { h: string; t: string; f: [string, string, string][] }[];

/** One packet from kade-api-1 to kade-db, through both data planes. */
export function PktWalk() {
  const [k, setK] = useState(0);
  const on = (n: number) => (k === n - 1 ? "cur" : undefined);
  const step = PKTWALK[k];
  return (
    <WidgetFrame wide label="A packet's walk through the data planes">
      <StepNav k={k} count={PKTWALK.length} onChange={setK} />
      <Drawing
        h={320}
        className="mt-4"
        label="Packet walk from kade-api-1 on host A to kade-db on host B through both data planes and Google's network."
      >
        <Box x={330} y={10} w={300} h={54} c="purple" />
        <T x={346} y={33} k="t">control plane</T>
        <T x={346} y={52}>already pushed: 10.10.2.5 is on host B</T>
        <Wire x1={400} y1={64} x2={334} y2={120} c="purple" dash />
        <Wire x1={560} y1={64} x2={626} y2={120} c="purple" dash />
        <Zone x={16} y={90} w={420} h={220} />
        <T x={30} y={110}>physical host A · zone a</T>
        <Zone x={524} y={90} w={420} h={220} />
        <T x={930} y={110} end>physical host B · zone b</T>
        <Box x={32} y={124} w={170} h={100} c="blue" className={on(1)} />
        <T x={46} y={148} k="t">kade-api-1</T>
        <T x={46} y={170}>10.10.1.10/32</T>
        <T x={46} y={190}>gw 10.10.1.1</T>
        <T x={46} y={210}>guest OS</T>
        <Wire x1={202} y1={174} x2={243} y2={174} cur={k === 1} />
        <T x={222} y={164} k="s mid">vNIC</T>
        <Box x={246} y={124} w={174} h={170} c="purple" className={on(3)} />
        <T x={260} y={148} k="t">data plane A</T>
        <T x={260} y={174}>egress firewall</T>
        <T x={260} y={194}>look up host</T>
        <T x={260} y={214}>wrap</T>
        <Wire x1={420} y1={250} x2={468} y2={250} plain cur={k === 3} />
        <circle className={cn("badge", on(4))} cx={480} cy={250} r={12} />
        <Wire x1={492} y1={250} x2={537} y2={250} cur={k === 3} />
        <T x={480} y={286} k="s mid">Google&apos;s</T>
        <T x={480} y={302} k="s mid">network</T>
        <Box x={540} y={124} w={174} h={170} c="purple" className={on(5)} />
        <T x={554} y={148} k="t">data plane B</T>
        <T x={554} y={174}>unwrap</T>
        <T x={554} y={194}>ingress firewall</T>
        <T x={554} y={214}>deliver</T>
        <Wire x1={714} y1={174} x2={755} y2={174} cur={k === 5} />
        <T x={734} y={164} k="s mid">vNIC</T>
        <Box x={758} y={124} w={170} h={100} c="green" className={on(6)} />
        <T x={772} y={148} k="t">kade-db</T>
        <T x={772} y={170}>10.10.2.5/32</T>
        <T x={772} y={190}>port 5432</T>
        <T x={772} y={210}>guest OS</T>
      </Drawing>
      <div aria-live="polite" className="mt-4">
        <p className="text-ink text-[17px] font-bold">{step.h}</p>
        <p className="text-ink-body mt-2 max-w-[72ch] text-[15.5px] leading-[1.55] text-pretty">{step.t}</p>
        <KeyValues className="border-rule mt-3 border-t pt-3" items={step.f.map(([label, value]) => [label, value])} />
      </div>
    </WidgetFrame>
  );
}

const SCOPE = data.SCOPE as [string, string, "g" | "r" | "z", string][];
const SCOPE_NAMES = { g: "Global", r: "Regional", z: "Zonal" } as const;

/** Global, regional or zonal? One guess per object. */
export function ScopeQuiz() {
  const [answers, setAnswers] = useState<Record<number, "g" | "r" | "z">>({});
  const done = Object.keys(answers).length;
  const right = Object.entries(answers).filter(([i, a]) => SCOPE[+i][2] === a).length;
  return (
    <WidgetFrame label="Global, regional or zonal?">
      <ol className="space-y-4">
        {SCOPE.map(([name, kind, correct, why], i) => {
          const a = answers[i];
          return (
            <li key={name} className="border-rule border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="min-w-[220px]">
                  <span className="text-ink block text-[15.5px] font-semibold">{name}</span>
                  <span className="text-ink-faint block font-mono text-[12.5px]">{kind}</span>
                </span>
                <span className="flex flex-wrap gap-1.5" role="group" aria-label={`Scope of ${name}`}>
                  {(["g", "r", "z"] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      disabled={a !== undefined}
                      onClick={() => setAnswers((x) => ({ ...x, [i]: key }))}
                      aria-pressed={a === key}
                      className={cn(
                        "inline-flex min-h-9 items-center rounded-[2px] border px-2.5 text-[14px] transition-colors",
                        a === undefined && "border-rule-strong text-ink hover:border-ink hover:bg-sunk cursor-pointer",
                        a !== undefined && key === correct && "border-ink bg-ink text-ground font-semibold",
                        a !== undefined && key === a && key !== correct && "border-ink text-ink line-through",
                        a !== undefined && key !== a && key !== correct && "border-rule text-ink-faint",
                      )}
                    >
                      {SCOPE_NAMES[key]}
                    </button>
                  ))}
                </span>
              </div>
              <div aria-live="polite">
                {a !== undefined && <Verdict right={a === correct} answer={SCOPE_NAMES[correct].toLowerCase()} why={why} />}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <p className="text-ink-muted text-[14.5px]">
          {right} of {done} right · {SCOPE.length - done} left
        </p>
        <Action onClick={() => setAnswers({})}>Start again</Action>
      </div>
    </WidgetFrame>
  );
}

// ── Chapter 2 ──────────────────────────────────────────────────────────────

const SN_RESERVED: Record<number, string> = { 0: "network", 1: "gateway", 254: "reserved", 255: "broadcast" };
const SN_USED: Record<number, string> = { 10: "kade-api-1", 11: "kade-api-2" };

/** sn-app's 256 addresses, one cell each. */
export function SubnetGrid() {
  return (
    <WidgetFrame label="The addresses of sn-app">
      <div className="grid min-w-[640px] grid-cols-16 gap-[3px]">
        {Array.from({ length: 256 }, (_, i) => {
          const note = SN_RESERVED[i] ?? SN_USED[i];
          return (
            <span
              key={i}
              title={`10.10.1.${i}${note ? ` · ${note}` : ""}`}
              className={cn(
                "grid h-[26px] place-items-center rounded-[2px] border font-mono text-[11px]",
                SN_RESERVED[i] !== undefined
                  ? "border-ink-faint bg-mark text-mark-ink border-dashed font-bold"
                  : SN_USED[i]
                    ? "border-teal bg-teal-soft text-ink font-bold"
                    : "border-rule text-ink-faint",
              )}
            >
              {i}
            </span>
          );
        })}
      </div>
      <ul className="text-ink-muted mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="bg-mark border-ink-faint inline-block size-3.5 border border-dashed" />4 reserved: .0 .1 .254 .255
        </li>
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="bg-teal-soft border-teal inline-block size-3.5 border" />in use: kade-api-1 .10, kade-api-2 .11
        </li>
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="border-rule inline-block size-3.5 border" />free: 250 more
        </li>
      </ul>
      <WidgetNote>sn-app, 10.10.1.0/24: 256 addresses, one cell each. Hover a cell to see its full address.</WidgetNote>
    </WidgetFrame>
  );
}

const EXP_SUBNETS = [
  ["sn-app", "10.10.1.0", 24],
  ["sn-data", "10.10.2.0", 24],
  ["sn-run", "10.10.3.0", 24],
] as const;
const EXP_OTHERS = [
  { n: "sn-app", c: "10.10.1.0/24", k: "vpc" },
  { n: "sn-data", c: "10.10.2.0/24", k: "vpc" },
  { n: "sn-run (arrives ch 10)", c: "10.10.3.0/24", k: "plan-sub" },
  { n: "kade-psa-range (ch 9)", c: "10.10.32.0/20", k: "plan-sub" },
  { n: "PSC reserve (ch 9)", c: "10.10.200.0/24", k: "plan" },
  { n: "kade-staging, peered in ch 14", c: "10.20.0.0/16", k: "peer" },
  { n: "Kadé office, over VPN in ch 15", c: "172.16.0.0/16", k: "vpn" },
] as const;
const EXP_WHY = {
  vpc: "Overlaps an existing subnet in kade-vpc. GCP refuses the change.",
  "plan-sub": "Does not exist yet, so GCP would allow it today. Then the planned range can never be created.",
  plan: "GCP does not know this reserve; it only breaks Kadé's plan.",
  peer: "Once peered, GCP refuses overlapping ranges, and the peering fails to exchange routes.",
  vpn: "GCP allows it, but the office range would clash over the VPN: packets for these addresses would go the wrong way.",
} as const;

/** Grow a subnet's range and see what it would collide with. */
export function ExpCheck() {
  const [sub, setSub] = useState("0");
  const [pfx, setPfx] = useState("23");
  const [name, base] = EXP_SUBNETS[+sub];
  const old = EXP_SUBNETS[+sub][2];
  const p = +pfx;
  const oldNet = ipToInt(base)!;
  const net = (oldNet & maskOf(p)) >>> 0;
  const size = 2 ** (32 - p);
  const rows: { bad: boolean; n: string; c: string; why: string }[] = [];
  for (const o of EXP_OTHERS) {
    if (o.n.startsWith(name)) continue;
    const r = cidr(o.c);
    const m = maskOf(Math.min(p, r.p));
    if ((net & m) >>> 0 !== (r.net & m) >>> 0) continue;
    rows.push({ bad: o.k === "vpc" || o.k === "peer", n: o.n, c: o.c, why: EXP_WHY[o.k] });
  }
  if (!(p >= 16 && (net & maskOf(16)) >>> 0 === ipToInt("10.10.0.0"))) {
    rows.push({ bad: false, n: "Kadé plan", c: "10.10.0.0/16", why: "The new range reaches outside the block kept for prod." });
  }
  const refused = rows.some((r) => r.bad);
  const tone: Tone = refused ? "fault" : rows.length ? "warn" : "ok";
  return (
    <WidgetFrame label="Expand a subnet">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Select
          label="Subnet"
          value={sub}
          onChange={setSub}
          options={[
            { value: "0", label: "sn-app · 10.10.1.0/24" },
            { value: "1", label: "sn-data · 10.10.2.0/24" },
            { value: "2", label: "sn-run · 10.10.3.0/24 (ch 10)" },
          ]}
        />
        <Select
          label="New size"
          value={pfx}
          onChange={setPfx}
          options={Array.from({ length: 16 }, (_, i) => String(23 - i)).map((v) => ({ value: v, label: `/${v}` }))}
        />
      </div>
      <div aria-live="polite" className="mt-5 space-y-4">
        <KeyValues
          items={[
            ["Old range", `${base}/${old}`],
            ["New range", <b key="n">{`${intToIp(net)}/${p}`}</b>],
            ["Addresses", `${size.toLocaleString("en-US")} (${(size - 4).toLocaleString("en-US")} usable)`],
            ["Grows", `${net < oldNet ? "backwards and forwards" : "forwards only"} from the old range`, true],
          ]}
        />
        <Result tone={tone}>
          <b>
            {refused
              ? "GCP would refuse this expansion."
              : rows.length
                ? "GCP would allow it, but it breaks the plan. Do not do it."
                : "Safe: GCP allows it and it stays inside the plan."}
          </b>
        </Result>
        {rows.length > 0 && (
          <Table
            head={["Collides with", "Range", "Why it matters"]}
            mono={[1]}
            minWidth={600}
            rows={rows.map((r) => [
              <span key="n" className={cn(r.bad && "text-fault font-semibold")}>
                {r.n}
              </span>,
              r.c,
              <span key="w" className="text-ink-muted">
                {r.why}
              </span>,
            ])}
          />
        )}
      </div>
    </WidgetFrame>
  );
}

// ── Chapter 3 ──────────────────────────────────────────────────────────────

type FateKind = "ok" | "bad" | "warn" | "plan";
const IPFATE = data.IPFATE as unknown as Record<string, Record<string, [FateKind, string, string]>>;
const FATE_TONE: Record<FateKind, Tone> = { ok: "ok", bad: "fault", warn: "warn", plan: "plain" };

/** What happens to each kind of address when the VM changes. */
export function IpFate() {
  const [addr, setAddr] = useState("ei");
  const [event, setEvent] = useState("ss");
  const [kind, head, text] = IPFATE[addr][event];
  return (
    <WidgetFrame label="What happens to the address?">
      <GroupLabel>The address</GroupLabel>
      <Choices
        label="The address"
        value={addr}
        onChange={setAddr}
        options={[
          { value: "ei", label: "Ephemeral internal" },
          { value: "si", label: "Static internal" },
          { value: "ee", label: "Ephemeral external" },
          { value: "se", label: "Static external" },
        ]}
      />
      <div className="mt-4">
        <GroupLabel>What happens</GroupLabel>
        <Choices
          label="What happens"
          value={event}
          onChange={setEvent}
          options={[
            { value: "ss", label: "VM stopped, then started" },
            { value: "del", label: "VM deleted" },
            { value: "rec", label: "VM rebuilt with the same name" },
            { value: "rm", label: "Address removed from the VM" },
          ]}
        />
      </div>
      <div aria-live="polite" className="mt-5">
        <Result tone={FATE_TONE[kind]}>
          <b>{head}</b> {text}
        </Result>
      </div>
    </WidgetFrame>
  );
}

// ── Chapter 4 ──────────────────────────────────────────────────────────────

type HopType = "vm" | "vpn" | "bgp" | "ilb" | "gw" | "sub";
type Route = {
  n: string;
  d: string;
  pr: number;
  hop: string;
  ht: HopType;
  tags: string[];
  kind: "static" | "subnet" | "refused";
  dep?: string;
  net: number;
  p: number;
};
const route = (
  n: string,
  d: string,
  pr: number,
  hop: string,
  ht: HopType,
  tags: string[] = [],
  kind: Route["kind"] = "static",
  dep?: string,
): Route => ({ n, d, pr, hop, ht, tags, kind, dep, ...cidr(d) });

const HOP_RANK: Record<HopType, number> = { vm: 1, vpn: 1, bgp: 2, ilb: 3, gw: 4, sub: 0 };
const HOP_LABEL: Record<HopType, string> = { vm: "VM", vpn: "VPN", gw: "GW", sub: "SUBNET", ilb: "ILB", bgp: "BGP" };

type RouteCase = Case & {
  from: string;
  tags: string[];
  dst: string;
  dl: string;
  routes: Route[];
  extra?: "nest" | "ecmp" | "ladder" | "subnet";
};

const ROUTE_CASES: RouteCase[] = [
  {
    k: "A",
    t: "Specificity decides",
    from: "kade-api-1",
    tags: [],
    dst: "172.16.2.11",
    dl: "warehouse scanner",
    routes: [
      route("default", "0.0.0.0/0", 1000, "default-internet-gateway", "gw"),
      route("office-a", "172.16.0.0/16", 1000, "vpn tunnel-a", "vpn"),
      route("warehouse", "172.16.2.0/24", 1000, "vpn tunnel-b", "vpn"),
    ],
    extra: "nest",
    take: "All three routes contain the destination. Step 5 keeps only the <b>/24</b>, so the other two are gone before anyone looks at priority.",
    cfg: "Packet from kade-api-1 to 172.16.2.11 (warehouse scanner)\n\ncandidates:\n  0.0.0.0/0      prio 1000  → default-internet-gateway   least specific\n  172.16.0.0/16  prio 1000  → vpn tunnel-a\n  172.16.2.0/24  prio 1000  → vpn tunnel-b               most specific → WINS",
  },
  {
    k: "B",
    t: "A low number does not rescue a broad route",
    from: "kade-worker",
    tags: ["via-proxy"],
    dst: "172.16.1.20",
    dl: "office laptop",
    routes: [
      route("kade-via-proxy", "0.0.0.0/0", 0, "instance kade-proxy", "vm", ["via-proxy"]),
      route("default", "0.0.0.0/0", 1000, "default-internet-gateway", "gw"),
      route("office-a", "172.16.0.0/16", 1000, "vpn tunnel-a", "vpn"),
    ],
    extra: "nest",
    take: "Priority <b>0</b> is the strongest number possible, and it still loses: the /0 route is removed at step 5 because the <b>/16</b> is more specific.",
    cfg: "Packet from kade-worker (tag via-proxy) to 172.16.1.20 (office laptop)\n\ncandidates:\n  0.0.0.0/0      prio 0     → kade-proxy     lowest number possible\n  0.0.0.0/0      prio 1000  → default-internet-gateway\n  172.16.0.0/16  prio 1000  → vpn tunnel-a   still WINS: /16 beats /0",
  },
  {
    k: "C",
    t: "Same destination: priority breaks the tie",
    from: "kade-api-1",
    tags: [],
    dst: "172.16.1.20",
    dl: "office laptop",
    routes: [
      route("office-a", "172.16.0.0/16", 100, "vpn tunnel-a", "vpn", [], "static", "tunnel-a"),
      route("office-b", "172.16.0.0/16", 1000, "vpn tunnel-b", "vpn", [], "static", "tunnel-b"),
      route("default", "0.0.0.0/0", 1000, "default-internet-gateway", "gw"),
    ],
    what: [
      ["normal", "Normal"],
      ["tunnel-a", "What if tunnel-a goes down?"],
    ],
    take: {
      normal:
        "Both /16 routes survive step 5. Step 7 keeps the lower number, <b>100</b>, so tunnel-a carries the traffic and tunnel-b waits as backup.",
      "tunnel-a":
        "Step 6 removes the route whose tunnel is down. Only tunnel-b is left, so it takes over <b>without anyone changing a route</b>. This is a primary and backup pair.",
    },
    cfg: "Packet from kade-api-1 to 172.16.1.20\n\ncandidates:\n  172.16.0.0/16  prio 100   → vpn tunnel-a   WINS\n  172.16.0.0/16  prio 1000  → vpn tunnel-b   backup\n  0.0.0.0/0      prio 1000  → default-internet-gateway",
  },
  {
    k: "D",
    t: "Same destination and priority: ECMP",
    from: "kade-api-1",
    tags: [],
    dst: "172.16.1.20",
    dl: "office laptop",
    routes: [
      route("office-a", "172.16.0.0/16", 1000, "vpn tunnel-a", "vpn", [], "static", "tunnel-a"),
      route("office-b", "172.16.0.0/16", 1000, "vpn tunnel-b", "vpn", [], "static", "tunnel-b"),
      route("default", "0.0.0.0/0", 1000, "default-internet-gateway", "gw"),
    ],
    what: [
      ["normal", "Normal"],
      ["tunnel-b", "What if tunnel-b goes down?"],
    ],
    extra: "ecmp",
    take: {
      normal:
        "Two routes tie on prefix, priority and next hop type, so both are used. Each connection is hashed onto one tunnel and <b>stays on it</b>; different connections spread across both.",
      "tunnel-b":
        "Step 6 removes tunnel-b's route. All connections now use tunnel-a. When tunnel-b returns, new connections spread out again.",
    },
    cfg: "Packet from kade-api-1 to 172.16.1.20\n\ncandidates:\n  172.16.0.0/16  prio 1000  → vpn tunnel-a\n  172.16.0.0/16  prio 1000  → vpn tunnel-b\n  → connections are shared across both tunnels (ECMP)",
  },
  {
    k: "E",
    t: "A /32 host route pins one destination",
    from: "kade-worker",
    tags: [],
    dst: "192.0.2.10",
    dl: "PayGate API",
    routes: [
      route("default", "0.0.0.0/0", 1000, "default-internet-gateway", "gw"),
      route("paygate-host", "192.0.2.10/32", 1000, "instance kade-inspect", "vm", [], "static", "kade-inspect"),
    ],
    what: [
      ["normal", "Normal"],
      ["kade-inspect", "What if kade-inspect is stopped?"],
    ],
    extra: "nest",
    take: {
      normal:
        "A <b>/32</b> is the most specific route possible, so it wins for exactly one address. Everything else on the internet still uses the default route.",
      "kade-inspect":
        "The packet is <b>dropped</b>. Step 5 already removed the /0 route because the /32 is more specific; step 6 then removes the /32 because its next hop is stopped. Nothing is left. GCP only falls back to routes with <b>exactly the same destination</b> (as in Examples C and D), never to a less specific one. PayGate calls fail until kade-inspect is running again.",
    },
    cfg: "Packet from kade-worker to 192.0.2.10 (PayGate API)\n\ncandidates:\n  0.0.0.0/0      prio 1000  → default-internet-gateway\n  192.0.2.10/32  prio 1000  → kade-inspect (VM)         WINS: /32 is the most specific",
  },
  {
    k: "F",
    t: "A subnet route cannot be beaten",
    from: "kade-api-1",
    tags: [],
    dst: "10.10.2.5",
    dl: "kade-db",
    extra: "subnet",
    routes: [
      route("sn-data", "10.10.2.0/24", 0, "inside kade-vpc", "sub", [], "subnet"),
      route("inspect-db", "10.10.2.5/32", 1000, "instance kade-inspect", "vm", [], "refused"),
      route("default", "0.0.0.0/0", 1000, "default-internet-gateway", "gw"),
    ],
    take: "GCP refuses to create <b>10.10.2.5/32</b> because it fits inside the subnet route <b>10.10.2.0/24</b>. The packet is decided at step 3, before longest prefix is ever used. To send VM-to-VM traffic through an appliance you need a policy-based route or separate VPCs.",
    cfg: "Attempt: 10.10.2.5/32 → kade-inspect   (inspect traffic to kade-db)\n\nGCP: refused. 10.10.2.5/32 fits inside the subnet route 10.10.2.0/24.\n\nPacket from kade-api-1 to 10.10.2.5 → subnet route sn-data, decided at step 3.",
  },
  {
    k: "G",
    t: "Same destination and priority, different next hop types",
    from: "kade-worker",
    tags: ["via-proxy"],
    dst: "8.8.8.8",
    dl: "internet",
    routes: [
      route("kade-via-proxy", "0.0.0.0/0", 1000, "instance kade-proxy", "vm", ["via-proxy"]),
      route("default", "0.0.0.0/0", 1000, "default-internet-gateway", "gw"),
    ],
    extra: "ladder",
    take: "Prefix and priority tie, but there is <b>no ECMP</b>: step 8 prefers an instance next hop over the internet gateway. ECMP only happens between routes of the same next hop type.",
    cfg: "Packet from kade-worker (tag via-proxy) to 8.8.8.8\n\ncandidates:\n  0.0.0.0/0  prio 1000  → kade-proxy (VM)             instance next hop   WINS\n  0.0.0.0/0  prio 1000  → default-internet-gateway    internet gateway",
  },
];

const ROUTE_STEPS: [number, string][] = [
  [3, "subnet route?"],
  [4, "applicable"],
  [5, "longest prefix"],
  [6, "next hop alive"],
  [7, "lowest priority"],
  [8, "next hop type"],
  [9, "send or ECMP"],
];

type RouteState = "win" | "out" | "refused";

/** GCP's route selection, step by step: which routes drop out where. */
function selectRoute(c: RouteCase, down: string | null) {
  const dst = ipToInt(c.dst)!;
  const st: Record<string, [RouteState, string, number]> = {};
  const counts: Record<number, number> = {};
  const live = c.routes.filter((r) => r.kind !== "refused");
  c.routes.filter((r) => r.kind === "refused").forEach((r) => (st[r.n] = ["refused", "refused: fits inside a subnet range", 0]));
  const subnet = live.find((r) => r.kind === "subnet" && inRange(dst, r.net, r.p));
  if (subnet) {
    live.forEach((r) => r !== subnet && (st[r.n] = ["out", "not considered: a subnet route matched", 3]));
    st[subnet.n] = ["win", "WINS: subnet route", 3];
    return { st, counts: { 3: 1 } as Record<number, number>, dec: 3, win: [subnet] };
  }
  live.filter((r) => r.kind === "subnet").forEach((r) => (st[r.n] = ["out", "destination is outside this subnet", 3]));
  let left = live.filter((r) => r.kind !== "subnet");
  counts[3] = left.length;
  left = left.filter((r) => {
    if (r.tags.length && !r.tags.some((t) => c.tags.includes(t))) {
      st[r.n] = ["out", `VM lacks tag ${r.tags.join(", ")}`, 4];
      return false;
    }
    if (!inRange(dst, r.net, r.p)) {
      st[r.n] = ["out", "does not contain the destination", 4];
      return false;
    }
    return true;
  });
  counts[4] = left.length;
  const longest = Math.max(...left.map((r) => r.p));
  left = left.filter((r) => (r.p < longest ? ((st[r.n] = ["out", `less specific than /${longest}`, 5]), false) : true));
  counts[5] = left.length;
  left = left.filter((r) => (r.dep && r.dep === down ? ((st[r.n] = ["out", `next hop ${r.dep} is down`, 6]), false) : true));
  counts[6] = left.length;
  const lowest = Math.min(...left.map((r) => r.pr));
  left = left.filter((r) => (r.pr > lowest ? ((st[r.n] = ["out", `priority ${r.pr} loses to ${lowest}`, 7]), false) : true));
  counts[7] = left.length;
  const best = Math.min(...left.map((r) => HOP_RANK[r.ht]));
  left = left.filter((r) => (HOP_RANK[r.ht] > best ? ((st[r.n] = ["out", "internet gateway ranks last", 8]), false) : true));
  counts[8] = left.length;
  counts[9] = left.length;
  left.forEach((r) => (st[r.n] = left.length > 1 ? ["win", "ECMP: shares connections", 9] : ["win", "WINS", 0]));
  let dec = 9;
  if (left.length === 1) dec = [4, 5, 6, 7, 8].find((s) => counts[s] === 1) ?? 9;
  if (left.length === 0) dec = [4, 5, 6, 7, 8].find((s) => counts[s] === 0) ?? 9;
  if (left.length === 1) st[left[0].n][2] = dec;
  return { st, counts, dec, win: left };
}

function RouteDrawing({ c, sel }: { c: RouteCase; sel: ReturnType<typeof selectRoute> }) {
  if (c.extra === "nest") {
    const groups = Object.values(
      c.routes
        .filter((r) => r.kind === "static")
        .reduce<Record<string, { d: string; p: number; rs: Route[] }>>((acc, r) => {
          (acc[r.d] ??= { d: r.d, p: r.p, rs: [] }).rs.push(r);
          return acc;
        }, {}),
    ).sort((a, b) => a.p - b.p);
    const nest = (i: number): ReactNode => {
      const g = groups[i];
      const won = g.rs.some((r) => sel.win.includes(r));
      return (
        <div className={cn("rounded-[2px] border px-3 pt-2 pb-3", won ? "border-accent border-2" : "border-rule-strong")}>
          <p className={cn("font-mono text-[13px]", won ? "text-ink font-bold" : "text-ink-muted")}>
            {g.d} · prio {g.rs.map((r) => r.pr).join(", ")}
            {won && "  ← winner"}
          </p>
          <div className="mt-2">
            {i < groups.length - 1 ? (
              nest(i + 1)
            ) : (
              <p className="text-ink inline-flex items-center gap-2 font-mono text-[13px]">
                <span aria-hidden="true" className="bg-ink inline-block size-2.5 rounded-full" />
                {c.dst}
              </p>
            )}
          </div>
        </div>
      );
    };
    return (
      <div>
        <GroupLabel>Which ranges contain {c.dst}? The inner box is more specific.</GroupLabel>
        <div className="grid gap-x-6 gap-y-3 md:grid-cols-[minmax(0,1fr)_220px]">
          {nest(0)}
          <p className="text-ink-muted text-[14.5px] leading-[1.5]">
            Every box contains the packet. The innermost box is the most specific route. It wins at step 5, whatever the
            priorities say.
          </p>
        </div>
      </div>
    );
  }
  if (c.extra === "ecmp") {
    const shared = sel.win.length > 1;
    const conns: [string, "a" | "b"][] = [
      ["conn 1 · :41822 → 172.16.1.20:443", "a"],
      ["conn 2 · :41907 → 172.16.1.20:443", "b"],
      ["conn 3 · :42011 → 172.16.1.21:22", "a"],
    ];
    return (
      <div>
        <GroupLabel>Connections from kade-api-1 to the office, each hashed on its addresses and ports</GroupLabel>
        <Drawing w={700} h={124} label="Connections from kade-api-1 to the office, each hashed onto one tunnel">
          {conns.map(([label, t], i) => {
            const y = 4 + 42 * i;
            const via = shared ? t : sel.win[0]?.dep === "tunnel-a" ? "a" : "b";
            const ty = via === "a" ? 16 : 76;
            return (
              <g key={label}>
                <Box x={2} y={y} w={300} h={28} c="blue" />
                <T x={12} y={y + 19}>{label}</T>
                <path className="w green" d={`M302 ${y + 14} C 400 ${y + 14}, 420 ${ty + 16}, 497 ${ty + 16}`} markerEnd="url(#dd-ah-green)" />
              </g>
            );
          })}
          {(["a", "b"] as const).map((t, i) => {
            const y = 16 + 60 * i;
            const up = sel.win.some((r) => r.dep === `tunnel-${t}`);
            return (
              <g key={t}>
                <Box x={500} y={y} w={190} h={32} c={up ? undefined : "red"} />
                <T x={512} y={y + 21} k={up ? "t" : "t c-red"}>{`tunnel-${t}${up ? "" : "  (down)"}`}</T>
              </g>
            );
          })}
        </Drawing>
      </div>
    );
  }
  if (c.extra === "ladder") {
    const rungs: [string, string, "on" | "" | "off"][] = [
      ["1", "instance, or Classic VPN tunnel", "on"],
      ["2", "dynamic route from BGP", ""],
      ["3", "internal passthrough load balancer", ""],
      ["4", "default internet gateway", "off"],
    ];
    return (
      <div>
        <GroupLabel>Step 8 · next hop type preference (top wins)</GroupLabel>
        <ol className="space-y-1.5">
          {rungs.map(([n, t, s], i) => (
            <li
              key={n}
              style={{ width: `${100 - 11 * i}%` }}
              className={cn(
                "rounded-[2px] border px-3 py-1.5 text-[14.5px]",
                s === "on" ? "border-accent text-ink border-2 font-bold" : "border-rule-strong text-ink-body",
                s === "off" && "text-ink-faint",
              )}
            >
              <span className="font-mono text-[13px]">{n}</span> · {t}
              {s === "on" ? "  ← kade-proxy" : s === "off" ? "  ← default route" : ""}
            </li>
          ))}
        </ol>
      </div>
    );
  }
  if (c.extra === "subnet") {
    return (
      <div>
        <GroupLabel>Why the /32 never exists</GroupLabel>
        <div className="border-accent rounded-[2px] border-2 px-3 pt-2 pb-3">
          <p className="text-ink font-mono text-[13px] font-bold">subnet route 10.10.2.0/24 · checked at step 3, wins outright</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="border-fault text-fault bg-fault-soft rounded-[2px] border px-3 py-1.5 font-mono text-[13px]">
              10.10.2.5/32 → kade-inspect ✕ refused
            </p>
            <p className="text-ink inline-flex items-center gap-2 font-mono text-[13px]">
              <span aria-hidden="true" className="bg-ink inline-block size-2.5 rounded-full" />
              10.10.2.5
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function RouteView({ c, what }: { c: RouteCase; what: string }) {
  const sel = selectRoute(c, what === "normal" ? null : what);
  return (
    <div className="space-y-5">
      <p className="text-ink-body text-[15.5px]">
        <span className="text-ink font-semibold">Packet</span> from <b className="text-ink">{c.from}</b>{" "}
        {c.tags.length ? `(tags: ${c.tags.join(", ")})` : "(no tags)"} → <code className="font-mono text-[0.92em]">{c.dst}</code> · {c.dl}
      </p>
      <div>
        <p className="text-ink-faint mb-2 text-[13.5px]">Steps 1-2: no special path, no policy-based route</p>
        <ol className="grid min-w-[700px] grid-cols-7 gap-1.5">
          {ROUTE_STEPS.map(([n, label]) => {
            const dec = n === sel.dec;
            const after = n > sel.dec;
            const count = sel.counts[n];
            return (
              <li
                key={n}
                className={cn("rounded-[2px] border px-2.5 py-2", dec ? "border-ink" : "border-rule", after && "opacity-50")}
              >
                <span className="text-ink-faint block font-mono text-[11.5px]">step {n}</span>
                <span className={cn("block text-[13.5px] leading-[1.3]", dec ? "text-ink font-bold" : "text-ink-body")}>{label}</span>
                <span className={cn("mt-1 block font-mono text-[12px]", dec ? "text-ink" : "text-ink-faint")}>
                  {dec ? (
                    sel.win.length ? (
                      <span className="dd-mark">decides here</span>
                    ) : (
                      <span className="text-fault font-semibold">0 left: drop</span>
                    )
                  ) : after ? (
                    "not needed"
                  ) : count === undefined ? (
                    "-"
                  ) : (
                    `${count} left`
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <Table
        head={["Destination", "Specificity", "Priority", "Next hop", "Tags", "Result"]}
        mono={[0, 2, 4]}
        minWidth={720}
        marked={(i) => sel.st[c.routes[i].n]?.[0] === "win"}
        faded={(i) => sel.st[c.routes[i].n]?.[0] === "out"}
        rows={c.routes.map((r) => {
          const [state, why, step] = sel.st[r.n] ?? ["out", "", 0];
          return [
            r.d,
            <span key="p" className="inline-flex items-center gap-2 font-mono text-[13px]">
              <span aria-hidden="true" className="bg-sunk inline-block h-2 w-16 rounded-[1px]">
                <span className="bg-ink-faint block h-full" style={{ width: `${Math.max(4, (r.p / 32) * 100)}%` }} />
              </span>
              /{r.p}
            </span>,
            r.kind === "subnet" ? "-" : r.pr,
            <span key="h" className="inline-flex items-baseline gap-2">
              <span className="border-rule-strong text-ink-muted rounded-[2px] border px-1 font-mono text-[11px]">{HOP_LABEL[r.ht]}</span>
              <span className="font-mono text-[13px]">{r.hop.replace("instance ", "").replace("default-internet-gateway", "internet gw")}</span>
            </span>,
            r.tags.length ? r.tags.join(", ") : "no tags",
            state === "win" ? (
              <span key="r">
                <b>{why.startsWith("ECMP") ? "ECMP" : "Wins"}</b>
                <span className="text-ink-muted block text-[13.5px] font-normal">
                  {why.startsWith("ECMP") ? "shares connections" : `→ ${r.hop}`}
                </span>
              </span>
            ) : state === "refused" ? (
              <span key="r" className="text-fault">
                <b>Refused</b>
                <span className="block text-[13.5px]">{why}</span>
              </span>
            ) : (
              <span key="r">
                out at step {step}
                <span className="block text-[13.5px]">{why}</span>
              </span>
            ),
          ];
        })}
      />
      {sel.win.length === 0 && (
        <Result tone="fault">
          <b>No route left → packet dropped</b> (the VM gets ICMP &quot;network unreachable&quot;)
        </Result>
      )}
      <RouteDrawing c={c} sel={sel} />
    </div>
  );
}

/** Seven route tables, and the step at which each is decided. */
export function RouteEx() {
  return (
    <CaseExplorer
      label="Route selection examples"
      cases={ROUTE_CASES}
      render={(c, what) => <RouteView c={c} what={what} />}
    />
  );
}

const PICK_ROUTES: Route[] = [
  route("sn-app", "10.10.1.0/24", 0, "inside kade-vpc", "sub", [], "subnet"),
  route("sn-data", "10.10.2.0/24", 0, "inside kade-vpc", "sub", [], "subnet"),
  route("default", "0.0.0.0/0", 1000, "default-internet-gateway", "gw"),
  route("kade-via-proxy", "0.0.0.0/0", 900, "instance kade-proxy", "vm", ["via-proxy"], "static", "kade-proxy"),
  route("kade-paygate", "192.0.2.0/24", 1000, "instance kade-inspect", "vm", ["inspected"], "static", "kade-inspect"),
  route("office-a", "172.16.0.0/16", 1000, "vpn tunnel-a", "vpn", [], "static", "tunnel-a"),
  route("office-b", "172.16.0.0/16", 1000, "vpn tunnel-b", "vpn", [], "static", "tunnel-b"),
  route("warehouse", "172.16.2.0/24", 1000, "vpn tunnel-b", "vpn", [], "static", "tunnel-b"),
];
const SPECIAL_PATHS = [
  ["35.191.0.0/16", "Google Front Ends and health checks"],
  ["130.211.0.0/22", "Google Front Ends and health checks"],
  ["35.235.240.0/20", "IAP TCP forwarding"],
  ["35.199.192.0/19", "Cloud DNS forwarding"],
  ["35.199.224.0/19", "Serverless VPC Access"],
].map(([c, n]) => ({ c, n, ...cidr(c) }));
const PICK_EXAMPLES = ["10.10.2.5", "8.8.8.8", "192.0.2.10", "172.16.2.11", "172.16.1.20", "35.191.4.7"];
const PICK_DOWN = [
  ["kade-proxy", "kade-proxy stopped"],
  ["kade-inspect", "kade-inspect stopped"],
  ["tunnel-a", "tunnel-a down"],
  ["tunnel-b", "tunnel-b down"],
] as const;

/** Type a destination, set tags and outages, and watch the route table decide. */
export function RoutePick() {
  const [value, setValue] = useState("192.0.2.10");
  const [tags, setTags] = useState<string[]>(["inspected"]);
  const [down, setDown] = useState<string[]>([]);
  const errorId = useId();
  const error = ipError(value);
  const toggle = (list: string[], set: (v: string[]) => void, key: string, on: boolean) =>
    set(on ? [...list, key] : list.filter((x) => x !== key));

  let verdict: ReactNode = null;
  let tone: Tone = "ok";
  const why: Record<string, string> = {};
  const steps: string[] = [];
  let winners: Route[] = [];
  if (!error) {
    const ip = ipToInt(value)!;
    const special = SPECIAL_PATHS.find((s) => inRange(ip, s.net, s.p));
    if (special) {
      PICK_ROUTES.forEach((r) => (why[r.n] = "not used: a special path handles this destination"));
      verdict = `Special path (step 1): ${special.n} (${special.c}). It is not in the route table and nothing can override it.`;
      steps.push(`Step 1: ${value} is in ${special.c}, a special path. Evaluation stops.`);
    } else {
      steps.push("Step 1: not a special path. Step 2: no policy-based routes in this lab.");
      const subnet = PICK_ROUTES.find((r) => r.kind === "subnet" && inRange(ip, r.net, r.p));
      if (subnet) {
        PICK_ROUTES.forEach(
          (r) => (why[r.n] = r === subnet ? "subnet route: wins outright" : "not considered: a subnet route matched first"),
        );
        winners = [subnet];
        verdict = `Subnet route ${subnet.n} (${subnet.d}) wins at step 3. Nothing can beat a subnet route.`;
        steps.push(`Step 3: ${value} is inside ${subnet.d}, so the subnet route is used. Evaluation stops.`);
      } else {
        steps.push("Step 3: not inside any subnet range, so subnet routes are set aside.");
        PICK_ROUTES.filter((r) => r.kind === "subnet").forEach((r) => (why[r.n] = "not considered: destination is outside this subnet"));
        let left = PICK_ROUTES.filter((r) => r.kind !== "subnet").filter((r) => {
          if (r.tags.length && !r.tags.some((t) => tags.includes(t))) {
            why[r.n] = `not applicable: VM lacks tag ${r.tags.join(", ")}`;
            return false;
          }
          if (!inRange(ip, r.net, r.p)) {
            why[r.n] = "does not contain the destination";
            return false;
          }
          return true;
        });
        steps.push(`Step 4: ${left.length} applicable route${left.length === 1 ? "" : "s"} contain the destination.`);
        if (left.length) {
          const longest = Math.max(...left.map((r) => r.p));
          left = left.filter((r) => (r.p < longest ? ((why[r.n] = `less specific than /${longest}`), false) : true));
          steps.push(`Step 5: longest prefix is /${longest}; ${left.length} left.`);
          left = left.filter((r) => (r.dep && down.includes(r.dep) ? ((why[r.n] = `ignored: next hop ${r.dep} is down`), false) : true));
          steps.push(`Step 6: after dropping dead next hops, ${left.length} left.`);
        }
        if (left.length) {
          const lowest = Math.min(...left.map((r) => r.pr));
          left = left.filter((r) => (r.pr > lowest ? ((why[r.n] = `priority ${r.pr} loses to ${lowest}`), false) : true));
          steps.push(`Step 7: lowest priority number is ${lowest}; ${left.length} left.`);
          const best = Math.min(...left.map((r) => HOP_RANK[r.ht]));
          left = left.filter((r) => (HOP_RANK[r.ht] > best ? ((why[r.n] = "less preferred next hop type"), false) : true));
          steps.push(`Step 8: most preferred next hop type kept; ${left.length} left.`);
        }
        winners = left;
        if (left.length === 1) {
          why[left[0].n] = "WINS";
          verdict = `Route ${left[0].n} wins: ${left[0].d} → ${left[0].hop}.`;
        } else if (left.length > 1) {
          left.forEach((r) => (why[r.n] = "ECMP: shares traffic"));
          verdict = `ECMP: ${left.length} routes tie (${left.map((r) => r.hop).join(" and ")}). Connections are spread across them.`;
        } else {
          tone = "fault";
          verdict = 'No route left. The packet is dropped and the VM gets ICMP "network unreachable".';
        }
        steps.push(`Step 9: ${left.length === 0 ? "drop" : left.length === 1 ? "send" : "ECMP"}.`);
        const fellThrough =
          down.length &&
          left.some((r) => r.n === "default") &&
          PICK_ROUTES.some((r) => r.dep && down.includes(r.dep) && r.tags.some((t) => tags.includes(t)) && inRange(ip, r.net, r.p));
        if (fellThrough)
          verdict = `${verdict} Note: the route that normally wins was ignored because its next hop is down, so traffic fell through to the default route.`;
      }
    }
  }

  return (
    <WidgetFrame label="Pick the route">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <Field label="Destination IP" value={value} onChange={setValue} invalid={!!error} describedBy={errorId} />
        <Examples values={PICK_EXAMPLES} current={value} onPick={setValue} />
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <GroupLabel>Tags on the sending VM</GroupLabel>
          <div className="space-y-2">
            {["via-proxy", "inspected"].map((t) => (
              <Check key={t} checked={tags.includes(t)} onChange={(on) => toggle(tags, setTags, t, on)}>
                <code className="font-mono text-[0.92em]">{t}</code>
              </Check>
            ))}
          </div>
        </div>
        <div>
          <GroupLabel>Next hops that are down</GroupLabel>
          <div className="space-y-2">
            {PICK_DOWN.map(([key, label]) => (
              <Check key={key} checked={down.includes(key)} onChange={(on) => toggle(down, setDown, key, on)}>
                {label}
              </Check>
            ))}
          </div>
        </div>
      </div>
      <div aria-live="polite" className="mt-5 space-y-5">
        {error ? (
          <FieldError id={errorId}>{error}</FieldError>
        ) : (
          <>
            <Result tone={tone}>
              <b>{verdict}</b>
            </Result>
            <Table
              head={["Route", "Destination → next hop", "Prio", "Tags", "Result"]}
              mono={[0, 1, 2, 3]}
              minWidth={760}
              marked={(i) => winners.includes(PICK_ROUTES[i])}
              faded={(i) => !winners.includes(PICK_ROUTES[i])}
              rows={PICK_ROUTES.map((r) => [r.n, `${r.d} → ${r.hop}`, r.pr, r.tags.length ? r.tags.join(", ") : "none", why[r.n] ?? ""])}
            />
            <Steps>{steps}</Steps>
          </>
        )}
      </div>
    </WidgetFrame>
  );
}
