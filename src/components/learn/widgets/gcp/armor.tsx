"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { arrowHead } from "../../diagram-defs";
import { Choices, Rich, WidgetNote } from "../ui";
import { WidgetFrame } from "../widget-frame";
import { Config, Result, type Tone } from "./case-explorer";
import { Box, Drawing, T } from "./draw";

/* Chapter 12.3 · Cloud Armor. */

// ── A request down the rule list ───────────────────────────────────────────

type Rule = { p: string; what: string; detail: string; action: string; allow?: boolean; preview?: boolean };

/** Kadé's policy at the end of the chapter. */
const RULES: Rule[] = [
  { p: "100", what: "rate limit /api/login", detail: "60 a minute per IP, then banned 10 min", action: "429" },
  { p: "200", what: "/admin from outside the office", detail: "path starts with /admin, not 198.51.100.20", action: "deny 404" },
  { p: "300", what: "throttle /api/search", detail: "120 a minute per IP", action: "429" },
  { p: "1000", what: "WAF · sqli-v33-stable", detail: "SQL injection, sensitivity 1", action: "deny 403" },
  { p: "1001", what: "WAF · xss-v33-stable", detail: "cross-site scripting, sensitivity 1", action: "deny 403" },
  { p: "1002", what: "WAF · rce-v33-stable", detail: "remote code execution, sensitivity 1", action: "deny 403", preview: true },
  { p: "2147483647", what: "default rule", detail: "everything else", action: "allow", allow: true },
];
const LAST = RULES.length - 1;

type Req = { k: string; line: string; from: string; matches: number[]; take: string };

const REQUESTS: Req[] = [
  {
    k: "A normal request",
    line: "GET /api/products",
    from: "203.0.113.99",
    matches: [],
    take: "No rule above the default matches, so the <b>default rule</b> decides. Kadé's default is allow.",
  },
  {
    k: "61st login in a minute",
    line: "POST /api/login",
    from: "203.0.113.99 · 61st try this minute",
    matches: [0],
    take: "The first rule checked is the one that matches. Cloud Armor answers <b>429</b> itself, and this address is refused for the next 10 minutes. kade-api never sees the request.",
  },
  {
    k: "Admin page, from outside",
    line: "GET /admin/orders",
    from: "203.0.113.99",
    matches: [1],
    take: "The path starts with <code>/admin</code> and the address is not the office, so rule 200 denies it. It answers <b>404</b>, not 403, so a scanner learns nothing about what exists.",
  },
  {
    k: "Admin page, from the office",
    line: "GET /admin/orders",
    from: "198.51.100.20 · the office",
    matches: [],
    take: "Rule 200 does not match, because its expression excludes the office address. The request falls through every other rule to the default.",
  },
  {
    k: "SQL injection",
    line: "GET /api/search?q=' OR '1'='1",
    from: "203.0.113.99",
    matches: [3],
    take: "It is under the search throttle, so rule 300 lets it pass. The SQL injection rule set recognises the query string and denies it with <b>403</b>.",
  },
  {
    k: "A script in a review",
    line: "POST /api/reviews · body: <script>…",
    from: "203.0.113.99",
    matches: [4],
    take: "The WAF rules read the body as well as the URL (the first 8 KB). The cross-site scripting rule set matches and denies it.",
  },
  {
    k: "A shell command",
    line: "GET /api/products?sort=;cat /etc/passwd",
    from: "203.0.113.99",
    matches: [5],
    take: "",
  },
];

function walk(req: Req, enforced: boolean) {
  let previewed = -1;
  for (const i of req.matches) {
    if (RULES[i].preview && !enforced) previewed = i;
    else return { hit: i, previewed };
  }
  return { hit: LAST, previewed };
}

const ROW = 52;
const TOP = 86;

