"use client";

import type { ComponentType } from "react";
import {
  Cross,
  Plain,
  Stop,
  Wire,
  WalkProvider,
  Words,
  Zone,
  ZoneStop,
  type Walk,
} from "./journey-drawing-kit";

/*
 * One drawing per journey, holding only what the journey touches. Stops use
 * the journey's own ids, so the route numbers, red failures and the blue
 * outline of the hop being read come from the walk. Each drawing draws both
 * states: as found, and with every defect closed.
 */

type Drawing = ComponentType<{ fixed: boolean }>;

function ProductPage({ fixed }: { fixed: boolean }) {
  return (
    <svg
      viewBox="0 0 960 452"
      role="img"
      aria-label={
        fixed
          ? "A shopper's request goes through Cloudflare, the load balancer that now admits only Cloudflare, and harbour-api, whose ingress is the load balancer only. harbour-api reaches harbour-pg on a private IP through the PSA reservation in harbour-vpc. Anyone trying to skip Cloudflare or use the run.app URL is refused."
          : "A shopper's request goes through Cloudflare, the load balancer and harbour-api. Anyone can also reach the load balancer directly, skipping Cloudflare, or harbour-api's run.app URL, skipping everything. harbour-api reaches harbour-pg over the internet on a public IP."
      }
    >
      <text className="s" x="16" y="24">
        outside GCP
      </text>
      <Plain
        x={16}
        y={36}
        w={190}
        h={62}
        title="Anyone"
        lines={["skips the front door"]}
        dim={fixed}
      />
      <Stop
        id="USERS"
        x={16}
        y={150}
        w={190}
        h={62}
        title="Shoppers"
        lines={["browser · app"]}
      />
      <Stop
        id="CF"
        x={236}
        y={150}
        w={180}
        h={82}
        title="Cloudflare"
        lines={["CDN + WAF", "TLS ends here"]}
      />
      <Wire d="M206 181 H233" />
      <Wire d="M416 181 H453" />

      <Zone x={436} y={10} w={516} h={430} label="project harbour-prod" />
      <Stop
        id="GLB"
        x={456}
        y={150}
        w={220}
        h={102}
        hue="plum"
        title="Global external ALB"
        lines={[
          "34.120.95.195:443",
          fixed ? "TLS 1.2 minimum" : "TLS 1.0 still accepted",
          fixed ? "admits Cloudflare only" : "accepts any source",
        ]}
        tags={["D8", "D15"]}
      />
      <Stop
        id="API"
        x={716}
        y={150}
        w={228}
        h={82}
        hue="plum"
        title="harbour-api"
        lines={["Cloud Run", fixed ? "ingress: LB only" : "ingress: all"]}
        tags={["D6"]}
      />
      <Wire d="M676 181 H713" />

      {/* The two ways round the front door. */}
      {fixed ? (
        <>
          <Wire d="M206 67 H830 V110" state="idle" />
          <Wire d="M566 67 V110" state="idle" />
          <Cross x={566} y={126} />
          <Cross x={830} y={126} />
          <Words x={226} y={58}>
            Cloud Armor admits only Cloudflare, and run.app is closed
          </Words>
        </>
      ) : (
        <>
          <Wire d="M206 67 H830 V147" state="broken" />
          <Wire d="M566 67 V147" state="broken" />
          <Words x={226} y={58} fault>
            straight to the load balancer, and to run.app
          </Words>
        </>
      )}

      <Zone x={446} y={290} w={250} h={140} label="harbour-vpc" hue="teal" />
      <Stop
        id="PSA"
        x={462}
        y={332}
        w={218}
        h={82}
        hue="teal"
        title="PSA reservation"
        lines={[
          "10.90.0.0/16",
          fixed ? "peering to Google" : "used by Redis only",
        ]}
        dim={!fixed}
      />
      <Stop
        id="SQL"
        x={716}
        y={332}
        w={228}
        h={82}
        hue="plum"
        title="harbour-pg"
        lines={[
          "Cloud SQL",
          fixed ? "private IP 10.90.0.x" : "public IP + allow-list",
        ]}
        tags={["D5"]}
      />
      {fixed ? (
        <>
          <Wire d="M740 232 V280 H571 V329" />
          <Words x={584} y={272}>
            direct VPC egress
          </Words>
          <Wire d="M680 373 H713" />
        </>
      ) : (
        <>
          <Wire d="M900 232 V329" state="broken" />
          <Words x={888} y={290} fault end>
            over the internet
          </Words>
        </>
      )}
    </svg>
  );
}

