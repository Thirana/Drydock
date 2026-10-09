"use client";

import { useState } from "react";
import { IconCheck, IconX } from "@/components/ui/icons";
import { v6compress, v6expand, v6type } from "@/lib/net/ipv6";
import { cn } from "@/lib/utils";
import { Field, FieldError } from "./field";
import { HeaderLayout } from "./headers";
import { Choices, KeyValues, Select, WidgetNote } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Chapters 30 and 31: IPv6 addresses in every spelling, EUI-64 interface
 * IDs, the IPv6 header, and who can reach a server depending on its bind
 * address, the firewall and the router.
 */

const V6_EXAMPLES = [
  "2001:0db8:0000:0000:0000:ff00:0042:8329",
  "fe80::a683:e7ff:fe2b:910c",
  "ff02::1",
  "::1",
  "fd12:3456:789a:1::10",
  "::ffff:c0a8:117",
  "2001:db8:5c00:1:8a2f:31c4:77be:d201",
];

/** Expand, shorten and classify an IPv6 address; see its 64 + 64 bits. */
export function V6Tool({ wide }: { wide?: boolean }) {
  const [value, setValue] = useState(V6_EXAMPLES[0]);
  const groups = v6expand(value);
  return (
    <WidgetFrame wide={wide} label="IPv6 address tool">
      <Choices
        label="Examples"
        value={V6_EXAMPLES.includes(value.trim()) ? value.trim() : null}
        onChange={setValue}
        options={V6_EXAMPLES.map((x) => ({ value: x, label: x.length > 24 ? `${x.slice(0, 22)}…` : x }))}
      />
      <div className="mt-4">
        <Field label="IPv6 address" value={value} onChange={setValue} invalid={!groups} describedBy="v6-error" long />
      </div>
      <div className="mt-6" aria-live="polite">
        {!groups ? (
          <FieldError id="v6-error">
            Not a valid IPv6 address. Check for 8 groups of up to 4 hex digits, and at most one ::.
          </FieldError>
        ) : (
          <>
            <KeyValues
              items={[
                ["Full form", groups.join(":")],
                ["Short form", <b key="s">{v6compress(groups)}</b>],
                ["Type", <><b key="t">{v6type(groups)[0]}</b> · {v6type(groups)[1]}</>, true],
              ]}
            />
            <ol className="mt-4 grid min-w-[640px] grid-cols-8 gap-1.5 overflow-x-auto">
              {groups.map((x, i) => (
                <li
                  key={i}
                  className={cn(
                    "grid justify-items-center rounded-[2px] border px-1 py-2",
                    i < 4 ? "border-teal bg-teal-soft" : "border-rule-strong bg-mark",
                  )}
                >
                  <span className="text-ink font-mono text-[16px] font-semibold">{x}</span>
                  <span className="text-ink-muted font-mono text-[9.5px] leading-[1.3]">
                    {parseInt(x, 16).toString(2).padStart(16, "0").replace(/(\d{4})(?=\d)/g, "$1 ")}
                  </span>
                </li>
              ))}
            </ol>
            <WidgetNote>
              Teal: the first 64 bits (network prefix of a /64). Highlighted: the last 64 bits (interface ID). Each group
              is 16 bits.
            </WidgetNote>
          </>
        )}
      </div>
    </WidgetFrame>
  );
}

