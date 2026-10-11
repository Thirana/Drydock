"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Field, FieldError } from "../field";
import { KeyValues, Select, Steps, WidgetNote } from "../ui";
import { WidgetFrame } from "../widget-frame";
import { CaseExplorer, Chain, Result, type Case, type Tone } from "./case-explorer";
import { Box, Caps, Drawing, Mark, T, Wire, Zone } from "./draw";
import { Check, Runbook, Table } from "./kit";

/* Part 3 · Leaving and reaching privately (chapters 7-10). */

const n = (x: number) => x.toLocaleString("en-US");

// ── Chapter 7 ──────────────────────────────────────────────────────────────

/** How many NAT ports Kadé has, and whether a burst to PayGate fits. */
export function NatCalc() {
  const [ips, setIps] = useState("1");
  const [ports, setPorts] = useState("64");
  const [vms, setVms] = useState("3");
  const [conn, setConn] = useState("150");
  const errorId = useId();
  const s = +ips;
  const o = +ports;
  const v = parseInt(vms, 10);
  const c = parseInt(conn, 10);
  const bad = !(v > 0 && c >= 0);
  const total = 64512 * s;
  const most = Math.floor(total / o);
  const reserved = v * o;
  let verdict: [Tone, string] = ["ok", ""];
  if (!bad) {
    verdict =
      v <= most
        ? c <= o
          ? ["ok", `Fits: ${c} of ${o} ports to PayGate in use at the peak, and ${v} of ${n(most)} possible VMs.`]
          : [
              "fault",
              `OUT_OF_RESOURCES: each VM has ${o} ports, so only ${o} connections can be open to PayGate at once. Connections ${o + 1} to ${c} are dropped. Pool connections, raise the minimum, or turn on dynamic port allocation.`,
            ]
        : [
            "fault",
            `Not enough ports: ${v} VMs × ${o} = ${n(reserved)} ports, but ${s} IP${s > 1 ? "s give" : " gives"} ${n(total)}. Some VMs get no NAT at all.`,
          ];
  }
  return (
    <WidgetFrame label="Cloud NAT port calculator">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <Select label="NAT IPs" value={ips} onChange={setIps} options={["1", "2", "3", "4"].map((x) => ({ value: x, label: x }))} />
        <Select
          label="Min ports per VM"
          value={ports}
          onChange={setPorts}
          options={["32", "64", "128", "256", "512", "1024", "4096"].map((x) => ({ value: x, label: x }))}
        />
        <Field label="VMs or instances" value={vms} onChange={setVms} short inputMode="numeric" invalid={bad} describedBy={errorId} />
        <Field label="Peak connections from one VM to PayGate" value={conn} onChange={setConn} short inputMode="numeric" invalid={bad} describedBy={errorId} />
      </div>
      <div aria-live="polite" className="mt-5 space-y-4">
        {bad ? (
          <FieldError id={errorId}>Enter whole numbers for VMs and connections.</FieldError>
        ) : (
          <>
            <KeyValues
              items={[
                ["Total NAT ports", `${s} × 64,512 = ${n(total)}`],
                ["Most VMs at this minimum", n(most)],
                ["Ports reserved now", n(reserved)],
                ["Max open to one destination, per VM", o],
                [
                  "Sustained new connections per second to one destination",
                  `about ${(o / 120).toFixed(2)}, because each closed port waits 120 s (TIME_WAIT) before reuse`,
                  true,
                ],
              ]}
            />
            <Result tone={verdict[0]}>
              <b>{verdict[1]}</b>
            </Result>
          </>
        )}
      </div>
    </WidgetFrame>
  );
}

// ── Chapter 8: resolution order ────────────────────────────────────────────

const DNS_STEPS: [string, string, string][] = [
  ["1", "Outbound server policy", "alternative name servers"],
  ["2", "Response policies", "override chosen names"],
  ["3", "Private zones", "private, forwarding, peering · longest suffix"],
  ["4", "Internal DNS", "*.c.kade-prod.internal"],
  ["5", "Public DNS", "the internet"],
];
type OrderCase = Case & { name: string; stop: number; ans: string; src: string; warn?: boolean; L: string[] };

const ORDER_CASES: OrderCase[] = [
  {
    k: "db.kade.internal",
    name: "db.kade.internal",
    stop: 2,
    ans: "10.10.2.5",
    src: "private zone kade-internal",
    L: ["none set", "none set", "kade-internal matches", "", ""],
    take: "Steps 1 and 2 have nothing set, so the question reaches the private zones. <b>kade-internal</b> matches the suffix <code>kade.internal</code> and answers. Internal DNS and public DNS are never asked.",
    cfg: "kade-worker → 169.254.169.254: db.kade.internal?\n1 outbound server policy: none\n2 response policies:       none\n3 private zones:           kade-internal (kade.internal.) matches → A 10.10.2.5",
  },
  {
    k: "A VM's own name",
    name: "kade-db.asia-southeast1-b.c.kade-prod.internal",
    stop: 3,
    ans: "10.10.2.5",
    src: "Compute Engine internal DNS",
    L: ["none set", "none set", "no zone matches", "VM kade-db found", ""],
    take: "No private zone covers <code>c.kade-prod.internal</code>, so the question falls to step 4, where GCP answers from its own record of VMs. You created nothing for this answer.",
    cfg: "kade-worker → 169.254.169.254: kade-db.asia-southeast1-b.c.kade-prod.internal?\n1-3: nothing matches\n4 internal DNS: VM kade-db in asia-southeast1-b → 10.10.2.5",
  },
  {
    k: "A public name",
    name: "api.kade.lk",
    stop: 4,
    ans: "34.120.88.10",
    src: "public DNS (zone kade-lk)",
    L: ["none set", "none set", "no zone matches", "not a VM name", "asked on the internet"],
    take: "Nothing inside GCP has this name, so the metadata server looks it up on the internet like any resolver, and gets the public zone's answer: the load balancer.",
    cfg: "kade-worker → 169.254.169.254: api.kade.lk?\n1-4: nothing matches\n5 public DNS: kade.lk public zone → A 34.120.88.10",
  },
  {
    k: "With an outbound server policy",
    name: "db.kade.internal",
    stop: 0,
    ans: "whatever the office server says",
    src: "172.16.1.53",
    warn: true,
    L: ["all → 172.16.1.53", "skipped", "skipped", "skipped", "skipped"],
    take: "An outbound server policy sends <b>every</b> question to the alternative name servers. Private zones and internal names are skipped, so <code>db.kade.internal</code> now works only if the office server knows it or forwards it back to GCP. This is why Kadé does not use one.",
    cfg: "kade-vpc outbound server policy: alternative name server 172.16.1.53\n\nkade-worker → 169.254.169.254: db.kade.internal?\n1 outbound server policy → forward to 172.16.1.53, nothing else is checked",
  },
];

function OrderDrawing({ c }: { c: OrderCase }) {
  const ys = DNS_STEPS.map((_, i) => 86 + 78 * i);
  const stopY = ys[c.stop] + 31;
  return (
    <div className="space-y-3">
      <Drawing h={ys[4] + 62 + 10} label={`Where the question for ${c.name} is answered`}>
        <Box x={16} y={8} w={928} h={46} />
        <T x={32} y={37} k="t">Question</T>
        <T x={124} y={37}>{`kade-worker asks 169.254.169.254: ${c.name}`}</T>
        <Box x={16} y={86} w={240} h={374} c="purple" />
        <T x={32} y={114} k="t">metadata server</T>
        <T x={32} y={134}>169.254.169.254</T>
        <T x={32} y={168} k="f" size={11.5}>checks the five steps</T>
        <T x={32} y={186} k="f" size={11.5}>from the top; the first</T>
        <T x={32} y={204} k="f" size={11.5}>one with an answer wins</T>
        {DNS_STEPS.map(([num, title, sub], i) => {
          const y = ys[i];
          const state = i < c.stop ? "pass" : i === c.stop ? "stop" : "nr";
          return (
            <g key={num} className={state === "nr" ? "off" : undefined}>
              <Box x={290} y={y} w={654} h={62} c={state === "stop" ? (c.warn ? "yellow" : "green") : undefined} />
              <T x={306} y={y + 26} k="t">{`${num} · ${title}`}</T>
              <T x={306} y={y + 46}>{sub}</T>
              {c.L[i] && (
                <T x={670} y={y + 36} k={state === "stop" ? "s" : "f"} size={11.5}>
                  {c.L[i]}
                </T>
              )}
              <T x={928} y={y + 36} k={state === "stop" ? "s" : "f"} end bold>
                {state === "stop" ? "ANSWERS" : state === "pass" ? "↓ next" : "not reached"}
              </T>
            </g>
          );
        })}
        <line className={cn("w", !c.warn && "green")} x1={270} y1={ys[0] - 10} x2={270} y2={stopY} strokeWidth={3} />
        <line className={cn("w", !c.warn && "green")} x1={270} y1={stopY} x2={286} y2={stopY} strokeWidth={3} markerEnd={`url(#dd-ah-${c.warn ? "muted" : "green"})`} />
        {ys.map((y, i) => i < c.stop && <circle key={i} className="ok" cx={270} cy={y + 31} r={5} />)}
      </Drawing>
      <Result tone={c.warn ? "warn" : "ok"}>
        <b>
          Answer: {c.ans} · from {c.src}
        </b>
      </Result>
    </div>
  );
}

