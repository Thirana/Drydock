"use client";

import { Fragment, useId, useState } from "react";
import { bytesOf } from "@/lib/net/bytes";
import { ipError, ipToInt } from "@/lib/net/ipv4";
import { cn } from "@/lib/utils";
import { Field, FieldError } from "./field";
import { KeyValues } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Packet headers two ways: as the 32-bit layout the RFCs draw, and as the
 * bytes on the wire with each field labelled. Fields are separated by rules
 * and alternating ground, not colour: the names say what they are.
 */

interface HeaderField {
  name: string;
  size: string;
  /** Width in bits, out of 32 per row. */
  bits: number;
  /** Optional or variable: drawn dashed. */
  dashed?: boolean;
  /** The data after the header: drawn taller. */
  tall?: boolean;
}

/** A header as rows of 32 bits, with a bit ruler on top. */
export function HeaderLayout({ rows }: { rows: [label: string, fields: HeaderField[]][] }) {
  return (
    <div className="grid min-w-[760px] grid-cols-[84px_repeat(32,minmax(0,1fr))] gap-y-1">
      <span className="text-ink-faint font-mono text-[11px]">bit →</span>
      {Array.from({ length: 32 }, (_, i) => (
        <span key={i} className="text-ink-faint text-center font-mono text-[10.5px]">
          {i % 8 === 0 || i === 31 ? i : ""}
        </span>
      ))}
      {rows.map(([label, fields]) => (
        <Fragment key={label}>
          <span className="text-ink-faint self-center font-mono text-[11.5px]">{label}</span>
          {fields.map((f) => (
            <span
              key={f.name}
              style={{ gridColumn: `span ${f.bits}` }}
              className={cn(
                "border-ink-faint bg-ground -ml-px grid content-center justify-items-center border px-1 text-center first-of-type:ml-0",
                f.tall ? "bg-sunk py-4" : "py-2",
                f.dashed && "border-dashed",
              )}
            >
              <span className={cn("text-ink leading-[1.25] font-semibold", f.bits <= 2 ? "text-[10.5px]" : "text-[13px]")}>{f.name}</span>
              {f.size && <span className="text-ink-muted font-mono text-[11px]">{f.size}</span>}
            </span>
          ))}
        </Fragment>
      ))}
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-ink-muted mt-4 max-w-[72ch] text-[14.5px] leading-[1.55] text-pretty [&_code]:font-mono [&_code]:text-[0.92em]">
      {children}
    </p>
  );
}

export function Ipv4Header({ wide }: { wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label="The IPv4 header">
      <HeaderLayout
        rows={[
          ["bytes 0-3", [
            { name: "Ver", size: "4", bits: 4 },
            { name: "IHL", size: "4", bits: 4 },
            { name: "DSCP", size: "6", bits: 6 },
            { name: "ECN", size: "2", bits: 2 },
            { name: "Total length", size: "16", bits: 16 },
          ]],
          ["bytes 4-7", [
            { name: "Identification", size: "16", bits: 16 },
            { name: "Flags", size: "3", bits: 3 },
            { name: "Fragment offset", size: "13", bits: 13 },
          ]],
          ["bytes 8-11", [
            { name: "TTL", size: "8", bits: 8 },
            { name: "Protocol", size: "8", bits: 8 },
            { name: "Header checksum", size: "16", bits: 16 },
          ]],
          ["bytes 12-15", [{ name: "Source address", size: "32 bits", bits: 32 }]],
          ["bytes 16-19", [{ name: "Destination address", size: "32 bits", bits: 32 }]],
          ["20-59", [{ name: "Options (rare)", size: "0 to 40 bytes", bits: 32, dashed: true }]],
          ["then", [{ name: "Data: a TCP segment, UDP datagram or ICMP message", size: "", bits: 32, tall: true }]],
        ]}
      />
      <Caption>
        Five rows = 20 bytes, like TCP’s fixed part. Everything a router needs is here; the data behind it is someone
        else’s business (chapter 11).
      </Caption>
    </WidgetFrame>
  );
}

