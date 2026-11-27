"use client";

import type { ComponentType } from "react";
import {
  Cross,
  Dashed,
  Plain,
  Wire,
  WalkProvider,
  Words,
  Zone,
  ZoneStop,
} from "./journey-drawing-kit";
import { JourneyDrawing } from "./journey-drawings";

/*
 * One drawing per defect, holding only what the defect touches, as found and
 * with that one defect closed. Two defects are exactly what a packet journey
 * already draws, so they borrow the journey's drawing.
 */

type P = { fixed: boolean };

const NONE: ReadonlySet<string> = new Set();

function D1({ fixed }: P) {
  const rows = [
    {
      y: 40,
      title: "900 · allow-ssh-from-iap",
      line: "35.235.240.0/20 · tcp:22",
    },
    {
      y: 116,
      title: "1000 · allow-all",
      line: "0.0.0.0/0 · all protocols · no target",
    },
    {
      y: 192,
      title: "1000 · allow-health-check",
      line: "35.191.0.0/16 · tcp:80",
    },
    {
      y: 268,
      title: "65535 · implied deny",
      line: "every ingress the rules above miss",
    },
  ];
  const note = fixed
    ? ["no match", "deleted", "no match", ""]
    : ["no match", "", "never checked", "never checked"];
  return (
    <svg
      viewBox="0 0 960 350"
      role="img"
      aria-label={
        fixed
          ? "A packet from the internet to legacy-api port 5432 is checked against the rules in priority order. allow-all is gone, so nothing above matches and the implied deny at 65535 drops it."
          : "A packet from the internet to legacy-api port 5432 is checked against the rules in priority order. allow-all at priority 1000 matches everything, so the packet reaches the database port, and the rules below it are never checked."
      }
    >
      <Plain
        x={16}
        y={128}
        w={220}
        h={102}
        title="A packet"
        lines={["from 203.0.113.9", "to legacy-api :5432", "from the internet"]}
      />
      <Zone x={276} y={10} w={440} h={330} label="ingress rules, by priority" />
      {rows.map((r, i) => (
        <g key={r.title}>
          <Plain
            x={296}
            y={r.y}
            w={400}
            h={62}
            hue="amber"
            title={r.title}
            lines={[i === 1 && fixed ? "" : r.line]}
            broken={i === 1 && !fixed}
            ghost={i === 1 && fixed}
            dim={!fixed && i > 1}
            tags={i === 1 ? ["D1"] : undefined}
          />
          {note[i] && (
            <Words x={684} y={r.y + 26} end>
              {note[i]}
            </Words>
          )}
        </g>
      ))}
      <Plain
        x={756}
        y={116}
        w={188}
        h={62}
        hue="teal"
        title="legacy-api :5432"
        lines={["answers the internet"]}
        broken={!fixed}
        dim={fixed}
      />
      {fixed ? (
        <>
          <Wire d="M236 179 H256 V299 H293" />
          <Wire d="M696 299 H738" state="idle" />
          <Cross x={752} y={299} />
          <Words x={770} y={304}>
            dropped
          </Words>
        </>
      ) : (
        <>
          <Wire d="M236 179 H256 V147 H293" state="broken" />
          <Wire d="M696 147 H753" state="broken" />
        </>
      )}
    </svg>
  );
}

function D2({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 392"
      role="img"
      aria-label={
        fixed
          ? "The firewall allows port 22 only from IAP's range, 35.235.240.0/20. Scanners on the internet are dropped. The engineer reaches the VMs through IAP, which checks their identity first."
          : "The firewall allows port 22 from 0.0.0.0/0 to every VM, so scanners and bots on the internet can try keys around the clock, just as the engineer connects from home."
      }
    >
      <text className="s" x="16" y="24">
        outside GCP
      </text>
      <Plain
        x={16}
        y={40}
        w={190}
        h={62}
        title="Anyone"
        lines={["port scanners, bots"]}
      />
      <Plain
        x={16}
        y={180}
        w={190}
        h={82}
        title="Engineer"
        lines={
          fixed
            ? ["gcloud compute ssh", "--tunnel-through-iap"]
            : ["SSH from home", "with a key"]
        }
      />
      <Plain
        x={246}
        y={300}
        w={190}
        h={82}
        hue="plum"
        title="IAP"
        lines={["checks identity", "35.235.240.0/20"]}
        dim={!fixed}
      />
      <Plain
        x={476}
        y={40}
        w={210}
        h={342}
        hue="amber"
        title="firewall · ingress"
        lines={
          fixed
            ? ["tcp:22", "from 35.235.240.0/20", "priority 900"]
            : ["tcp:22", "from 0.0.0.0/0", "every VM"]
        }
        broken={!fixed}
        tags={["D2"]}
      />
      <Zone x={706} y={8} w={238} h={376} label="harbour-vpc" hue="teal" />
      <Plain
        x={722}
        y={40}
        w={206}
        h={330}
        hue="teal"
        title="every VM"
        lines={[
          "bastion",
          "legacy-api × 3",
          "rabbitmq-1",
          fixed ? "port 22 via IAP" : "port 22 open",
        ]}
      />
      {fixed ? (
        <>
          <Wire d="M206 71 H446" state="idle" />
          <Cross x={460} y={71} />
          <Words x={220} y={62}>
            {"not IAP's range: dropped"}
          </Words>
          <Wire d="M111 262 V341 H243" />
          <Words x={124} y={333}>
            identity first
          </Words>
          <Wire d="M436 341 H473" />
          <Wire d="M686 341 H719" />
        </>
      ) : (
        <>
          <Wire d="M206 71 H473" state="broken" />
          <Wire d="M686 71 H719" state="broken" />
          <Words x={220} y={62} fault>
            guessing keys, around the clock
          </Words>
          <Wire d="M206 221 H473" />
          <Wire d="M686 221 H719" />
        </>
      )}
    </svg>
  );
}

