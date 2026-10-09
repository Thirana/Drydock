"use client";

import { useState } from "react";
import { IconCheck, IconX } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import data from "../data/gcp.json";
import { Field } from "../field";
import { Choices, WidgetNote } from "../ui";
import { WidgetFrame } from "../widget-frame";
import { CaseExplorer, Chain, Result, type Case } from "./case-explorer";
import { Box, Drawing, Mark, T } from "./draw";
import { Phases } from "./kit";

/* Part 6 · Running it: observability (chapters 16.1-16.2). */

// ── Chapter 16.1 ───────────────────────────────────────────────────────────

const OBS_NODES: Record<string, [x: number, y: number, t: string, s: string, c: string]> = {
  shop: [16, 74, "Shopper", "browser / app", ""],
  cf: [186, 74, "Cloudflare", "edge", ""],
  lb: [356, 74, "Load balancer", "+ Cloud Armor", "purple"],
  run: [526, 74, "Cloud Run", "kade-api", "blue"],
  sql: [760, 16, "Cloud SQL", "kade-sql", "green"],
  nat: [760, 98, "Cloud NAT", "→ PayGate", "blue"],
  vpn: [760, 180, "HA VPN", "→ office", ""],
  worker: [526, 190, "kade-worker", "VM in sn-app", "blue"],
  dns: [356, 190, "Cloud DNS", "private zones", "purple"],
};
const OBS_LINKS: [string, string, boolean?][] = [
  ["shop", "cf"],
  ["cf", "lb"],
  ["lb", "run"],
  ["run", "sql"],
  ["run", "nat"],
  ["worker", "sql"],
  ["worker", "vpn"],
  ["run", "dns", true],
  ["worker", "dns", true],
];
const OBS_SOURCES = [
  {
    k: "Load balancer logs",
    on: ["lb"],
    e: [["lb", "run"]],
    ans: ["Every request: URL, status, latency", "Who answered (statusDetails)", "Which Cloud Armor rule matched"],
    no: ["What happened inside kade-api", "Requests Cloudflare stopped at the edge"],
    def: "off: turn on per backend service",
    cost: "1 entry per request (sample to reduce)",
  },
  {
    k: "Cloud Run logs",
    on: ["run"],
    e: [],
    ans: ["Each request as Cloud Run saw it, incl. cold starts and crashes", "The app's own lines (stdout/stderr)"],
    no: ["Requests that never reached Cloud Run (blocked or no backend)"],
    def: "always on",
    cost: "1 request entry per request + app lines",
  },
  {
    k: "VPC Flow Logs",
    on: ["run", "worker", "sql", "nat", "vpn"],
    e: [
      ["run", "sql"],
      ["run", "nat"],
      ["worker", "sql"],
      ["worker", "vpn"],
    ],
    ans: ["Who talked to whom, ports, bytes, round-trip time", "Traffic to Cloud SQL, PayGate, the office"],
    no: ["Shopper requests from the LB to Cloud Run", "Exact counts (it is a sample)", "Content of anything"],
    def: "off: per subnet",
    cost: "grows with connections × sampling",
  },
  {
    k: "Firewall rule logs",
    on: ["worker"],
    e: [["worker", "vpn"]],
    ans: ["Which rule allowed or denied a connection"],
    no: ["ICMP", "Drops by the implied rules (add a logged deny-all)"],
    def: "off: per rule",
    cost: "1 entry per connection per logged rule",
  },
  {
    k: "Cloud NAT logs",
    on: ["nat"],
    e: [["run", "nat"]],
    ans: ["Dropped outgoing connections and why (ports ran out)"],
    no: ["Successful translations, unless you log them too"],
    def: "off: errors-only recommended",
    cost: "small with errors only",
  },
  {
    k: "Cloud DNS logs",
    on: ["dns"],
    e: [
      ["run", "dns"],
      ["worker", "dns"],
    ],
    ans: ["Every name a VM or Cloud Run looked up, and the answer"],
    no: ["What it then connected to"],
    def: "off: server policy logging",
    cost: "1 entry per query: can be large",
  },
  {
    k: "Cloud SQL logs",
    on: ["sql"],
    e: [],
    ans: ["Refused connections, slow queries, errors from PostgreSQL"],
    no: ["Network problems before the connection reaches it"],
    def: "on (PostgreSQL log); extra flags optional",
    cost: "grows with flags such as log_connections",
  },
  {
    k: "Cloudflare",
    on: ["cf"],
    e: [["shop", "cf"]],
    ans: ["Requests blocked or cached at the edge", "Visitors' real IPs and countries"],
    no: ["Anything after it hands the request to GCP"],
    def: "analytics on; Logpush on higher plans",
    cost: "Cloudflare plan",
  },
];
type ObsCase = Case & { i: number };
const OBS_CASES: ObsCase[] = OBS_SOURCES.map((s, i) => ({ k: s.k, i, take: `<b>On by default?</b> ${s.def}. <b>Volume:</b> ${s.cost}.` }));

