"use client";

import { Fragment, useId, useState } from "react";
import { IconCheck, IconX } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { arrowHead } from "../diagram-defs";
import data from "./data/fundamentals.json";
import { MultiSeqDrawing } from "./seq";
import { Action, Choices, KeyValues, Outcome, Select, Steps, WidgetNote } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Chapters 33 and 34: proxies and load balancers, then one request followed
 * end to end. Outcomes are in words; red only where something breaks.
 */

/** The notes' small strings use <b> and <code>; render just those, never raw HTML. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(<b>.*?<\/b>|<code>.*?<\/code>)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("<b>") ? (
          <b key={i} className="text-ink">{p.slice(3, -4)}</b>
        ) : p.startsWith("<code>") ? (
          <code key={i} className="font-mono text-[0.92em]">{p.slice(6, -7)}</code>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

function Flow({ lanes, rows, label, wide }: { lanes: { t: string; c: string }[]; rows: Parameters<typeof MultiSeqDrawing>[0]["rows"]; label: string; wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label={label}>
      <div className="dd-fig">
        <MultiSeqDrawing lanes={lanes} rows={rows} />
      </div>
    </WidgetFrame>
  );
}

/** HTTPS through a forward proxy: CONNECT, then the proxy only copies bytes. */
export function ConnectFlow({ wide }: { wide?: boolean }) {
  return (
    <Flow
      wide={wide}
      label="HTTPS through a forward proxy"
      lanes={[
        { t: "Office PC", c: "purple" },
        { t: "Office proxy :3128", c: "cyan" },
        { t: "docs.google.com", c: "green" },
      ]}
      rows={[
        { f: 0, t: 1, l: "CONNECT docs.google.com:443", c: "purple" },
        { note: "the proxy checks its rules: is this site allowed?" },
        { f: 1, t: 2, l: "TCP handshake", c: "orange" },
        { f: 1, t: 0, l: "HTTP/1.1 200 Connection established", c: "green" },
        { f: 0, t: 2, l: "TLS ClientHello (SNI docs.google.com), relayed untouched", c: "purple" },
        { f: 2, t: 0, l: "TLS handshake, then encrypted HTTP: the proxy only copies bytes", c: "green" },
      ]}
    />
  );
}

/** What the laptop does when it rejoins the WiFi, before any request. */
export function JoinFlow({ wide }: { wide?: boolean }) {
  return (
    <Flow
      wide={wide}
      label="Rejoining the home network"
      lanes={[
        { t: "Laptop", c: "purple" },
        { t: "Home router", c: "cyan" },
      ]}
      rows={[
        { note: "WiFi association and the WPA2/WPA3 key exchange happen first (not covered in this course)" },
        { f: 0, t: 1, l: 'DHCPREQUEST (broadcast): "may I keep 192.168.1.23?"', c: "blue" },
        { f: 1, t: 0, l: "DHCPACK: yes · mask /24 · router and DNS 192.168.1.1 · 24 h lease", c: "green" },
        { f: 0, t: 1, l: "ARP (broadcast): who has 192.168.1.1?", c: "cyan" },
        { f: 1, t: 0, l: "ARP reply: 3c:84:6a:10:ee:01", c: "green" },
        { f: 0, t: 1, l: "IPv6 Router Solicitation → ff02::2", c: "purple" },
        { f: 1, t: 0, l: "Router Advertisement (if the ISP provides IPv6)", c: "green" },
      ]}
    />
  );
}

const SHOPPERS = data.LBSH as { n: string; ip: string; slow?: boolean }[];

interface Backend {
  n: string;
  ip: string;
  up: boolean;
  st: "healthy" | "unhealthy";
  f: number;
  p: number;
  act: { r: number; s: boolean }[];
  srv: number;
}

interface LbState {
  t: number;
  turn: number;
  rr: number;
  ck: Record<string, string>;
  log: { t: number; tone: "ok" | "bad" | "warn" | "info"; m: string }[];
  bk: Backend[];
}

const freshLb = (): LbState => ({
  t: 0,
  turn: 0,
  rr: 0,
  ck: {},
  log: [],
  bk: [
    ["kade-api-1", "10.10.1.10"],
    ["kade-api-2", "10.10.1.11"],
    ["kade-api-3", "10.10.1.12"],
  ].map(([n, ip]) => ({ n, ip, up: true, st: "healthy", f: 0, p: 0, act: [], srv: 0 })),
});

