"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { Field, FieldError } from "../field";
import { Choices, KeyValues, Steps, WidgetNote } from "../ui";
import { WidgetFrame } from "../widget-frame";
import { CaseExplorer, Chain, Result, type Case, type Tone } from "./case-explorer";
import { Box, Caps, Drawing, Mark, T, Timeline, Wire, Zone, type Bar } from "./draw";
import { Examples } from "./kit";

/* Part 4 · The front door: load balancing (chapters 11-12.2). */

// ── Chapter 11 ─────────────────────────────────────────────────────────────

const LB_NAMES: Record<string, [string, string]> = {
  "ext-glob-app-proxy": [
    "Global external Application Load Balancer",
    "Kadé's choice. One anycast IP on Google Front Ends, HTTP routing, TLS, Cloud Armor, Cloud CDN. Premium tier only.",
  ],
  "ext-reg-app-proxy": [
    "Regional external Application Load Balancer",
    "Envoy proxies in a proxy-only subnet in one region. Keeps traffic and TLS in that region; can use Standard tier.",
  ],
  "int-glob-app-proxy": ["Cross-region internal Application Load Balancer", "Private IPs in several regions, routing to backends in any region, for service-to-service traffic."],
  "int-reg-app-proxy": ["Regional internal Application Load Balancer", "A private HTTP(S) front door inside the VPC, in one region."],
  "ext-glob-net-proxy": ["Global external proxy Network Load Balancer", "One anycast IP for plain TCP (optionally ending TLS), when the traffic is not HTTP."],
  "ext-reg-net-proxy": ["Regional external proxy Network Load Balancer", "TCP proxy with a regional public IP."],
  "int-glob-net-proxy": ["Cross-region internal proxy Network Load Balancer", "Private TCP proxy across regions."],
  "int-reg-net-proxy": ["Regional internal proxy Network Load Balancer", "Private TCP proxy in one region."],
  "ext-reg-net-pass": [
    "External passthrough Network Load Balancer",
    "Public IP in one region; TCP, UDP and more; backends see the real client IP and reply directly.",
  ],
  "int-reg-net-pass": [
    "Internal passthrough Network Load Balancer",
    "Private IP in one region; TCP and UDP; also usable as a route next hop for appliances (chapter 4).",
  ],
};

/** Four questions name the load balancer. */
export function LbDecoder() {
  const [v, setV] = useState({ reach: "ext", spread: "glob", layer: "app", mode: "proxy" });
  const key = `${v.reach}-${v.spread}-${v.layer}-${v.mode}`;
  let out: [boolean, string, string];
  if (v.layer === "app" && v.mode === "pass")
    out = [
      false,
      "Does not exist",
      "An Application load balancer has to read HTTP, and it can only read traffic from a connection it has ended. So L7 is always a proxy.",
    ];
  else if (v.spread === "glob" && v.mode === "pass")
    out = [false, "Does not exist", "Passthrough load balancers only steer packets inside one region. There is no global passthrough load balancer."];
  else out = [true, ...LB_NAMES[key]];
  const axes: [keyof typeof v, string, [string, string][]][] = [
    ["reach", "1 · Reach", [["ext", "External"], ["int", "Internal"]]],
    ["spread", "2 · Spread", [["glob", "Global"], ["reg", "Regional"]]],
    ["layer", "3 · Layer", [["app", "Application (L7)"], ["net", "Network (L4)"]]],
    ["mode", "4 · Mode", [["proxy", "Proxy"], ["pass", "Passthrough"]]],
  ];
  return (
    <WidgetFrame label="Name the load balancer">
      <div className="grid items-center gap-x-4 gap-y-3 sm:grid-cols-[110px_minmax(0,1fr)]">
        {axes.map(([k, label, options]) => (
          <div key={k} className="contents">
            <span className="text-ink-muted text-[14px]">{label}</span>
            <Choices label={label} value={v[k]} onChange={(x) => setV((s) => ({ ...s, [k]: x }))} options={options.map(([value, l]) => ({ value, label: l }))} />
          </div>
        ))}
      </div>
      <div aria-live="polite" className="mt-5">
        <Result tone={out[0] ? (key === "ext-glob-app-proxy" ? "ok" : "plain") : "warn"}>
          <b>{out[1]}.</b> {out[2]}
        </Result>
      </div>
    </WidgetFrame>
  );
}

/** Global anycast against a regional IP. */
export function LbGlobal() {
  const users: [string, number][] = [
    ["Shopper, Colombo", 60],
    ["Visitor, London", 150],
    ["Partner, Sydney", 240],
  ];
  return (
    <WidgetFrame wide label="Global and regional load balancers">
      <Drawing h={330} label="A global load balancer's users enter Google nearby; a regional one's all travel to one region">
        <Caps x={16} y={24}>GLOBAL · one anycast IP, many entry points</Caps>
        <Caps x={500} y={24}>REGIONAL · the IP lives in one region</Caps>
        {users.map(([u, y]) => (
          <g key={u}>
            <Box x={16} y={y} w={170} h={56} />
            <T x={30} y={y + 33} size={12}>{u}</T>
            <Wire x1={186} y1={y + 28} x2={211} y2={y + 28} />
          </g>
        ))}
        <Box x={214} y={50} w={110} h={260} c="purple" />
        <T x={226} y={74} k="t" size={12.5}>Google</T>
        <T x={226} y={92} size={11}>edge, each</T>
        <T x={226} y={108} size={11}>announcing</T>
        <T x={226} y={126} size={11} bold>34.120.88.10</T>
        <path className="w plum" d="M324 180 C 360 180, 370 180, 397 180" markerEnd="url(#dd-ah-plum)" />
        <T x={330} y={168} size={10.5}>backbone</T>
        <Box x={400} y={130} w={80} h={100} c="blue" />
        <T x={410} y={158} size={11}>backend</T>
        <T x={410} y={176} size={11}>nearest</T>
        <T x={410} y={194} size={11}>healthy</T>
        <T x={410} y={212} size={11}>region</T>
        {users.map(([u, y]) => (
          <g key={`r${u}`}>
            <Box x={500} y={y} w={170} h={56} />
            <T x={514} y={y + 33} size={12}>{u}</T>
            <path className="w dash" d={`M670 ${y + 28} C 720 ${y + 28}, 720 180, 757 180`} markerEnd="url(#dd-ah-muted)" />
          </g>
        ))}
        <Box x={760} y={110} w={184} h={140} c="blue" />
        <T x={774} y={136} k="t" size={12.5}>asia-southeast1</T>
        <T x={774} y={158} size={11}>regional IP</T>
        <T x={774} y={176} size={11}>34.87.x.x</T>
        <T x={774} y={202} k="f" size={11}>everyone travels</T>
        <T x={774} y={220} k="f" size={11}>to this one region</T>
      </Drawing>
      <WidgetNote>
        Global: every user enters Google&apos;s network nearby and rides the backbone. Regional: every user travels to the region, over Premium or Standard tier
        (chapter 3).
      </WidgetNote>
    </WidgetFrame>
  );
}

/** What an L7 load balancer can read that an L4 one cannot. */
export function LbL7L4() {
  const routes: [string, string, number][] = [
    ["/api/*", "kade-api-backend", 60],
    ["/images/*", "kade-static bucket", 110],
    ["everything else", "web backend", 160],
  ];
  return (
    <WidgetFrame wide label="Layer 7 and layer 4 load balancers">
      <Drawing h={230} label="An L7 load balancer picks a backend by host and path; an L4 one only by connection">
        <Caps x={16} y={24}>L7 · reads the request</Caps>
        <Caps x={500} y={24}>L4 · sees only addresses and ports</Caps>
        <Box x={16} y={44} w={200} h={120} />
        <T x={30} y={70} k="t" size={12.5}>HTTPS request</T>
        <T x={30} y={92} size={11}>Host: www.kade.lk</T>
        <T x={30} y={110} size={11}>GET /images/rice.jpg</T>
        <T x={30} y={128} size={11}>Cookie: session=…</T>
        <Box x={244} y={64} w={90} h={80} c="purple" />
        <T x={256} y={100} k="t" size={12.5}>L7 LB</T>
        <T x={256} y={120} size={11}>decrypts</T>
        <Wire x1={216} y1={104} x2={241} y2={104} />
        {routes.map(([path, , y], i) => (
          <g key={path}>
            <path
              className={cn("w", i === 1 && "green")}
              d={`M334 104 C 350 104, 350 ${y + 14}, 362 ${y + 14}`}
              markerEnd={`url(#dd-ah-${i === 1 ? "green" : "muted"})`}
            />
            <Box x={364} y={y} w={120} h={30} c={i === 1 ? "green" : undefined} />
            <T x={372} y={y + 19} size={10.5}>{path}</T>
          </g>
        ))}
        <T x={364} y={214} k="f" size={11}>picks by host and path</T>
        <Box x={500} y={44} w={200} h={120} />
        <T x={514} y={70} k="t" size={12.5}>TCP connection</T>
        <T x={514} y={92} size={11}>203.0.113.99:51022</T>
        <T x={514} y={110} size={11}>→ 34.87.x.x:443</T>
        <T x={514} y={128} k="f" size={11}>contents: unreadable</T>
        <Box x={728} y={64} w={90} h={80} c="purple" />
        <T x={740} y={100} k="t" size={12.5}>L4 LB</T>
        <T x={740} y={120} size={11}>forwards</T>
        <Wire x1={700} y1={104} x2={725} y2={104} />
        <Wire x1={818} y1={104} x2={843} y2={104} c="green" />
        <Box x={846} y={74} w={98} h={60} c="blue" />
        <T x={856} y={100} size={11}>any healthy</T>
        <T x={856} y={118} size={11}>backend</T>
        <T x={728} y={180} k="f" size={11}>picks by connection only</T>
      </Drawing>
    </WidgetFrame>
  );
}