/** The five steps a VM's DNS question goes through, and where it stops. */
export function DnsOrder() {
  return <CaseExplorer label="DNS resolution order inside kade-vpc" cases={ORDER_CASES} render={(c) => <OrderDrawing c={c} />} />;
}

// ── Chapter 8: split horizon ───────────────────────────────────────────────

type Zone = { name: string; rec: Record<string, string>; note?: string };
type SplitCase = Case & { Z: Zone[] };
const PUBLIC_KADE: Record<string, string> = { "api.kade.lk": "34.120.88.10", "status.kade.lk": "34.120.88.10", "www.kade.lk": "34.120.88.10" };

const SPLIT_CASES: SplitCase[] = [
  {
    k: "A",
    t: "The private zone that hides the whole domain",
    what: [
      ["normal", "kade-worker asks api.kade.lk"],
      ["status", "What if it asks status.kade.lk?"],
    ],
    Z: [
      { name: "kade.internal", rec: { "db.kade.internal": "10.10.2.5" } },
      { name: "kade.lk", rec: { "api.kade.lk": "10.10.1.10" }, note: "only the one record needed inside" },
    ],
    take: {
      normal:
        "<code>api.kade.lk</code> matches the private zone <b>kade.lk</b>, which has the record, so kade-worker gets the private address. That part works as planned.",
      status:
        "<code>status.kade.lk</code> also matches the private zone <b>kade.lk</b> by suffix, but that zone has no such record. The answer is <b>NXDOMAIN</b>, and public DNS, which does have the name, is <b>never asked</b>. Every public name a VM still needs must be copied into the private zone by hand.",
    },
    cfg: "Public zone  kade.lk:  api, www, status, shop … (20 records)\nPrivate zone kade.lk:  api → 10.10.1.10          (only the one record needed inside)\n\nkade-worker asks for api.kade.lk    → private zone → 10.10.1.10     ✔ as planned\nkade-worker asks for status.kade.lk → private zone → NXDOMAIN       ✘\n                                       (the private zone matched the suffix, so\n                                        public DNS is never asked)",
  },
  {
    k: "B",
    t: "The narrower zone that avoids it",
    what: [
      ["normal", "kade-worker asks api.kade.lk"],
      ["status", "What if it asks status.kade.lk?"],
    ],
    Z: [
      { name: "kade.internal", rec: { "db.kade.internal": "10.10.2.5" } },
      { name: "api.kade.lk", rec: { "api.kade.lk": "10.10.1.10" }, note: "a zone for exactly one name" },
    ],
    take: {
      normal: "The zone is named <b>api.kade.lk</b> itself, so it matches only that name, and kade-worker gets the private address.",
      status:
        "<code>status.kade.lk</code> does not end in <code>api.kade.lk</code>, so no private zone matches. The question falls through to public DNS, which answers normally. Only the one name is overridden.",
    },
    cfg: "Private zone for api.kade.lk only   (the zone's name is the one host)\n\nkade-worker asks for api.kade.lk    → matches the api.kade.lk zone → private answer\nkade-worker asks for status.kade.lk → no private zone matches → public DNS → works",
  },
  {
    k: "Kadé's choice",
    t: "a separate internal domain",
    what: [
      ["normal", "kade-worker asks db.kade.internal"],
      ["api", "What if it asks api.kade.lk?"],
    ],
    Z: [{ name: "kade.internal", rec: { "db.kade.internal": "10.10.2.5", "worker.kade.internal": "10.10.1.20" } }],
    take: {
      normal: "Internal names live under <code>kade.internal</code>, which the public never sees. The private zone answers them.",
      api: "No private zone touches <code>kade.lk</code>, so every public name keeps working exactly as it does on the internet. Nothing can be shadowed by accident.",
    },
    cfg: "Private zone kade-internal (kade.internal.): db, worker\nNo private zone for kade.lk\n\nkade-worker asks db.kade.internal → private zone → 10.10.2.5\nkade-worker asks api.kade.lk      → public DNS   → 34.120.88.10",
  },
];

const matchesZone = (name: string, zone: string) => name === zone || name.endsWith(`.${zone}`);

function SplitDrawing({ c, what }: { c: SplitCase; what: string }) {
  const q = what === "status" ? "status.kade.lk" : what === "api" ? "api.kade.lk" : c.k === "Kadé's choice" ? "db.kade.internal" : "api.kade.lk";
  const zone = c.Z.filter((z) => matchesZone(q, z.name)).sort((a, b) => b.name.length - a.name.length)[0];
  const answer = zone ? (zone.rec[q] ?? "NXDOMAIN") : (PUBLIC_KADE[q] ?? "NXDOMAIN");
  const ok = zone ? !!zone.rec[q] : true;
  const from = zone ? `private zone ${zone.name}` : "public DNS";
  const top = 102;
  const pubH = Math.max(118 * c.Z.length - 18, 150);
  const h = top + Math.max(118 * c.Z.length, pubH + 18);
  return (
    <div className="space-y-3">
      <Drawing h={h} label={`Which zone answers ${q}`}>
        <Box x={16} y={8} w={928} h={46} />
        <T x={32} y={37} k="t">Question</T>
        <T x={124} y={37}>{`kade-worker asks: ${q}`}</T>
        <Caps x={16} y={88}>STEP 3 · PRIVATE ZONES kade-vpc CAN SEE (longest matching suffix wins)</Caps>
        <Caps x={640} y={88}>STEP 5 · PUBLIC DNS</Caps>
        {c.Z.map((z, i) => {
          const y = top + 118 * i;
          const chosen = z === zone;
          const match = matchesZone(q, z.name);
          return (
            <g key={z.name}>
              <Box x={16} y={y} w={560} h={100} c={chosen ? (ok ? "green" : "red") : undefined} />
              <T x={32} y={y + 28} k="t">{`zone ${z.name}`}</T>
              <T x={560} y={y + 28} k={match && chosen ? (ok ? "s" : "s c-red") : "f"} end bold={match && chosen} size={11.5}>
                {match ? (chosen ? "suffix matches → this zone answers" : "suffix matches, shorter") : "suffix does not match"}
              </T>
              {z.note && (
                <T x={32} y={y + 48} k="f" size={11.5}>
                  {z.note}
                </T>
              )}
              {Object.entries(z.rec).map(([name, ip], j) => (
                <g key={name}>
                  <Box x={32 + 262 * j} y={y + 58} w={248} h={30} c={name === q ? "green" : undefined} />
                  <T x={44 + 262 * j} y={y + 78} size={11.5}>{`${name} → ${ip}`}</T>
                </g>
              ))}
            </g>
          );
        })}
        <g className={zone ? "off" : undefined}>
          <Box x={640} y={top} w={304} h={pubH} c={zone ? undefined : "green"} />
          <T x={656} y={top + 28} k="t">public zone kade.lk</T>
          <T x={656} y={top + 48} size={11.5} bold={!zone}>
            {zone ? "never asked: step 3 already answered" : "asked: no private zone matched"}
          </T>
          {Object.entries(PUBLIC_KADE).map(([name, ip], j) => (
            <T key={name} x={656} y={top + 78 + 22 * j} size={11.5} bold={name === q && !zone}>
              {`${name} → ${ip}`}
            </T>
          ))}
        </g>
      </Drawing>
      <Result tone={ok ? "ok" : "fault"}>
        <b>
          Answer: {answer} · from {from}
        </b>
      </Result>
    </div>
  );
}

/** Split-horizon DNS, and the private zone that hides public names. */
export function SplitEx() {
  return <CaseExplorer label="Split-horizon DNS examples" cases={SPLIT_CASES} render={(c, what) => <SplitDrawing c={c} what={what} />} />;
}

// ── Chapter 8: who gets which answer ───────────────────────────────────────

