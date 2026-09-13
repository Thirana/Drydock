// Harbour network track data. Positions are in chain viewBox units.
import type { LoadBalancerChain } from "@/lib/architecture/types";

export const loadBalancer: LoadBalancerChain = {
  viewBox: { width: 1210, height: 520 },
  grid: {
    x: 40,
    y: 100,
    columnStep: 192,
    rowStep: 150,
    cellWidth: 172,
    cellHeight: 76,
  },
  lanes: [
    {
      label: "global external Application LB · harbour-api",
      tone: "edge",
      links: [
        { id: "fr1", label: "Forwarding rule", sub: "34.120.95.195:443" },
        {
          id: "tp1",
          label: "Target HTTPS proxy",
          sub: "connection terminates",
          defects: ["D15"],
        },
        { id: "um1", label: "URL map", sub: "host + path routing" },
        { id: "bs1", label: "Backend service", sub: "Cloud Armor on" },
        { id: "neg1", label: "Serverless NEG", sub: "bridge to Cloud Run" },
        { id: "be1", label: "harbour-api", sub: "Cloud Run", defects: ["D6"] },
      ],
    },
    {
      label: "regional internal Application LB · legacy-api",
      tone: "compute",
      links: [
        {
          id: "fr2",
          label: "Forwarding rule",
          sub: "10.10.0.40:80 · internal",
          defects: ["D12"],
        },
        { id: "tp2", label: "Target HTTP proxy", sub: "no TLS at all" },
        { id: "um2", label: "URL map", sub: "everything → one service" },
        {
          id: "bs2",
          label: "Backend service",
          sub: "no WAF · TCP check",
          defects: ["D13", "D14"],
        },
        { id: "be2", label: "legacy-api MIG", sub: "3–10 VMs, autohealed" },
      ],
    },
  ],
  extras: [
    {
      id: "hc",
      x: 424,
      y: 424,
      w: 364,
      h: 64,
      label: "Google health check probes",
      sub: "35.191.0.0/16 · 130.211.0.0/22",
      tone: "edge",
    },
    {
      id: "fw",
      x: 808,
      y: 352,
      w: 172,
      h: 44,
      label: "firewall rule",
      sub: "allow-health-check",
      tone: "edge",
    },
  ],
  wires: [
    {
      tone: "edge",
      points: [
        { x: 788, y: 456 },
        { x: 808, y: 374 },
      ],
    },
    {
      tone: "edge",
      points: [
        { x: 894, y: 352 },
        { x: 894, y: 326 },
      ],
    },
  ],
  annotations: [
    { x: 1000, y: 440, lines: ["no probe path to", "the serverless NEG"] },
  ],
  initialSelection: "bs1",
  details: {
    fr1: {
      title: "Forwarding rule",
      subtitle: "Global external ALB",
      position: "link 1 of 5",
      rows: [
        {
          label: "IP address",
          value: "34.120.95.195 — reserved static, global",
        },
        { label: "Port", value: "443" },
        { label: "Protocol", value: "HTTPS" },
        {
          label: "Scope",
          value: "Global — one anycast IP served from every Google edge",
        },
        { label: "Points at", value: "target-https-proxy" },
      ],
      note: "This object owns the load balancer’s IP. Whether that IP is reserved or ephemeral is a property of the forwarding rule, which is why a recreated LB can silently come back on a different address.",
    },
    tp1: {
      title: "Target HTTPS proxy",
      subtitle: "Global external ALB",
      position: "link 2 of 5",
      rows: [
        { label: "Type", value: "target-https-proxy" },
        {
          label: "TLS",
          value:
            "Terminates here. Everything after this point is decrypted HTTP.",
        },
        {
          label: "Certificate",
          value: "Google-managed, auto-renewing, harbour.example",
        },
        {
          label: "SSL policy",
          value: "none — negotiates old TLS versions for compatibility",
        },
        { label: "mTLS", value: "off" },
        { label: "Points at", value: "URL map" },
      ],
      note: "Everything about TLS lives on this one object: certificate, SSL policy, mTLS. If the browser complains about the certificate or the cipher, this is the link to inspect.",
    },
    um1: {
      title: "URL map",
      subtitle: "Global external ALB",
      position: "link 3 of 5",
      rows: [
        { label: "Host rule", value: "harbour.example" },
        {
          label: "/static/*",
          value: "backend bucket — harbour-static, Cloud CDN on",
        },
        { label: "/api/*", value: "api-backend-service" },
        { label: "default", value: "api-backend-service" },
      ],
      note: "This routing only exists because the target proxy terminated the connection. A passthrough load balancer has no URL map, because it never sees the URL.",
    },
    bs1: {
      title: "Backend service",
      subtitle: "Global external ALB · api-backend-service",
      position: "link 4 of 5",
      rows: [
        {
          label: "Health check",
          value: "none — serverless NEGs are not probed",
        },
        { label: "Balancing mode", value: "n/a for serverless" },
        { label: "Session affinity", value: "none — the API is stateless" },
        { label: "Connection draining", value: "n/a" },
        { label: "Timeout", value: "30s" },
        {
          label: "Cloud Armor",
          value: "harbour-waf — OWASP preconfigured rules, rate limit 100/min",
        },
        { label: "Cloud CDN", value: "off for the API" },
      ],
      note: "Cloud Armor and Cloud CDN both attach here, not to the load balancer as a whole. That is why WAF coverage can differ between two load balancers, and even between two backend services on the same one.",
    },
    neg1: {
      title: "Serverless NEG",
      subtitle: "Global external ALB",
      position: "link 5 of 5",
      rows: [
        { label: "Type", value: "SERVERLESS" },
        {
          label: "Target",
          value: "Cloud Run service harbour-api, asia-southeast1",
        },
        { label: "Health check", value: "not supported" },
      ],
      note: "This is the bridge between “load balancer” and “Cloud Run”. It is what gives a Cloud Run service a custom domain, a WAF, and a CDN.",
    },
    be1: {
      title: "harbour-api",
      subtitle: "the actual backend",
      position: "end of chain",
      rows: [
        { label: "Type", value: "Cloud Run service" },
        {
          label: "Ingress",
          value: "all — the run.app URL still answers the internet",
        },
        { label: "Egress", value: "Direct VPC egress, private-ranges-only" },
        {
          label: "Effect",
          value: "Every protection on this chain can be walked around",
        },
      ],
      note: "The chain above is correct and well configured. It does not matter, because there is a second door with none of it. This is the shape of D6.",
    },
    fr2: {
      title: "Forwarding rule",
      subtitle: "Regional internal ALB",
      position: "link 1 of 5",
      rows: [
        { label: "IP address", value: "10.10.0.40 — internal, from sn-a-app" },
        { label: "Port", value: "80" },
        { label: "Protocol", value: "HTTP" },
        { label: "Scope", value: "Regional — asia-southeast1 only" },
        {
          label: "Blocked by",
          value: "No proxy-only subnet, so the LB cannot be created",
        },
      ],
      note: "A regional proxy load balancer needs a subnet with purpose REGIONAL_MANAGED_PROXY before it can exist. The create command fails with a message that does not obviously say this.",
    },
    tp2: {
      title: "Target HTTP proxy",
      subtitle: "Regional internal ALB",
      position: "link 2 of 5",
      rows: [
        { label: "Type", value: "target-http-proxy" },
        { label: "TLS", value: "none — plain HTTP inside the VPC" },
        { label: "Certificate", value: "n/a" },
        { label: "mTLS", value: "off" },
      ],
      note: "Internal traffic is often left unencrypted on the argument that it never leaves the VPC. That argument is the same one that made default-allow-internal feel safe.",
    },
    um2: {
      title: "URL map",
      subtitle: "Regional internal ALB",
      position: "link 3 of 5",
      rows: [
        { label: "Host rule", value: "none" },
        { label: "default", value: "legacy-backend-service" },
      ],
      note: "A URL map that sends everything to one backend service is perfectly normal. The object still has to exist — the chain has no optional links.",
    },
    bs2: {
      title: "Backend service",
      subtitle: "Regional internal ALB · legacy-backend-service",
      position: "link 4 of 5",
      rows: [
        {
          label: "Health check",
          value: "TCP on port 80 — proves only that something is listening",
        },
        { label: "Balancing mode", value: "UTILIZATION, target 80% CPU" },
        {
          label: "Session affinity",
          value: "CLIENT_IP — the legacy app holds sessions in memory",
        },
        { label: "Connection draining", value: "300s" },
        { label: "Timeout", value: "30s" },
        { label: "Cloud Armor", value: "none attached" },
        { label: "Cloud CDN", value: "off" },
      ],
      note: "Two separate problems here. The TCP health check keeps a hung backend in rotation, and the missing Cloud Armor policy means this path has no WAF even for traffic that does arrive through the load balancer.",
    },
    be2: {
      title: "legacy-api MIG",
      subtitle: "the actual backend",
      position: "end of chain",
      rows: [
        { label: "Type", value: "Managed instance group, 3–10 VMs" },
        { label: "Autoscaling", value: "on CPU" },
        { label: "Autohealing", value: "on the same health check" },
        { label: "Network tag", value: "lb-health-check" },
        { label: "External IP", value: "yes, on every instance" },
      ],
      note: "The autohealer uses the same health check as the load balancer. A weak check therefore weakens both: a hung VM is neither pulled from rotation nor replaced.",
    },
    hc: {
      title: "Health check",
      subtitle: "legacy-backend-service",
      position: "probe source",
      rows: [
        {
          label: "Source ranges",
          value: "35.191.0.0/16 and 130.211.0.0/22 — fixed and published",
        },
        { label: "Type", value: "TCP on port 80" },
        { label: "Interval", value: "10s" },
        { label: "Timeout", value: "5s" },
        { label: "Healthy threshold", value: "2 consecutive successes" },
        { label: "Unhealthy threshold", value: "3 consecutive failures" },
      ],
      note: "Probes come from Google, not from the load balancer and not from your network. Ingress is denied by default, so without a rule allowing these two ranges every backend reads as unhealthy while the application works perfectly. This is the most common load balancer failure there is.",
    },
    fw: {
      title: "Firewall rule",
      subtitle: "allow-health-check",
      position: "the gate the probes pass",
      rows: [
        { label: "Direction", value: "INGRESS" },
        { label: "Priority", value: "1000" },
        { label: "Action", value: "allow" },
        { label: "Source ranges", value: "35.191.0.0/16, 130.211.0.0/22" },
        { label: "Target", value: "network tag lb-health-check" },
        { label: "Protocol", value: "tcp:80" },
      ],
      note: "Worth having as its own dedicated rule rather than relying on a broad catch-all. Then removing an overly permissive rule elsewhere cannot accidentally take the health path down with it.",
    },
  },
};