function D3a({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 400"
      role="img"
      aria-label={
        fixed
          ? "The bastion has no external IP. Nothing on the internet can reach it. The engineer reaches it through IAP, and from the bastion the rest of the VPC."
          : "The bastion has an external IP, so anyone scanning can find it and try to get in, and it is the one box with a route to everything else in the VPC."
      }
    >
      <text className="s" x="16" y="24">
        outside GCP
      </text>
      <Plain
        x={16}
        y={40}
        w={190}
        h={62}
        title="Anyone"
        lines={["scanning for SSH"]}
      />
      <Plain
        x={16}
        y={180}
        w={190}
        h={82}
        title="Engineer"
        lines={
          fixed
            ? ["gcloud compute ssh", "--tunnel-through-iap"]
            : ["SSH to the", "public address"]
        }
      />
      <Plain
        x={276}
        y={290}
        w={220}
        h={82}
        hue="plum"
        title="IAP TCP forwarding"
        lines={["35.235.240.0/20", "checks who you are"]}
        dim={!fixed}
      />
      <Zone x={536} y={10} w={408} h={380} label="harbour-vpc" hue="teal" />
      <Plain
        x={568}
        y={60}
        w={344}
        h={82}
        hue="teal"
        title="bastion"
        lines={[
          fixed ? "no external IP" : "external IP 34.124.10.7",
          "a route to everything inside",
        ]}
        broken={!fixed}
        tags={["D3a"]}
      />
      <Plain
        x={568}
        y={240}
        w={344}
        h={82}
        hue="teal"
        title="everything else"
        lines={["rabbitmq-1, legacy-api", "every VM the bastion reaches"]}
      />
      <Wire d="M740 142 V237" />
      {fixed ? (
        <>
          <Wire d="M206 71 H400" state="idle" />
          <Cross x={414} y={71} />
          <Words x={220} y={62}>
            no public address left
          </Words>
          <Wire d="M111 262 V331 H273" />
          <Wire d="M496 331 H520 V121 H565" />
        </>
      ) : (
        <>
          <Wire d="M206 71 H520 V91 H565" state="broken" />
          <Words x={220} y={62} fault>
            anyone can find it and knock
          </Words>
          <Wire d="M206 221 H500 V111 H565" />
        </>
      )}
    </svg>
  );
}

function D3b({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 320"
      role="img"
      aria-label={
        fixed
          ? "The legacy-api instances have no external IPs. They are reached only through the load balancer, and every outbound call leaves through Cloud NAT on one of two reserved addresses, which PayGate knows."
          : "Each legacy-api instance has its own public IP, so anyone can reach it around the load balancer and its WAF, and each one calls out as itself from an address PayGate does not know. Cloud NAT is ignored."
      }
    >
      <text className="s" x="16" y="24">
        outside GCP
      </text>
      <Plain
        x={16}
        y={36}
        w={200}
        h={62}
        title="Anyone"
        lines={["knows an instance IP"]}
      />
      <Plain
        x={16}
        y={150}
        w={200}
        h={102}
        hue="plum"
        title="External ALB"
        lines={["+ Cloud Armor", "the way in"]}
      />
      <Zone
        x={256}
        y={10}
        w={500}
        h={300}
        label="harbour-vpc · sn-a-app"
        hue="teal"
      />
      <Plain
        x={276}
        y={110}
        w={240}
        h={102}
        hue="teal"
        title="legacy-api × 3"
        lines={
          fixed
            ? ["no external IPs", "10.10.0.x only"]
            : ["each has a public IP", "34.87.x.1, .2, .3"]
        }
        broken={!fixed}
        tags={["D3b"]}
      />
      <Plain
        x={556}
        y={110}
        w={180}
        h={102}
        hue="teal"
        title="Cloud NAT"
        lines={["harbour-egress-1", "harbour-egress-2"]}
        dim={!fixed}
      />
      <text className="s" x="786" y="96">
        outside GCP
      </text>
      <Plain
        x={786}
        y={110}
        w={158}
        h={102}
        title="PayGate"
        lines={["allows two", "addresses"]}
      />
      <Wire d="M216 201 H273" />
      {fixed ? (
        <>
          <Wire d="M216 67 H330" state="idle" />
          <Cross x={344} y={67} />
          <Words x={230} y={58}>
            no public IP
          </Words>
          <Wire d="M516 161 H553" />
          <Wire d="M736 161 H783" />
        </>
      ) : (
        <>
          <Wire d="M216 67 H396 V107" state="broken" />
          <Words x={230} y={58} fault>
            around the load balancer
          </Words>
          <Wire d="M396 212 V262 H865 V215" state="broken" />
          <Words x={410} y={254} fault>
            leaves as itself, from a different address each
          </Words>
        </>
      )}
    </svg>
  );
}

