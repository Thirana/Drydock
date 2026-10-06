"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Choices, KeyValues, WidgetNote } from "../ui";
import { WidgetFrame } from "../widget-frame";
import { CaseExplorer, Result, type Case, type Tone } from "./case-explorer";
import { Box, Caps, Drawing, Mark, T, Wire } from "./draw";
import { Runbook } from "./kit";

/*
 * Part 4 · The front door: Cloudflare (chapter 13). Cloudflare is a network
 * outside GCP, so it is drawn in ink, as the course legend says.
 */

/** DNS and the two TLS legs once Cloudflare is in front. */
export function CfOverview() {
  return (
    <WidgetFrame wide label="Cloudflare in front of Kadé">
      <Drawing h={296} label="Cloudflare answers DNS with its own address, then proxies traffic to the GCP load balancer over a second TLS leg">
        <Caps x={16} y={20}>DNS: WHERE IS api.kade.lk?</Caps>
        <Box x={16} y={34} w={180} h={70} />
        <T x={30} y={62} k="t" size={13}>Shopper</T>
        <T x={30} y={82} size={11}>Colombo · 203.0.113.99</T>
        <Box x={300} y={34} w={300} h={70} />
        <T x={316} y={60} k="t" size={12.5}>Cloudflare DNS (authoritative)</T>
        <T x={316} y={82} size={11}>api.kade.lk → 104.21.48.12 (Cloudflare)</T>
        <Wire x1={196} y1={62} x2={297} y2={62} />
        <Wire x1={297} y1={80} x2={199} y2={80} />
        <T x={640} y={60} k="f" size={11}>For an orange record, the answer is a</T>
        <T x={640} y={78} k="f" size={11}>Cloudflare address. The real origin IP</T>
        <T x={640} y={96} k="f" size={11}>34.120.88.10 is never published.</T>
        <Caps x={16} y={148}>TRAFFIC: TWO CONNECTIONS, TWO TLS LEGS</Caps>
        <Box x={16} y={162} w={180} h={90} />
        <T x={30} y={190} k="t" size={13}>Shopper</T>
        <T x={30} y={212} size={11}>browser or app</T>
        <Box x={268} y={162} w={210} h={90} />
        <T x={282} y={190} k="t" size={13}>Cloudflare edge</T>
        <T x={282} y={212} size={11}>nearest city, e.g. Colombo</T>
        <T x={282} y={230} k="f" size={11}>WAF · DDoS · cache</T>
        <Box x={550} y={162} w={200} h={90} c="purple" />
        <T x={564} y={190} k="t" size={13}>GCP load balancer</T>
        <T x={564} y={212} size={11}>34.120.88.10</T>
        <T x={564} y={230} k="f" size={11}>Cloud Armor: origin lock</T>
        <Box x={800} y={162} w={144} h={90} c="blue" />
        <T x={814} y={190} k="t" size={13}>Cloud Run</T>
        <T x={814} y={212} size={11}>kade-api</T>
        <Wire x1={196} y1={198} x2={265} y2={198} />
        <T x={231} y={186} k="s mid" size={10.5}>edge leg</T>
        <T x={231} y={222} k="f mid" size={10.5}>TLS 1</T>
        <Wire x1={478} y1={198} x2={547} y2={198} />
        <T x={513} y={186} k="s mid" size={10.5}>origin leg</T>
        <T x={513} y={222} k="f mid" size={10.5}>TLS 2</T>
        <Wire x1={750} y1={198} x2={797} y2={198} c="purple" />
        <T x={268} y={280} size={11.5}>Cloudflare ends the shopper&apos;s connection and opens its own to GCP: a proxy, as in chapter 11.</T>
      </Drawing>
    </WidgetFrame>
  );
}