/** Three VMs behind a load balancer: algorithms, health checks, crashes and sticky sessions. */
export function LbSim({ wide }: { wide?: boolean }) {
  const [algo, setAlgo] = useState("rr");
  const [from, setFrom] = useState("turns");
  const [s, setS] = useState<LbState>(freshLb);

  function step(prev: LbState): LbState {
    const S: LbState = structuredClone(prev);
    const log = (tone: LbState["log"][number]["tone"], m: string) => {
      S.log = [{ t: S.t, tone, m }, ...S.log].slice(0, 14);
    };
    S.t++;
    S.bk.forEach((b) => {
      b.act = b.act.map((x) => ({ r: x.r - 1, s: x.s })).filter((x) => x.r > 0);
    });
    if (S.t % 2 === 0)
      S.bk.forEach((b) => {
        if (b.up) {
          b.p++;
          b.f = 0;
          if (b.st === "unhealthy" && b.p >= 2) {
            b.st = "healthy";
            log("ok", `health check: ${b.n} passed twice → healthy again`);
          }
        } else {
          b.f++;
          b.p = 0;
          if (b.st === "healthy") {
            if (b.f >= 2) {
              b.st = "unhealthy";
              log("bad", `health check: ${b.n} failed twice → marked unhealthy, no more traffic`);
            } else log("warn", `health check: ${b.n} failed (1 of 2)`);
          }
        }
      });
    const sh = from === "turns" ? SHOPPERS[S.turn++ % 4] : SHOPPERS.find((x) => x.n === from)!;
    const healthy = S.bk.filter((b) => b.st === "healthy");
    if (!healthy.length) {
      log("bad", `Shopper ${sh.n} → 502: no healthy backend (failed_to_pick_backend)`);
      return S;
    }
    let b: Backend;
    let why = "";
    if (algo === "rr") b = healthy[S.rr++ % healthy.length];
    else if (algo === "lc") {
      b = healthy.reduce((m, x) => (x.act.length < m.act.length ? x : m), healthy[0]);
      why = ` (had ${b.act.length} in progress)`;
    } else if (algo === "ck") {
      const c = S.ck[sh.n];
      const cb = c ? S.bk.find((x) => x.n === c) : undefined;
      if (cb && cb.st === "healthy") {
        b = cb;
        why = " (cookie)";
      } else {
        b = healthy[S.rr++ % healthy.length];
        S.ck[sh.n] = b.n;
        why = c ? ` (cookie pointed to ${c}, which is unhealthy: moved, session data there is lost)` : " (first visit: LB sets the GCLB cookie)";
      }
    } else {
      const hash = sh.ip.split(".").reduce((a, x) => a * 31 + Number(x), 7);
      b = healthy[Math.abs(hash) % healthy.length];
      why = ` (hash of ${sh.ip})`;
    }
    if (!b.up) {
      log("bad", `Shopper ${sh.n} → ${b.n}${why} → 502: VM is down but not yet marked unhealthy`);
      return S;
    }
    b.act.push({ r: sh.slow ? 4 : 1, s: !!sh.slow });
    b.srv++;
    log("ok", `Shopper ${sh.n} → ${b.n}${why} → 200${sh.slow ? " (slow report: 4 s)" : ""}`);
    return S;
  }

  const send = (n: number) =>
    setS((prev) => {
      let next = prev;
      for (let i = 0; i < n; i++) next = step(next);
      return next;
    });

  const toggle = (i: number) =>
    setS((prev) => {
      const S: LbState = structuredClone(prev);
      const b = S.bk[i];
      if (b.up) {
        b.up = false;
        const lost = b.act.length;
        b.act = [];
        S.log = [{ t: S.t, tone: "bad" as const, m: `${b.n} crashed${lost ? `: ${lost} request(s) in progress failed` : ""}` }, ...S.log].slice(0, 14);
      } else {
        b.up = true;
        b.p = 0;
        S.log = [{ t: S.t, tone: "info" as const, m: `${b.n} restarted; waiting for 2 passing health checks` }, ...S.log].slice(0, 14);
      }
      return S;
    });

  return (
    <WidgetFrame wide={wide} label="Load balancer simulator">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Select
          label="Algorithm"
          value={algo}
          onChange={setAlgo}
          options={[
            { value: "rr", label: "Round robin" },
            { value: "lc", label: "Least requests" },
            { value: "ck", label: "Sticky: cookie" },
            { value: "ip", label: "Sticky: client IP hash" },
          ]}
        />
        <Select
          label="Next request from"
          value={from}
          onChange={setFrom}
          options={[
            { value: "turns", label: "Shoppers take turns" },
            ...SHOPPERS.map((x) => ({ value: x.n, label: `Shopper ${x.n} · ${x.ip}${x.slow ? " · slow reports" : ""}` })),
          ]}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Action primary onClick={() => send(1)}>Send 1 request</Action>
        <Action onClick={() => send(8)}>Send 8</Action>
        <Action onClick={() => setS(freshLb())}>Reset</Action>
        <span className="text-ink-muted ml-2 font-mono text-[13px]">time: {s.t} s</span>
      </div>
      <div className="mt-5 grid min-w-[560px] grid-cols-3 gap-3 overflow-x-auto" aria-live="polite">
        {s.bk.map((b, i) => {
          const state = !b.up && b.st === "healthy" ? "down, not yet noticed" : b.st === "healthy" ? "healthy" : b.up ? "recovering: unhealthy" : "unhealthy";
          const bad = state !== "healthy";
          return (
            <div key={b.n} className={cn("rounded-[2px] border p-3", bad ? "border-fault" : "border-rule-strong")}>
              <b className="text-ink block text-[15px]">{b.n}</b>
              <span className="text-ink-muted block font-mono text-[12.5px]">{b.ip}:8080</span>
              <span className={cn("mt-1 inline-flex items-center gap-1.5 text-[14px] font-semibold", bad ? "text-fault" : "text-ink")}>
                {bad ? <IconX size={9} /> : <IconCheck size={10} />}
                {state}
              </span>
              <div className="mt-2 flex min-h-3 flex-wrap gap-1" aria-hidden="true">
                {b.act.map((x, j) => (
                  <i key={j} className={cn("inline-block size-3 rounded-[1px]", x.s ? "bg-plum" : "bg-ink-faint")} />
                ))}
              </div>
              <p className="text-ink-muted mt-1 font-mono text-[12px]">in progress {b.act.length} · served {b.srv}</p>
              <div className="mt-2">
                <Action onClick={() => toggle(i)}>{b.up ? "Crash this VM" : "Restart this VM"}</Action>
              </div>
            </div>
          );
        })}
      </div>
      <ol className="border-rule mt-4 min-h-24 border-t pt-3 font-mono text-[13px] leading-[1.6]">
        {s.log.length ? (
          s.log.map((l, i) => (
            <li key={i} className={l.tone === "bad" ? "text-fault" : l.tone === "warn" ? "text-ink font-semibold" : "text-ink-body"}>
              <span className="text-ink-faint">t={l.t}s</span> {l.m}
            </li>
          ))
        ) : (
          <li className="text-ink-faint font-sans text-[14.5px]">
            Send some requests. Then try: Least requests vs Round robin with Shopper A’s slow reports; crash a VM; sticky by
            client IP for Shoppers C and D.
          </li>
        )}
      </ol>
      <WidgetNote>
        Each request here is 1 second of time. Health checks run every 2 s and need 2 failures or 2 successes (real GCP
        defaults: every 5 s, 2 and 2). Squares are requests in progress; plum ones are slow reports.
      </WidgetNote>
    </WidgetFrame>
  );
}

