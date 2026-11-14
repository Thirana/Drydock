"use client";

import { useState, type ReactNode } from "react";
import { WidgetFrame } from "@/components/learn/widgets/widget-frame";
import { SegmentedControl } from "@/components/ui/controls";
import { cn } from "@/lib/utils";

/*
 * Four small figures for the home page, one per step of Kadé's request.
 * Each is drawn for this page in the course vocabulary (.dd-fig), with one
 * switch and one verdict, so a first visit sees the idea before the detail.
 * The facts are the chapters' own: addresses, ports, rules and TTLs.
 */

const HL = "url(#dd-ah-green)";
const MUTED = "url(#dd-ah-muted)";
const FAULT = "url(#dd-ah-fault)";

/** A box with a title and sub-lines; `role` marks it as source, destination or the hop in use. */
function Box({
  x,
  y,
  w,
  h,
  title,
  lines = [],
  role,
  dim,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines?: string[];
  role?: "src" | "dst" | "via";
  dim?: boolean;
}) {
  return (
    <g
      style={{ opacity: dim ? 0.4 : 1 }}
      className="transition-opacity duration-300"
    >
      <rect className={cn("n", role)} x={x} y={y} width={w} height={h} rx="2" />
      <text className="t" x={x + 14} y={y + 26}>
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={l} className="s" x={x + 14} y={y + 47 + i * 20}>
          {l}
        </text>
      ))}
    </g>
  );
}

/** A yellow mark behind the one value to notice. */
function Mark({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <rect
      x={x - 3}
      y={y - 14}
      width={w + 6}
      height={19}
      rx="2"
      style={{ fill: "var(--dd-mark)" }}
    />
  );
}

/** The frame, the switch, the drawing and the verdict under it. */
function Step<T extends string>({
  label,
  options,
  value,
  onChange,
  viewBox,
  children,
  verdict,
  broken,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  viewBox: string;
  children: ReactNode;
  verdict: ReactNode;
  /** The verdict names something broken. */
  broken?: boolean;
}) {
  return (
    <WidgetFrame wide label={label}>
      <SegmentedControl
        label={label}
        options={options}
        value={value}
        onChange={onChange}
      />
      <div className="dd-fig mt-5">
        <svg
          viewBox={viewBox}
          className="min-w-[600px] lg:min-w-0"
          role="img"
          aria-label={label}
        >
          {children}
        </svg>
      </div>
      <p
        aria-live="polite"
        className={cn(
          "border-rule mt-4 max-w-[64ch] border-t pt-4 text-[16px] leading-[1.55] font-semibold text-pretty",
          broken ? "text-fault" : "text-ink",
        )}
      >
        {verdict}
      </p>
    </WidgetFrame>
  );
}

// ── 1. DNS: Fundamentals 22 ─────────────────────────────────────────────────

type DnsState = "cold" | "cached" | "expired";

export function DnsStep() {
  const [s, setS] = useState<DnsState>("cold");
  const asked = {
    root: s === "cold",
    tld: s === "cold",
    auth: s !== "cached",
  };
  const note = {
    cold: ["cache empty"],
    cached: ["cached answer:", "34.120.88.10, 240 s left"],
    expired: ["answer expired after 300 s,", "referrals still cached"],
  }[s];
  const wire = (on: boolean, d: string) => (
    <path
      className={on ? "w hl" : "w dash"}
      d={d}
      markerEnd={on ? HL : MUTED}
    />
  );

  return (
    <Step
      label="Resolving api.kade.lk"
      value={s}
      onChange={setS}
      options={[
        { value: "cold", label: "First lookup" },
        { value: "cached", label: "A minute later" },
        { value: "expired", label: "Six minutes later" },
      ]}
      viewBox="0 0 700 300"
      verdict={
        {
          cold: "Three servers asked before the laptop gets 34.120.88.10. Each one only knows who to ask next.",
          cached:
            "No servers asked. The resolver answers from its cache, for the rest of the record's 300 s TTL.",
          expired:
            "One server asked. The answer has expired but the referrals have not, so the resolver goes straight to Cloud DNS.",
        }[s]
      }
    >
      <Box
        x={16}
        y={110}
        w={160}
        h={70}
        title="Laptop"
        lines={["192.168.1.23"]}
        role="src"
      />
      <path className="w hl" d="M176 145 H267" markerEnd={HL} />
      <text className="s mid" x="221" y="100">
        api.kade.lk?
      </text>
      <Box
        x={270}
        y={110}
        w={200}
        h={70}
        title="Resolver"
        lines={["your ISP's"]}
        role="via"
      />
      {note.map((l, i) => (
        <text key={l} className="s" x="270" y={208 + i * 20}>
          {l}
        </text>
      ))}

      {wire(asked.root, "M470 128 H492 V46 H513")}
      {wire(asked.tld, "M470 145 H513")}
      {wire(asked.auth, "M470 162 H492 V246 H513")}
      <Box
        x={516}
        y={16}
        w={170}
        h={62}
        title="Root server"
        lines={["refers to .lk"]}
        dim={!asked.root}
      />
      <Box
        x={516}
        y={114}
        w={170}
        h={62}
        title=".lk server"
        lines={["refers to kade.lk"]}
        dim={!asked.tld}
      />
      <Box
        x={516}
        y={214}
        w={170}
        h={80}
        title="Cloud DNS"
        lines={["34.120.88.10", "TTL 300"]}
        role="dst"
        dim={!asked.auth}
      />
    </Step>
  );
}