const DW_PUBLIC: Record<string, string> = {
  "api.kade.lk": "34.120.88.10",
  "status.kade.lk": "34.120.88.10",
  "google.com": "142.250.x.x (Google's public answer)",
};
const DW_PRIVATE: Record<string, string> = { "db.kade.internal": "10.10.2.5", "worker.kade.internal": "10.10.1.20" };
const DW_INTERNAL: Record<string, string> = { "kade-db.asia-southeast1-b.c.kade-prod.internal": "10.10.2.5" };
const DW_OFFICE: Record<string, string> = { "nas.office.kade.lan": "172.16.1.40" };
const DW_NAMES = ["api.kade.lk", "status.kade.lk", "db.kade.internal", "kade-db.asia-southeast1-b.c.kade-prod.internal", "nas.office.kade.lan", "google.com"];

/** Ask a name from inside the VPC, from the internet or from the office. */
export function GcpDnsWalk() {
  const [who, setWho] = useState("vm");
  const [name, setName] = useState("db.kade.internal");
  const [opt, setOpt] = useState({ split: false, fwd: false, inb: false });
  const steps: string[] = [];
  let answer = "";
  let tone: Tone = "ok";
  const say = (a: string, t: Tone = "ok") => {
    answer = a;
    tone = t;
  };
  if (who === "net") {
    steps.push("The laptop's resolver asks public DNS only. Private zones and internal names are invisible from here.");
    if (DW_PUBLIC[name]) say(`${DW_PUBLIC[name]}, from the public zone kade-lk${name === "google.com" ? " (Google's own zone)" : ""}.`);
    else say("NXDOMAIN: no such name on the public internet.", "fault");
  } else if (who === "office") {
    steps.push("The office PC asks the office DNS server, 172.16.1.53.");
    if (DW_OFFICE[name]) {
      steps.push("The office server is authoritative for office.kade.lan.");
      say(`${DW_OFFICE[name]}, from the office DNS server.`);
    } else if (name.endsWith(".internal")) {
      if (opt.inb) {
        steps.push("The office server forwards *.internal to kade-vpc's inbound entry point 10.10.1.2 over the VPN.");
        steps.push("GCP answers it as if kade-vpc had asked (section 04).");
        if (DW_PRIVATE[name]) say(`${DW_PRIVATE[name]}, from the private zone kade-internal.`);
        else if (DW_INTERNAL[name]) say(`${DW_INTERNAL[name]}, from Compute Engine internal DNS.`);
        else say("NXDOMAIN.", "fault");
      } else {
        steps.push("The office server has nowhere to send kade.internal questions.");
        say("NXDOMAIN: the office cannot see GCP's private names without an inbound server policy.", "fault");
      }
    } else {
      steps.push("Not an office name, so the office server looks it up on the internet.");
      if (DW_PUBLIC[name]) say(`${DW_PUBLIC[name]}, from public DNS.`);
      else say("NXDOMAIN.", "fault");
    }
  } else {
    steps.push("kade-worker asks the metadata server, 169.254.169.254.");
    steps.push("Step 1: no outbound server policy. Step 2: no response policies.");
    const zones: { suf: string; kind: string; get: (x: string) => string | undefined; fwd?: boolean }[] = [
      { suf: "kade.internal", kind: "private zone kade-internal", get: (x) => DW_PRIVATE[x] },
    ];
    if (opt.split) zones.push({ suf: "kade.lk", kind: "private zone kade.lk (split-horizon)", get: (x) => (x === "api.kade.lk" ? "10.10.1.10" : undefined) });
    if (opt.fwd) zones.push({ suf: "office.kade.lan", kind: "forwarding zone office.kade.lan", get: (x) => DW_OFFICE[x], fwd: true });
    const zone = zones.filter((z) => matchesZone(name, z.suf)).sort((a, b) => b.suf.length - a.suf.length)[0];
    if (zone) {
      steps.push(`Step 3: the ${zone.kind} matches the suffix ${zone.suf}, so it answers. Public DNS will not be asked.`);
      if (zone.fwd) steps.push("The query is forwarded over the VPN to 172.16.1.53, from 35.199.192.0/19.");
      const a = zone.get(name);
      if (a) say(`${a}, from the ${zone.kind}.`);
      else say(`NXDOMAIN. The ${zone.kind} matched the suffix but has no such record, and it does not fall through to public DNS. This is the trap in section 05.`, "fault");
    } else {
      steps.push("Step 3: no private zone matches.");
      if (DW_INTERNAL[name]) {
        steps.push("Step 4: it is a Compute Engine internal name.");
        say(`${DW_INTERNAL[name]}, from internal DNS.`);
      } else {
        steps.push("Step 4: not an internal name. Step 5: look it up on the public internet.");
        if (DW_PUBLIC[name]) say(`${DW_PUBLIC[name]}, from public DNS${name.endsWith("kade.lk") ? " (the public zone kade-lk)" : ""}.`);
        else if (name.endsWith(".kade.lan")) say("NXDOMAIN: office names do not exist on the internet. A forwarding zone is needed (Scenario C).", "fault");
        else say("NXDOMAIN.", "fault");
      }
    }
  }
  return (
    <WidgetFrame label="Who gets which DNS answer?">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Select
          label="Who asks"
          value={who}
          onChange={setWho}
          options={[
            { value: "vm", label: "kade-worker (in kade-vpc)" },
            { value: "net", label: "A laptop on the internet" },
            { value: "office", label: "An office PC (after chapter 15)" },
          ]}
        />
        <Select label="Name" value={name} onChange={setName} options={DW_NAMES.map((x) => ({ value: x, label: x }))} />
      </div>
      <div className="mt-4 space-y-2">
        <Check checked={opt.split} onChange={(v) => setOpt((o) => ({ ...o, split: v }))}>
          private zone <code className="font-mono text-[0.92em]">kade.lk</code> with only <code className="font-mono text-[0.92em]">api</code> (Scenario A)
        </Check>
        <Check checked={opt.fwd} onChange={(v) => setOpt((o) => ({ ...o, fwd: v }))}>
          forwarding zone <code className="font-mono text-[0.92em]">office.kade.lan</code> (Scenario C)
        </Check>
        <Check checked={opt.inb} onChange={(v) => setOpt((o) => ({ ...o, inb: v }))}>
          inbound server policy (Scenario D)
        </Check>
      </div>
      <div aria-live="polite" className="mt-5 space-y-4">
        <Result tone={tone}>
          <b>Answer:</b> {answer}
        </Result>
        <Steps>{steps}</Steps>
      </div>
    </WidgetFrame>
  );
}

// ── Chapter 8: TTL and cutovers ────────────────────────────────────────────

type TtlCase = Case & { ttl: number };
const TTL_CASES: TtlCase[] = [
  {
    k: "TTL 300",
    t: "no preparation",
    ttl: 300,
    what: [
      ["normal", "Pool recycled at +60 s"],
      ["nopool", "What if nobody recycles the pool?"],
    ],
    take: {
      normal:
        "Each cached answer lives for 300 s from when it was looked up. Instance 2 looked up just before the change, so it keeps using the <b>old address for 280 s</b>. Up to five minutes of mixed traffic: some requests go to the old database, some to the new.",
      nopool:
        "The pool opened its connections long before the change and never looks the name up again. It keeps talking to the <b>old database indefinitely</b>, whatever the TTL. Recycling the pool is a separate step from changing DNS.",
    },
    cfg: "db.kade.internal  A  10.10.2.5   TTL 300\n(cutover at 0 s) → db.kade.internal  A  10.10.32.3\n\nWorst case: an answer cached just before 0 s stays in use for 300 s.",
  },
  {
    k: "TTL 30",
    t: "lowered a day before",
    ttl: 30,
    what: [
      ["normal", "Pool recycled at +60 s"],
      ["nopool", "What if nobody recycles the pool?"],
    ],
    take: {
      normal:
        "With a 30 s TTL, cached answers expire quickly and are looked up again. After the change, everything has the <b>new address within 30 s</b>. Lowering the TTL a day early is what makes this possible, because the long 300 s copies have all expired by then.",
      nopool: "Even with a short TTL, a pool that never reconnects stays on the old database. DNS only matters when something actually looks the name up.",
    },
    cfg: "A day before:  db.kade.internal  A  10.10.2.5   TTL 30\nCutover (0 s):  db.kade.internal  A  10.10.32.3  TTL 30\nA day after:    TTL back to 300\n\nWorst case: an answer cached just before 0 s stays in use for 30 s.",
  },
];
const TTL_CLIENTS: [string, string, number][] = [
  ["kade-api instance 1", "looked up at -250 s", -250],
  ["kade-api instance 2", "looked up at -20 s", -20],
  ["kade-worker", "looked up at +5 s", 5],
];

/**
 * A bar on the timeline. An old answer still in use after the change is the
 * problem, so that part of it is drawn as a fault.
 */