function HealthProbe({ fixed }: { fixed: boolean }) {
  return (
    <svg
      viewBox="0 0 960 332"
      role="img"
      aria-label={
        fixed
          ? "Google's health check probes pass the allow-health-check firewall rule to the legacy-api instance group and ask each instance for /health. The healthy instance answers 200 and stays in rotation; the hung one answers 500 and is replaced."
          : "Google's health check probes pass the allow-health-check firewall rule to the legacy-api instance group and check only that TCP port 80 is open. Both instances pass, including the hung one that returns 500 to every request, so it stays in rotation."
      }
    >
      <Stop
        id="HC"
        x={16}
        y={60}
        w={220}
        h={82}
        hue="plum"
        title="Health check probes"
        lines={["35.191.0.0/16", "130.211.0.0/22"]}
      />
      <Zone
        x={256}
        y={16}
        w={688}
        h={300}
        label="harbour-vpc · sn-a-app · 10.10.0.0/20"
        hue="teal"
      />
      <Stop
        id="G_APP"
        x={276}
        y={60}
        w={200}
        h={82}
        hue="amber"
        title="allow-health-check"
        lines={["firewall · ingress", "to lb-health-check"]}
      />
      <Stop
        id="LEGACY"
        x={516}
        y={60}
        w={412}
        h={82}
        hue="teal"
        title="legacy-api · managed instance group"
        lines={[
          fixed ? "probe: HTTP GET /health" : "probe: is TCP :80 open?",
          "the autohealer uses the same check",
        ]}
        tags={["D13"]}
      />
      <Wire d="M236 101 H273" />
      <Wire d="M476 101 H513" />

      <Plain
        x={516}
        y={180}
        w={196}
        h={102}
        hue="teal"
        title="instance a"
        lines={[
          "answers requests",
          fixed ? "/health → 200" : "TCP :80 → open",
          "stays in rotation",
        ]}
      />
      <Plain
        x={732}
        y={180}
        w={196}
        h={102}
        hue="teal"
        title="instance b · hung"
        lines={[
          "500 to every request",
          fixed ? "/health → 500" : "TCP :80 → open",
          fixed ? "taken out, replaced" : "stays in rotation",
        ]}
        broken={!fixed}
      />
      <Wire d="M614 142 V177" />
      <Wire d="M830 142 V177" state={fixed ? "idle" : "ok"} />
      <Words x={842} y={166} fault={!fixed}>
        {fixed ? "fails" : "passes"}
      </Words>
    </svg>
  );
}

function CardCharge({ fixed }: { fixed: boolean }) {
  return (
    <svg
      viewBox="0 0 960 372"
      role="img"
      aria-label={
        fixed
          ? "harbour-api sends all its egress into harbour-vpc. Cloud NAT on Cloud Router rtr-a rewrites the source to one of two reserved addresses, harbour-egress-1 and -2, and PayGate accepts the charge."
          : "harbour-api sends only private ranges into the VPC, so the call to PayGate leaves from Google's shared serverless pool on a different address each time. PayGate rejects it. Cloud NAT and its reserved addresses are never used."
      }
    >
      <Stop
        id="API"
        x={16}
        y={40}
        w={220}
        h={82}
        hue="plum"
        title="harbour-api"
        lines={[
          "Cloud Run",
          fixed ? "egress: all traffic" : "egress: private only",
        ]}
        tags={["D7"]}
      />
      <Plain
        x={316}
        y={40}
        w={220}
        h={82}
        hue="plum"
        title="Google's shared pool"
        lines={["serverless egress", "a new IP each time"]}
        dim={fixed}
      />
      <text className="s" x="724" y="24">
        outside GCP
      </text>
      <Stop
        id="PAY"
        x={724}
        y={40}
        w={220}
        h={82}
        title="PayGate"
        lines={["allows two addresses", "harbour-egress-1, -2"]}
      />

      <Zone
        x={276}
        y={180}
        w={340}
        h={176}
        label="harbour-vpc · sn-a-app"
        hue="teal"
      />
      <Stop
        id="NAT"
        x={296}
        y={228}
        w={300}
        h={102}
        hue="teal"
        title="Cloud NAT"
        lines={[
          "on Cloud Router rtr-a",
          "harbour-egress-1",
          "harbour-egress-2",
        ]}
        dim={!fixed}
      />

      {fixed ? (
        <>
          <Wire d="M126 122 V279 H293" />
          <Words x={138} y={200}>
            direct VPC egress
          </Words>
          <Wire d="M596 279 H834 V125" />
          <Words x={634} y={270}>
            from a reserved address
          </Words>
        </>
      ) : (
        <>
          <Wire d="M236 81 H313" state="broken" />
          <Wire d="M536 81 H721" state="broken" />
          <Words x={548} y={72} fault>
            rejected · not on file
          </Words>
        </>
      )}
    </svg>
  );
}