function ObsView({ c }: { c: ObsCase }) {
  const src = OBS_SOURCES[c.i];
  const seen = (a: string, b: string) => src.e.some(([x, y]) => x === a && y === b);
  return (
    <div className="space-y-4">
      <Drawing h={262} label={`What ${src.k} can see in Kadé's platform; the parts it covers are marked`}>
        {OBS_LINKS.map(([a, b, dash]) => {
          const [ax, ay] = OBS_NODES[a];
          const [bx, by] = OBS_NODES[b];
          const on = seen(a, b);
          const back = bx < ax;
          const x1 = back ? ax : ax + 140;
          const y1 = ay + 30;
          const x2 = back ? bx + 140 : bx;
          const y2 = by + 30;
          return (
            <path
              key={`${a}${b}`}
              className={cn("w", on && "green", dash && "dash", !on && "off")}
              d={`M${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${back ? x2 + 3 : x2 - 3} ${y2}`}
              strokeWidth={on ? 3 : undefined}
              markerEnd={on ? "url(#dd-ah-green)" : undefined}
            />
          );
        })}
        {Object.entries(OBS_NODES).map(([key, [x, y, t, s, col]]) => {
          const on = src.on.includes(key);
          return (
            <g key={key} className={on ? undefined : "off"}>
              <Box x={x} y={y} w={140} h={60} c={col} className={on ? "cur" : undefined} />
              <T x={x + 12} y={y + 26} k="t" size={12.5}>{t}</T>
              <T x={x + 12} y={y + 45} size={10.5}>{s}</T>
            </g>
          );
        })}
      </Drawing>
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <div>
          <p className="text-ink-muted mb-2 text-[14px]">Can answer</p>
          <ul className="space-y-1.5">
            {src.ans.map((a) => (
              <li key={a} className="text-ink flex gap-2 text-[15px] leading-[1.45]">
                <span className="mt-[5px] shrink-0" aria-hidden="true">
                  <IconCheck size={11} />
                </span>
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-ink-muted mb-2 text-[14px]">Cannot answer</p>
          <ul className="space-y-1.5">
            {src.no.map((a) => (
              <li key={a} className="text-ink-muted flex gap-2 text-[15px] leading-[1.45]">
                <span className="mt-[5px] shrink-0" aria-hidden="true">
                  <IconX size={10} />
                </span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Which log answers which question, on Kadé's own map. */
export function ObsMap() {
  return <CaseExplorer label="What each log can see" cases={OBS_CASES} render={(c) => <ObsView c={c} />} />;
}

type LogLine = [key: string, value: string, note?: string, tone?: "ok" | "fault" | "mark"];
type EntryCase = Case & { lines: LogLine[] };
const ENTRY_CASES: EntryCase[] = [
  {
    k: "200 · normal request",
    take: "A normal request: the backend answered (<code>response_sent_by_backend</code>) in 184 ms, and Cloud Armor's default rule allowed it. Note <code>remoteIp</code> is a Cloudflare address; the shopper's IP is in the app's own log.",
    lines: [
      ["httpRequest.requestMethod", '"POST"'],
      ["httpRequest.requestUrl", '"https://api.kade.lk/v1/orders"'],
      ["httpRequest.status", "200", "what came back", "ok"],
      ["httpRequest.latency", '"0.184s"', "total time at the LB", "ok"],
      ["httpRequest.remoteIp", '"104.23.211.40"', "a Cloudflare edge, not the shopper", "mark"],
      ["jsonPayload.statusDetails", '"response_sent_by_backend"', "kade-api answered", "ok"],
      ["jsonPayload.enforcedSecurityPolicy.outcome", '"ACCEPT"'],
      ["jsonPayload.enforcedSecurityPolicy.priority", "2147483647", "default rule allowed it", "ok"],
      ["resource.labels.backend_service_name", '"kade-api-backend"'],
    ],
  },
  {
    k: "502 · nobody answered",
    take: "<code>failed_to_pick_backend</code> means the load balancer had nowhere to send the request: no healthy backend. The app never saw it, so there is no matching Cloud Run log. For a VM backend, check health checks (chapter 12); for Cloud Run, check that the revision is serving.",
    lines: [
      ["httpRequest.requestUrl", '"https://api.kade.lk/v1/cart"'],
      ["httpRequest.status", "502", "error produced by the LB itself", "fault"],
      ["httpRequest.latency", '"0.002s"', "instant: no backend tried", "fault"],
      ["jsonPayload.statusDetails", '"failed_to_pick_backend"', "no healthy backend available", "fault"],
      ["resource.labels.backend_service_name", '"kade-api-backend"'],
    ],
  },
  {
    k: "403 · Cloud Armor",
    take: "Cloud Armor answered 403 itself, so the backend never saw the request. <code>enforcedSecurityPolicy</code> says which policy and rule (priority 1000, the SQL injection rule) and what it did. This is how you tell a WAF block from an app's own 403.",
    lines: [
      ["httpRequest.requestUrl", '"https://api.kade.lk/v1/products?id=1%27%20OR..."'],
      ["httpRequest.status", "403", "answered by Cloud Armor", "fault"],
      ["jsonPayload.statusDetails", '"denied_by_security_policy"', "blocked before the backend", "fault"],
      ["jsonPayload.enforcedSecurityPolicy.name", '"kade-edge-policy"'],
      ["jsonPayload.enforcedSecurityPolicy.priority", "1000", "which rule matched", "mark"],
      ["jsonPayload.enforcedSecurityPolicy.outcome", '"DENY"'],
      ["enforcedSecurityPolicy.preconfiguredExprIds", '["…id942100-sqli"]', "the exact WAF signature", "mark"],
    ],
  },
  {
    k: "Backend timeout",
    take: "The request reached the backend but no answer came back in time. <code>latency</code> sits right at the timeout. Look at kade-api's own logs for that request (by trace ID) to see what it was waiting for, usually the database or PayGate.",
    lines: [
      ["httpRequest.requestUrl", '"https://api.kade.lk/v1/reports/sales"'],
      ["httpRequest.status", "504", "gateway timeout", "fault"],
      ["httpRequest.latency", '"300.001s"', "hit the time limit", "fault"],
      ["jsonPayload.statusDetails", '"backend_timeout"', "backend too slow to answer", "fault"],
      ["trace", '"projects/kade-prod/traces/4bf92f35…"', "find the app's lines for this request", "mark"],
    ],
  },
];

function EntryView({ c }: { c: EntryCase }) {
  return (
    <div className="overflow-x-auto">
      <div className="bg-code min-w-[700px] rounded-[2px] px-4 py-3 font-mono text-[13px] leading-[1.6]">
        <p className="text-ink-faint">{"{  one load balancer log entry, simplified"}</p>
        <dl className="mt-1">
          {c.lines.map(([key, value, note, tone]) => (
            <div key={key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,240px)] gap-x-4 py-[3px]">
              <dt className="break-all">
                <span className="text-ink-muted">{key}: </span>
                <span
                  className={cn(
                    note ? "font-bold" : "text-ink",
                    tone === "fault" && "text-fault",
                    tone === "ok" && "text-ink",
                    tone === "mark" && "dd-mark",
                  )}
                >
                  {value}
                </span>
              </dt>
              <dd className={cn("font-sans text-[13.5px]", tone === "fault" ? "text-fault" : "text-ink-body")}>{note && `← ${note}`}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/** Reading one load balancer log entry, field by field. */
export function LbEntry() {
  return <CaseExplorer label="Reading a load balancer log entry" cases={ENTRY_CASES} render={(c) => <EntryView c={c} />} />;
}

/** What VPC Flow Logs record, and the path they never see. */
export function FlowCover() {
  return (
    <WidgetFrame wide label="What flow logs cover">
      <Drawing h={358} label="Flow logs record connections leaving or entering kade-vpc's subnets, but not load balancer traffic to Cloud Run">
        <rect className="zone teal" x={300} y={16} width={420} height={250} rx="2" />
        <T x={316} y={40} size={12}>kade-vpc · flow logs on sn-run and sn-app</T>
        <Box x={16} y={40} w={200} h={64} />
        <T x={30} y={66} k="t" size={12.5}>Shoppers</T>
        <T x={30} y={86} size={11}>via Cloudflare + LB</T>
        <Box x={316} y={56} w={190} h={64} c="blue" />
        <T x={330} y={82} k="t" size={12.5}>kade-api egress</T>
        <T x={330} y={102} size={11}>Cloud Run, via sn-run</T>
        <Box x={316} y={140} w={190} h={64} c="blue" />
        <T x={330} y={166} k="t" size={12.5}>kade-worker</T>
        <T x={330} y={186} size={11}>VM in sn-app</T>
        <Box x={780} y={40} w={164} h={52} c="green" />
        <T x={794} y={70} k="t" size={12}>Cloud SQL</T>
        <Box x={780} y={110} w={164} h={52} />
        <T x={794} y={140} k="t" size={12}>PayGate (via NAT)</T>
        <Box x={780} y={180} w={164} h={52} />
        <T x={794} y={210} k="t" size={12}>Office (via VPN)</T>
        <path className="w fault dash" d="M216 72 C 260 72, 250 88, 313 88" />
        <Mark cx={262} cy={78} ok={false} r={10} />
        <T x={30} y={130} k="s c-red" size={11}>LB → Cloud Run does not</T>
        <T x={30} y={146} k="s c-red" size={11}>enter the VPC: not in</T>
        <T x={30} y={162} k="s c-red" size={11}>flow logs. Use LB logs.</T>
        {(
          [
            [506, 88, 780, 66],
            [506, 92, 780, 136],
            [506, 172, 780, 136],
            [506, 176, 780, 206],
          ] as const
        ).map(([x1, y1, x2, y2]) => (
          <path key={`${y1}${y2}`} className="w green" d={`M${x1} ${y1} C ${x1 + 120} ${y1}, ${x2 - 120} ${y2}, ${x2 - 3} ${y2}`} markerEnd="url(#dd-ah-green)" />
        ))}
        <T x={316} y={252} bold size={11}>✓ recorded: connections leaving or entering these subnets</T>
        <Box x={16} y={286} w={928} h={60} />
        <T x={32} y={310} size={11.5}>One record:  src 10.10.3.17:43122 → dest 10.10.32.3:5432 · TCP · 48 packets · 21 KB · rtt 2 ms · 14:02:05-14:02:10</T>
        <T x={32} y={330} k="f" size={11}>+ metadata: src Cloud Run kade-api (sn-run, asia-southeast1) · dest Cloud SQL range · sampled at 0.5</T>
      </Drawing>
    </WidgetFrame>
  );
}

/** A month of logs, from Kadé's daily traffic. */
export function LogCost() {
  const [v, setV] = useState({ req: "400000", img: "2000000", flows: "300000", fw: "50000" });
  const num = (k: keyof typeof v) => Math.max(0, parseFloat(v[k].replace(/,/g, "")) || 0);
  const kb = 1024;
  const gib = 1024 ** 3;
  const rows: [string, number][] = (
    [
      ["Load balancer, API (100%)", 1.5 * num("req") * kb],
      ["Load balancer, images (10%, 200s excluded)", 0.1 * num("img") * 0.02 * 1.5 * kb],
      ["Cloud Run request logs (API)", 1 * num("req") * kb],
      ["App logs (≈2 lines per API request)", 2 * num("req") * 0.6 * kb],
      ["VPC Flow Logs (sampling 0.5)", 0.5 * num("flows") * 1.2 * kb],
      ["Firewall rule logs", 1 * num("fw") * kb],
    ] as [string, number][]
  ).map(([n, b]) => [n, (30 * b) / gib]);
  const everything = ((1.5 * num("req") + 1.5 * num("img") + 1 * num("req") + 1.2 * num("req") + 1.2 * num("flows") + num("fw")) * kb * 30) / gib;
  const total = rows.reduce((a, [, g]) => a + g, 0);
  const most = Math.max(...rows.map(([, g]) => g), 0.001);
  const field = (k: keyof typeof v, label: string) => (
    <Field label={label} value={v[k]} onChange={(x) => setV((s) => ({ ...s, [k]: x }))} inputMode="numeric" />
  );
  return (
    <WidgetFrame label="How much will the logs be?">
      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
        {field("req", "API requests per day")}
        {field("img", "Image requests per day")}
        {field("flows", "Flow-log connections per day")}
        {field("fw", "Logged firewall connections per day")}
      </div>
      <div aria-live="polite" className="mt-5 space-y-4">
        <ul className="border-rule border-t">
          {rows.map(([n, g]) => (
            <li key={n} className="border-rule grid grid-cols-[minmax(0,1fr)_90px] items-center gap-x-4 border-b py-2 sm:grid-cols-[minmax(0,300px)_minmax(0,1fr)_90px]">
              <span className="text-ink text-[14.5px]">{n}</span>
              <span className="bg-sunk hidden h-2.5 rounded-[1px] sm:block" aria-hidden="true">
                <span className="bg-ink-muted block h-full rounded-[1px]" style={{ width: `${Math.max(1, (g / most) * 100)}%` }} />
              </span>
              <span className="text-ink text-right font-mono text-[13.5px]">{g.toFixed(1)} GiB</span>
            </li>
          ))}
        </ul>
        <Result tone="ok">
          <b>≈ {total.toFixed(1)} GiB per month</b> with Kadé&apos;s settings. Everything at 100% with no exclusions: ≈ {everything.toFixed(1)} GiB. Compare
          with the free monthly allotment and price per GiB on the Cloud Logging pricing page.
        </Result>
      </div>
      <WidgetNote>
        Assumed entry sizes: load balancer 1.5 KB, Cloud Run request 1 KB, app line 0.6 KB, flow record 1.2 KB, firewall 1 KB. Measure yours after a day: Logs
        Storage in the console shows volume per log.
      </WidgetNote>
    </WidgetFrame>
  );
}

const QUERYBOOK = data.QUERYBOOK as unknown as [string, string, string, string][];

/** Questions you will ask during an incident, and the query for each. */
export function QueryBook() {
  const [i, setI] = useState(0);
  const [, query, shows, look] = QUERYBOOK[i];
  return (
    <WidgetFrame label="Log query cookbook">
      <Choices label="Question" value={i} onChange={setI} options={QUERYBOOK.map(([q], j) => ({ value: j, label: q }))} />
      <div aria-live="polite" className="mt-5 space-y-3">
        <pre className="bg-code text-ink overflow-x-auto rounded-[2px] px-4 py-3 font-mono text-[13px] leading-[1.6]">{query}</pre>
        <ul className="text-ink-body space-y-1.5 text-[15px] leading-[1.55]">
          <li>
            <b className="text-ink">What it shows:</b> {shows}
          </li>
          <li>
            <b className="text-ink">What to look for:</b> {look}
          </li>
        </ul>
      </div>
    </WidgetFrame>
  );
}

// ── Chapter 16.2 ───────────────────────────────────────────────────────────

const PANELS: [title: string, note: string, f: (t: number) => number, range: [number, number], limit: number | null][] = [
  ["Requests per second", "normal: busy, steady", (t) => 60 + 15 * Math.sin(t / 3) + 4 * Math.sin(1.7 * t), [0, 100], null],
  ["5xx error ratio (%)", "rises at 14:00", (t) => (t > 28 ? 3.5 + 0.6 * Math.sin(t) : 0.3 + 0.15 * Math.sin(2 * t)), [0, 5], 2],
  ["p95 latency (ms)", "normal", (t) => 420 + 40 * Math.sin(t / 2) + (t > 28 ? 60 : 0), [0, 1600], 1500],
  ["Cloud Run instances / max", "plenty of room", (t) => 12 + 3 * Math.sin(t / 4), [0, 50], 50],
  ["NAT drops (OUT_OF_RESOURCES)", "rises at 14:00", (t) => (t > 28 ? 40 + 8 * Math.sin(1.3 * t) : 0), [0, 60], 0.5],
  ["Cloud SQL connections / max", "normal", (t) => 35 + 5 * Math.sin(t / 3), [0, 100], 80],
];

/** Six panels: what shoppers feel, and how close each limit is. */
export function DashMock() {
  const w = 296;
  return (
    <WidgetFrame wide label="A dashboard for kade-api">
      <Drawing h={396} label="Six dashboard panels; the error ratio and NAT drops rise at 14:00">
        {PANELS.map(([title, note, f, [lo, hi], limit], i) => {
          const x0 = 16 + (i % 3) * 316;
          const y0 = 16 + 190 * Math.floor(i / 3);
          const x = (t: number) => x0 + 12 + (t / 40) * 272;
          const y = (v: number) => y0 + 154 - ((v - lo) / (hi - lo)) * 100;
          const rising = note.startsWith("rises");
          const d = Array.from({ length: 81 }, (_, j) => j / 2)
            .map((t, j) => `${j ? "L" : "M"}${x(t).toFixed(1)} ${y(Math.max(lo, Math.min(hi, f(t)))).toFixed(1)}`)
            .join(" ");
          return (
            <g key={title}>
              <Box x={x0} y={y0} w={w} h={170} />
              <T x={x0 + 12} y={y0 + 22} k="t" size={12}>{title}</T>
              <T x={x0 + w - 12} y={y0 + 40} k={rising ? "s c-red" : "f"} end size={10.5}>{note}</T>
              {limit !== null && <line className="w fault dash" x1={x0 + 12} y1={y(limit)} x2={x0 + w - 12} y2={y(limit)} opacity={0.7} />}
              <path className="w" d={d} strokeWidth={2} style={{ stroke: "var(--dd-ink)" }} />
              <T x={x0 + 12} y={y0 + 166} k="f" size={10}>13:00</T>
              <T x={x0 + w - 12} y={y0 + 166} k="f" end size={10}>14:20</T>
              <line x1={x(28)} y1={y0 + 48} x2={x(28)} y2={y0 + 154} className="w" strokeDasharray="2 3" />
            </g>
          );
        })}
      </Drawing>
      <WidgetNote>Top row: what shoppers feel. Bottom row: how close to a limit. Dashed red: the alert threshold. Dotted: 14:00.</WidgetNote>
    </WidgetFrame>
  );
}

const UPTIME_CASES: Case[] = [
  {
    k: "Through Cloudflare",
    t: "recommended",
    what: [
      ["ok", "Normal"],
      ["bot", "What if Cloudflare challenges bots?"],
    ],
    take: {
      ok: "The checker calls <code>https://api.kade.lk/v1/health</code> exactly like a shopper: Cloudflare, the load balancer, Cloud Armor (the request carries Kadé's secret header because it came through Kadé's zone), then Cloud Run. If any hop fails, the check fails. That is what you want: it tests the whole front door.",
      bot: "Cloudflare's bot protection may answer a robot from a Google data centre with a challenge page instead of passing it on. The check fails while shoppers are fine. Fix: a Cloudflare rule that skips bot checks for the uptime checker's user agent (<code>GoogleStackdriverMonitoring-UptimeChecks</code>) on the health path only.",
    },
    cfg: 'URL: https://api.kade.lk/v1/health\nRegions: asia-pacific, europe, usa-oregon\nExpect: HTTP 200, body contains "ok"\nAlso: alert if the certificate expires within 14 days',
  },
  {
    k: "Origin directly",
    t: "34.120.88.10",
    what: [
      ["blocked", "With the origin lock"],
      ["allowed", "What if you allow the checkers?"],
    ],
    take: {
      blocked:
        "Calling the load balancer directly skips Cloudflare, so the request has no secret header and does not come from a Cloudflare address. The origin lock (chapter 13) returns 403, correctly, and the check always fails.",
      allowed:
        'Allowing the checker\'s ranges (command 1) plus a custom header the check sends would make it pass. It then tests the GCP side alone, which helps tell "Cloudflare is down" from "GCP is down", but every extra allow rule is a hole to maintain. Kadé checks through Cloudflare only.',
    },
    cfg: "Direct check: https://34.120.88.10 with Host: api.kade.lk\nNeeds: Cloud Armor allow for uptime checker ranges + custom header",
  },
];

function uptimeDrawing(c: Case, what: string) {
  if (c.k === "Through Cloudflare") {
    const bot = what === "bot";
    return (
      <Chain
        nodes={[
          { t: "Uptime checker", s: ["3 regions,", "every minute"], c: "purple" },
          { t: "Cloudflare", s: bot ? ["bot check:", "challenge page"] : ["passes it on,", "adds header"], c: bot ? "red" : undefined },
          { t: "LB + Cloud Armor", s: ["origin lock", "passes"], c: "purple" },
          { t: "Cloud Run", s: ["/v1/health", "→ 200 ok"], c: "blue" },
        ]}
        links={["1 request", "2 to origin", "3 to app"]}
        block={bot ? 1 : undefined}
        ok={!bot}
        result={bot ? "Check fails, but shoppers are fine: a false alarm" : "Check passes: the whole front door works"}
      />
    );
  }
  const allowed = what === "allowed";
  return (
    <Chain
      nodes={[
        { t: "Uptime checker", s: ["Google IPs"], c: "purple" },
        { t: "Cloudflare", s: ["skipped"] },
        { t: "LB + Cloud Armor", s: allowed ? ["allow: checker IPs", "+ check header"] : ["not Cloudflare,", "no header → 403"], c: allowed ? "yellow" : "red" },
        { t: "Cloud Run", s: ["/v1/health"], c: "blue" },
      ]}
      links={["skips", "straight to the LB", "3 to app"]}
      block={allowed ? undefined : 2}
      warn={allowed}
      result={allowed ? "Passes, but tests only the GCP side and adds an allow rule to maintain" : "Always fails: the origin lock blocks it, as designed"}
    />
  );
}

/** Where to point an uptime check, given Cloudflare and the origin lock. */
export function UptimeEx() {
  return <CaseExplorer label="Uptime check examples" cases={UPTIME_CASES} render={uptimeDrawing} />;
}

const ALERT_CASES: Case[] = [
  {
    k: "Error ratio over 40 minutes",
    what: [
      ["none", "Fire on any point above 2%"],
      ["dur", "Fire after 5 minutes above 2%"],
    ],
    take: {
      none: "The one-minute spike at 10 minutes (a deploy, a single bad client) fires an alert, then clears by itself. The real problem at 24 minutes fires too. Get a few of the first kind a week and you start ignoring both.",
      dur: "Requiring 5 minutes above the threshold ignores the short spike entirely, and fires for the real problem 5 minutes after it starts. A small delay buys alerts you can trust.",
    },
    cfg: 'Condition: loadbalancing.googleapis.com/https/request_count, 5xx / all\nThreshold: > 2%\nDuration: 5 minutes (the "for" window)',
  },
];

const errorRatio = (t: number) => (t >= 10 && t < 11 ? 4.5 : t >= 24 ? 3.4 + 0.4 * Math.sin(t) : 0.5 + 0.2 * Math.sin(1.5 * t));

function AlertView({ what }: { what: string }) {
  const x = (t: number) => 70 + (t / 40) * 860;
  const y = (v: number) => 230 - (v / 6) * 200;
  const d = Array.from({ length: 161 }, (_, i) => i / 4)
    .map((t, i) => `${i ? "L" : "M"}${x(t).toFixed(1)} ${y(errorRatio(t)).toFixed(1)}`)
    .join(" ");
  const fires: [number, string, boolean][] = what === "none" ? [[10, "spike: fires, clears", false], [24, "real problem: fires", true]] : [[29, "real problem: fires (after 5 min)", true]];
  return (
    <Drawing h={260} label="Error ratio over 40 minutes against a 2% threshold, and when the alert fires">
      {what === "dur" && (
        <>
          <rect className="n mark" x={x(24)} y={44} width={x(29) - x(24)} height={186} style={{ stroke: "none" }} />
          <T x={x(26.5)} y={222} k="s mid" bold size={10.5}>5 min</T>
        </>
      )}
      <line className="w fault dash" x1={70} y1={y(2)} x2={930} y2={y(2)} />
      <T x={930} y={y(2) - 6} k="s c-red" end size={11}>threshold 2%</T>
      <path className="w" d={d} strokeWidth={2.2} style={{ stroke: "var(--dd-ink)" }} />
      {[0, 10, 20, 30, 40].map((t) => (
        <T key={t} x={x(t)} y={248} k="f mid" size={11}>{`${t} min`}</T>
      ))}
      {[0, 2, 4, 6].map((v) => (
        <T key={v} x={62} y={y(v) + 4} k="f" end size={10.5}>{`${v}%`}</T>
      ))}
      {fires.map(([t, label, real]) => (
        <g key={t}>
          <line className={cn("w", real && "fault")} x1={x(t)} y1={30} x2={x(t)} y2={230} strokeWidth={2} />
          <circle className={real ? "bad" : "ok"} cx={x(t)} cy={30} r={6} />
          <T x={x(t) + 10} y={34} k={real ? "s c-red" : "s"} bold size={11}>{label}</T>
        </g>
      ))}
    </Drawing>
  );
}

/** Why an alert waits a few minutes before firing. */
export function AlertWin() {
  return <CaseExplorer label="Alert duration windows" cases={ALERT_CASES} render={(_, what) => <AlertView what={what} />} />;
}

type ConnTestCase = { k: string; res: [string, string]; steps: [string, string, "ok" | "bad" | "edge" | "skip"][]; take: string };
const CONNTEST = data.CONNTEST as unknown as ConnTestCase[];
const CONN_CASES = CONNTEST.map((t, i) => ({ k: t.k, i, take: t.take }));

function ConnView({ i }: { i: number }) {
  const t = CONNTEST[i];
  return (
    <div className="space-y-4">
      <ol className="border-rule border-t">
        {t.steps.map(([step, detail, state]) => (
          <li
            key={step + detail}
            className={cn(
              "border-rule grid grid-cols-[28px_minmax(0,140px)_minmax(0,1fr)] items-baseline gap-x-3 border-b py-2.5",
              state === "skip" && "opacity-50",
            )}
          >
            <span className={cn("font-mono text-[14px] font-bold", state === "bad" ? "text-fault" : "text-ink")} aria-hidden="true">
              {state === "ok" ? <IconCheck size={11} /> : state === "bad" ? <IconX size={10} /> : state === "edge" ? "→" : "·"}
            </span>
            <span className={cn("text-[15px] font-semibold", state === "bad" ? "text-fault" : "text-ink")}>{step}</span>
            <span className={cn("font-mono text-[13.5px]", state === "bad" ? "text-fault" : "text-ink-body")}>{detail}</span>
          </li>
        ))}
      </ol>
      <Result tone={t.res[1] === "green" ? "ok" : "fault"}>
        <b>Result: {t.res[0]}</b>
      </Result>
    </div>
  );
}

/** Connectivity Tests: the path GCP would take, and where it stops. */
export function ConnTest() {
  return <CaseExplorer label="Connectivity Test examples" cases={CONN_CASES} render={(c) => <ConnView i={c.i} />} />;
}

const INCIDENTS = data.INCIDENTS as unknown as Record<string, [string, string, string, string][]>;

/** What to check first, by symptom. */
export function Incidents() {
  const keys = Object.keys(INCIDENTS);
  const [k, setK] = useState(keys[0]);
  return (
    <WidgetFrame label="Incident runbooks">
      <Choices label="Symptom" value={k} onChange={setK} options={keys.map((x) => ({ value: x, label: x }))} />
      <ol aria-live="polite" className="mt-5 space-y-4">
        {INCIDENTS[k].map(([q, how, means, next], i) => (
          <li key={q} className="border-rule grid grid-cols-[28px_minmax(0,1fr)] gap-x-3 border-t pt-3">
            <span className="text-ink-faint font-mono text-[14px] font-semibold">{i + 1}.</span>
            <div className="space-y-1.5">
              <p className="text-ink text-[16px] font-bold">{q}</p>
              <p className="bg-code text-ink rounded-[2px] px-2.5 py-1.5 font-mono text-[13px] leading-[1.55] break-words">{how}</p>
              <p className="text-ink-body text-[15px] leading-[1.55]">
                <b className="text-ink">What the result means:</b> {means}
              </p>
              <p className="text-ink-body text-[15px] leading-[1.55]">
                <b className="text-ink">Next:</b> {next}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </WidgetFrame>
  );
}

const ROLLOUT: [string, string, string[]][] = [
  [
    "Day 1",
    "about an hour",
    [
      "Load balancer logging on (100% API, 10% images)",
      "Uptime check on the health URL, through Cloudflare",
      "Alert: shop unreachable, to your phone",
      "Budget alert on the billing account",
    ],
  ],
  [
    "Week 1",
    "a few hours",
    ["Dashboard: the six panels from section 02", "Alerts: error ratio, p95 latency, NAT drops", "App logs as JSON with trace ID and CF-Ray", "Cloud NAT error logs on"],
  ],
  [
    "Month 1",
    "spread out",
    [
      "Flow logs on the subnets that carry database and PayGate traffic",
      "Firewall rule logging + the deny-all-log rule",
      "Connectivity Tests saved for the key paths",
      "Exclusion filters and a BigQuery sink, after a week of measuring volume",
    ],
  ],
  [
    "Later",
    "when the basics are quiet",
    ["An SLO with burn-rate alerts instead of fixed thresholds", "Log Analytics queries for weekly security review", "Cloudflare Logpush joined to GCP logs by CF-Ray"],
  ],
];

/** Observability in the order Kadé adds it. */
export function Rollout() {
  return (
    <WidgetFrame wide label="Rolling out observability">
      <Phases phases={ROLLOUT} />
    </WidgetFrame>
  );
}