/** Choosing a load balancer, as a tree of questions. */
export function LbTree() {
  const q = (x: number, y: number, text: string) => (
    <g key={text + x}>
      <Box x={x} y={y} w={250} h={50} c="orange" />
      <T x={x + 14} y={y + 30} k="t" size={12.5}>{text}</T>
    </g>
  );
  const end = (x: number, y: number, t: string, s: string, chosen = false, w = 250) => (
    <g key={t}>
      <Box x={x} y={y} w={w} h={56} c={chosen ? undefined : "blue"} className={chosen ? "cur" : undefined} />
      <T x={x + 14} y={y + 24} k="t" size={12}>{t}</T>
      <T x={x + 14} y={y + 43} size={10.5}>{s}</T>
    </g>
  );
  const edge = (x1: number, y1: number, x2: number, y2: number, label?: string) => (
    <g key={`${x1}${y1}${x2}${y2}`}>
      <path className="w" d={`M${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2 - 3}`} markerEnd="url(#dd-ah-muted)" />
      {label && (
        <T x={(x1 + x2) / 2 + 6} y={(y1 + y2) / 2 - 4} size={11}>
          {label}
        </T>
      )}
    </g>
  );
  return (
    <WidgetFrame wide label="Which load balancer?">
      <Drawing h={390} label="Decision tree for choosing a Google Cloud load balancer; Kadé's choice is the global external Application Load Balancer">
        {q(355, 10, "1 · Is it HTTP or HTTPS?")}
        {q(100, 110, "2 · From the internet?")}
        {q(610, 110, "2 · TCP, and want a proxy?")}
        {edge(480, 60, 225, 110, "yes")}
        {edge(480, 60, 735, 110, "no")}
        {q(16, 210, "3 · Global or regional?")}
        {end(290, 210, "Internal Application LB", "regional, or cross-region")}
        {edge(225, 160, 141, 210, "yes")}
        {edge(225, 160, 415, 210, "no")}
        {end(16, 320, "Global external Application LB", "Kadé · CDN · anycast", true)}
        {end(290, 320, "Regional external Application LB", "one region, Standard tier OK")}
        {edge(141, 260, 141, 320, "global")}
        {edge(141, 260, 415, 320, "regional")}
        {end(556, 210, "Proxy Network LB", "external or internal", false, 186)}
        {end(754, 210, "Passthrough Network LB", "UDP · real client IP", false, 190)}
        {edge(735, 160, 649, 210, "yes")}
        {edge(735, 160, 849, 210, "no")}
        <T x={560} y={300} k="f" size={11}>Passthrough: external or internal,</T>
        <T x={560} y={318} k="f" size={11}>always regional. Internal passthrough</T>
        <T x={560} y={336} k="f" size={11}>can be a route next hop (chapter 4).</T>
      </Drawing>
    </WidgetFrame>
  );
}

const PROXY_CASES: Case[] = [
  {
    k: "Proxy",
    t: "two connections",
    take: "The client's TCP and TLS connection <b>ends at Google's front end</b>. A second, separate connection goes to the backend. Because the front end holds the decrypted request, it can route it, run Cloud Armor and add headers. The backend sees the front end's address as the source, and the client's address only in <code>X-Forwarded-For</code>.",
    cfg: "client ──connection 1──▶ load balancer ──connection 2──▶ backend\nbackend sees: source 35.191.8.20, X-Forwarded-For: 203.0.113.99, 34.120.88.10",
  },
  {
    k: "Passthrough",
    t: "one connection",
    take: "There is only <b>one connection</b>, from the client to the backend. The load balancer picks a backend and steers the packets, without reading them. The backend sees the real client address, ends TLS itself if there is any, and its replies go straight back to the client (direct server return).",
    cfg: "client ──────── one connection ────────▶ backend\n                 ▲ load balancer only steers packets\nbackend sees: source 203.0.113.99",
  },
  {
    k: "Scenario",
    t: "a service with its own IP allow-list",
    what: [
      ["proxy", "Behind a proxy"],
      ["pass", "Behind a passthrough"],
    ],
    take: {
      proxy:
        "Every request arrives from Google's front end, so a check on the TCP source address sees <code>35.191.x.x</code> for everyone. It either allows everyone or no one; <b>the control is silently dead</b>. The fix is to check the right <code>X-Forwarded-For</code> entry, or move the allow-list to Cloud Armor.",
      pass: "The service sees each client's real address, so its allow-list keeps working as written. The price: no Cloud Armor, no HTTP routing, no TLS termination at the load balancer.",
    },
    cfg: "A service checks: allow only 198.51.100.20 (office)\n\nBehind a PROXY:        source is always 35.191.x.x → check is meaningless\nBehind a PASSTHROUGH:  source is the real client   → check works",
  },
];

function ProxyView({ c, what }: { c: Case; what: string }) {
  const proxy = c.k === "Proxy" || (c.k === "Scenario" && what !== "pass");
  const scenario = c.k === "Scenario";
  const who = scenario ? "Visitor" : "Shopper";
  return (
    <div className="space-y-4">
      {proxy ? (
        <Drawing h={140} label="Two separate connections: client to Google Front End, then Google Front End to the backend">
          <Caps x={16} y={22}>TWO SEPARATE CONNECTIONS</Caps>
          <Box x={16} y={40} w={200} h={90} />
          <T x={30} y={68} k="t">{who}</T>
          <T x={30} y={90}>203.0.113.99</T>
          {scenario && (
            <T x={30} y={110} k="f" size={11}>
              (not the office)
            </T>
          )}
          <Box x={380} y={40} w={200} h={90} c="purple" />
          <T x={394} y={68} k="t">Google Front End</T>
          <T x={394} y={90}>34.120.88.10</T>
          <T x={394} y={110} k="f" size={11}>connection 1 ENDS here</T>
          <Box x={744} y={40} w={200} h={90} c="blue" />
          <T x={758} y={68} k="t">backend VM</T>
          <T x={758} y={90}>{scenario ? "checks source IP" : "10.10.1.10"}</T>
          <Wire x1={216} y1={72} x2={377} y2={72} />
          <T x={296} y={62} k="s mid" size={11}>connection 1 (TLS)</T>
          <Wire x1={580} y1={72} x2={741} y2={72} c="purple" />
          <T x={660} y={62} k="s mid" size={11}>connection 2 (new)</T>
          <Wire x1={741} y1={104} x2={583} y2={104} c="green" />
          <Wire x1={377} y1={104} x2={219} y2={104} c="green" />
          <T x={660} y={122} k="f mid" size={11}>reply</T>
          <T x={296} y={122} k="f mid" size={11}>reply</T>
        </Drawing>
      ) : (
        <Drawing h={316} label="One connection steered by a passthrough load balancer; the reply goes straight back">
          <Caps x={16} y={22}>ONE CONNECTION, STEERED · THE LOAD BALANCER NEVER HOLDS IT</Caps>
          <Box x={380} y={40} w={200} h={64} c="purple" />
          <T x={394} y={66} k="t">passthrough LB</T>
          <T x={394} y={88} size={11.5}>34.87.x.x · regional</T>
          <Wire x1={480} y1={104} x2={480} y2={149} c="purple" dash />
          <T x={470} y={132} size={11} end>picks VM 1 for this connection</T>
          <Box x={16} y={118} w={200} h={90} />
          <T x={30} y={146} k="t">{who}</T>
          <T x={30} y={168}>203.0.113.99</T>
          {scenario && (
            <T x={30} y={188} k="f" size={11}>
              (not the office)
            </T>
          )}
          <Wire x1={216} y1={160} x2={474} y2={160} plain />
          <circle className="ok" cx={480} cy={160} r={6} />
          <T x={232} y={150} size={11}>TCP SYN → 34.87.x.x:443</T>
          <Box x={744} y={150} w={200} h={74} c="green" />
          <T x={758} y={178} k="t">backend VM 1</T>
          <T x={758} y={200} size={11.5} bold>gets the connection</T>
          <g className="off">
            <Box x={744} y={40} w={200} h={64} c="blue" />
            <T x={758} y={68} k="t">backend VM 2</T>
            <T x={758} y={88} k="f" size={11}>not picked this time</T>
          </g>
          <path className="w" d="M486 160 C 600 160, 640 187, 741 187" markerEnd="url(#dd-ah-muted)" />
          <path className="w dash off" d="M486 160 C 600 160, 640 72, 741 72" />
          <path className="w green" d="M760 224 C 740 270, 700 284, 600 284 L 200 284 C 140 284, 116 256, 116 211" markerEnd="url(#dd-ah-green)" />
          <T x={470} y={304} k="s mid" bold size={11}>
            reply goes straight back to the shopper: it never passes the load balancer (direct server return)
          </T>
        </Drawing>
      )}
      <div>
        <p className="text-ink-muted mb-2 text-[14px]">What the backend sees</p>
        {proxy ? (
          <KeyValues
            items={[
              ["TCP source", <span key="s"><b>35.191.8.20</b> <span className="text-ink-faint font-sans text-[13.5px]">← Google&apos;s front end, not the client</span></span>],
              ["X-Forwarded-For", <span key="x">203.0.113.99, 34.120.88.10 <span className="text-ink-faint font-sans text-[13.5px]">← the real client is here</span></span>],
              ["TLS", "ended at the load balancer; HTTP inside", true],
              ["Possible here", "host/path routing · Cloud Armor · header changes · CDN", true],
            ]}
          />
        ) : (
          <KeyValues
            items={[
              ["TCP source", <span key="s"><b>203.0.113.99</b> <span className="text-ink-faint font-sans text-[13.5px]">← the real client</span></span>],
              ["TLS", "ended by the backend itself, if used", true],
              ["Not possible", "routing by path · Cloud Armor · header changes", true],
            ]}
          />
        )}
      </div>
      {scenario && (
        <Result tone={proxy ? "fault" : "ok"}>
          <b>{proxy ? "Allow-list sees 35.191.8.20 for every visitor: the check is meaningless" : "Allow-list sees 203.0.113.99, not the office: correctly refused"}</b>
        </Result>
      )}
    </div>
  );
}

