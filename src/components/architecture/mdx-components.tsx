import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { AddressPlan } from "@/components/harbour/address-plan";
import type { ArchitectureModel } from "@/lib/architecture/types";
import { ComponentAtlas } from "./component-atlas";
import { ComponentSheets } from "./component-sheets";
import { DefectLink } from "./defect-link";
import { LoadBalancerExplorer } from "./load-balancer-explorer";
import { LoadBalancerSymptoms } from "./load-balancer-symptoms";
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
    LoadBalancerSymptoms: () => (
      <LoadBalancerSymptoms chain={model.loadBalancer} />
    ),
    ComponentAtlas: () => <ComponentAtlas model={model} />,
    ComponentSheets: () => <ComponentSheets model={model} />,
    AddressPlan: () =>
      model.addressPlan ? <AddressPlan plan={model.addressPlan} /> : null,
    PhaseSequence: () => <PhaseSequence model={model} />,
    DefectTag: ({ id, children }: { id: string; children?: ReactNode }) => (
      <DefectLink id={id}>{children}</DefectLink>
    ),
  };
}
