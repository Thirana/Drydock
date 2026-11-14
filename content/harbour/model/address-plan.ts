import type { AddressRange } from "@/lib/architecture/types";

/** Top-level ranges. The IP plan view and the landing preview both read these. */
export const addressPlan: AddressRange[] = [
  {
    cidr: "10.10.0.0/16",
    tone: "compute",
    label: "Region A - asia-southeast1 (primary)",
  },
  {
    cidr: "10.20.0.0/16",
    tone: "external",
    label: "Region B - asia-south1 (secondary)",
  },
  {
    cidr: "10.90.0.0/16",
    tone: "private",
    label: "Reserved for Private Service Access",
  },
  {
    cidr: "10.99.0.0/24",
    tone: "data",
    label: "Private Service Connect endpoint IPs",
  },
  {
    cidr: "172.20.0.0/16",
    tone: "edge",
    label: "partner-vpc, reached by peering",
  },
  {
    cidr: "192.168.0.0/16",
    tone: "edge",
    label: "Office / on-prem, reached by HA VPN",
  },
];