function RuleList({ req, enforced }: { req: Req; enforced: boolean }) {
  const { hit, previewed } = walk(req, enforced);
  const allowed = RULES[hit].allow;
  const stopY = TOP + hit * ROW + 22;
  return (
    <Drawing h={TOP + RULES.length * ROW + 6} label={`${req.line} from ${req.from}: decided by rule ${RULES[hit].p}, ${RULES[hit].action}`}>
      <Box x={16} y={8} w={928} h={52} />
      <T x={32} y={30} k="t">{req.line}</T>
      <T x={32} y={50}>{`from ${req.from}`}</T>
      {RULES.map((rule, i) => {
        const y = TOP + i * ROW;
        const inPreview = rule.preview && !enforced;
        const state = i === hit ? "hit" : i === previewed ? "preview" : i < hit ? "pass" : "off";
        return (
          <g key={rule.p} className={state === "off" ? "off" : undefined}>
            <Box x={64} y={y} w={880} h={44} c={state === "hit" ? (allowed ? "green" : "red") : state === "preview" ? "yellow" : undefined} />
            <T x={78} y={y + 27} k="t" size={12.5}>{rule.p}</T>
            <T x={190} y={y + 19} bold>{rule.what}</T>
            <T x={190} y={y + 36} k="f" size={11.5}>{rule.detail}</T>
            <T x={600} y={y + 27} k="f" size={11.5}>{`${rule.action}${inPreview ? " · preview" : ""}`}</T>
            <T x={928} y={y + 27} k={state === "hit" && !allowed ? "s c-red" : state === "hit" || state === "preview" ? "s" : "f"} end bold>
              {state === "hit"
                ? allowed
                  ? "ALLOWS"
                  : `STOPS HERE · ${rule.action}`
                : state === "preview"
                  ? "would deny · logged ↓"
                  : state === "pass"
                    ? "no match ↓"
                    : "not reached"}
            </T>
          </g>
        );
      })}
      {/* One trunk down the list, turning in at the rule that decides. */}
      <path className={cn("w", allowed ? "green" : "fault")} d={`M36 60 V${stopY} H61`} strokeWidth={3} markerEnd={arrowHead(allowed ? "green" : "fault")} />
      {RULES.map((_, i) => i < hit && <circle key={i} className="ok" cx={36} cy={TOP + i * ROW + 22} r={4.5} />)}
    </Drawing>
  );
}

function logEntry(req: Req, enforced: boolean) {
  const { hit, previewed } = walk(req, enforced);
  const rule = RULES[hit];
  const lines = [
    `httpRequest.requestUrl: ${req.line.split(" ")[1]}`,
    `httpRequest.status: ${rule.allow ? "200" : rule.action.replace("deny ", "")}`,
    ...(rule.allow ? [] : ['jsonPayload.statusDetails: "denied_by_security_policy"']),
    "jsonPayload.enforcedSecurityPolicy:",
    '  name: "kade-edge-policy"',
    `  priority: ${rule.p}`,
    `  configuredAction: "${rule.allow ? "ALLOW" : rule.action.startsWith("deny") ? "DENY" : "RATE_BASED_BAN"}"`,
    `  outcome: "${rule.allow ? "ACCEPT" : "DENY"}"`,
  ];
  if (previewed >= 0)
    lines.push(
      "jsonPayload.previewSecurityPolicy:",
      `  priority: ${RULES[previewed].p}`,
      '  configuredAction: "DENY"',
      '  outcome: "DENY"',
      '  preconfiguredExprIds: ["owasp-crs-v030301-id932100-rce"]',
    );
  return lines.join("\n");
}

/** Send a request down Kadé's rule list and see which rule decides. */
export function ArmorWalk() {
  const [index, setIndex] = useState(0);
  const [enforced, setEnforced] = useState(false);
  const req = REQUESTS[index];
  const { hit, previewed } = walk(req, enforced);
  const rule = RULES[hit];
  const tone: Tone = rule.allow ? (previewed >= 0 ? "warn" : "ok") : "fault";
  const words = rule.allow
    ? previewed >= 0
      ? `Reached kade-api. Rule ${RULES[previewed].p} would have denied it, but it is only in preview.`
      : `Reached kade-api: allowed by rule ${rule.p}.`
    : `Stopped by rule ${rule.p}: ${rule.action}. kade-api never saw it.`;
  const take =
    req.take ||
    (enforced
      ? "Rule 1002 is enforced now, so the same request is denied with <b>403</b>. This is the step you take only after the preview logs show no real shopper being caught."
      : "Rule 1002 matches, but it is in <b>preview</b>: Cloud Armor writes down what it would have done and keeps going down the list. The request reaches the default rule and is allowed. Switch the rule to enforced to see the difference.");
  return (
    <WidgetFrame wide label="A request through kade-edge-policy">
      <Choices label="Request" value={index} onChange={setIndex} options={REQUESTS.map((r, i) => ({ value: i, label: r.k }))} />
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-ink-muted text-[14px]">Rule 1002 is</span>
        <Choices
          label="Rule 1002"
          value={enforced ? "on" : "preview"}
          onChange={(v) => setEnforced(v === "on")}
          options={[
            { value: "preview", label: "in preview" },
            { value: "on", label: "enforced" },
          ]}
        />
      </div>
      <div className="mt-4 space-y-3" aria-live="polite">
        <RuleList req={req} enforced={enforced} />
        <Result tone={tone}>
          <b>{words}</b>
        </Result>
        <p className="text-ink-body max-w-[72ch] text-[16px] leading-[1.6] text-pretty">
          <Rich text={take} />
        </p>
      </div>
      <Config text={logEntry(req, enforced)} summary="Show the log entry" />
    </WidgetFrame>
  );
}

// ── Throttle against ban ───────────────────────────────────────────────────

const SLOTS = 36; // six minutes, ten seconds each
const LIMIT = 60; // requests per minute
const BAN_SLOTS = 12; // two minutes of ten-second slots