type XffPath = "lb" | "ng" | "of";
const XFF_PATHS: Record<XffPath, { n: string; sock: string; good: number; hops: (sp: boolean) => [string, string, string][] }> = {
  lb: {
    n: "Home → load balancer → Node",
    sock: "35.191.12.34",
    good: 2,
    hops: (sp) => [
      ["Laptop sends the request", sp ? "1.2.3.4" : "(none)", "from 192.168.1.23"],
      ["Home router (NAT)", sp ? "1.2.3.4" : "(none)", "rewrites the IP only; it cannot touch HTTP (it is encrypted)"],
      ["GCP load balancer", `${sp ? "1.2.3.4, " : ""}203.0.113.45, 34.120.88.10`, "saw the connection come from 203.0.113.45; appends it, then its own IP"],
      ["Node receives", `${sp ? "1.2.3.4, " : ""}203.0.113.45, 34.120.88.10`, "socket peer: 35.191.12.34"],
    ],
  },
  ng: {
    n: "Load balancer → nginx on the VM → Node",
    sock: "127.0.0.1",
    good: 3,
    hops: (sp) => [
      ["Laptop sends the request", sp ? "1.2.3.4" : "(none)", "from 192.168.1.23"],
      ["GCP load balancer", `${sp ? "1.2.3.4, " : ""}203.0.113.45, 34.120.88.10`, "appends client and own IP"],
      ["nginx (same VM)", `${sp ? "1.2.3.4, " : ""}203.0.113.45, 34.120.88.10, 35.191.12.34`, "$proxy_add_x_forwarded_for appends the address it saw: the load balancer"],
      ["Node receives", `${sp ? "1.2.3.4, " : ""}203.0.113.45, 34.120.88.10, 35.191.12.34`, "socket peer: 127.0.0.1 (nginx)"],
    ],
  },
  of: {
    n: "Office PC → office proxy (TLS inspection) → load balancer → Node",
    sock: "35.191.12.34",
    good: 2,
    hops: (sp) => [
      ["Front desk PC sends the request", sp ? "1.2.3.4" : "(none)", "from 172.16.1.10"],
      ["Office proxy (decrypts, re-encrypts)", `${sp ? "1.2.3.4, " : ""}172.16.1.10`, "appends the PC it served. Without TLS inspection it could not add anything: it would only see a CONNECT tunnel."],
      ["Office router (NAT)", `${sp ? "1.2.3.4, " : ""}172.16.1.10`, "source becomes 198.51.100.20"],
      ["GCP load balancer", `${sp ? "1.2.3.4, " : ""}172.16.1.10, 198.51.100.20, 34.120.88.10`, "appends 198.51.100.20 and its own IP"],
      ["Node receives", `${sp ? "1.2.3.4, " : ""}172.16.1.10, 198.51.100.20, 34.120.88.10`, "socket peer: 35.191.12.34"],
    ],
  },
};

