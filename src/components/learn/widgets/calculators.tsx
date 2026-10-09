"use client";

import { useId, useState } from "react";
import { fmt, hex } from "@/lib/net/bytes";
import { intToIp, ipError, ipToInt, maskOf } from "@/lib/net/ipv4";
import { parseMac, readMac } from "@/lib/net/mac";
import { BitRow } from "./bits";
import { MacBytes, OctetCards } from "./bytes";
import { Field, FieldError } from "./field";
import { KeyValues } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Type a value, read it back every useful way. Each calculator says plainly
 * what is wrong with the input and how to write it instead.
 */

/** An IPv4 address as octets, hex bytes and one 32-bit number. */
export function IpConv({ ip: initial, wide }: { ip: string; wide?: boolean }) {
  const [value, setValue] = useState(initial);
  const errorId = useId();
  const error = ipError(value);
  const v = value.trim();
  return (
    <WidgetFrame wide={wide} label="IPv4 address converter">
      <Field label="IPv4 address" value={value} onChange={setValue} invalid={!!error} describedBy={errorId} />
      <div className="mt-6" aria-live="polite">
        {error ? (
          <FieldError id={errorId}>{error}</FieldError>
        ) : (
          <>
            <OctetCards ip={v} />
            <KeyValues
              className="mt-5"
              items={[
                ["As 4 bytes (hex)", v.split(".").map((x) => hex(Number(x))).join(" ")],
                ["As one 32-bit number", fmt(ipToInt(v)!)],
              ]}
            />
          </>
        )}
      </div>
    </WidgetFrame>
  );
}

function parseCidr(text: string): { ip: number; p: number } | { error: string } {
  const m = String(text).trim().match(/^([\d.]+)\/(\d{1,2})$/);
  if (!m) return { error: "Write it as an address, a slash and a number, like 10.10.1.0/24." };
  const ip = ipToInt(m[1]);
  const p = Number(m[2]);
  if (ip === null) return { error: "The address part is not a valid IPv4 address." };
  if (p > 32) return { error: "The number after the slash must be 0 to 32." };
  return { ip, p };
}

/** Everything a CIDR range implies: network, mask, first and last, how many fit. */
export function CidrCalc({ cidr, wide }: { cidr: string; wide?: boolean }) {
  const [value, setValue] = useState(cidr);
  const errorId = useId();
  const parsed = parseCidr(value);
  return (
    <WidgetFrame wide={wide} label="CIDR range calculator">
      <Field
        label="Range in CIDR form"
        value={value}
        onChange={setValue}
        invalid={"error" in parsed}
        describedBy={errorId}
      />
      <div className="mt-6" aria-live="polite">
        {"error" in parsed ? (
          <FieldError id={errorId}>{parsed.error}</FieldError>
        ) : (
          <CidrResult ip={parsed.ip} p={parsed.p} />
        )}
      </div>
    </WidgetFrame>
  );
}

function CidrResult({ ip, p }: { ip: number; p: number }) {
  const mask = maskOf(p);
  const net = (ip & mask) >>> 0;
  const broadcast = (net | (~mask >>> 0)) >>> 0;
  const total = 2 ** (32 - p);
  const first = p >= 31 ? net : net + 1;
  const last = p >= 31 ? broadcast : broadcast - 1;
  const usable = p === 32 ? 1 : p === 31 ? 2 : total - 2;
  return (
    <>
      {net !== ip && (
        <p className="text-ink-body mb-4 text-[15px] leading-[1.55]">
          <b className="text-ink">Note:</b> {intToIp(ip)} has host bits set. The network it belongs to is{" "}
          <span className="font-mono">
            {intToIp(net)}/{p}
          </span>
          .
        </p>
      )}
      <div className="mb-5 overflow-x-auto">
        <BitRow value={net} prefix={p} split />
      </div>
      <KeyValues
        items={[
          ["Network address", <b key="n">{intToIp(net)}</b>],
          ["Subnet mask", intToIp(mask)],
          ["First usable", intToIp(first)],
          ["Last usable", intToIp(last)],
          ["Broadcast", intToIp(broadcast)],
          ["Total addresses", `${fmt(total)}  (2^${32 - p})`],
          ["Usable on a normal network", fmt(usable)],
          ["Usable in a GCP subnet", p <= 29 ? fmt(total - 4) : "not allowed (GCP subnets must be /29 or bigger)"],
        ]}
      />
    </>
  );
}

/** A MAC in every common spelling, and what its first byte says. */
export function MacDecode({ mac, wide }: { mac: string; wide?: boolean }) {
  const [value, setValue] = useState(mac);
  const errorId = useId();
  const bytes = parseMac(value);
  return (
    <WidgetFrame wide={wide} label="MAC address decoder">
      <Field label="MAC address" value={value} onChange={setValue} invalid={!bytes} describedBy={errorId} />
      <div className="mt-6" aria-live="polite">
        {!bytes ? (
          <FieldError id={errorId}>
            A MAC has 12 hex digits (0-9, a-f), in any of these forms: aa:bb:cc:dd:ee:ff, AA-BB-CC-DD-EE-FF or
            aabb.ccdd.eeff.
          </FieldError>
        ) : (
          <MacResult bytes={bytes} />
        )}
      </div>
    </WidgetFrame>
  );
}

function MacResult({ bytes }: { bytes: string[] }) {
  const { group, local, all, reading } = readMac(bytes);
  return (
    <>
      <div className="overflow-x-auto">
        <MacBytes mac={all} />
      </div>
      <KeyValues
        className="mt-5"
        items={[
          ["macOS / Linux form", all],
          ["Windows form", bytes.join("-").toUpperCase()],
          ["Cisco form", `${bytes[0] + bytes[1]}.${bytes[2] + bytes[3]}.${bytes[4] + bytes[5]}`],
          ["Last bit of first byte", group ? "1 → group (multicast / broadcast)" : "0 → one interface (unicast)"],
          ["Second-last bit", local ? "1 → locally set (software)" : "0 → set by the maker"],
          ["Reading", reading, true],
        ]}
      />
    </>
  );
}