function NightlyJob({ fixed }: { fixed: boolean }) {
  return (
    <svg
      viewBox="0 0 960 420"
      role="img"
      aria-label={
        fixed
          ? "Cloud Scheduler calls harbour-jobs, which reads Secret Manager and publishes to rabbitmq-1 in sn-a-data. sn-a-data now has Private Google Access on, so the broker writes its logs to Cloud Logging."
          : "Cloud Scheduler calls harbour-jobs, which reads Secret Manager and publishes to rabbitmq-1 in sn-a-data. sn-a-data has Private Google Access off and the broker has no external IP, so its logs never reach Cloud Logging."
      }
    >
      <Stop
        id="SCHED"
        x={16}
        y={48}
        w={210}
        h={82}
        hue="plum"
        title="Cloud Scheduler"
        lines={["daily cron", "with an OIDC token"]}
      />
      <Stop
        id="JOBS"
        x={286}
        y={48}
        w={210}
        h={82}
        hue="plum"
        title="harbour-jobs"
        lines={["Cloud Run · nightly", "ingress: internal + LB"]}
      />
      <Wire d="M226 89 H283" />

      <Zone x={516} y={12} w={428} h={140} label="Google APIs" hue="plum" />
      <Stop
        id="SECRET"
        x={532}
        y={48}
        w={190}
        h={82}
        hue="plum"
        title="Secret Manager"
        lines={["secretmanager", ".googleapis.com"]}
      />
      <Plain
        x={738}
        y={48}
        w={190}
        h={82}
        hue="plum"
        title="Cloud Logging"
        lines={["logging", ".googleapis.com"]}
      />
      <Wire d="M496 89 H529" />

      <Zone x={246} y={190} w={698} h={214} label="harbour-vpc" hue="teal" />
      <ZoneStop
        id="G_APP"
        x={262}
        y={228}
        w={254}
        h={160}
        label="sn-a-app · 10.10.0.0/20"
        sub="Private Google Access on"
      />
      <Plain
        x={278}
        y={288}
        w={222}
        h={82}
        hue="teal"
        title="harbour-jobs egress"
        lines={["10.10.0.x", "direct VPC egress"]}
      />
      <ZoneStop
        id="G_DATA"
        x={532}
        y={228}
        w={396}
        h={160}
        label="sn-a-data · 10.10.17.0/24"
        sub={fixed ? "Private Google Access on" : "Private Google Access off"}
        subFault={!fixed}
        tags={["D4"]}
      />
      <Stop
        id="RABBIT"
        x={548}
        y={288}
        w={220}
        h={82}
        hue="teal"
        title="rabbitmq-1"
        lines={["10.10.17.x:5672", "no external IP"]}
      />
      {/* Down the right edge of sn-a-app, clear of its labels. */}
      <Wire d="M488 130 V285" />
      <Wire d="M500 329 H545" />

      {fixed ? (
        <>
          <Wire d="M768 329 H833 V133" />
          <Words x={845} y={300}>
            over PGA
          </Words>
        </>
      ) : (
        <>
          <Wire d="M768 329 H833 V244" state="broken" />
          <Cross x={833} y={228} />
          <Words x={845} y={300} fault>
            no way out
          </Words>
        </>
      )}
    </svg>
  );
}

function SshSession({ fixed }: { fixed: boolean }) {
  return (
    <svg
      viewBox="0 0 960 388"
      role="img"
      aria-label={
        fixed
          ? "The engineer runs gcloud with --tunnel-through-iap. IAP TCP forwarding checks who they are and their IAP role, then tunnels to the bastion on port 22 from 35.235.240.0/20. The bastion has no external IP and uses OS Login. From there, SSH to rabbitmq-1."
          : "The engineer, at home on 198.51.100.7, connects straight to the bastion's external IP, where port 22 is open to 0.0.0.0/0 and login uses metadata SSH keys. From there, SSH to rabbitmq-1. IAP is not used."
      }
    >
      <text className="s" x="16" y="80">
        outside GCP
      </text>
      <Plain
        x={16}
        y={92}
        w={200}
        h={82}
        title="Engineer"
        lines={
          fixed
            ? ["gcloud compute ssh", "--tunnel-through-iap"]
            : ["198.51.100.7 · home", "holds an SSH key"]
        }
      />
      <Stop
        id="IAP"
        x={276}
        y={150}
        w={220}
        h={102}
        hue="plum"
        title="IAP TCP forwarding"
        lines={["35.235.240.0/20", "checks who you are", "and your IAP role"]}
        dim={!fixed}
      />

      <Zone x={536} y={16} w={408} h={356} label="harbour-vpc" hue="teal" />
      <ZoneStop
        id="G_MGMT"
        x={552}
        y={52}
        w={376}
        h={140}
        label="sn-a-mgmt · 10.10.16.0/24"
      />
      <Stop
        id="BASTION"
        x={568}
        y={92}
        w={344}
        h={82}
        hue="teal"
        title="bastion"
        lines={
          fixed
            ? ["no external IP · :22 from IAP only", "OS Login"]
            : ["external IP · :22 from 0.0.0.0/0", "metadata SSH keys"]
        }
        tags={["D2", "D16", "D3a"]}
      />
      <ZoneStop
        id="G_DATA"
        x={552}
        y={216}
        w={376}
        h={140}
        label="sn-a-data · 10.10.17.0/24"
      />
      <Stop
        id="RABBIT"
        x={568}
        y={256}
        w={344}
        h={82}
        hue="teal"
        title="rabbitmq-1"
        lines={["10.10.17.x:22", "no external IP"]}
      />
      <Wire d="M860 174 V253" />
      <Words x={848} y={208} end>
        SSH · two firewall checks
      </Words>

      {fixed ? (
        <>
          <Wire d="M216 133 H392" state="idle" />
          <Cross x={406} y={133} />
          <Words x={232} y={124}>
            no public IP left to reach
          </Words>
          <Wire d="M116 174 V204 H273" />
          <Words x={130} y={226}>
            identity first
          </Words>
          {/* Between the two subnets, into the bastion from below. */}
          <Wire d="M496 204 H600 V177" />
        </>
      ) : (
        <>
          <Wire d="M216 133 H565" state="broken" />
          <Words x={232} y={124} fault>
            SSH to a public IP, open to 0.0.0.0/0
          </Words>
        </>
      )}
    </svg>
  );
}