function D4({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 392"
      role="img"
      aria-label={
        fixed
          ? "sn-a-data has Private Google Access on, so rabbitmq-1, with no external IP, reaches Secret Manager, Cloud Storage and Cloud Logging over 199.36.153.8/30."
          : "sn-a-data has Private Google Access off and rabbitmq-1 has no external IP, so it has no route to Secret Manager, Cloud Storage or Cloud Logging. The tempting fix is an external IP."
      }
    >
      <Zone x={16} y={10} w={928} h={130} label="Google APIs" hue="plum" />
      <Plain
        x={32}
        y={46}
        w={280}
        h={76}
        hue="plum"
        title="Secret Manager"
        lines={["secretmanager.googleapis.com"]}
      />
      <Plain
        x={340}
        y={46}
        w={280}
        h={76}
        hue="plum"
        title="Cloud Storage"
        lines={["storage.googleapis.com"]}
      />
      <Plain
        x={648}
        y={46}
        w={280}
        h={76}
        hue="plum"
        title="Cloud Logging"
        lines={["logging.googleapis.com"]}
      />
      <Zone x={16} y={180} w={928} h={200} label="harbour-vpc" hue="teal" />
      <ZoneStop
        id="G_DATA"
        x={32}
        y={216}
        w={600}
        h={148}
        label="sn-a-data · 10.10.17.0/24"
        sub={fixed ? "Private Google Access on" : "Private Google Access off"}
        subFault={!fixed}
        tags={["D4"]}
      />
      {!fixed && (
        <Plain
          x={48}
          y={272}
          w={260}
          h={76}
          ghost
          title="an external IP"
          lines={["the tempting quick fix"]}
        />
      )}
      <Plain
        x={355}
        y={272}
        w={250}
        h={76}
        hue="teal"
        title="rabbitmq-1"
        lines={["10.10.17.x · no external IP"]}
      />
      {fixed ? (
        <>
          <Wire d="M480 272 V125" />
          <Wire d="M480 160 H172 V125" />
          <Wire d="M480 160 H788 V125" />
          <Words x={494} y={154}>
            Private Google Access · 199.36.153.8/30
          </Words>
        </>
      ) : (
        <>
          <Wire d="M480 272 V230" state="broken" />
          <Cross x={480} y={216} />
          <Words x={494} y={252} fault>
            no route out
          </Words>
        </>
      )}
    </svg>
  );
}