/** Proxy or passthrough: one connection or two, and what the backend sees. */
export function ProxyEx() {
  return <CaseExplorer label="Proxy and passthrough load balancers" cases={PROXY_CASES} render={(c, what) => <ProxyView c={c} what={what} />} />;
}

// ── Chapter 12.1 ───────────────────────────────────────────────────────────

const CHAIN_LINKS = [
  {
    k: "1 · Forwarding rule",
    n: "kade-https-rule",
    holds: "The IP address and port: the entry point. Also the scheme (EXTERNAL_MANAGED) and network tier.",
    kade: "34.120.88.10:443 (kade-lb-ip, global, Premium)",
    ask: '"What IP is this on? Is it reserved, or ephemeral?"',
    cmd: "gcloud compute forwarding-rules describe kade-https-rule --global",
  },
  {
    k: "2 · Target proxy",
    n: "kade-https-proxy",
    holds:
      "Where the connection ENDS. The certificate (or certificate map) and the SSL policy live here. After this point the request is decrypted HTTP.",
    kade: "cert map kade-cert-map · SSL policy kade-tls (MODERN, TLS 1.2+)",
    ask: '"Which certificate does it serve, and which TLS versions does it accept?"',
    cmd: "gcloud compute target-https-proxies describe kade-https-proxy",
  },
  {
    k: "3 · URL map",
    n: "kade-url-map",
    holds: "The routing rules: host rules and path matchers decide which backend service gets the request. Can also redirect and rewrite.",
    kade: "api.kade.lk → kade-api-backend · www.kade.lk/images/* → kade-static",
    ask: '"Where does this hostname and path go?"',
    cmd: "gcloud compute url-maps describe kade-url-map",
  },
  {
    k: "4 · Backend service",
    n: "kade-api-backend",
    holds:
      "How traffic is handled for one group of backends: Cloud Armor policy, Cloud CDN, logging, balancing mode, session affinity, timeout, health check.",
    kade: "Cloud Armor kade-edge-policy · logging 100% · no health check (serverless)",
    ask: '"Does it have a WAF? Is it logging? Which health check?"',
    cmd: "gcloud compute backend-services describe kade-api-backend --global",
  },
  {
    k: "5 · Backend",
    n: "kade-api-neg",
    holds: "What actually serves: an instance group, a NEG (serverless, zonal, internet, hybrid, PSC), or a bucket (as a backend bucket).",
    kade: "serverless NEG → Cloud Run kade-api in asia-southeast1",
    ask: '"What is actually answering?"',
    cmd: "gcloud compute network-endpoint-groups describe kade-api-neg --region=asia-southeast1",
  },
  {
    k: "Redirect",
    n: "kade-http-rule",
    holds:
      "A second, small chain only for port 80: forwarding rule → target HTTP proxy → a URL map whose only job is to answer 301 with the https:// address.",
    kade: "kade-http-rule :80 → kade-http-proxy → kade-redirect-map (httpsRedirect: true)",
    ask: '"Does http:// still answer with content instead of a redirect?"',
    cmd: "gcloud compute url-maps describe kade-redirect-map",
  },
];
type LinkCase = Case & { i: number };
const LINK_CASES: LinkCase[] = CHAIN_LINKS.map((l, i) => ({ k: l.k, i, take: `<b>Ask it when something breaks:</b> ${l.ask}`, cfg: l.cmd }));
const LINK_BOXES: [string, string, string, string][] = [
  ["Forwarding rule", "kade-https-rule", "34.120.88.10:443", "purple"],
  ["Target proxy", "kade-https-proxy", "TLS ends here", "orange"],
  ["URL map", "kade-url-map", "host + path", "orange"],
  ["Backend service", "kade-api-backend", "Armor · CDN · logs", "orange"],
  ["Backend", "kade-api-neg", "→ Cloud Run", "blue"],
];
const REDIRECT_BOXES: [string, string, string][] = [
  ["Forwarding rule", "kade-http-rule", "34.120.88.10:80"],
  ["Target proxy", "kade-http-proxy", "no TLS"],
  ["URL map", "kade-redirect-map", "301 → https://"],
];

function LinkView({ c }: { c: LinkCase }) {
  const s = c.i;
  const link = CHAIN_LINKS[s];
  const w = 140.8;
  return (
    <div className="space-y-4">
      <Drawing h={124} label="The five links of the load balancer chain">
        <Box x={16} y={20} w={124} h={92} />
        <T x={28} y={50} k="t" size={12.5}>request</T>
        <T x={28} y={72} size={11}>{s === 5 ? "http://…" : "https://…"}</T>
        <Wire x1={140} y1={66} x2={157} y2={66} />
        {LINK_BOXES.map((b, t) => {
          const x = 160 + t * (w + 20);
          const redirect = s === 5 && t < 3;
          const on = s === t || redirect;
          const words = redirect ? REDIRECT_BOXES[t] : b;
          return (
            <g key={b[0]} className={s === 5 && t >= 3 ? "off" : undefined}>
              <Box x={x} y={20} w={w} h={92} c={b[3]} className={on ? "cur" : undefined} />
              <T x={x + 12} y={40} k="f" size={10}>{`LINK ${t + 1}`}</T>
              <T x={x + 12} y={60} k="t" size={12}>{words[0]}</T>
              <T x={x + 12} y={80} size={10.5}>{words[1]}</T>
              <T x={x + 12} y={98} k="f" size={10}>{words[2]}</T>
              {t < 4 && <Wire x1={x + w} y1={66} x2={x + w + 17} y2={66} />}
            </g>
          );
        })}
      </Drawing>
      <div className="border-rule border-t pt-3">
        <p className="text-ink text-[16px] font-bold">
          {link.k} · <span className="font-mono text-[15px]">{link.n}</span>
        </p>
        <KeyValues className="mt-2" items={[["Holds", link.holds, true], ["Kadé's value", link.kade]]} />
      </div>
    </div>
  );
}

/** The five objects behind one load balancer, and what to ask each. */
export function LbChain() {
  return <CaseExplorer label="The load balancer chain" cases={LINK_CASES} render={(c) => <LinkView c={c} />} />;
}

const URL_HOSTS = [
  { hosts: ["api.kade.lk"], pm: "api" },
  { hosts: ["www.kade.lk", "kade.lk"], pm: "web" },
];
const URL_MATCHERS: Record<string, { def: string; rules: [string, string][] }> = {
  api: { def: "kade-api-backend", rules: [] },
  web: {
    def: "kade-static",
    rules: [
      ["/api/*", "kade-api-backend"],
      ["/media/*", "kade-media-backend"],
      ["/images/*", "kade-static"],
      ["/assets/*", "kade-static"],
    ],
  },
};
const URL_EXAMPLES = [
  "https://api.kade.lk/v1/orders",
  "https://www.kade.lk/",
  "https://www.kade.lk/images/rice.jpg",
  "https://www.kade.lk/media/rice-640w.jpg",
  "https://www.kade.lk/api/cart",
  "https://kade.lk/",
  "https://34.120.88.10/",
];

