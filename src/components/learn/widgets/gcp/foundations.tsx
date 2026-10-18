"use client";

import { useId, useState, type ReactNode } from "react";
import { intToIp, ipError, ipToInt, maskOf } from "@/lib/net/ipv4";
import { cn } from "@/lib/utils";
import data from "../data/gcp.json";
import { Field, FieldError } from "../field";
import { Verdict } from "../quiz";
import { Action, Choices, KeyValues, Select, WidgetNote } from "../ui";
import { WidgetFrame } from "../widget-frame";
import { CaseExplorer, Result, type Case, type Tone } from "./case-explorer";
import { arrowHead } from "../../diagram-defs";
import { Box, Drawing, Mark, T, Wire, Zone } from "./draw";
import { Check, Examples, GroupLabel, StepNav, Table } from "./kit";

/* Part 1 · Foundations (chapters 1-4). */

const inRange = (ip: number, net: number, prefix: number) => (ip & maskOf(prefix)) >>> 0 === net;
const cidr = (c: string) => {
  const [base, bits] = c.split("/");
  return { net: ipToInt(base)!, p: Number(bits) };
};

// ── Chapter 1.2 ──────────────────────────────────────────────────────────────

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
        <Wire x1={360} y1={64} x2={360} y2={120} c="purple" dash />
        <Wire x1={600} y1={64} x2={600} y2={120} c="purple" dash />
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

// ── Chapter 1.1 ────────────────────────────────────────────────────────────

type Setup = "today" | "target";
type Failure = "none" | "a" | "b" | "region";

const OUTAGE: Record<Setup, Record<Failure, [ok: boolean, text: string]>> = {
  today: {
    none: [true, "api.kade.lk works. The load balancer spreads requests over kade-api-1 and kade-api-2, and both use kade-db."],
    a: [true, "api.kade.lk works, on half the servers. Health checks mark kade-api-1 as down within seconds, and the load balancer sends every request to kade-api-2."],
    b: [false, "api.kade.lk is down. kade-api-1 is still running, but kade-db was in zone b, so every order fails. One zonal database is a single point of failure for the whole shop."],
    region: [false, "api.kade.lk is down. The load balancer is global, so its IP still answers, but every backend was in asia-southeast1. Shoppers get an error page from the load balancer."],
  },
  target: {
    none: [true, "api.kade.lk works. Cloud Run runs kade-api across the region's zones. kade-sql keeps a primary in one zone and a standby copy in another."],
    a: [true, "api.kade.lk works. Cloud Run keeps serving from zones b and c, and kade-sql only loses its standby. kade-worker is a zonal VM, so tonight's backup waits until zone a is back."],
    b: [true, "api.kade.lk works after a short pause. kade-sql fails over: the standby in zone a becomes the primary, usually within about a minute, on the same private IP. Cloud Run keeps serving from zones a and c."],
    region: [false, "api.kade.lk is down. Everything Kadé runs is in one region. Surviving this needs a second region with its own copy of the data, which Kadé does not pay for."],
  },
};

const ZONE_X = { a: 32, b: 336, c: 640 } as const;

/** A resource in the drawing; faded with a cross when its zone is down. */
function OutRes({ x, y, w, t, s, c, down }: { x: number; y: number; w: number; t: string; s: string; c: string; down?: boolean }) {
  return (
    <g className={down ? "off" : undefined}>
      <Box x={x} y={y} w={w} h={52} c={c} />
      <T x={x + 14} y={y + 22} k="t">
        {t}
      </T>
      <T x={x + 14} y={y + 42}>
        {s}
      </T>
      {down && <Mark cx={x + w - 20} cy={y + 26} ok={false} />}
    </g>
  );
}