function TtlBar({ a, b, old, y, at, label }: { a: number; b: number; old: boolean; y: number; at: (s: number) => number; label?: string }) {
  const x1 = at(a);
  const x2 = at(b);
  const late = old && b > 0 ? Math.max(0, a) : null;
  return (
    <g>
      <rect className={cn("n", !old && "green")} x={x1} y={y} width={Math.max(x2 - x1 - 2, 1)} height={30} rx="2" />
      {late !== null && <rect className="n fault" x={at(late)} y={y} width={Math.max(x2 - at(late) - 2, 1)} height={30} rx="2" />}
      {label && x2 - x1 > 118 && (
        <T x={x1 + 8} y={y + 20} size={11} bold={!old}>
          {label}
        </T>
      )}
    </g>
  );
}

/** Each answer a client caches: [from, to, old, real end], one TTL after each lookup. */
function cachedAnswers(lookedUp: number, ttl: number, from: number, to: number) {
  const bars: [number, number, boolean, number][] = [];
  for (let r = lookedUp; r < to; r += ttl) bars.push([Math.max(r, from), Math.min(r + ttl, to), r < 0, r + ttl]);
  return bars.filter(([, b]) => b > from);
}

function TtlDrawing({ c, what }: { c: TtlCase; what: string }) {
  const from = -60;
  const to = 330;
  const at = (s: number) => 230 + ((s - from) / 390) * 700;
  const lanes = TTL_CLIENTS.map(([name, sub, lookedUp]) => ({ name, sub, bars: cachedAnswers(lookedUp, c.ttl, from, to) }));
  // The longest an old answer outlives the change.
  const worst = Math.max(0, ...lanes.flatMap((l) => l.bars.filter(([a, b, old]) => old && a < 0 && b > 0).map(([, , , end]) => end)));
  const nopool = what === "nopool";
  const top = 84;
  const poolY = top + 64 * lanes.length;
  const axisY = poolY + 64;
  const bad = worst > 60 || nopool;
  return (
    <div className="space-y-3">
      <Drawing h={axisY + 46} label={`Cached answers over time with TTL ${c.ttl} s`}>
        <Caps x={16} y={22}>{`TTL ${c.ttl} s · record changes at 0 s · each box = one cached answer, kept for one TTL`}</Caps>
        <rect className="n" x={at(from)} y={36} width={at(0) - at(from)} height={10} />
        <rect className="n green" x={at(0)} y={36} width={at(to) - at(0)} height={10} />
        <T x={16} y={45}>Cloud DNS record</T>
        <T x={at(from) + 6} y={64} k="f" size={11}>10.10.2.5</T>
        <T x={at(0) + 6} y={64} k="f" size={11}>10.10.32.3</T>
        {Array.from({ length: 7 }, (_, i) => -60 + 60 * i).map((s) => (
          <g key={s}>
            <line x1={at(s)} y1={top} x2={at(s)} y2={axisY} className={cn("w", s !== 0 && "dash")} strokeWidth={s === 0 ? 2 : 1} opacity={s === 0 ? 1 : 0.5} />
            <T x={at(s)} y={axisY + 18} k="f mid" size={11}>{`${s > 0 ? "+" : ""}${s} s`}</T>
          </g>
        ))}
        <T x={at(0)} y={axisY + 38} k="s mid" bold size={11}>↑ record changed</T>
        {lanes.map((lane, i) => {
          const y = top + 64 * i;
          return (
            <g key={lane.name}>
              <T x={16} y={y + 18} k="t" size={13}>{lane.name}</T>
              <T x={16} y={y + 36} k="f" size={11}>{lane.sub}</T>
              {lane.bars.map(([a, b, old]) => (
                <TtlBar key={a} a={a} b={b} old={old} y={y + 4} at={at} label={old ? "old 10.10.2.5" : "new 10.10.32.3"} />
              ))}
            </g>
          );
        })}
        <T x={16} y={poolY + 18} k="t" size={13}>connection pool</T>
        <T x={16} y={poolY + 36} k="f" size={11}>opened at -600 s</T>
        <TtlBar a={from} b={nopool ? to : 60} old y={poolY + 4} at={at} label={nopool ? "old connection, never recycled →" : "old connection"} />
        {!nopool && <TtlBar a={60} b={to} old={false} y={poolY + 4} at={at} label="recycled at +60 s: reconnects to 10.10.32.3" />}
      </Drawing>
      <Result tone={bad ? "fault" : "ok"}>
        <b>
          {nopool
            ? "The pool stays on the old database until it is recycled, whatever the TTL"
            : `Longest time a lookup still returns the old address: about ${Math.round(worst)} s`}
        </b>
      </Result>
    </div>
  );
}

/** How long old answers live after a DNS change, and why pools ignore TTL. */
export function TtlEx() {
  return <CaseExplorer label="TTL during a cutover" cases={TTL_CASES} render={(c, what) => <TtlDrawing c={c} what={what} />} />;
}

// ── Chapter 8: hybrid DNS ──────────────────────────────────────────────────

const HYBRID_CASES: Case[] = [
  {
    k: "C",
    t: "Forwarding zone",
    what: [
      ["normal", "Normal"],
      ["fw", "What if the office firewall blocks 35.199.192.0/19?"],
      ["route", "What if the office has no route back?"],
    ],
    take: {
      normal:
        "The forwarding zone sends the question to the office DNS server over the VPN. It arrives from <code>35.199.192.0/19</code>, Cloud DNS's special path (chapter 4), and the answer returns the same way.",
      fw: "The office firewall drops anything from <code>35.199.192.0/19</code>. Cloud DNS waits, gives up, and kade-worker gets <b>SERVFAIL</b> after a timeout. The fix: allow UDP and TCP 53 from that range on the office side.",
      route:
        "The question arrives and the office server answers, but the office router does not know that <code>35.199.192.0/19</code> is reached over the VPN, so the reply goes out to the internet and is lost. The fix: the VPN's Cloud Router must advertise that range to the office (chapter 15).",
    },
    cfg: "Forwarding zone: office.kade.lan → target 172.16.1.53 (office DNS server), private routing\n\nkade-worker asks nas.office.kade.lan\n  → metadata server → forwarding zone matches\n  → query sent over the VPN to 172.16.1.53, from 35.199.192.0/19\n  → 172.16.1.40",
  },
  {
    k: "D",
    t: "Inbound server policy",
    what: [
      ["normal", "Normal"],
      ["nopol", "What if kade-vpc has no inbound policy?"],
    ],
    take: {
      normal:
        "The inbound server policy gives kade-vpc an entry point (one internal IP per subnet). The office DNS server forwards <code>kade.internal</code> questions to it over the VPN, and GCP answers as if a VM in kade-vpc had asked. The reverse of tab C.",
      nopol:
        "Without an inbound policy there is no address the office can send GCP questions to. The metadata server's 169.254.169.254 only answers VMs on their own host. The office gets nothing back.",
    },
    cfg: "Inbound server policy on kade-vpc → GCP gives an entry point in sn-app, e.g. 10.10.1.2\n\nOffice DNS: forward kade.internal → 10.10.1.2\nOffice PC asks db.kade.internal → office DNS → 10.10.1.2 over the VPN → 10.10.2.5",
  },
  {
    k: "E",
    t: "Peering zone",
    take: 'A peering zone in kade-staging\'s network says "for <code>kade.internal</code>, use kade-vpc\'s answers". The question is resolved by <b>kade-vpc\'s resolution order</b>, so it sees kade-vpc\'s private zones. DNS peering is a DNS setting only: actually reaching <code>10.10.2.5</code> still needs a network path such as VPC peering (chapter 14).',
    cfg: "In kade-staging: peering zone kade.internal. → target network kade-vpc\n\nstaging VM asks db.kade.internal\n  → staging metadata server → peering zone matches\n  → resolved by kade-vpc's order → private zone kade-internal → 10.10.2.5",
  },
  {
    k: "F",
    t: "Response policy",
    take: "A response policy rule answers <b>before</b> any zone is checked (step 2). Here it sends every <code>*.googleapis.com</code> name to <code>private.googleapis.com</code>, whose addresses are reached through Kadé's own routes instead of the public ones. Chapter 9 explains why you might want that.",
    cfg: "Response policy on kade-vpc:\n  rule *.googleapis.com → CNAME private.googleapis.com\n  private.googleapis.com → A 199.36.153.8, .9, .10, .11\n\nkade-worker asks storage.googleapis.com → 199.36.153.8-11",
  },
];