// ── 2. NAT: Fundamentals 10 ─────────────────────────────────────────────────

export function NatStep() {
  const [dir, setDir] = useState<"out" | "back">("out");
  const out = dir === "out";
  const lan = "192.168.1.23:52814";
  const wan = "203.0.113.45:40001";
  const far = "34.120.88.10:443";
  // Each packet as two lines; the rewritten value carries the mark.
  const packet = (x: number, src: string, dst: string, mark: "src" | "dst") => (
    <g>
      <Mark
        x={x + 34}
        y={mark === "src" ? 36 : 58}
        w={(mark === "src" ? src : dst).length * 8.6}
      />
      <text className="f" x={x} y="36" style={{ fontSize: "12.5px" }}>
        src
      </text>
      <text className="s" x={x + 34} y="36">
        {src}
      </text>
      <text className="f" x={x} y="58" style={{ fontSize: "12.5px" }}>
        dst
      </text>
      <text className="s" x={x + 34} y="58">
        {dst}
      </text>
    </g>
  );

  return (
    <Step
      label="NAT at the home router"
      value={dir}
      onChange={setDir}
      options={[
        { value: "out", label: "Going out" },
        { value: "back", label: "Coming back" },
      ]}
      viewBox="0 0 700 280"
      verdict={
        out
          ? "The router swaps the private source for its own public address and a free port, 40001, and writes the pair down."
          : "The reply comes back to 203.0.113.45:40001. The router finds port 40001 in its table and hands the packet to the laptop."
      }
    >
      {out ? packet(16, lan, far, "src") : packet(16, far, lan, "dst")}
      {out ? packet(470, wan, far, "src") : packet(470, far, wan, "dst")}
      <Box
        x={16}
        y={110}
        w={170}
        h={70}
        title="Laptop"
        lines={["192.168.1.23"]}
        role="src"
      />
      <Box
        x={262}
        y={96}
        w={200}
        h={98}
        title="Home router"
        lines={["LAN 192.168.1.1", "WAN 203.0.113.45"]}
        role="via"
      />
      <Box
        x={530}
        y={110}
        w={154}
        h={70}
        title="Load balancer"
        lines={["34.120.88.10"]}
        role="dst"
      />
      {out ? (
        <>
          <path className="w hl" d="M186 145 H259" markerEnd={HL} />
          <path className="w hl" d="M462 145 H527" markerEnd={HL} />
        </>
      ) : (
        <>
          <path className="w hl" d="M527 145 H465" markerEnd={HL} />
          <path className="w hl" d="M262 145 H189" markerEnd={HL} />
        </>
      )}
      <text className="s" x="262" y="228">
        NAT table
      </text>
      <text className="t" x="262" y="252">
        {lan} ↔ {wan}
      </text>
    </Step>
  );
}

// ── 3. Health checks: GCP 12.1 ──────────────────────────────────────────────

type LbState = "ok" | "one" | "blocked";

export function LbStep() {
  const [s, setS] = useState<LbState>("ok");
  const healthy = { a: s === "ok", b: s !== "blocked" };
  const vm = (y: number, name: string, ip: string, up: boolean, d: string) => (
    <>
      <path
        className={up ? "w hl" : "w fault dash"}
        d={d}
        markerEnd={up ? HL : FAULT}
      />
      <Box
        x={530}
        y={y}
        w={154}
        h={84}
        title={name}
        lines={[ip, up ? "healthy" : "unhealthy"]}
        role={up ? "dst" : undefined}
      />
      {!up && <circle className="bad" cx={668} cy={y + 64} r="5" />}
    </>
  );

  return (
    <Step
      label="Load balancer health checks"
      value={s}
      onChange={setS}
      options={[
        { value: "ok", label: "Both healthy" },
        { value: "one", label: "kade-api-1 fails" },
        { value: "blocked", label: "Probes blocked" },
      ]}
      viewBox="0 0 700 280"
      broken={s === "blocked"}
      verdict={
        {
          ok: "Both VMs answer the health check, so requests are spread across the two.",
          one: "kade-api-1 fails its check, so every request goes to kade-api-2 until it recovers. Shoppers notice nothing.",
          blocked:
            "A firewall clean-up removed the rule for the probes' range, 35.191.0.0/16. Both VMs look unhealthy while the app is fine, and the load balancer has nowhere to send anything. Kadé's shop was down for twenty minutes.",
        }[s]
      }
    >
      <Box
        x={16}
        y={107}
        w={150}
        h={66}
        title="Shopper"
        lines={["api.kade.lk"]}
        role="src"
      />
      <path className="w hl" d="M166 140 H227" markerEnd={HL} />
      <Box
        x={230}
        y={92}
        w={200}
        h={96}
        title="Load balancer"
        lines={["34.120.88.10:443", "checks /healthz"]}
        role="via"
      />
      {s === "blocked" && (
        <>
          <text className="s" x="230" y="222">
            probes from 35.191.0.0/16
          </text>
          <text className="s" x="230" y="242">
            dropped by the firewall
          </text>
        </>
      )}
      {vm(
        24,
        "kade-api-1",
        "10.10.1.10:8080",
        healthy.a,
        "M430 122 H480 V66 H527",
      )}
      {vm(
        172,
        "kade-api-2",
        "10.10.1.11:8080",
        healthy.b,
        "M430 158 H480 V214 H527",
      )}
    </Step>
  );
}

