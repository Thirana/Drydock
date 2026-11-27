import { validateArchitecture } from "@/lib/architecture/validate";
import { addressPlan } from "./address-plan";
import { componentSections, componentSheets } from "./components";
import { defects } from "./defects";
import { edges } from "./edges";
import { groups } from "./groups";
import { journeys } from "./journeys";
import { links } from "./links";
import { loadBalancer } from "./load-balancer";
import { nodes } from "./nodes";
import { overlays } from "./overlays";
import { phases } from "./phases";

export const harbourNetwork = validateArchitecture("harbour", {
  name: "Harbour network architecture diagram",
  viewBox: { width: 1440, height: 1132 },
  overlays,
  groups,
  nodes,
  edges,
  links,
  phases,
  componentSections,
  componentSheets,
  defects,
  journeys,
  loadBalancer,
  addressPlan,
});
