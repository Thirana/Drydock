"use client";

import { useState, type ReactNode } from "react";
import { ipToInt, maskOf } from "@/lib/net/ipv4";
import { cn } from "@/lib/utils";
import { Choices, Select, Steps } from "../ui";
import { WidgetFrame } from "../widget-frame";
import { CaseExplorer, Result, type Case, type Tone } from "./case-explorer";
import { Box, Caps, Drawing, Mark, T, Wire, Zone } from "./draw";
import { Table } from "./kit";

/* Part 2 · Controlling access (chapters 5.1-6.2). */

// ── Chapter 5.1: stateful firewall ────────────────────────────────────────

type Actor = { x: number; t: string; s: string; c: string };
type Check = { lane: number; ok: boolean; table?: boolean; left?: boolean; text: string[] };
type Msg = { from: number; to: number; label: string; c?: string; skip?: boolean; block?: number; checks?: Check[] };

/** Actors across the top, messages down the page, the host's checks on each. */
function LaneDrawing({
  actors,
  msgs,
  table,
  rules,
  label,
}: {
  actors: Actor[];
  msgs: Msg[];
  table?: { x: number; rows: string[][] };
  rules?: [string, string][];
  label: string;
}) {
  const top = 66;
  const heights = msgs.map((m) => (m.skip ? 54 : 36 + 18 * Math.max(1, ...(m.checks ?? []).map((c) => c.text.length)) + 30));
  const rows = heights.map((_, i) => 104 + heights.slice(0, i).reduce((a, b) => a + b, 0));
  const rulesTop = 104 + heights.reduce((a, b) => a + b, 0);
  const end = rulesTop - 20;
  const y = rules ? rulesTop + 20 + 40 * rules.length : rulesTop;
  return (
    <Drawing h={y + 8} label={label}>
      {actors.map((a) => (
        <g key={a.t}>
          <Box x={a.x - 100} y={8} w={200} h={58} c={a.c} />
          <T x={a.x - 86} y={33} k="t">{a.t}</T>
          <T x={a.x - 86} y={53}>{a.s}</T>
          <line className="w dash" x1={a.x} y1={top} x2={a.x} y2={end} opacity={0.6} />
        </g>
      ))}
      {msgs.map((m, i) => {
        const my = rows[i];
        const x1 = actors[m.from].x;
        const x2 = actors[m.to].x;
        const dir = x2 > x1 ? 1 : -1;
        if (m.skip) {
          return (
            <T key={i} x={Math.min(x1, x2) + 20} y={my + 4} k="f" size={12}>
              {`${i + 1}. ${m.label} - never happens`}
            </T>
          );
        }
        const stop = m.block !== undefined ? actors[m.block].x : x2;
        return (
          <g key={i}>
            <Wire x1={x1} y1={my} x2={stop - dir * (m.block !== undefined ? 14 : 4)} y2={my} c={m.block !== undefined ? "red" : (m.c ?? "blue")} />
            <T x={x1 + 16 * dir} y={my - 14} bold end={dir < 0}>
              {`${i + 1}. ${m.label}`}
            </T>
            {(m.checks ?? []).map((c, j) => {
              const cx = actors[c.lane].x;
              return (
                <g key={j}>
                  <Mark cx={cx} cy={my} ok={c.ok} />
                  {c.text.map((line, n) => (
                    <T key={n} x={cx + (c.left ? -18 : 18)} y={my + 30 + 18 * n} k={c.ok ? "s halo" : "s c-red halo"} end={c.left}>
                      {line}
                    </T>
                  ))}
                </g>
              );
            })}
          </g>
        );
      })}
      {table && (
        <g>
          <Box x={table.x} y={top + 8} w={944 - table.x} h={46 + 62 * Math.max(1, table.rows.length)} />
          <Caps x={table.x + 14} y={top + 30}>CONNECTION TABLE (on the host)</Caps>
          {table.rows.length === 0 && (
            <T x={table.x + 14} y={top + 62} k="f">
              empty
            </T>
          )}
          {table.rows.map((row, r) =>
            row.map((line, n) => (
              <T key={`${r}${n}`} x={table.x + 14} y={top + 60 + 62 * r + 18 * n} k={n < 2 ? "s" : "f"} size={n < 2 ? 12 : 11}>
                {line}
              </T>
            )),
          )}
        </g>
      )}
      {rules && (
        <g>
          <Caps x={16} y={rulesTop}>RULES ON kade-api-1</Caps>
          {rules.map(([text, c], i) => (
            <g key={text}>
              <Box x={16} y={rulesTop + 12 + 40 * i} w={700} h={32} c={c} />
              <T x={30} y={rulesTop + 33 + 40 * i}>{text}</T>
            </g>
          ))}
        </g>
      )}
    </Drawing>
  );
}

/** Who dialled decides which two of the four checks are used. */
function DialDrawing({ reverse }: { reverse: boolean }) {
  const check = (x: number, y: number, title: string, used: boolean, ok: boolean, note: string) => (
    <g className={used ? undefined : "off"}>
      <Box x={x} y={y} w={186} h={80} c={used ? (ok ? "green" : "red") : undefined} />
      <T x={x + 14} y={y + 26} k="t">{title}</T>
      <T x={x + 14} y={y + 48} k={used ? (ok ? "s" : "s c-red") : "f"}>
        {used ? (ok ? "✓ checked: passes" : "✕ checked: drops") : "not used"}
      </T>
      <T x={x + 14} y={y + 67} k="f" size={10.5}>
        {note}
      </T>
    </g>
  );
  return (
    <Drawing h={reverse ? 320 : 296} label="Four firewall checks between kade-api-1 and kade-db; only two are used per connection">
      <Box x={16} y={120} w={160} h={80} c="blue" />
      <T x={30} y={150} k="t">kade-api-1</T>
      <T x={30} y={172}>SA sa-kade-api</T>
      <T x={30} y={190}>10.10.1.10</T>
      <Box x={792} y={120} w={152} h={80} c="green" />
      <T x={806} y={150} k="t">kade-db</T>
      <T x={806} y={172}>SA sa-kade-db</T>
      <T x={806} y={190}>10.10.2.5:5432</T>
      <Caps x={200} y={30}>ON kade-api-1&apos;S HOST</Caps>
      <Caps x={584} y={30}>ON kade-db&apos;S HOST</Caps>
      {reverse ? (
        <>
          {check(200, 50, "A · egress", false, false, "used when A dials out")}
          {check(200, 200, "A · ingress", true, false, "no rule allows sa-kade-db")}
          {check(584, 50, "B · ingress", false, false, "used when someone dials B")}
          {check(584, 200, "B · egress", true, true, "implied allow egress")}
          <path className="w teal" d="M868 200 V240 H773" markerEnd="url(#dd-ah-teal)" />
          <Wire x1={584} y1={240} x2={390} y2={240} c="red" />
          <T x={485} y={228} k="s mid" bold>SYN → 10.10.1.10:8080</T>
          <T x={485} y={306} k="s mid c-red">dropped at A · ingress by the implied deny @65535</T>
        </>
      ) : (
        <>
          {check(200, 50, "A · egress", true, true, "implied allow egress")}
          {check(200, 200, "A · ingress", false, false, "used when someone dials A")}
          {check(584, 50, "B · ingress", true, true, "kade-api-to-db · tcp:5432")}
          {check(584, 200, "B · egress", false, false, "used when B dials out")}
          <path className="w teal" d="M96 120 V90 H197" markerEnd="url(#dd-ah-teal)" />
          <Wire x1={386} y1={90} x2={581} y2={90} c="blue" />
          <T x={485} y={78} k="s mid" bold>SYN → 10.10.2.5:5432</T>
          <path className="w teal" d="M770 90 H868 V117" markerEnd="url(#dd-ah-teal)" />
          <T x={485} y={160} k="f mid" size={11.5}>replies use the connection record:</T>
          <T x={485} y={178} k="f mid" size={11.5}>no rule is checked in either direction</T>
        </>
      )}
    </Drawing>
  );
}

const STATEFUL_ACTORS: Actor[] = [
  { x: 116, t: "Google Front End", s: "35.191.8.20", c: "purple" },
  { x: 360, t: "data plane", s: "kade-api-1's host", c: "orange" },
  { x: 572, t: "kade-api-1", s: "10.10.1.10:8080", c: "blue" },
];

const STATEFUL_CASES: Case[] = [
  {
    k: "A",
    t: "Inbound: no reverse rule needed",
    what: [
      ["normal", "Normal"],
      ["noin", "What if the ingress rule is removed?"],
      ["egr", "What if someone adds an egress rule for replies?"],
    ],
    take: {
      normal:
        "Only message 1 is judged by a rule. It creates an entry in the connection table, and messages 2 and 3 pass <b>because they belong to that connection</b>. No rule is needed for the replies.",
      noin: "Message 1 matches no allow rule, so the implied deny ingress at 65535 drops it. No entry is created, so there is nothing for a reply to belong to: messages 2 and 3 never happen.",
      egr: "Nothing changes. Message 2 already passes because of the connection entry, so the new egress rule is never used for it. It only adds clutter.",
    },
    cfg: "Rule: allow INGRESS tcp:8080 from 35.191.0.0/16 to kade-api-1\n\nGoogle Front End ──▶ SYN      to :8080    ← allowed by the ingress rule\nkade-api-1       ──▶ SYN-ACK  back        ← allowed AUTOMATICALLY\nGoogle Front End ──▶ ACK, request data    ← same connection, allowed",
  },
  {
    k: "B",
    t: "Egress locked down completely",
    take: "The shopper's request still works: its reply (message 2) belongs to a connection that started inbound, so the egress deny is never consulted. Message 3 starts a <b>new outgoing connection</b>, so it is judged by egress rules, and the deny drops it. Egress rules restrict what a VM <b>starts</b>, not how it answers.",
    cfg: "kade-api-1:  egress  deny all to 0.0.0.0/0\n             ingress allow tcp:8080 from Google's ranges\n\nShopper request through the load balancer   ✔  works: kade-api-1 still answers\nkade-api-1 → apt update, PayGate call       ✘  blocked: a new outgoing connection",
  },
  {
    k: "C",
    t: "Who dialled decides which rules matter",
    what: [
      ["normal", "kade-api-1 dials kade-db"],
      ["rev", "What if kade-db dials kade-api-1?"],
    ],
    take: {
      normal:
        "Every host has an egress check and an ingress check, but a connection only uses <b>two of the four</b>: the dialler's egress and the receiver's ingress. Here that is A egress (implied allow) and B ingress (kade-api-to-db). The other two are never consulted, so no rule is needed there.",
      rev: "Reverse the direction and the other two checks are used. kade-db's egress passes (implied allow), but kade-api-1's ingress has no rule that allows traffic from sa-kade-db, so the implied deny drops it. Same two VMs, opposite result, because a different side dialled.",
    },
    cfg: "kade-api-1 ──▶ kade-db on tcp:5432     (kade-api-1 is the client)\n\nNeeded:      kade-api-1 EGRESS allow 5432   +   kade-db INGRESS allow 5432\nNot needed:  kade-db EGRESS rule, kade-api-1 INGRESS rule",
  },
];

function statefulDrawing(c: Case, what: string) {
  if (c.k === "A") {
    const blocked = what === "noin";
    const msgs: Msg[] = blocked
      ? [
          {
            from: 0,
            to: 2,
            label: "SYN to :8080",
            block: 1,
            checks: [{ lane: 1, ok: false, text: ["no allow rule matches", "→ implied deny ingress @65535", "→ dropped, nothing recorded"] }],
          },
          { from: 2, to: 0, label: "SYN-ACK", skip: true },
          { from: 0, to: 2, label: "ACK, request data", skip: true },
        ]
      : [
          {
            from: 0,
            to: 2,
            label: "SYN to :8080",
            checks: [{ lane: 1, ok: true, text: ["INGRESS rule kade-lb-to-api", "allow tcp:8080 from 35.191.0.0/16", "→ connection recorded"] }],
          },
          {
            from: 2,
            to: 0,
            label: "SYN-ACK",
            c: "green",
            checks: [
              {
                lane: 1,
                ok: true,
                table: true,
                text:
                  what === "egr"
                    ? ["matches the connection record", "→ allowed; the new egress rule", "   is never used"]
                    : ["matches the connection record", "→ allowed, no rule checked"],
              },
            ],
          },
          { from: 0, to: 2, label: "ACK, request data", checks: [{ lane: 1, ok: true, table: true, text: ["same connection → allowed"] }] },
        ];
    return (
      <LaneDrawing
        label="Messages between the Google Front End and kade-api-1, and the host's checks"
        actors={STATEFUL_ACTORS}
        msgs={msgs}
        table={{ x: 690, rows: blocked ? [] : [["35.191.8.20:51234", "⇄ 10.10.1.10:8080 · TCP", "created by message 1"]] }}
      />
    );
  }
  if (c.k === "B") {
    return (
      <LaneDrawing
        label="An inbound request is answered while a new outgoing connection is dropped"
        actors={[
          { x: 116, t: "Google Front End", s: "35.191.8.20", c: "purple" },
          { x: 470, t: "data plane", s: "kade-api-1's host", c: "orange" },
          { x: 828, t: "kade-api-1", s: "10.10.1.10", c: "blue" },
        ]}
        msgs={[
          {
            from: 0,
            to: 2,
            label: "shopper request: SYN to :8080",
            checks: [{ lane: 1, ok: true, left: true, text: ["INGRESS allow tcp:8080", "from Google ranges → recorded"] }],
          },
          {
            from: 2,
            to: 0,
            label: "SYN-ACK, response",
            c: "green",
            checks: [{ lane: 1, ok: true, table: true, left: true, text: ["reply on a recorded connection", "→ egress deny not consulted"] }],
          },
          {
            from: 2,
            to: 0,
            label: "apt update to deb.debian.org:443",
            block: 1,
            checks: [{ lane: 1, ok: false, left: true, text: ["new outgoing connection", "→ EGRESS deny all @1000 → dropped"] }],
          },
        ]}
        rules={[
          ["INGRESS · allow tcp:8080 from 35.191.0.0/16, 130.211.0.0/22 · priority 1000", "green"],
          ["EGRESS · deny all to 0.0.0.0/0 · priority 1000", "red"],
        ]}
      />
    );
  }
  return <DialDrawing reverse={what === "rev"} />;
}

/** The connection table: why replies need no rule of their own. */
export function StatefulEx() {
  return <CaseExplorer label="Stateful firewall examples" cases={STATEFUL_CASES} render={statefulDrawing} />;
}

// ── Chapter 5.1: anatomy of a rule ─────────────────────────────────────────

