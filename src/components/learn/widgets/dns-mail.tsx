"use client";

import { useState } from "react";
import { IconCheck, IconX } from "@/components/ui/icons";
import data from "./data/fundamentals.json";
import { MultiSeqDrawing } from "./seq";
import { Action, Outcome, Select, WidgetNote } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Chapters 22 and 23: a resolver walking the DNS tree, its cache ageing,
 * and how mail finds Kadé's server and proves it came from Kadé.
 */

type Lane = { t: string; c: string };
type Row = { note: string } | { f: number; t: number; l: string; c?: string };

const DNSL = data.DNSL as Lane[];
const DNSZ = data.DNSZ as unknown as Record<string, { ans: [string, string, number][]; show: string; nx?: boolean }>;

function Drawing({ lanes, rows }: { lanes: Lane[]; rows: Row[] }) {
  return (
    <div className="dd-fig">
      <MultiSeqDrawing lanes={lanes} rows={rows} />
    </div>
  );
}

/** One full lookup of api.kade.lk, from the laptop to Cloud DNS and back. */
export function DnsWalk({ wide }: { wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label="A full DNS lookup, step by step">
      <Drawing
        lanes={DNSL}
        rows={[
          { f: 0, t: 1, l: "1 · A api.kade.lk? (please recurse)", c: "purple" },
          { f: 1, t: 2, l: "2 · A api.kade.lk?", c: "muted" },
          { f: 2, t: 1, l: "3 · referral: ask the .lk servers", c: "orange" },
          { f: 1, t: 3, l: "4 · A api.kade.lk?", c: "muted" },
          { f: 3, t: 1, l: "5 · referral: ask ns-cloud-a1…a4", c: "orange" },
          { f: 1, t: 4, l: "6 · A api.kade.lk?", c: "muted" },
          { f: 4, t: 1, l: "7 · 34.87.120.15 · TTL 300 · AA", c: "green" },
          { f: 1, t: 0, l: "8 · 34.87.120.15", c: "green" },
        ]}
      />
    </WidgetFrame>
  );
}

interface CacheEntry {
  v: string;
  exp: number;
}

const fmtT = (sec: number) =>
  sec >= 86400
    ? `${(sec / 86400).toFixed(sec % 86400 ? 1 : 0)} d`
    : sec >= 3600
      ? `${Math.round(sec / 3600)} h`
      : sec >= 60
        ? `${Math.floor(sec / 60)} min${sec % 60 ? ` ${sec % 60} s` : ""}`
        : `${sec} s`;

