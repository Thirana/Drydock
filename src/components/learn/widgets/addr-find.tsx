"use client";

import { useId, useState } from "react";
import { intToIp, ipError, ipToInt, maskOf } from "@/lib/net/ipv4";
import { cn } from "@/lib/utils";
import { Field, FieldError } from "./field";
import { WidgetFrame } from "./widget-frame";

interface Range {
  range: string;
  name: string;
  what: string;
  first: string;
  /** A general-purpose range (private, link-local, everything), not one of Kadé's. */
  special?: true;
}

/** Every range in the GCP notes' address book, from GCP chapter 0. */
const RANGES: Range[] = [
  {
    range: "10.10.1.10/32",
    name: "kade-api-1",
    what: "VM in sn-app, zone a",
    first: "Ch 0",
  },
  {
    range: "10.10.1.11/32",
    name: "kade-api-2",
    what: "VM in sn-app, zone b",
    first: "Ch 0",
  },
  {
    range: "10.10.1.20/32",
    name: "kade-worker",
    what: "VM for background jobs, no external IP",
    first: "Ch 10",
  },
  {
    range: "10.10.1.1/32",
    name: "sn-app gateway",
    what: "Answered by the VPC software, not a real router",
    first: "Fundamentals ch 5",
  },
  {
    range: "10.10.2.1/32",
    name: "sn-data gateway",
    what: "Answered by the VPC software, not a real router",
    first: "Fundamentals ch 5",
  },
  {
    range: "10.10.2.5/32",
    name: "kade-db",
    what: "PostgreSQL VM, removed in chapter 9",
    first: "Ch 0",
  },
  {
    range: "10.10.32.3/32",
    name: "kade-sql",
    what: "Cloud SQL private IP",
    first: "Ch 9",
  },
  {
    range: "10.10.1.0/24",
    name: "sn-app",
    what: "Subnet for app VMs",
    first: "Ch 0",
  },
  {
    range: "10.10.2.0/24",
    name: "sn-data",
    what: "Subnet for the database VM",
    first: "Ch 0",
  },
  {
    range: "10.10.3.0/24",
    name: "sn-run",
    what: "Subnet for Cloud Run outgoing traffic",
    first: "Ch 10",
  },
  {
    range: "10.10.32.0/20",
    name: "kade-psa-range",
    what: "Private services range, handed to Google",
    first: "Ch 9",
  },
  {
    range: "10.10.200.0/24",
    name: "PSC reserve",
    what: "Kept for Private Service Connect endpoints",
    first: "Ch 9",
  },
  {
    range: "10.10.0.0/16",
    name: "Kadé plan for kade-vpc",
    what: "Not a GCP setting, only our plan",
    first: "Ch 0",
  },
  {
    range: "10.20.0.0/16",
    name: "kade-staging",
    what: "Block for the staging project",
    first: "Ch 14",
  },
  {
    range: "10.128.0.0/9",
    name: "Auto mode ranges",
    what: "Used by the default network",
    first: "Ch 2",
  },
  {
    range: "172.16.1.0/24",
    name: "Office staff network",
    what: "Front desk, manager laptop, printer",
    first: "Fundamentals ch 6",
  },
  {
    range: "172.16.2.0/24",
    name: "Office warehouse network",
    what: "Scanner, packing PC, label printer",
    first: "Fundamentals ch 6",
  },
  {
    range: "172.16.0.0/16",
    name: "Kadé office",
    what: "Reaches kade-vpc over HA VPN from chapter 15",
    first: "Fundamentals ch 6",
  },
  {
    range: "192.168.1.23/32",
    name: "Your laptop",
    what: "On the home WiFi",
    first: "Fundamentals ch 1",
  },
  {
    range: "192.168.1.0/24",
    name: "Your home LAN",
    what: "Behind the home router",
    first: "Fundamentals ch 3",
  },
  {
    range: "203.0.113.45/32",
    name: "Your home, public side",
    what: "Home router WAN address",
    first: "Fundamentals ch 3",
  },
  {
    range: "198.51.100.20/32",
    name: "Kadé office, public side",
    what: "Office router WAN address",
    first: "Fundamentals ch 6",
  },
  {
    range: "34.120.88.10/32",
    name: "Load balancer front end",
    what: "kade-lb-ip, global anycast",
    first: "Fundamentals ch 33",
  },
  {
    range: "34.87.200.7/32",
    name: "Cloud NAT IP",
    what: "kade-nat-ip, on PayGate's allow list",
    first: "Ch 7",
  },
  {
    range: "35.191.0.0/16",
    name: "Google front ends and health checks",
    what: "Source of load balancer traffic to backends",
    first: "Ch 11",
  },
  {
    range: "130.211.0.0/22",
    name: "Google front ends and health checks",
    what: "Source of load balancer traffic to backends",
    first: "Ch 11",
  },
  {
    range: "35.235.240.0/20",
    name: "IAP TCP forwarding",
    what: "Source of SSH that comes through IAP",
    first: "Ch 6",
  },
  {
    range: "169.254.169.254/32",
    name: "Metadata server",
    what: "On every VM: DNS, time, tokens",
    first: "Ch 1",
  },
  {
    range: "199.36.153.8/30",
    name: "private.googleapis.com",
    what: "Google APIs without the internet",
    first: "Ch 9",
  },
  {
    range: "199.36.153.4/30",
    name: "restricted.googleapis.com",
    what: "Google APIs, VPC Service Controls only",
    first: "Ch 9",
  },
  {
    range: "169.254.0.0/16",
    name: "Link-local",
    what: "Only valid on one link, never routed",
    first: "Fundamentals ch 2",
    special: true,
  },
  {
    range: "10.0.0.0/8",
    name: "Private range",
    what: "Any network may reuse it",
    first: "Fundamentals ch 2",
    special: true,
  },
  {
    range: "172.16.0.0/12",
    name: "Private range",
    what: "Any network may reuse it",
    first: "Fundamentals ch 2",
    special: true,
  },
  {
    range: "192.168.0.0/16",
    name: "Private range",
    what: "Any network may reuse it",
    first: "Fundamentals ch 2",
    special: true,
  },
  {
    range: "0.0.0.0/0",
    name: "The whole internet",
    what: "Matches every address: the default route",
    first: "Fundamentals ch 5",
    special: true,
  },
];

