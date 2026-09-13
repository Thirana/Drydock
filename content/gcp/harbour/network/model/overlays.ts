// Harbour network track data.
import type { Overlay } from "@/lib/architecture/types";

export const overlays: Overlay[] = [
  { key: "all", label: "Everything" },
  { key: "ingress", label: "Ingress", tone: "edge" },
  { key: "egress", label: "Egress", tone: "edge" },
  { key: "lb", label: "Load balancing", tone: "edge" },
  { key: "access", label: "Secure access", tone: "compute" },
  { key: "private", label: "Private connectivity", tone: "private" },
  { key: "routing", label: "Routing", tone: "data" },
  { key: "firewall", label: "Firewall enforcement", tone: "compute" },
  { key: "defects", label: "Defects", tone: "danger" },
];
