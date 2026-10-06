import { Fragment } from "react";
import { bin32 } from "@/lib/net/ipv4";
import { bin8, bytesOf, hex, PROFILE_REQUEST } from "@/lib/net/bytes";
import { parseMac } from "@/lib/net/mac";
import { cn } from "@/lib/utils";
import { Swatch } from "../swatch";
import { BitCell } from "./bits";
import { WidgetFrame } from "./widget-frame";

/*
 * Bytes, bits and digits drawn as cells: the request as bytes, a hex dump,
 * hex digits, an address's octets, MAC bytes. Static: they render on the
 * server and ship no JavaScript.
 */

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-ink-muted mt-4 max-w-[72ch] text-[14.5px] leading-[1.55] text-pretty">
      {children}
    </p>
  );
}

/** The first line of the HTTP request, one cell per byte. */
export function HexLine({ wide }: { wide?: boolean }) {
  const line = "GET /profile HTTP/1.1\r\n";
  return (
    <WidgetFrame wide={wide} label="The first line of the request as bytes">
      <ol className="flex min-w-[640px] flex-wrap gap-1">
        {bytesOf(line).map((b, i) => {
          const control = b === 32 || b === 13 || b === 10;
          const name = b === 32 ? "space" : b === 13 ? "CR" : b === 10 ? "LF" : String.fromCharCode(b);
          return (
            <li
              key={i}
              className={cn(
                "border-rule grid min-w-[30px] justify-items-center rounded-[2px] border px-1 py-1",
                control ? "bg-mark" : "bg-ground",
              )}
            >
              <span className={cn("font-mono", control ? "text-ink text-[11px]" : "text-ink text-[15px]")}>
                {name}
              </span>
              <span className="text-ink-muted font-mono text-[12px]">{hex(b)}</span>
            </li>
          );
        })}
      </ol>
      <Caption>
        The first line of the request: 23 characters become 23 bytes. <b className="text-ink">CR LF</b> (0D 0A) are
        the invisible “end of line” characters HTTP uses.
      </Caption>
    </WidgetFrame>
  );
}

/** The whole request as `xxd` prints it: offset, bytes, readable characters. */
export function HexDump({ wide }: { wide?: boolean }) {
  const bytes = bytesOf(PROFILE_REQUEST);
  const rows = [];
  for (let i = 0; i < bytes.length; i += 16) rows.push({ at: i, row: bytes.slice(i, i + 16) });
  return (
    <WidgetFrame wide={wide} label="The request as a hex dump">
      <pre className="min-w-[620px] font-mono text-[13px] leading-[1.7]">
        {rows.map(({ at, row }) => (
          <span key={at} className="block">
            <span className="text-ink-faint">{at.toString(16).padStart(8, "0")}:</span>{" "}
            <span className="text-ink inline-block w-[40ch]">
              {row.map((b, j) => (
                <Fragment key={j}>
                  <span className={at + j < 3 ? "dd-mark" : undefined}>{hex(b)}</span>
                  {j % 2 ? " " : ""}
                </Fragment>
              ))}
            </span>{" "}
            <span className="text-ink-muted">
              {row.map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : ".")).join("")}
            </span>
          </span>
        ))}
      </pre>
      <Caption>
        {bytes.length} bytes in total. The first three (47 45 54) are “GET”. The dots on the right are line breaks (0D
        0A), which have no printable form. With HTTPS, these bytes are encrypted by TLS before TCP sees them.
      </Caption>
    </WidgetFrame>
  );
}

/** The sixteen hex digits with their decimal values and bits. */
export function HexGrid({ wide }: { wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label="The sixteen hex digits">
      <ol className="grid min-w-[680px] grid-cols-16 gap-1">
        {Array.from({ length: 16 }, (_, i) => (
          <li
            key={i}
            className={cn(
              "border-rule grid justify-items-center rounded-[2px] border py-1.5",
              i > 9 ? "bg-mark" : "bg-ground",
            )}
          >
            <span className="text-ink font-mono text-[17px] font-semibold">{i.toString(16).toUpperCase()}</span>
            <span className="text-ink-muted font-mono text-[12px]">{i}</span>
            <span className="text-ink-faint font-mono text-[11px]">{i.toString(2).padStart(4, "0")}</span>
          </li>
        ))}
      </ol>
      <Caption>
        Top: hex digit. Middle: its decimal value. Bottom: its 4 bits. The highlighted digits are the letters that
        come after 9.
      </Caption>
    </WidgetFrame>
  );
}