/** Who is the client? X-Forwarded-For through each proxy, and what Express's trust proxy picks. */
export function XffSim({ wide }: { wide?: boolean }) {
  const [path, setPath] = useState<XffPath>("lb");
  const [trust, setTrust] = useState("false");
  const [spoof, setSpoof] = useState(false);
  const C = XFF_PATHS[path];
  const hops = C.hops(spoof);
  const xff = hops[hops.length - 1][1];
  const list = xff === "(none)" ? [] : xff.split(", ");
  const addrs = [C.sock, ...list.slice().reverse()];
  const ip = trust === "false" ? addrs[0] : trust === "true" ? addrs[addrs.length - 1] : addrs[Math.min(Number(trust), addrs.length - 1)];
  const real = path === "of" ? "198.51.100.20" : "203.0.113.45";
  let verdict: [boolean, string];
  if (ip === real) verdict = [true, `Correct: ${ip} is the address that connected to your load balancer${path === "of" ? " (the office's public IP)" : ""}.`];
  else if (ip === "1.2.3.4") verdict = [false, "Spoofed! The client wrote this value itself. An attacker can pick any IP and dodge your rate limits."];
  else if (ip === "172.16.1.10")
    verdict = [true, "The office PC's private address, as reported by the office proxy. Only use this if you trust that proxy; for your own rate limits and logs, 198.51.100.20 is the safe answer."];
  else if (ip === "34.120.88.10") verdict = [false, "This is the load balancer's own IP, not the client."];
  else verdict = [false, `${ip} is a proxy (${ip === "127.0.0.1" ? "nginx" : "the Google front end"}), not the client. Every request looks like it came from here.`];
  const https = trust !== "false";
  return (
    <WidgetFrame wide={wide} label="X-Forwarded-For and trust proxy">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Select label="Path" value={path} onChange={setPath} options={(Object.keys(XFF_PATHS) as XffPath[]).map((k) => ({ value: k, label: XFF_PATHS[k].n }))} />
        <Select label="Express trust proxy" value={trust} onChange={setTrust} options={["false", "true", "1", "2", "3"].map((k) => ({ value: k, label: k }))} />
      </div>
      <label className="text-ink-body mt-4 flex cursor-pointer items-center gap-2.5 text-[15px]">
        <input type="checkbox" checked={spoof} onChange={(e) => setSpoof(e.target.checked)} className="accent-ink size-4" />
        the client sends a fake <code className="font-mono text-[0.92em]">X-Forwarded-For: 1.2.3.4</code>
      </label>
      <div className="mt-5 overflow-x-auto" aria-live="polite">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-ink border-b">
              {["Hop", "X-Forwarded-For after this hop", "Note"].map((h) => (
                <th key={h} className="text-ink py-2 pr-4 text-[14px] font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hops.map(([h, v, n]) => (
              <tr key={h} className="border-rule border-b align-top">
                <td className="text-ink py-2 pr-4 text-[15px]">{h}</td>
                <td className="text-ink py-2 pr-4 font-mono text-[13.5px]">{v}</td>
                <td className="text-ink-body py-2 text-[13.5px]">{n}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <KeyValues
          className="mt-4"
          items={[
            [
              "Hops Express reads",
              addrs.map((a, i) => (
                <span key={i} className={i === addrs.indexOf(ip) ? "text-ink font-bold" : "text-ink-muted"}>
                  {i > 0 && " · "}
                  {i}: {a}
                </span>
              )),
            ],
            ["req.ip", <b key="ip" className={verdict[0] ? "text-ink" : "text-fault"}>{ip}</b>],
            [
              "req.protocol",
              <>
                <b className={https ? "text-ink" : "text-fault"}>{https ? "https" : "http"}</b> ·{" "}
                {https ? "read from X-Forwarded-Proto, set by the load balancer" : "Node only sees its own plain-HTTP socket: https redirects loop, Secure cookies are not set"}
              </>,
              true,
            ],
          ]}
        />
        <p className={cn("mt-4 text-[16.5px] font-semibold text-pretty", verdict[0] ? "text-ink" : "text-fault")}>{verdict[1]}</p>
      </div>
      <WidgetNote>
        Express lists the socket peer first (hop 0), then X-Forwarded-For from right to left. <code>trust proxy</code> = N
        picks hop N. For this path the right value is <b className="text-ink">{C.good}</b>: the number of entries your own
        proxies add. <code>true</code> takes the leftmost entry, which the client controls.
      </WidgetNote>
    </WidgetFrame>
  );
}

const PRESETS = {
  def: {
    n: "Defaults, not aligned",
    L: [
      ["Kadé app gives up", 20, "app"],
      ["GCP load balancer (backend service timeout)", 30, "lb"],
      ["Node requestTimeout", 300, "node"],
      ["PostgreSQL statement_timeout", Infinity, "db"],
    ],
  },
  ok: {
    n: "Aligned: inner shorter than outer",
    L: [
      ["Kadé app gives up", 40, "app"],
      ["GCP load balancer (backend service timeout)", 30, "lb"],
      ["Node handler deadline", 25, "node"],
      ["PostgreSQL statement_timeout", 20, "db"],
    ],
  },
} as const;

/** A slow report request against every layer's timeout: who gives up first, and what keeps running. */
export function TimeoutChain({ wide }: { wide?: boolean }) {
  const [preset, setPreset] = useState<keyof typeof PRESETS>("def");
  const [d, setD] = useState(35);
  const rangeId = useId();
  const L = PRESETS[preset].L;
  const M = 120;
  const X = (v: number) => (Math.min(v, M) / M) * 100;
  const fired = L.filter((l) => l[1] < d).sort((a, b) => a[1] - b[1]);
  const f = fired[0];
  const still = f && (f[2] === "app" || f[2] === "lb") ? L.filter((l) => (l[2] === "node" || l[2] === "db") && l[1] >= d).map((l) => l[0].split(" ")[0]) : [];
  let good: boolean;
  let msg: string;
  if (!f) {
    good = true;
    msg = `200 OK after ${d} s. Every layer waited long enough.`;
  } else if (f[2] === "db") {
    good = true;
    msg = `PostgreSQL cancels the query at ${f[1]} s. Node catches the error and returns its own clear error (e.g. 503 "report too large, try a shorter date range") before the load balancer gives up. Nothing is left running.`;
  } else if (f[2] === "node") {
    good = true;
    msg = `Node's own deadline fires at ${f[1]} s and it returns a clear error itself. ${L.find((l) => l[2] === "db")![1] >= d ? "But the database query was not cancelled and keeps running." : ""}`;
  } else if (f[2] === "lb") {
    good = false;
    msg = `The load balancer gives up at ${f[1]} s and sends the shopper a 504 (logged as backend_timeout). Node and PostgreSQL do not know: they keep working until ${d} s, and the result is thrown away.`;
  } else {
    good = false;
    msg = `The app gives up at ${f[1]} s and shows "something went wrong". The load balancer, Node and the database keep going. If this was "place order", the order may still be created, and a retry may create a second one: use an idempotency key (chapter 24).`;
  }
  return (
    <WidgetFrame wide={wide} label="Timeouts in a chain">
      <Choices label="Settings" value={preset} onChange={setPreset} options={(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((k) => ({ value: k, label: PRESETS[k].n }))} />
      <div className="mt-4 grid max-w-[380px] gap-1.5">
        <label htmlFor={rangeId} className="text-ink-muted text-[14px]">
          The report request needs <b className="text-ink">{d} s</b>
        </label>
        <input id={rangeId} type="range" min={1} max={120} value={d} onChange={(e) => setD(Number(e.target.value))} className="accent-ink" />
      </div>
      <div className="mt-5 min-w-[560px] overflow-x-auto">
        <div className="relative h-24">
          <div className="bg-sunk absolute top-[52px] right-0 left-0 h-2 rounded-[2px]" />
          <div className="bg-amber absolute top-[52px] left-0 h-2 rounded-[2px]" style={{ width: `${X(d)}%` }} />
          {L.map((l, i) => {
            const inRange = Number.isFinite(l[1]) && l[1] <= M;
            const x = inRange ? X(l[1]) : 100;
            return (
              <div
                key={l[0]}
                className="absolute flex flex-col items-center"
                style={{ left: `${x}%`, top: i * 12, transform: inRange ? "translateX(-50%)" : "translateX(-100%)" }}
              >
                <span className={cn("font-mono text-[11.5px] whitespace-nowrap", l === f ? "text-fault font-bold" : "text-ink-muted")}>
                  {inRange ? `${l[1]} s` : Number.isFinite(l[1]) ? `${l[1]} s →` : "none →"}
                </span>
                <i className={cn("w-px", l === f ? "bg-fault" : "bg-ink-faint")} style={{ height: 44 - i * 12 }} />
              </div>
            );
          })}
          {[0, 30, 60, 90, 120].map((t) => (
            <span
              key={t}
              className="text-ink-faint absolute top-[66px] font-mono text-[11px] whitespace-nowrap"
              style={{ left: `${(t / M) * 100}%`, transform: t === 0 ? "none" : t === 120 ? "translateX(-100%)" : "translateX(-50%)" }}
            >
              {t} s
            </span>
          ))}
        </div>
      </div>
      <table className="mt-2 w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-ink border-b">
            {["Layer", "Timeout", "This request"].map((h) => (
              <th key={h} className="text-ink py-2 pr-4 text-[14px] font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {L.map((l) => (
            <tr key={l[0]} className="border-rule border-b">
              <td className="text-ink py-2 pr-4 text-[15px]">{l[0]}</td>
              <td className="text-ink py-2 pr-4 font-mono text-[14px]">{Number.isFinite(l[1]) ? `${l[1]} s` : "none"}</td>
              <td className="py-2 font-mono text-[14px]">
                {f && l === f ? <b className="text-fault">gives up first</b> : <span className="text-ink">{l[1] < d ? "would give up" : "waits"}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4" aria-live="polite">
        <p className={cn("text-[16.5px] leading-[1.55] font-semibold text-pretty", good ? "text-ink" : "text-fault")}>{msg}</p>
        {still.length > 0 && (
          <p className="text-ink mt-1 text-[15.5px]">
            <b>Still running after the shopper got an answer:</b> {still.join(", ")}.
          </p>
        )}
      </div>
    </WidgetFrame>
  );
}

type JourneyNode = { x: number; y: number; t: string; s: string; w?: number };
type JourneyStep = { t: string; c: string; h: string; ch: string; go: [string, string][]; act?: string[]; p?: [string, string][]; x: string };

const JN = data.JN as Record<string, JourneyNode>;
const JLINKS = data.JLINKS as [string, string][];
const JS = data.JS as unknown as JourneyStep[];

/** The notes' step colours, read as the fundamentals' layer legend. */
const stepHue = (c: string) =>
  ({ purple: "plum", orange: "amber", blue: "green", green: "green", cyan: "teal" })[c] as "plum" | "amber" | "green" | "teal" | undefined;

/** One request, every hop: step through it and see the packet at each stage. */
export function E2eJourney({ wide }: { wide?: boolean }) {
  const [k, setK] = useState(0);
  const S = JS[k];
  const hue = stepHue(S.c) ?? "amber";
  const active = new Set(S.act ?? S.go.flat());
  const hw = (n: string) => (JN[n].w ?? 124) / 2;
  const hh = 26;
  const edge = (a: string, b: string) => {
    const A = JN[a];
    const B = JN[b];
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const ta = Math.min(dx ? hw(a) / Math.abs(dx) : 1e9, dy ? hh / Math.abs(dy) : 1e9);
    const tb = Math.min(dx ? hw(b) / Math.abs(dx) : 1e9, dy ? hh / Math.abs(dy) : 1e9);
    return [A.x + dx * ta, A.y + dy * ta, B.x - dx * tb, B.y - dy * tb];
  };
  return (
    <WidgetFrame wide={wide} label="One request, end to end">
      <div className="flex flex-wrap items-center gap-2">
        <Action onClick={() => setK((x) => Math.max(0, x - 1))}>← Back</Action>
        <Action primary onClick={() => setK((x) => Math.min(JS.length - 1, x + 1))}>Next step →</Action>
        <span className="text-ink-muted ml-2 font-mono text-[13px]">step {k + 1} of {JS.length}</span>
      </div>
      <div aria-live="polite">
        <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-ink-muted text-[14px]">{S.t}</span>
          <b className="text-ink text-[17px]">{S.h}</b>
          <span className="text-ink-faint font-mono text-[12.5px]">chapter {S.ch}</span>
        </p>
        <div className="dd-fig mt-3">
          <svg viewBox="0 0 920 240" role="img" aria-label="Map of the request path; the active part is highlighted">
            <rect className="zone" x="4" y="110" width="282" height="120" rx="2" />
            <text className="s" x="16" y="128">home · 192.168.1.0/24</text>
            <rect className="zone" x="648" y="110" width="268" height="120" rx="2" />
            <text className="s" x="660" y="128">kade-vpc</text>
            {JLINKS.map(([a, b]) => {
              const e = edge(a, b);
              return <line key={`${a}${b}`} className="w" x1={e[0]} y1={e[1]} x2={e[2]} y2={e[3]} opacity={0.5} />;
            })}
            {S.go.map(([a, b]) => {
              const e = edge(a, b);
              return <line key={`g${a}${b}`} className={`w ${hue}`} x1={e[0]} y1={e[1]} x2={e[2]} y2={e[3]} strokeWidth={3} markerEnd={arrowHead(hue)} />;
            })}
            {Object.entries(JN).map(([n, N]) => {
              const on = active.has(n);
              return (
                <g key={n} opacity={on ? 1 : 0.75}>
                  <rect className={on ? `n ${hue}` : "n"} x={N.x - hw(n)} y={N.y - hh} width={hw(n) * 2} height={hh * 2} rx="2" strokeWidth={on ? 2.25 : undefined} />
                  <text className="mid" x={N.x} y={N.y - 3} fontSize="12">{N.t}</text>
                  <text className="s mid" x={N.x} y={N.y + 14}>{N.s}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <p className="text-ink-body mt-3 text-[15.5px] leading-[1.55] text-pretty"><Rich text={S.x} /></p>
        {S.p ? (
          <dl className="border-rule mt-3 grid grid-cols-[minmax(0,110px)_minmax(0,1fr)] gap-x-4 border-t pt-2 text-[14.5px]">
            {S.p.map(([key, v]) => (
              <Fragment key={key}>
                <dt className="text-ink-muted py-1">{key}</dt>
                <dd className="text-ink-body py-1 font-mono text-[13.5px]"><Rich text={v} /></dd>
              </Fragment>
            ))}
          </dl>
        ) : (
          <WidgetNote>No packet on the wire in this step.</WidgetNote>
        )}
      </div>
      <WidgetNote>Bold values changed compared with the packet before.</WidgetNote>
    </WidgetFrame>
  );
}

/** Rows of time: where the milliseconds of one request go. */
function Bars({ segs }: { segs: [string, number][] }) {
  const tot = segs.reduce((a, [, d]) => a + d, 0);
  const T = Math.max(50, Math.ceil(tot / 50) * 50);
  const pct = (t: number) => `${((t / T) * 100).toFixed(2)}%`;
  const step = T > 400 ? 100 : 50;
  const starts = segs.map((_, i) => segs.slice(0, i).reduce((a, [, d]) => a + d, 0));
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[300px] pr-12">
        {segs.map(([n, d], i) => {
          const start = starts[i];
          return (
            <div key={n} className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 py-[3px] sm:grid-cols-[170px_minmax(0,1fr)]">
              <span className="text-ink text-[13px] leading-tight sm:text-[13.5px]">{n}</span>
              <span className="bg-sunk relative h-3.5 rounded-[2px]">
                {d > 0 ? (
                  <>
                    <span className="bg-teal absolute top-0 h-full" style={{ left: pct(start), width: `${Math.max(0.4, (d / T) * 100).toFixed(2)}%` }} />
                    <span className="text-ink-muted absolute -top-[1px] font-mono text-[10.5px] whitespace-nowrap" style={{ left: `calc(${pct(start + d)} + 6px)` }}>
                      {Math.round(d)} ms
                    </span>
                  </>
                ) : (
                  <span className="text-ink-faint absolute left-1 -top-[1px] font-mono text-[10.5px]">skipped</span>
                )}
              </span>
            </div>
          );
        })}
        <div className="text-ink-faint relative mt-1 ml-[124px] h-4 sm:ml-[182px] font-mono text-[11px]">
          {Array.from({ length: T / step + 1 }, (_, i) => i * step).map((t) => (
            <span key={t} className={cn("absolute whitespace-nowrap", t !== 0 && t !== T && "hidden sm:inline")} style={{ left: pct(t), transform: t === T ? "translateX(-100%)" : "translateX(-50%)" }}>
              {t === T ? `${t} ms` : t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A model of one request's time: distance, DNS, handshakes, server work and download. */
export function E2eModel({ wide }: { wide?: boolean }) {
  const [rtt, setRtt] = useState(41);
  const [srv, setSrv] = useState(6);
  const [dnsMode, setDnsMode] = useState("cold");
  const [conn, setConn] = useState("new");
  const [pr, setPr] = useState("t13");
  const [sz, setSz] = useState("2.8");
  const rttId = useId();
  const srvId = useId();
  const R = rtt;
  const dns = conn === "reuse" ? 0 : ({ laptop: 0, res: 7, cold: 42 } as Record<string, number>)[dnsMode];
  let tcp = 0;
  let tls = 0;
  if (conn === "new") {
    if (pr === "t13") {
      tcp = R;
      tls = R + 2;
    } else if (pr === "t12") {
      tcp = R;
      tls = 2 * R + 3;
    } else tls = R + 2;
  }
  const wait = R + 2 + srv;
  const size = Number(sz);
  let n = 1;
  while (14.6 * (Math.pow(2, n) - 1) < size) n++;
  const dl = Math.max(1, (n - 1) * R + size * 0.16);
  const segs: [string, number][] = [
    ["DNS", dns],
    ["TCP handshake", tcp],
    [pr === "h3" ? "QUIC + TLS" : "TLS handshake", tls],
    ["Request → first byte", wait],
    ["Download", dl],
  ];
  const tot = segs.reduce((a, [, d]) => a + d, 0);
  const rt = (dns >= 40 ? 1 : 0) + (tcp ? 1 : 0) + (tls ? (pr === "t12" ? 2 : 1) : 0) + 1 + (n - 1);
  return (
    <WidgetFrame wide={wide} label="Where a request's time goes">
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        <div className="grid min-w-[220px] gap-1.5">
          <label htmlFor={rttId} className="text-ink-muted text-[14px]">Round trip to the server: <b className="text-ink">{rtt} ms</b></label>
          <input id={rttId} type="range" min={5} max={250} value={rtt} onChange={(e) => setRtt(Number(e.target.value))} className="accent-ink" />
        </div>
        <div className="grid min-w-[200px] gap-1.5">
          <label htmlFor={srvId} className="text-ink-muted text-[14px]">Server work: <b className="text-ink">{srv} ms</b></label>
          <input id={srvId} type="range" min={1} max={500} value={srv} onChange={(e) => setSrv(Number(e.target.value))} className="accent-ink" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3">
        <Select label="DNS" value={dnsMode} onChange={setDnsMode} options={[
          { value: "cold", label: "resolver must ask Cloud DNS" },
          { value: "res", label: "cached at the resolver" },
          { value: "laptop", label: "cached on the laptop" },
        ]} />
        <Select label="Connection" value={conn} onChange={setConn} options={[
          { value: "new", label: "new connection" },
          { value: "reuse", label: "reuse an open one" },
        ]} />
        <Select label="Protocol" value={pr} onChange={setPr} options={[
          { value: "t13", label: "TLS 1.3 over TCP" },
          { value: "t12", label: "TLS 1.2 over TCP" },
          { value: "h3", label: "HTTP/3 over QUIC" },
        ]} />
        <Select label="Response size" value={sz} onChange={setSz} options={[
          { value: "2.8", label: "2.8 KB (an order)" },
          { value: "100", label: "100 KB (a product list)" },
          { value: "1000", label: "1 MB (an image)" },
        ]} />
      </div>
      <div className="mt-5" aria-live="polite">
        <Bars segs={segs} />
        <div className="mt-3">
          <Outcome>
            Total about {Math.round(tot)} ms · {rt} round trip{rt === 1 ? "" : "s"} · {Math.round(Math.min(100, ((rt * R) / tot) * 100))}% of the time is distance
          </Outcome>
        </div>
      </div>
      <WidgetNote>
        A simple model with a 50 Mbps line. Larger responses need extra round trips while slow start grows the congestion
        window from 10 segments (chapter 20).
      </WidgetNote>
    </WidgetFrame>
  );
}

const CURL_SAMPLE = "dns 0.042133\nconnect 0.083418\ntls 0.126902\nttfb 0.175377\ntotal 0.176085";

/** Paste curl's timing output and read where the time went. */
export function CurlTime({ wide }: { wide?: boolean }) {
  const [text, setText] = useState(CURL_SAMPLE);
  const id = useId();
  const get = (names: string[]) => {
    for (const n of names) {
      const m = text.match(new RegExp(`(?:^|\\n)\\s*${n}\\s*[:=]?\\s*([0-9.]+)`, "i"));
      if (m) return parseFloat(m[1]);
    }
    return null;
  };
  const d = get(["dns", "time_namelookup"]);
  const c = get(["connect", "time_connect"]);
  const a = get(["tls", "time_appconnect"]);
  const s = get(["ttfb", "time_starttransfer"]);
  const T = get(["total", "time_total"]);
  const ok = [d, c, s, T].every((x) => x !== null);
  let body = null;
  if (ok) {
    const ms = (x: number) => x * 1000;
    const D = ms(d!);
    const C = ms(c!) - D;
    const A = a ? ms(a) - ms(c!) : 0;
    const W = ms(s!) - (a ? ms(a) : ms(c!));
    const DL = ms(T!) - ms(s!);
    const srvTime = W - C;
    const notes: React.ReactNode[] = [
      D < 2
        ? "DNS came from a cache on your machine (under 2 ms)."
        : D > 30
          ? `DNS took ${Math.round(D)} ms: the resolver probably had to look the name up (a cold cache), or your resolver is far away. Run again and it should drop.`
          : `DNS took ${Math.round(D)} ms: probably answered from your resolver's cache.`,
      <>The TCP handshake is one round trip, so your RTT to this server is about <b className="text-ink">{Math.round(C)} ms</b>.</>,
      ...(a ? [A > 1.6 * C ? `TLS took about ${(A / C).toFixed(1)} round trips: TLS 1.2, a slow server, or a large certificate chain.` : "TLS took about one round trip: TLS 1.3."] : []),
      srvTime > 100 ? (
        <>After sending the request, the server spent roughly <b className="text-ink">{Math.round(srvTime)} ms</b> working (wait minus one round trip): that is where to look.</>
      ) : (
        `The server itself answered fast: about ${Math.max(0, Math.round(srvTime))} ms beyond one round trip.`
      ),
    ];
    body = (
      <>
        <Bars segs={[["DNS", D], ["TCP handshake", C], ["TLS handshake", A], ["Request → first byte", W], ["Download", DL]]} />
        <div className="mt-4">
          <Steps>{notes}</Steps>
        </div>
      </>
    );
  }
  return (
    <WidgetFrame wide={wide} label="Read curl's timings">
      <label htmlFor={id} className="text-ink-muted text-[14px]">Paste curl’s output</label>
      <textarea
        id={id}
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="border-rule-strong bg-ground text-ink mt-1.5 block w-full max-w-[420px] rounded-[2px] border px-3 py-2 font-mono text-[13.5px]"
      />
      <div className="mt-5" aria-live="polite">
        {ok ? body : <p className="text-fault text-[15px]">Could not find dns, connect, ttfb and total lines. Use the command above exactly.</p>}
      </div>
    </WidgetFrame>
  );
}