function D5({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 400"
      role="img"
      aria-label={
        fixed
          ? "harbour-pg has no public IP. harbour-api reaches it on private IP 10.90.0.3 through the PSA reservation in harbour-vpc. The authorized-networks list is gone, and a stranger has nothing to reach."
          : "harbour-pg has a public IP guarded by an authorized-networks list holding home broadband addresses. harbour-api reaches it over the internet, and a stranger handed one of those home addresses by their ISP is let in too."
      }
    >
      <text className="s" x="16" y="24">
        outside GCP
      </text>
      <Plain
        x={16}
        y={36}
        w={220}
        h={82}
        title="A stranger"
        lines={["given a recycled home", "IP by their ISP"]}
      />
      <Plain
        x={16}
        y={180}
        w={220}
        h={82}
        hue="plum"
        title="harbour-api"
        lines={[
          "Cloud Run",
          fixed ? "direct VPC egress" : "calls the public IP",
        ]}
      />
      <Plain
        x={296}
        y={36}
        w={240}
        h={102}
        hue="amber"
        title="authorized networks"
        lines={
          fixed
            ? ["removed"]
            : [
                "office 203.0.113.0/28",
                "2 home broadband IPs",
                "3 legacy-api IPs",
              ]
        }
        broken={!fixed}
        ghost={fixed}
      />
      <Words x={296} y={180} fault={!fixed}>
        {fixed ? "no public IP left to reach" : "an allow-list and a password"}
      </Words>
      <Zone x={276} y={210} w={300} h={180} label="harbour-vpc" hue="teal" />
      <Plain
        x={296}
        y={268}
        w={260}
        h={82}
        hue="teal"
        title="PSA reservation"
        lines={["10.90.0.0/16 · peering"]}
        dim={!fixed}
      />
      <Zone x={616} y={10} w={328} h={380} label="Google's side" hue="plum" />
      <Plain
        x={636}
        y={56}
        w={288}
        h={102}
        hue="plum"
        title="harbour-pg"
        lines={
          fixed
            ? ["Cloud SQL", "private IP 10.90.0.3", "no public IP"]
            : ["Cloud SQL", "public IP 34.126.4.20:5432", "no private IP"]
        }
        broken={!fixed}
        tags={["D5"]}
      />
      {fixed ? (
        <>
          <Wire d="M236 77 H262" state="idle" />
          <Cross x={276} y={77} />
          <Wire d="M126 262 V309 H293" />
          <Words x={140} y={300}>
            inside the VPC
          </Words>
          <Wire d="M556 309 H780 V161" />
        </>
      ) : (
        <>
          <Wire d="M236 77 H293" state="broken" />
          <Wire d="M236 221 H260 V117 H293" state="broken" />
          <Wire d="M536 87 H633" state="broken" />
          <Words x={548} y={78} fault>
            let in
          </Words>
        </>
      )}
    </svg>
  );
}

function D6({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 300"
      role="img"
      aria-label={
        fixed
          ? "Shoppers reach harbour-api through Cloudflare and the load balancer with Cloud Armor. The run.app URL is refused: ingress allows only the load balancer and the VPC."
          : "Shoppers reach harbour-api through Cloudflare and the load balancer with Cloud Armor. Anyone with the run.app URL reaches harbour-api directly, skipping every protection on that path."
      }
    >
      <Plain
        x={16}
        y={40}
        w={180}
        h={62}
        title="Shoppers"
        lines={["browser · app"]}
      />
      <Plain
        x={236}
        y={40}
        w={200}
        h={62}
        title="Cloudflare"
        lines={["CDN + WAF"]}
      />
      <Plain
        x={476}
        y={40}
        w={200}
        h={62}
        hue="plum"
        title="External ALB"
        lines={["+ Cloud Armor"]}
      />
      <Plain
        x={716}
        y={40}
        w={228}
        h={222}
        hue="plum"
        title="harbour-api"
        lines={
          fixed
            ? ["Cloud Run", "ingress: internal +", "cloud load balancing"]
            : ["Cloud Run", "ingress: all"]
        }
        broken={!fixed}
        tags={["D6"]}
      />
      <Wire d="M196 71 H233" />
      <Wire d="M436 71 H473" />
      <Wire d="M676 71 H713" />
      <Plain
        x={16}
        y={200}
        w={180}
        h={62}
        title="Anyone"
        lines={["found the URL"]}
      />
      <Plain
        x={236}
        y={200}
        w={440}
        h={62}
        title="harbour-api-x7k2.a.run.app"
        lines={[
          fixed ? "closed to the internet" : "no CDN, no WAF, no Cloud Armor",
        ]}
        broken={!fixed}
        dim={fixed}
      />
      {fixed ? (
        <>
          <Wire d="M196 231 H233" state="idle" />
          <Wire d="M676 231 H688" state="idle" />
          <Cross x={700} y={231} />
          <Words x={236} y={290}>
            refused: ingress allows only the load balancer and the VPC
          </Words>
        </>
      ) : (
        <>
          <Wire d="M196 231 H233" state="broken" />
          <Wire d="M676 231 H713" state="broken" />
          <Words x={236} y={290} fault>
            the side door: everything on the top row is skipped
          </Words>
        </>
      )}
    </svg>
  );
}

