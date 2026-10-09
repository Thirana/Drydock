/** MAC addresses: six bytes, written many ways. */

/** "a4:83:e7:2b:91:0c", "A4-83-…" or "a483.e72b.910c" → six lower-case hex pairs, or null. */
export function parseMac(text: string): string[] | null {
  const h = String(text).trim().replace(/[:\-.\s]/g, "").toLowerCase();
  if (!/^[0-9a-f]{12}$/.test(h)) return null;
  return h.match(/../g);
}

/** What the first byte's two low bits and a few well-known prefixes say about a MAC. */
export function readMac(bytes: string[]) {
  const first = parseInt(bytes[0], 16);
  const group = (first & 1) === 1;
  const local = ((first >> 1) & 1) === 1;
  const all = bytes.join(":");
  const oui = bytes.slice(0, 3).join(":");
  let reading: string;
  if (all === "ff:ff:ff:ff:ff:ff")
    reading = "The broadcast address: every device on the local network.";
  else if (bytes[0] === "42" && bytes[1] === "01")
    reading = `Looks like a GCP VM. The last 4 bytes give its internal IP: ${bytes
      .slice(2)
      .map((x) => parseInt(x, 16))
      .join(".")}.`;
  else if (oui === "00:50:56" || oui === "00:0c:29")
    reading = "This OUI belongs to VMware: a virtual machine.";
  else if (oui === "08:00:27")
    reading = "This OUI belongs to VirtualBox: a virtual machine.";
  else if (local)
    reading =
      "Locally set: not a maker OUI. Probably a random private MAC or a virtual interface.";
  else reading = `Set by a maker. Look up ${oui} in the IEEE OUI list to see who.`;
  return { group, local, all, reading };
}
