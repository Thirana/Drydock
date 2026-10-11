"use client";

import { useState } from "react";
import { IconCheck, IconX } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Field, FieldError } from "./field";
import { ByteDump, HeaderLayout } from "./headers";
import { Action, Choices, Outcome, Select, WidgetNote } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Chapters 24 to 26: loading a page over HTTP/1.1, 2 and 3; agreeing a key
 * in public; checking a certificate; and getting live updates to the app.
 */

const WF_RES: [string, number][] = [
  ["index.html", 30], ["app.css", 20], ["theme.css", 15], ["app.js", 60], ["cart.js", 40],
  ["analytics.js", 25], ["font.woff2", 30], ["rice.jpg", 40], ["dhal.jpg", 35], ["milk.jpg", 30],
  ["eggs.jpg", 30], ["bread.jpg", 25], ["tea.jpg", 25], ["sugar.jpg", 20], ["oil.jpg", 20],
  ["soap.jpg", 15], ["salt.jpg", 15], ["logo.svg", 10], ["banner.jpg", 10],
];

type Version = "h1" | "h2" | "h3";

interface WfRow {
  n: string;
  set?: [number, number] | null;
  wait: [number, number];
  dl: [number, number];
  c: number;
  lost?: number | null;
  stall?: [number, number];
}

/** The notes' page-load model: 41 ms round trip, waiting rather than bandwidth as the limit. */
function wfModel(v: Version, loss: boolean): WfRow[] {
  const RTT = 41;
  const BW = 2.5;
  const LOSSI = 9;
  const out: WfRow[] = [];
  const setup = v === "h3" ? RTT : 2 * RTT;
  const [first, size] = WF_RES[0];
  const hr = setup + RTT;
  const he = hr + size / BW;
  out.push({ n: first, set: [0, setup], wait: [setup, hr], dl: [hr, he], c: 0 });
  if (v === "h1") {
    const free = [he, he + 2 * RTT, he + 2 * RTT, he + 2 * RTT, he + 2 * RTT, he + 2 * RTT];
    const extra: ([number, number] | null)[] = [null, ...Array.from({ length: 5 }, () => [he, he + 2 * RTT] as [number, number])];
    WF_RES.slice(1).forEach(([n, sz], i) => {
      let c = 0;
      for (let k = 1; k < 6; k++) if (free[k] < free[c]) c = k;
      const st = free[c];
      const rs = st + RTT;
      let en = rs + sz / BW;
      let lost: number | null = null;
      if (loss && i + 1 === LOSSI) {
        lost = rs + (en - rs) / 2;
        en += RTT;
      }
      free[c] = en;
      const opens = extra[c] && st === extra[c]![1];
      out.push({ n, set: opens ? extra[c] : null, wait: [st, rs], dl: [rs, en], c, lost });
      if (opens) extra[c] = null;
    });
  } else {
    const rs = he + RTT;
    const rows: WfRow[] = WF_RES.slice(1).map(([n, sz]) => ({ n, wait: [he, rs], dl: [rs, rs + sz / BW], c: 0 }));
    if (loss) {
      const x = rows[LOSSI - 1];
      const L = x.dl[0] + (x.dl[1] - x.dl[0]) / 2;
      x.lost = L;
      rows.forEach((y, i) => {
        if (v === "h2") {
          if (y.dl[1] > L) {
            y.dl[1] += RTT;
            y.stall = [Math.max(L, y.dl[0]), Math.max(L, y.dl[0]) + RTT];
          }
        } else if (i === LOSSI - 1) y.dl[1] += RTT;
      });
    }
    out.push(...rows);
  }
  return out;
}

const total = (m: WfRow[]) => Math.max(...m.map((r) => r.dl[1]));
const VERSIONS: Record<Version, string> = { h1: "HTTP/1.1", h2: "HTTP/2", h3: "HTTP/3" };

