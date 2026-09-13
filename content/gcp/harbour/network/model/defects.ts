// Harbour network track data.
import type { Defect } from "@/lib/architecture/types";

export const defects: Defect[] = [
  {
    id: "D1",
    title: "One allow rule opens everything",
    topic: "Rule scoping and priority",
    phase: 6,
    severity: "critical",
    blockedBy: ["D2", "D6", "D9"],
    symptom:
      "allow-all ingress from 0.0.0.0/0, all protocols, no target, priority 1000.",
    explanation:
      "It sits above the implied deny at 65535, so it is consulted first and always matches. Every other ingress rule in the project is decoration.",
    concept:
      "Priority and the implied deny — a rule at 1000 is consulted long before the implied deny at 65535, so one broad allow makes every narrow rule decoration.",
    detection:
      'gcloud compute firewall-rules list --format="table(\n  name,priority,direction,sourceRanges.list(),targetTags.list(),\n  allowed[].map().firewall_rule().list())" \\\n  --filter="direction=INGRESS AND sourceRanges:0.0.0.0/0"',
    before:
      "allow INGRESS · 0.0.0.0/0 · all protocols · no target · priority 1000",
    after:
      "Rule deleted. Each service keeps its own narrow rule, and the implied deny is reached again.",
    remediation:
      "gcloud compute firewall-rules delete allow-all\n\n# verify nothing depended on it, per VM, before deleting:\ngcloud compute instances network-interfaces get-effective-firewalls legacy-api-abc1 \\\n  --network-interface=nic0 --zone=asia-southeast1-b",
    applies: {
      G_VPC: { sub: "custom mode · narrow ingress · deny-all egress" },
    },
  },
  {
    id: "D2",
    title: "SSH open to the internet",
    topic: "IAP TCP forwarding",
    phase: 2,
    severity: "high",
    blockedBy: [],
    symptom: "Port 22 allowed from 0.0.0.0/0 on every VM.",
    explanation:
      "The fix is not a narrower IP list, it is removing the need for a public SSH port at all. IAP tunnels SSH through Google after an identity check, and all its traffic arrives from one fixed range — so the firewall narrows the network path to IAP only, and IAP narrows access to authorised identities only. Two narrow layers replacing one wide-open one. Three independent things must all be true for it to work: the iap.googleapis.com API enabled, roles/iap.tunnelResourceAccessor on the identity, and this firewall rule. roles/editor does not include the tunnel role.",
    concept:
      "Identity-based access beats network-based access. The fix is not a narrower IP list, it is removing the public port.",
    detection:
      'gcloud compute firewall-rules list \\\n  --filter="allowed.ports:22 AND sourceRanges:0.0.0.0/0"',
    before: "allow INGRESS · tcp:22 · source 0.0.0.0/0 · target all instances",
    after: "allow INGRESS · tcp:22 · source 35.235.240.0/20 · priority 900",
    remediation:
      '# ORDER MATTERS. You are changing how you reach the box while using that\n# same access to make the change. Add and verify before deleting anything.\n\n# 1. Additive. Opens nothing new — that range is only reachable after\n#    IAP has already checked your identity.\ngcloud compute firewall-rules create allow-ssh-from-iap \\\n  --network=harbour-vpc --direction=INGRESS --action=allow \\\n  --rules=tcp:22 --source-ranges=35.235.240.0/20 --priority=900\n\n# 2. VERIFY on every VM. Not optional — this is what stands between\n#    "SSH is now secure" and "nobody can SSH to production".\ngcloud compute ssh bastion --zone=asia-southeast1-b \\\n  --tunnel-through-iap --command="echo ok"\n\n# when it fails, this checks all three requirements at once:\ngcloud compute ssh bastion --zone=asia-southeast1-b \\\n  --tunnel-through-iap --troubleshoot\n\n# 3. ONLY after every VM verifies.\ngcloud compute firewall-rules delete default-allow-ssh',
    applies: { BASTION: { sub: "SSH via IAP only" } },
  },
  {
    id: "D3a",
    title: "Bastion carries an external IP",
    topic: "IAP TCP forwarding",
    phase: 2,
    severity: "medium",
    blockedBy: ["D2"],
    symptom: "The bastion has a public address so that someone can SSH to it.",
    explanation:
      "That is the entire reason a bastion exists, and IAP removes the reason. A VM with no external IP needs three things to keep working: IAP for inbound admin access, Private Google Access for Google APIs, and Cloud NAT for the internet. The bastion needs almost nothing outbound, so IAP alone makes its public address unnecessary — which is why this closes now while D3b waits.",
    concept:
      "An external IP is one of only two things that make a VM reachable from the internet. Removing it is the strongest single hardening step.",
    detection:
      'gcloud compute instances list \\\n  --filter="networkInterfaces[0].accessConfigs[0].natIP:*" \\\n  --format="table(name,zone,networkInterfaces[0].accessConfigs[0].natIP)"',
    before:
      "External IP on the bastion. Access controlled by network position.",
    after:
      "No external IP. Access controlled by identity, through the IAP tunnel.",
    remediation:
      '# only after the IAP rule is in place and verified (D2)\ngcloud compute instances delete-access-config bastion \\\n  --access-config-name="External NAT" --zone=asia-southeast1-b\n\n# prove it still works with no public address\ngcloud compute ssh bastion --zone=asia-southeast1-b --tunnel-through-iap',
    applies: { BASTION: { sub: "IAP · no external IP" } },
  },
  {
    id: "D3b",
    title: "legacy-api instances carry external IPs",
    topic: "Cloud NAT + Private Google Access",
    phase: 4,
    severity: "medium",
    blockedBy: ["D4", "D5"],
    symptom: "Every VM in the MIG has its own public address.",
    explanation:
      "Unlike the bastion, these VMs need real outbound access to Google APIs and the internet. Removing the addresses therefore depends on PGA being on, a NAT existing in the region, and the database migration in D5 so the VM reaches Postgres privately rather than through its whitelisted public address. Sequenced work, not a quick win.",
    concept:
      "Removing an external IP has prerequisites in both directions — inbound admin access, and outbound to both Google APIs and the internet.",
    detection:
      'gcloud compute instances list \\\n  --filter="networkInterfaces[0].accessConfigs[0].natIP:*" \\\n  --format="table(name,zone,tags.items.list())"\n\n# and check the prerequisites are in place first\ngcloud compute routers nats list --router=rtr-a --region=asia-southeast1',
    before:
      "Ephemeral external IP per instance. Each egresses as itself, so Cloud NAT is ignored.",
    after:
      "No external IPs. All egress leaves through Cloud NAT’s two reserved addresses.",
    remediation:
      '# 1. PGA first, or the VM loses Google API access the moment the IP goes\ngcloud compute networks subnets update sn-a-app \\\n  --region=asia-southeast1 --enable-private-ip-google-access\n\n# 2. confirm a NAT exists in this region\ngcloud compute routers nats describe harbour-nat \\\n  --router=rtr-a --region=asia-southeast1\n\n# 3. only then, and only after D5\ngcloud compute instances delete-access-config legacy-api-abc1 \\\n  --access-config-name="External NAT" --zone=asia-southeast1-b',
    applies: { LEGACY: { sub: "MIG · no external IP" } },
  },
  {
    id: "D4",
    title: "Private Google Access is off on the data subnet",
    topic: "The subnet flag",
    phase: 1,
    severity: "medium",
    blockedBy: [],
    symptom:
      "rabbitmq-1 cannot reach Secret Manager, Cloud Storage, or the logging API.",
    explanation:
      "The VM has no external IP, which is correct, but nothing gave it a private path to Google APIs. This is the flag you turn on before removing any external IP, not after.",
    concept:
      "Private Google Access is the flag that makes “no external IP” survivable. Turn it on before removing any address, never after.",
    detection:
      'gcloud compute networks subnets list \\\n  --filter="privateIpGoogleAccess=false" \\\n  --format="table(name,region,ipCidrRange,privateIpGoogleAccess)"',
    before: "privateIpGoogleAccess: false on sn-a-data",
    after:
      "privateIpGoogleAccess: true — Google API hostnames resolve to 199.36.153.8/30 from inside the subnet",
    remediation:
      'gcloud compute networks subnets update sn-a-data \\\n  --region=asia-southeast1 --enable-private-ip-google-access\n\ngcloud compute networks subnets describe sn-a-data \\\n  --region=asia-southeast1 --format="value(privateIpGoogleAccess)"',
    applies: { G_DATA: { sub: "10.10.17.0/24 · PGA on", tone: "compute" } },
  },
  {
    id: "D5",
    title: "Cloud SQL is on a public IP",
    topic: "Private Service Access",
    phase: 4,
    severity: "critical",
    blockedBy: [],
    symptom:
      "A public address guarded by an authorized-networks list containing home broadband addresses.",
    explanation:
      "Production database traffic rides the public internet. The PSA peering already exists and Redis already uses it. The work is pointing the database at a path that is already built.",
    concept:
      "Private Service Access — managed services live in Google’s tenant and reach your VPC over a peering, drawing private IPs from a range you reserve.",
    detection:
      'gcloud sql instances list --format="table(\n  name,settings.ipConfiguration.ipv4Enabled,\n  settings.ipConfiguration.privateNetwork,\n  settings.ipConfiguration.authorizedNetworks[].value.list())"',
    before: "Public IP + authorizedNetworks list. No privateNetwork set.",
    after:
      "Private IP drawn from 10.90.0.0/16 over the existing PSA peering. Public IP removed.",
    remediation:
      '# confirm what is actually reserved before migrating\ngcloud compute addresses list --global --filter="purpose=VPC_PEERING"\n\ngcloud sql instances patch harbour-pg \\\n  --network=projects/harbour-net-prod/global/networks/harbour-vpc \\\n  --no-assign-ip',
    applies: { SQL: { sub: "Cloud SQL · private IP via PSA" } },
  },
  {
    id: "D6",
    title: "Cloud Run ingress is left at all",
    topic: "Cloud Run ingress settings",
    phase: 3,
    severity: "critical",
    blockedBy: [],
    symptom:
      "harbour-api is fronted by a load balancer, but its run.app URL still answers the internet.",
    explanation:
      "That URL is a second front door with no CDN, no WAF, and no Cloud Armor. Anyone who finds it skips every protection on the chain.",
    concept:
      "A protection is only as good as the narrowest path around it. A WAF on the load balancer does nothing for a door that skips the load balancer.",
    detection:
      'gcloud run services list --format="yaml(metadata.name, metadata.annotations)" \\\n  | grep -B2 ingress\n\n# then confirm the bypass actually answers\ncurl -sI https://harbour-api-xxxx.a.run.app/ | head -1',
    before: "--ingress=all",
    after:
      "--ingress=internal-and-cloud-load-balancing — only the LB and the VPC can reach it",
    remediation:
      "gcloud run services update harbour-api \\\n  --region=asia-southeast1 \\\n  --ingress=internal-and-cloud-load-balancing",
    applies: {
      API: { sub: "Cloud Run · LB-only ingress" },
      DIRECT: { sub: "closed — ingress is LB-only", dim: true },
    },
  },
  {
    id: "D7",
    title: "Cloud Run egress is private-ranges-only",
    topic: "all-traffic",
    phase: 5,
    severity: "high",
    blockedBy: [],
    symptom: "Internet calls leave from Google’s shared serverless pool.",
    explanation:
      "The service reaches the private database fine, which is why nobody noticed. But PayGate sees an unpredictable source address, so whitelisting silently fails after a redeploy.",
    concept:
      "Cloud Run egress modes. private-ranges-only reaches your database fine, which is why the broken payment path goes unnoticed — only all-traffic gives a stable egress IP.",
    detection:
      'gcloud run services describe harbour-api --region=asia-southeast1 \\\n  --format=yaml | grep -E "vpc-access-egress|network-interfaces"',
    before: "--vpc-egress=private-ranges-only",
    after:
      "--vpc-egress=all-traffic — internet-bound traffic routes through Cloud NAT",
    remediation:
      "gcloud run services update harbour-api \\\n  --region=asia-southeast1 \\\n  --network=harbour-vpc --subnet=sn-a-app \\\n  --vpc-egress=all-traffic",
    applies: { API: { sub: "Cloud Run · LB-only · all-traffic" } },
  },
  {
    id: "D8",
    title: "The origin is not locked to Cloudflare",
    topic: "Address groups",
    phase: 3,
    severity: "high",
    blockedBy: [],
    symptom: "The load balancer accepts connections from any source.",
    explanation:
      "Traffic can bypass the CDN and the WAF by hitting the load balancer directly. Locking it means allowing only Cloudflare’s published ranges, which change, which is exactly what an address group is for.",
    concept:
      "Address groups express intent — “the CDN’s edge” — instead of an IP list that goes stale the next time the provider publishes new ranges.",
    detection:
      '# does the origin answer someone who is not the CDN?\ncurl -sI --resolve harbour.example:443:34.120.95.195 \\\n  https://harbour.example/ | head -1\n\ngcloud compute security-policies describe harbour-waf \\\n  --format="yaml(rules)"',
    before: "No source restriction on the backend service’s security policy.",
    after:
      "Cloud Armor policy: default deny, allow only the cloudflare-edge address group.",
    remediation:
      'gcloud network-security address-groups create cloudflare-edge \\\n  --type=IPV4 --capacity=100 --location=global\n\ngcloud compute security-policies rules create 1000 \\\n  --security-policy=harbour-waf --action=allow \\\n  --src-ip-ranges="$(cat cloudflare-ranges.txt)"',
    applies: {
      CF: { sub: "CDN + WAF · the only way in" },
      GLB: { sub: "+ Cloud Armor · origin locked" },
    },
  },
  {
    id: "D9",
    title: "Egress is completely unrestricted",
    topic: "FQDN objects and a deny-all egress rule",
    phase: 5,
    severity: "high",
    blockedBy: [],
    symptom:
      "No egress rules exist, so the implied allow at 65535 governs everything.",
    explanation:
      "A compromised container can reach any host on the internet. The shape of the fix is deny-all plus a short list of named destinations, not an IP list you maintain by hand.",
    concept:
      "The implied allow-egress at 65535 governs everything until you write a deny. FQDN objects are how you allow named destinations without maintaining IP lists.",
    detection:
      '# an empty result IS the finding\ngcloud compute firewall-rules list --filter="direction=EGRESS"\ngcloud compute network-firewall-policies list --global',
    before:
      "No egress rules. Implied allow to 0.0.0.0/0 at priority 65535 decides everything.",
    after:
      "deny EGRESS 0.0.0.0/0 at 65000, plus allow rules for named FQDNs at 1000.",
    remediation:
      "gcloud compute network-firewall-policies rules create 1000 \\\n  --firewall-policy=harbour-egress --direction=EGRESS --action=allow \\\n  --dest-fqdns=api.paygate.example,api.billing.example --layer4-configs=tcp:443\n\ngcloud compute network-firewall-policies rules create 65000 \\\n  --firewall-policy=harbour-egress --direction=EGRESS --action=deny \\\n  --dest-ip-ranges=0.0.0.0/0 --layer4-configs=all",
    applies: { G_VPC: { sub: "custom mode · deny-all egress" } },
  },
  {
    id: "D10",
    title: "No policy above the project",
    topic: "Hierarchical firewall policies",
    phase: 6,
    severity: "medium",
    blockedBy: [],
    symptom:
      "Several identities hold owner, and any of them can delete any firewall rule.",
    explanation:
      "VPC rules live inside the project, which is exactly where the trust problem is. A rule set at the org or folder level is evaluated first and cannot be overridden from below.",
    concept:
      "Evaluation order. A layer above the project is consulted before any rule a project owner controls, and cannot be overridden from below.",
    detection:
      "gcloud compute firewall-policies list --organization=ORG_ID\n\n# surfaces anything attached ABOVE the project\ngcloud compute networks get-effective-firewalls harbour-vpc",
    before:
      "Nothing above the project. VPC rules are the first and only layer.",
    after:
      "Org-level hierarchical policy denying 22 and 3389 from 0.0.0.0/0, evaluated before any project rule.",
    remediation:
      "gcloud compute firewall-policies create \\\n  --organization=ORG_ID --short-name=harbour-baseline\n\ngcloud compute firewall-policies rules create 1000 \\\n  --firewall-policy=harbour-baseline --direction=INGRESS --action=deny \\\n  --src-ip-ranges=0.0.0.0/0 --layer4-configs=tcp:22,tcp:3389",
    applies: {
      G_POL: {
        sub: "org baseline — no SSH or RDP from the internet",
        tone: "compute",
        dashed: false,
      },
    },
  },
  {
    id: "D11",
    title: "Partner expects transitive access",
    topic: "Peering behaviour, PSC",
    phase: 6,
    severity: "low",
    blockedBy: [],
    symptom:
      "partner-vpc is peered in and assumes it can reach Cloud SQL through you.",
    explanation:
      "Peering does not chain, so traffic cannot cross your peering and then the PSA peering. No rule or route makes this work. The partner needs its own path.",
    concept:
      "Peering is non-transitive. Traffic cannot cross two peerings, and no firewall rule or route changes that — it is structural, not configuration.",
    detection:
      "gcloud compute networks peerings list --network=harbour-vpc\n\n# a connectivity test names the reason, not just the failure\ngcloud network-management connectivity-tests create partner-to-db \\\n  --source-network=partner-vpc --destination-ip-address=10.90.0.3",
    before: "Partner sends traffic to 10.90.x.x and it is silently dropped.",
    after:
      "Partner creates a PSC endpoint in their own VPC, pointing at a service attachment you publish.",
    remediation:
      "# on your side: publish a service attachment\ngcloud compute service-attachments create harbour-db-sa \\\n  --region=asia-southeast1 --producer-forwarding-rule=harbour-db-fr \\\n  --connection-preference=ACCEPT_MANUAL --nat-subnets=sn-a-psc",
    applies: {
      PARTNER: { sub: "172.20.0.0/16 · own PSC endpoint" },
      PEER: { sub: "active · partner uses PSC" },
    },
  },
  {
    id: "D12",
    title: "No proxy-only subnet",
    topic: "Subnet purposes",
    phase: 1,
    severity: "low",
    blockedBy: [],
    symptom: "The regional internal ALB cannot be created.",
    explanation:
      "Regional load balancer proxies need a subnet of their own, reserved for them and holding none of your resources. It is invisible until the create command fails with a message that does not obviously say this.",
    concept:
      "Subnets have purposes. A regional proxy load balancer needs a subnet reserved for Google’s proxies that holds none of your own resources.",
    detection:
      'gcloud compute networks subnets list \\\n  --filter="purpose=REGIONAL_MANAGED_PROXY" \\\n  --format="table(name,region,ipCidrRange,purpose,role)"',
    before: "sn-a-proxy does not exist. Creating the forwarding rule fails.",
    after: "sn-a-proxy at 10.10.250.0/24 with purpose REGIONAL_MANAGED_PROXY.",
    remediation:
      "gcloud compute networks subnets create sn-a-proxy \\\n  --network=harbour-vpc --region=asia-southeast1 \\\n  --range=10.10.250.0/24 \\\n  --purpose=REGIONAL_MANAGED_PROXY --role=ACTIVE",
    applies: {
      G_PROXY: {
        sub: "10.10.250.0/24 · proxy-only · active",
        tone: "compute",
        dashed: false,
      },
      ILB: { sub: "internal ALB · active", dim: false },
    },
  },
  {
    id: "D13",
    title: "TCP health check on a web backend",
    topic: "HTTP health checks",
    phase: 5,
    severity: "medium",
    blockedBy: ["D12"],
    symptom: "legacy-backend-service probes TCP on port 80.",
    explanation:
      "A hung application that still holds the port open passes the check, keeps receiving traffic, and is never replaced by the autohealer — because the MIG uses the same check. One weak setting breaks both rotation and healing.",
    concept:
      "A health check proves only what it actually tests. TCP proves a port is open, not that the application works — and the autohealer trusts the same check.",
    detection:
      'gcloud compute backend-services describe legacy-backend-service \\\n  --region=asia-southeast1 --format="value(healthChecks)"\n\ngcloud compute health-checks list \\\n  --format="table(name,type,tcpHealthCheck.port,httpHealthCheck.requestPath)"',
    before:
      "health check: TCP, port 80. Proves only that something is listening.",
    after:
      "health check: HTTP, GET /health, 200 expected. Proves the app is actually responding.",
    remediation:
      "gcloud compute health-checks create http legacy-http-hc \\\n  --port=80 --request-path=/health \\\n  --check-interval=10s --timeout=5s \\\n  --healthy-threshold=2 --unhealthy-threshold=3\n\ngcloud compute backend-services update legacy-backend-service \\\n  --region=asia-southeast1 --health-checks=legacy-http-hc",
    applies: { ILB: { sub: "HTTP health check" } },
  },
  {
    id: "D14",
    title: "No Cloud Armor on the legacy backend service",
    topic: "Per-backend-service WAF policies",
    phase: 5,
    severity: "high",
    blockedBy: ["D12"],
    symptom: "harbour-waf is attached to api-backend-service and nowhere else.",
    explanation:
      "Cloud Armor attaches to the backend service, several links down the chain, not to the load balancer. So one path is protected and the other is not, and nothing about the load balancer’s configuration makes that visible. Same outcome as the run.app bypass, opposite cause: there the WAF is walked around, here it was never attached.",
    concept:
      "Cloud Armor attaches to the backend service, several links down the chain — not to the load balancer. Coverage can differ between two paths on the same LB.",
    detection:
      'gcloud compute backend-services list \\\n  --format="table(name,region,protocol,securityPolicy)"',
    before: "legacy-backend-service has no securityPolicy field set.",
    after: "harbour-waf attached, so both paths get the same rule set.",
    remediation:
      'gcloud compute backend-services update legacy-backend-service \\\n  --region=asia-southeast1 --security-policy=harbour-waf\n\n# audit every backend service at once\ngcloud compute backend-services list \\\n  --format="table(name,region,securityPolicy)"',
    applies: { ILB: { sub: "HTTP check · Cloud Armor on" } },
  },
  {
    id: "D15",
    title: "No SSL policy on the HTTPS proxy",
    topic: "SSL policies",
    phase: 5,
    severity: "medium",
    blockedBy: [],
    symptom:
      "The target proxy uses the default policy, which is permissive for compatibility.",
    explanation:
      "It will negotiate older TLS versions and weaker ciphers with any client that asks. Nothing breaks, nothing warns, and a scanner finds it immediately.",
    concept:
      "TLS lives entirely on the target proxy — certificate, SSL policy, mTLS. If a client complains about the cipher, that is the link to inspect.",
    detection:
      'gcloud compute target-https-proxies list \\\n  --format="table(name,sslPolicy,sslCertificates.list())"\n\n# confirm what it will actually negotiate\nnmap --script ssl-enum-ciphers -p 443 harbour.example',
    before:
      "No sslPolicy on target-https-proxy. Default profile, TLS 1.0 accepted.",
    after: "Minimum TLS 1.2, RESTRICTED cipher profile.",
    remediation:
      "gcloud compute ssl-policies create harbour-tls \\\n  --profile=RESTRICTED --min-tls-version=1.2\n\ngcloud compute target-https-proxies update harbour-api-proxy \\\n  --ssl-policy=harbour-tls",
    applies: { GLB: { sub: "+ Cloud Armor · origin locked · TLS 1.2" } },
  },
  {
    id: "D16",
    title: "Metadata SSH keys instead of OS Login",
    topic: "OS Login",
    phase: 2,
    severity: "medium",
    blockedBy: ["D2"],
    symptom:
      "Public keys live in project metadata, so a project-level key works on every VM.",
    explanation:
      "A key in metadata is just a key. Nothing links it to whether the person still works here, so access survives someone leaving until a human notices and deletes it. OS Login ties login to Google identities and IAM instead: grant roles/compute.osLogin and they can log in, revoke it and access to every VM disappears at once. Logs also show which identity logged in, rather than that a key was used. Deliberately sequenced after D2 — change the access path first and prove it, then change the login mechanism, so a failure has only one possible cause.",
    concept:
      "OS Login ties login to IAM, so revocation is central and instant. Metadata keys tie it to nothing — a key outlives the person who owned it.",
    detection:
      'gcloud compute project-info describe \\\n  --format="value(commonInstanceMetadata.items.filter(key:enable-oslogin))"\n\n# the keys this would replace\ngcloud compute project-info describe \\\n  --format="value(commonInstanceMetadata.items.filter(key:sshKeys))"',
    before:
      "Keys in project metadata. One key grants every VM. Cleanup is manual.",
    after:
      "OS Login on. Access by roles/compute.osLogin or osAdminLogin, revoked centrally and instantly.",
    remediation:
      'gcloud compute project-info add-metadata \\\n  --metadata enable-oslogin=TRUE\n\ngcloud projects add-iam-policy-binding harbour-app-prod \\\n  --member="user:someone@harbour.example" \\\n  --role="roles/compute.osLogin"\n\n# find the keys this replaces, so they can be removed\ngcloud compute project-info describe \\\n  --format="value(commonInstanceMetadata.items.filter(key:sshKeys))"',
    applies: { BASTION: { sub: "IAP + OS Login · no external IP" } },
  },
];