function D7({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 392"
      role="img"
      aria-label={
        fixed
          ? "harbour-api sends all its egress into harbour-vpc. Calls to harbour-cache stay private, and the call to PayGate leaves through Cloud NAT on a reserved address that PayGate knows."
          : "harbour-api sends only private ranges into the VPC. Its call to harbour-cache works, but its call to PayGate leaves from Google's shared serverless pool, on an address PayGate rejects."
      }
    >
      <Plain
        x={16}
        y={150}
        w={210}
        h={82}
        hue="plum"
        title="harbour-api"
        lines={[
          "Cloud Run",
          fixed ? "egress: all-traffic" : "egress: private-ranges",
        ]}
        broken={!fixed}
        tags={["D7"]}
      />
      <Plain
        x={316}
        y={30}
        w={220}
        h={82}
        hue="plum"
        title="Google's shared pool"
        lines={["serverless egress", "a new IP each time"]}
        dim={fixed}
      />
      <text className="s" x="724" y="20">
        outside GCP
      </text>
      <Plain
        x={724}
        y={30}
        w={220}
        h={82}
        title="PayGate"
        lines={["allows two addresses", "harbour-egress-1, -2"]}
      />
      <Zone
        x={276}
        y={160}
        w={400}
        h={222}
        label="harbour-vpc · sn-a-app"
        hue="teal"
      />
      <Plain
        x={296}
        y={206}
        w={220}
        h={82}
        hue="teal"
        title="Cloud NAT"
        lines={["harbour-egress-1, -2"]}
        dim={!fixed}
      />
      <Plain
        x={724}
        y={290}
        w={220}
        h={82}
        hue="plum"
        title="harbour-cache"
        lines={["Memorystore", "10.90.x.x · private"]}
      />
      <Wire d="M226 211 H246 V331 H721" />
      <Words x={296} y={356}>
        a private range: through the VPC either way
      </Words>
      {fixed ? (
        <>
          <Wire d="M226 171 H262 V247 H293" />
          <Wire d="M516 247 H834 V115" />
          <Words x={530} y={238}>
            from a reserved address
          </Words>
        </>
      ) : (
        <>
          <Wire d="M226 171 H262 V71 H313" state="broken" />
          <Wire d="M536 71 H721" state="broken" />
          <Words x={548} y={62} fault>
            rejected · not on file
          </Words>
        </>
      )}
    </svg>
  );
}

function D8({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 320"
      role="img"
      aria-label={
        fixed
          ? "Shoppers come through Cloudflare to the load balancer, and Cloud Armor's harbour-waf policy allows only the cloudflare-edge address group. Anyone sending straight to the origin reaches the load balancer and is refused with a 403."
          : "Shoppers come through Cloudflare, with its WAF, bot checks, rate limits and DDoS protection. Anyone who knows the load balancer's address goes straight to it, skipping Cloudflare, and Cloud Armor has no source rule to stop them."
      }
    >
      <Plain
        x={16}
        y={40}
        w={180}
        h={62}
        title="Shoppers"
        lines={["browser · app"]}
      />
      <Plain
        x={236}
        y={40}
        w={200}
        h={102}
        title="Cloudflare"
        lines={["WAF · bot checks", "rate limits", "DDoS protection"]}
      />
      <Plain
        x={476}
        y={40}
        w={200}
        h={102}
        hue="plum"
        title="Global external ALB"
        lines={["34.120.95.195:443"]}
      />
      <Plain
        x={716}
        y={40}
        w={228}
        h={102}
        hue="amber"
        title="harbour-waf"
        lines={
          fixed
            ? ["Cloud Armor", "allow cloudflare-edge", "deny everything else"]
            : ["Cloud Armor", "no source rule", "anything passes"]
        }
        broken={!fixed}
        tags={["D8"]}
      />
      <Plain
        x={716}
        y={220}
        w={228}
        h={82}
        hue="plum"
        title="harbour-api"
        lines={["Cloud Run"]}
      />
      <Plain
        x={16}
        y={220}
        w={180}
        h={82}
        title="Anyone"
        lines={["found its IP", "in old DNS"]}
      />
      <Wire d="M196 71 H233" />
      <Wire d="M436 91 H473" />
      <Wire d="M676 91 H713" />
      <Wire d="M830 142 V217" />
      <Wire d="M196 261 H576 V145" state={fixed ? "idle" : "broken"} />
      <Words x={210} y={252} fault={!fixed}>
        {fixed
          ? "Cloud Armor answers 403: not from cloudflare-edge"
          : "straight to the origin, past Cloudflare"}
      </Words>
    </svg>
  );
}