/** Four octets as cards: decimal, the 8 bits, and hex. */
export function OctetCards({ ip }: { ip: string }) {
  return (
    <div className="grid min-w-[640px] grid-cols-4 gap-3">
      {ip.split(".").map((part, i) => {
        const v = Number(part);
        return (
          <div key={i} className="border-rule grid justify-items-center gap-1.5 rounded-[2px] border px-2 py-3">
            <span className="text-ink-faint font-mono text-[12px]">octet {i + 1}</span>
            <span className="text-ink font-mono text-[26px] leading-none font-semibold">{v}</span>
            <span className="flex gap-[2px]" aria-hidden="true">
              {[...bin8(v)].map((bit, j) => (
                <BitCell key={j} bit={bit} size="sm" />
              ))}
            </span>
            <span className="text-ink-muted font-mono text-[12.5px]">hex {hex(v)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function IpAnatomy({ ip, wide }: { ip: string; wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label={`${ip}, octet by octet`}>
      <OctetCards ip={ip} />
      <Caption>
        Four numbers, three dots. Each number is one octet, stored as 8 bits (the middle row). The last line is the
        same value in hex, as it appears inside a packet.
      </Caption>
    </WidgetFrame>
  );
}

/** Place values 128 to 1: which ones add up to each octet. */
export function PlaceValue({ values, wide }: { values: string; wide?: boolean }) {
  const places = [128, 64, 32, 16, 8, 4, 2, 1];
  return (
    <WidgetFrame wide={wide} label="Place values of an octet">
      <div className="grid min-w-[620px] grid-cols-[64px_repeat(8,minmax(0,1fr))_minmax(150px,1.6fr)] items-center gap-1.5 font-mono text-[13px]">
        <span />
        {places.map((p) => (
          <span key={p} className="text-ink-faint text-center text-[12px]">
            {p}
          </span>
        ))}
        <span />
        {values.split(",").map((x) => {
          const v = Number(x);
          const bits = bin8(v);
          const used = places.filter((_, i) => bits[i] === "1");
          return (
            <Fragment key={x}>
              <span className="text-ink font-semibold">{v}</span>
              {[...bits].map((bit, i) => (
                <span
                  key={i}
                  className={cn(
                    "grid h-8 place-items-center rounded-[2px] border",
                    bit === "1" ? "border-teal bg-teal-soft text-ink font-semibold" : "border-rule text-ink-faint",
                  )}
                >
                  {bit}
                </span>
              ))}
              <span className="text-ink-muted pl-2 text-[12.5px]">= {used.length ? used.join(" + ") : "0"}</span>
            </Fragment>
          );
        })}
      </div>
      <Caption>
        Top row: the value of each position. A filled 1 means “count this one”. Together, these four rows are the 32
        bits of 192.168.1.23.
      </Caption>
    </WidgetFrame>
  );
}

function BitLine({ bits }: { bits: string }) {
  return (
    <span className="flex gap-[1px]" aria-hidden="true">
      {[...bits].map((bit, i) => (
        <BitCell key={i} bit={bit} size="sm" className={i % 8 === 7 && i < bits.length - 1 ? "mr-[6px]" : undefined} />
      ))}
    </span>
  );
}

/** An IP next to a MAC: 32 bits against 48. */
export function SizeCompare({ wide }: { wide?: boolean }) {
  const ipBits = bin32(3232235799);
  const macBits = "a4:83:e7:2b:91:0c"
    .split(":")
    .map((x) => bin8(parseInt(x, 16)))
    .join("");
  return (
    <WidgetFrame wide={wide} label="An IP address and a MAC address, bit by bit">
      <div className="min-w-[760px] space-y-3">
        {[
          ["IP · 32 bits", "192.168.1.23", ipBits],
          ["MAC · 48 bits", "a4:83:e7:2b:91:0c", macBits],
        ].map(([label, value, bits]) => (
          <div key={label} className="grid grid-cols-[132px_auto] items-center gap-3">
            <span className="text-ink-muted font-mono text-[12.5px] leading-[1.35]">
              {label}
              <br />
              <span className="text-ink">{value}</span>
            </span>
            <BitLine bits={bits} />
          </div>
        ))}
      </div>
      <Caption>
        4 groups of 8 vs 6 groups of 8. The IP is shown to humans in decimal with dots; the MAC in hex with colons.
      </Caption>
    </WidgetFrame>
  );
}

/** A MAC's six bytes: the maker's three, the device's three, and the two flag bits. */
export function MacBytes({ mac }: { mac: string }) {
  const bytes = parseMac(mac) ?? [];
  return (
    <div className="grid min-w-[700px] grid-cols-6 gap-2.5">
      <p className="border-teal text-ink col-span-3 border-t-2 pt-1.5 text-center font-mono text-[12.5px]">
        OUI · the maker (3 bytes)
      </p>
      <p className="border-ink-faint text-ink col-span-3 border-t-2 border-dashed pt-1.5 text-center font-mono text-[12.5px]">
        device part (3 bytes)
      </p>
      {bytes.map((b, i) => (
        <div
          key={i}
          className={cn(
            "grid justify-items-center gap-1.5 rounded-[2px] border px-1.5 py-2.5",
            i < 3 ? "border-teal bg-teal-soft" : "border-rule-strong bg-mark",
          )}
        >
          <span className="text-ink font-mono text-[22px] leading-none font-semibold">{b}</span>
          <span className="flex gap-[1px]" aria-hidden="true">
            {[...bin8(parseInt(b, 16))].map((bit, j) => (
              <BitCell
                key={j}
                bit={bit}
                size="xs"
                className={i === 0 && j >= 6 ? "border-ink border-[1.5px]" : undefined}
              />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MacAnatomy({ mac, wide }: { mac: string; wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label={`${mac}, byte by byte`}>
      <MacBytes mac={mac} />
      <Caption>
        Each byte in hex (large) and in binary. The two outlined bits at the end of the first byte have special
        meanings (section 6).
      </Caption>
    </WidgetFrame>
  );
}

/** kade-vpc's /16 as 256 blocks of /24, two of them used. */
export function VpcSlots({ wide }: { wide?: boolean }) {
  return (
    <WidgetFrame wide={wide} label="The 256 /24 blocks inside 10.10.0.0/16">
      <ol className="grid min-w-[600px] grid-cols-[repeat(32,minmax(0,1fr))] gap-[3px]">
        {Array.from({ length: 256 }, (_, i) => (
          <li
            key={i}
            title={`10.10.${i}.0/24`}
            className={cn(
              "aspect-square rounded-[2px] border",
              i === 1 ? "border-plum bg-plum" : i === 2 ? "border-green bg-green" : "border-rule bg-ground",
            )}
          />
        ))}
      </ol>
      <ul className="text-ink-muted mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-[14px]">
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="border-plum bg-plum inline-block size-3 rounded-[2px] border" />
          sn-app 10.10.1.0/24
        </li>
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="border-green bg-green inline-block size-3 rounded-[2px] border" />
          sn-data 10.10.2.0/24
        </li>
        <li className="inline-flex items-center gap-2">
          <Swatch hue="ink" />
          free: 254 more /24 blocks (10.10.0.0, 10.10.3.0 … 10.10.255.0)
        </li>
      </ul>
      <Caption>
        Each square is one /24 block inside kade-vpc’s /16. A /16 has 16 host bits; using 8 of them for the block
        number gives 2<sup>8</sup> = 256 blocks.
      </Caption>
    </WidgetFrame>
  );
}