/** From a MAC to an EUI-64 interface ID, step by step. */
export function EuiTool({ wide }: { wide?: boolean }) {
  const [value, setValue] = useState("a4:83:e7:2b:91:0c");
  const m = value.trim().toLowerCase().replace(/-/g, ":");
  const ok = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/.test(m);
  let rows: [string, React.ReactNode][] = [];
  if (ok) {
    const b = m.split(":").map((x) => parseInt(x, 16));
    const f = b[0] ^ 2;
    const e = [f, b[1], b[2], 0xff, 0xfe, b[3], b[4], b[5]];
    const iid = [0, 2, 4, 6].map((i) => ((e[i] << 8) | e[i + 1]).toString(16)).join(":");
    const bin = (x: number) => x.toString(2).padStart(8, "0");
    rows = [
      ["Split the MAC in half", `${m.slice(0, 8)} | ${m.slice(9)}`],
      ["Insert ff:fe in the middle (48 → 64 bits)", <>{m.slice(0, 8)}:<b>ff:fe</b>:{m.slice(9)}</>],
      ["Flip bit 7 of the first byte (the U/L bit, chapter 7)", <>{bin(b[0])} → {bin(f)} · {b[0].toString(16).padStart(2, "0")} → <b>{f.toString(16).padStart(2, "0")}</b></>],
      ["Interface ID (4 groups)", <b key="i">{iid}</b>],
      ["Link-local address", `fe80::${iid}`],
      ["Global address on the staff /64 (if EUI-64 were used)", `2001:db8:5c00:1:${iid}`],
    ];
  }
  return (
    <WidgetFrame wide={wide} label="EUI-64 from a MAC address">
      <Field label="MAC address" value={value} onChange={setValue} invalid={!ok} describedBy="eui-error" />
      <div className="mt-6 overflow-x-auto" aria-live="polite">
        {!ok ? (
          <FieldError id="eui-error">Enter a MAC like a4:83:e7:2b:91:0c</FieldError>
        ) : (
          <>
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-ink border-b">
                  {["#", "Step", "Result"].map((h) => (
                    <th key={h} className="text-ink py-2 pr-4 text-[14px] font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([step, result], i) => (
                  <tr key={step} className="border-rule border-b align-top">
                    <td className="text-ink-faint py-2 pr-4 font-mono text-[13px]">{i + 1}</td>
                    <td className="text-ink py-2 pr-4 text-[15px]">{step}</td>
                    <td className="text-ink py-2 font-mono text-[14px]">{result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <WidgetNote>
              Anyone who sees the global address can read your MAC back out of it, on every network you join. That is why
              laptops and phones use random interface IDs for global addresses.
            </WidgetNote>
          </>
        )}
      </div>
    </WidgetFrame>
  );
}

export function V6Header({ wide }: { wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label="The IPv6 header">
      <HeaderLayout
        rows={[
          ["bytes 0-3", [
            { name: "Ver", size: "4", bits: 4 },
            { name: "Traffic class", size: "8", bits: 8 },
            { name: "Flow label", size: "20", bits: 20 },
          ]],
          ["bytes 4-7", [
            { name: "Payload length", size: "16", bits: 16 },
            { name: "Next header", size: "8", bits: 8 },
            { name: "Hop limit", size: "8", bits: 8 },
          ]],
          ["bytes 8-23", [{ name: "Source address", size: "128 bits (4 rows)", bits: 32, tall: true }]],
          ["bytes 24-39", [{ name: "Destination address", size: "128 bits (4 rows)", bits: 32, tall: true }]],
          ["then", [{ name: "Extension headers (optional), then TCP / UDP / ICMPv6", size: "", bits: 32, dashed: true }]],
        ]}
      />
      <WidgetNote>
        Compare chapter 12’s IPv4 header: no IHL (always 40 bytes), no ID/flags/offset (no router fragmentation), no
        checksum, and no options in the main header. The addresses take 32 of the 40 bytes.
      </WidgetNote>
    </WidgetFrame>
  );
}

type Reach = "ok" | "refused" | "timed out";

/** Who can reach the dev server: it depends on the bind address, the firewall and the router. */
export function BindSim({ wide }: { wide?: boolean }) {
  const [bind, setBind] = useState("127.0.0.1:3000");
  const [fw, setFw] = useState(false);
  const [pf, setPf] = useState(false);
  const b = bind.split(":")[0];
  const lo = b === "127.0.0.1";
  const ip = b === "192.168.1.23";
  const any = b === "0.0.0.0";
  const rows: [string, Reach, string][] = [
    [
      "Browser on the laptop → localhost:3000",
      lo || any ? "ok" : "refused",
      lo || any ? "127.0.0.1 is covered by this bind address" : "Nothing listens on 127.0.0.1:3000, so the OS answers RST",
    ],
    [
      "Browser on the laptop → 192.168.1.23:3000",
      ip || any ? "ok" : "refused",
      ip || any ? "The laptop's own firewall does not filter its own traffic" : "The server only listens on 127.0.0.1",
    ],
    [
      "Your phone on the same WiFi → 192.168.1.23:3000",
      !fw ? "timed out" : lo ? "refused" : "ok",
      !fw
        ? "The laptop firewall silently drops it before the OS sees it"
        : lo
          ? "The firewall lets it in, but nothing listens on the WiFi address"
          : "Reaches the laptop and the firewall lets it in",
    ],
    [
      "A friend on the internet → 203.0.113.45:3000",
      !(pf && fw) ? "timed out" : lo ? "refused" : "ok",
      !pf
        ? "The router has no NAT row or forward for it: dropped (chapter 10)"
        : !fw
          ? "Forwarded, then dropped by the laptop firewall"
          : lo
            ? "Forwarded and allowed, but nothing listens on the WiFi address"
            : "Forwarded by the router, allowed by the firewall. Your dev server is now public: be careful.",
    ],
  ];
  const check = (label: string, value: boolean, set: (v: boolean) => void) => (
    <label className="text-ink-body flex cursor-pointer items-center gap-2.5 text-[15px]">
      <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} className="accent-ink size-4" />
      {label}
    </label>
  );
  return (
    <WidgetFrame wide={wide} label="Who can reach the dev server?">
      <Select
        label="The dev server listens on"
        value={bind}
        onChange={setBind}
        options={["127.0.0.1:3000", "192.168.1.23:3000", "0.0.0.0:3000"].map((x) => ({ value: x, label: x }))}
      />
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {check("laptop firewall allows port 3000", fw, setFw)}
        {check("home router forwards port 3000 to the laptop", pf, setPf)}
      </div>
      <div className="mt-5 overflow-x-auto" aria-live="polite">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-ink border-b">
              {["Who connects", "Result", "Why"].map((h) => (
                <th key={h} className="text-ink py-2 pr-4 text-[14px] font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([who, r, why]) => (
              <tr key={who} className="border-rule border-b align-top">
                <td className="text-ink py-2 pr-4 text-[15px]">{who}</td>
                <td className="py-2 pr-4 text-[14.5px] whitespace-nowrap">
                  {r === "ok" ? (
                    <span className="text-ink inline-flex items-center gap-1.5 font-semibold"><IconCheck size={10} /> ok</span>
                  ) : (
                    <span className="text-fault inline-flex items-center gap-1.5 font-semibold"><IconX size={9} /> {r}</span>
                  )}
                </td>
                <td className="text-ink-body py-2 text-[14px]">{why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetFrame>
  );
}
