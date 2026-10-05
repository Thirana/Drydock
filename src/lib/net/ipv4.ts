/**
 * IPv4 as 32-bit unsigned integers. Pure helpers shared by the course widgets.
 */

/** "192.168.1.23" → 3232235799, or null when it is not a dotted quad. */
export function ipToInt(text: string): number | null {
  const parts = String(text).trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const v = Number(part);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

export function intToIp(n: number) {
  return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

/** The mask for a prefix length: 24 → 255.255.255.0 as an integer. */
export function maskOf(prefix: number) {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

export function networkOf(ip: number, prefix: number) {
  return (ip & maskOf(prefix)) >>> 0;
}

/** 32 characters of 0 and 1. */
export function bin32(n: number) {
  return (n >>> 0).toString(2).padStart(32, "0");
}

/** Why a typed address is not valid, in words; undefined when it is fine. */
export function ipError(text: string): string | undefined {
  const value = String(text).trim();
  if (!value) return "Type an IPv4 address, for example 10.10.1.10.";
  const parts = value.split(".");
  if (parts.length !== 4)
    return `An IPv4 address has four numbers separated by dots; "${value}" has ${parts.length}.`;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part))
      return `"${part}" is not a number from 0 to 255.`;
    if (Number(part) > 255)
      return `${part} is too big: each part of an address is one byte, so 0 to 255.`;
  }
  return undefined;
}

/** A prefix length typed as text: 0 to 32, else undefined. */
export function parsePrefix(text: string): number | undefined {
  const value = String(text).trim().replace(/^\//, "");
  if (!/^\d{1,2}$/.test(value)) return undefined;
  const n = Number(value);
  return n <= 32 ? n : undefined;
}