function PartnerDatabase({ fixed }: { fixed: boolean }) {
  return (
    <svg
      viewBox="0 0 960 362"
      role="img"
      aria-label={
        fixed
          ? "partner-vpc reaches harbour-cache through its own PSC endpoint, 172.20.x.y, connected to a service attachment Harbour publishes. Nothing on that path is peered. The VPC peering and the PSA reservation are still there, unused by this journey."
          : "partner-vpc is peered to harbour-vpc, and harbour-cache sits on Google's side behind the PSA reservation, a second peering. Traffic from the partner is dropped at the second peering, because peering does not chain."
      }
    >
      <text className="s" x="16" y="66">
        {"the partner's network"}
      </text>
      <Stop
        id="PARTNER"
        x={16}
        y={80}
        w={200}
        h={82}
        title="partner-vpc"
        lines={[
          "172.20.0.0/16",
          fixed ? "PSC at 172.20.x.y" : "delivery partner",
        ]}
      />
      <Stop
        id="PEER"
        x={256}
        y={80}
        w={190}
        h={82}
        title="VPC peering"
        lines={["to harbour-vpc", "does not chain"]}
        dim={fixed}
      />
      <Zone x={486} y={16} w={220} h={330} label="harbour-vpc" hue="teal" />
      <Stop
        id="PSA"
        x={496}
        y={80}
        w={200}
        h={82}
        hue="teal"
        title="PSA reservation"
        lines={["10.90.0.0/16", "a second peering"]}
        dim={fixed}
      />
      <Stop
        id="PSC"
        x={496}
        y={240}
        w={200}
        h={82}
        hue="teal"
        title="service attachment"
        lines={["PSC · you publish it", "you accept each one"]}
        dim={!fixed}
      />
      <Zone x={726} y={16} w={218} h={330} label="Google's side" hue="plum" />
      <Stop
        id="REDIS"
        x={740}
        y={80}
        w={190}
        h={82}
        hue="plum"
        title="harbour-cache"
        lines={["Memorystore", "10.90.x.x:6379"]}
      />

      {fixed ? (
        <>
          <Wire d="M216 121 H253" state="idle" />
          <Wire d="M446 121 H493" state="idle" />
          <Wire d="M696 121 H737" state="idle" />
          <Wire d="M116 162 V281 H493" />
          <Words x={130} y={272}>
            to its own endpoint, 172.20.x.y
          </Words>
          <Wire d="M696 281 H835 V165" />
          <Words x={742} y={304}>
            no peering on the way
          </Words>
        </>
      ) : (
        <>
          <Wire d="M216 121 H253" />
          <Wire d="M446 121 H493" />
          <Wire d="M696 121 H737" state="broken" />
          <Cross x={716} y={121} />
          <Words x={930} y={196} fault end>
            dropped: peering does not chain
          </Words>
        </>
      )}
    </svg>
  );
}

const DRAWINGS: Record<string, Drawing> = {
  "product-page": ProductPage,
  "health-probe": HealthProbe,
  "card-charge": CardCharge,
  "nightly-job": NightlyJob,
  "ssh-session": SshSession,
  "partner-database": PartnerDatabase,
};

/** The journey's own drawing, in the state and at the hop the walk is at. */
export function JourneyDrawing({ slug, walk }: { slug: string; walk: Walk }) {
  const Drawing = DRAWINGS[slug];
  if (!Drawing) return null;
  return (
    <WalkProvider value={walk}>
      <Drawing fixed={walk.fixed} />
    </WalkProvider>
  );
}