/** The order of the move from Cloud DNS to Cloudflare. */
export function CfMigrate() {
  return (
    <WidgetFrame label="Moving kade.lk to Cloudflare, step by step">
      <Runbook
        phases={[
          [
            "Before the switch",
            [
              ["1", "Add kade.lk to Cloudflare", "Cloudflare scans existing records; compare every record with Cloud DNS", "record lists match"],
              ["2", "Set records to grey first", "Everything DNS only, so the switch changes nobody's path yet", "all records grey"],
              ["3", "Turn off DNSSEC at the old side", "Remove the DS record at the .lk registrar; wait for its TTL (often 1-2 days)", "no DS at the registrar"],
            ],
          ],
          [
            "The switch",
            [
              ["4", "Change name servers at the registrar", "Point kade.lk at the two Cloudflare name servers", "dig NS kade.lk shows Cloudflare"],
              ["5", "Turn on DNSSEC in Cloudflare", "Add Cloudflare's new DS record at the registrar", "dig +dnssec shows the ad flag"],
            ],
          ],
          [
            "After",
            [
              ["6", "Set the mode, then go orange", "Full (strict) first, then switch kade.lk, www, api to orange one at a time", "site works through Cloudflare"],
              ["7", "Lock the origin", "Cloud Armor allows only Cloudflare + secret header (section 06)", "direct IP returns 403"],
              ["8", "Delete the Cloud DNS public zone", "Only after the old name servers have aged out of caches (a few days)", "kade-lk gone; kade-internal kept"],
            ],
          ],
        ]}
      />
      <WidgetNote>
        Going grey first separates the two risky changes: a DNS provider change (steps 3 to 5) and a traffic path change (step 6). If the site breaks after step
        4, it is DNS; after step 6, it is the proxy or TLS mode.
      </WidgetNote>
    </WidgetFrame>
  );
}

const RECORD_CASES: Case[] = [
  {
    k: "api.kade.lk",
    t: "A record",
    what: [
      ["orange", "Orange (proxied)"],
      ["grey", "What if it is grey?"],
    ],
    take: {
      orange:
        "Cloudflare answers with <b>its own</b> address. The shopper connects to Cloudflare's edge, which applies the WAF and cache, then connects to <code>34.120.88.10</code> itself. The origin IP never appears in DNS.",
      grey: "Cloudflare only answers DNS, with the real origin address <code>34.120.88.10</code>. The shopper connects straight to Google's load balancer: <b>no Cloudflare WAF, no DDoS protection, no cache</b>, and the origin IP is now public. With the origin lock on, these shoppers would even get 403.",
    },
    cfg: "api.kade.lk  A  34.120.88.10  proxied (orange)\n\ndig +short api.kade.lk  →  104.21.48.12, 172.67.140.9   (Cloudflare)\ngrey:                     →  34.120.88.10                 (origin)",
  },
  {
    k: "kade.lk",
    t: "apex, orange",
    take: "The bare domain is a record like any other, and it is easy to forget. Shoppers who type <code>kade.lk</code> must also go through Cloudflare, or they skip the WAF and are blocked by the origin lock. Cloudflare can also put a CNAME-like record at the apex (CNAME flattening) when needed.",
    cfg: "kade.lk  A  34.120.88.10  proxied (orange)",
  },
  {
    k: "status.kade.lk",
    t: "grey",
    take: "This points at a status page provider, not at Kadé. Proxying it would put Cloudflare between visitors and a service whose TLS and certificates the provider manages, so it stays DNS only.",
    cfg: "status.kade.lk  CNAME  kade.statuspage.example  DNS only (grey)",
  },
  {
    k: "MX",
    t: "mail",
    take: "Mail travels over SMTP, which Cloudflare does not proxy. MX and TXT records are always DNS only. If a mail server's A record were Kadé's own server, that server's IP would be public through it: another reason to use a mail provider.",
    cfg: "kade.lk  MX  10  mail.provider.example",
  },
  {
    k: "_acme-challenge",
    t: "certificate check",
    take: "Certificate Manager's DNS authorization (chapter 12) checks this CNAME to prove Kadé controls the domain, and checks it again at every renewal. It must stay DNS only, or Google sees a Cloudflare answer instead of the CNAME and the certificate cannot be issued or renewed.",
    cfg: "_acme-challenge.kade.lk  CNAME  1a2b3c.4.authorize.certificatemanager.goog  DNS only (grey)",
  },
];

