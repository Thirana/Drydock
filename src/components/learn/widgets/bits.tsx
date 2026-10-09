import { bin32, intToIp, ipToInt, maskOf } from "@/lib/net/ipv4";
import { cn } from "@/lib/utils";
import { Swatch } from "../swatch";
import { WidgetFrame } from "./widget-frame";

/**
 * Bits of an IPv4 address, drawn as cells. Network bits sit on teal, host bits
 * on the highlighter; a 1 is ink and a 0 is faint, so the pattern reads at a
 * glance and the digits stay legible in both themes.
 */

type Part = "net" | "host" | undefined;

export function BitCell({
  bit,
  part,
  size = "md",
  className,
}: {
  bit: string;
  part?: Part;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-[2px] border font-mono",
        size === "md"
          ? "h-[26px] w-[17px] text-[12px]"
          : "h-[22px] w-[14px] text-[11px]",
        part === "net"
          ? "border-teal bg-teal-soft"
          : part === "host"
            ? "border-rule-strong bg-mark"
            : "border-rule bg-sunk",
        bit === "1"
          ? "text-ink font-semibold"
          : part
            ? "text-ink-muted"
            : "text-ink-faint",
        className,
      )}
    >
      {bit}
    </span>
  );
}

/** 32 cells in four octets. `prefix` splits them into network and host parts. */
export function BitRow({
  value,
  prefix,
  split,
  size = "sm",
}: {
  value: number;
  prefix?: number;
  /** Colour the network and host parts. */
  split?: boolean;
  size?: "sm" | "md";
}) {
  const bits = [...bin32(value)];
  // Octets wrap as whole groups when the row has no room (phones).
  return (
    <span className="flex flex-wrap gap-x-[9px] gap-y-1" aria-hidden="true">
      {[0, 8, 16, 24].map((start) => (
        <span key={start} className="flex gap-[2px]">
          {bits.slice(start, start + 8).map((bit, j) => {
            const i = start + j;
            return (
              <BitCell
                key={i}
                bit={bit}
                size={size}
                part={
                  split && prefix !== undefined
                    ? i < prefix
                      ? "net"
                      : "host"
                    : undefined
                }
              />
            );
          })}
        </span>
      ))}
    </span>
  );
}

/** One address as 32 bits under a two-part key: where the network part ends. */
export function CidrBar({
  ip,
  prefix,
  labels,
  wide,
}: {
  ip: string;
  prefix: string;
  /** "network label,host label". */
  labels?: string;
  wide?: boolean;
}) {
  const value = ipToInt(ip) ?? 0;
  const p = Number(prefix);
  const [netLabel, hostLabel] = (
    labels ?? `network part: ${p} bits,host part: ${32 - p} bits`
  ).split(",");
  const bits = bin32(value);
  const octets = ip.split(".");
  return (
    <WidgetFrame wide={wide} label={`${ip} in binary, /${p}`}>
      <ul className="text-ink-body mb-4 flex flex-wrap gap-x-6 gap-y-1.5 text-[14.5px]">
        <li className="inline-flex items-center gap-2">
          <Swatch hue="teal" />
          {netLabel}
        </li>
        <li className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="border-rule-strong bg-mark inline-block size-3 rounded-[2px] border"
          />
          {hostLabel}
        </li>
      </ul>
      <div className="flex min-w-[640px] gap-3" aria-hidden="true">
        {[0, 1, 2, 3].map((g) => (
          <div key={g} className="grid justify-items-center gap-1.5">
            <span className="flex gap-[2px]">
              {[...bits.slice(g * 8, g * 8 + 8)].map((bit, j) => (
                <BitCell
                  key={j}
                  bit={bit}
                  part={g * 8 + j < p ? "net" : "host"}
                />
              ))}
            </span>
            <span className="text-ink font-mono text-[15px]">{octets[g]}</span>
          </div>
        ))}
      </div>
      <p className="sr-only">
        {ip} is {bits.match(/.{8}/g)?.join(" ")} in binary. The first {p} bits
        are the network part and the last {32 - p} the host part.
      </p>
    </WidgetFrame>
  );
}

function AndLine({
  label,
  sub,
  value,
  prefix,
  split,
  strong,
}: {
  label: string;
  sub: string;
  value: number;
  prefix: number;
  split?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="grid grid-cols-[124px_auto_minmax(120px,1fr)] items-center gap-3">
      <span className="text-ink-muted font-mono text-[12.5px] leading-[1.3]">
        {label}
        <br />
        {sub}
      </span>
      <BitRow value={value} prefix={prefix} split={split} />
      <span
        className={cn("text-ink font-mono text-[14px]", strong && "font-bold")}
      >
        {intToIp(value)}
      </span>
    </div>
  );
}

/** IP AND mask, bit by bit, down to the network address. */
export function AndGrid({
  ip,
  prefix,
  label,
  wide,
}: {
  ip: string;
  prefix: string;
  label: string;
  wide?: boolean;
}) {
  const value = ipToInt(ip) ?? 0;
  const p = Number(prefix);
  const mask = maskOf(p);
  const result = (value & mask) >>> 0;
  return (
    <WidgetFrame wide={wide} label={`${label}: ${ip} AND ${intToIp(mask)}`}>
      <div className="min-w-[700px]">
        <p className="text-ink-muted mb-3 font-mono text-[13px]">
          {label}: {ip} AND {intToIp(mask)}
        </p>
        <div className="space-y-2">
          <AndLine label="IP" sub={ip} value={value} prefix={p} />
          <AndLine
            label={`mask /${p}`}
            sub={intToIp(mask)}
            value={mask}
            prefix={p}
            split
          />
        </div>
        <div className="border-rule-strong mt-3 border-t pt-3">
          <AndLine
            label="AND result"
            sub="network address"
            value={result}
            prefix={p}
            split
            strong
          />
        </div>
      </div>
      <p className="sr-only">
        {ip} AND {intToIp(mask)} gives the network address {intToIp(result)}.
      </p>
    </WidgetFrame>
  );
}
