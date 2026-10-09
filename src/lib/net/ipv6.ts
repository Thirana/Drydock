/** IPv6 addresses as eight 4-digit hex groups. */

/** "fe80::1" → ["fe80","0000",…,"0001"], or null when it is not a valid address. */
export function v6expand(text: string): string[] | null {
  const t = text.trim().toLowerCase().replace(/%.*$/, "");
  if (!/^[0-9a-f:]+$/.test(t)) return null;
  const halves = t.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  if (halves.length === 1 && left.length !== 8) return null;
  const missing = 8 - left.length - right.length;
  if (halves.length === 2 && missing < 1) return null;
  const groups = [...left, ...(halves.length === 2 ? Array<string>(missing).fill("0") : []), ...right];
  if (groups.length !== 8 || groups.some((x) => !/^[0-9a-f]{1,4}$/.test(x))) return null;
  return groups.map((x) => x.padStart(4, "0"));
}

/** The shortest form: leading zeros dropped, the longest run of zero groups as "::". */
export function v6compress(groups: string[]) {
  const h = groups.map((x) => x.replace(/^0+(?=.)/, ""));
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;
  h.forEach((x, i) => {
    if (x === "0") {
      if (curStart < 0) curStart = i;
      curLen++;
      if (curLen > bestLen) {
        bestLen = curLen;
        bestStart = curStart;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  });
  if (bestLen < 2) return h.join(":");
  return `${h.slice(0, bestStart).join(":")}::${h.slice(bestStart + bestLen).join(":")}`;
}

/** What kind of address it is, and what that means. */
export function v6type(groups: string[]): [kind: string, meaning: string] {
  const first = parseInt(groups[0], 16);
  const all = groups.join("");
  if (all === "0".repeat(32)) return ["Unspecified (::)", "\"no address\" / listen on all interfaces"];
  if (all === `${"0".repeat(31)}1`) return ["Loopback (::1)", "this machine, like 127.0.0.1"];
  if (groups.slice(0, 5).every((x) => x === "0000") && groups[5] === "ffff")
    return [
      "IPv4-mapped",
      `an IPv4 address inside IPv6: ${[0, 1]
        .map((i) => [parseInt(groups[6 + i].slice(0, 2), 16), parseInt(groups[6 + i].slice(2), 16)].join("."))
        .join(".")}`,
    ];
  if ((first & 0xff00) === 0xff00)
    return [
      "Multicast (ff00::/8)",
      groups[0].slice(2) === "02"
        ? "link-local scope group, e.g. ff02::1 all devices, ff02::2 all routers"
        : "a group address",
    ];
  if ((first & 0xffc0) === 0xfe80) return ["Link-local (fe80::/10)", "only valid on this link; never routed"];
  if ((first & 0xfe00) === 0xfc00) return ["Unique local (fc00::/7)", "private, internal use, like 10.x or 192.168.x"];
  if (groups[0] === "2001" && groups[1] === "0db8")
    return ["Documentation (2001:db8::/32)", "reserved for examples; a global-unicast-style address"];
  if ((first & 0xe000) === 0x2000) return ["Global unicast (2000::/3)", "public, routable on the internet"];
  return ["Reserved / other", "not a common type"];
}