export function TcpHeader({ wide }: { wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label="The TCP header">
      <HeaderLayout
        rows={[
          ["bytes 0-3", [
            { name: "Source port", size: "16", bits: 16 },
            { name: "Destination port", size: "16", bits: 16 },
          ]],
          ["bytes 4-7", [{ name: "Sequence number", size: "32 bits", bits: 32 }]],
          ["bytes 8-11", [{ name: "Acknowledgement number", size: "32 bits", bits: 32 }]],
          ["bytes 12-15", [
            { name: "Offset", size: "4", bits: 4 },
            { name: "Res.", size: "3", bits: 3 },
            { name: "Flags", size: "9", bits: 9 },
            { name: "Window", size: "16", bits: 16 },
          ]],
          ["bytes 16-19", [
            { name: "Checksum", size: "16", bits: 16 },
            { name: "Urgent pointer", size: "16", bits: 16 },
          ]],
          ["20-59", [{ name: "Options", size: "0 to 40 bytes", bits: 32, dashed: true }]],
          ["then", [{ name: "Data", size: "up to one MSS", bits: 32, tall: true }]],
        ]}
      />
      <Caption>
        Five fixed rows = 20 bytes. Options add up to 10 more rows. UDP needs 2 rows; everything extra here is what
        reliability costs.
      </Caption>
    </WidgetFrame>
  );
}

export function UdpHeader({ wide }: { wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label="The UDP header">
      <HeaderLayout
        rows={[
          ["bytes 0-3", [
            { name: "Source port", size: "16 bits · 2 bytes", bits: 16 },
            { name: "Destination port", size: "16 bits · 2 bytes", bits: 16 },
          ]],
          ["bytes 4-7", [
            { name: "Length", size: "16 bits · 2 bytes", bits: 16 },
            { name: "Checksum", size: "16 bits · 2 bytes", bits: 16 },
          ]],
          ["bytes 8+", [{ name: "Data (payload)", size: "0 to 65,527 bytes · for DNS: the question", bits: 32, tall: true }]],
        ]}
      />
      <Caption>
        Each row is 32 bits = 4 bytes. The header is exactly two rows. Everything after it is your data. Compare TCP’s
        header later: at least five rows.
      </Caption>
    </WidgetFrame>
  );
}