function RecordView({ c, what }: { c: Case; what: string }) {
  const rec = (
    {
      "api.kade.lk": ["api.kade.lk", "A", "34.120.88.10", what !== "grey"],
      "kade.lk": ["kade.lk", "A", "34.120.88.10", true],
      "status.kade.lk": ["status.kade.lk", "CNAME", "kade.statuspage.example", false],
      MX: ["kade.lk", "MX", "10 mail.provider.example", false],
      "_acme-challenge": ["_acme-challenge.kade.lk", "CNAME", "…authorize.certificatemanager.goog", false],
    } as Record<string, [string, string, string, boolean]>
  )[c.k];
  const proxied = rec[3];
  const answer = proxied ? "104.21.48.12 (Cloudflare)" : rec[1] === "A" ? `${rec[2]} (origin)` : rec[2];
  const elsewhere = rec[1] === "MX" || c.k === "_acme-challenge" || c.k === "status.kade.lk";
  const target = c.k === "MX" ? ["mail provider", "SMTP, not proxied"] : c.k === "_acme-challenge" ? ["Certificate Manager", "reads the CNAME"] : ["status page provider", "its own TLS"];
  return (
    <div className="space-y-3">
      <Drawing h={226} label={`The ${rec[1]} record for ${rec[0]} and where a visitor ends up`}>
        <Caps x={16} y={22}>THE RECORD IN CLOUDFLARE</Caps>
        <Box x={16} y={34} w={928} h={52} />
        <T x={32} y={66} k="t" size={13}>{rec[0]}</T>
        <T x={330} y={66}>{rec[1]}</T>
        <T x={400} y={66}>{rec[2]}</T>
        <Box x={770} y={46} w={158} h={28} className={proxied ? undefined : "dash"} />
        <T x={849} y={65} k="s mid" bold={proxied} size={11.5}>
          {proxied ? "proxied (orange)" : "DNS only (grey)"}
        </T>
        <Caps x={16} y={120}>WHAT A VISITOR GETS, AND WHERE THEY CONNECT</Caps>
        <Box x={16} y={134} w={180} h={74} />
        <T x={30} y={162} k="t" size={13}>Visitor</T>
        <T x={30} y={184} size={10.5}>{`dig ${rec[1] === "MX" ? "MX " : ""}${rec[0]}`}</T>
        <Box x={236} y={134} w={220} h={74} />
        <T x={250} y={160} k="f" size={10.5}>DNS answer</T>
        <T x={250} y={182} size={11.5} bold={proxied}>{answer}</T>
        <Wire x1={196} y1={171} x2={233} y2={171} />
        {elsewhere ? (
          <>
            <Box x={560} y={134} w={384} h={74} c="blue" />
            <T x={576} y={162} k="t" size={13}>{target[0]}</T>
            <T x={576} y={184} size={11}>{target[1]}</T>
            <Wire x1={456} y1={171} x2={557} y2={171} />
          </>
        ) : proxied ? (
          <>
            <Box x={500} y={134} w={200} h={74} />
            <T x={514} y={162} k="t" size={13}>Cloudflare edge</T>
            <T x={514} y={184} size={11}>WAF · DDoS · cache</T>
            <Box x={744} y={134} w={200} h={74} c="purple" />
            <T x={758} y={162} k="t" size={13}>GCP load balancer</T>
            <T x={758} y={184} size={11}>34.120.88.10</T>
            <Wire x1={456} y1={171} x2={497} y2={171} />
            <Wire x1={700} y1={171} x2={741} y2={171} />
          </>
        ) : (
          <>
            <g className="off">
              <Box x={500} y={134} w={200} h={74} />
              <T x={514} y={162} k="t" size={13}>Cloudflare edge</T>
              <T x={514} y={184} size={11}>not in the path</T>
            </g>
            <Box x={744} y={134} w={200} h={74} c="red" />
            <T x={758} y={162} k="t" size={13}>GCP load balancer</T>
            <T x={758} y={184} size={11}>34.120.88.10, public</T>
            <path className="w fault" d="M456 180 C 520 262, 690 262, 741 186" markerEnd="url(#dd-ah-fault)" />
          </>
        )}
      </Drawing>
      <Result tone={elsewhere ? "plain" : proxied ? "ok" : "fault"}>
        <b>
          {elsewhere
            ? "Not web traffic for Kadé's origin: stays DNS only by design"
            : proxied
              ? "Protected: every visitor passes Cloudflare; the origin IP stays out of DNS"
              : "Skips Cloudflare: no WAF or cache, origin IP published, and blocked by the origin lock"}
        </b>
      </Result>
    </div>
  );
}