// ── 4. Firewall: GCP 5.1, the rules after the clean-up ──────────────────────

type FwState = "lb" | "db" | "ssh";

const FW_RULES = [
  {
    name: "kade-allow-icmp",
    sub: "icmp from home, office",
    hit: [] as FwState[],
  },
  { name: "kade-icmp-internal", sub: "icmp from 10.10.0.0/16", hit: [] },
  {
    name: "kade-lb-to-api",
    sub: "tcp:8080 from 35.191.0.0/16 +1",
    hit: ["lb"],
  },
  { name: "kade-allow-ssh", sub: "tcp:22 from 0.0.0.0/0", hit: ["ssh"] },
  { name: "implied deny", sub: "everything else · 65535", hit: ["db"] },
] satisfies { name: string; sub: string; hit: FwState[] }[];

export function FwStep() {
  const [s, setS] = useState<FwState>("lb");
  const sender =
    s === "lb"
      ? { title: "Load balancer", ip: "35.191.8.20", port: "tcp:8080" }
      : {
          title: "Internet scanner",
          ip: "203.0.113.99",
          port: s === "db" ? "tcp:5432" : "tcp:22",
        };
  const hitAt = FW_RULES.findIndex((r) => (r.hit as FwState[]).includes(s));
  const allowed = s !== "db";

  return (
    <Step
      label="A packet against kade-api-1's firewall rules"
      value={s}
      onChange={setS}
      options={[
        { value: "lb", label: "Load balancer, :8080" },
        { value: "db", label: "Scanner, :5432" },
        { value: "ssh", label: "Scanner, :22" },
      ]}
      viewBox="0 0 700 300"
      broken={s === "ssh"}
      verdict={
        {
          lb: "kade-lb-to-api matches: Google's load balancer may reach port 8080. Allowed.",
          db: "Nothing allows tcp:5432 from the internet, so the implied deny at priority 65535 drops it.",
          ssh: "kade-allow-ssh lets anyone on the internet try SSH. Allowed, and that is a problem: chapter 6.1 closes it with IAP.",
        }[s]
      }
    >
      <Box
        x={16}
        y={115}
        w={170}
        h={70}
        title={sender.title}
        lines={[sender.ip]}
        role="src"
      />
      <path className="w hl" d="M186 150 H217" markerEnd={HL} />
      <text className="s mid" x="101" y="104">
        {sender.port}
      </text>

      <rect
        className="zone teal"
        x="220"
        y="12"
        width="330"
        height="276"
        rx="2"
      />
      <text className="s" x="236" y="34">
        kade-vpc firewall · checked in order
      </text>
      {FW_RULES.map((r, i) => {
        const y = 66 + i * 46;
        const hit = i === hitAt;
        const after = i > hitAt;
        return (
          <g
            key={r.name}
            style={{ opacity: after ? 0.4 : 1 }}
            className="transition-opacity duration-300"
          >
            {hit && (
              <rect
                x="230"
                y={y - 20}
                width="310"
                height="44"
                rx="2"
                style={{ fill: "var(--dd-mark)" }}
              />
            )}
            <text className="t" x="240" y={y}>
              {r.name}
            </text>
            <text className="s" x="240" y={y + 18}>
              {r.sub}
            </text>
            <text
              className={hit ? "t" : "f"}
              x="528"
              y={y}
              style={{
                textAnchor: "end",
                fill:
                  hit && r.name === "implied deny"
                    ? "var(--dd-fault)"
                    : undefined,
              }}
            >
              {hit
                ? r.name === "implied deny"
                  ? "deny"
                  : "allow"
                : after
                  ? ""
                  : "no"}
            </text>
          </g>
        );
      })}

      <path
        className={allowed ? "w hl" : "w fault dash"}
        d="M550 150 H587"
        markerEnd={allowed ? HL : FAULT}
      />
      {!allowed && (
        <text className="x" x="562" y="140">
          ✕
        </text>
      )}
      <Box
        x={590}
        y={115}
        w={104}
        h={70}
        title="kade-api-1"
        lines={["10.10.1.10"]}
        role={allowed ? "dst" : undefined}
      />
    </Step>
  );
}