/** Bytes as cells, 16 to a row, each field's first byte labelled; fields alternate ground. */
export function ByteDump({
  bytes,
  fieldOf,
  labelOf,
}: {
  bytes: number[];
  /** Index of the field a byte belongs to, so neighbouring fields can be told apart. */
  fieldOf: (i: number) => number;
  labelOf: (i: number) => string;
}) {
  const rows: number[][] = [];
  for (let i = 0; i < bytes.length; i += 16) rows.push(bytes.slice(i, i + 16).map((_, j) => i + j));
  return (
    <div className="min-w-[700px] space-y-1.5">
      {rows.map((row) => (
        <div key={row[0]} className="grid grid-cols-[44px_repeat(16,minmax(0,1fr))] gap-[3px]">
          <span className="text-ink-faint self-center font-mono text-[11.5px]">{String(row[0]).padStart(4, "0")}</span>
          {row.map((i) => {
            const field = fieldOf(i);
            const first = i === 0 || fieldOf(i - 1) !== field;
            // A label may run on over the rest of its field, but never into the next field.
            const roomy = i + 1 < bytes.length && fieldOf(i + 1) === field;
            return (
              <span
                key={i}
                className={cn(
                  "grid min-h-12 content-start justify-items-center rounded-[2px] border px-0.5 pt-1",
                  field % 2 ? "border-rule bg-ground" : "border-rule-strong bg-sunk",
                  first && "border-l-ink-faint",
                )}
              >
                <span className="text-ink font-mono text-[13.5px] font-semibold">
                  {bytes[i].toString(16).padStart(2, "0")}
                </span>
                {/* A field's label sits on its first byte and may run on over the rest of the field. */}
                <span
                  className={cn(
                    "text-ink-muted relative z-10 text-[10.5px] leading-[1.15]",
                    roomy ? "justify-self-start pl-1 whitespace-nowrap" : "px-0.5 text-center break-words",
                  )}
                >
                  {labelOf(i)}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const fromHex = (hex: string) => hex.split(" ").map((b) => parseInt(b, 16));

/** A dump whose fields are given as [start, end, label] ranges. */
function RangedDump({ hex, ranges }: { hex: string; ranges: [number, number, string][] }) {
  const field = (i: number) => ranges.findIndex(([a, b]) => i >= a && i < b);
  return (
    <ByteDump
      bytes={fromHex(hex)}
      fieldOf={field}
      labelOf={(i) => {
        const r = ranges[field(i)];
        return r && r[0] === i ? r[2] : "";
      }}
    />
  );
}

export function Ipv4Dump({ wide }: { wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label="An IPv4 header, byte by byte">
      <RangedDump
        hex="45 00 00 3c 3c 1a 40 00 40 06 a2 7c c0 a8 01 17 22 57 78 0f"
        ranges={[
          [0, 1, "ver + IHL"],
          [1, 2, "DSCP/ECN"],
          [2, 4, "length"],
          [4, 6, "ID"],
          [6, 8, "flags/offset"],
          [8, 9, "TTL"],
          [9, 10, "protocol"],
          [10, 12, "checksum"],
          [12, 16, "source"],
          [16, 20, "destination"],
        ]}
      />
      <Caption>
        Byte 0 = <code>45</code>: version 4 in the top half, IHL 5 in the bottom half. Bytes 6-7 = <code>40 00</code>:
        the DF bit is on, offset 0. The checksum <code>a2 7c</code> was computed for real; re-adding all ten 16-bit
        words gives 0xFFFF.
      </Caption>
    </WidgetFrame>
  );
}

export function SynDump({ wide }: { wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label="A TCP SYN, byte by byte">
      <RangedDump
        hex="ce 4e 01 bb 9a 7c 41 f2 00 00 00 00 a0 02 fa f0 cc 12 00 00 02 04 05 b4 04 02 08 0a e8 1b 90 42 00 00 00 00 01 03 03 07"
        ranges={[
          [0, 2, "src port"],
          [2, 4, "dst port"],
          [4, 8, "seq"],
          [8, 12, "ack"],
          [12, 13, "offset"],
          [13, 14, "flags"],
          [14, 16, "window"],
          [16, 18, "checksum"],
          [18, 20, "urgent"],
          [20, 24, "MSS"],
          [24, 26, "SACK ok"],
          [26, 36, "timestamps"],
          [36, 37, "NOP"],
          [37, 40, "wscale"],
        ]}
      />
      <Caption>
        40 bytes: the fixed 20, then 20 bytes of options. There is no data in a SYN. Offset byte <code>a0</code>: the
        top 4 bits (a = 10) are the data offset. Flags byte <code>02</code>: only the SYN bit is set. Checksum{" "}
        <code>cc 12</code> covers a pseudo-header with 192.168.1.23 → 34.87.120.15, protocol 6 (TCP).
      </Caption>
    </WidgetFrame>
  );
}

const DNS_LABELS: Record<number, string> = {
  8: "ID", 9: "ID", 10: "flags", 11: "flags", 12: "1 q", 13: "1 q",
  20: "len 3", 24: "len 4", 29: "len 2", 32: "end", 33: "type A", 34: "type A", 35: "class", 36: "class",
};

export function UdpDump({ wide }: { wide?: boolean }) {
  const bytes = fromHex(
    "c7 38 00 35 00 25 ec 99 1a 2b 01 00 00 01 00 00 00 00 00 00 03 61 70 69 04 6b 61 64 65 02 6c 6b 00 00 01 00 01",
  );
  const field = (i: number) => (i < 2 ? 0 : i < 4 ? 1 : i < 6 ? 2 : i < 8 ? 3 : 4);
  const headerLabel = ["src port", "dst port", "length", "checksum"];
  return (
    <WidgetFrame wide={wide} label="A UDP datagram carrying a DNS query, byte by byte">
      <ByteDump
        bytes={bytes}
        fieldOf={field}
        labelOf={(i) => {
          if (i < 8) return i % 2 === 0 ? headerLabel[field(i)] : "";
          const v = bytes[i];
          return DNS_LABELS[i] ?? (v >= 97 && v <= 122 ? String.fromCharCode(v) : i < 20 ? "0" : "");
        }}
      />
      <table className="mt-5 w-full min-w-[620px] border-collapse text-left">
        <thead>
          <tr className="border-ink border-b">
            {["Bytes", "Field", "Hex", "Value"].map((h) => (
              <th key={h} className="text-ink py-2 pr-4 text-[14px] font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[15px]">
          {[
            ["0-1", "Source port", "c7 38", "51000"],
            ["2-3", "Destination port", "00 35", "53 (DNS)"],
            ["4-5", "Length", "00 25", "37 bytes (8 + 29)"],
            ["6-7", "Checksum", "ec 99", "see section 7"],
          ].map(([b, f, h, v]) => (
            <tr key={b} className="border-rule border-b align-top">
              <td className="text-ink py-2 pr-4 font-mono text-[14px]">{b}</td>
              <td className="text-ink py-2 pr-4">{f}</td>
              <td className="text-ink py-2 pr-4 font-mono text-[14px]">{h}</td>
              <td className="text-ink-body py-2">{v}</td>
            </tr>
          ))}
          <tr className="border-rule border-b align-top">
            <td className="text-ink py-2 pr-4 font-mono text-[14px]">8-36</td>
            <td className="text-ink py-2 pr-4">Payload (DNS)</td>
            <td className="text-ink py-2 pr-4 font-mono text-[14px]">1a 2b … 00 01</td>
            <td className="text-ink-body py-2">
              query ID 0x1a2b, flags “please recurse”, 1 question: <code className="font-mono">3 api 4 kade 2 lk 0</code>,
              type A (IPv4 address), class IN
            </td>
          </tr>
        </tbody>
      </table>
      <Caption>
        Byte offsets count from the start of the UDP header. DNS writes names as length-prefixed labels: 3 letters
        “api”, 4 letters “kade”, 2 letters “lk”, then 0 for the end. The DNS chapter will open the payload fully; here it
        is just “data” to UDP.
      </Caption>
    </WidgetFrame>
  );
}

/** The UDP checksum over the pseudo-header, header and payload, step by step. */
function udpChecksum(src: string, dst: string, sp: number, dp: number, payload: number[]) {
  const len = 8 + payload.length;
  const ipBytes = (x: string) => {
    const n = ipToInt(x)!;
    return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  };
  const bytes = [
    ...ipBytes(src), ...ipBytes(dst), 0, 17, len >> 8, len & 255,
    sp >> 8, sp & 255, dp >> 8, dp & 255, len >> 8, len & 255, 0, 0, ...payload,
  ];
  if (bytes.length % 2) bytes.push(0);
  let sum = 0;
  for (let i = 0; i < bytes.length; i += 2) sum += (bytes[i] << 8) + bytes[i + 1];
  const raw = sum;
  while (sum >>> 16) sum = (sum & 0xffff) + (sum >>> 16);
  let ck = ~sum & 0xffff;
  if (ck === 0) ck = 0xffff;
  return { len, raw, folded: sum, ck };
}

const h4 = (n: number) => n.toString(16).padStart(4, "0");

/** Build a UDP datagram from your own values and watch the checksum come out. */
export function UdpBuild({ wide }: { wide?: boolean }) {
  const [src, setSrc] = useState("192.168.1.23");
  const [dst, setDst] = useState("192.168.1.1");
  const [sp, setSp] = useState("51000");
  const [dp, setDp] = useState("9999");
  const [payload, setPayload] = useState("hello kade");
  const errorId = useId();

  const ipErr = ipError(src) ?? ipError(dst);
  const portsOk = /^\d+$/.test(sp) && /^\d+$/.test(dp) && Number(sp) <= 65535 && Number(dp) <= 65535;
  const pl = bytesOf(payload);
  const error = ipErr ?? (!portsOk ? "Ports must be whole numbers from 0 to 65535." : pl.length > 200 ? "Keep the payload under 200 bytes for this demo." : undefined);

  let result = null;
  if (!error) {
    const s = Number(sp);
    const d = Number(dp);
    const c = udpChecksum(src.trim(), dst.trim(), s, d, pl);
    const header = [s >> 8, s & 255, d >> 8, d & 255, c.len >> 8, c.len & 255, c.ck >> 8, c.ck & 255];
    const names = ["src", "src", "dst", "dst", "len", "len", "ck", "ck"];
    result = (
      <>
        <KeyValues
          items={[
            ["Source port", `${s} → ${h4(s)}`],
            ["Destination port", `${d} → ${h4(d)}`],
            ["Length", `8 + ${pl.length} = ${c.len} → ${h4(c.len)}`],
            ["Checksum steps", <>sum 0x{c.raw.toString(16)} → fold 0x{h4(c.folded)} → flip → <b key="c">0x{h4(c.ck)}</b></>],
          ]}
        />
        <div className="mt-5 overflow-x-auto">
          <ByteDump
            bytes={[...header, ...pl]}
            fieldOf={(i) => (i < 8 ? Math.floor(i / 2) : 4)}
            labelOf={(i) => (i < 8 ? names[i] : pl[i - 8] >= 32 && pl[i - 8] < 127 ? String.fromCharCode(pl[i - 8]) : "·")}
          />
        </div>
      </>
    );
  }

  return (
    <WidgetFrame wide={wide} label="Build a UDP datagram">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Field label="Source IP" value={src} onChange={setSrc} invalid={!!ipError(src)} describedBy={errorId} />
        <Field label="Destination IP" value={dst} onChange={setDst} invalid={!!ipError(dst)} describedBy={errorId} />
        <Field label="Source port" value={sp} onChange={setSp} short inputMode="numeric" />
        <Field label="Destination port" value={dp} onChange={setDp} short inputMode="numeric" />
      </div>
      <div className="mt-3">
        <Field label="Payload (text)" value={payload} onChange={setPayload} />
      </div>
      <div className="mt-6" aria-live="polite">
        {error ? <FieldError id={errorId}>{error}</FieldError> : result}
      </div>
    </WidgetFrame>
  );
}