function hybridDrawing(c: Case, what: string) {
  if (c.k === "C") {
    return (
      <Chain
        nodes={[
          { t: "kade-worker", s: ["asks", "nas.office", ".kade.lan"], c: "blue" },
          { t: "metadata server", s: ["169.254.169.254"], c: "purple" },
          { t: "forwarding zone", s: ["office.kade.lan", "→ 172.16.1.53", "private routing"], c: "orange" },
          { t: "office firewall", s: ["must allow 53", "from", "35.199.192.0/19"], c: what === "fw" ? "red" : "cyan" },
          { t: "office DNS", s: ["172.16.1.53", "nas →", "172.16.1.40"], c: "cyan" },
        ]}
        links={["1 question", "2 step 3: zone matches", ["3 over the VPN", "src 35.199.192.0/19"], "4 to the server"]}
        reply="answer 172.16.1.40 returns the same way"
        block={what === "fw" ? 2 : undefined}
        replyBlock={what === "route" ? 2 : undefined}
        ok={what === "normal"}
        result={
          what === "fw"
            ? "SERVFAIL after a timeout: the office firewall dropped the question"
            : what === "route"
              ? "Lost: the reply left the office the wrong way, so Cloud DNS never got it"
              : "Answer: 172.16.1.40, from the office DNS server"
        }
      />
    );
  }
  if (c.k === "D") {
    return (
      <Chain
        nodes={[
          { t: "office PC", s: ["asks", "db.kade.internal"], c: "cyan" },
          { t: "office DNS", s: ["172.16.1.53", "forwards", "kade.internal", "→ 10.10.1.2"], c: "cyan" },
          { t: "inbound entry", s: ["10.10.1.2 in sn-app", "created by the", "inbound policy"], c: what === "nopol" ? "red" : "purple" },
          { t: "Cloud DNS", s: ["kade-vpc's order", "(section 04)"], c: "purple" },
          { t: "private zone", s: ["kade-internal", "db → 10.10.2.5"], c: "blue" },
        ]}
        links={["1 question", "2 over the VPN", "3 resolve", "4 step 3 matches"]}
        reply="answer 10.10.2.5 returns to the office PC"
        block={what === "nopol" ? 1 : undefined}
        ok={what !== "nopol"}
        result={
          what === "nopol"
            ? "No answer: without an inbound policy, kade-vpc has no address the office can ask"
            : "Answer: 10.10.2.5, from the private zone kade-internal"
        }
      />
    );
  }
  if (c.k === "E") {
    return (
      <Chain
        nodes={[
          { t: "staging VM", s: ["in kade-staging", "asks db.kade.internal"], c: "blue" },
          { t: "metadata server", s: ["staging's network"], c: "purple" },
          { t: "peering zone", s: ["kade.internal", "target: kade-vpc"], c: "orange" },
          { t: "kade-vpc's order", s: ["private zones,", "internal DNS…"], c: "purple" },
          { t: "private zone", s: ["kade-internal", "db → 10.10.2.5"], c: "blue" },
        ]}
        links={["1 question", "2 step 3 matches", "3 hand over", "4 answer here"]}
        reply="answer 10.10.2.5"
        ok
        result="Answer: 10.10.2.5 · reaching it still needs a network path (chapter 14)"
      />
    );
  }
  return (
    <Chain
      nodes={[
        { t: "kade-worker", s: ["asks", "storage.googleapis.com"], c: "blue" },
        { t: "metadata server", s: ["169.254.169.254"], c: "purple" },
        { t: "response policy", s: ["*.googleapis.com", "→ private.googleapis.com"], c: "orange" },
        { t: "answer", s: ["199.36.153.8", "… 199.36.153.11"], c: "green" },
        { t: "Google APIs", s: ["reached by your", "own route (ch 9)"], c: "purple" },
      ]}
      links={["1 question", "2 step 2 matches", "3 local answer", "4 then connect"]}
      reply="storage traffic goes to the private API addresses"
      ok
      result="Answer: 199.36.153.8-11 (private.googleapis.com) instead of the public addresses"
    />
  );
}

/** DNS across the VPN and between VPCs: forwarding, inbound, peering, response policy. */
export function DnsHybrid() {
  return <CaseExplorer label="DNS across networks" cases={HYBRID_CASES} render={hybridDrawing} />;
}

// ── Chapter 9 ──────────────────────────────────────────────────────────────

/** Three ways to reach Google privately, side by side. */
export function PrivOverview() {
  return (
    <WidgetFrame wide label="Three ways to reach Google privately">
      <Drawing h={384} label="Private Google Access, private services access peering, and Private Service Connect from kade-vpc">
        <Zone x={16} y={12} w={470} h={356} c="blue" />
        <T x={32} y={36}>kade-vpc · no external IPs anywhere</T>
        <Box x={40} y={60} w={190} h={74} c="blue" />
        <T x={54} y={88} k="t" size={13}>kade-worker</T>
        <T x={54} y={108} size={11}>sn-app · 10.10.1.20</T>
        <Box x={40} y={170} w={190} h={74} c="blue" />
        <T x={54} y={198} k="t" size={13}>kade-api (Cloud Run)</T>
        <T x={54} y={218} size={11}>egress via sn-run</T>
        <rect className="n plum dash" x={266} y={150} width={200} height={110} rx="2" />
        <T x={280} y={174} bold size={12}>kade-psa-range</T>
        <T x={280} y={192} size={11.5}>10.10.32.0/20</T>
        <T x={280} y={212} k="f" size={11}>handed to Google</T>
        <Box x={266} y={290} w={200} h={60} c="orange" />
        <T x={280} y={316} k="t" size={12.5}>PSC endpoint</T>
        <T x={280} y={336} size={11}>an IP you choose</T>
        <Box x={600} y={40} w={344} h={92} c="purple" />
        <T x={616} y={68} k="t">Google APIs</T>
        <T x={616} y={90} size={11.5}>Cloud Storage, Secret Manager,</T>
        <T x={616} y={108} size={11.5}>Logging, Artifact Registry…</T>
        <Zone x={600} y={160} w={344} h={110} c="purple" />
        <T x={616} y={184} size={12}>Google&apos;s service network (hidden)</T>
        <Box x={616} y={198} w={312} h={56} c="green" />
        <T x={630} y={222} k="t" size={13}>Cloud SQL kade-sql</T>
        <T x={630} y={242} size={11.5}>private IP 10.10.32.3</T>
        <Box x={600} y={294} w={344} h={60} />
        <T x={616} y={320} k="t" size={13}>another company&apos;s service</T>
        <T x={616} y={340} size={11.5}>published with PSC</T>
        <path className="w plum" d="M230 96 C 400 96, 450 86, 597 86" markerEnd="url(#dd-ah-plum)" />
        <T x={262} y={82} bold>1 · Private Google Access</T>
        <path className="w green" d="M230 207 C 245 207, 250 205, 263 205" markerEnd="url(#dd-ah-green)" />
        <line className="w green" x1={466} y1={225} x2={613} y2={225} strokeWidth={4} />
        <T x={500} y={214} bold>2 · PSA peering</T>
        <path className="w amber" d="M466 320 C 520 320, 540 324, 597 324" markerEnd="url(#dd-ah-amber)" />
        <T x={504} y={312} bold>3 · PSC</T>
      </Drawing>
      <WidgetNote>
        Three different shapes: a setting that lets traffic reach Google&apos;s APIs, a peering that joins Google&apos;s service network to yours, and an endpoint
        address that forwards to a service.
      </WidgetNote>
    </WidgetFrame>
  );
}

const PGA_CASES: Case[] = [
  {
    k: "Default domains",
    t: "Kadé's choice",
    what: [
      ["normal", "Normal"],
      ["off", "What if PGA is off?"],
      ["noroute", "What if the default route is deleted?"],
      ["extip", "What if the VM has an external IP?"],
    ],
    take: {
      normal:
        "DNS is untouched: <code>storage.googleapis.com</code> resolves to a normal Google address. The default route sends it towards the internet gateway, and because the subnet has PGA on, Google accepts it from a VM with no external IP and keeps it on its own network.",
      off: "With PGA off, a VM with no external IP has no way to use the internet gateway, so the call fails. This is what happens if you remove external IPs <b>before</b> turning PGA on.",
      noroute:
        "With no route to the internet gateway, the packet has nowhere to go (chapter 4 section 08). Default domains need the default route. A network without one uses <code>private.googleapis.com</code> with a specific route (next tab).",
      extip:
        "A VM with an external IP reaches Google APIs through it, like any internet traffic. PGA is not used at all, which is fine, but the VM is also reachable from the internet.",
    },
    cfg: "sn-app: privateIpGoogleAccess = true\nkade-vpc route: 0.0.0.0/0 → default-internet-gateway (priority 1000)\nDNS: unchanged\n\nkade-worker → storage.googleapis.com → Google address → default route → Google network → Cloud Storage",
  },
  {
    k: "private.googleapis.com",
    what: [
      ["normal", "Normal"],
      ["nodns", "What if the DNS change is missing?"],
    ],
    take: {
      normal:
        "A private zone or response policy (chapter 8, tab F) answers <code>*.googleapis.com</code> with <code>199.36.153.8/30</code>. Those addresses are only reachable from inside Google, so a route for just that range is enough, and the network can have <b>no default route at all</b>.",
      nodns:
        "Without the DNS change, the name resolves to Google's normal addresses, which need the default route this network does not have. The call fails even though PGA is on and the specific route exists.",
    },
    cfg: "Response policy: *.googleapis.com → CNAME private.googleapis.com\nprivate.googleapis.com → A 199.36.153.8, .9, .10, .11\nRoute: 199.36.153.8/30 → default-internet-gateway (no 0.0.0.0/0 route)\nsn-app: privateIpGoogleAccess = true",
  },
  {
    k: "restricted.googleapis.com",
    take: "The same pattern with <code>199.36.153.4/30</code>, but only APIs that support <b>VPC Service Controls</b> answer there. Used inside a service perimeter, so data cannot be copied to a project outside it (chapter 17). Kadé does not use it yet.",
    cfg: "Response policy: *.googleapis.com → CNAME restricted.googleapis.com\nrestricted.googleapis.com → A 199.36.153.4, .5, .6, .7\nRoute: 199.36.153.4/30 → default-internet-gateway",
  },
];

