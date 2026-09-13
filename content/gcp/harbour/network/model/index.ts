import { validateArchitecture } from "@/lib/architecture/validate";
import { componentSections, componentSheets } from "./components";
import { defects } from "./defects";
import { edges } from "./edges";
import { groups } from "./groups";
import { journeys } from "./journeys";
import { loadBalancer } from "./load-balancer";
import { nodes } from "./nodes";
import { overlays } from "./overlays";
import { phases } from "./phases";

export const harbourNetwork = validateArchitecture("gcp/harbour/network", {
  name: "Harbour network architecture diagram",
  viewBox: { width: 1580, height: 1000 },
  overlays,
  groups,
  nodes,
  edges,
  phases,
  componentSections,
  componentSheets,
  defects,
  journeys,
  loadBalancer,
});