const EXAMPLES = [
  "10.10.1.10",
  "35.191.8.20",
  "169.254.169.254",
  "10.10.32.3",
  "172.16.2.11",
  "8.8.8.8",
];

function matches(ip: number) {
  return RANGES.map((r) => {
    const [base, bits] = r.range.split("/");
    return { ...r, net: ipToInt(base)!, prefix: Number(bits) };
  })
    .filter((r) => (ip & maskOf(r.prefix)) >>> 0 === r.net)
    .sort((x, y) => y.prefix - x.prefix);
}

/** Where does an address belong? Every range it falls in, most specific first. */
export function AddrFind({ wide }: { wide?: boolean }) {
  const [value, setValue] = useState("10.10.1.10");
  const errorId = useId();
  const error = ipError(value);
  const found = error ? [] : matches(ipToInt(value)!);
  const best = found[0];

  return (
    <WidgetFrame wide={wide} label="Where does this address belong?">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <Field
          label="IPv4 address"
          value={value}
          onChange={setValue}
          invalid={!!error}
          describedBy={errorId}
        />
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Examples"
        >
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setValue(ex)}
              className={cn(
                "inline-flex min-h-9 cursor-pointer items-center rounded-[2px] border px-2.5 font-mono text-[13.5px] transition-colors",
                ex === value.trim()
                  ? "border-ink bg-ink text-ground"
                  : "border-rule-strong text-ink hover:border-ink hover:bg-sunk",
              )}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6" aria-live="polite">
        {error || !best ? (
          <FieldError id={errorId}>{error ?? "No range matched."}</FieldError>
        ) : (
          <>
            <p className="text-ink text-[16.5px] leading-[1.55] font-semibold text-pretty">
              {best.prefix === 0
                ? "Not in Kadé's address book. This is a public address somewhere on the internet, reached through the default route."
                : best.special
                  ? `Not one of Kadé's addresses, but it is in a special range: ${best.name.toLowerCase()}.`
                  : `Best match: ${best.name} (/${best.prefix}).`}
            </p>
            <table className="mt-4 w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-ink border-b">
                  <th className="text-ink py-2 pr-5 text-[14px] font-bold">
                    Range
                  </th>
                  <th className="text-ink py-2 pr-5 text-[14px] font-bold">
                    What it is
                  </th>
                  <th className="text-ink py-2 text-[14px] font-bold">
                    First used
                  </th>
                </tr>
              </thead>
              <tbody>
                {found.map((r, i) => (
                  <tr key={r.range} className="border-rule border-b align-top">
                    <td className="py-2.5 pr-5 font-mono text-[14px] whitespace-nowrap">
                      <span
                        className={cn(
                          "text-ink",
                          i === 0 && "dd-mark font-bold",
                        )}
                      >
                        {r.range}
                      </span>
                    </td>
                    <td className="py-2.5 pr-5 text-[15px] leading-[1.45]">
                      <span
                        className={cn("text-ink", i === 0 && "font-semibold")}
                      >
                        {r.name}
                      </span>
                      <span className="text-ink-muted mt-0.5 block text-[14px]">
                        {r.what}
                      </span>
                    </td>
                    <td className="text-ink-muted py-2.5 text-[14px] whitespace-nowrap">
                      {r.first}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-ink-muted mt-3 text-[14.5px]">
              {found.length} range{found.length > 1 ? "s" : ""} contain
              {found.length > 1 ? "" : "s"} {intToIp(ipToInt(value)!)}. The
              longest prefix, at the top, is the most specific answer.
            </p>
          </>
        )}
      </div>
    </WidgetFrame>
  );
}