function D9({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 392"
      role="img"
      aria-label={
        fixed
          ? "Egress rules in priority order: allow named FQDNs for PayGate and billing at 1000, deny all egress at 65000. harbour-api's call to PayGate matches the first; a compromised VM's upload to exfil.attacker.example is denied at 65000."
          : "There are no egress rules, so the implied allow at 65535 decides everything. harbour-api reaches PayGate, and a compromised VM sends data to exfil.attacker.example just as easily."
      }
    >
      <Plain
        x={16}
        y={40}
        w={220}
        h={82}
        hue="plum"
        title="harbour-api"
        lines={["calls api.paygate", ".example :443"]}
      />
      <Plain
        x={16}
        y={260}
        w={220}
        h={82}
        hue="teal"
        title="a compromised VM"
        lines={["sends to", "exfil.attacker.example"]}
        broken={!fixed}
      />
      <Zone x={276} y={10} w={400} h={372} label="egress rules, by priority" />
      <Plain
        x={296}
        y={40}
        w={360}
        h={82}
        hue="amber"
        title="1000 · allow named FQDNs"
        lines={
          fixed
            ? ["api.paygate.example", "api.billing.example · tcp:443"]
            : ["does not exist"]
        }
        ghost={!fixed}
      />
      <Plain
        x={296}
        y={160}
        w={360}
        h={62}
        hue="amber"
        title="65000 · deny all egress"
        lines={[fixed ? "to 0.0.0.0/0" : "does not exist"]}
        ghost={!fixed}
      />
      <Plain
        x={296}
        y={280}
        w={360}
        h={82}
        hue="amber"
        title="65535 · implied allow"
        lines={["to 0.0.0.0/0", fixed ? "never reached" : "decides everything"]}
        broken={!fixed}
        dim={fixed}
        tags={["D9"]}
      />
      <text className="s" x="716" y="30">
        the internet
      </text>
      <Plain
        x={716}
        y={40}
        w={228}
        h={82}
        title="PayGate"
        lines={["api.paygate.example"]}
      />
      <Plain
        x={716}
        y={280}
        w={228}
        h={82}
        title="exfil.attacker.example"
        lines={[fixed ? "never reached" : "receives the data"]}
        broken={!fixed}
        dim={fixed}
      />
      {fixed ? (
        <>
          <Wire d="M236 81 H293" />
          <Wire d="M656 81 H713" />
          <Wire d="M236 301 H256 V191 H293" state="idle" />
          <Cross x={686} y={191} />
          <Words x={704} y={196}>
            denied at 65000
          </Words>
        </>
      ) : (
        <>
          <Wire d="M236 81 H256 V305 H293" />
          <Wire d="M656 305 H686 V81 H713" />
          <Wire d="M236 341 H293" state="broken" />
          <Wire d="M656 341 H713" state="broken" />
        </>
      )}
    </svg>
  );
}

function D10({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 360"
      role="img"
      aria-label={
        fixed
          ? "An org-level policy, harbour-baseline, denies tcp 22 and 3389 from the internet and is checked before any project rule. SSH from the internet is denied there, whatever a project owner writes below."
          : "Nothing is set above the project. The VPC firewall rules a project owner writes are the first and only layer, and today they let tcp 22 from the internet reach every VM."
      }
    >
      <text className="s" x="276" y="26">
        checked top to bottom
      </text>
      <Plain
        x={16}
        y={140}
        w={210}
        h={82}
        title="From the internet"
        lines={["tcp:22 to any VM"]}
      />
      <Plain
        x={16}
        y={270}
        w={210}
        h={82}
        title="A project owner"
        lines={["can edit any rule", "in the project"]}
      />
      <Plain
        x={276}
        y={40}
        w={400}
        h={82}
        hue="amber"
        title={
          fixed ? "harbour-baseline · organization" : "organization policy"
        }
        lines={
          fixed
            ? ["deny tcp:22, 3389", "from 0.0.0.0/0 · checked first"]
            : ["nothing set"]
        }
        ghost={!fixed}
        tags={["D10"]}
      />
      <Plain
        x={276}
        y={180}
        w={400}
        h={82}
        hue="amber"
        title="VPC firewall rules · project"
        lines={["what a project owner writes", "today: tcp:22 from 0.0.0.0/0"]}
      />
      <Plain
        x={716}
        y={180}
        w={228}
        h={82}
        hue="teal"
        title="every VM"
        lines={["port 22"]}
        broken={!fixed}
      />
      <Wire d="M226 311 H476 V265" />
      <Words x={240} y={302}>
        edits, or deletes, any rule here
      </Words>
      {fixed ? (
        <>
          <Wire d="M226 161 H250 V81 H273" state="idle" />
          <Cross x={698} y={81} />
          <Words x={716} y={86}>
            denied before any project rule
          </Words>
          <Words x={290} y={152}>
            set at the org: no project owner can change it
          </Words>
        </>
      ) : (
        <>
          <Wire d="M226 201 H273" state="broken" />
          <Wire d="M676 221 H713" state="broken" />
        </>
      )}
    </svg>
  );
}