const PGA_LINKS = ["1 resolve", "2 pick a route", "3 send", "4 deliver"];

function pgaDrawing(c: Case, t: string) {
  if (c.k === "Default domains") {
    const block = t === "off" ? 3 : t === "noroute" ? 2 : undefined;
    return (
      <Chain
        nodes={[
          {
            t: "kade-worker",
            s: ["sn-app", t === "extip" ? "external IP" : "no external IP", t === "extip" ? "34.87.130.9" : `PGA: ${t === "off" ? "OFF" : "on"}`],
            c: t === "off" ? "red" : "blue",
          },
          { t: "DNS", s: ["storage.googleapis", ".com → a public", "Google address"], c: "purple" },
          {
            t: "route",
            s: t === "noroute" ? ["no 0.0.0.0/0", "route: nowhere", "to send it"] : ["0.0.0.0/0 →", "default-internet", "-gateway"],
            c: t === "noroute" ? "red" : "blue",
          },
          {
            t: "internet gateway",
            s: t === "extip" ? ["leaves as", "34.87.130.9", "(1:1 NAT)"] : ["no external IP,", t === "off" ? "PGA off:" : "PGA on:", t === "off" ? "refused" : "allowed"],
            c: t === "off" ? "red" : "purple",
          },
          { t: "Cloud Storage", s: ["kept on Google's", "network"], c: "green" },
        ]}
        links={PGA_LINKS}
        block={block}
        ok={block === undefined && t !== "extip"}
        warn={t === "extip"}
        result={
          t === "off"
            ? "Fails: PGA is off and the VM has no external IP"
            : t === "noroute"
              ? "Fails: no route to the internet gateway"
              : t === "extip"
                ? "Works, through the external IP; PGA is not used"
                : "Works: Cloud Storage reached with no external IP"
        }
      />
    );
  }
  if (c.k === "private.googleapis.com") {
    const nodns = t === "nodns";
    return (
      <Chain
        nodes={[
          { t: "kade-worker", s: ["no external IP", "PGA on"], c: "blue" },
          { t: "DNS", s: nodns ? ["no override:", "a public", "Google address"] : ["response policy", "→ 199.36.153", ".8 - .11"], c: nodns ? "red" : "orange" },
          {
            t: "route",
            s: nodns ? ["no route for", "that address", "(no 0.0.0.0/0)"] : ["199.36.153.8/30", "→ default-", "internet-gateway"],
            c: nodns ? "red" : "blue",
          },
          { t: "Google front door", s: ["private.googleapis", ".com"], c: "purple" },
          { t: "Google APIs", s: ["most APIs"], c: "green" },
        ]}
        links={PGA_LINKS}
        block={nodns ? 2 : undefined}
        ok={!nodns}
        result={nodns ? "Fails: the name resolved to an address with no route" : "Works with no default route at all"}
      />
    );
  }
  return (
    <Chain
      nodes={[
        { t: "kade-worker", s: ["inside a VPC-SC", "perimeter"], c: "blue" },
        { t: "DNS", s: ["response policy", "→ 199.36.153", ".4 - .7"], c: "orange" },
        { t: "route", s: ["199.36.153.4/30", "→ default-", "internet-gateway"], c: "blue" },
        { t: "Google front door", s: ["restricted", ".googleapis.com"], c: "purple" },
        { t: "Google APIs", s: ["only VPC-SC", "supported ones"], c: "green" },
      ]}
      links={PGA_LINKS}
      ok
      result="Works for supported APIs; unsupported APIs are not reachable"
    />
  );
}

/** Private Google Access: default domains, private and restricted VIPs. */
export function PgaEx() {
  return <CaseExplorer label="Private Google Access examples" cases={PGA_CASES} render={pgaDrawing} />;
}

const PSA_CASES: Case[] = [
  {
    k: "A",
    t: "The peering",
    take: "kade-vpc and Google's service network are joined by one VPC peering. Everything in kade-vpc that reaches <code>10.10.32.0/20</code> crosses it: kade-worker in sn-app and Cloud Run through sn-run. Nothing goes near the internet, and there is no authorized networks list to maintain.",
    cfg: "kade-psa-range: 10.10.32.0/20, purpose VPC_PEERING\npeering: kade-vpc ⇄ servicenetworking-googleapis-com\nkade-sql: private IP 10.10.32.3\n\nkade-worker (10.10.1.20) → 10.10.32.3:5432   ✓\nkade-api via sn-run     → 10.10.32.3:5432   ✓",
  },
  {
    k: "B",
    t: "Not transitive: kade-staging",
    what: [
      ["normal", "kade-staging peered to kade-vpc"],
      ["psc", "What if kade-staging uses a PSC endpoint?"],
    ],
    take: {
      normal:
        "kade-staging is peered with kade-vpc (chapter 14), and kade-vpc is peered with Google's service network. Peering does not chain, so routes to <code>10.10.32.0/20</code> never reach kade-staging. <b>No firewall rule can fix this</b>: there is simply no route.",
      psc: "A Private Service Connect endpoint in kade-staging (section 04, tab C) gives it its own address for the database. No peering chain is involved, so it works. Usually staging just gets its own small Cloud SQL instance instead.",
    },
    cfg: "kade-staging ⇄ kade-vpc ⇄ Google service network\nstaging VM → 10.10.32.3   ✘ no route (peering is not transitive)",
  },
  {
    k: "C",
    t: "The office over VPN",
    what: [
      ["normal", "Default settings"],
      ["fix", "What if routes are exported and advertised?"],
    ],
    take: {
      normal:
        "Two routes are missing. The office does not know that <code>10.10.32.0/20</code> is behind the VPN, and Google's service network does not know that <code>172.16.0.0/16</code> is behind kade-vpc, because peering only shares subnet routes by default. The question and the reply both get lost.",
      fix: "Two settings fix it. The VPN's Cloud Router advertises <code>10.10.32.0/20</code> to the office (chapter 15), and the peering <b>exports custom routes</b>, so Google's network learns the route back to the office (command 9). Unlike kade-staging, this works, because the office is reached through kade-vpc's own routes, not through another peering.",
    },
    cfg: "Office (172.16.0.0/16) ⇄ HA VPN ⇄ kade-vpc ⇄ Google service network\n\nNeeded:\n  Cloud Router: advertise 10.10.32.0/20 to the office\n  peering servicenetworking-googleapis-com: --export-custom-routes",
  },
];