/** Kadé's records in Cloudflare: which are proxied, and why the rest are not. */
export function CfRecords() {
  return <CaseExplorer label="Kadé's records in Cloudflare" cases={RECORD_CASES} render={(c, what) => <RecordView c={c} what={what} />} />;
}

type Leg = [proto: "http" | "https", cert: "none" | "ok" | "skip" | "check"];
type Mode = { k: string; e: Leg; o: Leg; verdict: [Tone, string]; what?: [string, string][] };
const MODES: Mode[] = [
  { k: "Off", e: ["http", "none"], o: ["http", "none"], verdict: ["fault", "Nothing is encrypted anywhere"] },
  {
    k: "Flexible",
    e: ["https", "ok"],
    o: ["http", "none"],
    verdict: ["fault", "The padlock shows, but the origin leg is plain HTTP"],
    what: [
      ["normal", "Normal"],
      ["loop", "What if the origin redirects HTTP to HTTPS?"],
    ],
  },
  {
    k: "Full",
    e: ["https", "ok"],
    o: ["https", "skip"],
    verdict: ["warn", "Encrypted, but Cloudflare accepts any origin certificate"],
    what: [
      ["normal", "Normal"],
      ["fake", "What if someone intercepts the origin leg?"],
    ],
  },
  {
    k: "Full (strict)",
    e: ["https", "ok"],
    o: ["https", "check"],
    verdict: ["ok", "Encrypted end to end, and the origin is verified"],
    what: [
      ["normal", "Valid Google-managed certificate"],
      ["expired", "What if the origin certificate is invalid?"],
    ],
  },
  { k: "Strict (SSL-only origin pull)", e: ["https", "ok"], o: ["https", "check"], verdict: ["ok", "Like Full (strict), and the origin never gets HTTP"] },
];
const MODE_TAKE: Record<string, string | Record<string, string>> = {
  Off: "No TLS on either leg. Only for sites that should not exist.",
  Flexible: {
    normal:
      "Visitors see a padlock, because the edge leg is HTTPS. But Cloudflare talks to the origin over <b>plain HTTP</b>, so anything between Cloudflare and Google can read logins and payment data. It exists for origins that cannot do HTTPS at all.",
    loop: 'Kadé\'s load balancer redirects every <code>http://</code> request to <code>https://</code> (chapter 12). In Flexible mode Cloudflare always asks the origin over HTTP, gets the redirect, passes it to the browser, the browser asks again over HTTPS, Cloudflare asks the origin over HTTP again… <b>an endless redirect loop</b> ("too many redirects"). The fix is a stricter mode, not removing the redirect.',
  },
  Full: {
    normal:
      "Both legs are encrypted, but Cloudflare accepts <b>any</b> certificate from the origin: self-signed, expired, or for a different name. Useful for a few minutes while a real certificate is being issued.",
    fake: "Someone able to intercept traffic between Cloudflare and Google could present their own self-signed certificate. Full mode accepts it, so the attacker can read and change everything. Full (strict) would refuse.",
  },
  "Full (strict)": {
    normal:
      "Both legs encrypted, and Cloudflare checks that the origin's certificate is valid, unexpired and matches the hostname. Kadé's Google-managed certificate passes. <b>This is the mode to use.</b>",
    expired:
      "If the origin certificate is expired, self-signed, or for the wrong name, Cloudflare refuses to connect and visitors see <b>error 526</b>. That is the mode doing its job: the alternative would be silently trusting a bad certificate.",
  },
  "Strict (SSL-only origin pull)":
    "Same certificate check as Full (strict), and Cloudflare uses HTTPS to the origin even when the visitor used HTTP. With Always Use HTTPS on at the edge, the difference is small.",
};
type ModeCase = Case & { mode: Mode };
const MODE_CASES: ModeCase[] = MODES.map((m) => ({
  k: m.k,
  what: m.what,
  mode: m,
  take: MODE_TAKE[m.k],
  cfg: `Cloudflare → SSL/TLS → Overview → Encryption mode: ${m.k}\nEdge leg:   ${m.e[0].toUpperCase()}\nOrigin leg: ${m.o[0].toUpperCase()}${m.o[1] === "check" ? ", certificate validated" : m.o[1] === "skip" ? ", certificate NOT validated" : ""}`,
}));