function D12({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 360"
      role="img"
      aria-label={
        fixed
          ? "sn-a-proxy, 10.10.250.0/24 with purpose REGIONAL_MANAGED_PROXY, holds the internal ALB's proxies. Internal callers reach legacy-api through the internal ALB, with health checks."
          : "There is no proxy-only subnet, so the internal ALB cannot be created. Internal callers reach legacy-api instances straight by address, with no health checks and no balancing."
      }
    >
      <Zone
        x={16}
        y={10}
        w={928}
        h={340}
        label="harbour-vpc · asia-southeast1"
        hue="teal"
      />
      <Plain
        x={32}
        y={80}
        w={220}
        h={102}
        hue="teal"
        title="internal callers"
        lines={["harbour-jobs, other", "services in the VPC"]}
      />
      <Plain
        x={300}
        y={80}
        w={260}
        h={102}
        hue="plum"
        title="internal ALB"
        lines={
          fixed
            ? ["10.10.0.50:80", "health checks on"]
            : ["cannot be created:", "no proxy-only subnet"]
        }
        ghost={!fixed}
      />
      <Plain
        x={608}
        y={80}
        w={316}
        h={102}
        hue="teal"
        title="legacy-api × 3"
        lines={["10.10.0.11, .12, .13"]}
      />
      <ZoneStop
        id="G_PROXY"
        x={300}
        y={226}
        w={260}
        h={110}
        label="sn-a-proxy"
        sub={fixed ? "10.10.250.0/24 · proxy-only" : "does not exist"}
        subFault={!fixed}
        tags={["D12"]}
      />
      {fixed ? (
        <>
          <Wire d="M252 131 H297" />
          <Wire d="M560 131 H605" />
          <Dashed d="M430 182 V223" hue="plum" />
          <Words x={444} y={208}>
            its proxies live here
          </Words>
        </>
      ) : (
        <>
          <Wire d="M142 80 V52 H766 V77" state="broken" />
          <Words x={300} y={72} fault>
            straight to instance addresses: no health checks, no balancing
          </Words>
        </>
      )}
    </svg>
  );
}

function D14({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 340"
      role="img"
      aria-label={
        fixed
          ? "The load balancer's URL map sends /api/* to api-backend-service and /legacy/* to legacy-backend-service. harbour-waf is attached to both, so both paths get the same Cloud Armor rules."
          : "The load balancer's URL map sends /api/* to api-backend-service, which has harbour-waf, and /legacy/* to legacy-backend-service, which has no Cloud Armor policy, so the same attack reaches legacy-api unfiltered."
      }
    >
      <Plain
        x={16}
        y={130}
        w={190}
        h={82}
        title="Requests"
        lines={["/api/* and", "/legacy/*"]}
      />
      <Plain
        x={246}
        y={110}
        w={230}
        h={122}
        hue="plum"
        title="External ALB"
        lines={["URL map", "/api/* → api", "/legacy/* → legacy"]}
      />
      <Plain
        x={536}
        y={30}
        w={210}
        h={82}
        hue="amber"
        title="harbour-waf"
        lines={["Cloud Armor", "on api-backend"]}
      />
      <Plain
        x={786}
        y={30}
        w={158}
        h={82}
        hue="plum"
        title="harbour-api"
        lines={["Cloud Run"]}
      />
      <Plain
        x={536}
        y={230}
        w={210}
        h={82}
        hue="amber"
        title={fixed ? "harbour-waf" : "no Cloud Armor"}
        lines={[
          fixed ? "Cloud Armor" : "no securityPolicy",
          "on legacy-backend",
        ]}
        broken={!fixed}
        tags={["D14"]}
      />
      <Plain
        x={786}
        y={230}
        w={158}
        h={82}
        hue="teal"
        title="legacy-api"
        lines={["MIG · 3 VMs"]}
      />
      <Wire d="M206 171 H243" />
      <Wire d="M476 151 H506 V71 H533" />
      <Wire d="M746 71 H783" />
      <Wire d="M476 191 H506 V271 H533" state={fixed ? "ok" : "broken"} />
      <Wire d="M746 271 H783" state={fixed ? "ok" : "broken"} />
      <Words x={246} y={290} fault={!fixed}>
        {fixed
          ? "both paths, one rule set"
          : "the same attack reaches legacy-api unfiltered"}
      </Words>
    </svg>
  );
}

