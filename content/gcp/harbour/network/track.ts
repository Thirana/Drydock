import type { Track } from "@/lib/content/types";
import { harbourNetwork } from "./model";
import About from "./views/about.mdx";
import Components from "./views/components.mdx";
import Defects from "./views/defects.mdx";
import IpPlan from "./views/ip-plan.mdx";
import Journeys from "./views/journeys.mdx";
import LoadBalancing from "./views/load-balancing.mdx";
import Map from "./views/map.mdx";

export const network: Track = {
  slug: "network",
  title: "Network",
  heading: "Harbour — GCP network reference architecture",
  summary:
    "A fictional marketplace platform, built deliberately wrong. Every networking concept from the curriculum lands somewhere on this map, and every defect below gets closed by a specific module.",
  meta: [
    { label: "org", value: "harbour.example" },
    { label: "host project", value: "harbour-net-prod" },
    { label: "VPC", value: "harbour-vpc · custom mode · global routing" },
    { label: "state", value: "v0 as found · v1 target" },
    {
      label: "covers",
      value:
        "routing · firewall · policies · private connectivity · egress · load balancing · secure access",
    },
  ],
  architecture: harbourNetwork,
  views: [
    {
      slug: "about",
      icon: "book",
      title: "About",
      description:
        "What Harbour is, how to read it, and why the order of the fixes is the point.",
      Content: About,
    },
    {
      slug: "map",
      icon: "map",
      title: "Map",
      description:
        "How the platform hangs together, with overlays per concern and a phase rail through the remediation sequence.",
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
        "External IP, ingress, egress, tags and service account per component — what you check before writing any rule.",
      Content: Components,
    },
    {
      slug: "load-balancing",
      icon: "layers",
      title: "Load balancing",
      description: "The five-link proxy chain, drawn at its own scale.",
      Content: LoadBalancing,
    },
    {
      slug: "journeys",
      icon: "route",
      title: "Packet journeys",
      description:
        "Six flows traced hop by hop at any phase of the sequence, with failing hops marked.",
      Content: Journeys,
    },
    {
      slug: "defects",
      icon: "alert",
      title: "Defects",
      description:
        "The defect register, ordered by phase: how to detect each one, what it teaches, what blocks it, and the change that closes it.",
      Content: Defects,
    },
  ],
};