/** Pick a failure and see which of Kadé's pieces survive it, today and after the course. */
export function OutageSim() {
  const [setup, setSetup] = useState<Setup>("today");
  const [fail, setFail] = useState<Failure>("b");
  const [ok, text] = OUTAGE[setup][fail];
  const down = (z: "a" | "b" | "c") => fail === "region" || fail === z;
  const failedOver = setup === "target" && fail === "b";
  return (
    <WidgetFrame wide label="What does an outage take down?">
      <GroupLabel>{"Kadé's setup"}</GroupLabel>
      <Choices
        label="Kadé's setup"
        value={setup}
        onChange={setSetup}
        options={[
          { value: "today", label: "Today: VMs and one database VM" },
          { value: "target", label: "After the course: Cloud Run and Cloud SQL" },
        ]}
      />
      <div className="mt-4">
        <GroupLabel>What fails</GroupLabel>
        <Choices
          label="What fails"
          value={fail}
          onChange={setFail}
          options={[
            { value: "none", label: "Nothing" },
            { value: "a", label: "Zone a" },
            { value: "b", label: "Zone b" },
            { value: "region", label: "The whole region" },
          ]}
        />
      </div>
      <div className="mt-5">
        <Drawing
          h={440}
          label={`Kadé ${setup === "today" ? "today" : "after the course"}, with ${fail === "none" ? "nothing failing" : fail === "region" ? "the whole region down" : `zone ${fail} down`}. ${text}`}
        >
          <Box x={16} y={16} w={170} h={56} />
          <T x={30} y={49} k="t">
            Shoppers
          </T>
          <Box x={376} y={16} w={208} h={56} c="purple" />
          <T x={390} y={38} k="t">
            Load balancer
          </T>
          <T x={390} y={58}>
            global · 34.120.88.10
          </T>
          <path className="w" d="M186 44 H374" markerEnd={arrowHead("muted")} />

          <rect className={cn("zone", fail === "region" ? "fault" : "plum")} x="16" y="104" width="928" height="320" rx="2" />
          <T x={928} y={126} end k={fail === "region" ? "s c-red" : "s"} bold={fail === "region"}>
            {fail === "region" ? "region asia-southeast1 is down" : "region asia-southeast1"}
          </T>
          {(["a", "b", "c"] as const).map((z) => (
            <g key={z}>
              <rect className={cn("zone", down(z) && "fault")} x={ZONE_X[z]} y="140" width="288" height="272" rx="2" />
              <T x={ZONE_X[z] + 16} y={164} k={down(z) ? "t c-red" : "t"}>
                {down(z) ? `zone ${z}: down` : `zone ${z}`}
              </T>
            </g>
          ))}

          {setup === "today" ? (
            <>
              <path className={cn("w green", down("a") && "off")} d="M480 72 V88 H176 V194" markerEnd={arrowHead("green")} />
              <path className={cn("w green", down("b") && "off")} d="M480 72 V194" markerEnd={arrowHead("green")} />
              <path className={cn("w teal", (down("a") || down("b")) && "off")} d="M176 248 V294 H350" markerEnd={arrowHead("teal")} />
              <path className={cn("w teal", down("b") && "off")} d="M480 248 V266" markerEnd={arrowHead("teal")} />
              <OutRes x={48} y={196} w={256} t="kade-api-1" s="VM · zonal" c="blue" down={down("a")} />
              <OutRes x={352} y={196} w={256} t="kade-api-2" s="VM · zonal" c="blue" down={down("b")} />
              <OutRes x={352} y={268} w={256} t="kade-db" s="database VM · zonal" c="blue" down={down("b")} />
              <T x={656} y={222} k="f">
                no Kadé resources
              </T>
            </>
          ) : (
            <>
              <path className={cn("w green", fail === "region" && "off")} d="M480 72 V194" markerEnd={arrowHead("green")} />
              <path
                className={cn("w plum", fail === "region" && "off")}
                d={failedOver ? "M176 248 V266" : "M480 248 V266"}
                markerEnd={arrowHead("plum")}
              />
              <path className={cn("w plum dash", (down("a") || down("b")) && "off")} d="M304 294 H350" />
              <OutRes
                x={48}
                y={196}
                w={864}
                t="Cloud Run · kade-api"
                s={
                  fail === "none" || fail === "region"
                    ? "regional: Google runs it across the zones"
                    : `regional: still serving from the zones that are up`
                }
                c="purple"
                down={fail === "region"}
              />
              <OutRes
                x={48}
                y={268}
                w={256}
                t={failedOver ? "kade-sql primary" : "kade-sql standby"}
                s={failedOver ? "took over from zone b" : "a copy, ready to take over"}
                c="purple"
                down={down("a")}
              />
              <OutRes
                x={352}
                y={268}
                w={256}
                t="kade-sql primary"
                s="Cloud SQL · regional (HA)"
                c="purple"
                down={down("b")}
              />
              <OutRes x={48} y={340} w={256} t="kade-worker" s="VM · zonal" c="blue" down={down("a")} />
            </>
          )}
        </Drawing>
      </div>
      <div aria-live="polite" className="mt-4">
        <Result tone={ok ? "ok" : "fault"}>{text}</Result>
      </div>
    </WidgetFrame>
  );
}