function ModeView({ c, what }: { c: ModeCase; what: string }) {
  const m = c.mode;
  let verdict = m.verdict;
  if (what === "loop") verdict = ["fault", "Endless redirect loop: ERR_TOO_MANY_REDIRECTS"];
  if (what === "fake") verdict = ["fault", "An attacker's certificate is accepted: the origin leg can be read"];
  if (what === "expired") verdict = ["fault", "Error 526: Cloudflare refuses the invalid certificate"];
  const boxes: [number, string, string, string?][] = [
    [16, "Visitor", "browser"],
    [372, "Cloudflare edge", "Universal SSL cert"],
    [744, what === "fake" ? "?? impostor" : "GCP load balancer", what === "fake" ? "self-signed cert" : what === "expired" ? "expired cert" : "Google-managed cert", what === "fake" ? "red" : "purple"],
  ];
  const leg = (x1: number, x2: number, [proto, cert]: Leg, name: string) => {
    const secure = proto === "https";
    const hue = secure ? (cert === "skip" ? undefined : "green") : "red";
    return (
      <g key={name}>
        <line className={cn("w", hue === "green" ? "green" : hue === "red" ? "fault dash" : "")} x1={x1} y1={82} x2={x2 - 3} y2={82} strokeWidth={secure ? 3 : 2} markerEnd={`url(#dd-ah-${hue === "green" ? "green" : hue === "red" ? "fault" : "muted"})`} />
        <T x={(x1 + x2) / 2} y={70} k={secure ? "s mid" : "s mid c-red"} bold>{proto.toUpperCase()}</T>
        <T x={(x1 + x2) / 2} y={104} k="f mid" size={10.5}>{name}</T>
        <T x={(x1 + x2) / 2} y={150} k={secure ? "s mid" : "s mid c-red"} bold={cert === "skip"} size={11}>
          {secure ? (cert === "skip" ? "certificate NOT checked" : "certificate checked ✓") : "readable on the way"}
        </T>
      </g>
    );
  };
  return (
    <div className="space-y-3">
      <Drawing h={240} label={`Cloudflare SSL/TLS mode ${m.k}: the edge leg and the origin leg`}>
        {boxes.map(([x, t, s, c]) => (
          <g key={x}>
            <Box x={x} y={40} w={200} h={84} c={c} />
            <T x={x + 14} y={70} k="t" size={13}>{t}</T>
            <T x={x + 14} y={92} size={11}>{s}</T>
          </g>
        ))}
        {leg(216, 372, m.e, "edge leg")}
        {leg(572, 744, what === "expired" ? ["https", "check"] : m.o, "origin leg")}
        {what === "loop" && (
          <>
            <path className="w fault" d="M844 124 C 844 222, 470 222, 470 128" markerEnd="url(#dd-ah-fault)" />
            <T x={657} y={214} k="s mid c-red" size={11}>301 → https:// (from the origin)</T>
            <path className="w fault" d="M400 124 C 400 222, 116 222, 116 128" markerEnd="url(#dd-ah-fault)" />
            <T x={258} y={214} k="s mid c-red" size={11}>passed to the browser… repeat</T>
          </>
        )}
        {what === "expired" && <Mark cx={658} cy={82} ok={false} r={12} />}
      </Drawing>
      <p className="text-ink-muted text-[14px]">The SSL/TLS mode only changes the origin leg</p>
      <Result tone={verdict[0]}>
        <b>{verdict[1]}</b>
      </Result>
    </div>
  );
}

/** Cloudflare's SSL/TLS modes, leg by leg. */
export function TlsModes() {
  return <CaseExplorer label="Cloudflare SSL/TLS modes" cases={MODE_CASES} render={(c, what) => <ModeView c={c} what={what} />} />;
}

