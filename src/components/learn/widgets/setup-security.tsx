"use client";

import { useState } from "react";
import { CommandBlock } from "@/components/architecture/command-block";
import { IconCheck, IconX } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Hop, Hops } from "../blocks";
import data from "./data/fundamentals.json";
import { Field, FieldError } from "./field";
import { Choices, KeyValues, Outcome, Select, WidgetNote } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Chapters 27 to 29: how a device gets an address and keeps it, how clocks
 * agree, what the browser lets a page read across origins, and SSH tunnels.
 */

interface DoraMessage {
  n: string;
  from: string;
  eth: string;
  ip: string;
  udp: string;
  f: [string, string][];
  o: [string, string][];
  x: string;
}

const DORA = data.DORA as unknown as DoraMessage[];

function PairTable({ head, rows }: { head: string; rows: [string, string][] }) {
  return (
    <table className="mt-4 w-full min-w-[560px] border-collapse text-left">
      <thead>
        <tr className="border-ink border-b">
          <th className="text-ink w-[220px] py-2 pr-4 text-[14px] font-bold">{head}</th>
          <th className="text-ink py-2 text-[14px] font-bold">Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-rule border-b align-top">
            <td className="text-ink py-2 pr-4 font-mono text-[13.5px]">{k}</td>
            <td className="text-ink py-2 font-mono text-[13.5px]">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** The four DHCP messages, opened field by field. */
export function DoraInspect({ wide }: { wide?: boolean }) {
  const [at, setAt] = useState(0);
  const d = DORA[at];
  return (
    <WidgetFrame wide={wide} label="DHCP messages, field by field">
      <Choices label="Message" value={at} onChange={setAt} options={DORA.map((m, i) => ({ value: i, label: m.n }))} />
      <div aria-live="polite">
        <dl className="border-rule mt-5 grid grid-cols-1 border-t sm:grid-cols-2 sm:gap-x-8">
          {[
            ["frame (MAC)", d.eth],
            ["IP", d.ip],
            ["UDP ports", d.udp],
            ["sent by", d.from],
          ].map(([label, value]) => (
            <div key={label} className="border-rule border-b py-2.5">
              <dt className="text-ink-muted text-[14px]">{label}</dt>
              <dd className="text-ink mt-0.5 font-mono text-[14px]">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="overflow-x-auto">
          <PairTable head="DHCP field" rows={d.f} />
          <PairTable head="Option" rows={d.o} />
        </div>
        <p className="text-ink-body mt-3 text-[15.5px] leading-[1.55] text-pretty">{d.x}</p>
      </div>
    </WidgetFrame>
  );
}

type Phase = "bound" | "renew" | "rebind" | "none";
type LeaseEvent = { t: number; k: "ok" | "fail" | "bad"; m: string };

/** The office PC's 24 h lease over 30 hours: renew at T1, rebind at T2, expiry. */
function leaseRun(down: number, back: number) {
  const up = (t: number) => !(t >= down && t < back);
  const ev: LeaseEvent[] = [{ t: 0, k: "ok", m: "DORA: lease 172.16.1.61 for 24 h" }];
  const ph: { a: number; b: number; k: Phase }[] = [];
  let ls = 0;
  const END = 30;
  while (ls < END) {
    const T1 = ls + 12;
    const T2 = ls + 21;
    const EX = ls + 24;
    let done = false;
    const tries: [number, "renew" | "rebind"][] = [
      [T1, "renew"],
      [ls + 16.5, "renew"],
      [ls + 18.75, "renew"],
      [T2, "rebind"],
      [ls + 22.5, "rebind"],
      [ls + 23.25, "rebind"],
    ];
    for (const [tt, kind] of tries) {
      if (tt > END) break;
      if (up(tt)) {
        ph.push({ a: ls, b: Math.min(T1, tt), k: "bound" });
        if (tt > T1) ph.push({ a: T1, b: Math.min(tt, T2), k: "renew" });
        if (tt > T2) ph.push({ a: T2, b: tt, k: "rebind" });
        ev.push({
          t: tt,
          k: "ok",
          m:
            kind === "renew"
              ? tt === T1
                ? "Renew at T1 (unicast to its server) → Ack: lease reset to 24 h"
                : "Renew retry (unicast) → Ack: lease reset"
              : "Rebind (broadcast to any server) → Ack: lease reset",
        });
        ls = tt;
        done = true;
        break;
      }
      ev.push({
        t: tt,
        k: "fail",
        m:
          kind === "renew"
            ? tt === T1
              ? "Renew at T1 (unicast): no answer"
              : "Renew retry: no answer"
            : tt === T2
              ? "Rebind at T2 (broadcast): no answer"
              : "Rebind retry: no answer",
      });
    }
    if (done) continue;
    if (EX > END) {
      ph.push({ a: ls, b: T1, k: "bound" }, { a: T1, b: Math.min(T2, END), k: "renew" });
      if (T2 < END) ph.push({ a: T2, b: END, k: "rebind" });
      break;
    }
    ph.push({ a: ls, b: T1, k: "bound" }, { a: T1, b: T2, k: "renew" }, { a: T2, b: EX, k: "rebind" });
    ev.push({ t: EX, k: "bad", m: "Lease expired: address removed · self-assigns 169.254.x.x · keeps sending Discover" });
    if (back < END) {
      ph.push({ a: EX, b: back, k: "none" });
      ev.push({ t: back, k: "ok", m: "Server back: Discover → Offer → Request → Ack, new 24 h lease" });
      ls = back;
    } else {
      ph.push({ a: EX, b: END, k: "none" });
      break;
    }
  }
  return { ph, ev };
}

const SCENARIOS: [string, number, number][] = [
  ["DHCP server stays up", 99, 99],
  ["Server down at hour 10, back at hour 17", 10, 17],
  ["Server down at hour 10, back at hour 22", 10, 22],
  ["Server down at hour 10, back at hour 27", 10, 27],
  ["Server down at hour 10, never back", 10, 99],
];

const PHASE: Record<Phase, { label: string; fill: string }> = {
  bound: { label: "bound", fill: "var(--dd-green-soft)" },
  renew: { label: "renewing", fill: "var(--dd-amber-soft)" },
  rebind: { label: "rebinding", fill: "color-mix(in oklab, var(--dd-amber) 32%, var(--dd-ground))" },
  none: { label: "no lease: 169.254.x.x", fill: "var(--dd-fault-soft)" },
};

/** Take the DHCP server away and watch the lease hold on, then run out. */
export function LeaseSim({ wide }: { wide?: boolean }) {
  const [sc, setSc] = useState("0");
  const [, down, back] = SCENARIOS[Number(sc)];
  const r = leaseRun(down, back);
  const X = (t: number) => 60 + (t / 30) * 820;
  return (
    <WidgetFrame wide={wide} label="A DHCP lease over 30 hours">
      <Select label="Situation" value={sc} onChange={setSc} options={SCENARIOS.map(([n], i) => ({ value: String(i), label: n }))} />
      <div className="dd-fig mt-4" aria-live="polite">
        <svg viewBox="0 0 920 130" role="img" aria-label="Lease timeline over 30 hours">
          {down < 30 && (
            <g>
              <rect x={X(down)} y="22" width={X(Math.min(back, 30)) - X(down)} height="16" rx="2" style={{ fill: "var(--dd-fault-soft)", stroke: "var(--dd-fault)" }} />
              <text className="s" x={X(down) + 6} y="34">DHCP server down</text>
            </g>
          )}
          {r.ph
            .filter((p) => p.b > p.a)
            .map((p, i) => (
              <rect key={i} x={X(p.a)} y="48" width={X(p.b) - X(p.a)} height="30" style={{ fill: PHASE[p.k].fill, stroke: "var(--dd-ground)" }} />
            ))}
          {r.ev.map((e, i) => (
            <g key={i}>
              <line x1={X(e.t)} y1="44" x2={X(e.t)} y2="86" style={{ stroke: e.k === "ok" ? "var(--dd-ink)" : "var(--dd-fault)", strokeWidth: 2 }} />
              <text className="mid" x={X(e.t)} y="100" style={{ fill: e.k === "ok" ? "var(--dd-ink)" : "var(--dd-fault)", fontSize: 13 }}>
                {e.k === "ok" ? "✓" : "✕"}
              </text>
            </g>
          ))}
          {Array.from({ length: 11 }, (_, k) => k * 3).map((t) => (
            <text key={t} className="s mid" x={X(t)} y="120">{t} h</text>
          ))}
        </svg>
      </div>
      <ul className="text-ink-muted mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px]">
        {(Object.keys(PHASE) as Phase[]).map((k) => (
          <li key={k} className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="border-rule inline-block h-3 w-4 border" style={{ background: PHASE[k].fill }} />
            {PHASE[k].label}
          </li>
        ))}
      </ul>
      <ol className="mt-4 space-y-1">
        {r.ev.map((e, i) => (
          <li key={i} className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-3 text-[14.5px] leading-[1.45]">
            <span className="text-ink-muted font-mono text-[13px]">{+e.t.toFixed(2)} h</span>
            <span className={e.k === "ok" ? "text-ink" : "text-fault"}>{e.m}</span>
          </li>
        ))}
      </ol>
      <WidgetNote>
        The office PC, with a 24 h lease: T1 at 12 h, T2 at 21 h. Retries happen at half the remaining time each (a common
        pattern). Its address keeps working through every failed renewal, until the lease actually expires.
      </WidgetNote>
    </WidgetFrame>
  );
}

/** NTP's four timestamps: how far apart the clocks are, and how long the trip took. */
export function NtpCalc({ wide }: { wide?: boolean }) {
  const [t, setT] = useState({ t1: "0", t2: "520", t3: "521", t4: "42" });
  const v = [t.t1, t.t2, t.t3, t.t4].map(parseFloat);
  const ok = !v.some(Number.isNaN);
  const [a, b, c, d] = v;
  const delay = d - a - (c - b);
  const off = (b - a + (c - d)) / 2;
  return (
    <WidgetFrame wide={wide} label="NTP offset and delay">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        {(["t1", "t2", "t3", "t4"] as const).map((k) => (
          <Field
            key={k}
            label={`${k} (ms)`}
            value={t[k]}
            onChange={(x) => setT((p) => ({ ...p, [k]: x }))}
            short
            inputMode="numeric"
            invalid={!ok}
            describedBy="ntp-error"
          />
        ))}
      </div>
      <div className="mt-6" aria-live="polite">
        {!ok ? (
          <FieldError id="ntp-error">Enter four numbers.</FieldError>
        ) : (
          <>
            <KeyValues
              items={[
                ["Round-trip delay", <>({d} − {a}) − ({c} − {b}) = <b key="d">{delay} ms</b></>],
                ["Clock offset", <>(({b} − {a}) + ({c} − {d})) ÷ 2 = <b key="o">{off} ms</b></>],
              ]}
            />
            <p className="text-ink-body mt-3 text-[15.5px] leading-[1.55] text-pretty">
              {off > 0 ? (
                <>The client’s clock is <b className="text-ink">{off} ms behind</b> the server’s. It will speed up slightly until it catches up.</>
              ) : off < 0 ? (
                <>The client’s clock is <b className="text-ink">{-off} ms ahead</b>. It will run slightly slow until it matches.</>
              ) : (
                "The clocks already agree."
              )}{" "}
              The formula assumes the trip out and back take equal time; any difference between them becomes error, which
              is why NTP prefers nearby servers with short, steady delays.
            </p>
          </>
        )}
      </div>
    </WidgetFrame>
  );
}

const ORIGINS = ["https://kade.lk", "https://admin.kade.lk", "http://localhost:3000", "https://evil.example", "https://api.kade.lk"];
const ALLOW = ["https://kade.lk", "https://admin.kade.lk"];
const ALLOW_METHODS = ["GET", "POST", "PATCH", "DELETE"];
const ALLOW_HEADERS = ["authorization", "content-type"];

type CorsStep = ["ok" | "bad" | "info" | "warn", React.ReactNode];

/** Will this cross-origin request work? The preflight, the real request, and what the page may read. */
export function CorsSim({ wide }: { wide?: boolean }) {
  const [origin, setOrigin] = useState(ORIGINS[0]);
  const [method, setMethod] = useState("GET");
  const [ct, setCt] = useState("");
  const [auth, setAuth] = useState(false);
  const [reqId, setReqId] = useState(false);
  const [creds, setCreds] = useState(false);

  const steps: CorsStep[] = [];
  let ok = true;
  if (origin === "https://api.kade.lk") {
    steps.push(["ok", "Same origin as api.kade.lk: the same-origin policy does not apply. No CORS needed."]);
  } else {
    const hdrs: string[] = [];
    if (auth) hdrs.push("authorization");
    if (reqId) hdrs.push("x-request-id");
    if (ct === "application/json") hdrs.push("content-type");
    const simpleMethod = ["GET", "HEAD", "POST"].includes(method);
    const simple = simpleMethod && !auth && !reqId && ct !== "application/json";
    const allowedOrigin = ALLOW.includes(origin);
    let sentReal = true;
    steps.push(["info", <>Cross-origin ({origin} → https://api.kade.lk). The browser adds <code>Origin: {origin}</code>.</>]);
    if (simple) steps.push(["info", <>This is a <b className="text-ink">simple request</b>: no preflight. The request goes straight to kade-api.</>]);
    else {
      const why = [!simpleMethod ? `method ${method}` : "", hdrs.length ? `headers ${hdrs.join(", ")}` : ""].filter(Boolean).join(", ");
      steps.push(["info", <>Not simple ({why}). Preflight: <code>OPTIONS</code> with Request-Method: {method}{hdrs.length ? `, Request-Headers: ${hdrs.join(", ")}` : ""}.</>]);
      const badHeaders = hdrs.filter((h) => !ALLOW_HEADERS.includes(h));
      if (!allowedOrigin) {
        steps.push(["bad", <>kade-api’s preflight answer has no Access-Control-Allow-Origin for {origin}. <b>Blocked before the real request is sent.</b></>]);
        ok = sentReal = false;
      } else if (!ALLOW_METHODS.includes(method)) {
        steps.push(["bad", <>{method} is not in Access-Control-Allow-Methods ({ALLOW_METHODS.join(", ")}). <b>Blocked; the real request is never sent.</b></>]);
        ok = sentReal = false;
      } else if (badHeaders.length) {
        steps.push(["bad", <><code>{badHeaders.join(", ")}</code> is not in Access-Control-Allow-Headers. <b>Blocked; the real request is never sent.</b></>]);
        ok = sentReal = false;
      } else steps.push(["ok", "Preflight approved (204, cached for 600 s). Now the real request is sent."]);
    }
    if (sentReal) {
      if (!allowedOrigin) {
        steps.push(["bad", <>kade-api receives and <b>runs</b> the request, but its response has no Allow-Origin for {origin}. The browser hides the response from the page.</>]);
        ok = false;
        if (method === "POST")
          steps.push(["warn", "Note: the POST was still processed on the server. This is why CORS is no defence against CSRF (section 4)."]);
      } else if (creds)
        steps.push(["ok", <>Response has <code>Access-Control-Allow-Origin: {origin}</code> (exact, not *) and <code>Access-Control-Allow-Credentials: true</code>. Cookies were sent and the page may read the reply.</>]);
      else
        steps.push(["ok", <>Response has <code>Access-Control-Allow-Origin: {origin}</code>. The page may read the reply. (No cookies were sent: credentials were not requested.)</>]);
    }
  }

  const check = (label: string, value: boolean, set: (v: boolean) => void) => (
    <label className="text-ink-body flex cursor-pointer items-center gap-2.5 text-[15px]">
      <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} className="accent-ink size-4" />
      {label}
    </label>
  );

  return (
    <WidgetFrame wide={wide} label="CORS simulator">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Select label="Page origin" value={origin} onChange={setOrigin} options={ORIGINS.map((o) => ({ value: o, label: o }))} />
        <Select label="Method" value={method} onChange={setMethod} options={["GET", "POST", "PATCH", "DELETE", "PUT"].map((m) => ({ value: m, label: m }))} />
        <Select
          label="Body type"
          value={ct}
          onChange={setCt}
          options={[
            { value: "", label: "no body" },
            { value: "application/json", label: "application/json" },
            { value: "application/x-www-form-urlencoded", label: "form (urlencoded)" },
            { value: "text/plain", label: "text/plain" },
          ]}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {check("Authorization header", auth, setAuth)}
        {check("X-Request-Id header", reqId, setReqId)}
        {check("credentials: 'include' (cookies)", creds, setCreds)}
      </div>
      <div className="mt-5" aria-live="polite">
        <ol className="space-y-2">
          {steps.map(([kind, text], i) => (
            <li key={i} className="grid grid-cols-[22px_minmax(0,1fr)] gap-x-2 text-[15px] leading-[1.5] [&_code]:font-mono [&_code]:text-[0.9em]">
              <span aria-hidden="true" className={cn("mt-[3px] font-mono text-[13px] font-bold", kind === "bad" ? "text-fault" : "text-ink")}>
                {kind === "ok" ? <IconCheck size={11} /> : kind === "bad" ? <IconX size={10} /> : kind === "warn" ? "!" : `${i + 1}`}
              </span>
              <span className={kind === "bad" ? "text-fault" : "text-ink-body"}>{text}</span>
            </li>
          ))}
        </ol>
        <p className={cn("mt-4 text-[16.5px] font-semibold", ok ? "text-ink" : "text-fault")}>
          {ok ? "The page gets the response." : "The page gets a CORS error in the console."}
        </p>
      </div>
    </WidgetFrame>
  );
}

function urlParts(u: string) {
  const x = new URL(u);
  const port = x.port || (x.protocol === "https:" ? "443" : x.protocol === "http:" ? "80" : "");
  return { s: x.protocol.replace(":", ""), h: x.hostname, p: port, site: x.hostname.split(".").slice(-2).join(".") };
}

/** Same origin, same site, or neither: scheme, host and port compared. */
export function OriginCmp({ wide }: { wide?: boolean }) {
  const [a, setA] = useState("https://kade.lk/orders");
  const [b, setB] = useState("https://api.kade.lk/orders/1042");
  let A: ReturnType<typeof urlParts> | null = null;
  let B: ReturnType<typeof urlParts> | null = null;
  try {
    A = urlParts(a.trim());
    B = urlParts(b.trim());
  } catch {
    A = B = null;
  }
  return (
    <WidgetFrame wide={wide} label="Compare two origins">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Field label="Page URL" value={a} onChange={setA} invalid={!A} describedBy="origin-error" long />
        <Field label="Request URL" value={b} onChange={setB} invalid={!B} describedBy="origin-error" long />
      </div>
      <div className="mt-6" aria-live="polite">
        {!A || !B ? (
          <FieldError id="origin-error">Enter full URLs, like https://kade.lk/path</FieldError>
        ) : (
          (() => {
            const same = A.s === B.s && A.h === B.h && A.p === B.p;
            const sameSite = A.s === B.s && A.site === B.site;
            return (
              <>
                <table className="w-full min-w-[520px] border-collapse text-left">
                  <thead>
                    <tr className="border-ink border-b">
                      {["Part", "Page", "Request", ""].map((h, i) => (
                        <th key={i} className="text-ink py-2 pr-4 text-[14px] font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      ["Scheme", A.s, B.s],
                      ["Host", A.h, B.h],
                      ["Port", A.p, B.p],
                    ] as const).map(([n, x, y]) => (
                      <tr key={n} className="border-rule border-b">
                        <td className="text-ink py-2 pr-4 text-[15px]">{n}</td>
                        <td className="text-ink py-2 pr-4 font-mono text-[14px]">{x}</td>
                        <td className="text-ink py-2 pr-4 font-mono text-[14px]">{y}</td>
                        <td className={cn("py-2 text-[14.5px]", x === y ? "text-ink-muted" : "text-ink font-bold")}>{x === y ? "same" : "different"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4">
                  <Outcome>
                    {same ? "Same origin: the page can read responses freely." : "Cross-origin: the page can read responses only if the server allows it with CORS."}{" "}
                    {sameSite
                      ? same
                        ? ""
                        : `They are still same-site (${A.site}), so SameSite=Lax cookies are sent.`
                      : "They are also cross-site: SameSite=Lax cookies are not sent on fetch calls."}
                  </Outcome>
                </div>
                <WidgetNote>
                  “Site” here uses the last two labels of the host. Real browsers use the Public Suffix List, which knows that
                  names like .com.lk or .co.uk are suffixes too.
                </WidgetNote>
              </>
            );
          })()
        )}
      </div>
    </WidgetFrame>
  );
}

type TunnelKind = "L" | "R" | "D";

/** Build an SSH tunnel command and see where each connection goes. */
export function TunnelBuilder({ wide }: { wide?: boolean }) {
  const [k, setK] = useState<TunnelKind>("L");
  const [v, setV] = useState<Record<TunnelKind, { a: string; b: string; c: string }>>({
    L: { a: "5433", b: "10.10.2.5", c: "5432" },
    R: { a: "8080", b: "localhost", c: "3000" },
    D: { a: "1080", b: "", c: "" },
  });
  const { a, b, c } = v[k];
  const set = (field: "a" | "b" | "c") => (x: string) => setV((p) => ({ ...p, [k]: { ...p[k], [field]: x } }));

  let cmd: string;
  let hops: [string, string][];
  let what: React.ReactNode;
  if (k === "L") {
    cmd = `ssh -N -L ${a}:${b}:${c} kade-api`;
    hops = [["Your app", `connects to localhost:${a}`], ["SSH (encrypted)", "laptop → kade-api:22"], ["kade-api", `opens TCP to ${b}:${c}`], [b, `port ${c}`]];
    what = <>Anything that connects to <b className="text-ink">localhost:{a}</b> on your laptop reaches <b className="text-ink">{b}:{c}</b>, which only kade-api can see. The part from kade-api to {b} is a normal connection inside the VPC, not SSH-encrypted.</>;
  } else if (k === "R") {
    cmd = `ssh -N -R ${a}:${b}:${c} kade-api`;
    hops = [["Teammate on kade-api", `connects to localhost:${a}`], ["SSH (encrypted)", "back down your connection"], ["Your laptop", `opens TCP to ${b}:${c}`], ["Your Node app", `port ${c}`]];
    what = <>Connections to port <b className="text-ink">{a}</b> on kade-api travel back through your SSH connection to <b className="text-ink">{b}:{c}</b> on your laptop. It works through home NAT, because your laptop opened the connection (chapter 10). By default it listens only on kade-api’s localhost.</>;
  } else {
    cmd = `ssh -N -D ${a} kade-api`;
    hops = [["Browser", `SOCKS proxy localhost:${a}`], ["SSH (encrypted)", "laptop → kade-api:22"], ["kade-api", "connects to whatever the browser asked for"], ["Any destination", "e.g. office admin pages"]];
    what = "The browser asks the SOCKS proxy for each site, and kade-api makes the connection. Sites see kade-api's address, not yours. One tunnel, any number of destinations.";
  }

  return (
    <WidgetFrame wide={wide} label="SSH tunnel builder">
      <Choices
        label="Tunnel type"
        value={k}
        onChange={setK}
        options={[
          { value: "L", label: "Local (-L)" },
          { value: "R", label: "Remote (-R)" },
          { value: "D", label: "Dynamic (-D)" },
        ]}
      />
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3">
        {k === "D" ? (
          <Field label="Local SOCKS port" value={a} onChange={set("a")} short inputMode="numeric" />
        ) : (
          <>
            <Field label={k === "L" ? "Port on your laptop" : "Port on kade-api"} value={a} onChange={set("a")} short inputMode="numeric" />
            <Field label={k === "L" ? "Target host (as seen from kade-api)" : "Target host (as seen from your laptop)"} value={b} onChange={set("b")} />
            <Field label="Target port" value={c} onChange={set("c")} short inputMode="numeric" />
          </>
        )}
      </div>
      <div className="mt-5" aria-live="polite">
        <CommandBlock>{cmd}</CommandBlock>
        <Hops>
          {hops.map(([name, sub]) => (
            <Hop key={name} sub={sub}>{name}</Hop>
          ))}
        </Hops>
        <p className="text-ink-body text-[15.5px] leading-[1.55] text-pretty">{what}</p>
      </div>
    </WidgetFrame>
  );
}
