// Each chapter's MDX, by slug. Imported only by the chapter route: anything
// that reaches these imports ships every widget they use.
import type { ChapterLoaders } from "@/lib/content/types";

export const chapters: ChapterLoaders = {
  "kade-on-gcp": () => import("./chapters/00-kade-on-gcp.mdx"),
  "the-mental-model-andromeda-no-layer-2": () => import("./chapters/01-the-mental-model-andromeda-no-layer-2.mdx"),
  "vpc-networks-and-subnets": () => import("./chapters/02-vpc-networks-and-subnets.mdx"),
  "ip-addressing": () => import("./chapters/03-ip-addressing.mdx"),
  "routing": () => import("./chapters/04-routing.mdx"),
  "firewall-vpc-firewall-rules": () => import("./chapters/05.1-firewall-vpc-firewall-rules.mdx"),
  "firewall-firewall-policies": () => import("./chapters/05.2-firewall-firewall-policies.mdx"),
  "admin-access-iap-tcp-forwarding": () => import("./chapters/06.1-admin-access-iap-tcp-forwarding.mdx"),
  "admin-access-os-login-and-no-external-ips": () => import("./chapters/06.2-admin-access-os-login-and-no-external-ips.mdx"),
  "egress-and-cloud-nat": () => import("./chapters/07-egress-and-cloud-nat.mdx"),
  "dns-inside-gcp": () => import("./chapters/08-dns-inside-gcp.mdx"),
  "private-access-to-google-services": () => import("./chapters/09-private-access-to-google-services.mdx"),
  "serverless-networking-cloud-run": () => import("./chapters/10-serverless-networking-cloud-run.mdx"),
  "load-balancing-the-family-and-how-to-choose": () => import("./chapters/11-load-balancing-the-family-and-how-to-choose.mdx"),
  "load-balancing-inside-the-https-load-balancer": () => import("./chapters/12.1-load-balancing-inside-the-https-load-balancer.mdx"),
  "load-balancing-vms-behind-the-load-balancer": () => import("./chapters/12.2-load-balancing-vms-behind-the-load-balancer.mdx"),
  "cloudflare-and-gcp": () => import("./chapters/13-cloudflare-and-gcp.mdx"),
  "a-second-vpc-briefly": () => import("./chapters/14-a-second-vpc-briefly.mdx"),
  "hybrid-vpn-and-interconnect": () => import("./chapters/15-hybrid-vpn-and-interconnect.mdx"),
  "observability-what-each-log-can-tell-you": () => import("./chapters/16.1-observability-what-each-log-can-tell-you.mdx"),
  "observability-monitoring-alerting-and-troubleshooting": () => import("./chapters/16.2-observability-monitoring-alerting-and-troubleshooting.mdx"),
  "governance-keeping-it-fixed": () => import("./chapters/17-governance-keeping-it-fixed.mdx"),
  "capstone-a-photo-through-a-vm-to-the-database": () => import("./chapters/18.1-capstone-a-photo-through-a-vm-to-the-database.mdx"),
  "capstone-a-payment-through-cloud-run-to-paygate": () => import("./chapters/18.2-capstone-a-payment-through-cloud-run-to-paygate.mdx"),
};
