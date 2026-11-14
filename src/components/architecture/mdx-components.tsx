import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import type { ArchitectureModel } from "@/lib/architecture/types";
import { ComponentSheets } from "./component-sheets";
import { DefectLink } from "./defect-link";
import { LoadBalancerExplorer } from "./load-balancer-explorer";
import { MapExplorer } from "./map-explorer";
import { PhaseSequence } from "./phase-sequence";

/**
 * Components available to the case study's MDX, pre-bound to its model. MDX
 * authors write `<MapExplorer />` and never import data or wire props.
 */
export function architectureMdxComponents(
  model: ArchitectureModel,
): MDXComponents {
  return {
    MapExplorer: (props: {
      invite?: string;
      overviewTitle?: string;
      children?: ReactNode;
    }) => <MapExplorer model={model} {...props} />,
    LoadBalancerExplorer: () => (
      <LoadBalancerExplorer chain={model.loadBalancer} />
    ),
    ComponentSheets: () => <ComponentSheets model={model} />,
    PhaseSequence: () => <PhaseSequence model={model} />,
    DefectTag: ({ id, children }: { id: string; children?: ReactNode }) => (
      <DefectLink id={id}>{children}</DefectLink>
    ),
  };
}