const LOCK_WHAT: [string, string][] = [
  ["all", "All three layers on"],
  ["noarmor", "No Cloudflare allow-list"],
  ["nohdr", "No secret header"],
  ["ingress", "Cloud Run ingress: all"],
];
type LockCase = Case & { path: "good" | "ip" | "cf" | "run" };
const LOCK_CASES: LockCase[] = [
  {
    k: "Shopper",
    t: "through Kadé's Cloudflare",
    what: LOCK_WHAT,
    path: "good",
    take: {
      all: "The normal path. Kadé's Cloudflare zone adds the secret header, the request comes from a Cloudflare address, so Cloud Armor allows it, and Cloud Run accepts it from the load balancer.",
      noarmor: "Still works: shoppers come from Cloudflare anyway. The missing layer only matters for the other paths.",
      nohdr: 'Still works for shoppers. But see the "Another Cloudflare account" tab.',
      ingress: 'Still works. But see the "Direct to run.app" tab.',
    },
  },
  {
    k: "Direct to the IP",
    t: "34.120.88.10",
    what: LOCK_WHAT,
    path: "ip",
    take: {
      all: "The request comes from the attacker's own address, not Cloudflare's, so no allow rule matches and the default rule returns <b>403</b>.",
      noarmor:
        "With no IP allow-list, the request still lacks the secret header, so the header check stops it. Each layer covers for another, but only if it is there.",
      nohdr: "The IP allow-list alone stops this path: the attacker is not a Cloudflare address.",
      ingress: "Cloud Run's ingress does not matter here: the request is stopped at the load balancer.",
    },
  },
  {
    k: "Another Cloudflare account",
    t: "pointed at Kadé's IP",
    what: LOCK_WHAT,
    path: "cf",
    take: {
      all: "The attacker adds their own domain to <b>their own</b> Cloudflare account and points it at <code>34.120.88.10</code>. The request really does come from a Cloudflare address, so the IP allow-list passes it. Only the <b>secret header</b> stops it: the attacker's zone does not add Kadé's value.",
      noarmor: "The header check still stops it.",
      nohdr:
        'This is the gap. The IP allow-list passes Cloudflare traffic from <b>any</b> Cloudflare customer, so the attacker reaches kade-api with Kadé\'s Cloudflare WAF and rate limits skipped. This is why "allow Cloudflare\'s IPs" alone is not an origin lock.',
      ingress: "Stopped at the load balancer by the header check.",
    },
  },
  {
    k: "Direct to run.app",
    t: "kade-api-xxxx.run.app",
    what: LOCK_WHAT,
    path: "run",
    take: {
      all: "Cloud Run's ingress setting refuses requests that do not come through a load balancer or the VPC: <b>404</b>. Cloud Armor never sees this path, which is why it needs its own layer (chapter 10).",
      noarmor: "Same: Cloud Run's ingress stops it.",
      nohdr: "Same: Cloud Run's ingress stops it.",
      ingress:
        "With ingress <code>all</code>, the <code>run.app</code> address goes straight to the app, past both Cloudflare and Cloud Armor. Kadé's whole front door is bypassed.",
    },
  },
];

