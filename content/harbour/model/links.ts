import type { ArchLink } from "@/lib/architecture/types";

/**
 * Who talks to whom as found, beyond the wires the map draws. Each one is
 * stated on a component sheet or walked by a journey.
 */
export const links: ArchLink[] = [
  // product-page: the query leaves for the database's public IP (D5).
  { from: "API", to: "SQL", label: "public IP", state: "broken" },
  { from: "API", to: "REDIS", label: "private IP via PSA" },
  // card-charge: private-ranges-only egress skips NAT (D7).
  { from: "API", to: "PAY", label: "a random Google IP", state: "broken" },
  { from: "API", to: "BILL", label: "HTTPS" },
  { from: "GLB", to: "GCS", label: "backend bucket" },
  // nightly-job.
  { from: "JOBS", to: "SECRET", label: "credentials" },
  { from: "JOBS", to: "RABBIT", label: "publish · 5672" },
  // ssh-session: onward from the bastion.
  { from: "BASTION", to: "RABBIT", label: "SSH · 22" },
  // PGA is off on sn-a-data (D4).
  { from: "RABBIT", to: "SECRET", label: "PGA off", state: "broken" },
  { from: "RABBIT", to: "G_APIS", label: "logging · PGA off", state: "broken" },
];
