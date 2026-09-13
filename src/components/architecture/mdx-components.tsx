import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import type { ArchitectureModel } from "@/lib/architecture/types";
import { ComponentSheets } from "./component-sheets";
import { DefectLink } from "./defect-link";
import { DefectRegister } from "./defect-register";
import { JourneyExplorer } from "./journey-explorer";
import { LoadBalancerExplorer } from "./load-balancer-explorer";
import { MapExplorer } from "./map-explorer";
import { PhaseSequence } from "./phase-sequence";

/**
 * Components available to a track's MDX views, pre-bound to its model. MDX
 * authors write `<MapExplorer />` and never import data or wire props.
 */
export function architectureMdxComponents(
  model: ArchitectureModel,
  hrefs: { defects: string },
): MDXComponents {
  return {
    MapExplorer: (props: {
      invite?: string;
      overviewTitle?: string;
      children?: ReactNode;
    }) => <MapExplorer model={model} defectsHref={hrefs.defects} {...props} />,
    JourneyExplorer: () => (
      <JourneyExplorer model={model} defectsHref={hrefs.defects} />
    ),
    DefectRegister: () => <DefectRegister model={model} />,
    LoadBalancerExplorer: () => (
      <LoadBalancerExplorer chain={model.loadBalancer} />
    ),
    ComponentSheets: () => (
      <ComponentSheets model={model} defectsHref={hrefs.defects} />
    ),
    PhaseSequence: () => <PhaseSequence model={model} />,
    DefectTag: ({ id, children }: { id: string; children?: ReactNode }) => (
      <DefectLink id={id} defectsHref={hrefs.defects}>
        {children}
      </DefectLink>
    ),
  };
}