function PsaDrawing({ c, what }: { c: Case; what: string }) {
  const staging = c.k === "B";
  const office = c.k === "C";
  let result: [boolean, string];
  let path: ReactNode;
  if (c.k === "A") {
    result = [true, "kade-worker and Cloud Run reach 10.10.32.3 over the peering"];
    path = (
      <>
        <path className="w green" d="M614 89 C 660 89, 680 150, 713 155" markerEnd="url(#dd-ah-green)" />
        <path className="w green" d="M614 159 C 650 159, 680 165, 713 167" markerEnd="url(#dd-ah-green)" />
      </>
    );
  } else if (staging && what === "psc") {
    result = [true, "Works: kade-staging uses its own PSC endpoint, no peering chain"];
    path = (
      <>
        <path className="w green" d="M256 120 C 450 340, 650 340, 760 207" markerEnd="url(#dd-ah-green)" />
        <T x={470} y={384} k="s mid" bold size={11.5}>PSC endpoint 10.20.2.50 in kade-staging → kade-sql</T>
      </>
    );
  } else if (staging) {
    result = [false, "Fails: no route, and no firewall rule can change that"];
    path = (
      <>
        <path className="w fault dash" d="M256 120 C 330 120, 560 240, 632 200" markerEnd="url(#dd-ah-fault)" />
        <Mark cx={640} cy={196} ok={false} />
        <T x={470} y={384} k="s mid c-red" size={11.5}>no route to 10.10.32.0/20: peering does not chain</T>
      </>
    );
  } else if (what === "fix") {
    result = [true, "Works: both directions now have a route"];
    path = (
      <>
        <path className="w green" d="M256 280 C 420 366, 660 366, 770 207" markerEnd="url(#dd-ah-green)" />
        <T x={470} y={384} k="s mid" bold size={11.5}>route out advertised by Cloud Router · route back exported on the peering</T>
      </>
    );
  } else {
    result = [false, "Fails: routes are missing in both directions"];
    path = (
      <>
        <path className="w fault dash" d="M256 280 C 420 366, 660 366, 770 207" markerEnd="url(#dd-ah-fault)" />
        <Mark cx={690} cy={330} ok={false} />
        <T x={470} y={384} k="s mid c-red" size={11.5}>office has no route to 10.10.32.0/20 · Google has no route back to 172.16.0.0/16</T>
      </>
    );
  }
  return (
    <div className="space-y-3">
      <Drawing h={396} label="kade-vpc peered with Google's service network, with kade-staging and the office beside it">
        <Zone x={300} y={20} w={330} h={300} c="blue" />
        <T x={316} y={44}>kade-vpc</T>
        <Box x={316} y={60} w={298} h={58} c="blue" />
        <T x={330} y={84} k="t" size={12.5}>kade-worker</T>
        <T x={330} y={104} size={11}>sn-app · 10.10.1.20</T>
        <Box x={316} y={130} w={298} h={58} c="blue" />
        <T x={330} y={154} k="t" size={12.5}>Cloud Run kade-api</T>
        <T x={330} y={174} size={11}>via sn-run 10.10.3.0/24</T>
        <rect className="n plum dash" x={316} y={204} width={298} height={98} rx="2" />
        <T x={330} y={228} bold size={12}>kade-psa-range 10.10.32.0/20</T>
        <T x={330} y={248} k="f" size={11}>routes learned over the peering</T>
        <T x={330} y={268} k="f" size={11}>{office && what === "fix" ? "+ exports VPN routes to Google" : "shares subnet routes only"}</T>
        <Zone x={700} y={20} w={244} h={300} c="purple" />
        <T x={716} y={44} size={12}>Google&apos;s service network</T>
        <Box x={716} y={130} w={212} h={74} c="green" />
        <T x={730} y={158} k="t" size={13}>kade-sql</T>
        <T x={730} y={180} size={11.5}>10.10.32.3:5432</T>
        <line className="w plum" x1={630} y1={166} x2={700} y2={166} strokeWidth={5} />
        <T x={665} y={154} k="s mid" size={11}>peering</T>
        <g className={staging ? undefined : "off"}>
          <Box x={16} y={40} w={240} h={104} />
          <T x={30} y={66} k="t" size={12.5}>kade-staging VPC</T>
          <T x={30} y={86} size={11}>10.20.0.0/16</T>
          <T x={30} y={106} k="f" size={11}>peered to kade-vpc (ch 14)</T>
          <line className="w" x1={256} y1={92} x2={300} y2={92} strokeWidth={5} />
        </g>
        <g className={office ? undefined : "off"}>
          <Box x={16} y={200} w={240} h={104} />
          <T x={30} y={226} k="t" size={12.5}>Kadé office</T>
          <T x={30} y={246} size={11}>172.16.0.0/16</T>
          <T x={30} y={266} k="f" size={11}>HA VPN to kade-vpc (ch 15)</T>
          <line className="w dash" x1={256} y1={252} x2={300} y2={252} strokeWidth={3} />
        </g>
        {path}
      </Drawing>
      <Result tone={result[0] ? "ok" : "fault"}>
        <b>{result[1]}</b>
      </Result>
    </div>
  );
}

/** Private services access: one peering, and who it does not reach. */
export function PsaEx() {
  return <CaseExplorer label="Private services access examples" cases={PSA_CASES} render={(c, what) => <PsaDrawing c={c} what={what} />} />;
}

const PSC_CASES: Case[] = [
  {
    k: "Google APIs endpoint",
    take: "The endpoint <code>kadeapis</code> is a global internal IP that you pick, outside every subnet (<code>10.10.200.2</code>, from the reserve in chapter 0). It forwards to Google APIs. GCP also creates DNS names like <code>storage-kadeapis.p.googleapis.com</code>, or you point <code>*.googleapis.com</code> at it with a private zone. Because it is your own address, you can write firewall rules and read logs for exactly this traffic.",
    cfg: "gcloud compute addresses create kadeapis-ip --global --purpose=PRIVATE_SERVICE_CONNECT \\\n  --addresses=10.10.200.2 --network=kade-vpc\ngcloud compute forwarding-rules create kadeapis --global --network=kade-vpc \\\n  --address=kadeapis-ip --target-google-apis-bundle=all-apis",
  },
  {
    k: "A published service",
    take: "A vendor publishes their service behind a <b>service attachment</b>. You create an endpoint in your own subnet that points at it. Your VMs talk to <code>10.10.1.50</code>; the vendor sees traffic arrive from addresses in their own PSC subnet (purpose <code>PRIVATE_SERVICE_CONNECT</code>, chapter 2). There is no peering and nothing on either side faces the internet.",
    cfg: "Vendor: service attachment projects/vendor/regions/asia-southeast1/serviceAttachments/metrics\nKadé:   endpoint 10.10.1.50 in sn-app → that service attachment",
  },
  {
    k: "Cloud SQL from many VPCs",
    take: "With PSC, Cloud SQL exposes a service attachment instead of joining a peering. Each VPC that needs the database creates its own endpoint, so kade-vpc and kade-staging can both reach one instance. Compare section 03, tab B, where peering made this impossible. Whether an instance uses PSA or PSC is decided per instance.",
    cfg: "kade-sql: PSC enabled, allowed consumer projects kade-prod, kade-staging\nkade-vpc endpoint:     10.10.2.50 → kade-sql service attachment\nkade-staging endpoint: 10.20.2.50 → kade-sql service attachment",
  },
];