type Endpoint = ["range" | "sa", string, string];
type RuleCase = Case & {
  dir: "in" | "out";
  pr: number;
  act: "allow" | "deny";
  tgt: { all?: boolean; sa?: string; tag?: string };
  src?: Endpoint[];
  dst?: Endpoint[];
  ports: string;
};

/** Kadé's four VMs: name, service account, network tag. */
type RuleVm = readonly [string, string, string];
const RULE_VMS: RuleVm[] = [
  ["kade-api-1", "sa-kade-api", "api"],
  ["kade-api-2", "sa-kade-api", "api"],
  ["kade-db", "sa-kade-db", ""],
  ["kade-worker", "sa-kade-worker", ""],
];

const RULE_CASES: RuleCase[] = [
  {
    k: "A",
    t: "Health checks to the API VMs",
    dir: "in",
    pr: 1000,
    act: "allow",
    tgt: { sa: "sa-kade-api" },
    src: [
      ["range", "35.191.0.0/16", "Google front ends + health checks"],
      ["range", "130.211.0.0/22", "Google front ends + health checks"],
    ],
    ports: "tcp:8080",
    take: '"Google\'s load balancer may reach VMs running as <b>sa-kade-api</b> on port <b>8080</b>." Two sources, two of four VMs, one port.',
    cfg: "direction: INGRESS   priority: 1000   action: allow\ntarget:    service account sa-kade-api\nsource:    35.191.0.0/16, 130.211.0.0/22\nprotocol:  tcp:8080",
  },
  {
    k: "B",
    t: "SSH only from the office",
    dir: "in",
    pr: 900,
    act: "allow",
    tgt: { all: true },
    src: [["range", "198.51.100.20/32", "Kadé office, public IP"]],
    ports: "tcp:22",
    take: '"Only the office\'s public IP may SSH to <b>any</b> VM." The target is wide (every VM, including future ones), but the source is one address, so the rule is still narrow. Chapter 6 replaces it with IAP.',
    cfg: "direction: INGRESS   priority: 900   action: allow\ntarget:    all instances\nsource:    198.51.100.20/32\nprotocol:  tcp:22",
  },
  {
    k: "C",
    t: "Block a noisy range, beating a wider allow",
    dir: "in",
    pr: 500,
    act: "deny",
    tgt: { all: true },
    src: [["range", "203.0.113.0/24", "a range sending scans"]],
    ports: "all",
    take: '"Nothing from <b>203.0.113.0/24</b> reaches any VM, on any port." Priority <b>500</b> is checked before every rule at 1000, so this deny wins over any allow that also matches that range.',
    cfg: "direction: INGRESS   priority: 500   action: deny\ntarget:    all instances\nsource:    203.0.113.0/24\nprotocol:  all",
  },
  {
    k: "D",
    t: "Egress restriction (destination, not source)",
    dir: "out",
    pr: 1000,
    act: "deny",
    tgt: { sa: "sa-kade-db" },
    dst: [["range", "0.0.0.0/0", "anywhere"]],
    ports: "all",
    take: '"kade-db may not <b>start</b> connections anywhere." The arrow points out of the VM: an egress rule has a <b>destination</b>, not a source. Replies to kade-api still flow, because they belong to connections kade-api started (stateful, section 03).',
    cfg: "direction:   EGRESS   priority: 1000   action: deny\ntarget:      service account sa-kade-db\ndestination: 0.0.0.0/0\nprotocol:    all",
  },
  {
    k: "E",
    t: "App tier reaches the database by identity",
    dir: "in",
    pr: 1000,
    act: "allow",
    tgt: { sa: "sa-kade-db" },
    src: [["sa", "sa-kade-api", "kade-api-1, kade-api-2"]],
    ports: "tcp:5432",
    take: '"VMs <b>running as</b> sa-kade-api may reach VMs running as sa-kade-db on PostgreSQL." Both sides are identities, not addresses: a new API VM is covered automatically, and kade-worker is not, even though it is in the same VPC.',
    cfg: "direction: INGRESS   priority: 1000   action: allow\ntarget:    service account sa-kade-db\nsource:    service account sa-kade-api\nprotocol:  tcp:5432",
  },
];

/**
 * One rule as a picture: its sources, the rule, and the VMs it covers. `rows`
 * swaps in other VMs (a tag added); `intruder` is a VM covered by mistake.
 */
function RuleDrawing({ c, rows = RULE_VMS, intruder }: { c: RuleCase; rows?: RuleVm[]; intruder?: string }) {
  const allow = c.act === "allow";
  const hue = allow ? "green" : "red";
  const ends = (c.src ?? c.dst)!;
  const covered = (vm: RuleVm) => !!c.tgt.all || c.tgt.sa === vm[1] || (!!c.tgt.tag && vm[2] === c.tgt.tag);
  const vms = (x: number) =>
    rows.map((vm, i) => {
      const y = 60 + 80 * i;
      const on = covered(vm);
      const bad = vm[0] === intruder;
      const wire = bad || !allow ? "fault" : hue;
      return (
        <g key={vm[0]}>
          <g className={on ? undefined : "off"}>
            <Box x={x} y={y} w={270} h={54} c={on ? (bad ? "red" : hue) : undefined} />
            <T x={x + 14} y={y + 23} k="t">{vm[0]}</T>
            <T x={x + 14} y={y + 42}>{`SA ${vm[1]}${vm[2] ? ` · tag ${vm[2]}` : ""}`}</T>
            <T x={x + 256} y={y + 23} k={on ? (bad ? "s c-red" : "s") : "f"} end bold={on}>
              {on ? (bad ? "joined by a tag" : "covered") : "not covered"}
            </T>
          </g>
          {on &&
            (x > 330 ? (
              <path className={`w ${wire}`} d={`M630 204 H652 V${y + 27} H${x - 3}`} markerEnd={`url(#dd-ah-${wire})`} />
            ) : (
              <path className={`w ${wire}`} d={`M${x + 270} ${y + 27} H308 V204 H327`} markerEnd={`url(#dd-ah-${wire})`} />
            ))}
        </g>
      );
    });
  const sources = (x: number, into: boolean) =>
    ends.map((e, i) => {
      const y = 96 + 104 * i;
      const sa = e[0] === "sa";
      const arrow = hue === "red" ? "fault" : hue;
      return (
        <g key={e[1]}>
          <Box x={x} y={y} w={270} h={70} c={sa ? "blue" : e[1] === "0.0.0.0/0" ? "red" : undefined} />
          <T x={x + 14} y={y + 20} k="f" size={10.5}>
            {sa ? "IDENTITY" : "IP RANGE"}
          </T>
          <T x={x + 14} y={y + 40} k="t">{(sa ? "SA " : "") + e[1]}</T>
          <T x={x + 14} y={y + 59}>{e[2]}</T>
          {into ? (
            <path className={`w ${arrow}`} d={`M${x + 270} ${y + 35} H308 V204 H327`} markerEnd={`url(#dd-ah-${arrow})`} />
          ) : (
            <path className={`w ${arrow}`} d={`M630 204 H652 V${y + 35} H${x - 3}`} markerEnd={`url(#dd-ah-${arrow})`} />
          )}
        </g>
      );
    });
  const count = rows.filter(covered).length;
  const kind = ends[0][0] === "sa" ? "identity" : `range${ends.length > 1 ? "s" : ""}`;
  return (
    <div className="space-y-3">
      <Drawing h={392} label={`A ${c.dir === "in" ? "ingress" : "egress"} ${c.act} rule: who it applies to and what it lets through`}>
        <Box x={330} y={86} w={300} h={236} c="orange" />
        <rect x={331} y={87} width={298} height={38} className={cn("n", allow ? "green" : "fault")} />
        <T x={346} y={112} k="t">{`${c.dir === "in" ? "INGRESS" : "EGRESS"} · ${c.act.toUpperCase()}`}</T>
        <T x={614} y={112} end>{`priority ${c.pr}`}</T>
        {(
          [
            ["target", c.tgt.all ? "all instances" : c.tgt.tag ? `network tag ${c.tgt.tag}` : `service account ${c.tgt.sa}`],
            [c.dir === "in" ? "source" : "destination", ends.map((e) => (e[0] === "sa" ? "service account " : "") + e[1]).join(", ")],
            ["protocol", c.ports],
          ] as const
        ).map(([k, v], i) => (
          <g key={k}>
            <Caps x={346} y={162 + 54 * i}>{k.toUpperCase()}</Caps>
            <T x={346} y={183 + 54 * i} size={12.5}>{v}</T>
          </g>
        ))}
        <Caps x={16} y={40}>{c.dir === "in" ? "FROM (SOURCE)" : "APPLIES TO (TARGET VMs)"}</Caps>
        <Caps x={674} y={40}>{c.dir === "in" ? "TO (TARGET VMs)" : "TO (DESTINATION)"}</Caps>
        {c.dir === "in" ? (
          <>
            {sources(16, true)}
            {vms(674)}
          </>
        ) : (
          <>
            {vms(16)}
            {sources(674, false)}
          </>
        )}
      </Drawing>
      <p className="text-ink-body border-rule border-t pt-3 font-mono text-[13.5px] leading-[1.6]">
        {`${allow ? "Opens" : "Blocks"} ${c.ports === "all" ? "every port" : c.ports} · ${c.dir === "in" ? "from" : "to"} ${ends.length} ${kind} · applies to ${count} of ${rows.length} VMs${c.tgt.all ? " (and every VM created later)" : ""} · checked at priority ${c.pr}`}
      </p>
    </div>
  );
}

/** Five rules, read part by part: direction, target, source, ports, priority. */
export function RuleEx() {
  return <CaseExplorer label="Firewall rule examples" cases={RULE_CASES} render={(c) => <RuleDrawing c={c} />} />;
}

// ── Chapter 5.1: the scoping trap ──────────────────────────────────────────

type Width = "narrow" | "wide";
type ScopeCase = RuleCase & { cell: [target: Width, source: Width] };
const SCOPE_CASES: ScopeCase[] = [
  {
    k: "The trap",
    t: "narrow target, wide source",
    cell: ["narrow", "wide"],
    dir: "in",
    pr: 1000,
    act: "allow",
    tgt: { tag: "api" },
    src: [["range", "0.0.0.0/0", "the whole internet"]],
    ports: "tcp:9100",
    take: "A metrics port opened \"for monitoring\". The tag makes it look scoped, but it only decides <b>which VMs have the door</b>. The source decides who may walk through it, and here that is <b>the whole internet</b>. Compare kade-allow-lb: the same tag as its target, but its source is only Google's load balancer ranges.",
    cfg: "kade-allow-metrics:\n  targetTags:   [api]          ← TARGET scoped: only VMs tagged api\n  sourceRanges: 0.0.0.0/0      ← SOURCE wide open: the whole internet\n  allow:        tcp:9100\n\nReads as: \"the whole internet may reach port 9100 on any VM tagged api.\"",
  },
  {
    k: "A",
    t: "narrow target, narrow source",
    cell: ["narrow", "narrow"],
    dir: "in",
    pr: 1000,
    act: "allow",
    tgt: { sa: "sa-kade-db" },
    src: [["sa", "sa-kade-api", "kade-api-1, kade-api-2"]],
    ports: "tcp:5432",
    what: [
      ["sa", "Target by service account"],
      ["tag", "What if it targets a tag, and someone tags kade-worker?"],
    ],
    take: {
      sa: "Only the API VMs reach the database, and only on PostgreSQL. Both widths are narrow, so this rule is <b>actually scoped</b>.",
      tag: "The same rule with <code>targetTags: [db]</code>. Anyone who can edit a VM can add a tag: someone tags kade-worker <code>db</code>, and kade-worker now accepts PostgreSQL connections from the API VMs. <b>The rule's reach changed without anyone touching the rule.</b> Moving kade-worker to sa-kade-db is harder: it needs permission to use that service account, and the VM must be stopped first.",
    },
    cfg: "target:  service account sa-kade-db\nsource:  service account sa-kade-api\nallow:   tcp:5432\n\nTag version:  targetTags: [db]                    ← anyone who can edit a VM\n                                                     can join the \"db\" group\nSA version:   targetServiceAccounts: [sa-kade-db]  ← must be granted the SA,\n                                                     and the VM must be stopped",
  },
  {
    k: "B",
    t: "wide target, narrow source",
    cell: ["wide", "narrow"],
    dir: "in",
    pr: 1000,
    act: "allow",
    tgt: { all: true },
    src: [["range", "198.51.100.20/32", "Kadé office, public IP"]],
    ports: "tcp:22",
    take: "One office IP may SSH to every VM, including VMs created later. The source is a single address, so the wide target is <b>survivable, if intended</b>.",
    cfg: "target:        all instances\nsourceRanges:  198.51.100.20/32\nallow:         tcp:22",
  },
  {
    k: "C",
    t: "wide target, wide source",
    cell: ["wide", "wide"],
    dir: "in",
    pr: 1000,
    act: "allow",
    tgt: { all: true },
    src: [["range", "0.0.0.0/0", "the whole internet"]],
    ports: "tcp:22",
    take: "<b>The dangerous one.</b> The entire internet may SSH to every VM, now and in the future. This is kade-allow-ssh today (finding 2).",
    cfg: "target:        all instances\nsourceRanges:  0.0.0.0/0\nallow:         tcp:22",
  },
];
const SCOPE_NAMES: Record<string, string> = {
  "narrow narrow": "A · scoped",
  "narrow wide": "the trap",
  "wide narrow": "B · survivable",
  "wide wide": "C · dangerous",
};