function LockView({ c, what }: { c: LockCase; what: string }) {
  const armor = what !== "noarmor";
  const header = what !== "nohdr";
  const ingress = what !== "ingress";
  const who = { good: ["Shopper", "via Kadé's Cloudflare zone", ""], ip: ["Attacker", "own server, 198.18.5.7", "red"], cf: ["Attacker", "own Cloudflare account", "red"], run: ["Attacker", "knows the run.app URL", "red"] }[c.path];
  let reached = false;
  let stop: "a" | "h" | "r" | null = null;
  let words: string;
  if (c.path === "good") {
    reached = true;
    words = "Allowed: the shopper reaches kade-api";
  } else if (c.path === "ip") {
    if (armor) [stop, words] = ["a", "403 at Cloud Armor: not a Cloudflare address"];
    else if (header) [stop, words] = ["h", "403 at Cloud Armor: missing secret header"];
    else [reached, words] = [true, "Reached the app, skipping Cloudflare entirely"];
  } else if (c.path === "cf") {
    if (header) [stop, words] = ["h", "403 at Cloud Armor: wrong or missing secret header"];
    else [reached, words] = [true, "Reached the app through someone else's Cloudflare zone"];
  } else if (ingress) [stop, words] = ["r", "404 at Cloud Run: direct run.app access refused"];
  else [reached, words] = [true, "Reached the app, skipping Cloudflare and Cloud Armor"];
  const good = c.path === "good" ? reached : !reached;
  const hitY = stop === "h" ? 166 : 116;
  return (
    <div className="space-y-3">
      <Drawing h={330} label={`${who[0]} ${who[1]}: the three layers of the origin lock`}>
        <Box x={16} y={90} w={170} h={80} c={who[2]} />
        <T x={30} y={118} k="t" size={13}>{who[0]}</T>
        <T x={30} y={140} size={9.5}>{who[1]}</T>
        <Box x={420} y={40} w={262} h={180} c="purple" />
        <T x={434} y={64} k="t" size={13}>GCP load balancer</T>
        <T x={434} y={82} size={10.5}>Cloud Armor kade-edge-policy</T>
        <g className={armor ? undefined : "off"}>
          <Box x={434} y={96} w={234} h={40} c="orange" />
          <T x={446} y={113} size={10.5}>2 · source is a Cloudflare IP?</T>
          <T x={446} y={129} k="f" size={10}>{armor ? "allow-list on" : "switched off"}</T>
        </g>
        <g className={header ? undefined : "off"}>
          <Box x={434} y={146} w={234} h={40} c="orange" />
          <T x={446} y={163} size={10.5}>3 · header x-kade-edge correct?</T>
          <T x={446} y={179} k="f" size={10}>{header ? "check on" : "switched off"}</T>
        </g>
        <Box x={760} y={90} w={184} h={80} c="blue" />
        <T x={774} y={114} k="t" size={12.5}>Cloud Run kade-api</T>
        <g className={ingress ? undefined : "off"}>
          <T x={774} y={136} size={10.5}>1 · ingress: LB only</T>
          <T x={774} y={154} k="f" size={10}>{ingress ? "on" : "set to all"}</T>
        </g>
        {c.path === "run" ? (
          <>
            <path className="w fault" d={`M186 130 C 300 330, 660 330, ${stop ? 748 : 757} 162`} markerEnd={stop ? undefined : "url(#dd-ah-fault)"} />
            <T x={470} y={312} k="s mid" size={11}>skips the load balancer entirely</T>
            {stop && <Mark cx={752} cy={168} ok={false} />}
          </>
        ) : (
          <>
            {c.path === "good" || c.path === "cf" ? (
              <>
                <Box x={236} y={100} w={140} h={60} />
                <T x={248} y={126} k="t" size={11.5}>Cloudflare edge</T>
                <T x={248} y={146} size={10}>{c.path === "good" ? "adds x-kade-edge" : "no Kadé header"}</T>
                <Wire x1={186} y1={130} x2={233} y2={130} />
                <line className={cn("w", stop && "fault")} x1={376} y1={130} x2={stop ? 430 : 417} y2={stop ? hitY : 130} markerEnd={stop ? undefined : "url(#dd-ah-muted)"} />
              </>
            ) : (
              <line className="w fault" x1={186} y1={130} x2={stop ? 430 : 417} y2={stop ? hitY : 130} markerEnd={stop ? undefined : "url(#dd-ah-fault)"} />
            )}
            {stop ? (
              <Mark cx={432} cy={hitY} ok={false} />
            ) : (
              <Wire x1={682} y1={130} x2={757} y2={130} c={reached && c.path === "good" ? "green" : "red"} />
            )}
          </>
        )}
      </Drawing>
      <Result tone={good ? "ok" : "fault"}>
        <b>{words}</b>
      </Result>
    </div>
  );
}

/** The origin lock's three layers, against four ways in. */
export function OriginLock() {
  return <CaseExplorer label="Locking the origin to Cloudflare" cases={LOCK_CASES} render={(c, what) => <LockView c={c} what={what} />} />;
}

