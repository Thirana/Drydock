// Harbour network track data. Positions are in SVG viewBox units (1580 × 1064 for the map).
import type { MapShowcase } from "@/lib/architecture/types";

export const showcase: MapShowcase = {
  // Ordered by the phase that closes them, so the pins clear in sequence.
  callouts: [
    {
      defect: "D2",
      at: "BASTION",
      anchor: "G_MGMT",
      label: "SSH open to the internet",
      placement: "top",
    },
    {
      defect: "D6",
      at: "DIRECT",
      label: "run.app walks around the WAF",
      placement: "top",
    },
    {
      defect: "D5",
      at: "SQL",
      anchor: "G_MANAGED",
      label: "Database on a public IP",
      placement: "top",
    },
  ],
  // Entry points, the load balancer, the app subnet and the bastion.
  focus: { x: 16, y: 140, width: 720, height: 480 },
  // Landing page only: each component appears with the phase that builds or
  // starts relying on it. Not literal — several exist as found.
  reveals: [
    { phase: 1, boxes: ["G_PROXY", "ILB"] },
    { phase: 2, boxes: ["IAP"] },
    { phase: 4, boxes: ["PSA"] },
    { phase: 5, boxes: ["ROUTER", "NAT"] },
    { phase: 6, boxes: ["PSC", "SAAS"] },
  ],
};
