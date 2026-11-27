// Harbour network track data.
import type { ComponentSheet } from "@/lib/architecture/types";

export const componentSections = [
  "Entry points",
  "Compute",
  "Data",
  "Network services",
  "Scopes and subnets",
  "Outside",
] as const;

export const componentSheets: Record<string, ComponentSheet> = {
  USERS: {
    section: "Entry points",
    purpose:
      "The people the platform exists for. Everything on the left band is outside Google, which is why the first real decision is what they are allowed to reach.",
    facts: [
      {
        label: "Reaches",
        value: "Cloudflare, and - as found - the run.app URL directly",
      },
    ],
  },
  CF: {
    section: "Entry points",
    purpose:
      "The CDN and WAF in front of everything. It terminates TLS at the edge, serves cached assets, and is meant to be the only way traffic arrives. As found it is not, because the load balancer accepts any source and the run.app URL answers the internet.",
    facts: [
      { label: "Role", value: "CDN + WAF" },
      {
        label: "Caching",
        value:
          "Overlaps with Cloud CDN - which one actually caches is a decision, not a default",
      },
      { label: "Origin lock", value: "Not in place" },
    ],
  },
  ADMIN: {
    section: "Entry points",
    purpose:
      "The internal campaign console. It goes through the same front door as shoppers rather than having a private path, which keeps one edge to secure instead of two.",
    facts: [
      { label: "Reaches", value: "Cloudflare → global ALB → harbour-api" },
    ],
  },
  DIRECT: {
    section: "Entry points",
    purpose:
      "Not a thing anyone built. It is the second front door that exists because harbour-api has ingress set to all, so its run.app URL still answers the internet. Every protection on the load balancer chain is real and every one of them can be walked around here.",
    facts: [
      {
        label: "Exists because",
        value: "ingress: all on the Cloud Run service",
      },
      { label: "Skips", value: "Cloudflare, Cloud CDN, the ALB, Cloud Armor" },
      {
        label: "Closed by",
        value: "Setting ingress to internal-and-cloud-load-balancing",
      },
    ],
  },
  GLB: {
    section: "Entry points",
    purpose:
      "The anycast front door. One IP announced from every Google edge, with Cloud Armor attached to the API backend service. It is a five-link chain rather than one object - the Load balancing tab opens it up.",
    facts: [
      { label: "Type", value: "Global external Application LB - proxy, L7" },
      { label: "IP", value: "34.120.95.195, reserved static" },
      {
        label: "Backends",
        value:
          "Serverless NEG to harbour-api; backend bucket for static assets",
      },
      { label: "Cloud Armor", value: "On the API backend service only" },
    ],
  },
  SCHED: {
    section: "Entry points",
    purpose:
      "Fires the nightly job with an authenticated OIDC request. It is on the map because it is an ingress path that is easy to forget when locking a service down - closing the public URL without accounting for the scheduler breaks the job.",
    facts: [
      { label: "Auth", value: "OIDC token" },
      { label: "Target", value: "harbour-jobs, via the load balancer" },
    ],
  },
  IAP: {
    section: "Entry points",
    purpose:
      "Identity-Aware Proxy TCP forwarding. It tunnels SSH through Google after checking who you are, so a VM needs no public IP and no open SSH port. This is what makes removing an external IP survivable for administration.",
    facts: [
      { label: "Source range", value: "35.235.240.0/20 - fixed and published" },
      {
        label: "Needs",
        value:
          "iap.googleapis.com enabled, roles/iap.tunnelResourceAccessor, and a firewall rule",
      },
      { label: "Note", value: "roles/editor does not include the tunnel role" },
      { label: "Also carries", value: "RDP, or any TCP port" },
    ],
  },
  HC: {
    section: "Entry points",
    purpose:
      "Health check probes originate from Google, not from the load balancer and not from your network. They need their own firewall rule, and the absence of one is the most common reason a working application shows every backend as unhealthy.",
    facts: [
      { label: "Source ranges", value: "35.191.0.0/16 and 130.211.0.0/22" },
      {
        label: "Allowed by",
        value: "allow-health-check, targeting the lb-health-check tag",
      },
      {
        label: "Does not probe",
        value: "Serverless NEGs - Cloud Run manages its own health",
      },
    ],
  },
  API: {
    section: "Compute",
    purpose:
      "The public API. It is the service everything else on the edge exists to protect, and it carries two of the register’s defects at once: a second unprotected door in, and an egress mode that silently breaks outbound whitelisting.",
    facts: [
      { label: "Type", value: "Cloud Run, asia-southeast1" },
      { label: "Ingress", value: "all - the run.app URL answers the internet" },
      { label: "Egress", value: "Direct VPC egress, private-ranges-only" },
      { label: "Service account", value: "api-sa@" },
      { label: "Reaches", value: "Cloud SQL, Redis, PayGate, the billing API" },
    ],
  },
  WORKER: {
    section: "Compute",
    purpose:
      "Consumes the queue. It is internal-only and already configured the way the API should be, which makes it the useful comparison when reading the API’s settings.",
    facts: [
      { label: "Type", value: "Cloud Run, asia-southeast1" },
      { label: "Ingress", value: "internal" },
      { label: "Egress", value: "Direct VPC egress, all-traffic" },
      { label: "Service account", value: "worker-sa@" },
      { label: "Reaches", value: "rabbitmq-1 on 5672" },
    ],
  },
  JOBS: {
    section: "Compute",
    purpose:
      "Nightly batch work, triggered by Cloud Scheduler. Its subnet has Private Google Access on, which is why it can read Secret Manager without any external IP - the thing the broker cannot do.",
    facts: [
      { label: "Type", value: "Cloud Run, asia-southeast1" },
      { label: "Ingress", value: "internal-and-cloud-load-balancing" },
      { label: "Egress", value: "Direct VPC egress, all-traffic" },
      { label: "Service account", value: "jobs-sa@" },
    ],
  },
  LEGACY: {
    section: "Compute",
    purpose:
      "The monolith being migrated away from. Every instance has its own public address, which means each one egresses as itself and Cloud NAT is ignored entirely - so there is no shared, stable, whitelistable egress identity for this tier.",
    facts: [
      { label: "Type", value: "Managed instance group, 3–10 VMs" },
      { label: "Autoscaling", value: "On CPU" },
      {
        label: "Autohealing",
        value: "Uses the same health check as the load balancer",
      },
      { label: "External IP", value: "Yes, per instance" },
      { label: "Tags", value: "legacy, lb-health-check" },
    ],
  },
  BASTION: {
    section: "Compute",
    purpose:
      "The jump box, and the clearest example of a control that IAP makes unnecessary. Its whole reason to exist is being reachable, and once access is identity-based it does not need to be reachable at all.",
    facts: [
      { label: "Type", value: "VM, sn-a-mgmt" },
      { label: "External IP", value: "Yes" },
      { label: "SSH", value: "Open to 0.0.0.0/0" },
      { label: "Login mechanism", value: "Metadata SSH keys, not OS Login" },
      { label: "Tags", value: "bastion" },
    ],
  },
  RABBIT: {
    section: "Compute",
    purpose:
      "The message broker. It is correctly private with no external IP, and it is broken anyway - its subnet has Private Google Access off, so it cannot reach the logging API or Secret Manager at all. Doing half of the no-external-IP design is worse than doing none of it.",
    facts: [
      { label: "Type", value: "VM, sn-a-data" },
      { label: "External IP", value: "No" },
      { label: "Ingress", value: "5672 from the app subnet" },
      {
        label: "Outbound",
        value: "Cannot reach Google APIs - PGA is off on its subnet",
      },
      { label: "Tags", value: "broker" },
    ],
  },
  ILB: {
    section: "Compute",
    purpose:
      "Fronts the legacy MIG for internal callers. It cannot be created at all, because a regional proxy load balancer needs a proxy-only subnet and none exists - a dependency that is invisible until the create command fails.",
    facts: [
      { label: "Type", value: "Regional internal Application LB - proxy, L7" },
      { label: "Blocked by", value: "No REGIONAL_MANAGED_PROXY subnet" },
      { label: "Health check", value: "TCP on port 80" },
      { label: "Cloud Armor", value: "None attached" },
    ],
  },
  SQL: {
    section: "Data",
    purpose:
      "The production database, reachable over the public internet behind an IP allow-list. The private path it should be using already exists and is active - Redis is on it. The work is pointing the database at a path that is already built.",
    facts: [
      { label: "Type", value: "Cloud SQL for PostgreSQL" },
      { label: "Exposure", value: "Public IP + authorized networks" },
      {
        label: "Private path",
        value: "PSA peering exists but privateNetwork is not set",
      },
      { label: "Runs in", value: "Google’s managed tenant, not your project" },
    ],
  },
  REDIS: {
    section: "Data",
    purpose:
      "Sessions and cache. Worth looking at closely because it is what the database should look like: a private IP drawn from the reserved PSA range, reachable only from the VPC, with no allow-list to maintain.",
    facts: [
      { label: "Type", value: "Memorystore for Redis" },
      { label: "Exposure", value: "Private IP from 10.90.0.0/16" },
      { label: "Reached over", value: "The existing PSA peering" },
    ],
  },
  SQLR: {
    section: "Data",
    purpose:
      "Read replica in the secondary region. Standing by, and it inherits whatever exposure the primary has.",
    facts: [
      { label: "Region", value: "asia-south1" },
      { label: "Exposure", value: "Same as the primary" },
    ],
  },
  GCS: {
    section: "Data",
    purpose:
      "Static assets, served through the load balancer as a backend bucket with Cloud CDN on. Also the thing a private VM needs Private Google Access to reach.",
    facts: [
      {
        label: "Reached by",
        value: "Backend bucket on the global ALB; PGA from inside the VPC",
      },
      { label: "Cloud CDN", value: "On" },
    ],
  },
  SECRET: {
    section: "Data",
    purpose:
      "Config and credentials. It is a plain Google API, which is exactly why Private Google Access matters: a VM with no external IP and no PGA cannot read its own secrets.",
    facts: [
      { label: "Access control", value: "IAM only" },
      { label: "Reached by", value: "PGA, or a PSC endpoint" },
    ],
  },
  ROUTER: {
    section: "Network services",
    purpose:
      "A Cloud Router that does no routing. It exists purely to host the NAT configuration, which is a completely normal setup and the reason a Cloud Router can appear in a project with no BGP anywhere.",
    facts: [
      { label: "Region", value: "asia-southeast1" },
      { label: "BGP peers", value: "None" },
      { label: "Hosts", value: "Cloud NAT" },
    ],
  },
  NAT: {
    section: "Network services",
    purpose:
      "Gives private VMs outbound internet access, and gives everything behind it one stable, known egress address. It is configuration, not an appliance - no instance, no bandwidth ceiling, no single point of failure. It does nothing for a VM that has its own external IP.",
    facts: [
      { label: "Scope", value: "Regional - one NAT covers asia-southeast1" },
      {
        label: "Addresses",
        value: "Two, manually reserved, so the egress IP is stable",
      },
      { label: "Used by", value: "Only VMs without external IPs" },
      {
        label: "Rations",
        value: "Ports, not addresses - each IP has about 64,000",
      },
    ],
  },
  PSA: {
    section: "Network services",
    purpose:
      "The reservation and peering that let Google-managed services hold private IPs inside your address space. Built on real VPC peering, so it inherits non-transitivity - which is exactly what the partner network keeps running into.",
    facts: [
      { label: "Reserved range", value: "10.90.0.0/16" },
      { label: "Peering", value: "servicenetworking.googleapis.com, active" },
      { label: "In use by", value: "Memorystore. Not yet by Cloud SQL." },
      {
        label: "Inherits",
        value: "Non-transitivity, and no overlapping ranges",
      },
    ],
  },
  PSC: {
    section: "Network services",
    purpose:
      "Endpoint IPs inside your own subnet that forward to a service elsewhere. Nothing is peered, so there is no transitivity problem, and each endpoint is a single IP you can firewall precisely.",
    facts: [
      { label: "Range", value: "10.99.0.0/24" },
      { label: "10.99.0.10", value: "The log vendor’s published service" },
      {
        label: "10.99.0.20",
        value:
          "Google APIs - the controllable alternative to PGA’s shared ranges",
      },
    ],
  },
  VPN: {
    section: "Network services",
    purpose:
      "Planned HA VPN to the office, with BGP on the Cloud Router. Drawn now and dimmed so the layout never has to be redrawn when dynamic routing arrives.",
    facts: [
      { label: "State", value: "Not built" },
      {
        label: "Would carry",
        value: "Dynamic routes learned over BGP, rather than static entries",
      },
    ],
  },
  PEER: {
    section: "Network services",
    purpose:
      "VPC peering to the partner network. It works exactly as designed and still fails to do what the partner expects, because peering does not chain - no firewall rule or route can make it transitive.",
    facts: [
      { label: "Peer", value: "partner-vpc, 172.20.0.0/16" },
      {
        label: "Carries",
        value: "Subnet routes between the two directly connected VPCs",
      },
      {
        label: "Cannot carry",
        value: "Traffic onward across the PSA peering to Cloud SQL or Redis",
      },
    ],
  },
  SNB: {
    section: "Network services",
    purpose:
      "Failover capacity in the secondary region. Empty today, and on the map so the second region is visible rather than implied.",
    facts: [
      { label: "Range", value: "10.20.0.0/20" },
      { label: "Contents", value: "None yet" },
    ],
  },
  G_POL: {
    section: "Scopes and subnets",
    purpose:
      "Where an organization or folder firewall policy would sit. Nothing exists here, which means nothing sets a floor above the project - and the project is exactly where the trust problem is, since anyone with firewall permission can delete any rule.",
    facts: [
      { label: "Exists", value: "No" },
      {
        label: "Would be evaluated",
        value: "Before any VPC rule, and cannot be overridden from below",
      },
      {
        label: "Would enforce",
        value:
          "Baselines like no SSH or RDP from the internet, across every project underneath",
      },
    ],
  },
  G_VPC: {
    section: "Scopes and subnets",
    purpose:
      "The network itself, and the only place you control routes and firewall rules directly. Custom mode, so every range in it was a decision rather than a default.",
    facts: [
      { label: "Mode", value: "Custom - no automatic subnets" },
      { label: "Routing mode", value: "Global" },
      {
        label: "Host project",
        value: "harbour-net-prod, shared with the workload projects",
      },
      {
        label: "Ingress",
        value:
          "One allow-all rule at priority 1000 makes every narrow rule decoration",
      },
      {
        label: "Egress",
        value:
          "No rules at all, so the implied allow at 65535 governs everything",
      },
    ],
  },
  G_REGA: {
    section: "Scopes and subnets",
    purpose:
      "The primary region. Everything that serves traffic lives here; the second region is standby.",
    facts: [
      { label: "Region", value: "asia-southeast1" },
      { label: "Address block", value: "10.10.0.0/16" },
    ],
  },
  G_REGB: {
    section: "Scopes and subnets",
    purpose:
      "Secondary region, standing by. On the map from the start so cross-region routing has somewhere to go when it arrives.",
    facts: [
      { label: "Region", value: "asia-south1" },
      { label: "Address block", value: "10.20.0.0/16" },
    ],
  },
  G_APP: {
    section: "Scopes and subnets",
    purpose:
      "Where the workloads live - Cloud Run services attached by Direct VPC Egress, and the legacy MIG. Private Google Access is on, which is the prerequisite for removing external IPs from anything in it.",
    facts: [
      { label: "Range", value: "10.10.0.0/20 - 4,091 usable" },
      { label: "PGA", value: "On" },
      {
        label: "Holds",
        value: "harbour-api, harbour-worker, harbour-jobs, legacy-api",
      },
    ],
  },
  G_MGMT: {
    section: "Scopes and subnets",
    purpose:
      "Administrative access only. Kept separate from the app subnet so the rules that govern getting in are not tangled with the rules that govern serving traffic.",
    facts: [
      { label: "Range", value: "10.10.16.0/24" },
      { label: "PGA", value: "On" },
      { label: "Holds", value: "bastion" },
    ],
  },
  G_DATA: {
    section: "Scopes and subnets",
    purpose:
      "Where the broker sits. Private Google Access is off here, which breaks every VM in it that has no external IP - the one setting that undoes the benefit of making them private in the first place.",
    facts: [
      { label: "Range", value: "10.10.17.0/24" },
      { label: "PGA", value: "Off" },
      {
        label: "Effect",
        value:
          "rabbitmq-1 cannot reach logging, Secret Manager or Cloud Storage",
      },
    ],
  },
  G_PROXY: {
    section: "Scopes and subnets",
    purpose:
      "A subnet that holds none of your resources. Google puts regional load balancer proxies in it, and without one the internal ALB simply cannot be created. It is invisible until a create command fails with a message that does not obviously say this.",
    facts: [
      { label: "Range", value: "10.10.250.0/24" },
      { label: "Purpose", value: "REGIONAL_MANAGED_PROXY" },
      { label: "State", value: "Never created" },
      {
        label: "Placed at",
        value:
          "The far end of the region block, clear of ranges you will grow into",
      },
    ],
  },
  G_MANAGED: {
    section: "Scopes and subnets",
    purpose:
      "Google’s own project, which you cannot see. Cloud SQL and Memorystore actually run here, not in your VPC - which is the entire reason Private Service Access has to exist.",
    facts: [
      {
        label: "Contains",
        value: "harbour-pg, harbour-cache, the read replica",
      },
      {
        label: "Reached by",
        value:
          "A VPC peering from your network, drawing IPs from your reserved range",
      },
    ],
  },
  G_APIS: {
    section: "Scopes and subnets",
    purpose:
      "Google’s public API endpoints. They live on the internet, which is why removing a VM’s external IP breaks access to them unless Private Google Access is on.",
    facts: [
      {
        label: "Contains",
        value: "Cloud Storage, Secret Manager, logging, and the rest",
      },
      {
        label: "Reached by",
        value: "PGA (199.36.153.8/30) or a PSC endpoint you control",
      },
    ],
  },
  G_EXT: {
    section: "Scopes and subnets",
    purpose:
      "Everything the platform depends on but does not run. The band that makes egress a design problem rather than an afterthought.",
    facts: [
      {
        label: "Contains",
        value: "PayGate, the billing API, Firebase Cloud Messaging",
      },
    ],
  },
  ONPREM: {
    section: "Outside",
    purpose:
      "The office network, to be reached over HA VPN. Drawn now so dynamic routing has both ends when it arrives.",
    facts: [
      { label: "Range", value: "192.168.0.0/16" },
      { label: "Reached by", value: "HA VPN, not yet built" },
    ],
  },
  PARTNER: {
    section: "Outside",
    purpose:
      "A partner’s VPC, peered in. It expects to reach the database through that peering, which cannot work no matter what is configured - the fix is a path of its own, not a rule.",
    facts: [
      { label: "Range", value: "172.20.0.0/16" },
      { label: "Reached by", value: "VPC peering" },
      {
        label: "Cannot reach",
        value: "Cloud SQL or Redis, because peering does not chain",
      },
    ],
  },
  PAY: {
    section: "Outside",
    purpose:
      "The payment gateway, and the single external requirement that shapes the whole egress design. It whitelists your egress address, which is what forces manually reserved NAT addresses and all-traffic on Cloud Run.",
    facts: [
      {
        label: "Constraint",
        value: "Accepts requests only from registered IPs",
      },
      { label: "Needs", value: "A stable, known egress address" },
      {
        label: "Breaks when",
        value:
          "Cloud Run egress is private-ranges-only, since calls then leave from a random Google address",
      },
    ],
  },
  BILL: {
    section: "Outside",
    purpose:
      "A third-party API published as a hostname whose addresses change. The reason FQDN objects exist - you allow the name rather than chasing IP ranges.",
    facts: [
      { label: "Hostname", value: "api.billing.example" },
      { label: "Allowed by", value: "An FQDN egress rule, not an IP list" },
    ],
  },
  FCM: {
    section: "Outside",
    purpose:
      "Push notifications to user devices. Ordinary outbound traffic, included so the egress picture is complete rather than only showing the interesting cases.",
    facts: [{ label: "Batch size", value: "500 tokens" }],
  },
  SAAS: {
    section: "Outside",
    purpose:
      "A log vendor’s published service, consumed through a PSC endpoint instead of over the internet. Neither side exposes anything publicly - GCP’s equivalent of PrivateLink.",
    facts: [
      { label: "Reached by", value: "PSC endpoint 10.99.0.10" },
      { label: "Exposure", value: "None on either side" },
    ],
  },
};