/** Two caches in a row, and the order to purge them. */
export function CfCache() {
  const boxes: [number, string, string, string?][] = [
    [16, "Shopper", "GET /images/rice.jpg"],
    [226, "Cloudflare cache", "at the edge, near the shopper"],
    [456, "Cloud CDN cache", "at Google's edge", "purple"],
    [686, "kade-static bucket", "Cloud Storage", "blue"],
  ];
  return (
    <WidgetFrame wide label="Cloudflare cache in front of Cloud CDN">
      <Drawing h={176} label="A request passes the Cloudflare cache, then Cloud CDN, then the bucket">
        {boxes.map(([x, t, s, c]) => (
          <g key={t}>
            <Box x={x} y={40} w={190} h={80} c={c} />
            <T x={x + 14} y={68} k="t" size={12.5}>{t}</T>
            <T x={x + 14} y={90} size={10.5}>{s}</T>
          </g>
        ))}
        <Wire x1={206} y1={80} x2={223} y2={80} />
        <Wire x1={416} y1={80} x2={453} y2={80} />
        <Wire x1={646} y1={80} x2={683} y2={80} />
        <T x={321} y={146} k="s mid" bold size={11}>HIT: answered here</T>
        <T x={321} y={164} k="f mid" size={10.5}>most requests</T>
        <T x={551} y={146} k="s mid" bold size={11}>HIT on a Cloudflare miss</T>
        <T x={551} y={164} k="f mid" size={10.5}>shields the bucket</T>
        <T x={781} y={146} k="s mid" size={11}>only when both miss</T>
      </Drawing>
      <div className="mt-4">
        <Result tone="warn">
          <b>On a release: purge Cloud CDN first, then Cloudflare.</b> The other way, Cloudflare refills from Cloud CDN&apos;s old copy.
        </Result>
      </div>
      <WidgetNote>The API (api.kade.lk) skips both: a Cloudflare Cache Rule bypasses cache, and the API sends Cache-Control: no-store.</WidgetNote>
    </WidgetFrame>
  );
}

const CF_ERRORS: Record<string, [string, string, string]> = {
  "520": [
    "Unknown error from the origin",
    "The origin answered with something Cloudflare could not understand: an empty or malformed response, or a reset connection.",
    "The app's logs and the load balancer logs for the same CF-Ray; often a crash mid-response, or response headers that are too large.",
  ],
  "521": [
    "Web server is down",
    "The origin refused the connection.",
    "Usually something actively rejecting Cloudflare: a firewall, or the origin not listening on 443. For Kadé, a load balancer with no HTTPS forwarding rule on 34.120.88.10.",
  ],
  "522": [
    "Connection timed out",
    "Cloudflare could not complete a TCP connection to the origin.",
    "Wrong IP in the DNS record, or packets dropped silently. Check the A record still says 34.120.88.10.",
  ],
  "524": [
    "A timeout occurred",
    "The connection worked, but the origin took longer than about 100 seconds to answer.",
    "A slow request: move it to a background job (kade-worker), or make it faster. Raising GCP timeouts does not help; Cloudflare gives up first.",
  ],
  "525": [
    "SSL handshake failed",
    "Cloudflare could not finish TLS with the origin.",
    "The origin's TLS settings: no certificate for this hostname on the target proxy, or an SSL policy and Cloudflare with no TLS version in common.",
  ],
  "526": [
    "Invalid SSL certificate",
    "Full (strict) mode found a certificate that is expired, self-signed, or for the wrong hostname.",
    "Certificate Manager: is the certificate ACTIVE, and does it cover this hostname (chapter 12, command 6)? Is _acme-challenge still DNS only?",
  ],
  "Too many redirects": [
    "Redirect loop",
    "The browser keeps being sent to the same address.",
    "Almost always Flexible mode plus an origin HTTP→HTTPS redirect (section 04). Switch to Full (strict).",
  ],
  "403 from GCP": [
    "Forbidden, with no Cloudflare error page",
    "Cloud Armor refused the request. Cloudflare passed the 403 on.",
    "Load balancer logs: enforcedSecurityPolicy names the rule. Common cause: a new Cloudflare IP range missing from the allow-list, or a Transform Rule that stopped sending x-kade-edge.",
  ],
};

/** Cloudflare's 52x errors: what each means and where to look. */
export function CfErrors() {
  const [code, setCode] = useState("526");
  const [name, means, where] = CF_ERRORS[code];
  return (
    <WidgetFrame label="Cloudflare error codes">
      <Choices label="Error" value={code} onChange={setCode} options={Object.keys(CF_ERRORS).map((k) => ({ value: k, label: k }))} />
      <div aria-live="polite" className="mt-5 space-y-4">
        <Result tone="fault">
          <b>
            {code} · {name}.
          </b>{" "}
          {means}
        </Result>
        <KeyValues items={[["Where to look", where, true]]} />
      </div>
    </WidgetFrame>
  );
}
