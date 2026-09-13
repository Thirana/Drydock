// Harbour network track data. Positions are in SVG viewBox units (1580 × 1000 for the map).
import type { MapShowcase } from "@/lib/architecture/types";

export const showcase: MapShowcase = {
  // Ordered by the phase that closes them, so the pins clear in sequence.
  callouts: [
    {
      defect: "D2",
      at: "BASTION",
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
      label: "Database on a public IP",
      placement: "left",
    },
  ],
  // Entry points, the load balancer and the app subnet.
  focus: { x: 16, y: 140, width: 720, height: 420 },
};