function D15({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 300"
      role="img"
      aria-label={
        fixed
          ? "The target HTTPS proxy uses the harbour-tls SSL policy: RESTRICTED profile, TLS 1.2 minimum. A current browser on TLS 1.3 connects; a client asking for TLS 1.0 is refused."
          : "The target HTTPS proxy has no SSL policy, so the default profile accepts TLS 1.0 and older ciphers. A current browser connects, and so does a client asking for TLS 1.0."
      }
    >
      <Plain
        x={16}
        y={40}
        w={230}
        h={82}
        title="A current browser"
        lines={["TLS 1.3"]}
      />
      <Plain
        x={16}
        y={180}
        w={230}
        h={82}
        title="An old or hostile client"
        lines={["asks for TLS 1.0"]}
      />
      <Plain
        x={316}
        y={40}
        w={300}
        h={222}
        hue="plum"
        title="target HTTPS proxy"
        lines={
          fixed
            ? [
                "certificate: harbour.example",
                "SSL policy: harbour-tls",
                "RESTRICTED profile",
                "TLS 1.2 minimum",
              ]
            : [
                "certificate: harbour.example",
                "SSL policy: none",
                "default profile",
                "accepts TLS 1.0 and up",
              ]
        }
        broken={!fixed}
        tags={["D15"]}
      />
      <Plain
        x={686}
        y={110}
        w={258}
        h={82}
        hue="plum"
        title="URL map, backends"
        lines={["the request continues"]}
      />
      <Wire d="M246 81 H313" />
      <Wire d="M616 151 H683" />
      {fixed ? (
        <>
          <Wire d="M246 221 H288" state="idle" />
          <Cross x={300} y={221} />
          <Words x={16} y={288}>
            handshake refused: below TLS 1.2
          </Words>
        </>
      ) : (
        <>
          <Wire d="M246 221 H313" state="broken" />
          <Words x={16} y={288} fault>
            a weak handshake, accepted
          </Words>
        </>
      )}
    </svg>
  );
}

function D16({ fixed }: P) {
  return (
    <svg
      viewBox="0 0 960 340"
      role="img"
      aria-label={
        fixed
          ? "OS Login is on. Each login is checked against IAM, roles/compute.osLogin, so revoking it removes access to every VM at once, and the log names the person who logged in."
          : "Public SSH keys live in project metadata, including a contractor who left in March, and every VM trusts every key there. The login log records that a key was used, not who used it."
      }
    >
      <Plain
        x={16}
        y={30}
        w={280}
        h={102}
        hue="amber"
        title="project metadata · ssh-keys"
        lines={[
          "alice · ssh-ed25519",
          "bob · ssh-ed25519",
          "contractor · left in March",
        ]}
        broken={!fixed}
        dim={fixed}
        tags={["D16"]}
      />
      <Plain
        x={16}
        y={210}
        w={280}
        h={102}
        hue="amber"
        title="IAM · OS Login"
        lines={[
          "roles/compute.osLogin",
          "alice@harbour.example",
          "revoke once, gone everywhere",
        ]}
        dim={!fixed}
      />
      <Words x={16} y={176} fault={!fixed}>
        {fixed
          ? "access follows the person, not a key"
          : "a contractor's key still opens every VM"}
      </Words>
      <Zone x={336} y={10} w={340} h={320} label="harbour-vpc" hue="teal" />
      <Plain
        x={356}
        y={50}
        w={300}
        h={262}
        hue="teal"
        title="every VM"
        lines={[
          "bastion",
          "legacy-api × 3",
          "rabbitmq-1",
          "",
          fixed ? "asks IAM at each login" : "trusts every key in",
          fixed ? "" : "project metadata",
        ]}
      />
      <Plain
        x={716}
        y={110}
        w={228}
        h={122}
        title="login log"
        lines={
          fixed
            ? ["logged in:", "alice@harbour.example", "named, every time"]
            : ["a key was used:", "SHA256:9f3c…", "whose? unknown"]
        }
        broken={!fixed}
      />
      {fixed ? (
        <Wire d="M296 261 H353" />
      ) : (
        <Wire d="M296 81 H353" state="broken" />
      )}
      <Wire d="M656 171 H713" />
    </svg>
  );
}

const DRAWINGS: Record<string, ComponentType<P>> = {
  D1,
  D2,
  D3a,
  D3b,
  D4,
  D5,
  D6,
  D7,
  D8,
  D9,
  D10,
  D12,
  D14,
  D15,
  D16,
};

/** Defects a packet journey already draws exactly: its drawing, and where it breaks. */
const BORROWED: Record<string, { slug: string; failing: string[] }> = {
  D11: { slug: "partner-database", failing: ["PSA", "REDIS"] },
  D13: { slug: "health-probe", failing: ["LEGACY"] },
};

/** Subnets a defect's drawing reddens as found. */
const ZONES: Record<string, string[]> = {
  D4: ["G_DATA"],
  D12: ["G_PROXY"],
};

/** The defect's own drawing, as found or with only this defect closed. */
export function DefectDrawing({
  id,
  fixed,
  mini,
}: {
  id: string;
  fixed: boolean;
  mini?: boolean;
}) {
  const borrowed = BORROWED[id];
  const walk = {
    fixed,
    closed: fixed ? new Set([id]) : NONE,
    failing: fixed ? NONE : new Set(borrowed?.failing ?? ZONES[id] ?? []),
    order: new Map<string, number>(),
    mini,
  };
  if (borrowed) return <JourneyDrawing slug={borrowed.slug} walk={walk} />;
  const Drawing = DRAWINGS[id];
  if (!Drawing) return null;
  return (
    <WalkProvider value={walk}>
      <Drawing fixed={fixed} />
    </WalkProvider>
  );
}