// ── Chapter 1.1, the quiz ──────────────────────────────────────────────────

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
function selectRoute(c: Pick<RouteCase, "tags" | "dst" | "routes">, down: readonly string[] = []) {
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
  left = left.filter((r) => (r.dep && down.includes(r.dep) ? ((st[r.n] = ["out", `next hop ${r.dep} is down`, 6]), false) : true));
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

type RouteSel = ReturnType<typeof selectRoute>;

/** The selection order as a strip: routes still in the running after each step, the deciding step marked. */
function RouteStrip({ steps, sel }: { steps: [number, string][]; sel: RouteSel & { special?: object } }) {
  const decided = sel.win.length > 0 || !!sel.special;
  return (
    <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`, minWidth: Math.max(700, steps.length * 80) }}>
      {steps.map(([n, label]) => {
        const dec = n === sel.dec;
        const after = n > sel.dec;
        const count = sel.counts[n];
        return (
          <li key={n} className={cn("rounded-[2px] border px-2 py-2", dec ? (decided ? "border-ink" : "border-fault") : "border-rule", after && "opacity-50")}>
            <span className="text-ink-faint block font-mono text-[11.5px]">step {n}</span>
            <span className={cn("block text-[13.5px] leading-[1.3]", dec ? "text-ink font-bold" : "text-ink-body")}>{label}</span>
            <span className={cn("mt-1 block font-mono text-[12px]", dec ? "text-ink" : "text-ink-faint")}>
              {dec ? (
                decided ? (
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
  );
}

/** Every route in the running, with the step that removed it or the word that it won. */
function RouteRows({ routes, sel }: { routes: Route[]; sel: RouteSel }) {
  return (
    <Table
      head={["Destination", "Specificity", "Priority", "Next hop", "Tags", "Result"]}
      mono={[0, 2, 4]}
      minWidth={720}
      marked={(i) => sel.st[routes[i].n]?.[0] === "win"}
      faded={(i) => sel.st[routes[i].n]?.[0] === "out"}
      rows={routes.map((r) => {
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
  );
}

function RouteDrawing({ c, sel }: { c: RouteCase; sel: RouteSel }) {
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
  const sel = selectRoute(c, what === "normal" ? [] : [what]);
  return (
    <div className="space-y-5">
      <p className="text-ink-body text-[15.5px]">
        <span className="text-ink font-semibold">Packet</span> from <b className="text-ink">{c.from}</b>{" "}
        {c.tags.length ? `(tags: ${c.tags.join(", ")})` : "(no tags)"} → <code className="font-mono text-[0.92em]">{c.dst}</code> · {c.dl}
      </p>
      <div>
        <p className="text-ink-faint mb-2 text-[13.5px]">Steps 1-2: no special path, no policy-based route</p>
        <RouteStrip steps={ROUTE_STEPS} sel={sel} />
      </div>
      <RouteRows routes={c.routes} sel={sel} />
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

type TagVm = { n: string; tags: string[] };
type TagHop = { t: string; s: string };

type TagCase = Case & {
  goal: string;
  vms: TagVm[];
  /** One destination, or a choice of them: [ip, label]. */
  dsts: [string, string][];
  routes: Route[];
  /** A route the scenario deleted, drawn as a ghost row. */
  gone?: string;
  /** Next hops by route name, drawn in line with each row. */
  hops: Record<string, TagHop>;
  /** "What if" keys that remove a VM's tags instead of stopping a next hop. */
  untag?: Record<string, string>;
  /** A path that should never happen: [vm, what]. Drawn in red. */
  leak?: [string, string];
};

const via = (t: string, s: string): TagHop => ({ t, s });
const GW = via("internet gateway", "straight out");

const TAG_CASES: TagCase[] = [
  {
    k: "A",
    t: "Some VMs through a proxy",
    goal: "kade-worker's internet traffic goes through kade-proxy; every other VM goes direct.",
    vms: [
      { n: "kade-api-1", tags: ["api"] },
      { n: "kade-db", tags: [] },
      { n: "kade-worker", tags: ["via-proxy"] },
    ],
    dsts: [["8.8.8.8", "the internet"]],
    routes: [
      route("default", "0.0.0.0/0", 1000, "default-internet-gateway", "gw"),
      route("kade-via-proxy", "0.0.0.0/0", 900, "instance kade-proxy", "vm", ["via-proxy"], "static", "kade-proxy"),
    ],
    hops: { default: GW, "kade-via-proxy": via("kade-proxy", "VM · then the internet") },
    what: [
      ["normal", "Normal"],
      ["kade-proxy", "What if kade-proxy is stopped?"],
    ],
    take: {
      normal:
        "The tag decides who sees route 2; priority picks the winner. Only kade-worker has both routes, and <b>900 beats 1000</b>. kade-proxy needs IP forwarding on (chapter 3) and its own way out: an external IP or Cloud NAT.",
      "kade-proxy":
        "Route 2 drops out at step 6, and the default route has <b>exactly the same destination</b>, so it takes over. kade-worker goes straight out, uninspected, until kade-proxy is back.",
    },
    cfg: "Route 1:  0.0.0.0/0 → default-internet-gateway   prio 1000   no tags (all VMs)\nRoute 2:  0.0.0.0/0 → instance kade-proxy        prio 900    tags: [via-proxy]\n\nkade-worker (via-proxy):  both apply, both /0 → 900 beats 1000 → kade-proxy\nkade-api-1 (no such tag): route 2 does not apply → route 1 → direct",
  },
  {
    k: "B",
    t: "No internet for some VMs",
    goal: "kade-db can never reach the internet; the other VMs can.",
    vms: [
      { n: "kade-api-1", tags: ["internet"] },
      { n: "kade-db", tags: [] },
      { n: "kade-worker", tags: ["internet"] },
    ],
    dsts: [["8.8.8.8", "the internet"]],
    gone: "0.0.0.0/0 · prio 1000 · every VM",
    routes: [route("internet", "0.0.0.0/0", 1000, "default-internet-gateway", "gw", ["internet"])],
    hops: { internet: GW },
    untag: { "untag-worker": "kade-worker" },
    what: [
      ["normal", "Normal"],
      ["untag-worker", "What if kade-worker misses the tag?"],
    ],
    take: {
      normal:
        "The untagged default route is deleted and added back with the tag <b>internet</b>. kade-db has no tag, so <b>no route applies</b> and the packet is dropped. No route means no path, which is safer than sending traffic somewhere to die.",
      "untag-worker":
        "Every VM that needs the internet must carry the tag. A new VM, or one rebuilt from an old template, quietly loses the internet. Cloud NAT also needs a default route the VM can see (section 08), and an egress firewall rule (chapter 5) is often the simpler tool.",
    },
    cfg: "Delete the untagged default route, then:\nRoute 1:  0.0.0.0/0 → default-internet-gateway   prio 1000   tags: [internet]\n\nkade-api-1, kade-worker tagged \"internet\" → internet as before\nkade-db, no tag → no route to 0.0.0.0/0 → packet dropped (network unreachable)",
  },
  {
    k: "C",
    t: "Why a blackhole VM leaks",
    goal: "kade-db's internet traffic is sent to a VM that throws it away.",
    vms: [
      { n: "kade-api-1", tags: ["api"] },
      { n: "kade-db", tags: ["no-egress"] },
    ],
    dsts: [["8.8.8.8", "the internet"]],
    routes: [
      route("default", "0.0.0.0/0", 1000, "default-internet-gateway", "gw"),
      route("blackhole", "0.0.0.0/0", 900, "instance blackhole-vm", "vm", ["no-egress"], "static", "blackhole-vm"),
    ],
    hops: { default: GW, blackhole: via("blackhole-vm", "VM · packets sink here") },
    what: [
      ["normal", "Normal day"],
      ["blackhole-vm", "What if blackhole-vm is stopped for patching?"],
    ],
    leak: ["kade-db", "blackhole-vm"],
    take: {
      normal: "On a normal day it works: 900 beats 1000, and kade-db's packets sink at blackhole-vm.",
      "blackhole-vm":
        "Route 2 drops out at step 6, and the default route has the same destination, so <b>kade-db reaches the internet</b>. Anything that must fail closed should not depend on a VM being up. Use Scenario B or a firewall rule.",
    },
    cfg: "Route 1:  0.0.0.0/0 → default-internet-gateway   prio 1000   no tags\nRoute 2:  0.0.0.0/0 → instance blackhole-vm      prio 900    tags: [no-egress]\n\nNormal day:  kade-db (no-egress) → route 2 → packets sink at blackhole-vm\nblackhole-vm stopped for patching:\n             route 2 ignored (step 6) → route 1 → kade-db reaches the internet",
  },
  {
    k: "D",
    t: "Only some destinations",
    goal: "Only kade-worker's calls to PayGate go through kade-inspect.",
    vms: [
      { n: "kade-api-1", tags: ["api"] },
      { n: "kade-worker", tags: ["inspected"] },
    ],
    dsts: [
      ["192.0.2.10", "PayGate"],
      ["8.8.8.8", "anywhere else"],
    ],
    routes: [
      route("default", "0.0.0.0/0", 1000, "default-internet-gateway", "gw"),
      route("paygate", "192.0.2.0/24", 1000, "instance kade-inspect", "vm", ["inspected"], "static", "kade-inspect"),
    ],
    hops: { default: GW, paygate: via("kade-inspect", "VM · then PayGate") },
    what: [
      ["normal", "Normal"],
      ["kade-inspect", "What if kade-inspect is stopped?"],
    ],
    take: {
      normal:
        "Here <b>specificity</b> does the work, not priority: both routes have 1000, and the /24 wins for PayGate. The tag only limits who sees the specific route.",
      "kade-inspect":
        "Different from Scenarios A and C: kade-worker's PayGate calls are <b>dropped</b>. The /0 was already removed at step 5 as less specific, and GCP never falls back to a less specific route (Example E in section 05).",
    },
    cfg: "Route 1:  0.0.0.0/0     → default-internet-gateway   prio 1000   no tags\nRoute 2:  192.0.2.0/24  → instance kade-inspect      prio 1000   tags: [inspected]\n\nkade-worker (inspected):\n  to 192.0.2.10 → route 2 (the /24 is more specific; priority not needed)\n  to anything else on the internet → route 1\nkade-api-1 (no tag): everything → route 1",
  },
  {
    k: "E",
    t: "A tagged pair of VPN tunnels",
    goal: "VMs tagged via-office send all traffic to the office, shared across two tunnels.",
    vms: [
      { n: "kade-api-1", tags: ["api"] },
      { n: "kade-worker", tags: ["via-office"] },
    ],
    dsts: [["8.8.8.8", "the internet"]],
    routes: [
      route("default", "0.0.0.0/0", 1000, "default-internet-gateway", "gw"),
      route("office-a", "0.0.0.0/0", 900, "vpn tunnel-a", "vpn", ["via-office"], "static", "tunnel-a"),
      route("office-b", "0.0.0.0/0", 900, "vpn tunnel-b", "vpn", ["via-office"], "static", "tunnel-b"),
    ],
    hops: {
      default: GW,
      "office-a": via("tunnel-a", "VPN · to the office"),
      "office-b": via("tunnel-b", "VPN · to the office"),
    },
    what: [
      ["normal", "Normal"],
      ["tunnel-a", "What if tunnel-a goes down?"],
    ],
    take: {
      normal:
        "Routes 2 and 3 tie on prefix, priority and next hop type, so each connection is hashed onto one tunnel (<b>ECMP</b>). This works for tagged static routes to Classic VPN tunnels. HA VPN uses dynamic routes from BGP, which cannot carry tags (chapter 15).",
      "tunnel-a": "tunnel-a's route drops out at step 6, and tunnel-b carries every connection. Nobody has to change a route.",
    },
    cfg: "Route 2:  0.0.0.0/0 → vpn tunnel-a   prio 900   tags: [via-office]\nRoute 3:  0.0.0.0/0 → vpn tunnel-b   prio 900   tags: [via-office]\n\nVM tagged via-office → routes 2 and 3 tie → ECMP across both tunnels\nUntagged VM          → default route",
  },
  {
    k: "F",
    t: "A VM with two tags",
    goal: "kade-worker carries both via-proxy and inspected. Which route wins?",
    vms: [
      { n: "kade-api-1", tags: ["api"] },
      { n: "kade-worker", tags: ["via-proxy", "inspected"] },
    ],
    dsts: [
      ["192.0.2.10", "PayGate"],
      ["8.8.8.8", "anywhere else"],
    ],
    routes: [
      route("default", "0.0.0.0/0", 1000, "default-internet-gateway", "gw"),
      route("kade-via-proxy", "0.0.0.0/0", 900, "instance kade-proxy", "vm", ["via-proxy"], "static", "kade-proxy"),
      route("paygate", "192.0.2.0/24", 1000, "instance kade-inspect", "vm", ["inspected"], "static", "kade-inspect"),
    ],
    hops: {
      default: GW,
      "kade-via-proxy": via("kade-proxy", "VM · then the internet"),
      paygate: via("kade-inspect", "VM · then PayGate"),
    },
    take: "Tags decide <b>which routes are candidates</b>, not the winner. With two tags, all three routes apply to kade-worker and compete under the normal rules: the most specific prefix first, then the lowest priority number.",
    cfg: "kade-worker tags: [via-proxy, inspected]\n\nCandidates for 192.0.2.10:\n  0.0.0.0/0     → default gateway   prio 1000   applies (no tags)\n  0.0.0.0/0     → kade-proxy        prio 900    applies (via-proxy)\n  192.0.2.0/24  → kade-inspect      prio 1000   applies (inspected)\nLongest prefix: 192.0.2.0/24 → kade-inspect WINS\n\nCandidates for 8.8.8.8: only the two /0 routes → prio 900 → kade-proxy WINS",
  },
];

/** A route's state for the picked VM, in a few words. */
function tagWhy(state: RouteState, why: string) {
  if (state === "win") return why.startsWith("ECMP") ? "shares (ECMP)" : "wins";
  if (why.startsWith("VM lacks")) return "not for this VM";
  if (why.startsWith("does not")) return "does not contain it";
  if (why.startsWith("less")) return "less specific";
  if (why.startsWith("next hop")) return "next hop is down";
  if (why.startsWith("priority")) return "loses on priority";
  return why;
}

function TagView({ c, what }: { c: TagCase; what: string }) {
  const [vmName, setVm] = useState(c.vms[c.vms.length - 1].n);
  const [dstIp, setDst] = useState(c.dsts[0][0]);
  const untagged = c.untag?.[what];
  const vms = c.vms.map((v) => (v.n === untagged ? { ...v, tags: [] } : v));
  const vm = vms.find((v) => v.n === vmName) ?? vms[0];
  const dst = c.dsts.find(([ip]) => ip === dstIp) ?? c.dsts[0];
  const down = c.untag?.[what] || what === "normal" ? null : what;
  const sel = selectRoute({ routes: c.routes, tags: vm.tags, dst: dst[0] }, down ? [down] : []);
  const leak = !!c.leak && c.leak[0] === vm.n && c.leak[1] === what && sel.win.length > 0;

  // Rows: a ghost for a deleted route first, then the live routes.
  const rows = [...(c.gone ? [null] : []), ...c.routes];
  const top = 40;
  const pitch = 68;
  const rowY = (i: number) => top + i * pitch;
  const vmY = (i: number) => top + i * pitch;
  const h = top + Math.max(rows.length, vms.length) * pitch + 4;
  const vi = vms.indexOf(vm);
  const vy = vmY(vi) + 26;
  const wins = sel.win.map((r) => rows.indexOf(r));

  const hop = (r: Route) => c.hops[r.n];
  const winHops = sel.win.map((r) => hop(r).t);
  let verdict: string;
  if (!sel.win.length)
    verdict = sel.counts[4]
      ? `${vm.n} → ${dst[0]}: dropped. The most specific route's next hop is down, and GCP never falls back to a less specific route.`
      : `${vm.n} → ${dst[0]}: no route applies, so the packet is dropped.`;
  else if (sel.win.length > 1) verdict = `${vm.n} → ${dst[0]}: ${winHops.join(" and ")} tie, so connections are shared across them (ECMP).`;
  else {
    const w = sel.win[0];
    const lost = c.routes.filter((r) => sel.st[r.n]?.[2] === 7 && sel.st[r.n]?.[0] === "out");
    const why =
      sel.dec === 4
        ? "It is the only route that applies to this VM and contains the destination."
        : sel.dec === 5
          ? `The /${w.p} is more specific than the other routes.`
          : sel.dec === 6
            ? "The other route's next hop is down, so this one takes over."
            : sel.dec === 7 && lost.length
              ? `Both apply; priority ${w.pr} beats ${lost[0].pr}.`
              : "";
    verdict = `${vm.n} → ${dst[0]}: ${hop(w).t}. ${why}`;
  }

  return (
    <div className="space-y-4">
      <p className="text-ink-body text-[15.5px]">
        <span className="text-ink font-semibold">Goal:</span> {c.goal}
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-ink-muted text-[14px]">Packet from</span>
          <Choices label="Packet from" value={vm.n} onChange={setVm} options={vms.map((v) => ({ value: v.n, label: v.n }))} />
        </div>
        {c.dsts.length > 1 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-ink-muted text-[14px]">to</span>
            <Choices
              label="Destination"
              value={dst[0]}
              onChange={setDst}
              options={c.dsts.map(([ip, l]) => ({ value: ip, label: `${l} · ${ip}` }))}
            />
          </div>
        )}
      </div>
      <Drawing
        h={h}
        label={`Scenario ${c.k}. ${verdict}`}
      >
        <T x={16} y={22} k="f">VMs and their tags</T>
        <T x={296} y={22} k="f">kade-vpc route table</T>
        <T x={748} y={22} k="f">next hop</T>

        {vms.map((v, i) => (
          <g key={v.n}>
            <Box x={16} y={vmY(i)} w={250} h={52} c="blue" className={v === vm ? "cur" : undefined} />
            <T x={28} y={vmY(i) + 22} k="t">
              {v.n}
            </T>
            <T x={28} y={vmY(i) + 42}>
              {v.tags.length ? `tags: ${v.tags.join(", ")}` : "no tags"}
            </T>
          </g>
        ))}

        {rows.map((r, i) => {
          const y = rowY(i);
          if (!r)
            return (
              <g key="gone">
                <rect className="ghost" x={296} y={y} width={408} height={52} rx="2" />
                <T x={308} y={y + 22} k="f">
                  {c.gone}
                </T>
                <T x={308} y={y + 42} k="f">
                  deleted
                </T>
              </g>
            );
          const [state, why] = sel.st[r.n] ?? ["out", ""];
          const won = state === "win";
          const off = state === "out" && why.startsWith("VM lacks");
          const dead = down !== null && r.dep === down;
          const h2 = hop(r);
          return (
            <g key={r.n}>
              <g className={off ? "off" : undefined}>
                <Box x={296} y={y} w={408} h={52} c={dead ? "red" : r.tags.length ? "orange" : "blue"} className={won ? (leak ? undefined : "cur") : undefined} />
                <T x={308} y={y + 22} k="t">
                  {`${r.d} · prio ${r.pr}`}
                </T>
                <T x={308} y={y + 42}>
                  {r.tags.length ? `for tag ${r.tags.join(", ")}` : "for every VM"}
                </T>
                <T x={692} y={y + 42} k={won ? "s" : "f"} bold={won} end>
                  {tagWhy(state, why)}
                </T>
              </g>
              <Wire x1={704} y1={y + 26} x2={745} y2={y + 26} cur={won && !leak} c={won && leak ? "red" : undefined} plain={!won} />
              <Box x={748} y={y} w={196} h={52} c={dead ? "red" : undefined} className={won && !leak ? "cur" : undefined} />
              <T x={760} y={y + 22} k={dead ? "t c-red" : "t"}>
                {h2.t}
              </T>
              <T x={760} y={y + 42} k={dead ? "s c-red" : "s"}>
                {dead ? "stopped" : h2.s}
              </T>
            </g>
          );
        })}

        {/* The picked VM's packet: one elbow per winning row, or a cross when nothing applies. */}
        {wins.map((i) => (
          <path
            key={i}
            className={cn("w", leak ? "fault" : "cur")}
            d={`M266 ${vy} H280 V${rowY(i) + 26} H293`}
            markerEnd={arrowHead(leak ? "fault" : "accent")}
          />
        ))}
        {!wins.length && (
          <>
            <path className="w fault" d={`M266 ${vy} H270`} />
            <Mark cx={281} cy={vy} ok={false} r={10} />
          </>
        )}
      </Drawing>
      <Result tone={!sel.win.length || leak ? "fault" : "ok"}>
        <b>{verdict}</b>
        {leak && " The block leaks."}
      </Result>
    </div>
  );
}

/** Six tag-scoped route patterns: pick a VM and watch which route it gets. */
export function TagRoutes() {
  return (
    <CaseExplorer
      label="Tag-scoped route patterns"
      cases={TAG_CASES}
      render={(c, what) => <TagView key={c.k} c={c} what={what} />}
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
const PICK_NAMES: Record<string, string> = {
  "10.10.2.5": "kade-db",
  "8.8.8.8": "internet",
  "192.0.2.10": "PayGate",
  "172.16.2.11": "warehouse",
  "172.16.1.20": "office",
  "35.191.4.7": "health check",
};
const PICK_DOWN = [
  ["kade-proxy", "kade-proxy stopped"],
  ["kade-inspect", "kade-inspect stopped"],
  ["tunnel-a", "tunnel-a down"],
  ["tunnel-b", "tunnel-b down"],
] as const;
const PICK_STEPS: [number, string][] = [[1, "special path?"], [2, "policy route?"], ...ROUTE_STEPS];

type PickSel = RouteSel & { special?: (typeof SPECIAL_PATHS)[number] };

/** Type a destination, set tags and outages, and watch the route table decide. */
export function RoutePick() {
  const [value, setValue] = useState("192.0.2.10");
  const [tags, setTags] = useState<string[]>(["inspected"]);
  const [down, setDown] = useState<string[]>([]);
  const errorId = useId();
  const error = ipError(value);
  const ip = value.trim();
  const toggle = (list: string[], set: (v: string[]) => void, key: string, on: boolean) =>
    set(on ? [...list, key] : list.filter((x) => x !== key));

  let sel: PickSel | null = null;
  if (!error) {
    const n = ipToInt(ip)!;
    const special = SPECIAL_PATHS.find((p) => inRange(n, p.net, p.p));
    if (special) {
      const st: RouteSel["st"] = {};
      PICK_ROUTES.forEach((r) => (st[r.n] = ["out", "a special path handles this destination", 1]));
      sel = { st, counts: { 1: PICK_ROUTES.length }, dec: 1, win: [], special };
    } else {
      sel = selectRoute({ routes: PICK_ROUTES, tags, dst: ip }, down);
      sel.counts[1] = sel.counts[2] = PICK_ROUTES.length;
    }
  }

  let verdict: ReactNode = null;
  let tone: Tone = "ok";
  if (sel?.special) {
    verdict = (
      <>
        <b>A special path, decided at step 1.</b> {sel.special.c} is {sel.special.n}. It is not in the route table, and no route can override it.
      </>
    );
  } else if (sel && sel.win.length === 1) {
    const w = sel.win[0];
    const st = sel.st;
    const fell = PICK_ROUTES.find((r) => st[r.n]?.[2] === 6);
    verdict =
      w.kind === "subnet" ? (
        <>
          <b>Subnet route {w.n} wins at step 3.</b> {ip} is inside {w.d}, and nothing can beat a subnet route.
        </>
      ) : (
        <>
          <b>
            {w.n} wins at step {sel.dec}:
          </b>{" "}
          {w.d} → {w.hop}.{fell && ` ${fell.n} dropped out at step 6 because ${fell.dep} is down, so this route took over.`}
        </>
      );
  } else if (sel && sel.win.length > 1) {
    verdict = (
      <>
        <b>ECMP at step 9:</b> {sel.win.length} routes tie ({sel.win.map((r) => r.hop).join(" and ")}). Connections are spread across them.
      </>
    );
  } else if (sel) {
    tone = "fault";
    verdict =
      sel.counts[4] > 0 ? (
        <>
          <b>Dropped at step 6.</b> The most specific route&apos;s next hop is down, and GCP never falls back to a less specific route. The VM gets
          ICMP &quot;network unreachable&quot;.
        </>
      ) : (
        <>
          <b>Dropped at step 4.</b> No route applies to this VM and contains the destination.
        </>
      );
  }

  return (
    <WidgetFrame wide label="Pick the route">
      <div className="space-y-3">
        <Field label="Destination IP" value={value} onChange={setValue} invalid={!!error} describedBy={errorId} />
        <Examples values={PICK_EXAMPLES} names={PICK_NAMES} current={value} onPick={setValue} />
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
      <div aria-live="polite" className="mt-6 space-y-5">
        {error ? (
          <FieldError id={errorId}>{error}</FieldError>
        ) : (
          sel && (
            <>
              <Result tone={tone}>{verdict}</Result>
              <RouteStrip steps={PICK_STEPS} sel={sel} />
              {sel.special ? (
                <p className="text-ink-muted text-[15px]">The route table is never read: none of its {PICK_ROUTES.length} routes is a candidate.</p>
              ) : (
                <RouteRows routes={PICK_ROUTES} sel={sel} />
              )}
            </>
          )
        )}
      </div>
    </WidgetFrame>
  );
}
