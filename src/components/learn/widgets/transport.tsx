"use client";

import { useId, useState } from "react";
import { fmt } from "@/lib/net/bytes";
import { cn } from "@/lib/utils";
import { Field, FieldError } from "./field";
import { Action, Choices, KeyValues, Select, WidgetNote } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Chapters 14 to 19: what UDP does not promise, how big a segment can be,
 * how much must be in flight, and the window that slides as ACKs arrive.
 */

interface Arrival {
  n: number;
  t: number;
  dup?: boolean;
  ooo?: boolean;
}

/** Send 12 datagrams over a lossy network and see what UDP does not tell you. */
export function UdpSim({ wide }: { wide?: boolean }) {
  const [loss, setLoss] = useState(15);
  const [res, setRes] = useState<{ arr: Arrival[]; lost: number[]; ooo: number; dups: number } | null>(null);
  const lossId = useId();

  function run() {
    const arr: Arrival[] = [];
    const lost: number[] = [];
    for (let i = 1; i <= 12; i++) {
      if (Math.random() * 100 < loss) {
        lost.push(i);
        continue;
      }
      let t = i * 20 + Math.random() * 25;
      if (Math.random() < 0.3) t += 25 + Math.random() * 60;
      arr.push({ n: i, t });
      if (Math.random() < 0.06) arr.push({ n: i, t: t + 10 + Math.random() * 30, dup: true });
    }
    arr.sort((a, b) => a.t - b.t);
    let max = 0;
    let ooo = 0;
    for (const a of arr) {
      if (a.dup) continue;
      if (a.n < max) {
        a.ooo = true;
        ooo++;
      }
      max = Math.max(max, a.n);
    }
    setRes({ arr, lost, ooo, dups: arr.filter((a) => a.dup).length });
  }

  const cell = "grid size-9 shrink-0 place-items-center rounded-[2px] border font-mono text-[13px]";
  return (
    <WidgetFrame wide={wide} label="UDP over a lossy network">
      <div className="grid max-w-[360px] gap-1.5">
        <label htmlFor={lossId} className="text-ink-muted text-[14px]">
          Network loss: <b className="text-ink">{loss}%</b>
        </label>
        <input
          id={lossId}
          type="range"
          min={0}
          max={50}
          value={loss}
          onChange={(e) => setLoss(Number(e.target.value))}
          className="accent-ink"
        />
      </div>
      <div className="mt-4">
        <Action primary onClick={run}>
          Send 12 datagrams
        </Action>
      </div>
      <div className="mt-5" aria-live="polite">
        {!res ? (
          <WidgetNote>Press Send.</WidgetNote>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-ink-muted w-16 font-mono text-[12.5px]">sent</span>
                {Array.from({ length: 12 }, (_, i) => (
                  <span
                    key={i}
                    className={cn(cell, res.lost.includes(i + 1) ? "border-fault text-fault line-through" : "border-ink-faint text-ink")}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-ink-muted w-16 font-mono text-[12.5px]">arrived</span>
                {res.arr.length ? (
                  res.arr.map((a, i) => (
                    <span
                      key={i}
                      className={cn(
                        cell,
                        a.dup ? "border-ink-faint text-ink border-dashed" : a.ooo ? "border-ink bg-mark text-ink font-bold" : "border-ink-faint text-ink",
                      )}
                    >
                      {a.n}
                    </span>
                  ))
                ) : (
                  <span className="text-fault text-[14px]">nothing</span>
                )}
              </div>
            </div>
            <ul className="text-ink-muted mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[14px]">
              <li>lost (struck through): {res.lost.length}</li>
              <li>out of order (highlighted): {res.ooo}</li>
              <li>duplicate (dashed): {res.dups}</li>
            </ul>
            <p className="text-ink-body mt-3 text-[15.5px] leading-[1.55] text-pretty">
              UDP reported <b className="text-ink">no errors</b>: it has no idea anything went wrong. A{" "}
              <b className="text-ink">voice call</b> would play what arrived in time and skip the gaps (a short glitch). A{" "}
              <b className="text-ink">file or an order</b> would be broken, unless the app adds its own sequence numbers
              and resends, or uses TCP.
            </p>
          </>
        )}
      </div>
    </WidgetFrame>
  );
}

/** From the link's MTU down to the data in each segment, and how many segments a send takes. */
export function MssCalc({ wide }: { wide?: boolean }) {
  const [mtu, setMtu] = useState("1500");
  const [tunnel, setTunnel] = useState("0");
  const [ip, setIp] = useState("20");
  const [ts, setTs] = useState("12");
  const [size, setSize] = useState("4000");
  const errorId = useId();
  const sz = parseInt(size, 10);
  const eff = Number(mtu) - Number(tunnel);
  const mss = eff - Number(ip) - 20;
  const per = mss - Number(ts);
  const n = Math.ceil(sz / per);
  const wire = sz + n * (Number(ip) + 20 + Number(ts));
  return (
    <WidgetFrame wide={wide} label="MSS calculator">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Select
          label="Link MTU"
          value={mtu}
          onChange={setMtu}
          options={[
            { value: "1500", label: "1,500 · Ethernet / WiFi" },
            { value: "1492", label: "1,492 · PPPoE fibre/DSL" },
            { value: "1460", label: "1,460 · GCP VPC default" },
            { value: "8896", label: "8,896 · GCP jumbo" },
          ]}
        />
        <Select
          label="Tunnel"
          value={tunnel}
          onChange={setTunnel}
          options={[
            { value: "0", label: "none" },
            { value: "60", label: "WireGuard (60)" },
            { value: "73", label: "IPsec, typical (~73)" },
            { value: "24", label: "GRE (24)" },
          ]}
        />
        <Select
          label="IP version"
          value={ip}
          onChange={setIp}
          options={[
            { value: "20", label: "IPv4 (20-byte header)" },
            { value: "40", label: "IPv6 (40-byte header)" },
          ]}
        />
        <Select
          label="TCP timestamps"
          value={ts}
          onChange={setTs}
          options={[
            { value: "12", label: "on (12 bytes)" },
            { value: "0", label: "off" },
          ]}
        />
        <Field label="Data to send (bytes)" value={size} onChange={setSize} short inputMode="numeric" invalid={!(sz > 0)} describedBy={errorId} />
      </div>
      <div className="mt-6" aria-live="polite">
        {!(sz > 0) ? (
          <FieldError id={errorId}>Enter a size in bytes, like 4000.</FieldError>
        ) : (
          <KeyValues
            items={[
              ["Usable MTU inside the tunnel", `${fmt(Number(mtu))} − ${tunnel} = ${fmt(eff)}`],
              ["MSS announced", <>{fmt(eff)} − {ip} (IP) − 20 (TCP) = <b key="m">{fmt(mss)}</b></>],
              ["Data per full segment", `${fmt(mss)} − ${ts} (options) = ${fmt(per)}`],
              ["Segments needed", <>{fmt(sz)} ÷ {fmt(per)} → <b key="n">{n}</b></>],
              ["Bytes in IP packets", `${fmt(wire)} (headers are ${(((wire - sz) / wire) * 100).toFixed(1)}%)`],
            ]}
          />
        )}
      </div>
    </WidgetFrame>
  );
}

const PATHS: [string, number, number][] = [
  ["Home → kade-api", 100, 41],
  ["kade-api → kade-db (same zone)", 10000, 0.2],
  ["Office → a US region", 100, 250],
  ["Singapore → Iowa (GCP)", 10000, 190],
];

/** How much data must be in flight to keep a link busy, and whether a 64 KB window is enough. */
export function BdpCalc({ wide }: { wide?: boolean }) {
  const [bw, setBw] = useState("100");
  const [rtt, setRtt] = useState("41");
  const errorId = useId();
  const b = parseFloat(bw);
  const r = parseFloat(rtt);
  const ok = b > 0 && r > 0;
  const bdp = (((b * 1e6) / 8) * r) / 1000;
  const cap = (65535 * 8) / (r / 1000) / 1e6;
  const shift = Math.max(0, Math.ceil(Math.log2(bdp / 65535)));
  const kb = (x: number) => (x >= 1048576 ? `${(x / 1048576).toFixed(1)} MB` : `${(x / 1024).toFixed(0)} KB`);
  return (
    <WidgetFrame wide={wide} label="Bandwidth-delay product">
      <Choices
        label="Paths"
        value={PATHS.find(([, x, y]) => String(x) === bw && String(y) === rtt)?.[0] ?? null}
        onChange={(name) => {
          const p = PATHS.find(([n]) => n === name)!;
          setBw(String(p[1]));
          setRtt(String(p[2]));
        }}
        options={PATHS.map(([n]) => ({ value: n, label: n }))}
      />
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3">
        <Field label="Bandwidth (Mbit/s)" value={bw} onChange={setBw} short inputMode="numeric" invalid={!ok} describedBy={errorId} />
        <Field label="Round-trip time (ms)" value={rtt} onChange={setRtt} short inputMode="numeric" invalid={!ok} describedBy={errorId} />
      </div>
      <div className="mt-6" aria-live="polite">
        {!ok ? (
          <FieldError id={errorId}>Enter positive numbers.</FieldError>
        ) : (
          <KeyValues
            items={[
              ["Bandwidth-delay product", <><b key="b">{kb(bdp)}</b> must be in flight to fill the link</>],
              ["Best speed with a 64 KB window", cap >= b ? `${b} Mbit/s (the window is not the limit)` : <><b key="c">{cap.toFixed(1)} Mbit/s</b> of {b}</>],
              ["Window scale shift needed", `${shift} (× ${2 ** shift})`],
            ]}
          />
        )}
      </div>
    </WidgetFrame>
  );
}

/** The sender's window: send, deliver, read, and watch it slide (or close). */
export function SlideWin({ wide }: { wide?: boolean }) {
  const N = 16;
  const CAP = 8;
  const start = { una: 0, nxt: 0, unread: 0, win: CAP, log: "The laptop may send up to 8 pieces (the advertised window)." };
  const [s, setS] = useState(start);

  function act(a: "send" | "ack" | "read" | "reset") {
    setS((p) => {
      if (a === "reset") return start;
      if (a === "send") {
        if (p.nxt >= N) return { ...p, log: "All 16 pieces have been sent." };
        if (p.nxt - p.una >= p.win)
          return {
            ...p,
            log:
              p.win === 0
                ? "Window is 0. The laptop may not send. It waits and sends window probes until kade-api reports free space."
                : "Window used up. The laptop must wait for ACKs before sending more.",
          };
        return { ...p, nxt: p.nxt + 1, log: `Piece ${p.nxt + 1} sent. It is in flight until acknowledged.` };
      }
      if (a === "ack") {
        if (p.nxt === p.una) return { ...p, log: "Nothing in flight to deliver." };
        const una = p.una + 1;
        const unread = p.unread + 1;
        const win = CAP - unread;
        return {
          ...p,
          una,
          unread,
          win,
          log: `Piece ${una} arrived and waits in the buffer. ACK says: next is ${una + 1}, window ${win}.${win === 0 ? " Zero window: stop!" : ""} The window slid right by one.`,
        };
      }
      if (!p.unread) return { ...p, log: "The buffer is empty; nothing to read." };
      const k = Math.min(2, p.unread);
      const unread = p.unread - k;
      return { ...p, unread, win: CAP - unread, log: `The app read ${k}. kade-api sends a window update: window ${CAP - unread}. The laptop may send again.` };
    });
  }

  return (
    <WidgetFrame wide={wide} label="The sliding window">
      <p className="text-ink-muted mb-1.5 font-mono text-[12.5px]">laptop’s upload: 16 pieces</p>
      <ol className="grid min-w-[620px] grid-cols-16 gap-[3px]">
        {Array.from({ length: N }, (_, i) => (
          <li
            key={i}
            className={cn(
              "grid h-10 place-items-center rounded-[2px] border font-mono text-[12.5px]",
              i < s.una && "border-green bg-green-soft text-ink",
              i >= s.una && i < s.nxt && "border-amber bg-amber-soft text-ink",
              i >= s.nxt && i < s.una + s.win && "border-teal text-ink border-dashed",
              i >= s.una + s.win && i >= s.nxt && "border-rule text-ink-faint",
            )}
          >
            {i + 1}
          </li>
        ))}
      </ol>
      <ul className="text-ink-muted mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px]">
        <li className="inline-flex items-center gap-2"><span aria-hidden="true" className="border-green bg-green-soft inline-block size-3 rounded-[2px] border" />sent + ACKed</li>
        <li className="inline-flex items-center gap-2"><span aria-hidden="true" className="border-amber bg-amber-soft inline-block size-3 rounded-[2px] border" />in flight</li>
        <li className="inline-flex items-center gap-2"><span aria-hidden="true" className="border-teal inline-block size-3 rounded-[2px] border border-dashed" />may send now</li>
        <li className="inline-flex items-center gap-2"><span aria-hidden="true" className="border-rule inline-block size-3 rounded-[2px] border" />must wait</li>
      </ul>
      <p className="text-ink-muted mt-4 mb-1.5 font-mono text-[12.5px]">kade-api’s receive buffer (8 pieces) · filled = waiting for the app</p>
      <ol className="flex gap-[3px]">
        {Array.from({ length: CAP }, (_, i) => (
          <li key={i} className={cn("h-6 w-8 rounded-[2px] border", i < s.unread ? "border-ink bg-ink-faint" : "border-rule")} />
        ))}
      </ol>
      <p className="text-ink-muted mt-3 flex flex-wrap gap-x-6 font-mono text-[13px]">
        <span>in flight: <b className="text-ink">{s.nxt - s.una}</b></span>
        <span>advertised window: <b className="text-ink">{s.win}</b></span>
        <span>unread in buffer: <b className="text-ink">{s.unread}</b></span>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Action primary onClick={() => act("send")}>Laptop sends 1 piece</Action>
        <Action onClick={() => act("ack")}>Network delivers 1 + ACK</Action>
        <Action onClick={() => act("read")}>App reads 2 pieces</Action>
        <Action onClick={() => act("reset")}>Reset</Action>
      </div>
      <p className="text-ink mt-3 min-h-6 text-[15.5px] font-semibold text-pretty" aria-live="polite">
        {s.log}
      </p>
    </WidgetFrame>
  );
}