/** Type a URL; follow kade-url-map's host rule and path matcher. */
export function UrlMapTool() {
  const [value, setValue] = useState("https://www.kade.lk/images/rice.jpg");
  const errorId = useId();
  let url: URL | null = null;
  try {
    url = new URL(value.trim());
  } catch {
    url = null;
  }
  const steps: string[] = [];
  let service = "kade-static";
  let tone: Tone = "ok";
  if (url) {
    const host = url.hostname;
    const path = url.pathname || "/";
    const rule = URL_HOSTS.find((h) => h.hosts.includes(host));
    if (rule) {
      steps.push(`Host rule: "${host}" → path matcher "${rule.pm}".`);
      const m = URL_MATCHERS[rule.pm];
      const hit = m.rules
        .filter(([p]) => path.startsWith(p.replace("/*", "/")) || path === p.replace("/*", ""))
        .sort((a, b) => b[0].length - a[0].length)[0];
      if (hit) {
        steps.push(`Path matcher "${rule.pm}": "${path}" matches "${hit[0]}" (the longest matching path).`);
        service = hit[1];
      } else {
        steps.push(`Path matcher "${rule.pm}": no path rule matches "${path}", so the matcher's default is used.`);
        service = m.def;
      }
    } else {
      steps.push(`Host rule: no host rule lists "${host}", so the URL map's default service is used.`);
      tone = "warn";
    }
  }
  const backend =
    service === "kade-api-backend"
      ? "backend service → serverless NEG → Cloud Run kade-api (Cloud Armor kade-edge-policy)"
      : service === "kade-media-backend"
        ? "backend service → managed instance group kade-media-mig, VMs on port 8080 (chapter 12.2)"
        : "backend bucket → Cloud Storage kade-static-assets (Cloud CDN, edge policy kade-static-edge)";
  return (
    <WidgetFrame label="Follow a URL through the URL map">
      <Field label="Request URL" value={value} onChange={setValue} long invalid={!url} describedBy={errorId} />
      <div className="mt-3">
        <Examples values={URL_EXAMPLES} current={value} onPick={setValue} />
      </div>
      <div aria-live="polite" className="mt-5 space-y-4">
        {!url ? (
          <FieldError id={errorId}>Enter a full URL, starting with https://</FieldError>
        ) : (
          <>
            <Result tone={tone}>
              <b>{service}</b>: {backend}
              {tone === "warn" && ". Unknown hostnames, including the bare IP, land here; some teams prefer a default that returns 404."}
            </Result>
            <Steps>{steps}</Steps>
          </>
        )}
      </div>
      <WidgetNote>
        kade-url-map: host rule api.kade.lk → matcher &quot;api&quot; (everything → kade-api-backend); host rule www.kade.lk, kade.lk → matcher &quot;web&quot;
        (/api/* → kade-api-backend, /media/* → kade-media-backend, /images/* and /assets/* → kade-static, default kade-static); URL map default kade-static.
      </WidgetNote>
    </WidgetFrame>
  );
}

const HC_CASES: Case[] = [
  {
    k: "A",
    t: "Probes need a firewall rule",
    what: [
      ["normal", "Rule in place"],
      ["norule", "What if the rule is deleted in a clean-up?"],
    ],
    take: {
      normal:
        "Health check probes come from Google's ranges <code>35.191.0.0/16</code> and <code>130.211.0.0/22</code>, not from the load balancer IP. A dedicated rule lets them reach port 8080, both VMs answer, and both are marked healthy.",
      norule:
        "The default-deny ingress rule (chapter 5.1) now drops every probe. Both VMs are marked <b>unhealthy</b>, the load balancer has nowhere to send traffic, and shoppers get 502 errors, while the app itself is running perfectly. Backends unhealthy but the app works? Check this first. It was Kadé's twenty-minute outage.",
    },
    cfg: "Health check kade-hc: HTTP, port 8080, path /healthz\nFirewall kade-lb-to-api: allow tcp:8080 from 35.191.0.0/16, 130.211.0.0/22 → sa-kade-api",
  },
  {
    k: "B",
    t: "TCP or HTTP: what the check proves",
    what: [
      ["tcp", "TCP check"],
      ["http", "HTTP check on /healthz"],
    ],
    take: {
      tcp: "kade-api-1's app has hung but still holds port 8080 open. A TCP check only proves <b>something is listening</b>, so it keeps passing, and the load balancer keeps sending half the shoppers to a server that answers every request with an error.",
      http: "An HTTP check asks <code>/healthz</code> for a real answer. The hung app returns 500 (or nothing), the check fails twice, and kade-api-1 is taken out of rotation. Shoppers only reach kade-api-2.",
    },
    cfg: "TCP:  connect to :8080 → success = healthy\nHTTP: GET /healthz on :8080 → 200 = healthy, anything else = unhealthy",
  },
  {
    k: "C",
    t: "Timing",
    what: [
      ["def", "Defaults"],
      ["fast", "Too aggressive"],
    ],
    take: {
      def: "Defaults: a probe every 5 s, 5 s timeout, <b>2 failures</b> to mark unhealthy, 2 successes to mark healthy again. A dead backend is out of rotation about 10 s after it stops answering.",
      fast: "Probing every 1 s and marking unhealthy after 1 failure removes a dead backend in about a second, but a single slow response during a garbage-collection pause also takes a healthy backend out, then back in: <b>flapping</b>. Tune only for a specific reason.",
    },
    cfg: "checkIntervalSec: 5\ntimeoutSec: 5\nunhealthyThreshold: 2\nhealthyThreshold: 2",
  },
];

/** Health state over 40 s of probes: every probe, every change of state. */
function probeRun(fast: boolean) {
  const every = fast ? 1 : 5;
  const need = fast ? 1 : 2;
  const slow: [number, number][] = fast ? [[12, 13.2]] : [];
  const probes: [number, boolean][] = [];
  const states: [number, number, "up" | "down"][] = [];
  let fails = 0;
  let oks = 0;
  let state: "up" | "down" = "up";
  let since = 0;
  for (let t = 0; t <= 40; t += every) {
    const ok = t < 20 && !slow.some(([a, b]) => t >= a && t < b);
    probes.push([t, ok]);
    if (ok) {
      oks++;
      fails = 0;
      if (state === "down" && oks >= need) {
        states.push([since, t, "down"]);
        since = t;
        state = "up";
      }
    } else {
      fails++;
      oks = 0;
      if (state === "up" && fails >= need) {
        states.push([since, t, "up"]);
        since = t;
        state = "down";
      }
    }
  }
  states.push([since, 40, state]);
  return { probes, states, every, need };
}

function HcView({ c, what }: { c: Case; what: string }) {
  if (c.k === "A") {
    const off = what === "norule";
    return (
      <div className="space-y-3">
        <Drawing h={360} label="Health check probes through the firewall, and the shopper path that depends on them">
          <Caps x={16} y={22}>1 · PROBE PATH: Google&apos;s health checkers → each VM, through the firewall</Caps>
          <Box x={16} y={72} w={200} h={104} c="purple" />
          <T x={30} y={100} k="t" size={13}>Health checkers</T>
          <T x={30} y={122} size={11.5}>35.191.0.0/16</T>
          <T x={30} y={140} size={11.5}>130.211.0.0/22</T>
          <T x={30} y={160} k="f" size={11}>GET /healthz :8080</T>
          <rect className={cn("n", off ? "fault" : "amber")} x={372} y={64} width={16} height={132} rx="2" />
          <T x={380} y={56} k="s mid" size={11}>firewall (ingress)</T>
          <T x={398} y={214} k={off ? "s c-red" : "s"} size={11}>
            {off ? "no rule allows these ranges → implied deny @65535" : "kade-lb-to-api: tcp:8080 from Google ranges"}
          </T>
          {(
            [
              ["kade-api-1", 68],
              ["kade-api-2", 136],
            ] as const
          ).map(([name, y], i) => {
            const r = y + 28;
            return (
              <g key={name}>
                {off ? (
                  <>
                    <line className="w fault" x1={216} y1={112 + 24 * i} x2={356} y2={r} />
                    <Mark cx={358} cy={r} ok={false} />
                  </>
                ) : (
                  <Wire x1={216} y1={112 + 24 * i} x2={597} y2={r} c="green" />
                )}
                <Box x={600} y={y} w={344} h={56} c={off ? "red" : "green"} />
                <T x={614} y={y + 22} k="t" size={13}>{name}</T>
                <T x={614} y={y + 42} size={11}>app: running ✓</T>
                <T x={930} y={y + 22} k="f" end size={10.5}>health check</T>
                <T x={930} y={y + 42} k={off ? "s c-red" : "s"} end bold size={11.5}>
                  {off ? "✕ UNHEALTHY" : "✓ HEALTHY"}
                </T>
              </g>
            );
          })}
          <Caps x={16} y={262}>2 · SHOPPER PATH: the load balancer only uses backends marked healthy</Caps>
          <Box x={16} y={280} w={200} h={64} />
          <T x={30} y={308} k="t" size={13}>Shoppers</T>
          <T x={30} y={328} size={11}>https://api.kade.lk</T>
          <Box x={300} y={280} w={240} h={64} c="purple" />
          <T x={314} y={308} k="t" size={13}>load balancer</T>
          <T x={314} y={328} k={off ? "s c-red" : "s"} size={11}>{off ? "0 healthy backends" : "2 healthy backends"}</T>
          <Box x={600} y={280} w={344} h={64} c={off ? "red" : "green"} />
          <T x={614} y={308} k={off ? "t c-red" : "t"} size={13}>{off ? "502: no healthy backend" : "served by kade-api-1 and -2"}</T>
          <T x={614} y={328} size={11}>{off ? "while both apps are running fine" : "traffic shared across both"}</T>
          <Wire x1={216} y1={312} x2={297} y2={312} />
          <Wire x1={540} y1={312} x2={597} y2={312} c={off ? "red" : "green"} />
        </Drawing>
      </div>
    );
  }
  if (c.k === "B") {
    const http = what === "http";
    return (
      <Drawing h={190} label={`A ${http ? "HTTP" : "TCP"} health check against a hung app`}>
        <Box x={16} y={30} w={200} h={140} c="blue" />
        <T x={30} y={56} k="t" size={13}>kade-api-1</T>
        <T x={30} y={78} k="s c-red" size={11.5}>app HUNG</T>
        <T x={30} y={96} size={11.5}>port 8080 still open</T>
        <T x={30} y={114} size={11.5}>every request → 500</T>
        <Box x={300} y={30} w={300} h={140} c="purple" />
        <T x={316} y={56} k="t" size={13}>{http ? "HTTP check" : "TCP check"}</T>
        <T x={316} y={80} size={11.5}>{http ? "GET /healthz → 500" : "open connection to :8080 → OK"}</T>
        <T x={316} y={104} k={http ? "s" : "s c-red"} bold size={11.5}>
          {http ? "fails twice → UNHEALTHY" : "passes → HEALTHY"}
        </T>
        <T x={316} y={134} k="f" size={11}>{http ? "proves the app answers correctly" : "only proves something is listening"}</T>
        <Wire x1={297} y1={100} x2={219} y2={100} c="purple" />
        <Box x={680} y={30} w={264} h={140} c={http ? "green" : "red"} />
        <T x={694} y={56} k="t" size={13}>traffic to kade-api-1</T>
        <T x={694} y={80} size={11.5}>{http ? "stopped: all shoppers" : "continues: half of"}</T>
        <T x={694} y={98} size={11.5}>{http ? "go to kade-api-2" : "shoppers get errors"}</T>
        <Wire x1={600} y1={100} x2={677} y2={100} c={http ? "green" : "red"} />
      </Drawing>
    );
  }
  const fast = what === "fast";
  const run = probeRun(fast);
  const out = run.states.find(([a, , s]) => s === "down" && a >= 20);
  return (
    <div className="space-y-3">
      <p className="text-ink-muted font-mono text-[13px]">
        {`probe every ${run.every} s · ${run.need} failure${run.need > 1 ? "s" : ""} to mark unhealthy · ${run.need} success${run.need > 1 ? "es" : ""} to mark healthy`}
      </p>
      <Timeline
        label="Backend state, probes and rotation over 40 seconds"
        span={[0, 40]}
        x0={140}
        ticks={[0, 10, 20, 30, 40]}
        lanes={[
          { label: "backend", bars: [[0, 20, "ok", fast ? "up (one slow response at 12 s)" : "up"], [20, 40, "bad", "crashed at 20 s"]] },
          { label: "probes", bars: [] },
          {
            label: "state",
            bars: run.states.map(([a, b, s]) => [a, b, s === "up" ? "ok" : "bad", s === "up" ? "in rotation" : "out of rotation"] as Bar),
          },
        ]}
        extra={(at) => run.probes.map(([t, ok]) => <circle key={t} className={ok ? "ok" : "bad"} cx={at(t)} cy={105} r={fast ? 3.5 : 6} />)}
      />
      <Result tone={fast ? "warn" : "ok"}>
        <b>
          {fast
            ? "Removed within ~1 s of the crash, but the slow response at 12 s also pulled a healthy backend out: flapping"
            : `Removed ${out ? Math.round(out[0] - 20) : "?"} s after the crash; no false alarms`}
        </b>
      </Result>
    </div>
  );
}

/** Health checks: the firewall rule they need, what they prove, how fast they act. */
export function HcEx() {
  return <CaseExplorer label="Health check examples" cases={HC_CASES} render={(c, what) => <HcView c={c} what={what} />} />;
}

const DEPLOY_CASES: Case[] = [
  {
    k: "Rolling update",
    what: [
      ["good", "Draining + HTTP check"],
      ["nodrain", "What if draining is 0 s?"],
      ["tcp", "What if the check is TCP?"],
    ],
    take: {
      good: "The new VM gets traffic only after its HTTP health check passes. The old VM stops getting <b>new</b> requests, then has 60 s of connection draining to finish the ones it has, and only then shuts down. No request fails.",
      nodrain:
        "With no draining time, the old VM is removed while it still has requests in flight. Those shoppers get errors, for example a checkout that was halfway through.",
      tcp: "The new VM's port opens as soon as the process starts, before the app has loaded its config and connected to the database. A TCP check passes immediately, so the new VM gets traffic too early and returns errors for about 20 s.",
    },
    cfg: "Backend service: connectionDraining.drainingTimeoutSec: 60\nHealth check: HTTP /healthz (returns 200 only when the app is fully ready)\nMIG update: maxSurge 1, maxUnavailable 0",
  },
];

function DeployView({ what }: { what: string }) {
  const nodrain = what === "nodrain";
  const tcp = what === "tcp";
  const old: Bar[] = nodrain ? [[0, 60, "ok", "serving"], [60, 64, "bad"]] : [[0, 60, "ok", "serving"], [60, 120, "warn", "draining: finishes in-flight requests"], [120, 124, "off"]];
  const fresh: Bar[] = tcp
    ? [[10, 30, "wait", "booting"], [30, 50, "bad", "too early"], [50, 150, "ok", "serving"]]
    : [[10, 30, "wait", "booting"], [30, 58, "wait", "check failing"], [58, 150, "ok", "serving"]];
  const errors: [number, number] | null = nodrain ? [60, 66] : tcp ? [30, 50] : null;
  return (
    <div className="space-y-3">
      <Timeline
        label="Old and new VM during a rolling update, and what shoppers see"
        span={[0, 150]}
        x0={200}
        ticks={[0, 30, 60, 90, 120, 150]}
        marks={[{ at: 60, text: "old VM removed from rotation" }]}
        lanes={[
          { label: "old VM", sub: "version 1", bars: old },
          { label: "new VM", sub: "version 2", bars: fresh },
          { label: "shoppers", bars: errors ? [[0, errors[0], "ok"], [errors[0], errors[1], "bad"], [errors[1], 150, "ok"]] : [[0, 150, "ok"]] },
        ]}
        extra={(at) => (
          <>
            {nodrain && (
              <T x={at(64) + 6} y={50} k="s c-red" size={11}>
                removed with requests in flight
              </T>
            )}
            {!nodrain && (
              <T x={at(124) + 6} y={50} k="f" size={11}>
                stops
              </T>
            )}
            {errors && (
              <T x={at(errors[0]) + 4} y={166} k="s c-red" size={11}>
                errors
              </T>
            )}
          </>
        )}
      />
      <Result tone={errors ? "fault" : "ok"}>
        <b>{errors ? (nodrain ? "Requests cut off when the old VM left" : "Errors while the new VM received traffic too early") : "Zero failed requests during the deploy"}</b>
      </Result>
    </div>
  );
}

/** A deploy behind the load balancer: draining and readiness. */
export function DeployEx() {
  return <CaseExplorer label="Deploying behind a load balancer" cases={DEPLOY_CASES} render={(_, what) => <DeployView what={what} />} />;
}

const XFF_CASES: Case[] = [
  {
    k: "Header",
    t: "how it is built",
    what: [
      ["normal", "Normal shopper"],
      ["spoof", "What if the client fakes the header?"],
      ["cf", "Preview: with Cloudflare in front (chapter 13)"],
    ],
    take: {
      normal:
        "Google's front end <b>appends</b> two addresses to <code>X-Forwarded-For</code>: the client it saw, then the load balancer's own IP. The client's address is therefore the <b>second from the end</b>. Log the raw header once in your own setup to confirm the count before relying on it.",
      spoof:
        "The client sent its own <code>X-Forwarded-For: 1.2.3.4</code>. GCP keeps it and appends. An app that reads the <b>first</b> value now trusts an address the client made up, so a rate limit or fraud check can be dodged by changing one header. Always count from the right, by the number of proxies you run.",
      cf: "With Cloudflare in front, Google's front end sees a Cloudflare address, not the shopper. The shopper's address is in <code>CF-Connecting-IP</code> and earlier in <code>X-Forwarded-For</code>. Trusting those headers is only safe if nothing except Cloudflare can reach the load balancer, which is chapter 13's origin lock.",
    },
    cfg: "GCP adds:  X-Forwarded-For: <whatever the client sent>, <client IP>, <load balancer IP>\nShopper:   X-Forwarded-For: 203.0.113.99, 34.120.88.10\nSpoofed:   X-Forwarded-For: 1.2.3.4, 203.0.113.99, 34.120.88.10",
  },
];

function XffView({ what }: { what: string }) {
  const cf = what === "cf";
  const spoof = what === "spoof";
  const hops: [string, string, string][] = cf
    ? [
        ["Shopper", "203.0.113.99", "cyan"],
        ["Cloudflare edge", "104.16.x.x", "cyan"],
        ["Google Front End", "34.120.88.10", "purple"],
        ["kade-api", "Cloud Run", "blue"],
      ]
    : [
        ["Shopper", "203.0.113.99", "cyan"],
        ["Google Front End", "34.120.88.10", "purple"],
        ["kade-api", "Cloud Run", "blue"],
      ];
  const n = hops.length;
  const gap = (928 - n * 200) / (n - 1);
  const x = (i: number) => 16 + i * (200 + gap);
  const entries = cf ? ["203.0.113.99", "104.16.x.x", "34.120.88.10"] : [...(spoof ? ["1.2.3.4"] : []), "203.0.113.99", "34.120.88.10"];
  return (
    <div className="space-y-4">
      <Drawing h={96} label="The request's hops to kade-api">
        {hops.map(([t, s, c], i) => (
          <g key={t}>
            <Box x={x(i)} y={20} w={200} h={64} c={c} />
            <T x={x(i) + 14} y={46} k="t" size={13}>{t}</T>
            <T x={x(i) + 14} y={66} size={11.5}>{s}</T>
            {i < n - 1 && <Wire x1={x(i) + 200} y1={52} x2={x(i + 1) - 3} y2={52} c="blue" />}
          </g>
        ))}
      </Drawing>
      <div>
        <p className="text-ink-muted mb-2 text-[14px]">X-Forwarded-For as kade-api receives it</p>
        <ol className="flex flex-wrap gap-2">
          {entries.map((ip, i) => {
            const note = cf
              ? i === 0
                ? "added by Cloudflare (shopper)"
                : i === 1
                  ? "added by Google: the client it saw"
                  : "added by Google: the LB itself"
              : spoof && i === 0
                ? "sent by the client: untrusted"
                : i === entries.length - 2
                  ? "added by Google: the client it saw"
                  : "added by Google: the LB itself";
            const client = cf ? i === 0 : i === entries.length - 2;
            const fake = spoof && i === 0;
            return (
              <li
                key={ip}
                className={cn(
                  "min-w-[200px] rounded-[2px] border px-3.5 py-2.5",
                  fake ? "border-fault bg-fault-soft" : client ? "border-ink border-2" : "border-rule-strong",
                )}
              >
                <span className={cn("block font-mono text-[15px] font-bold", fake ? "text-fault" : client ? "text-ink" : "text-ink-body")}>
                  {client ? <span className="dd-mark">{ip}</span> : ip}
                </span>
                <span className="text-ink-muted block text-[13px]">{note}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <div>
        <p className="text-ink-muted mb-2 text-[14px]">Which entry to trust</p>
        <Result tone={spoof ? "fault" : "ok"}>
          <b>
            {cf
              ? "Skip Google's two entries from the right; the next is the shopper. Or use CF-Connecting-IP, only with the origin lock."
              : spoof
                ? "Reading the FIRST entry gives 1.2.3.4, which the client invented. Read the second from the end: 203.0.113.99."
                : "The second entry from the end is the client Google saw: 203.0.113.99."}
          </b>
        </Result>
      </div>
      <p className="text-ink-faint font-mono text-[13px]">Client sent X-Forwarded-For: {spoof ? "1.2.3.4" : "(none)"}</p>
    </div>
  );
}

/** X-Forwarded-For through Google's front end, and which entry to trust. */
export function XffEx() {
  return <CaseExplorer label="X-Forwarded-For behind the load balancer" cases={XFF_CASES} render={(_, what) => <XffView what={what} />} />;
}

const ARMOR_CASES: Case[] = [
  {
    k: "A",
    t: "Coverage is per backend service",
    what: [
      ["gap", "Policy on one backend service"],
      ["full", "Policy on both"],
    ],
    take: {
      gap: "Cloud Armor attaches to a <b>backend service</b>, not to the whole load balancer. Here one load balancer's backend service has a policy and the other's does not, so the second front door has no WAF at all, even for traffic that does go through a load balancer. This is how real projects end up with uneven coverage. Check with command 4.",
      full: "Both backend services carry a policy. Every request through either load balancer is inspected.",
    },
    cfg: "kade-api-backend    securityPolicy: kade-edge-policy\nadmin-backend       securityPolicy: (none)",
  },
  {
    k: "B",
    t: "Bypass around the load balancer",
    what: [
      ["all", "kade-api ingress: all"],
      ["lb", "ingress: internal-and-cloud-load-balancing"],
    ],
    take: {
      all: "Cloud Armor only sees traffic that comes <b>through the load balancer</b>. With ingress <code>all</code>, the <code>run.app</code> address is a second door straight into Cloud Run, and the WAF never sees it (chapter 10).",
      lb: "With ingress <code>internal-and-cloud-load-balancing</code>, the <code>run.app</code> door is closed. The load balancer, and Cloud Armor with it, is the only way in.",
    },
    cfg: "gcloud run services update kade-api --ingress=internal-and-cloud-load-balancing",
  },
  {
    k: "C",
    t: "How a policy decides",
    what: [
      ["login", "61st login try in a minute"],
      ["sqli", "A request with SQL injection"],
      ["normal", "A normal request"],
    ],
    take: {
      login:
        "Rules are checked by priority, lowest number first, like firewall rules. The rate-limit rule at 100 matches <code>/api/login</code> and this client is over 60 requests a minute, so Cloud Armor answers 429 itself. The backend never sees the request.",
      sqli: "The request does not hit the rate limit, but the preconfigured SQL injection rule at 1000 matches and returns 403. New WAF rules are best added in <b>preview</b> mode first: they log what they would block without blocking it, so you can check for false positives.",
      normal:
        "No rule above the default matches, so the <b>default rule</b> at 2147483647 decides. Kadé's default is allow. A policy whose default is deny must explicitly allow everything that should get through.",
    },
    cfg: 'priority 100        rate-based-ban: request.path == "/api/login", 60/min per IP → 429\npriority 1000       evaluatePreconfiguredWaf("sqli-v33-stable") → deny 403\npriority 1001       evaluatePreconfiguredWaf("xss-v33-stable")  → deny 403\npriority 2147483647 default → allow',
  },
];

const ARMOR_RULES: [string, string, string][] = [
  ["100", "rate limit /api/login, 60/min per IP", "429"],
  ["1000", "preconfigured WAF: sqli-v33-stable", "403"],
  ["1001", "preconfigured WAF: xss-v33-stable", "403"],
  ["2147483647", "default rule", "allow"],
];

function ArmorView({ c, what }: { c: Case; what: string }) {
  if (c.k === "A") {
    const full = what === "full";
    return (
      <div className="space-y-3">
        <Drawing h={242} label="Two load balancers; Cloud Armor coverage depends on each backend service">
          {(
            [
              ["kade-lb (shop)", "kade-api-backend", true, 30],
              ["admin-lb (internal tools)", "admin-backend", full, 150],
            ] as const
          ).map(([lb, svc, on, y]) => (
            <g key={lb}>
              <Box x={16} y={y} w={150} h={80} />
              <T x={30} y={y + 34} k="t" size={12.5}>internet</T>
              <T x={30} y={y + 54} size={11}>requests</T>
              <Box x={206} y={y} w={200} h={80} c="purple" />
              <T x={220} y={y + 30} k="t" size={12}>{lb}</T>
              <T x={220} y={y + 52} size={10.5}>forwarding rule → proxy</T>
              <T x={220} y={y + 68} size={10.5}>→ URL map</T>
              <Box x={446} y={y} w={240} h={80} c={on ? "green" : "red"} />
              <T x={460} y={y + 30} k="t" size={12.5}>{svc}</T>
              <T x={460} y={y + 52} k={on ? "s" : "s c-red"} bold size={11}>
                {on ? "Cloud Armor: kade-edge-policy" : "Cloud Armor: none"}
              </T>
              <T x={460} y={y + 70} k="f" size={10.5}>{on ? "inspected" : "not inspected"}</T>
              <Box x={726} y={y} w={218} h={80} c="blue" />
              <T x={740} y={y + 44} k="t" size={12.5}>backends</T>
              <Wire x1={166} y1={y + 40} x2={203} y2={y + 40} />
              <Wire x1={406} y1={y + 40} x2={443} y2={y + 40} c="purple" />
              <Wire x1={686} y1={y + 40} x2={723} y2={y + 40} c={on ? "green" : "red"} />
            </g>
          ))}
        </Drawing>
        <Result tone={full ? "ok" : "fault"}>
          <b>{full ? "Every backend service has a policy: full coverage" : "One load balancer has a WAF, the other has none"}</b>
        </Result>
      </div>
    );
  }
  if (c.k === "B") {
    const all = what === "all";
    return (
      <Chain
        nodes={[
          { t: "attacker", s: ["knows the", "run.app address"], c: "red" },
          { t: "run.app address", s: ["kade-api-xxxx", ".run.app"], c: "cyan" },
          {
            t: "Cloud Run ingress",
            s: all ? ["setting: all", "accepts direct", "requests"] : ["internal-and-cloud", "-load-balancing", "refuses direct"],
            c: all ? "red" : "green",
          },
          { t: "kade-api", s: ["the app"], c: "blue" },
        ]}
        links={["1 request", "2 checked", "3 delivered"]}
        block={all ? undefined : 2}
        ok={!all}
        notes={["The load balancer, and kade-edge-policy with it, is not in this path at all."]}
        result={all ? "Reached the app with no WAF in the path" : "Blocked: run.app returns 404; only the load balancer can reach kade-api"}
      />
    );
  }
  const hit = what === "login" ? 0 : what === "sqli" ? 1 : 3;
  const req =
    what === "login"
      ? "POST /api/login  (61st in this minute, 203.0.113.99)"
      : what === "sqli"
        ? "GET /api/products?id=1' OR '1'='1"
        : "GET /api/products?category=rice";
  const allowed = hit === 3;
  const y = 80 + 66 * hit + 26;
  return (
    <div className="space-y-3">
      <Drawing h={344} label="A request against Cloud Armor's rules, lowest priority number first">
        <Box x={16} y={10} w={928} h={46} />
        <T x={32} y={38} k="t">Request</T>
        <T x={110} y={38}>{req}</T>
        {ARMOR_RULES.map(([pr, text, act], i) => {
          const ry = 80 + 66 * i;
          const state = i < hit ? "pass" : i === hit ? "hit" : "nr";
          return (
            <g key={pr} className={state === "nr" ? "off" : undefined}>
              <Box x={90} y={ry} w={700} h={52} c={state === "hit" ? (act === "allow" ? "green" : "red") : undefined} />
              <T x={106} y={ry + 22} k="f" size={10.5}>{`priority ${pr}`}</T>
              <T x={106} y={ry + 40} size={12}>{text}</T>
              <T x={774} y={ry + 32} k={state === "hit" && act !== "allow" ? "s c-red" : state === "hit" ? "s" : "f"} end bold>
                {state === "hit" ? (act === "allow" ? "ALLOW" : `DENY ${act}`) : state === "pass" ? "no match ↓" : "not reached"}
              </T>
            </g>
          );
        })}
        <line className={cn("w", allowed ? "green" : "fault")} x1={50} y1={64} x2={50} y2={y} strokeWidth={3} />
        <line className={cn("w", allowed ? "green" : "fault")} x1={50} y1={y} x2={87} y2={y} strokeWidth={3} markerEnd={`url(#dd-ah-${allowed ? "green" : "fault"})`} />
      </Drawing>
      <Result tone={allowed ? "ok" : "fault"}>
        <b>{allowed ? "Forwarded to kade-api-backend" : `Answered by Cloud Armor (${ARMOR_RULES[hit][2]}); the backend never sees it`}</b>
      </Result>
    </div>
  );
}

/** Cloud Armor: where it attaches, how it is bypassed, how a policy decides. */
export function ArmorEx() {
  return <CaseExplorer label="Cloud Armor examples" cases={ARMOR_CASES} render={(c, what) => <ArmorView c={c} what={what} />} />;
}

// ── Chapter 12.2 ───────────────────────────────────────────────────────────

/** A managed instance group, the template it builds from, and what runs it. */
export function MigOverview() {
  return (
    <WidgetFrame wide label="A managed instance group">
      <Drawing h={280} label="Instance template, the regional managed instance group across three zones, autohealing, autoscaler and backend service">
        <Box x={16} y={30} w={190} h={120} c="orange" />
        <T x={30} y={56} k="t" size={12.5}>Instance template</T>
        <T x={30} y={78} size={11}>kade-media-tpl-v1</T>
        <T x={30} y={98} k="f" size={10.5}>e2-standard-2 · image</T>
        <T x={30} y={114} k="f" size={10.5}>sn-app · no external IP</T>
        <T x={30} y={130} k="f" size={10.5}>sa-kade-media</T>
        <Zone x={250} y={16} w={470} h={250} c="blue" />
        <T x={266} y={40} size={12}>kade-media-mig · regional · asia-southeast1</T>
        {["a", "b", "c"].map((zone, i) => {
          const x = 266 + 150 * i;
          const vms = i < 2 ? 1 : 0;
          return (
            <g key={zone}>
              <Zone x={x} y={54} w={138} h={128} />
              <T x={x + 10} y={72} size={11}>{`zone ${zone}`}</T>
              {[0, 1].map((j) => (
                <g key={j}>
                  <Box x={x + 10} y={82 + 46 * j} w={118} h={36} c={j < vms ? "green" : undefined} />
                  <T x={x + 20} y={105 + 46 * j} k={j < vms ? "s" : "f"} size={10.5}>
                    {j < vms ? `kade-media-${["x7k2", "p3fd", "m9qa"][i]}` : "(room to grow)"}
                  </T>
                </g>
              ))}
            </g>
          );
        })}
        <Wire x1={206} y1={90} x2={263} y2={100} c="orange" />
        <T x={30} y={174} k="f" size={10.5}>every new VM is built</T>
        <T x={30} y={190} k="f" size={10.5}>from this recipe</T>
        <Box x={266} y={196} w={214} h={58} />
        <T x={280} y={220} k="t" size={12}>Autohealing</T>
        <T x={280} y={240} size={10.5}>recreates broken VMs</T>
        <Box x={490} y={196} w={214} h={58} />
        <T x={504} y={220} k="t" size={12}>Autoscaler</T>
        <T x={504} y={240} size={10.5}>2 to 8 VMs with load</T>
        <Box x={764} y={90} w={180} h={90} c="purple" />
        <T x={778} y={116} k="t" size={12.5}>Backend service</T>
        <T x={778} y={136} size={11}>kade-media-backend</T>
        <T x={778} y={156} k="f" size={10.5}>← from the LB</T>
        <Wire x1={761} y1={135} x2={723} y2={135} c="purple" />
        <T x={778} y={204} k="f" size={10.5}>sends traffic only to</T>
        <T x={778} y={220} k="f" size={10.5}>healthy VMs in the group</T>
      </Drawing>
    </WidgetFrame>
  );
}

const HEAL_CASES: Case[] = [
  {
    k: "App hangs on a running VM",
    what: [
      ["both", "LB check + autohealing"],
      ["lbonly", "What if there is no autohealing?"],
    ],
    take: {
      both: "The load balancer's quick check fails after about 10 s, so traffic stops going to the hung VM, and shoppers see nothing wrong. A minute later the slower autohealing check gives up on it too, and the MIG <b>replaces</b> the VM. Two checks, two jobs, both needed.",
      lbonly:
        'The load balancer stops sending traffic to the hung VM, so shoppers are fine, but the VM stays hung forever. The group is now running one VM short until someone notices. Autohealing is what turns "removed from traffic" into "fixed".',
    },
    cfg: "LB check kade-media-hc:      every 5 s, 2 failures  → out of rotation in ~10 s\nAutohealing kade-media-heal: every 20 s, 3 failures → recreated after ~60 s",
  },
  {
    k: "A new VM starting up",
    what: [
      ["delay", "Initial delay 180 s"],
      ["nodelay", "What if the initial delay is 0?"],
    ],
    take: {
      delay:
        "The app needs about 90 s to load its config and warm its cache. Autohealing waits 180 s before judging the new VM, the app is ready long before then, and the VM joins the group.",
      nodelay:
        "Autohealing judges the VM while the app is still starting. <code>/healthz</code> fails, the MIG recreates the VM, the new one also is not ready in time, and so on: a <b>boot loop</b>. The group never reaches its size, often right when the autoscaler needed it most. Set the initial delay longer than your slowest startup.",
    },
    cfg: "gcloud compute instance-groups managed update kade-media-mig \\\n  --region=asia-southeast1 --health-check=kade-media-heal --initial-delay=180",
  },
];

function HealView({ c, what }: { c: Case; what: string }) {
  if (c.k === "App hangs on a running VM") {
    const both = what === "both";
    return (
      <div className="space-y-3">
        <Timeline
          label="A hung VM: the load balancer stops sending traffic, autohealing replaces it"
          span={[0, 150]}
          ticks={[0, 30, 60, 90, 120, 150]}
          marks={[{ at: 30, text: "hangs", fault: true }, ...(both ? [{ at: 92, text: "autohealing recreates it" }] : [])]}
          lanes={[
            {
              label: "kade-media-x7k2",
              bars: both ? [[0, 30, "ok", "serving"], [30, 92, "bad", "app hung"], [92, 140, "wait", "new VM booting"], [140, 150, "ok"]] : [[0, 30, "ok", "serving"], [30, 150, "bad", "app hung"]],
            },
            {
              label: "LB traffic to it",
              bars: [[0, 40, "ok", "sent traffic"], [40, both ? 140 : 150, "off", "removed after ~10 s"], ...(both ? ([[140, 150, "ok"]] as Bar[]) : [])],
            },
            {
              label: "group size",
              bars: [[0, 30, "ok", "2 of 2 serving"], [30, both ? 140 : 150, "warn", "1 of 2 serving"], ...(both ? ([[140, 150, "ok"]] as Bar[]) : [])],
            },
          ]}
        />
        <Result tone={both ? "ok" : "warn"}>
          <b>{both ? "Shoppers unaffected; the group repairs itself in about 2 minutes" : "Shoppers unaffected, but the group stays one VM short until someone notices"}</b>
        </Result>
      </div>
    );
  }
  const loop = what === "nodelay";
  const vm: Bar[] = loop ? Array.from({ length: 6 }, (_, i) => [[100 * i, 100 * i + 60, "wait", "booting"], [100 * i + 60, 100 * i + 98, "bad"]] as Bar[]).flat() : [[0, 90, "wait", "booting, app warming up"], [90, 600, "ok", "healthy, serving"]];
  const heal: Bar[] = loop ? Array.from({ length: 6 }, (_, i) => [[100 * i, 100 * i + 60, "warn", "checks"], [100 * i + 60, 100 * i + 98, "bad"]] as Bar[]).flat() : [[0, 180, "off", "waiting (initial delay)"], [180, 600, "ok", "checking: passes"]];
  return (
    <div className="space-y-3">
      <Timeline
        label="A new VM and the autohealing check over ten minutes"
        span={[0, 600]}
        ticks={[0, 120, 240, 360, 480, 600]}
        lanes={[
          { label: "new VM", bars: vm },
          { label: "autohealing", bars: heal },
        ]}
        extra={(at) =>
          loop &&
          Array.from({ length: 6 }, (_, i) => (
            <g key={i}>
              <T x={at(100 * i + 79)} y={50} k="s mid c-red" size={9.5}>deleted</T>
              <T x={at(100 * i + 79)} y={110} k="s mid c-red" size={10}>✕ fail</T>
            </g>
          ))
        }
      />
      <Result tone={loop ? "fault" : "ok"}>
        <b>{loop ? "Boot loop: every VM is recreated before its app is ready" : "The VM is judged only after it had time to start"}</b>
      </Result>
    </div>
  );
}

/** Autohealing next to the load balancer's check, and the initial delay. */
export function HealEx() {
  return <CaseExplorer label="Autohealing examples" cases={HEAL_CASES} render={(c, what) => <HealView c={c} what={what} />} />;
}

const SCALE_CASES: Case[] = [
  {
    k: "A sale day",
    what: [
      ["ok", "min 2, max 8"],
      ["max4", "What if max is 4?"],
      ["min1", "What if min is 1?"],
    ],
    take: {
      ok: "Each VM handles 80 requests per second; the autoscaler aims for 80% of that. As the evening sale ramps up, VMs are added (about 2 minutes behind demand, while new VMs start), and removed slowly afterwards. Capacity stays above demand all day.",
      max4: 'The ceiling is reached during the sale. From then on, demand is above what the group can serve: requests slow down and some fail, while the autoscaler reports "maximum reached". A ceiling is a cost control, so set it from real peak numbers.',
      min1: "At night the group shrinks to one VM in one zone. If that VM fails or that zone has a problem, there is nothing serving until a replacement starts. Two is the minimum for anything users depend on.",
    },
    cfg: "--min-num-replicas=2 --max-num-replicas=8\n--target-load-balancing-utilization=0.8   (80% of RATE 80 per VM = 64 rps per VM)\n--cool-down-period=120",
  },
];

/** Demand in requests per second over a day with an evening sale. */
const demand = (h: number) => {
  const base = 40 + 60 * Math.max(0, Math.sin(((h - 6) / 24) * Math.PI * 2 - Math.PI / 2) + 0.6);
  const sale = h >= 19 && h < 23 ? 260 * Math.sin(((h - 19) / 4) * Math.PI) : 0;
  return Math.max(20, base + sale);
};

/** VMs the autoscaler runs through the day: up quickly, down at most two at a time. */
function scaleRun(min: number, max: number) {
  const out: [number, number][] = [];
  let vms = min;
  let fallingSince: number | null = null;
  for (let i = 0; i <= 240; i++) {
    const h = i / 10;
    const want = Math.min(max, Math.max(min, Math.ceil(demand(Math.max(0, h - 0.04)) / 64)));
    if (want > vms) {
      vms = want;
      fallingSince = null;
    } else if (want < vms) {
      fallingSince ??= h;
      if (h - fallingSince >= 0.17) {
        vms = Math.max(want, vms - 2);
        fallingSince = h;
      }
    } else fallingSince = null;
    out.push([h, vms]);
  }
  return out;
}

function ScaleView({ what }: { what: string }) {
  const min = what === "min1" ? 1 : 2;
  const max = what === "max4" ? 4 : 8;
  const run = scaleRun(min, max);
  const x = (h: number) => 70 + (h / 24) * 860;
  const y = (rps: number) => 250 - (rps / 700) * 220;
  const capacity = run.map(([h, v], i) => `${i ? "L" : "M"}${x(h).toFixed(1)} ${y(80 * v).toFixed(1)}`).join(" ");
  const load = run.map(([h], i) => `${i ? "L" : "M"}${x(h).toFixed(1)} ${y(demand(h)).toFixed(1)}`).join(" ");
  const over = run.filter(([h, v]) => demand(h) > 80 * v).map(([h]) => h);
  return (
    <div className="space-y-3">
      <Drawing h={306} label="Demand and capacity over a day with an evening sale">
        <path className="n green" d={`${capacity} L ${x(24)} 250 L ${x(0)} 250 Z`} />
        <path className="w" d={load} strokeWidth={2.2} style={{ stroke: "var(--dd-ink)" }} />
        {over.length > 0 && (
          <>
            <rect className="n fault" x={x(over[0])} y={30} width={x(over[over.length - 1]) - x(over[0])} height={220} style={{ stroke: "none" }} />
            <T x={x(over[0]) + 4} y={44} k="s c-red" bold size={11}>demand above capacity</T>
          </>
        )}
        {[0, 6, 12, 18, 24].map((h) => (
          <T key={h} x={x(h)} y={268} k="f mid" size={11}>{`${String(h).padStart(2, "0")}:00`}</T>
        ))}
        {[0, 200, 400, 600].map((r) => (
          <T key={r} x={62} y={y(r) + 4} k="f" end size={10.5}>{`${r}`}</T>
        ))}
        <T x={70} y={20} k="f" size={10.5}>requests per second</T>
        <line x1={620} y1={290} x2={650} y2={290} className="w" strokeWidth={2.2} style={{ stroke: "var(--dd-ink)" }} />
        <T x={656} y={294} size={11}>demand</T>
        <rect className="n green" x={720} y={283} width={26} height={14} />
        <T x={752} y={294} size={11}>capacity (VMs × 80)</T>
        {min === 1 && (
          <T x={x(3)} y={y(80) - 8} bold size={11}>
            1 VM, 1 zone
          </T>
        )}
      </Drawing>
    </div>
  );
}

/** The autoscaler through a sale day, and what min and max change. */
export function ScaleEx() {
  return <CaseExplorer label="Autoscaling examples" cases={SCALE_CASES} render={(_, what) => <ScaleView what={what} />} />;
}

type VmKind = "v1" | "v2" | "v2s" | "drain" | "v1s";
type UpdateStep = [name: string, text: string, serving: [VmKind, number][], extra: [VmKind, number][]];
const UPDATE_STEPS: Record<string, UpdateStep[]> = {
  rolling: [
    ["Start", "6 VMs on v1, target size 6", [["v1", 6]], []],
    ["Surge", "3 new v2 VMs start (max surge 3), one per zone. Nobody is removed yet", [["v1", 6]], [["v2s", 3]]],
    ["Swap", "The v2 VMs pass their health check and join; 3 v1 VMs drain for 60 s and are deleted", [["v1", 3], ["v2", 3]], [["drain", 3]]],
    ["Surge again", "3 more v2 VMs start", [["v1", 3], ["v2", 3]], [["v2s", 3]]],
    ["Done", "All 6 on v2. Capacity never went below 6 serving VMs (max unavailable 0)", [["v2", 6]], []],
  ],
  canary: [
    ["Start", "6 VMs on v1", [["v1", 6]], []],
    ["Canary", "1 VM moves to v2 (canary target size 1); 5 stay on v1. About 1 in 6 requests hits v2", [["v1", 5], ["v2", 1]], []],
    ["Watch", "Compare v2's error rate and latency with v1 in the logs (backend VM names show which is which)", [["v1", 5], ["v2", 1]], []],
    ["Promote", "Looks good: start a normal rolling update to v2 for everyone", [["v2", 6]], []],
  ],
  rollback: [
    ["Problem", "A rolling update to v2 is half done, and errors rise", [["v1", 3], ["v2", 3]], []],
    ["Roll back", "Run the same command with v1 as the version. The MIG rolls the v2 VMs back the same careful way", [["v1", 3], ["v2", 3]], [["v1s", 3]]],
    ["Done", "All on v1 again. v1's template was never changed, so it builds exactly the VMs that worked before", [["v1", 6]], []],
  ],
};
type UpdateCase = Case & { key: string };
const UPDATE_CASES: UpdateCase[] = (
  [
    ["Rolling update", "rolling"],
    ["Canary", "canary"],
    ["Rollback", "rollback"],
  ] as const
).map(([k, key]) => ({
  k,
  key,
  whatLabel: "Step",
  what: UPDATE_STEPS[key].map((s, i) => [String(i), `${i + 1} · ${s[0]}`] as [string, string]),
  take: { normal: UPDATE_STEPS[key][0][1], ...Object.fromEntries(UPDATE_STEPS[key].map((s, i) => [String(i), s[1]])) },
}));
const VM_LABEL: Record<VmKind, string> = { v1: "v1", v2: "v2", v2s: "v2 starting", drain: "v1 draining", v1s: "v1 starting" };

function Vms({ list }: { list: [VmKind, number][] }) {
  return (
    <>
      {list.flatMap(([kind, count]) =>
        Array.from({ length: count }, (_, i) => (
          <li
            key={`${kind}${i}`}
            className={cn(
              "grid h-[72px] w-[84px] content-center rounded-[2px] border px-3",
              kind === "drain" ? "bg-mark border-ink-faint border-dashed" : kind.endsWith("s") ? "border-ink-faint border-dashed" : kind === "v2" ? "border-ink border-2" : "border-rule-strong",
            )}
          >
            <span className="text-ink-faint text-[12px]">VM</span>
            <span className={cn("font-mono text-[13px] leading-tight", kind === "v2" ? "text-ink font-bold" : "text-ink-body")}>{VM_LABEL[kind]}</span>
          </li>
        )),
      )}
    </>
  );
}

function UpdateView({ c, what }: { c: UpdateCase; what: string }) {
  const step = UPDATE_STEPS[c.key][+what || 0];
  const serving = step[2].reduce((a, [, n]) => a + n, 0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <div>
          <p className="text-ink-muted mb-2 text-[14px]">Serving</p>
          <ul className="flex flex-wrap gap-2.5">
            <Vms list={step[2]} />
          </ul>
        </div>
        {step[3].length > 0 && (
          <div>
            <p className="text-ink-muted mb-2 text-[14px]">Extra or leaving</p>
            <ul className="flex flex-wrap gap-2.5">
              <Vms list={step[3]} />
            </ul>
          </div>
        )}
      </div>
      <Result tone={serving >= 6 ? "ok" : "warn"}>
        <b>{serving} VMs serving · target 6</b>
      </Result>
    </div>
  );
}

/** Rolling update, canary and rollback, one step at a time. */
export function UpdateEx() {
  return <CaseExplorer label="Updating a managed instance group" cases={UPDATE_CASES} render={(c, what) => <UpdateView c={c} what={what} />} />;
}

/** The same load balancer chain, now ending in the instance group. */
export function MigChain() {
  const links: [string, string, string, string][] = [
    ["Forwarding rule", "kade-https-rule", "34.120.88.10:443", "purple"],
    ["Target proxy", "kade-https-proxy", "TLS ends here", "orange"],
    ["URL map", "kade-url-map", "www…/media/* →", "orange"],
    ["Backend service", "kade-media-backend", "RATE 80/VM · Armor · CDN", "orange"],
    ["Instance group", "kade-media-mig", "named port http:8080", "blue"],
  ];
  return (
    <WidgetFrame wide label="The load balancer chain to the instance group">
      <Drawing h={140} label="The five links from the forwarding rule to kade-media-mig; links 3 to 5 change for media">
        {links.map(([t, n, s, c], i) => {
          const x = 16 + 190 * i;
          return (
            <g key={t}>
              <Box x={x} y={30} w={166} h={96} c={i >= 2 ? "yellow" : c} />
              <T x={x + 12} y={54} k="f" size={10}>{`LINK ${i + 1}`}</T>
              <T x={x + 12} y={74} k="t" size={12}>{t}</T>
              <T x={x + 12} y={94} size={10.5}>{n}</T>
              <T x={x + 12} y={112} k="f" size={10}>{s}</T>
              {i < 4 && <Wire x1={x + 166} y1={78} x2={x + 187} y2={78} />}
            </g>
          );
        })}
      </Drawing>
      <WidgetNote>Links 1 and 2 are shared with kade-api. The URL map adds one path rule; links 4 and 5 are new.</WidgetNote>
      <p className="text-ink mt-2 font-mono text-[13.5px] leading-[1.6]">
        api.kade.lk/* → kade-api-backend (serverless NEG) · www.kade.lk/media/* → kade-media-backend (MIG)
      </p>
    </WidgetFrame>
  );
}