/** The same page loaded over HTTP/1.1, 2 and 3, with or without one lost packet. */
export function Waterfall({ wide }: { wide?: boolean }) {
  const [v, setV] = useState<Version>("h1");
  const [loss, setLoss] = useState(false);
  const m = wfModel(v, loss);
  const T = Math.ceil(Math.max(...(["h1", "h2", "h3"] as Version[]).map((x) => total(wfModel(x, loss)))) / 50) * 50;
  const pct = (t: number) => `${((t / T) * 100).toFixed(2)}%`;
  const span = (a: number, b: number) => ({ left: pct(a), width: pct(b - a) });
  const lostConn = (wfModel("h1", true).find((r) => r.lost)?.c ?? 0) + 1;
  return (
    <WidgetFrame wide={wide} label="Page load waterfall">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Choices label="HTTP version" value={v} onChange={setV} options={(Object.keys(VERSIONS) as Version[]).map((k) => ({ value: k, label: VERSIONS[k] }))} />
        <label className="text-ink-body flex cursor-pointer items-center gap-2.5 text-[15px]">
          <input type="checkbox" checked={loss} onChange={(e) => setLoss(e.target.checked)} className="accent-ink size-4" />
          lose one packet (during milk.jpg)
        </label>
      </div>
      <div className="mt-4 overflow-x-auto" aria-live="polite">
        <div className="min-w-[680px]">
          {m.map((r) => (
            <div key={r.n} className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-3 py-[3px]">
              <span className="text-ink font-mono text-[12.5px]">
                {r.n}
                {v === "h1" && <span className="text-ink-faint"> · c{r.c + 1}</span>}
              </span>
              <span className="bg-sunk relative h-3.5 rounded-[2px]">
                {r.set && <span className="bg-teal-soft border-teal absolute top-0 h-full border" style={span(r.set[0], r.set[1])} />}
                <span className="bg-rule-strong absolute top-[4px] h-[6px]" style={span(r.wait[0], r.wait[1])} />
                <span className="bg-plum absolute top-0 h-full" style={span(r.dl[0], r.dl[1])} />
                {r.stall && (
                  <span
                    className="absolute top-0 h-full"
                    style={{ ...span(r.stall[0], r.stall[1]), background: "repeating-linear-gradient(45deg, var(--dd-fault) 0 3px, transparent 3px 6px)" }}
                  />
                )}
                {r.lost != null && (
                  <span className="text-fault absolute -top-[5px] -translate-x-1/2 text-[13px] font-bold" style={{ left: pct(r.lost) }}>
                    ✕
                  </span>
                )}
              </span>
            </div>
          ))}
          <div className="text-ink-faint relative mt-1 ml-[162px] h-4 font-mono text-[11px]">
            {Array.from({ length: T / 50 + 1 }, (_, k) => k * 50).map((t) => (
              <span key={t} className="absolute" style={{ left: pct(t), transform: t === T ? "translateX(-100%)" : "translateX(-50%)" }}>
                {t === T ? `${t} ms` : t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <ul className="text-ink-muted mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px]">
        <li className="inline-flex items-center gap-2"><span aria-hidden="true" className="border-teal bg-teal-soft inline-block h-2.5 w-4 border" />connection setup (TCP + TLS)</li>
        <li className="inline-flex items-center gap-2"><span aria-hidden="true" className="bg-rule-strong inline-block h-1.5 w-4" />waiting for the first byte (1 RTT)</li>
        <li className="inline-flex items-center gap-2"><span aria-hidden="true" className="bg-plum inline-block h-2.5 w-4" />downloading{v === "h1" ? " (c1-c6 = connection)" : ""}</li>
        <li>✕ lost packet · hatched = stalled</li>
      </ul>
      <table className="mt-4 w-full max-w-[520px] border-collapse text-left">
        <thead>
          <tr className="border-ink border-b">
            {["Page fully loaded", "no loss", "one packet lost"].map((h) => (
              <th key={h} className="text-ink py-2 pr-4 text-[14px] font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(["h1", "h2", "h3"] as Version[]).map((x) => (
            <tr key={x} className="border-rule border-b">
              <td className={cn("py-2 pr-4 text-[15px]", x === v ? "text-ink font-semibold" : "text-ink")}>{VERSIONS[x]}</td>
              <td className="text-ink py-2 pr-4 font-mono text-[14px]">{Math.round(total(wfModel(x, false)))} ms</td>
              <td className="text-ink py-2 font-mono text-[14px]">{Math.round(total(wfModel(x, true)))} ms</td>
            </tr>
          ))}
        </tbody>
      </table>
      <WidgetNote>
        A simple model: 41 ms round trip, and a line fast enough that waiting, not bandwidth, is the limit. HTTP/1.1
        opens 5 more connections once the HTML arrives, each paying 2 round trips of setup, then fetches one file at a
        time per connection. HTTP/2 and HTTP/3 ask for everything at once on one connection. With a loss, HTTP/2’s whole
        connection stalls for a round trip; HTTP/3 delays only milk.jpg; HTTP/1.1 delays only connection {lostConn}.
      </WidgetNote>
    </WidgetFrame>
  );
}

function modpow(base: string | bigint, exp: string | bigint, mod: string | bigint) {
  let b = BigInt(base);
  let e = BigInt(exp);
  const m = BigInt(mod);
  let r = BigInt(1);
  b %= m;
  while (e > BigInt(0)) {
    if (e & BigInt(1)) r = (r * b) % m;
    b = (b * b) % m;
    e >>= BigInt(1);
  }
  return r;
}

/** Diffie-Hellman with small numbers: both sides reach the same secret without sending it. */
export function DhCalc({ wide }: { wide?: boolean }) {
  const [p, setP] = useState("23");
  const [g, setG] = useState("5");
  const [a, setA] = useState("6");
  const [b, setB] = useState("15");
  const vals = [p, g, a, b].map((x) => x.trim());
  const ok = vals.every((x) => /^\d{1,9}$/.test(x)) && Number(vals[0]) >= 3;
  let body = null;
  if (ok) {
    const A = modpow(vals[1], vals[2], vals[0]);
    const B = modpow(vals[1], vals[3], vals[0]);
    const s1 = modpow(B, vals[2], vals[0]);
    const s2 = modpow(A, vals[3], vals[0]);
    body = (
      <>
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-ink border-b">
              {["Laptop", "On the network (anyone can see)", "kade-api"].map((h) => (
                <th key={h} className="text-ink py-2 pr-4 text-[14px] font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-[14px]">
            <tr className="border-rule border-b">
              <td className="text-ink py-2 pr-4">secret a = {vals[2]}</td>
              <td className="text-ink py-2 pr-4">p = {vals[0]}, g = {vals[1]}</td>
              <td className="text-ink py-2">secret b = {vals[3]}</td>
            </tr>
            <tr className="border-rule border-b">
              <td className="text-ink py-2 pr-4">A = g<sup>a</sup> mod p = <b>{String(A)}</b></td>
              <td className="text-ink py-2 pr-4">A = {String(A)} →<br />← B = {String(B)}</td>
              <td className="text-ink py-2">B = g<sup>b</sup> mod p = <b>{String(B)}</b></td>
            </tr>
            <tr className="border-rule border-b align-top">
              <td className="text-ink py-2 pr-4">B<sup>a</sup> mod p = <b className="dd-mark">{String(s1)}</b></td>
              <td className="text-ink-body py-2 pr-4 font-sans text-[13.5px]">
                To get the secret, a listener would have to find a from A (or b from B). Easy for p = 23; practically
                impossible for real key sizes.
              </td>
              <td className="text-ink py-2">A<sup>b</sup> mod p = <b>{String(s2)}</b></td>
            </tr>
          </tbody>
        </table>
        <div className="mt-4">
          <Outcome>
            {s1 === s2
              ? `Both sides computed ${String(s1)} without ever sending it. This shared secret becomes the seed for the symmetric keys.`
              : "Mismatch: check that p is prime."}
          </Outcome>
        </div>
      </>
    );
  }
  return (
    <WidgetFrame wide={wide} label="Diffie-Hellman key exchange">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Field label="Public prime p" value={p} onChange={setP} short inputMode="numeric" invalid={!ok} describedBy="dh-error" />
        <Field label="Public base g" value={g} onChange={setG} short inputMode="numeric" invalid={!ok} describedBy="dh-error" />
        <Field label="Laptop’s secret a" value={a} onChange={setA} short inputMode="numeric" invalid={!ok} describedBy="dh-error" />
        <Field label="kade-api’s secret b" value={b} onChange={setB} short inputMode="numeric" invalid={!ok} describedBy="dh-error" />
      </div>
      <div className="mt-6 overflow-x-auto" aria-live="polite">
        {ok ? body : <FieldError id="dh-error">Use whole numbers (p at least 3, up to 9 digits).</FieldError>}
      </div>
    </WidgetFrame>
  );
}

const CERTS = [
  { n: "Valid certificate from a public CA", f: null, x: "Every check passes. The padlock appears and the request goes ahead." },
  { n: "Certificate expired last night", f: 2, err: "NET::ERR_CERT_DATE_INVALID", x: "The renewal job on kade-api failed silently. Automate renewal and alert well before the expiry date." },
  { n: "Certificate only lists kade.lk and www.kade.lk", f: 3, err: "NET::ERR_CERT_COMMON_NAME_INVALID", x: "The browser asked for api.kade.lk, which is not in the SAN list. Add it, or use a certificate that covers it." },
  { n: "Server sends the leaf only, no intermediate", f: 0, err: "curl: unable to get local issuer certificate", x: "Some browsers fetch the missing intermediate themselves and look fine, but curl, Node and many mobile apps fail. Serve the full chain." },
  { n: "Self-signed certificate", f: 0, err: "NET::ERR_CERT_AUTHORITY_INVALID", x: "Nobody trusted vouches for it. Anyone can make one for any name, which is exactly why browsers refuse it." },
  { n: "Laptop clock set to two years ago", f: 2, err: "NET::ERR_CERT_DATE_INVALID", x: "The certificate is fine; the client thinks it is \"not yet valid\". Fix the device clock." },
  { n: "Attacker on café WiFi presents a real-looking copy", f: 5, err: "Handshake fails (bad CertificateVerify)", x: "They can copy kade-api's public certificate, but cannot sign the handshake without its private key. The copy is useless." },
] as const;

const CHECKS = [
  "Build a chain from the certificate up to a root in the trust store",
  "Each certificate's signature verifies with its issuer's public key",
  "Today's date (on the client) is inside every certificate's validity dates",
  "The name typed (api.kade.lk) is in the leaf's SAN list",
  "Not revoked; allowed for TLS server use",
  "CertificateVerify: the server's signature over this handshake verifies with the leaf's public key",
];

/** The checks a browser runs on a certificate, and where each situation fails. */
export function CertSim({ wide }: { wide?: boolean }) {
  const [cur, setCur] = useState("0");
  const c = CERTS[Number(cur)];
  return (
    <WidgetFrame wide={wide} label="Certificate checks">
      <Select label="Situation" value={cur} onChange={setCur} options={CERTS.map((x, i) => ({ value: String(i), label: x.n }))} />
      <div aria-live="polite">
        <ol className="mt-5 space-y-1.5">
          {CHECKS.map((t, i) => {
            const failed = c.f === i;
            const skipped = c.f !== null && i > c.f;
            return (
              <li key={t} className={cn("grid grid-cols-[22px_minmax(0,1fr)] gap-x-2 text-[15px] leading-[1.5]", skipped && "text-ink-faint")}>
                <span aria-hidden="true" className={cn("mt-[5px]", failed ? "text-fault" : "text-ink")}>
                  {failed ? <IconX size={10} /> : skipped ? "·" : <IconCheck size={11} />}
                </span>
                <span className={skipped ? "" : "text-ink"}>
                  {t}
                  {failed && <b className="text-fault"> ← fails here</b>}
                  {skipped && <span className="sr-only"> (not reached)</span>}
                </span>
              </li>
            );
          })}
        </ol>
        <p className={cn("mt-4 text-[16.5px] font-semibold", c.f === null ? "text-ink" : "text-fault")}>
          {c.f === null ? "Trusted. The connection continues." : <>Connection refused: <code className="font-mono text-[0.9em]">{"err" in c ? c.err : ""}</code></>}
        </p>
        <p className="text-ink-body mt-2 text-[15px] leading-[1.55] text-pretty">{c.x}</p>
      </div>
    </WidgetFrame>
  );
}

/** Four ways to get updates to the app, against the same five random events. */
export function RtSim({ wide }: { wide?: boolean }) {
  const make = () => Array.from({ length: 5 }, () => 2 + Math.random() * 56).sort((x, y) => x - y);
  const [evs, setEvs] = useState<number[]>(() => [7, 19, 26, 41, 52]);
  const RTT = 0.041;
  const X = (t: number) => 175 + (t / 60) * 715;
  const lanes = ["Short polling (5 s)", "Long polling", "Server-Sent Events", "WebSocket"];
  const stats: [string, number, number, string, string][] = [];
  const drawn = lanes.map((name, li) => {
    const y = 40 + li * 70;
    const parts: React.ReactNode[] = [];
    let req = 0;
    let empty = 0;
    const delays: number[] = [];
    if (li === 0) {
      for (let t = 0; t <= 60; t += 5) {
        req++;
        const got = evs.filter((e) => e <= t && e > t - 5);
        if (!got.length) empty++;
        parts.push(<line key={`p${t}`} x1={X(t)} y1={y + 8} x2={X(t)} y2={y + 24} style={{ stroke: got.length ? "var(--dd-ink)" : "var(--dd-ink-faint)", strokeWidth: 2 }} />);
        got.forEach((e) => {
          delays.push(t + RTT / 2 - e);
          parts.push(<rect key={`w${e}`} x={X(e)} y={y + 13} width={X(t) - X(e)} height="6" rx="1" style={{ fill: "var(--dd-amber)", opacity: 0.8 }} />);
        });
      }
    } else if (li === 1) {
      let last = 0;
      req = 1;
      evs.forEach((e) => {
        while (e - last > 30) {
          last += 30;
          req++;
          empty++;
          parts.push(<line key={`e${last}`} x1={X(last)} y1={y + 8} x2={X(last)} y2={y + 24} style={{ stroke: "var(--dd-ink-faint)", strokeWidth: 2 }} />);
        }
        delays.push(RTT / 2);
        req++;
        last = e + RTT;
        parts.push(<circle key={`d${e}`} cx={X(e)} cy={y + 16} r="4" style={{ fill: "var(--dd-green)" }} />);
      });
    } else {
      req = 1;
      evs.forEach((e) => {
        delays.push(RTT / 2);
        parts.push(<circle key={`d${e}`} cx={X(e)} cy={y + 16} r="4" style={{ fill: "var(--dd-green)" }} />);
      });
      if (li === 3)
        [14, 38].forEach((u) =>
          parts.push(<text key={`u${u}`} className="s mid" x={X(u)} y={y + 34}>↑ chat</text>),
        );
    }
    const avg = delays.reduce((s, d) => s + d, 0) / Math.max(1, delays.length);
    stats.push([name, req, empty, avg < 1 ? `${Math.round(avg * 1000)} ms` : `${avg.toFixed(1)} s`, li < 2 ? "~700 B per request" : "2-8 B per message"]);
    return (
      <g key={name}>
        <text className="t" x="16" y={y + 20} fontSize="14.5">{name}</text>
        <line className="w dash" x1="175" y1={y + 16} x2="890" y2={y + 16} />
        {evs.map((e) => (
          <polygon key={`s${e}`} points={`${X(e)},${y - 4} ${X(e) + 4},${y} ${X(e)},${y + 4} ${X(e) - 4},${y}`} style={{ fill: "var(--dd-ink)" }} />
        ))}
        {parts}
      </g>
    );
  });
  return (
    <WidgetFrame wide={wide} label="Polling, long polling, Server-Sent Events and WebSocket">
      <Action primary onClick={() => setEvs(make())}>New random updates</Action>
      <div className="dd-fig mt-4" aria-live="polite">
        <svg viewBox="0 0 920 335" role="img" aria-label="Four lanes comparing how quickly updates arrive with polling, long polling, SSE and WebSocket">
          {drawn}
          {[0, 10, 20, 30, 40, 50, 60].map((t) => (
            <text key={t} className="s mid" x={X(t)} y="325">{t} s</text>
          ))}
        </svg>
      </div>
      <ul className="text-ink-muted mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px]">
        <li>diamond = update happens on kade-api</li>
        <li className="inline-flex items-center gap-2"><span aria-hidden="true" className="bg-amber inline-block h-1.5 w-4" />bar = how long the app waits to learn it</li>
        <li className="inline-flex items-center gap-2"><span aria-hidden="true" className="bg-green inline-block size-2.5 rounded-full" />dot = delivered at once</li>
        <li>grey tick = request that came back empty</li>
        <li>↑ = message from the app (WebSocket only)</li>
      </ul>
      <table className="mt-4 w-full min-w-[620px] border-collapse text-left">
        <thead>
          <tr className="border-ink border-b">
            {["Technique", "Requests", "Empty replies", "Avg delay", "Overhead"].map((h) => (
              <th key={h} className="text-ink py-2 pr-4 text-[14px] font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stats.map(([n, r, e, d, o]) => (
            <tr key={n} className="border-rule border-b">
              <td className="text-ink py-2 pr-4 text-[15px]">{n}</td>
              <td className="text-ink py-2 pr-4 font-mono text-[14px]">{r}</td>
              <td className="text-ink py-2 pr-4 font-mono text-[14px]">{e}</td>
              <td className="text-ink py-2 pr-4 font-mono text-[14px]">{d}</td>
              <td className="text-ink-body py-2 text-[14.5px]">{o}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <WidgetNote>Per app, per minute, with a 41 ms round trip. Multiply the requests by 10,000 shoppers to see the load on kade-api.</WidgetNote>
    </WidgetFrame>
  );
}

export function WsHeader({ wide }: { wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label="The WebSocket frame header">
      <HeaderLayout
        rows={[
          ["bytes 0-3", [
            { name: "FIN", size: "1", bits: 1 },
            { name: "RSV", size: "3", bits: 3 },
            { name: "Opcode", size: "4", bits: 4 },
            { name: "M", size: "1", bits: 1 },
            { name: "Payload len", size: "7", bits: 7 },
            { name: "Extended length (if 126 or 127)", size: "16 or 64 bits", bits: 16, dashed: true },
          ]],
          ["next 4", [{ name: "Masking key (client → server frames only)", size: "32 bits", bits: 32, dashed: true }]],
          ["then", [{ name: "Payload: your message", size: "text or binary", bits: 32, tall: true }]],
        ]}
      />
      <WidgetNote>
        A small server → client message needs only the first 2 bytes of header. A client message adds the 4-byte mask.
        Long messages add 2 or 8 bytes of length.
      </WidgetNote>
    </WidgetFrame>
  );
}

export function WsDump({ wide }: { wide?: boolean }) {
  const bytes = "81 8e 37 fa 21 3d 4c d8 55 4f 56 99 4a 1f 0d cb 11 09 05 87".split(" ").map((x) => parseInt(x, 16));
  const mask = bytes.slice(2, 6);
  return (
    <WidgetFrame wide={wide} label="A WebSocket frame, byte by byte">
      <ByteDump
        bytes={bytes}
        fieldOf={(i) => (i === 0 ? 0 : i === 1 ? 1 : i < 6 ? 2 : 3)}
        labelOf={(i) =>
          i === 0 ? "FIN+text" : i === 1 ? "M+len 14" : i === 2 ? "mask key" : i < 6 ? "" : `→ ${String.fromCharCode(bytes[i] ^ mask[(i - 6) % 4])}`
        }
      />
      <WidgetNote>
        Byte 0 = <code>81</code>: FIN = 1 and opcode 1 (text). Byte 1 = <code>8e</code>: MASK = 1 and length 14 (0x0e).
        Then the 4-byte masking key <code>37 fa 21 3d</code>. Each payload byte is XORed with the key in turn; the small
        labels show the decoded characters: <code>{'{"track":1042}'}</code>. Only 6 bytes of overhead.
      </WidgetNote>
    </WidgetFrame>
  );
}