function PscDrawing({ c }: { c: Case }) {
  if (c.k === "Google APIs endpoint") {
    return (
      <div className="space-y-3">
        <Drawing h={290} label="A Private Service Connect endpoint for Google APIs inside kade-vpc">
          <Zone x={16} y={20} w={520} h={250} c="blue" />
          <T x={32} y={44}>kade-vpc</T>
          <Box x={40} y={64} w={200} h={70} c="blue" />
          <T x={54} y={92} k="t" size={13}>kade-worker</T>
          <T x={54} y={112} size={11}>10.10.1.20</T>
          <Box x={300} y={140} w={210} h={104} c="orange" />
          <T x={316} y={166} k="t" size={13}>endpoint kadeapis</T>
          <T x={316} y={188} size={11.5}>10.10.200.2</T>
          <T x={316} y={208} k="f" size={11}>global, outside all subnets</T>
          <T x={316} y={226} k="f" size={11}>bundle: all-apis</T>
          <path className="w amber" d="M240 99 C 290 99, 280 180, 297 180" markerEnd="url(#dd-ah-amber)" />
          <T x={60} y={170} size={11}>storage-kadeapis.p</T>
          <T x={60} y={188} size={11}>.googleapis.com</T>
          <T x={60} y={206} size={11}>→ 10.10.200.2</T>
          <Box x={640} y={120} w={304} h={104} c="purple" />
          <T x={656} y={148} k="t">Google APIs</T>
          <T x={656} y={170} size={11.5}>Cloud Storage, Secret Manager…</T>
          <T x={656} y={190} k="f" size={11}>reached on your own address</T>
          <Wire x1={510} y1={192} x2={637} y2={172} c="orange" />
        </Drawing>
        <Result tone="ok">
          <b>Your own private address for Google APIs, with its own firewall rules and logs</b>
        </Result>
      </div>
    );
  }
  if (c.k === "A published service") {
    return (
      <div className="space-y-3">
        <Drawing h={290} label="A Private Service Connect endpoint in kade-vpc pointing at a vendor's service attachment">
          <Zone x={16} y={20} w={400} h={250} c="blue" />
          <T x={32} y={44}>kade-vpc (consumer)</T>
          <Box x={40} y={64} w={170} h={70} c="blue" />
          <T x={54} y={92} k="t" size={13}>kade-worker</T>
          <T x={54} y={112} size={11}>10.10.1.20</T>
          <Box x={230} y={140} w={170} h={104} c="orange" />
          <T x={244} y={166} k="t" size={13}>PSC endpoint</T>
          <T x={244} y={188} size={11.5}>10.10.1.50</T>
          <T x={244} y={208} k="f" size={11}>in sn-app</T>
          <path className="w amber" d="M210 99 C 240 99, 220 170, 227 180" markerEnd="url(#dd-ah-amber)" />
          <Zone x={544} y={20} w={400} h={250} />
          <T x={560} y={44}>vendor&apos;s VPC (producer)</T>
          <Box x={568} y={140} w={170} h={104} c="purple" />
          <T x={582} y={166} k="t" size={13}>service</T>
          <T x={582} y={188} k="t" size={13}>attachment</T>
          <T x={582} y={212} k="f" size={11}>PSC NAT subnet</T>
          <Box x={760} y={64} w={160} h={70} />
          <T x={774} y={92} k="t" size={12}>metrics service</T>
          <T x={774} y={112} k="f" size={11}>behind an ILB</T>
          <Wire x1={400} y1={192} x2={565} y2={192} c="orange" />
          <T x={482} y={180} k="s mid" size={11}>no peering</T>
          <path className="w amber" d="M738 180 C 780 180, 800 160, 820 137" markerEnd="url(#dd-ah-amber)" />
        </Drawing>
        <Result tone="ok">
          <b>Private on both sides: neither network is exposed, and nothing is peered</b>
        </Result>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <Drawing h={326} label="Two VPCs, each with its own endpoint, reaching one Cloud SQL instance">
        <Zone x={16} y={20} w={300} h={130} c="blue" />
        <T x={32} y={44}>kade-vpc</T>
        <Box x={40} y={60} w={252} h={70} c="orange" />
        <T x={54} y={88} k="t" size={12.5}>endpoint 10.10.2.50</T>
        <T x={54} y={108} k="f" size={11}>in sn-data</T>
        <Zone x={16} y={180} w={300} h={130} />
        <T x={32} y={204}>kade-staging VPC</T>
        <Box x={40} y={220} w={252} h={70} c="orange" />
        <T x={54} y={248} k="t" size={12.5}>endpoint 10.20.2.50</T>
        <T x={54} y={268} k="f" size={11}>its own subnet</T>
        <Zone x={600} y={80} w={344} h={170} c="purple" />
        <T x={616} y={104} size={12}>Google&apos;s network</T>
        <Box x={624} y={120} w={296} h={58} c="purple" />
        <T x={638} y={146} k="t" size={12.5}>kade-sql service attachment</T>
        <T x={638} y={164} k="f" size={11}>allowed: kade-prod, kade-staging</T>
        <Box x={624} y={186} w={296} h={50} c="green" />
        <T x={638} y={216} k="t" size={12.5}>Cloud SQL kade-sql</T>
        <path className="w green" d="M292 95 C 450 95, 500 140, 621 145" markerEnd="url(#dd-ah-green)" />
        <path className="w green" d="M292 255 C 450 255, 500 160, 621 155" markerEnd="url(#dd-ah-green)" />
      </Drawing>
      <Result tone="ok">
        <b>Both VPCs reach one Cloud SQL instance, each through its own endpoint</b>
      </Result>
    </div>
  );
}

/** Private Service Connect: your own address for a service. */
export function PscEx() {
  return <CaseExplorer label="Private Service Connect examples" cases={PSC_CASES} render={(c) => <PscDrawing c={c} />} />;
}

/** The order of the move from kade-db to Cloud SQL. */
export function SqlCutover() {
  return (
    <WidgetFrame label="Moving kade-db to Cloud SQL, step by step">
      <Runbook
        phases={[
          [
            "Before the day",
            [
              ["1", "Range + connection", "Allocate kade-psa-range, create the private connection (command 7)", "commands 2-3 show the range"],
              ["2", "Create kade-sql", "Private IP only, ENCRYPTED_ONLY, regional HA (command 8)", "command 4: no public IP"],
              ["3", "Copy the data", "Database Migration Service, or dump and restore in a quiet hour", "row counts match on both"],
              ["4", "Lower the TTL", "db.kade.internal TTL 300 → 30, a day before (chapter 8)", "dig shows TTL 30"],
            ],
          ],
          [
            "Cutover",
            [
              ["5", "Short write freeze", "Stop writes to kade-db, final sync to kade-sql", "no new rows on kade-db"],
              ["6", "Flip the name", "db.kade.internal → 10.10.32.3, recycle app connection pools", "new connections reach kade-sql"],
            ],
          ],
          [
            "After",
            [
              ["7", "Watch", "Errors, latency, Cloud SQL connections; kade-db kept stopped, not deleted", "a few days with no issues"],
              ["8", "Clean up", "Delete kade-db, kade-db-ip, kade-api-to-db, kade-run-to-db; TTL back to 300", "firewall list has no db rules"],
            ],
          ],
        ]}
      />
      <WidgetNote>
        Steps 1 to 4 change nothing for shoppers. The only moment of risk is steps 5 and 6, and the way back is to point the name at 10.10.2.5 again:
        kade-db is stopped, not deleted, until step 8.
      </WidgetNote>
    </WidgetFrame>
  );
}

// ── Chapter 10 ─────────────────────────────────────────────────────────────

/** Cloud Run's ingress and egress settings, and which paths they open. */
export function RunPaths() {
  const [ing, setIng] = useState("all");
  const [eg, setEg] = useState("none");
  const [nat, setNat] = useState("yes");
  const paths: [string, "in" | "out", boolean, string][] = [
    [
      "Shopper through the load balancer",
      "in",
      ing !== "internal",
      ing === "internal" ? "Blocked: internal ingress does not accept load balancer traffic" : "Reaches kade-api through the load balancer and Cloud Armor",
    ],
    [
      "Anyone at the run.app address",
      "in",
      ing !== "all",
      ing === "all" ? "Reaches kade-api directly, skipping the load balancer and Cloud Armor (the trap)" : "Blocked by ingress (404)",
    ],
    ["kade-worker, from inside kade-vpc", "in", true, "Reaches kade-api: counts as internal under every setting"],
    [
      "kade-api → kade-db 10.10.2.5:5432",
      "out",
      eg !== "none",
      eg === "none" ? "Fails: kade-api is not in the VPC, and 10.10.2.5 exists only there" : "Enters kade-vpc from sn-run; allowed by kade-run-to-db",
    ],
    [
      "kade-api → PayGate (allows only 34.87.200.7)",
      "out",
      eg === "all" && nat === "yes",
      eg === "none" || eg === "priv"
        ? "Leaves from a random Google IP; PayGate refuses it"
        : nat === "no"
          ? "Enters the VPC but no NAT covers sn-run, so it cannot get out"
          : "Leaves through Cloud NAT as 34.87.200.7; PayGate accepts it",
    ],
    [
      "kade-api → Cloud Storage API",
      "out",
      true,
      eg === "all"
        ? `Through the VPC, handled by Private Google Access (on for sn-run because the NAT covers it)${nat === "no" ? "; without the NAT, turn Private Google Access on for sn-run yourself" : ""}`
        : "Directly from Google's serverless network",
    ],
  ];
  const bad = paths.filter((p) => !p[2]).length;
  const hardened = ing === "ilb" && eg === "all" && nat === "yes";
  return (
    <WidgetFrame label="Cloud Run ingress and egress">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Select
          label="Ingress"
          value={ing}
          onChange={setIng}
          options={[
            { value: "all", label: "all" },
            { value: "internal", label: "internal" },
            { value: "ilb", label: "internal-and-cloud-load-balancing" },
          ]}
        />
        <Select
          label="Egress"
          value={eg}
          onChange={setEg}
          options={[
            { value: "none", label: "not connected to the VPC" },
            { value: "priv", label: "Direct VPC egress, private-ranges-only" },
            { value: "all", label: "Direct VPC egress, all-traffic" },
          ]}
        />
        <Select
          label="Cloud NAT covers sn-run"
          value={nat}
          onChange={setNat}
          options={[
            { value: "yes", label: "yes" },
            { value: "no", label: "no" },
          ]}
        />
      </div>
      <div aria-live="polite" className="mt-5 space-y-4">
        <Result tone={hardened ? "ok" : bad ? "fault" : "warn"}>
          <b>{hardened ? "This is the hardened production shape: every path below works as Kadé needs." : `${bad} of ${paths.length} paths are not what Kadé needs.`}</b>
        </Result>
        <Table
          head={["", "Path", "What happens"]}
          minWidth={600}
          rows={paths.map(([path, dir, ok, why]) => [
            <span key="d" className="text-ink-muted font-mono text-[13px]">
              {dir === "in" ? "ingress" : "egress"}
            </span>,
            path,
            <span key="w" className={cn(!ok && "text-fault font-semibold")}>
              {why}
            </span>,
          ])}
        />
      </div>
    </WidgetFrame>
  );
}
