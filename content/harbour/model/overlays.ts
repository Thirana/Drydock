// Harbour network track data.
import type { Overlay } from "@/lib/architecture/types";

export const overlays: Overlay[] = [
  { key: "all", label: "Everything" },
  { key: "ingress", label: "Ingress" },
  { key: "egress", label: "Egress" },
  { key: "lb", label: "Load balancing" },
  { key: "access", label: "Secure access" },
  { key: "private", label: "Private connectivity" },
  { key: "routing", label: "Routing" },
  { key: "firewall", label: "Firewall enforcement" },
  { key: "defects", label: "Defects" },
];