/** A resolver with a cache: look names up, move the clock, watch entries expire. */
export function DnsSim({ wide }: { wide?: boolean }) {
  const [name, setName] = useState("api.kade.lk");
  const [now, setNow] = useState(0);
  const [cache, setCache] = useState<Record<string, CacheEntry>>({});
  const [last, setLast] = useState<{ rows: Row[]; ms: number; ups: number; hit: boolean } | null>(null);

  const live = Object.fromEntries(Object.entries(cache).filter(([, e]) => e.exp > now));
  const valid = (k: string) => k in live;

  function lookup() {
    const Z = DNSZ[name];
    const next = { ...live };
    const put = (k: string, v: string, ttl: number) => {
      next[k] = { v, exp: now + ttl };
    };
    const rows: Row[] = [{ f: 0, t: 1, l: `A ${name}? (please recurse)`, c: "purple" }];
    let ms = 4;
    let ups = 0;
    if (Z.ans.every((a) => valid(a[0]))) {
      rows.push({ note: "every record needed is in the cache: no upstream questions" });
      rows.push({ f: 1, t: 0, l: `${Z.show} (from cache)`, c: "green" });
      setLast({ rows, ms, ups, hit: true });
      return;
    }
    if (!valid("kade.lk NS")) {
      if (!valid("lk NS")) {
        rows.push({ f: 1, t: 2, l: `A ${name}?`, c: "muted" }, { f: 2, t: 1, l: "referral: ask the .lk servers", c: "orange" });
        ms += 8;
        ups++;
        put("lk NS", ".lk name servers", 172800);
      } else rows.push({ note: ".lk servers already cached: skip the root" });
      rows.push({ f: 1, t: 3, l: `A ${name}?`, c: "muted" }, { f: 3, t: 1, l: "referral: ask ns-cloud-a1…a4", c: "orange" });
      ms += 12;
      ups++;
      put("kade.lk NS", "ns-cloud-a1…a4.googledomains.com", 86400);
    } else rows.push({ note: "kade.lk servers already cached: go straight to Cloud DNS" });
    rows.push(
      { f: 1, t: 4, l: `A ${name}?`, c: "muted" },
      { f: 4, t: 1, l: Z.show + (Z.nx ? " (from the SOA: cache 300 s)" : " · TTL 300"), c: Z.nx ? "red" : "green" },
    );
    ms += 10;
    ups++;
    Z.ans.forEach(([k, v, ttl]) => put(k, v, ttl));
    rows.push({ f: 1, t: 0, l: Z.show, c: Z.nx ? "red" : "green" });
    setCache(next);
    setLast({ rows, ms, ups, hit: false });
  }

  return (
    <WidgetFrame wide={wide} label="A DNS resolver and its cache">
      <Select
        label="Name"
        value={name}
        onChange={setName}
        options={Object.keys(DNSZ).map((n) => ({ value: n, label: n }))}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Action primary onClick={lookup}>Look it up</Action>
        <Action onClick={() => setNow((t) => t + 60)}>+1 minute</Action>
        <Action onClick={() => setNow((t) => t + 600)}>+10 minutes</Action>
        <Action onClick={() => setNow((t) => t + 86400)}>+1 day</Action>
        <Action onClick={() => { setCache({}); setLast(null); }}>Empty the cache</Action>
        <span className="text-ink-muted ml-2 font-mono text-[13px]">clock: +{now ? fmtT(now) : "0 s"}</span>
      </div>
      <div className="mt-5" aria-live="polite">
        {last ? (
          <>
            <Outcome>
              {last.hit ? "Cache hit." : "Cache miss."} The resolver asked {last.ups} server{last.ups === 1 ? "" : "s"} upstream · about {last.ms} ms in total
            </Outcome>
            <div className="mt-3">
              <Drawing lanes={DNSL} rows={last.rows} />
            </div>
          </>
        ) : (
          <WidgetNote>Pick a name and look it up. Try the same name twice, then move the clock past 5 minutes.</WidgetNote>
        )}
      </div>
      <table className="mt-5 w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-ink border-b">
            {["Resolver cache", "Value", "TTL"].map((h) => (
              <th key={h} className="text-ink py-2 pr-4 text-[14px] font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(live).length ? (
            Object.entries(live).map(([k, e]) => (
              <tr key={k} className="border-rule border-b">
                <td className="text-ink py-2 pr-4 font-mono text-[14px]">{k}</td>
                <td className="text-ink py-2 pr-4 font-mono text-[14px]">{e.v}</td>
                <td className="text-ink-muted py-2 font-mono text-[14px]">{fmtT(e.exp - now)} left</td>
              </tr>
            ))
          ) : (
            <tr className="border-rule border-b">
              <td className="text-ink-faint py-2 text-[14px]" colSpan={3}>empty</td>
            </tr>
          )}
        </tbody>
      </table>
    </WidgetFrame>
  );
}

/** How a reply to orders@kade.lk finds Google Workspace through the MX record. */
export function MxFlow({ wide }: { wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label="Finding Kadé's mail server">
      <Drawing
        lanes={[
          { t: "Shopper's mail server", c: "purple" },
          { t: "Resolver", c: "cyan" },
          { t: "Cloud DNS (kade.lk)", c: "blue" },
          { t: "smtp.google.com", c: "green" },
        ]}
        rows={[
          { note: "a shopper replies to orders@kade.lk" },
          { f: 0, t: 1, l: "MX kade.lk?", c: "muted" },
          { f: 1, t: 2, l: "MX kade.lk?", c: "muted" },
          { f: 2, t: 1, l: "1 smtp.google.com", c: "orange" },
          { f: 1, t: 0, l: "1 smtp.google.com", c: "orange" },
          { f: 0, t: 1, l: "A smtp.google.com?", c: "muted" },
          { f: 1, t: 0, l: "its IP address", c: "orange" },
          { f: 0, t: 3, l: "SMTP, TCP port 25: deliver the reply", c: "green" },
          { note: "Google Workspace puts it in the orders@kade.lk inbox" },
        ]}
      />
      <WidgetNote>The “please recurse” steps from chapter 22 are hidden: the resolver may already have most of this cached.</WidgetNote>
    </WidgetFrame>
  );
}

/** A DKIM signature checked against the public key in DNS. */
export function DkimFlow({ wide }: { wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label="Checking a DKIM signature">
      <Drawing
        lanes={[
          { t: "Google Workspace (sender)", c: "purple" },
          { t: "Shopper's mail server", c: "green" },
          { t: "Cloud DNS (kade.lk)", c: "blue" },
        ]}
        rows={[
          { note: "Workspace hashes the body and chosen headers, and signs them with Kadé's private key" },
          { f: 0, t: 1, l: "email + DKIM-Signature: d=kade.lk; s=google; b=…", c: "purple" },
          { f: 1, t: 2, l: "TXT google._domainkey.kade.lk?", c: "muted" },
          { f: 2, t: 1, l: "v=DKIM1; k=rsa; p=(public key)", c: "orange" },
          { note: "the receiver recomputes the hash and checks the signature with the public key" },
          { note: "match → dkim=pass for kade.lk · any change on the way → dkim=fail" },
        ]}
      />
    </WidgetFrame>
  );
}

const EMAILS = [
  {
    n: "Order confirmation via Google Workspace",
    ip: "209.85.220.41 (a Google mail server)",
    env: "orders@kade.lk",
    from: "orders@kade.lk",
    spf: ["pass", "kade.lk", "209.85.220.41 is in _spf.google.com, which kade.lk's SPF includes"],
    dkim: ["pass", "kade.lk"],
    x: "The normal case. Both checks pass and both are for kade.lk, the same domain the reader sees.",
  },
  {
    n: "Marketing email, bulk provider not set up yet",
    ip: "a bulk provider server",
    env: "bounces+4821@sendgrid.net",
    from: "news@kade.lk",
    spf: ["pass", "sendgrid.net", "checked against sendgrid.net's own SPF, because that is the envelope domain"],
    dkim: ["pass", "sendgrid.net"],
    x: "Both checks pass, but for sendgrid.net, not kade.lk. Nothing is aligned with the From address, so DMARC fails. The fix: a custom bounce domain (em.kade.lk) and DKIM signing with d=kade.lk.",
  },
  {
    n: "Same marketing email, set up properly",
    ip: "a bulk provider server",
    env: "bounces@em.kade.lk",
    from: "news@kade.lk",
    spf: ["pass", "em.kade.lk", "em.kade.lk points its SPF at the provider"],
    dkim: ["pass", "kade.lk"],
    x: "Now SPF passes for em.kade.lk (a subdomain, so it aligns under relaxed alignment) and DKIM passes for kade.lk. DMARC passes.",
  },
  {
    n: "Fake \"payments\" email from an attacker",
    ip: "203.0.113.200 (attacker)",
    env: "payments@kade.lk",
    from: "payments@kade.lk",
    spf: ["softfail", "kade.lk", "203.0.113.200 is not in kade.lk's SPF (~all)"],
    dkim: ["none", "-"],
    x: "The attacker can write any From address, but cannot send from Google's servers and does not have Kadé's private DKIM key. Nothing aligned passes.",
  },
  {
    n: "Order email forwarded by a shopper's university address",
    ip: "a university forwarding server",
    env: "orders@kade.lk",
    from: "orders@kade.lk",
    spf: ["softfail", "kade.lk", "the forwarder's IP is not in kade.lk's SPF"],
    dkim: ["pass", "kade.lk"],
    x: "Forwarding breaks SPF, but the message was not changed, so the DKIM signature still verifies. One aligned pass is enough: DMARC passes. This is why DKIM matters.",
  },
];

/** A check result: pass in ink with a check, a failure in red with a cross, nothing in faint ink. */
function Result({ r }: { r: string }) {
  if (r === "pass")
    return (
      <span className="text-ink inline-flex items-center gap-1.5 font-semibold">
        <IconCheck size={10} /> pass
      </span>
    );
  if (r === "none") return <span className="text-ink-faint">none</span>;
  return (
    <span className="text-fault inline-flex items-center gap-1.5 font-semibold">
      <IconX size={9} /> {r}
    </span>
  );
}

/** Will this email get through? SPF, DKIM and DMARC for five real situations. */
export function MailSim({ wide }: { wide?: boolean }) {
  const [cur, setCur] = useState("0");
  const [policy, setPolicy] = useState("quarantine");
  const e = EMAILS[Number(cur)];
  const aligned = (d: string) => d === "kade.lk" || d.endsWith(".kade.lk");
  const sa = e.spf[0] === "pass" && aligned(e.spf[1]);
  const da = e.dkim[0] === "pass" && aligned(e.dkim[1]);
  const ok = sa || da;
  const outcome = ok
    ? "Delivered to the inbox."
    : policy === "none"
      ? "Delivered anyway (policy none), and reported to dmarc@kade.lk."
      : policy === "quarantine"
        ? "Sent to the spam folder (policy quarantine)."
        : "Refused by the receiving server (policy reject). The shopper never sees it.";
  return (
    <WidgetFrame wide={wide} label="Will this email get through?">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Select label="Email" value={cur} onChange={setCur} options={EMAILS.map((x, i) => ({ value: String(i), label: x.n }))} />
        <Select
          label="kade.lk DMARC policy"
          value={policy}
          onChange={setPolicy}
          options={["none", "quarantine", "reject"].map((p) => ({ value: p, label: p }))}
        />
      </div>
      <div aria-live="polite">
        <dl className="mt-5 grid grid-cols-[minmax(0,180px)_minmax(0,1fr)] gap-x-6 gap-y-1 text-[15px]">
          <dt className="text-ink-muted">Sent from IP</dt>
          <dd className="text-ink font-mono text-[14px]">{e.ip}</dd>
          <dt className="text-ink-muted">Envelope sender</dt>
          <dd className="text-ink font-mono text-[14px]">{e.env}</dd>
          <dt className="text-ink-muted">Header From (seen)</dt>
          <dd className="text-ink font-mono text-[14px]">{e.from}</dd>
        </dl>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-ink border-b">
                {["Check", "Result", "For domain", "Aligned with kade.lk?", "Why"].map((h) => (
                  <th key={h} className="text-ink py-2 pr-4 text-[14px] font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[14.5px]">
              <tr className="border-rule border-b align-top">
                <td className="text-ink py-2 pr-4">SPF</td>
                <td className="py-2 pr-4"><Result r={e.spf[0]} /></td>
                <td className="text-ink py-2 pr-4 font-mono text-[13.5px]">{e.spf[1]}</td>
                <td className="text-ink py-2 pr-4">{e.spf[0] === "pass" ? (aligned(e.spf[1]) ? "yes" : "no") : "-"}</td>
                <td className="text-ink-body py-2 text-[13.5px]">{e.spf[2]}</td>
              </tr>
              <tr className="border-rule border-b align-top">
                <td className="text-ink py-2 pr-4">DKIM</td>
                <td className="py-2 pr-4"><Result r={e.dkim[0]} /></td>
                <td className="text-ink py-2 pr-4 font-mono text-[13.5px]">{e.dkim[1]}</td>
                <td className="text-ink py-2 pr-4">{e.dkim[0] === "pass" ? (aligned(e.dkim[1]) ? "yes" : "no") : "-"}</td>
                <td className="text-ink-body py-2 text-[13.5px]">
                  {e.dkim[0] === "none" ? "no signature at all" : "signature checked with the key at the signing domain"}
                </td>
              </tr>
              <tr className="border-rule border-b align-top">
                <td className="text-ink py-2 pr-4 font-bold">DMARC</td>
                <td className="py-2 pr-4"><Result r={ok ? "pass" : "fail"} /></td>
                <td className="text-ink py-2 pr-4 font-mono text-[13.5px]">kade.lk</td>
                <td className="text-ink py-2 pr-4">{ok ? "an aligned check passed" : "no aligned pass"}</td>
                <td className="text-ink-body py-2 text-[13.5px]">{e.x}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Outcome>{outcome}</Outcome>
        </div>
      </div>
    </WidgetFrame>
  );
}
