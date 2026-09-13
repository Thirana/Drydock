// Harbour network track data.
import type { Phase } from "@/lib/architecture/types";

export const phases: Phase[] = [
  {
    number: 0,
    name: "As found",
    goal: "The architecture as it exists today, with every defect in place.",
    changes: "Nothing yet. This is the starting position.",
    prerequisites: "—",
    risk: "—",
    verify:
      "Run the detect command on each register card and confirm the finding is real before changing anything.",
  },
  {
    number: 1,
    name: "Groundwork",
    goal: "Add the things that break nothing and unblock almost everything else.",
    rationale:
      "Purely additive. Nothing can break, and both changes unblock later phases.",
    changes:
      "Private Google Access on the data subnet, so the broker can reach Google APIs at all. The proxy-only subnet created, so a regional internal load balancer can exist.",
    prerequisites: "None. Both changes are purely additive.",
    risk: "Low. Nothing existing depends on either being absent.",
    riskLevel: "low",
    verify:
      "privateIpGoogleAccess reads true on sn-a-data, the broker writes a log line, and the internal ALB forwarding rule now creates without error.",
  },
  {
    number: 2,
    name: "Secure access",
    goal: "Make administrative access identity-based, so nothing later has to be done over a public SSH port.",
    rationale:
      "Depends on nothing, and everything after it is safer once administrative access no longer runs over a public SSH port.",
    changes:
      "An IAP-only SSH rule added and verified, then the world-open rule deleted. The bastion loses its external IP. OS Login replaces metadata SSH keys.",
    prerequisites:
      "The IAP API enabled and roles/iap.tunnelResourceAccessor granted to every engineer who needs access.",
    risk: "High if the order is wrong. Deleting the old rule before verifying the new path locks everyone out of every VM.",
    riskLevel: "high",
    verify:
      "IAP SSH succeeds to every VM before the world-open rule is deleted, and again afterwards. --troubleshoot checks all three IAP requirements at once.",
  },
  {
    number: 3,
    name: "Close the bypasses",
    goal: "Make the protections that already exist actually apply, before spending effort adding more.",
    rationale:
      "Makes the protections that already exist actually apply. Cheaper than adding new ones.",
    changes:
      "Cloud Run ingress set to internal-and-cloud-load-balancing, closing the run.app door. The origin locked to the CDN’s published ranges with an address group.",
    prerequisites:
      "Know which hostnames are actually proxied by the CDN — you can only lock an origin for traffic that comes through it.",
    risk: "Medium. Locking the origin to the wrong range set takes the site down.",
    riskLevel: "medium",
    verify:
      "The run.app URL stops answering from the internet, the site still loads through the CDN, and a direct request to the load balancer IP is refused.",
  },
  {
    number: 4,
    name: "Private data path",
    goal: "Get production database traffic off the public internet, and remove the external IPs that depended on it.",
    rationale:
      "Needs Private Google Access from phase 1, and the external IPs cannot come off until the database is reachable privately.",
    changes:
      "Cloud SQL moved to a private IP over the existing PSA peering, and its public IP and authorized-networks list removed. The legacy MIG instances lose their external addresses.",
    prerequisites:
      "PGA from phase 1. The reserved PSA range confirmed — peering metadata and the reserved-ranges list can disagree.",
    risk: "High. The database endpoint changes, so every client connection string changes with it.",
    riskLevel: "high",
    verify:
      "Applications connect on the private IP, the authorized-networks list is empty, and the MIG instances still reach Google APIs and the internet with no public address.",
  },
  {
    number: 5,
    name: "Egress and load balancer",
    goal: "Give outbound traffic one known identity, and fix the load balancer settings that fail quietly.",
    rationale:
      "The egress deny needs every external destination enumerated first, which you only know once the NAT path is proven.",
    changes:
      "Cloud Run egress switched to all-traffic so internet calls leave through Cloud NAT. Deny-all egress with a short FQDN allow-list. HTTP health check replacing TCP. Cloud Armor attached to the second backend service. A minimum TLS version set.",
    prerequisites:
      "The NAT path proven end to end, and every external destination the platform actually calls enumerated — an incomplete allow-list breaks things you did not know were there.",
    risk: "High for the egress deny. Medium for the rest.",
    riskLevel: "high",
    verify:
      "The payment gateway sees a reserved NAT address. A hung instance now leaves rotation. Both backend services report a security policy. The proxy refuses TLS 1.0.",
  },
  {
    number: 6,
    name: "Govern and tighten",
    goal: "Remove the broad rule everything has been quietly relying on, and put a floor under the project that a project owner cannot remove.",
    rationale:
      "Deleting the allow-all rule goes last, because it is the moment you find out what was quietly relying on it.",
    changes:
      "The allow-all ingress rule deleted. An organization-level hierarchical policy denying SSH and RDP from the internet. The partner moved to a PSC endpoint of their own.",
    prerequisites:
      "Every service has its own narrow rule, proven with get-effective-firewalls per VM. This is why it goes last.",
    risk: "High. Deleting the broad rule is the moment you find out what was depending on it.",
    riskLevel: "high",
    verify:
      "get-effective-firewalls on each VM shows only intended rules, the org policy appears in the network-level effective firewalls, and the partner reaches the database without the peering.",
  },
];