/** The four shapes as a 2×2: target width down the side, source width across. */
function ScopeGrid({ cell }: { cell: [Width, Width] }) {
  const widths: Width[] = ["narrow", "wide"];
  return (
    <div className="grid w-fit grid-cols-[auto_150px_150px] items-center gap-1.5 text-[14px]">
      <span />
      {widths.map((s) => (
        <span key={s} className="text-ink-muted px-1 text-[13px]">
          source {s}
        </span>
      ))}
      {widths.map((t) => (
        <div key={t} className="contents">
          <span className="text-ink-muted pr-2 text-[13px]">target {t}</span>
          {widths.map((s) => {
            const on = cell[0] === t && cell[1] === s;
            return (
              <span
                key={s}
                className={cn(
                  "rounded-[2px] border px-2.5 py-2",
                  on ? "border-ink border-2 font-bold" : "border-rule",
                  t === "wide" && s === "wide" ? "text-fault" : on ? "text-ink" : "text-ink-muted",
                )}
              >
                {SCOPE_NAMES[`${t} ${s}`]}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Four rule shapes: how wide the target is, and how wide the source is. */
export function ScopeEx() {
  return (
    <CaseExplorer
      label="Rule shapes: target width and source width"
      cases={SCOPE_CASES}
      render={(c, what) => {
        const tag = what === "tag";
        return (
          <div className="space-y-4">
            <ScopeGrid cell={c.cell} />
            {tag ? (
              <RuleDrawing
                c={{ ...c, tgt: { tag: "db" } }}
                rows={RULE_VMS.map((vm) => (vm[0] === "kade-db" || vm[0] === "kade-worker" ? [vm[0], vm[1], "db"] : vm))}
                intruder="kade-worker"
              />
            ) : (
              <RuleDrawing c={c} />
            )}
          </div>
        );
      }}
    />
  );
}

// ── Chapter 5.1: priority ──────────────────────────────────────────────────

type PRule = { n: string; pr: number; act: "allow" | "deny"; peer: string[]; port: string; implied?: boolean };
type Pkt = { peer: string; who: string; vm: string; port: string };
type PrioCase = Case & { dir: "in" | "out"; rules: (what: string) => PRule[]; pkt: (what: string) => Pkt };

const IMPLIED_IN: PRule = { n: "implied deny ingress", pr: 65535, act: "deny", peer: ["0.0.0.0/0"], port: "all", implied: true };
const IMPLIED_OUT: PRule = { n: "implied allow egress", pr: 65535, act: "allow", peer: ["0.0.0.0/0"], port: "all", implied: true };
const LB_RULE: PRule = { n: "kade-lb-to-api", pr: 1000, act: "allow", peer: ["35.191.0.0/16", "130.211.0.0/22"], port: "tcp:8080" };

const PRIO_CASES: PrioCase[] = [
  {
    k: "A",
    t: "Nothing matches: the implied rule decides",
    dir: "in",
    rules: () => [LB_RULE, { n: "kade-office-ssh", pr: 900, act: "allow", peer: ["198.51.100.20/32"], port: "tcp:22" }, IMPLIED_IN],
    pkt: () => ({ peer: "203.0.113.99", who: "a scanner", vm: "kade-api-1", port: "tcp:9000" }),
    take: "No rule mentions port 9000, so the walk reaches the bottom and the <b>implied deny ingress</b> at 65535 drops the packet. That is why a new VM is unreachable until an allow opens a hole.",
    cfg: "Inbound tcp:9000 to kade-api-1. No rule mentions 9000.\n→ walk finishes → implied deny ingress @65535 → DROPPED",
  },
  {
    k: "B",
    t: "An allow opens a hole in the implied deny",
    dir: "in",
    what: [
      ["gfe", "From Google's load balancer"],
      ["other", "What if it comes from 8.8.8.8?"],
    ],
    rules: () => [LB_RULE, IMPLIED_IN],
    pkt: (w) =>
      w === "other"
        ? { peer: "8.8.8.8", who: "somewhere else", vm: "kade-api-1", port: "tcp:8080" }
        : { peer: "35.191.8.20", who: "a Google front end", vm: "kade-api-1", port: "tcp:8080" },
    take: {
      gfe: "The allow at 1000 matches, so the packet is <b>allowed</b> and the walk stops. The implied deny below it is never reached.",
      other: "Same port, wrong source: the allow does not match, the walk falls through, and the <b>implied deny</b> drops it. An allow opens a hole only for the sources it names.",
    },
    cfg: "allow tcp:8080 from Google's ranges @1000  → matches → ALLOWED\nimplied deny @65535                         → never reached",
  },
  {
    k: "C",
    t: "Deny beats allow at the same priority",
    dir: "in",
    what: [
      ["scan", "From 203.0.113.99"],
      ["else", "From anywhere else"],
    ],
    rules: () => [
      { n: "block-scanners", pr: 1000, act: "deny", peer: ["203.0.113.0/24"], port: "tcp:443" },
      { n: "allow-https", pr: 1000, act: "allow", peer: ["0.0.0.0/0"], port: "tcp:443" },
      IMPLIED_IN,
    ],
    pkt: (w) =>
      w === "else"
        ? { peer: "198.51.100.7", who: "a shopper", vm: "kade-api-1", port: "tcp:443" }
        : { peer: "203.0.113.99", who: "a scanner", vm: "kade-api-1", port: "tcp:443" },
    take: {
      scan: "Both rules match at priority 1000. At a tie, <b>deny wins</b>, so the packet is dropped. That lets you add a deny beside an allow without renumbering anything.",
      else: "Only the allow matches, so the packet is <b>allowed</b>. The deny shares the priority but does not apply to this source.",
    },
    cfg: "deny   from 203.0.113.0/24   tcp:443  @1000\nallow  from 0.0.0.0/0        tcp:443  @1000\n\nPacket from 203.0.113.99 → both match, same priority → DENY wins\nPacket from anywhere else → only the allow matches   → ALLOWED",
  },
  {
    k: "D",
    t: "A lower number wins outright",
    dir: "in",
    what: [
      ["low", "Deny at 100"],
      ["tie", "What if the deny moves to 1000?"],
    ],
    rules: (w) => [
      { n: "deny-all", pr: w === "tie" ? 1000 : 100, act: "deny", peer: ["0.0.0.0/0"], port: "all" },
      { n: "allow-https", pr: 1000, act: "allow", peer: ["0.0.0.0/0"], port: "tcp:443" },
      IMPLIED_IN,
    ],
    pkt: () => ({ peer: "198.51.100.7", who: "a shopper", vm: "kade-api-1", port: "tcp:443" }),
    take: {
      low: "The deny at 100 is checked first and matches, so the packet is <b>dropped</b>. The allow at 1000 is never looked at, however specific it is.",
      tie: "Now both rules sit at 1000 and both match: a tie, and <b>deny still wins</b>. To let HTTPS through, the allow needs a lower number than the deny.",
    },
    cfg: "deny   all       @100\nallow  tcp:443   @1000\n\nPacket to :443 → deny @100 is checked first and matches → DROPPED\n                 (the allow is never looked at)",
  },
  {
    k: "E",
    t: "Egress hardening needs an explicit deny",
    dir: "out",
    what: [
      ["before", "No egress rules yet"],
      ["out", "Hardened: to 8.8.8.8"],
      ["in", "Hardened: to 10.10.1.10"],
    ],
    rules: (w) =>
      w === "before"
        ? [IMPLIED_OUT]
        : [
            { n: "db-deny-egress", pr: 1000, act: "deny", peer: ["0.0.0.0/0"], port: "all" },
            { n: "db-allow-internal", pr: 900, act: "allow", peer: ["10.10.0.0/16"], port: "all" },
            IMPLIED_OUT,
          ],
    pkt: (w) =>
      w === "in"
        ? { peer: "10.10.1.10", who: "kade-api-1", vm: "kade-db", port: "tcp:8080" }
        : { peer: "8.8.8.8", who: "the internet", vm: "kade-db", port: "tcp:443" },
    take: {
      before: "With no egress rules, the walk goes straight to the <b>implied allow egress</b>: kade-db can reach anything. Egress stays open until you close it.",
      out: "The allow at 900 does not match 8.8.8.8, and the deny at 1000 does, so the packet is <b>dropped</b>. The implied allow is never reached.",
      in: "The allow at 900 matches Kadé's own range first, so the packet is <b>allowed</b>. The deny at 1000 is never looked at.",
    },
    cfg: "No egress rules → implied allow egress @65535 → kade-db can reach anything\n\nAdd: deny  EGRESS to 0.0.0.0/0     @1000\nAdd: allow EGRESS to 10.10.0.0/16  @900\n→ kade-db reaches Kadé's own ranges only; the implied allow is never reached",
  },
];

/** Walk the rules from low number to high; the first priority with a match decides, deny winning a tie. */
function walkRules(rules: PRule[], pkt: Pkt) {
  const ip = ipToInt(pkt.peer)!;
  const peerOk = (r: PRule) => r.peer.some((c) => inCidr(ip, c));
  const portOk = (r: PRule) => r.port === "all" || r.port === pkt.port;
  const hit = (r: PRule) => peerOk(r) && portOk(r);
  const tiers = [...new Set(rules.map((r) => r.pr))].sort((a, b) => a - b).map((pr) => rules.filter((r) => r.pr === pr));
  const decided = tiers.findIndex((t) => t.some(hit));
  const hits = tiers[decided].filter(hit);
  const winner = hits.find((r) => r.act === "deny") ?? hits[0];
  const miss = (r: PRule) => [!portOk(r) && "port", !peerOk(r) && "address"].filter(Boolean).join(" + ");
  return { tiers, decided, winner, tie: hits.length > 1, hit, miss };
}

function PrioView({ c, what }: { c: PrioCase; what: string }) {
  const pkt = c.pkt(what);
  const { tiers, decided, winner, tie, hit, miss } = walkRules(c.rules(what), pkt);
  const inbound = c.dir === "in";
  const allowed = winner.act === "allow";
  const top = 56;
  const pitch = 74;
  const mid = (i: number) => top + pitch * i + 27;
  return (
    <div className="space-y-4">
      <Drawing h={Math.max(top + pitch * tiers.length, 190)} label="Firewall rules walked from the lowest priority number down; the first match decides">
        <Caps x={16} y={40}>{`PACKET · ${inbound ? "INGRESS" : "EGRESS"}`}</Caps>
        <Caps x={300} y={40}>RULES, LOWEST NUMBER FIRST</Caps>
        <Caps x={824} y={40}>RESULT</Caps>
        <Box x={16} y={top} w={230} h={118} />
        <T x={30} y={top + 28} k="t">{pkt.port}</T>
        <T x={30} y={top + 52}>{`${inbound ? "from" : "to"} ${pkt.peer}`}</T>
        <T x={30} y={top + 72} k="f">{pkt.who}</T>
        <T x={30} y={top + 98}>{`${inbound ? "to" : "from"} ${pkt.vm}`}</T>
        {tiers.map((tier, i) => {
          if (i > decided) return null;
          const last = i === decided;
          return (
            <path
              key={`w${i}`}
              className={last ? "w cur" : "w"}
              d={`M246 ${mid(0)} H272 V${mid(i)} H297`}
              markerEnd={last ? "url(#dd-ah-accent)" : "url(#dd-ah-muted)"}
            />
          );
        })}
        {tiers.map((tier, i) => {
          const y = top + pitch * i;
          const reached = i <= decided;
          const bw = (490 - 10 * (tier.length - 1)) / tier.length;
          return (
            <g key={tier[0].pr} className={reached ? undefined : "off"}>
              {tier.map((r, j) => {
                const x = 300 + j * (bw + 10);
                const on = reached && hit(r);
                return (
                  <g key={r.n}>
                    <Box x={x} y={y} w={bw} h={54} c={on ? (r.act === "allow" ? "green" : "red") : undefined} className={r.implied && !on ? "dash" : undefined} />
                    <T x={x + 14} y={y + 22} bold>{String(r.pr)}</T>
                    <T x={x + 72} y={y + 22} k="t">{`${r.act.toUpperCase()} ${r.port}`}</T>
                    <T x={x + 14} y={y + 43}>{r.implied ? `${r.n} · always last` : `${inbound ? "from" : "to"} ${r.peer.join(", ")}`}</T>
                    {tier.length === 1 && !r.implied && (
                      <T x={x + bw - 14} y={y + 22} k="f" end>
                        {r.n}
                      </T>
                    )}
                  </g>
                );
              })}
              {i === decided ? (
                <>
                  <Mark cx={812} cy={mid(i)} ok={allowed} />
                  <T x={832} y={mid(i) - 3} k={allowed ? "t" : "t c-red"}>{allowed ? "ALLOWED" : "DROPPED"}</T>
                  <T x={832} y={mid(i) + 17} k="f">
                    {winner.implied ? "nothing above matched" : tie && !allowed ? "deny wins a tie" : "first match"}
                  </T>
                </>
              ) : (
                <>
                  <T x={832} y={mid(i) - 3} k="f">{reached ? "no match" : "never reached"}</T>
                  {reached && tier.length === 1 && (
                    <T x={832} y={mid(i) + 17} k="f">{`wrong ${miss(tier[0])}`}</T>
                  )}
                </>
              )}
            </g>
          );
        })}
      </Drawing>
      <Result tone={allowed ? "ok" : "fault"}>
        <b>
          {allowed ? "Allowed" : "Dropped"}
          {winner.implied ? ` by the ${winner.n} at 65535.` : ` at priority ${winner.pr} by ${winner.n}.`}
        </b>{" "}
        {winner.implied
          ? "None of the rules above it matched."
          : tie && !allowed
            ? "An allow matched at the same priority, and deny wins a tie."
            : `Every rule below it is never reached.`}
      </Result>
    </div>
  );
}

/** Five packets walked down a priority ladder. */
export function PriorityEx() {
  return <CaseExplorer label="How priority decides" cases={PRIO_CASES} render={(c, what) => <PrioView key={c.k} c={c} what={what} />} />;
}

// ── Chapter 5.1: walk a packet through the rules ───────────────────────────

type FwRule = { n: string; pr: number; act: "allow" | "deny"; src?: string[]; srcSa?: string[]; p: string[]; tgt: string };
const LB_RANGES = ["35.191.0.0/16", "130.211.0.0/22"];
const FW_SETS: Record<"today" | "after", FwRule[]> = {
  today: [
    { n: "kade-allow-icmp", pr: 1000, act: "allow", src: ["203.0.113.45/32", "198.51.100.20/32"], p: ["icmp"], tgt: "all" },
    { n: "kade-allow-internal", pr: 1000, act: "allow", src: ["10.10.0.0/16"], p: ["all"], tgt: "all" },
    { n: "kade-allow-lb", pr: 1000, act: "allow", src: LB_RANGES, p: ["tcp:8080"], tgt: "tag:api" },
    { n: "kade-allow-ssh", pr: 1000, act: "allow", src: ["0.0.0.0/0"], p: ["tcp:22"], tgt: "all" },
    { n: "kade-allow-web", pr: 1000, act: "allow", src: ["0.0.0.0/0"], p: ["tcp:80", "tcp:443", "tcp:8080"], tgt: "all" },
  ],
  after: [
    { n: "kade-allow-icmp", pr: 1000, act: "allow", src: ["203.0.113.45/32", "198.51.100.20/32"], p: ["icmp"], tgt: "all" },
    { n: "kade-api-to-db", pr: 1000, act: "allow", srcSa: ["sa-kade-api"], p: ["tcp:5432"], tgt: "sa:sa-kade-db" },
    { n: "kade-icmp-internal", pr: 1000, act: "allow", src: ["10.10.0.0/16"], p: ["icmp"], tgt: "all" },
    { n: "kade-lb-to-api", pr: 1000, act: "allow", src: LB_RANGES, p: ["tcp:8080"], tgt: "sa:sa-kade-api" },
    { n: "kade-allow-ssh", pr: 1000, act: "allow", src: ["0.0.0.0/0"], p: ["tcp:22"], tgt: "all" },
  ],
};
const FW_SOURCES = {
  scan: { label: "Internet scanner 203.0.113.99", ip: "203.0.113.99" },
  home: { label: "Your home 203.0.113.45", ip: "203.0.113.45" },
  gfe: { label: "Google load balancer 35.191.8.20", ip: "35.191.8.20" },
  iap: { label: "IAP 35.235.240.9", ip: "35.235.240.9" },
  api: { label: "kade-api-1 10.10.1.10", ip: "10.10.1.10", sa: { today: "default", after: "sa-kade-api" } },
  worker: { label: "kade-worker 10.10.1.20", ip: "10.10.1.20", sa: { today: "default", after: "sa-kade-worker" } },
} as const;
type FwSource = keyof typeof FW_SOURCES;
const FW_TARGETS = {
  api: { tags: ["api"], sa: { today: "default", after: "sa-kade-api" } },
  db: { tags: [] as string[], sa: { today: "default", after: "sa-kade-db" } },
} as const;

const inCidr = (ip: number, c: string) => {
  const [base, bits] = c.split("/");
  return (ip & maskOf(+bits)) >>> 0 === ipToInt(base);
};

/** One incoming packet against kade-vpc's rules, before and after the clean-up. */
export function FwWalk() {
  const [set, setSet] = useState<"today" | "after">("today");
  const [tgt, setTgt] = useState<"api" | "db">("api");
  const [src, setSrc] = useState<FwSource>("scan");
  const [port, setPort] = useState("tcp:5432");
  const target = FW_TARGETS[tgt];
  const from = FW_SOURCES[src];
  const ip = ipToInt(from.ip)!;
  const targetSa = target.sa[set];
  const rules = [...FW_SETS[set]].sort((a, b) => a.pr - b.pr || (a.act === "deny" ? -1 : 1) || a.n.localeCompare(b.n));
  let hit: FwRule | null = null;
  const rows: [FwRule, string, boolean][] = [];
  for (const r of rules) {
    if (hit) {
      rows.push([r, r.pr === hit.pr ? "not needed: a rule at the same priority already matched" : "not reached: a lower-numbered rule already decided", false]);
      continue;
    }
    const applies =
      r.tgt === "all" ||
      (r.tgt.startsWith("tag:") && (target.tags as readonly string[]).includes(r.tgt.slice(4))) ||
      (r.tgt.startsWith("sa:") && targetSa === r.tgt.slice(3));
    if (!applies) {
      rows.push([r, `target does not include this VM (${r.tgt.replace("sa:", "service account ").replace("tag:", "tag ")})`, false]);
      continue;
    }
    if (!(r.p.includes("all") || r.p.includes(port))) {
      rows.push([r, `does not cover ${port}`, false]);
      continue;
    }
    const range = r.src?.find((c) => inCidr(ip, c));
    const senderSa = "sa" in from ? from.sa[set] : undefined;
    let why = "";
    if (range) why = `source ${from.ip} is in ${range}`;
    else if (r.srcSa && senderSa && r.srcSa.includes(senderSa)) why = `sender runs as ${senderSa}`;
    if (why) {
      hit = r;
      rows.push([r, `MATCH: ${why} → ${r.act.toUpperCase()}`, true]);
    } else {
      rows.push([
        r,
        r.srcSa
          ? senderSa
            ? `sender runs as ${senderSa}, not ${r.srcSa[0]}`
            : "source service accounts only match VMs inside the VPC"
          : `source ${from.ip} is not in ${r.src!.join(", ")}`,
        false,
      ]);
    }
  }
  const allowed = !!hit && hit.act === "allow";
  const tooWide =
    allowed &&
    (src === "scan" || (src === "home" && port !== "icmp") || (src === "worker" && tgt === "db") || (src === "worker" && port === "tcp:5432"));
  const tone: Tone = allowed ? (tooWide ? "warn" : "ok") : "fault";
  return (
    <WidgetFrame wide label="Walk a packet through the firewall rules">
      <Choices
        label="Rule set"
        value={set}
        onChange={setSet}
        options={[
          { value: "today", label: "Rules today (chapter 0)" },
          { value: "after", label: "Rules after chapter 5.1" },
        ]}
      />
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3">
        <Select
          label="Target VM"
          value={tgt}
          onChange={setTgt}
          options={[
            { value: "api", label: "kade-api-1 (tag api)" },
            { value: "db", label: "kade-db" },
          ]}
        />
        <Select label="Packet from" value={src} onChange={setSrc} options={(Object.keys(FW_SOURCES) as FwSource[]).map((k) => ({ value: k, label: FW_SOURCES[k].label }))} />
        <Select label="Traffic" value={port} onChange={setPort} options={["tcp:22", "tcp:443", "tcp:5432", "tcp:8080", "icmp"].map((p) => ({ value: p, label: p }))} />
      </div>
      <div aria-live="polite" className="mt-5 space-y-4">
        <Result tone={tone}>
          <b>{hit ? `${allowed ? "Allowed" : "Denied"} by ${hit.n} (priority ${hit.pr}).` : "Denied by the implied deny ingress rule at 65535. Nothing above matched."}</b>
          {tooWide && " This is allowed, but it should not be: a sign the rules are too wide."}
        </Result>
        <Table
          head={["Rule", "From", "Prio", "Target", "Result"]}
          mono={[0, 1, 2, 3]}
          minWidth={820}
          marked={(i) => (i < rows.length ? rows[i][2] : !hit)}
          faded={(i) => (i < rows.length ? !rows[i][2] : !!hit)}
          rows={[
            ...rows.map(([r, why]) => [
              r.n,
              `${r.src ? r.src.join(", ") : `SA ${r.srcSa!.join(", ")}`} · ${r.p.join(",")}`,
              r.pr,
              r.tgt.replace("sa:", "SA ").replace("tag:", "tag "),
              <span key="w" className="font-sans text-[14.5px]">
                {why}
              </span>,
            ]),
            [
              "implied deny",
              "0.0.0.0/0 · all",
              65535,
              "all",
              <span key="w" className="font-sans text-[14.5px]">
                {hit ? "not reached" : "reached: DENY"}
              </span>,
            ],
          ]}
        />
      </div>
    </WidgetFrame>
  );
}

// ── Chapter 5.2: layers of policy ──────────────────────────────────────────

type LayerKey = "org" | "folder" | "vpc" | "gnp" | "rnp" | "imp";
const LAYERS: Record<LayerKey, [string, string]> = {
  org: ["Hierarchical policy", "organization kade.lk"],
  folder: ["Hierarchical policy", "folder production"],
  vpc: ["VPC firewall rules", "kade-vpc, project owner"],
  gnp: ["Global network policy", "attached to kade-vpc"],
  rnp: ["Regional network policy", "kade-vpc, one region"],
  imp: ["Implied rules", "always present, @65535"],
};
type LayerCase = Case & { ov?: boolean; swap?: boolean; pkt?: string; L?: Partial<Record<LayerKey, [string, "allow" | "deny" | "goto"]>> };

const LAYER_CASES: LayerCase[] = [
  {
    k: "The order",
    ov: true,
    take: 'A packet walks down the layers. <b>allow</b> or <b>deny</b> stops the walk; <b>goto_next</b> or "no rule matches" falls through to the next layer. Hierarchical policies are always first. Layers 3 to 5 keep this order unless the VPC\'s enforcement order is changed (Example F).',
    cfg: "  1. Hierarchical policy - organization\n  2. Hierarchical policy - folders, outer to inner\n  3. VPC firewall rules                    ┐ this pair can be swapped\n  4. Global network policy                 │ by a VPC setting\n  5. Regional network policy               ┘\n  6. Implied rules (allow egress / deny ingress at 65535)\n\n  At each layer:  allow           → stop, packet allowed\n                  deny            → stop, packet dropped\n                  goto_next or\n                  no rule matched → fall through to the next layer",
  },
  {
    k: "A",
    t: "Org overrides the project",
    pkt: "SSH from the internet (203.0.113.99) → kade-api-1:22",
    L: { org: ["deny tcp:22 from 0.0.0.0/0", "deny"], vpc: ["allow tcp:22 from 0.0.0.0/0 @1000", "allow"] },
    take: "The organization's deny is checked first and stops the walk. The project's allow is <b>never reached</b>, so no project owner can reopen SSH to the internet.",
    cfg: "Org hierarchical policy:  deny  INGRESS tcp:22 from 0.0.0.0/0\nProject VPC rule:         allow INGRESS tcp:22 from 0.0.0.0/0  @1000\n\nSSH from the internet:\n  layer 1 → matches, DENY → walk stops\n  the VPC allow is never reached → DROPPED",
  },
  {
    k: "B",
    t: "The order cuts both ways",
    pkt: "RDP from the internet (203.0.113.99) → kade-api-1:3389",
    L: { folder: ["allow tcp:3389 from 0.0.0.0/0", "allow"], vpc: ["deny tcp:3389 from 0.0.0.0/0 @100", "deny"] },
    take: 'An allow higher up also stops the walk. The project\'s deny, even at priority 100, <b>never runs</b>. "I added a deny rule" is not the end of the story once policies exist.',
    cfg: "Folder hierarchical policy:  allow INGRESS tcp:3389 from 0.0.0.0/0\nProject VPC rule:            deny  INGRESS tcp:3389 from 0.0.0.0/0  @100\n\nRDP from the internet:\n  layer 2 → matches, ALLOW → walk stops\n  the project's deny never runs → ALLOWED",
  },
  {
    k: "C",
    t: "goto_next hands the decision down",
    pkt: "HTTPS (203.0.113.99) → kade-api-1:443",
    L: { org: ["tcp:443 from 0.0.0.0/0 → goto_next", "goto"], vpc: ["allow tcp:443 to sa-kade-api", "allow"] },
    take: "The organization names the traffic but <b>declines to decide</b>. The walk continues, and the project's own rule decides.",
    cfg: "Org policy rule:  tcp:443 from 0.0.0.0/0 → goto_next\nVPC rule:         allow tcp:443 to sa-kade-api\n\n→ the org layer sees the traffic but declines to decide\n→ each project's own rules decide",
  },
  {
    k: "D",
    t: "Nothing matches anywhere",
    pkt: "tcp:9000 (203.0.113.99) → kade-api-1:9000",
    L: {},
    take: "No layer has a rule for port 9000, so the walk reaches the bottom and the <b>implied deny ingress</b> drops it.",
    cfg: "No policy or VPC rule mentions tcp:9000\n\nlayers 1-5 → no match\nlayer 6    → implied deny ingress @65535 → DROPPED",
  },
  {
    k: "E",
    t: "Network policy vs VPC rule, default order",
    pkt: "tcp:8080 (203.0.113.99) → kade-api-1:8080",
    L: { vpc: ["allow tcp:8080 from 0.0.0.0/0 @1000", "allow"], gnp: ["deny tcp:8080 from 0.0.0.0/0", "deny"] },
    take: "In the default order, VPC rules come <b>before</b> the global network policy, so the old-style allow wins and the policy's deny never runs. The newer object is not automatically stronger.",
    cfg: "VPC rule:               allow INGRESS tcp:8080 from 0.0.0.0/0  @1000\nGlobal network policy:  deny  INGRESS tcp:8080 from 0.0.0.0/0\n\nDefault order: VPC rules (layer 3) before the network policy (layer 4)\n→ the VPC allow is reached first → ALLOWED\n→ the policy deny never runs",
  },
  {
    k: "F",
    t: "Same rules, order swapped",
    swap: true,
    pkt: "tcp:8080 (203.0.113.99) → kade-api-1:8080",
    L: { vpc: ["allow tcp:8080 from 0.0.0.0/0 @1000", "allow"], gnp: ["deny tcp:8080 from 0.0.0.0/0", "deny"] },
    take: "With <code>networkFirewallPolicyEnforcementOrder = BEFORE_CLASSIC_FIREWALL</code>, the network policies move above the VPC rules. Same two rules, <b>opposite result</b>. Check this setting before reasoning about which layer wins.",
    cfg: "kade-vpc: networkFirewallPolicyEnforcementOrder = BEFORE_CLASSIC_FIREWALL\n\nGlobal network policy (now layer 3):  deny  tcp:8080 from 0.0.0.0/0 → matches → DROPPED\nVPC rule (now layer 4):               never reached",
  },
];

function LayerDrawing({ c }: { c: LayerCase }) {
  const order: LayerKey[] = c.swap ? ["org", "folder", "gnp", "rnp", "vpc", "imp"] : ["org", "folder", "vpc", "gnp", "rnp", "imp"];
  const top = c.ov ? 18 : 82;
  const ys = order.map((_, i) => top + 78 * i);
  let decided: ["allow" | "deny", LayerKey] | null = null;
  const states = order.map((key) => {
    const rule = c.L?.[key];
    if (c.ov) return { key, g: "ov" as const, rule };
    if (decided) return { key, g: "nr" as const, rule };
    if (key === "imp") {
      decided = ["deny", key];
      return { key, g: "deny" as const, rule };
    }
    if (rule && (rule[1] === "allow" || rule[1] === "deny")) {
      decided = [rule[1], key];
      return { key, g: rule[1], rule };
    }
    return { key, g: rule?.[1] === "goto" ? ("goto" as const) : ("none" as const), rule };
  });
  const result = decided as ["allow" | "deny", LayerKey] | null;
  const label: Record<string, string> = {
    allow: "ALLOW · stop",
    deny: "DENY · stop",
    goto: "goto_next ↓",
    none: "no match ↓",
    nr: "not reached",
  };
  const pairTop = ys[order.indexOf(c.swap ? "gnp" : "vpc")];
  const pairEnd = ys[order.indexOf(c.swap ? "gnp" : "vpc") + 2] + 62;
  const bottom = ys[5] + 62 + 20;
  const stopAt = result ? order.indexOf(result[1]) : -1;
  const pathHue = result?.[0] === "allow" ? "green" : "red";
  return (
    <div className="space-y-3">
      <Drawing h={bottom} label={c.ov ? "The six firewall layers, in order" : `The walk of: ${c.pkt}`}>
        {!c.ov && (
          <>
            <Box x={16} y={8} w={928} h={46} />
            <T x={32} y={37} k="t">Packet</T>
            <T x={104} y={37}>{c.pkt}</T>
          </>
        )}
        {states.map(({ key, g, rule }, i) => {
          const y = ys[i];
          const hue = g === "allow" ? "green" : g === "deny" ? "red" : key === "org" || key === "folder" ? "purple" : key === "imp" ? undefined : "orange";
          const text = c.ov ? "" : key === "imp" ? "deny ingress from 0.0.0.0/0" : rule ? rule[0] : "no rule for this traffic";
          const tag =
            g === "ov" ? (key === "org" || key === "folder" ? "always first" : key === "imp" ? "always last" : "swappable") : label[g];
          return (
            <g key={key} className={g === "nr" ? "off" : undefined}>
              <Box x={90} y={y} w={640} h={62} c={hue} />
              <T x={106} y={y + 26} k="t">{`${i + 1} · ${LAYERS[key][0]}`}</T>
              <T x={106} y={y + 46}>{LAYERS[key][1]}</T>
              {text && (
                <T x={340} y={y + 36} k={rule || key === "imp" ? "s" : "f"} size={12}>
                  {text}
                </T>
              )}
              <T x={714} y={y + 36} k={g === "deny" ? "s c-red" : g === "allow" ? "s" : "f"} end bold>
                {tag}
              </T>
            </g>
          );
        })}
        {result && (
          <g>
            <line className={`w ${pathHue === "red" ? "fault" : "green"}`} x1={50} y1={ys[0] - 14} x2={50} y2={ys[stopAt] + 31} strokeWidth={3} />
            <line
              className={`w ${pathHue === "red" ? "fault" : "green"}`}
              x1={50}
              y1={ys[stopAt] + 31}
              x2={86}
              y2={ys[stopAt] + 31}
              strokeWidth={3}
              markerEnd={`url(#dd-ah-${pathHue === "red" ? "fault" : "green"})`}
            />
            {order.map((_, i) => i < stopAt && <circle key={i} className="ok" cx={50} cy={ys[i] + 31} r={5} />)}
            <T x={42} y={ys[0] - 20}>packet</T>
          </g>
        )}
        <path className="w" d={`M744 ${pairTop} h12 v${pairEnd - pairTop} h-12`} />
        <T x={766} y={pairTop + (pairEnd - pairTop) / 2 - 8}>{c.swap ? "swapped: network" : "layers 3 to 5"}</T>
        <T x={766} y={pairTop + (pairEnd - pairTop) / 2 + 10}>{c.swap ? "policies now first" : "swappable pair"}</T>
        <T x={766} y={pairTop + (pairEnd - pairTop) / 2 + 28} k="f" size={11}>
          (enforcement order)
        </T>
      </Drawing>
      {result && (
        <Result tone={result[0] === "allow" ? "ok" : "fault"}>
          <b>
            Result: {result[0] === "allow" ? "allowed" : "dropped"} at layer {stopAt + 1}, {LAYERS[result[1]][0].toLowerCase()}
          </b>
        </Result>
      )}
    </div>
  );
}

/** Which layer of firewall policy decides, and why the order matters. */
export function LayerEx() {
  return <CaseExplorer label="Firewall policy layers" cases={LAYER_CASES} render={(c) => <LayerDrawing c={c} />} />;
}

type WalkLayer = Exclude<LayerKey, "imp">;
const WALK_NAMES: Record<WalkLayer, string> = {
  org: "Hierarchical policy · organization",
  folder: "Hierarchical policy · folder",
  vpc: "VPC firewall rules",
  gnp: "Global network policy",
  rnp: "Regional network policy",
};

/** Set what each layer says, and watch where the walk stops. */
export function LayerWalk() {
  const [order, setOrder] = useState<"after" | "before">("after");
  const [rules, setRules] = useState<Record<WalkLayer, string>>({ org: "none", folder: "none", vpc: "allow", gnp: "deny", rnp: "none" });
  const layers: WalkLayer[] = order === "after" ? ["org", "folder", "vpc", "gnp", "rnp"] : ["org", "folder", "gnp", "rnp", "vpc"];
  const steps: ReactNode[] = [];
  let stop: [string, WalkLayer] | null = null;
  layers.forEach((key, i) => {
    const v = rules[key];
    if (stop) steps.push(<span className="text-ink-faint">{`${i + 1}. ${WALK_NAMES[key]}: not reached`}</span>);
    else if (v === "allow" || v === "deny") {
      stop = [v, key];
      steps.push(
        <b className={v === "deny" ? "text-fault" : "text-ink"}>{`${i + 1}. ${WALK_NAMES[key]}: ${v.toUpperCase()}, walk stops`}</b>,
      );
    } else steps.push(`${i + 1}. ${WALK_NAMES[key]}: ${v === "goto" ? "goto_next, passes the decision down" : "no rule matches, falls through"}`);
  });
  const decided = stop as [string, WalkLayer] | null;
  if (!decided) steps.push(<b className="text-fault">6. Implied rule: deny ingress at 65535</b>);
  const allowed = decided?.[0] === "allow";
  return (
    <WidgetFrame label="Walk the firewall layers">
      <Choices
        label="Enforcement order"
        value={order}
        onChange={setOrder}
        options={[
          { value: "after", label: "Default order: VPC rules first" },
          { value: "before", label: "BEFORE_CLASSIC_FIREWALL: network policies first" },
        ]}
      />
      <ol className="mt-4">
        {layers.map((key, i) => (
          <li key={key} className="border-rule flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b py-2.5">
            <span className="text-ink text-[15px]">
              <span className="text-ink-faint mr-2 font-mono text-[13px]">{i + 1}.</span>
              {WALK_NAMES[key]}
            </span>
            <label className="sr-only" htmlFor={`lw-${key}`}>
              {WALK_NAMES[key]}
            </label>
            <select
              id={`lw-${key}`}
              value={rules[key]}
              onChange={(e) => setRules((r) => ({ ...r, [key]: e.target.value }))}
              className="border-rule-strong bg-ground text-ink hover:border-ink-faint h-10 w-[200px] rounded-[2px] border px-2.5 text-[14.5px] transition-colors"
            >
              <option value="none">no rule matches</option>
              <option value="allow">allow</option>
              <option value="deny">deny</option>
              {key !== "vpc" && <option value="goto">goto_next</option>}
            </select>
          </li>
        ))}
      </ol>
      <div aria-live="polite" className="mt-5 space-y-4">
        <Result tone={allowed ? "ok" : "fault"}>
          <b>
            Incoming packet is {allowed ? "allowed" : "dropped"}
            {decided ? ` by the ${WALK_NAMES[decided[1]].toLowerCase()}` : " by the implied deny"}.
          </b>
        </Result>
        <ul className="text-ink-body space-y-1.5 text-[15px] leading-[1.5]">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    </WidgetFrame>
  );
}

// ── Chapter 5.2: firewall objects ──────────────────────────────────────────

const OBJ_CASES: Case[] = [
  {
    k: "Address groups",
    take: "Without a group, the same list lives inside every rule that needs it, and each copy must be edited by hand. With a group, rules <b>point at one named list</b>. Change the list once and every rule follows. Groups can be defined at the organization level and shared by many projects.",
    cfg: 'Without:  office and home IPs pasted into kade-allow-icmp\n          the same IPs pasted into a monitoring rule\n          a second office opens → edit both, by hand\n\nWith:     address group "kade-trusted-ips" = [198.51.100.20/32, 203.0.113.45/32]\n          rule A → srcAddressGroups: [kade-trusted-ips]\n          rule B → srcAddressGroups: [kade-trusted-ips]\n          a second office opens → update the group once',
  },
  {
    k: "FQDN objects",
    take: "The rule names <b>domains</b>, and GCP keeps the matching IPs up to date by resolving them. kade-worker can reach PayGate and the Debian mirror; a compromised worker cannot send data anywhere else. The caveat: GCP follows whatever the name resolves to, so this is a convenience, not a proof of identity.",
    cfg: "target: secure tag kade-role=worker\n\nallow EGRESS → fqdn: api.paygate.lk                tcp:443\nallow EGRESS → fqdn: deb.debian.org                tcp:443, tcp:80\ndeny  EGRESS → 0.0.0.0/0                           all",
  },
  {
    k: "Geolocation",
    take: 'Country rules only see the <b>real client</b> when traffic reaches a VM directly (an external IP or a passthrough load balancer). Behind Kadé\'s Application Load Balancer, VMs and Cloud Run only see Google\'s front-end addresses, so filtering shoppers by country is a Cloud Armor job (chapter 12). And a server rented inside Sri Lanka passes a "Sri Lanka only" rule: useful to cut noise, never the only defence.',
    cfg: "allow INGRESS tcp:22 from geo: [LK]        @100\ndeny  INGRESS tcp:22 from 0.0.0.0/0         @200\n(only meaningful for a VM reached directly, e.g. before chapter 6's IAP)",
  },
  {
    k: "Threat Intelligence",
    take: "Google maintains the lists; a rule refers to them by name. On <b>egress</b> they stop a compromised VM from reaching known malware hosts or mining pools, which works for any VM. On <b>ingress</b> they only help where traffic reaches a VM directly, for the same reason as geolocation. Put them near the top of the policy so the noise never reaches other rules or the logs.",
    cfg: "deny INGRESS from threat list: iplist-tor-exit-nodes        all   @10\ndeny INGRESS from threat list: iplist-known-malicious-ips   all   @11\ndeny EGRESS  to   threat list: iplist-known-malicious-ips   all   @12\ndeny EGRESS  to   threat list: iplist-crypto-miners         all   @13",
  },
];

/** Which Cloud NGFW tier an object needs, in the drawing's corner. */
function Tier({ children }: { children: string }) {
  return (
    <>
      <Box x={724} y={8} w={220} h={30} />
      <T x={834} y={28} k="s mid" bold>
        {`Cloud NGFW ${children}`}
      </T>
    </>
  );
}

function ObjDrawing({ c }: { c: Case }) {
  if (c.k === "Address groups") {
    const ips = ["198.51.100.20/32 · office", "203.0.113.45/32 · home"];
    return (
      <Drawing h={360} label="Two rules that copy the same addresses, and two rules that point at one address group">
        <Tier>Essentials (free)</Tier>
        <Caps x={16} y={28}>WITHOUT A GROUP</Caps>
        <Caps x={500} y={28}>WITH A GROUP</Caps>
        {["kade-allow-icmp", "kade-monitoring"].map((rule, i) => {
          const y = 50 + 150 * i;
          return (
            <g key={rule}>
              <Box x={16} y={y} w={420} h={126} c="orange" />
              <T x={32} y={y + 26} k="t">{rule}</T>
              {ips.map((ip, j) => (
                <g key={ip}>
                  <Box x={32} y={y + 42 + 36 * j} w={260} h={28} />
                  <T x={44} y={y + 61 + 36 * j} size={12}>{ip}</T>
                </g>
              ))}
              <T x={306} y={y + 61} k="f" size={11.5}>copy</T>
              <T x={306} y={y + 97} k="f" size={11.5}>copy</T>
            </g>
          );
        })}
        <T x={16} y={348} k="s c-red">New office → edit every rule that holds the list, by hand</T>
        <Box x={700} y={120} w={244} h={130} />
        <T x={716} y={146} k="f" size={11}>address group</T>
        <T x={716} y={166} k="t">kade-trusted-ips</T>
        {ips.map((ip, j) => (
          <g key={ip}>
            <Box x={716} y={180 + 32 * j} w={212} h={26} />
            <T x={726} y={198 + 32 * j} size={11.5}>{ip}</T>
          </g>
        ))}
        {["kade-allow-icmp", "kade-monitoring"].map((rule, i) => {
          const y = 70 + 150 * i;
          return (
            <g key={rule}>
              <Box x={500} y={y} w={170} h={64} c="orange" />
              <T x={514} y={y + 26} k="t" size={12.5}>{rule}</T>
              <T x={514} y={y + 46} size={11}>src: kade-trusted-ips</T>
              <path className="w" d={`M670 ${y + 32} C 690 ${y + 32}, 680 185, 697 185`} markerEnd="url(#dd-ah-muted)" />
            </g>
          );
        })}
        <T x={500} y={348} bold>New office → update the group once; both rules follow</T>
      </Drawing>
    );
  }
  if (c.k === "FQDN objects") {
    const rules: [string, string][] = [
      ["@100  allow → fqdn api.paygate.lk · tcp:443", "green"],
      ["@101  allow → fqdn deb.debian.org · tcp:80,443", "green"],
      ["@1000 deny  → 0.0.0.0/0 · all", "red"],
    ];
    const dests: [string, string, boolean, string][] = [
      ["api.paygate.lk", "PayGate API", true, "✓ allowed"],
      ["deb.debian.org", "package mirror", true, "✓ allowed"],
      ["evil.example", "attacker's server", false, "✕ dropped @1000"],
    ];
    return (
      <Drawing h={370} label="kade-worker's egress policy allows two names and drops everything else">
        <Tier>Standard (paid)</Tier>
        <Box x={16} y={150} w={200} h={92} c="blue" />
        <T x={30} y={178} k="t">kade-worker</T>
        <T x={30} y={200} size={11.5}>secure tag</T>
        <T x={30} y={218} size={11.5}>kade-role=worker</T>
        <Box x={250} y={60} w={370} h={280} c="orange" />
        <T x={266} y={86} k="t" size={13}>EGRESS · global network policy</T>
        {rules.map(([r, c], i) => (
          <g key={r}>
            <Box x={266} y={108 + 54 * i} w={338} h={40} c={c} />
            <T x={278} y={133 + 54 * i} size={11.5}>{r}</T>
          </g>
        ))}
        <T x={266} y={292} k="f" size={11.5}>GCP resolves each name and keeps the</T>
        <T x={266} y={310} k="f" size={11.5}>matching IPs current (e.g. 192.0.2.10)</T>
        <Wire x1={216} y1={196} x2={247} y2={196} c="blue" />
        {dests.map(([name, what, ok, verdict], i) => {
          const y = 70 + 100 * i;
          const hue = ok ? "green" : "fault";
          return (
            <g key={name}>
              <Box x={680} y={y} w={264} h={76} c={ok ? undefined : "red"} />
              <T x={696} y={y + 30} k="t">{name}</T>
              <T x={696} y={y + 52} size={11.5}>{what}</T>
              <T x={928} y={y + 30} k={ok ? "s" : "s c-red"} end bold size={11.5}>
                {verdict}
              </T>
              <path className={`w ${hue}`} d={`M604 ${128 + 54 * i} C 640 ${128 + 54 * i}, 650 ${y + 38}, 677 ${y + 38}`} markerEnd={`url(#dd-ah-${hue})`} />
            </g>
          );
        })}
      </Drawing>
    );
  }
  if (c.k === "Geolocation") {
    const clients: [string, string, "ok" | "no" | "warn", string][] = [
      ["Kadé office, Colombo", "registered country: LK", "ok", "✓ allowed @100"],
      ["Server in another country", "registered country: not LK", "no", "✕ denied @200"],
      ["Server rented in Colombo", "registered country: LK", "warn", "✓ allowed: geo is not identity"],
    ];
    return (
      <Drawing h={372} label="A country rule in front of a VM reached directly">
        <Tier>Standard (paid)</Tier>
        {clients.map(([name, sub, s, verdict], i) => {
          const y = 56 + 100 * i;
          const hue = s === "no" ? "fault" : "green";
          return (
            <g key={name}>
              <Box x={16} y={y} w={300} h={80} c={s === "warn" ? "yellow" : undefined} />
              <T x={30} y={y + 26} k="t" size={13}>{name}</T>
              <T x={30} y={y + 46} size={11.5}>{sub}</T>
              <T x={30} y={y + 66} k={s === "no" ? "s c-red" : "s"} bold size={11.5}>
                {verdict}
              </T>
              <path className={`w ${hue}`} d={`M316 ${y + 40} C 344 ${y + 40}, 344 186, 371 186`} markerEnd={`url(#dd-ah-${hue})`} />
            </g>
          );
        })}
        <Box x={374} y={116} w={260} h={140} c="orange" />
        <T x={390} y={142} k="t" size={13}>INGRESS tcp:22</T>
        <T x={390} y={170} size={12}>@100 allow from geo [LK]</T>
        <T x={390} y={194} size={12}>@200 deny from 0.0.0.0/0</T>
        <T x={390} y={226} k="f" size={11.5}>VM reached directly</T>
        <Wire x1={634} y1={186} x2={681} y2={186} c="green" />
        <Box x={684} y={146} w={260} h={80} c="blue" />
        <T x={700} y={176} k="t" size={13}>VM with an external IP</T>
        <T x={700} y={198} size={11.5}>sees the real client IP</T>
        <Box x={374} y={290} w={570} h={62} />
        <T x={390} y={316}>Behind the load balancer, VMs and Cloud Run only see</T>
        <T x={390} y={336} bold>35.191.x.x and 130.211.x.x. Filter shoppers with Cloud Armor (ch 12).</T>
      </Drawing>
    );
  }
  const senders: [string, boolean][] = [
    ["Tor exit node", false],
    ["Known malicious IP", false],
    ["Normal client", true],
  ];
  const rows: [string, boolean, string][] = [
    ["@10 deny tor-exit-nodes", false, "✕"],
    ["@11 deny known-malicious-ips", false, "✕"],
    ["@1000+ the rest of the rules", true, "→"],
  ];
  const dests: [string, string, boolean][] = [
    ["api.paygate.lk", "✓ not on any list", true],
    ["crypto-mining pool", "✕ crypto-miners list", false],
    ["malware command server", "✕ known-malicious-ips", false],
  ];
  return (
    <Drawing h={408} label="Threat lists drop known-bad senders on ingress and known-bad destinations on egress">
      <Tier>Standard (paid)</Tier>
      <Caps x={16} y={28}>INGRESS · only where traffic reaches a VM directly</Caps>
      {senders.map(([name, ok], i) => {
        const y = 60 + 96 * i;
        const hue = ok ? "green" : "fault";
        return (
          <g key={name}>
            <Box x={16} y={y} w={170} h={64} c={ok ? undefined : "red"} />
            <T x={30} y={y + 38} k="t" size={12.5}>{name}</T>
            <path className={`w ${hue}`} d={`M186 ${y + 32} C 205 ${y + 32}, 205 ${112 + 58 * i}, 225 ${112 + 58 * i}`} markerEnd={`url(#dd-ah-${hue})`} />
          </g>
        );
      })}
      <Box x={228} y={70} w={250} h={200} c="orange" />
      <T x={242} y={92} k="f" size={11}>ingress policy, top first</T>
      {rows.map(([r, ok, mark], i) => (
        <g key={r}>
          <Box x={242} y={96 + 58 * i} w={222} h={34} c={ok ? "green" : "red"} />
          <T x={254} y={118 + 58 * i} k={ok ? "s" : "s c-red"} size={11}>{`${mark} ${r}`}</T>
        </g>
      ))}
      <T x={242} y={296} bold size={11.5}>→ normal client reaches the VM</T>
      <Caps x={530} y={28}>EGRESS · any VM</Caps>
      <Box x={530} y={120} w={170} h={80} c="blue" />
      <T x={544} y={150} k="t" size={13}>kade-worker</T>
      <T x={544} y={172} size={11.5}>if compromised</T>
      {dests.map(([name, sub, ok], i) => {
        const y = 60 + 96 * i;
        const hue = ok ? "green" : "fault";
        return (
          <g key={name}>
            <Box x={744} y={y} w={200} h={70} c={ok ? undefined : "red"} />
            <T x={758} y={y + 28} k="t" size={12}>{name}</T>
            <T x={758} y={y + 50} k={ok ? "s" : "s c-red"} size={11}>{sub}</T>
            <path className={`w ${hue}`} d={`M700 160 C 720 160, 720 ${y + 35}, 741 ${y + 35}`} markerEnd={`url(#dd-ah-${hue})`} />
          </g>
        );
      })}
      <Box x={16} y={350} w={928} h={44} />
      <T x={32} y={377}>List rules sit at the top of the policy (low numbers), so this traffic never reaches application rules or fills the logs.</T>
    </Drawing>
  );
}

/** Address groups, FQDN objects, geolocation and threat lists. */
export function ObjEx() {
  return <CaseExplorer label="Firewall policy objects" cases={OBJ_CASES} render={(c) => <ObjDrawing c={c} />} />;
}

// ── Chapters 6.1 and 6.2: why SSH through IAP fails ────────────────────────

/** Set the five (or eight) things SSH through IAP depends on, and see where it fails. */
export function SshCheck({ full }: { full?: string }) {
  const withOsLogin = full === "1";
  const [v, setV] = useState({
    api: "on",
    role: "tunnel",
    fw: "iap",
    sshd: "up",
    osl: "on",
    oslrole: "admin",
    sau: "yes",
  });
  const set = (k: keyof typeof v) => (x: string) => setV((s) => ({ ...s, [k]: x }));
  const steps: string[] = ["gcloud logs you in and opens an HTTPS tunnel to IAP on port 443."];
  let out: [string, string, Tone];
  const fail = (head: string, text: string): [string, string, Tone] => [head, text, "fault"];
  if (v.api === "off") {
    out = fail("Error 4033: not authorized", "The IAP API is off. IAM and firewall can be perfect and it still fails. Enable iap.googleapis.com.");
  } else if (!["tunnel", "owner"].includes(v.role)) {
    out = fail(
      "Error 4033: not authorized",
      v.role === "editor"
        ? "roles/editor does not include IAP tunnel access. Grant roles/iap.tunnelResourceAccessor."
        : "Your identity has no IAP tunnel permission. Grant roles/iap.tunnelResourceAccessor.",
    );
  } else {
    steps.push("IAP accepts you: API on, IAM role present.");
    if (v.fw === "none" || v.fw === "office") {
      out = fail(
        "Error 4003: failed to connect to backend",
        `IAP connects from 35.235.240.0/20, and ${v.fw === "office" ? "the only rule allows the office IP, not IAP's range" : "no rule allows it"}. The error appears after IAP already accepted you, so it looks later than the real cause.`,
      );
    } else {
      steps.push(
        `Firewall lets 35.235.240.0/20 reach port 22${v.fw === "world" ? " (only because 0.0.0.0/0 includes it; add a dedicated rule before removing the wide one)" : ""}.`,
      );
      if (v.sshd === "down") {
        out = fail(
          "Error 4003: failed to connect to backend",
          "The path is open but nothing is listening on port 22. Same error as a missing rule; check the VM's serial port output.",
        );
      } else {
        steps.push("The tunnel reaches the SSH server on the VM.");
        if (!withOsLogin) {
          out = ["Shell open", `IAP gate passed.${v.fw === "world" ? " But port 22 is still open to the whole internet." : ""}`, v.fw === "world" ? "warn" : "ok"];
        } else if (v.osl === "on") {
          if (v.oslrole === "none") {
            out = fail(
              "Permission denied (publickey)",
              "Gate 1 passed, gate 2 did not: no OS Login role, so the VM refuses the login. Metadata keys are ignored when OS Login is on.",
            );
          } else if (v.sau === "no") {
            out = fail("Login refused", "The VM runs as a service account, and you lack roles/iam.serviceAccountUser on it.");
          } else {
            steps.push(`OS Login accepts you as you_kade_lk${v.oslrole === "admin" ? ", with sudo" : ", without sudo"}.`);
            out = ["Shell open", `Both gates passed on identity alone.${v.oslrole === "user" ? " No sudo: that needs compute.osAdminLogin." : ""}`, "ok"];
          }
        } else {
          steps.push("OS Login is off, so the VM checks SSH keys in metadata.");
          out = [
            "Shell open, the old way",
            "gcloud pushed your public key into project metadata (it works because you can edit metadata). That key now works on every VM and stays until someone removes it.",
            "warn",
          ];
        }
      }
    }
  }
  return (
    <WidgetFrame label="Why does SSH through IAP fail?">
      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
        <Select label="IAP API" value={v.api} onChange={set("api")} options={[{ value: "on", label: "enabled" }, { value: "off", label: "not enabled" }]} />
        <Select
          label="Your IAM role"
          value={v.role}
          onChange={set("role")}
          options={[
            { value: "tunnel", label: "iap.tunnelResourceAccessor" },
            { value: "owner", label: "owner" },
            { value: "editor", label: "editor only" },
            { value: "none", label: "none" },
          ]}
        />
        <Select
          label="Firewall for port 22"
          value={v.fw}
          onChange={set("fw")}
          options={[
            { value: "iap", label: "allow from 35.235.240.0/20" },
            { value: "world", label: "allow from 0.0.0.0/0" },
            { value: "none", label: "no allow rule" },
            { value: "office", label: "allow from office IP only" },
          ]}
        />
        <Select label="SSH server on the VM" value={v.sshd} onChange={set("sshd")} options={[{ value: "up", label: "running" }, { value: "down", label: "stopped or crashed" }]} />
        {withOsLogin && (
          <>
            <Select label="OS Login on the VM" value={v.osl} onChange={set("osl")} options={[{ value: "on", label: "enable-oslogin=TRUE" }, { value: "off", label: "off (metadata keys)" }]} />
            <Select
              label="Your login role"
              value={v.oslrole}
              onChange={set("oslrole")}
              options={[
                { value: "admin", label: "compute.osAdminLogin" },
                { value: "user", label: "compute.osLogin" },
                { value: "none", label: "none" },
              ]}
            />
            <Select label="serviceAccountUser on VM's SA" value={v.sau} onChange={set("sau")} options={[{ value: "yes", label: "granted" }, { value: "no", label: "not granted" }]} />
          </>
        )}
      </div>
      <div aria-live="polite" className="mt-5 space-y-4">
        <Result tone={out[2]}>
          <b>{out[0]}.</b> {out[1]}
        </Result>
        <Steps>{steps}</Steps>
      </div>
    </WidgetFrame>
  );
}

// ── Chapter 6.1: who may open a tunnel to what ─────────────────────────────

type Grant = { who: string; member: string; role: string; on: string; port?: number; until?: string; expired?: boolean };
type GrantCase = Case & { grant: (what: string) => Grant };
/** What a tunnel could reach: a VM and a port. Only port 22 has a firewall rule from IAP's range. */
const IAP_TARGETS: [string, number][] = [
  ["kade-api-1", 22],
  ["kade-api-2", 22],
  ["kade-db", 22],
  ["kade-worker", 22],
  ["kade-db", 5432],
];
const TUNNEL_ROLE = "iap.tunnelResourceAccessor";

const GRANT_CASES: GrantCase[] = [
  {
    k: "A",
    t: "You, the only infrastructure person",
    grant: () => ({ who: "You", member: "user:you@kade.lk", role: TUNNEL_ROLE, on: "project kade-prod" }),
    take: "One grant on the project opens a tunnel to <b>every VM, on any port</b>. IAM is not the only gate, though: kade-db's PostgreSQL port has no firewall rule from IAP's range, so that tunnel would open and then fail with <code>4003</code>. IAM decides <b>who</b>; the firewall decides <b>which ports can be reached at all</b>.",
    cfg: "you@kade.lk → roles/iap.tunnelResourceAccessor on project kade-prod\n→ can tunnel to every VM, on 22 and on any other port IAP's range is allowed to reach",
  },
  {
    k: "B",
    t: "A freelancer fixing one background job",
    grant: () => ({ who: "Freelancer", member: "user:dev@freelance.example", role: TUNNEL_ROLE, on: "VM kade-worker", port: 22 }),
    take: "The grant names one person, one VM and one port, so it opens exactly one target. With a bastion, the same job would mean an SSH key on a machine that can reach every VM. Here the access shows up in IAM, where it is easy to review, and you <b>remove the grant when the job is done</b>.",
    cfg: "dev@freelance.example → roles/iap.tunnelResourceAccessor\n                        on VM kade-worker only\n                        condition: destination.port == 22\n→ can SSH to kade-worker, nothing else. Remove the grant when the job is done.",
  },
  {
    k: "C",
    t: "The on-call rota, for one week",
    what: [
      ["during", "During the on-call week"],
      ["after", "After the grant expires"],
    ],
    grant: (w) => ({ who: "On-call group", member: "group:oncall@kade.lk", role: TUNNEL_ROLE, on: "project kade-prod", port: 22, until: "25 Oct, 18:00", expired: w === "after" }),
    take: {
      during:
        "Grant the role to a <b>group</b>, not to each person, and give it an <b>end date</b> in the condition. Whoever is in the group this week can SSH to every VM, and only on port 22.",
      after:
        "The condition now evaluates to false, so the same grant opens nothing. <b>Nobody had to remember to remove it.</b> That is the safest kind of temporary access: it ends by itself.",
    },
    cfg: 'group:oncall@kade.lk → roles/iap.tunnelResourceAccessor on project kade-prod\n  condition: destination.port == 22\n             && request.time < timestamp("2026-10-25T18:00:00Z")',
  },
  {
    k: "D",
    t: "A developer with the Editor role",
    grant: () => ({ who: "Developer", member: "user:dev2@kade.lk", role: "roles/editor", on: "project kade-prod" }),
    take: "Editor can change almost everything in the project, but it does <b>not</b> include permission to open IAP tunnels. Every attempt ends at IAP with <code>4033: not authorized</code>. Broad access does not cover this; the tunnel role has to be granted on purpose.",
    cfg: "dev2@kade.lk → roles/editor on project kade-prod\n→ no iap.tunnelInstances.accessViaIAP permission\n→ every tunnel: 4033 not authorized",
  },
];

function GrantView({ c, what }: { c: GrantCase; what: string }) {
  const g = c.grant(what);
  const tunnelRole = g.role === TUNNEL_ROLE;
  const rows = IAP_TARGETS.map(([vm, port]) => {
    const iam = tunnelRole && !g.expired && (g.on.startsWith("project") || g.on === `VM ${vm}`) && (!g.port || g.port === port);
    const fw = port === 22;
    return { vm, port, iam, fw };
  });
  const open = rows.filter((r) => r.iam && r.fw).length;
  const mid = (i: number) => 59 + 76 * i;
  return (
    <div className="space-y-4">
      <Drawing h={420} label={`${g.who}'s IAM grant and the VM ports it opens through IAP`}>
        <Caps x={16} y={24}>WHO</Caps>
        <Caps x={270} y={24}>IAM GRANT</Caps>
        <Caps x={640} y={24}>VM AND PORT</Caps>
        <Box x={16} y={175} w={220} h={72} />
        <T x={30} y={203} k="t">{g.who}</T>
        <T x={30} y={225}>{g.member}</T>
        <Wire x1={236} y1={211} x2={267} y2={211} />
        <Box x={270} y={146} w={300} h={130} c="orange" />
        <T x={286} y={176} k="t">{g.role}</T>
        <T x={286} y={200}>{`on ${g.on}`}</T>
        {tunnelRole ? (
          <>
            <T x={286} y={224}>{g.port ? `if port == ${g.port}` : "any port"}</T>
            {g.until && <T x={286} y={248} k={g.expired ? "s c-red" : "s"}>{`and before ${g.until}${g.expired ? ": expired" : ""}`}</T>}
          </>
        ) : (
          <T x={286} y={224} k="s c-red">no IAP tunnel permission</T>
        )}
        {rows.map((r, i) => {
          const y = mid(i) - 29;
          const ok = r.iam && r.fw;
          return (
            <g key={`${r.vm}${r.port}`}>
              {ok && <path className="w green" d={`M570 211 H604 V${mid(i)} H637`} markerEnd="url(#dd-ah-green)" />}
              {r.iam && !r.fw && <path className="w dash" d={`M570 211 H604 V${mid(i)} H626`} />}
              <g className={r.iam ? undefined : "off"}>
                <Box x={640} y={y} w={304} h={58} c={ok ? "green" : undefined} />
                <T x={654} y={y + 24} k="t">{`${r.vm} :${r.port}`}</T>
                <T x={930} y={y + 24} end bold={ok} k={ok ? "s" : r.iam ? "s c-red" : "f"}>
                  {ok ? "can tunnel" : r.iam ? "firewall blocks" : "not granted"}
                </T>
                <T x={654} y={y + 45} k="f">
                  {ok ? "IAM yes · firewall yes" : r.iam ? "IAM yes · no rule from IAP for this port" : tunnelRole && !g.expired ? "outside the grant" : "IAM says no: 4033"}
                </T>
              </g>
              {r.iam && !r.fw && <Mark cx={640} cy={mid(i)} ok={false} />}
            </g>
          );
        })}
      </Drawing>
      <p className="text-ink-body border-rule border-t pt-3 font-mono text-[13.5px] leading-[1.6]">
        {`${g.member} · opens ${open} of ${rows.length} targets`}
      </p>
    </div>
  );
}

/** Four IAM grants, and the VM ports each one opens. */
export function IapGrantEx() {
  return <CaseExplorer label="IAP grants: who may tunnel to what" cases={GRANT_CASES} render={(c, what) => <GrantView c={c} what={what} />} />;
}

// ── Chapter 6.1: what a tunnel can carry ───────────────────────────────────

type TunCase = Case & {
  app: [string, string];
  local: [string, string];
  vm: string;
  ports: [string, string][];
  /** The VM port the tunnel lands on, and, with SSH forwarding, the port sshd hands it to. */
  hit: number;
  inner?: number;
  rule: (what: string) => [string, string, boolean];
};

const TUN_CASES: TunCase[] = [
  {
    k: "SSH",
    t: "a shell on a VM",
    app: ["ssh", "your terminal"],
    local: ["gcloud compute ssh", "carries ssh to IAP"],
    vm: "kade-api-1",
    ports: [[":22", "sshd"]],
    hit: 0,
    rule: () => ["tcp:22 from IAP", "kade-ssh-from-iap", true],
    take: "The everyday case. gcloud starts your SSH client and carries its bytes through IAP to port 22. Nothing listens on your laptop, and SSH encrypts everything end to end.",
    cfg: "gcloud compute ssh kade-api-1 --zone=asia-southeast1-a --tunnel-through-iap",
  },
  {
    k: "Database, direct",
    t: "a tunnel to port 5432",
    what: [
      ["ok", "With a 5432 rule"],
      ["norule", "What if only the SSH rule exists?"],
    ],
    app: ["psql", "-h localhost -p 5433"],
    local: ["start-iap-tunnel", "listens on localhost:5433"],
    vm: "kade-db",
    ports: [
      [":22", "sshd"],
      [":5432", "PostgreSQL"],
    ],
    hit: 1,
    rule: (w) => (w === "norule" ? ["tcp:22 from IAP", "nothing for 5432", false] : ["tcp:5432 from IAP", "a new rule, kade-db only", true]),
    take: {
      ok: "gcloud listens on <code>localhost:5433</code> and sends whatever arrives there through IAP to kade-db's port 5432. psql thinks the database is on your laptop. The cost is <b>a new firewall rule</b>: 5432 from IAP's range, to kade-db only.",
      norule: "IAP accepts you, then cannot reach port 5432: the firewall drops it, and you see <code>4003</code> after a pause, exactly as in section 04. Add the rule, or use the next tab, which needs none.",
    },
    cfg: "firewall:  allow tcp:5432 from 35.235.240.0/20 to SA sa-kade-db\nlaptop:    gcloud compute start-iap-tunnel kade-db 5432 \\\n             --local-host-port=localhost:5433 --zone=asia-southeast1-b\n           psql -h localhost -p 5433 -U kade",
  },
  {
    k: "Database, through SSH",
    t: "no new rule",
    app: ["psql", "-h localhost -p 5433"],
    local: ["gcloud compute ssh -L", "5433 → VM's localhost:5432"],
    vm: "kade-db",
    ports: [
      [":22", "sshd"],
      [":5432", "PostgreSQL"],
    ],
    hit: 0,
    inner: 1,
    rule: () => ["tcp:22 from IAP", "the rule you already have", true],
    take: "The tunnel goes to port 22, like any SSH session, and <b>SSH itself</b> forwards your laptop's port 5433 to port 5432 on the VM's own localhost. It reuses the SSH rule and needs nothing new, so it is the better default for occasional work.",
    cfg: "laptop:    gcloud compute ssh kade-db --tunnel-through-iap \\\n             -- -L 5433:localhost:5432\n           psql -h localhost -p 5433 -U kade",
  },
  {
    k: "Admin web page",
    t: "a private dashboard",
    app: ["browser", "http://localhost:8080"],
    local: ["start-iap-tunnel", "listens on localhost:8080"],
    vm: "kade-worker",
    ports: [
      [":22", "sshd"],
      [":8080", "job-queue dashboard"],
    ],
    hit: 1,
    rule: () => ["tcp:8080 from IAP", "a new rule, kade-worker only", true],
    take: "Say kade-worker serves a job-queue dashboard on port 8080. Tunnel it to your laptop and open it in a browser; nothing about it is public. For a page that many people use, <b>IAP for HTTPS</b> (section 07) fits better: they sign in with their browser and need no gcloud.",
    cfg: "firewall:  allow tcp:8080 from 35.235.240.0/20 to SA sa-kade-worker\nlaptop:    gcloud compute start-iap-tunnel kade-worker 8080 \\\n             --local-host-port=localhost:8080 --zone=asia-southeast1-a\n           then open http://localhost:8080",
  },
];

function TunView({ c, what }: { c: TunCase; what: string }) {
  const [rule, note, allowed] = c.rule(what);
  const portMid = (i: number) => 157 + 58 * i;
  return (
    <Drawing h={306} label={`An IAP tunnel from ${c.app[0]} on your laptop to ${c.vm} ${c.ports[c.hit][0]}`}>
      <Zone x={16} y={16} w={250} h={274} />
      <T x={32} y={40}>your laptop</T>
      <Box x={32} y={56} w={218} h={60} />
      <T x={46} y={82} k="t">{c.app[0]}</T>
      <T x={46} y={102}>{c.app[1]}</T>
      <Wire x1={141} y1={116} x2={141} y2={169} />
      <Box x={32} y={172} w={218} h={68} />
      <T x={46} y={198} k="t">{c.local[0]}</T>
      <T x={46} y={220}>{c.local[1]}</T>

      <Zone x={286} y={16} w={658} h={274} c="purple" />
      <T x={302} y={40}>Google&apos;s network</T>
      <Box x={306} y={174} w={140} h={64} c="purple" />
      <T x={320} y={200} k="t">IAP</T>
      <T x={320} y={222}>checks you</T>
      <Wire x1={250} y1={206} x2={303} y2={206} c="green" />

      <Zone x={470} y={52} w={458} h={226} c="blue" />
      <T x={486} y={76}>kade-vpc</T>
      <Box x={490} y={174} w={150} h={64} c="orange" />
      <T x={504} y={200} k="t">firewall</T>
      <T x={504} y={220}>{rule}</T>
      <T x={490} y={258} k={allowed ? "f" : "f c-red"}>{note}</T>
      {allowed ? (
        <>
          <Wire x1={446} y1={206} x2={487} y2={206} c="green" />
          <path className="w green" d={`M640 206 H658 V${portMid(c.hit)} H687`} markerEnd="url(#dd-ah-green)" />
        </>
      ) : (
        <>
          <path className="w fault dash" d="M446 206 H477" />
          <Mark cx={490} cy={206} ok={false} />
        </>
      )}

      <Box x={670} y={92} w={246} h={176} c="blue" />
      <T x={684} y={118} k="t">{c.vm}</T>
      {c.ports.map(([p, label], i) => {
        const used = allowed && (i === c.hit || i === c.inner);
        return (
          <g key={p} className={used ? undefined : "off"}>
            <Box x={690} y={portMid(i) - 23} w={206} h={46} c={used ? "green" : undefined} />
            <T x={704} y={portMid(i) + 5} k="t">{p}</T>
            <T x={764} y={portMid(i) + 5}>{label}</T>
          </g>
        );
      })}
      {c.inner !== undefined && (
        <path className="w green" d={`M896 ${portMid(c.hit)} H908 V${portMid(c.inner)} H899`} markerEnd="url(#dd-ah-green)" />
      )}
      {c.inner !== undefined && (
        <T x={684} y={262} k="f" size={11}>
          sshd hands it to localhost:5432
        </T>
      )}
    </Drawing>
  );
}

/** Four ways to use an IAP tunnel, from an app on your laptop to a port on a VM. */
export function IapTunnelEx() {
  return <CaseExplorer label="What an IAP tunnel can carry" cases={TUN_CASES} render={(c, what) => <TunView c={c} what={what} />} />;
}

// ── Chapter 6.1: IAP for HTTPS, on a load balancer ─────────────────────────

type WebFlow = {
  /** Where the request starts: a browser through the load balancer, or a VM that skips it. */
  from: "browser" | "vm";
  who: [string, string];
  signedIn?: boolean;
  role?: boolean;
  /** Does the dashboard check the signed header? */
  verify?: boolean;
  sees: string;
};
type WebCase = Case & { flow: (what: string) => WebFlow };

const WEB_CASES: WebCase[] = [
  {
    k: "A",
    t: "First visit, not signed in",
    flow: () => ({ from: "browser", who: ["Staff member", "no session yet"], signedIn: false, sees: "Google sign-in page" }),
    take: "IAP finds no session, so it does not send the request on. It redirects the browser to <b>Google sign-in</b>. After signing in, the browser comes back to <code>admin.kade.lk</code> with a session cookie, and the next request carries it. Nothing reached kade-worker.",
    cfg: "GET https://admin.kade.lk/\n→ 302 redirect to accounts.google.com (sign in)\n→ back to admin.kade.lk with an IAP session cookie",
  },
  {
    k: "B",
    t: "A staff member who is allowed",
    flow: () => ({ from: "browser", who: ["you@kade.lk", "signed in"], signedIn: true, role: true, verify: true, sees: "the dashboard" }),
    take: "Signed in, and IAM grants <code>roles/iap.httpsResourceAccessor</code> on this backend service, so IAP forwards the request. It adds a <b>signed header</b>, <code>x-goog-iap-jwt-assertion</code>, that says who you are. The dashboard checks the signature and knows the request came through IAP, as you@kade.lk.",
    cfg: "staff@kade.lk (group) → roles/iap.httpsResourceAccessor on backend service kade-admin\n\nrequest to kade-worker:8080 carries:\n  x-goog-iap-jwt-assertion: <a token signed by Google, naming you@kade.lk>",
  },
  {
    k: "C",
    t: "Signed in, but not granted",
    flow: () => ({ from: "browser", who: ["guest@gmail.com", "signed in"], signedIn: true, role: false, sees: "403: no access" }),
    take: "Signing in only proves <b>who</b> you are. This identity has no grant on the backend service, so IAP answers <b>403</b> itself. The request never reaches the VPC, so kade-worker never sees it.",
    cfg: "guest@gmail.com: signed in, no roles/iap.httpsResourceAccessor\n→ 403 from IAP; nothing is sent to kade-worker",
  },
  {
    k: "D",
    t: "A request that skips the load balancer",
    what: [
      ["verify", "The app checks the signed header"],
      ["trust", "What if the app trusts the header?"],
    ],
    flow: (w) => ({ from: "vm", who: ["Another VM", "in kade-vpc"], verify: w === "verify", sees: w === "verify" ? "rejected" : "the dashboard, as an admin" }),
    take: {
      verify:
        "IAP only guards the path <b>through the load balancer</b>. Here a VM inside kade-vpc calls kade-worker:8080 directly, which works if a firewall rule is too wide (like the old <code>kade-allow-internal</code>). It sends a forged identity header. The dashboard checks the signature, finds none it can trust, and <b>rejects</b> it.",
      trust:
        "The same request, but the dashboard reads the header without checking the signature. The forged header says <code>admin@kade.lk</code>, and the dashboard <b>believes it</b>. This is why the app must verify the signed header, and why the firewall should let 8080 in from the load balancer's ranges only.",
    },
    cfg: "curl http://10.10.1.20:8080/ -H 'x-goog-iap-jwt-assertion: <forged>'\n\nverifies the signature → no valid Google signature → rejected\ntrusts the header      → \"admin@kade.lk\" → let in",
  },
];

function WebView({ c, what }: { c: WebCase; what: string }) {
  const f = c.flow(what);
  const viaLb = f.from === "browser";
  const passIap = viaLb && !!f.signedIn && !!f.role;
  const reaches = passIap || !viaLb;
  const fooled = !viaLb && !f.verify;
  const tone: Tone = passIap ? "ok" : fooled ? "fault" : viaLb ? "warn" : "ok";
  return (
    <div className="space-y-4">
      <Drawing h={392} label={`A request to admin.kade.lk from ${f.who[0]}, and how far it gets`}>
        <g className={viaLb ? undefined : "off"}>
          <Box x={16} y={70} w={190} h={92} />
          <T x={30} y={94} k="t">{viaLb ? f.who[0] : "Browser"}</T>
          <T x={30} y={114}>{viaLb ? f.who[1] : "not used"}</T>
          {viaLb && <T x={30} y={140} k="f">sees:</T>}
          {viaLb && <T x={30} y={156} k={passIap ? "s" : "s c-red"} bold>{f.sees}</T>}
        </g>

        <Zone x={226} y={16} w={718} h={362} c="purple" />
        <T x={242} y={40}>Google&apos;s network</T>
        <g className={viaLb ? undefined : "off"}>
          <Box x={246} y={76} w={200} h={80} c="orange" />
          <T x={260} y={102} k="t">load balancer</T>
          <T x={260} y={124}>34.120.88.10 · TLS</T>
          <T x={260} y={144}>URL map → kade-admin</T>
          <Box x={476} y={56} w={240} h={150} c="orange" />
          <T x={490} y={82} k="t">backend service</T>
          <T x={490} y={102}>kade-admin · IAP on</T>
          <T x={516} y={140}>1 signed in?</T>
          <T x={516} y={176}>2 IAM role?</T>
          {viaLb && <Mark cx={500} cy={135} ok={!!f.signedIn} />}
          {viaLb && f.signedIn && <Mark cx={500} cy={171} ok={!!f.role} />}
          {viaLb && f.signedIn === false && <T x={516} y={196} k="f">not checked yet</T>}
        </g>
        {viaLb && (
          <>
            <Wire x1={206} y1={116} x2={243} y2={116} c="green" />
            <Wire x1={446} y1={116} x2={473} y2={116} c="green" />
          </>
        )}
        {viaLb && !f.signedIn && (
          <>
            <path className="w dash" d="M476 196 H462 V184 H111 V165" markerEnd="url(#dd-ah-muted)" />
            <T x={256} y={176} k="f">redirect to Google sign-in</T>
          </>
        )}

        <Zone x={246} y={226} w={682} h={140} c="blue" />
        <T x={262} y={250}>kade-vpc</T>
        <g className={viaLb ? "off" : undefined}>
          <Box x={266} y={266} w={190} h={80} c={viaLb ? undefined : "red"} />
          <T x={280} y={292} k="t">Another VM</T>
          <T x={280} y={312}>in kade-vpc</T>
          <T x={280} y={332} k={viaLb ? "f" : "s c-red"}>forged header</T>
        </g>
        <g className={reaches ? undefined : "off"}>
          <Box x={496} y={272} w={160} h={68} c="orange" />
          <T x={510} y={296} k="t">firewall</T>
          <T x={510} y={314}>8080 from</T>
          <T x={510} y={331}>{viaLb ? "LB ranges" : "10.10.0.0/16"}</T>
          <Box x={690} y={258} w={222} h={96} c="blue" />
          <T x={704} y={284} k="t">kade-worker :8080</T>
          <T x={704} y={304}>job-queue dashboard</T>
          {reaches && <T x={728} y={334} k={fooled ? "s c-red" : "s"} bold>{passIap ? "header verified" : f.verify ? "rejects: bad signature" : "trusts forged header"}</T>}
          {reaches && <Mark cx={712} cy={329} ok={passIap || !!f.verify} />}
        </g>
        {passIap && <path className="w green" d="M596 206 V269" markerEnd="url(#dd-ah-green)" />}
        {reaches && <Wire x1={656} y1={306} x2={687} y2={306} c={viaLb ? "green" : "red"} />}
        {!viaLb && <Wire x1={456} y1={306} x2={493} y2={306} c="red" />}
      </Drawing>
      <Result tone={tone}>
        <b>{`${f.who[0]} sees: ${f.sees}.`}</b>{" "}
        {passIap
          ? "Both IAP checks passed, and the app confirmed the signed header."
          : fooled
            ? "IAP was never asked, and the app took the forged header at its word."
            : viaLb
              ? "IAP stopped the request before it reached kade-vpc."
              : "IAP was never asked, but the app's own check caught it."}
      </Result>
    </div>
  );
}

/** Four requests to an IAP-protected admin page, and how far each one gets. */
export function IapWebEx() {
  return <CaseExplorer label="IAP for HTTPS: who gets the page" cases={WEB_CASES} render={(c, what) => <WebView c={c} what={what} />} />;
}

// ── Chapter 6.2: who can log in with OS Login ──────────────────────────────

/** One check: passed, failed, or not reached. */
type LoginCheck = [state: "ok" | "no" | "skip", detail: string];
type LoginOutcome = { ok: boolean; title: string; sub: string; bad?: boolean };
type LoginCase = Case & {
  who: (what: string) => [string, string];
  vm: string;
  checks: (what: string) => LoginCheck[];
  out: (what: string) => LoginOutcome;
};

const LOGIN_CHECKS = ["OS Login is on for this VM", "A login role", "May use the VM's service account", "Inside kade.lk, or allowed in"];

const LOGIN_CASES: LoginCase[] = [
  {
    k: "A",
    t: "You, with sudo",
    who: () => ["you@kade.lk", "project admin"],
    vm: "kade-db",
    checks: () => [
      ["ok", "enable-oslogin=TRUE on the project"],
      ["ok", "compute.osAdminLogin: with sudo"],
      ["ok", "serviceAccountUser on sa-kade-db"],
      ["ok", "you@kade.lk is in the organization"],
    ],
    out: () => ({ ok: true, title: "logged in as you_kade_lk", sub: "sudo works" }),
    take: "Every check passes. <code>osAdminLogin</code> is the role <b>with</b> sudo, so you can run admin commands. The Linux user comes from your identity, and that is the name the VM's logs show.",
    cfg: "you@kade.lk → roles/compute.osAdminLogin on project kade-prod\n             roles/iam.serviceAccountUser on sa-kade-db",
  },
  {
    k: "B",
    t: "A teammate, without sudo",
    who: () => ["dev2@kade.lk", "developer"],
    vm: "kade-db",
    checks: () => [
      ["ok", "enable-oslogin=TRUE on the project"],
      ["ok", "compute.osLogin: no sudo"],
      ["ok", "serviceAccountUser on sa-kade-db"],
      ["ok", "dev2@kade.lk is in the organization"],
    ],
    out: () => ({ ok: true, title: "logged in as dev2_kade_lk", sub: "sudo refused" }),
    take: "The same path with <code>compute.osLogin</code>, the role <b>without</b> sudo. The teammate can read logs and run commands as an ordinary user, but cannot change the system. Give this role to anyone who does not need admin rights.",
    cfg: "dev2@kade.lk → roles/compute.osLogin on project kade-prod\n              roles/iam.serviceAccountUser on sa-kade-db",
  },
  {
    k: "C",
    t: "The service account trap",
    what: [
      ["missing", "No serviceAccountUser"],
      ["fixed", "What if it is granted?"],
    ],
    who: () => ["dev2@kade.lk", "developer"],
    vm: "kade-db",
    checks: (w) => [
      ["ok", "enable-oslogin=TRUE on the project"],
      ["ok", "compute.osLogin"],
      w === "fixed" ? ["ok", "serviceAccountUser on sa-kade-db"] : ["no", "nothing on sa-kade-db"],
      w === "fixed" ? ["ok", "dev2@kade.lk is in the organization"] : ["skip", "not reached"],
    ],
    out: (w) => (w === "fixed" ? { ok: true, title: "logged in as dev2_kade_lk", sub: "no sudo" } : { ok: false, title: "login refused", sub: "despite the login role" }),
    take: {
      missing:
        "kade-db runs as <b>sa-kade-db</b>, and anyone logged in to it can use that service account's token from the metadata server. So OS Login also requires permission to <b>act as</b> sa-kade-db, which dev2 does not have. The login role alone is not enough, and the refusal surprises people every time.",
      fixed: "With <code>serviceAccountUser</code> on sa-kade-db, the same person logs in. Grant it on the service account each VM runs as, not on the whole project, or the person can act as every service account.",
    },
    cfg: "gcloud iam service-accounts add-iam-policy-binding \\\n  sa-kade-db@kade-prod.iam.gserviceaccount.com \\\n  --member=user:dev2@kade.lk --role=roles/iam.serviceAccountUser",
  },
  {
    k: "D",
    t: "The freelancer, from outside kade.lk",
    what: [
      ["missing", "Without the external role"],
      ["fixed", "What if it is granted?"],
    ],
    who: () => ["dev@freelance.example", "outside the organization"],
    vm: "kade-worker",
    checks: (w) => [
      ["ok", "enable-oslogin=TRUE on the project"],
      ["ok", "compute.osLogin on kade-worker only"],
      ["ok", "serviceAccountUser on sa-kade-worker"],
      w === "fixed" ? ["ok", "osLoginExternalUser at the organization"] : ["no", "not in kade.lk, no external role"],
    ],
    out: (w) => (w === "fixed" ? { ok: true, title: "logged in to kade-worker", sub: "and no other VM" } : { ok: false, title: "login refused", sub: "an outside account" }),
    take: {
      missing:
        "The freelancer's account belongs to another organization. OS Login refuses outside accounts unless they also hold <code>roles/compute.osLoginExternalUser</code>, which is granted at the <b>organization</b> level, not on a project.",
      fixed: "With the external role added, the freelancer logs in to kade-worker, the one VM the login role names. Together with the IAP grant from chapter 6.1, that is three grants, all removable in one place when the job ends.",
    },
    cfg: "dev@freelance.example → roles/compute.osLogin on VM kade-worker\n                        roles/iam.serviceAccountUser on sa-kade-worker\n                        roles/compute.osLoginExternalUser on the organization",
  },
  {
    k: "E",
    t: "An old key from metadata",
    what: [
      ["on", "OS Login is on"],
      ["off", "What if one VM switches it off?"],
    ],
    who: () => ["Freelancer's old key", "in project ssh-keys"],
    vm: "kade-db",
    checks: (w) =>
      w === "off"
        ? [
            ["no", "enable-oslogin=FALSE on kade-db itself"],
            ["skip", "not checked: OS Login is off"],
            ["skip", "not checked"],
            ["skip", "not checked"],
          ]
        : [
            ["ok", "enable-oslogin=TRUE on the project"],
            ["no", "the key has no allowed owner"],
            ["skip", "not reached"],
            ["skip", "not reached"],
          ],
    out: (w) => (w === "off" ? { ok: true, bad: true, title: "in with the old key", sub: "metadata keys work again" } : { ok: false, title: "login refused", sub: "metadata keys are ignored" }),
    take: {
      on: "With OS Login on, the VM ignores keys in metadata completely. The freelancer's key is not on any allowed person's OS Login profile, so it opens nothing. That is how the old key stopped working the moment OS Login was switched on.",
      off: "A VM's own metadata overrides the project's. One <code>enable-oslogin=FALSE</code> on kade-db switches that VM back to metadata keys, and the old key works again there. That is why step 4 removes the keys too, and why command 2 checks each VM's own metadata.",
    },
    cfg: "project metadata:   enable-oslogin=TRUE, ssh-keys=[… freelancer …]\nkade-db's metadata: enable-oslogin=FALSE   ← overrides the project",
  },
];

function LoginView({ c, what }: { c: LoginCase; what: string }) {
  const [who, sub] = c.who(what);
  const checks = c.checks(what);
  const out = c.out(what);
  const rowY = (i: number) => 40 + i * 62;
  const good = out.ok && !out.bad;
  return (
    <div className="space-y-4">
      <Drawing h={300} label={`${who} logging in to ${c.vm}: the four OS Login checks and the result`}>
        <Box x={16} y={110} w={210} h={72} c={out.bad || c.k === "E" ? "red" : undefined} />
        <T x={30} y={138} k="t">{who}</T>
        <T x={30} y={160}>{sub}</T>
        <Caps x={270} y={24}>{`OS LOGIN CHECKS ON ${c.vm.toUpperCase()}`}</Caps>
        {checks.map(([state, detail], i) => {
          const y = rowY(i);
          return (
            <g key={LOGIN_CHECKS[i]} className={state === "skip" ? "off" : undefined}>
              <Box x={270} y={y} w={430} h={50} c={state === "no" ? "red" : undefined} />
              {state !== "skip" && <Mark cx={292} cy={y + 25} ok={state === "ok"} />}
              <T x={314} y={y + 21} k="t">{LOGIN_CHECKS[i]}</T>
              <T x={314} y={y + 40} k={state === "no" ? "s c-red" : "s"}>{detail}</T>
            </g>
          );
        })}
        <path className="w" d={`M226 146 H248 V${rowY(0) + 25} H267`} markerEnd="url(#dd-ah-muted)" />
        <Box x={740} y={110} w={204} h={72} c={good ? "green" : "red"} />
        <T x={754} y={138} k={good ? "t" : "t c-red"}>{out.title}</T>
        <T x={754} y={160}>{out.sub}</T>
        <path className={good ? "w green" : "w fault"} d="M700 146 H737" markerEnd={good ? "url(#dd-ah-green)" : "url(#dd-ah-fault)"} />
      </Drawing>
      <Result tone={good ? "ok" : "fault"}>
        <b>{`${who}: ${out.title}`}</b>, {out.sub}.
      </Result>
    </div>
  );
}

/** Five people or keys trying to log in, and which OS Login check decides. */
export function OsLoginEx() {
  return <CaseExplorer label="OS Login: who can log in" cases={LOGIN_CASES} render={(c, what) => <LoginView c={c} what={what} />} />;
}