/** How many requests of each ten-second slot get through. */
function simulate(perMinute: number, ban: boolean) {
  const per = perMinute / 6;
  const out: { ok: number; banned: boolean }[] = [];
  let used = 0;
  let windowStart = 0;
  let bannedUntil = -1;
  for (let i = 0; i < SLOTS; i++) {
    if (i < bannedUntil) {
      out.push({ ok: 0, banned: true });
      continue;
    }
    if (i === bannedUntil || i - windowStart >= 6) {
      windowStart = i;
      used = 0;
    }
    const ok = Math.max(0, Math.min(per, LIMIT - used));
    used += per;
    if (ban && used > LIMIT) {
      bannedUntil = i + 1 + BAN_SLOTS;
      out.push({ ok, banned: false });
      continue;
    }
    out.push({ ok, banned: false });
  }
  return { per, out };
}

/** One client, one rate limit rule: what gets through over six minutes. */
export function ArmorRate() {
  const [rate, setRate] = useState(90);
  const [mode, setMode] = useState<"throttle" | "ban">("throttle");
  const { per, out } = simulate(rate, mode === "ban");
  const allowed = out.reduce((a, s) => a + s.ok, 0);
  const refused = per * SLOTS - allowed;
  const base = 140;
  const unit = 3; // drawing units per request
  const x = (i: number) => 64 + i * 24;
  const take =
    rate <= LIMIT
      ? "Under the threshold, the rule does nothing. A rate limit only ever touches clients that go over."
      : mode === "throttle"
        ? "<b>Throttle</b> keeps letting 60 a minute through and refuses the rest. The client is slowed down, never locked out. Good for a busy but honest client, such as search."
        : "<b>Rate-based ban</b>: once the client crosses the line, everything it sends is refused for the ban time, even requests that would have been under the limit. Good against password guessing on login.";
  return (
    <WidgetFrame wide label="Throttle and rate-based ban">
      <div className="flex flex-wrap gap-x-10 gap-y-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-ink-muted text-[14px]">One client sends</span>
          <Choices label="Requests per minute" value={rate} onChange={setRate} options={[30, 90, 180].map((r) => ({ value: r, label: `${r} a minute` }))} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-ink-muted text-[14px]">The rule is</span>
          <Choices
            label="Action"
            value={mode}
            onChange={setMode}
            options={[
              { value: "throttle", label: "throttle" },
              { value: "ban", label: "rate-based ban, 2 min" },
            ]}
          />
        </div>
      </div>
      <div className="mt-4 space-y-3" aria-live="polite">
        <Drawing h={198} label={`A client sending ${rate} requests a minute against a limit of 60 a minute with ${mode}: ${allowed} allowed and ${refused} refused over six minutes`}>
          <T x={16} y={24}>limit: 60 a minute per IP · each bar is 10 seconds</T>
          {out.map((slot, i) => {
            const okH = slot.ok * unit;
            const noH = (per - slot.ok) * unit;
            return (
              <g key={i}>
                {okH > 0 && <rect className="n green" x={x(i)} y={base - okH} width={20} height={okH} rx="1" />}
                {noH > 0 && <rect className="n fault" x={x(i)} y={base - okH - noH} width={20} height={noH} rx="1" />}
              </g>
            );
          })}
          <line className="w" x1={56} y1={base} x2={936} y2={base} />
          {Array.from({ length: 7 }, (_, m) => (
            <g key={m}>
              <line className="w" x1={62 + m * 144} y1={base} x2={62 + m * 144} y2={base + 6} />
              <T x={62 + m * 144} y={base + 22} k="f mid" size={11.5}>{m === 0 ? "0" : `${m} min`}</T>
            </g>
          ))}
          {/* A ban, as a bracket under the slots it covers. */}
          {out.map((slot, i) =>
            slot.banned && !out[i - 1]?.banned ? (
              <g key={`b${i}`}>
                <path className="w fault" d={`M${x(i)} ${base + 30} V${base + 38} H${x(Math.min(i + BAN_SLOTS, SLOTS) - 1) + 20} V${base + 30}`} />
                <T x={(x(i) + x(Math.min(i + BAN_SLOTS, SLOTS) - 1) + 20) / 2} y={base + 48} k="s c-red mid" size={11.5}>banned</T>
              </g>
            ) : null,
          )}
        </Drawing>
        <Result tone={refused > 0 ? "fault" : "ok"}>
          <b>
            Over six minutes: {Math.round(allowed)} allowed, {Math.round(refused)} refused with 429.
          </b>
        </Result>
        <p className="text-ink-body max-w-[72ch] text-[16px] leading-[1.6] text-pretty">
          <Rich text={take} />
        </p>
      </div>
      <WidgetNote>Green is let through, red is refused. Real counting is approximate: Cloud Armor counts per Google region, so treat a threshold as a rough line, not an exact one.</WidgetNote>
    </WidgetFrame>
  );
}
