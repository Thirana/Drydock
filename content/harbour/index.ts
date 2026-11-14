import type { CaseStudy } from "@/lib/content/types";
import { harbourNetwork } from "./model";
import Overview from "./overview.mdx";
import Components from "./platform/components.mdx";
import IpPlan from "./platform/ip-plan.mdx";
import LoadBalancing from "./platform/load-balancing.mdx";
import Map from "./platform/map.mdx";

export const harbour: CaseStudy = {
  title: "Harbour",
  kind: "A marketplace on Google Cloud",
  heading: "Harbour",
  summary:
    "A small marketplace on Google Cloud, built the way real platforms get built: one reasonable shortcut at a time. Read how it works, follow its traffic, then take apart the 17 things wrong with it.",
  disclaimer: "Harbour is fictional. The shape is real.",
  meta: [
    { label: "business", value: "Online marketplace · independent sellers" },
    { label: "team", value: "Four engineers, one of them on platform" },
    { label: "host project", value: "harbour-net-prod" },
    { label: "VPC", value: "harbour-vpc · custom mode · global routing" },
    { label: "regions", value: "asia-southeast1 · asia-south1 standby" },
  ],
  Overview,
  architecture: harbourNetwork,
  platform: [
    {
      slug: "map",
      icon: "map",
      title: "Map",
      description:
        "How the platform hangs together, with overlays per concern and a phase rail through the order of the fixes.",
      Content: Map,
    },
    {
      slug: "ip-plan",
      icon: "grid",
      title: "IP plan",
      description:
        "Every range, why it is that size, and the ranges you do not own but must allow anyway.",
      Content: IpPlan,
    },
    {
      slug: "components",
      icon: "server",
      title: "Components",
      description:
        "External IP, ingress, egress, tags and service account per component - what you check before writing any rule.",
      lead: "Every box on the map, what it is for, and the facts you check before writing any rule. Clicking a box on the map shows one of these on its own, with what it talks to.",
      Content: Components,
    },
    {
      slug: "load-balancing",
      icon: "layers",
      title: "Load balancing",
      description: "The five-link proxy chain, drawn at its own scale.",
      Content: LoadBalancing,
    },
  ],
};
