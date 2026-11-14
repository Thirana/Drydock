import { Box } from "@/components/site/landing/request-drawing";

/** A part of the course, marked where the drawing shows what it teaches. */
function Part({ n, x, y }: { n: number; x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <circle className="badge" cx={x} cy={y} r="11" />
      <text
        className="t mid"
        x={x}
        y={y + 4.5}
        style={{ fontSize: "12.5px", fontWeight: 700 }}
      >
        {n}
      </text>
    </g>
  );
}

/**
 * The fundamentals course as one request: from the laptop at home, through
 * DNS, the router and the internet, to kade-api and kade-db. Each numbered
 * mark is the part of the course that teaches that step, the same numbers
 * as the route beside the chapter list.
 */
export function FundamentalsRequest() {
  return (
    <svg
      viewBox="0 0 660 520"
      role="img"
      className="min-w-[600px] lg:min-w-0"
      aria-label="One request from your laptop at 192.168.1.23 to kade-api. The laptop asks DNS where api.kade.lk is and gets 34.87.120.15. The packet goes to the home router, which rewrites its source to 203.0.113.45, then across the internet to kade-api at 10.10.1.10 in sn-app, which queries kade-db at 10.10.2.5 in sn-data. Marks 1 to 5 show which part of the course teaches each step: addressing and local delivery at home, routing and transport across the internet, application protocols at DNS, network building blocks at kade-api, and putting it together along the whole path."
    >
      {/* Home */}
      <rect className="zone" x="16" y="16" width="190" height="324" rx="2" />
      <text className="s" x="30" y="38">
        home network
      </text>
      <Box
        x={26}
        y={52}
        w={170}
        h={66}
        hue="plum"
        title="Laptop · you"
        lines={["192.168.1.23"]}
      />
      <Box
        x={26}
        y={150}
        w={170}
        h={90}
        hue="teal"
        title="Home router"
        lines={["LAN 192.168.1.1", "WAN 203.0.113.45"]}
      />
      <Box
        x={26}
        y={264}
        w={170}
        h={62}
        title="Phone"
        lines={["192.168.1.40"]}
      />
      <Part n={1} x={196} y={150} />

      {/* Kadé office: not on this request's path */}
      <Box
        x={16}
        y={372}
        w={190}
        h={90}
        hue="teal"
        title="Kadé office"
        lines={["172.16.0.0/16", "WAN 198.51.100.20"]}
      />

      {/* DNS and the internet */}
      <Box
        x={460}
        y={16}
        w={184}
        h={90}
        title="DNS"
        lines={["api.kade.lk", "→ 34.87.120.15"]}
      />
      <Part n={3} x={644} y={16} />
      <Box
        x={460}
        y={150}
        w={184}
        h={66}
        title="Internet"
        lines={["ISP + many routers"]}
      />
      <Part n={2} x={644} y={150} />

      {/* Kadé's cloud */}
      <rect
        className="zone teal"
        x="230"
        y="250"
        width="414"
        height="256"
        rx="2"
      />
      <text className="s" x="244" y="272">
        kade-vpc · 10.10.0.0/16
      </text>
      <rect className="zone" x="244" y="286" width="386" height="102" rx="2" />
      <text className="s" x="258" y="306">
        sn-app · 10.10.1.0/24
      </text>
      <Box
        x={256}
        y={316}
        w={362}
        h={62}
        hue="green"
        title="kade-api (Node app)"
        lines={["10.10.1.10 · public 34.87.120.15"]}
      />
      <Part n={4} x={618} y={316} />
      <rect className="zone" x="244" y="400" width="386" height="96" rx="2" />
      <text className="s" x="258" y="420">
        sn-data · 10.10.2.0/24
      </text>
      <Box
        x={256}
        y={428}
        w={362}
        h={58}
        hue="green"
        title="kade-db (PostgreSQL)"
        lines={["10.10.2.5:5432"]}
      />

      {/* The request */}
      <text className="l" x="222" y="74">
        where is api.kade.lk?
      </text>
      <path
        className="w dash dd-hop"
        pathLength={1}
        d="M196 85 H457"
        markerEnd="url(#dd-ah-muted)"
        style={{ animationDelay: "200ms" }}
      />
      <path
        className="w plum dd-hop"
        pathLength={1}
        d="M111 118 V147"
        markerEnd="url(#dd-ah-plum)"
        style={{ animationDelay: "420ms" }}
      />
      <path className="w" d="M111 264 V243" />
      <text className="l" x="222" y="172">
        source becomes 203.0.113.45
      </text>
      <path
        className="w teal dd-hop"
        pathLength={1}
        d="M196 183 H457"
        markerEnd="url(#dd-ah-teal)"
        style={{ animationDelay: "640ms" }}
      />
      <text className="l" x="486" y="245">
        HTTPS :443
      </text>
      <Part n={5} x={614} y={240} />
      <path
        className="w teal dd-hop"
        pathLength={1}
        d="M590 216 V313"
        markerEnd="url(#dd-ah-teal)"
        style={{ animationDelay: "860ms" }}
      />
      <text className="l" x="490" y="410">
        SQL
      </text>
      <path
        className="w green dd-hop"
        pathLength={1}
        d="M480 378 V425"
        markerEnd="url(#dd-ah-green)"
        style={{ animationDelay: "1080ms" }}
      />
      <path
        className="w dash"
        d="M206 417 H218 V205 H457"
        markerEnd="url(#dd-ah-muted)"
      />
    </svg>
  );
}

/**
 * Kadé's project where the GCP course leaves it, laid out like the drawing
 * of the project as found, so switching between the two shows what moved.
 */
export function KadeAtEnd() {
  return (
    <svg
      viewBox="0 0 660 560"
      role="img"
      className="min-w-[600px] lg:min-w-0"
      aria-label="Kadé’s Google Cloud project at the end of the course. Shoppers reach Cloudflare, then the load balancer at 34.120.88.10, which accepts only Cloudflare and sends requests to Cloud Run kade-api. Cloud Run’s outgoing traffic lands in sn-run, then goes through Cloud NAT at the fixed IP 34.87.200.7 to PayGate, or privately to Cloud SQL kade-sql at 10.10.32.3. You reach kade-worker at 10.10.1.20 through IAP. Firewall rules allow only the ports each service needs."
    >
      {/* Outside the VPC */}
      <Box
        x={16}
        y={16}
        w={180}
        h={66}
        title="Shoppers"
        lines={["app + website"]}
      />
      <Box
        x={230}
        y={16}
        w={190}
        h={66}
        title="Cloudflare"
        lines={["kade.lk DNS + WAF"]}
      />
      <Box
        x={444}
        y={16}
        w={200}
        h={66}
        title="PayGate"
        lines={["only 34.87.200.7"]}
      />
      <Box
        x={16}
        y={124}
        w={170}
        h={90}
        hue="plum"
        title="Load balancer"
        lines={["34.120.88.10:443", "Cloudflare only"]}
      />
      <Box
        x={214}
        y={124}
        w={216}
        h={90}
        hue="plum"
        title="Cloud Run: kade-api"
        lines={["ingress: internal+LB", "egress: into sn-run"]}
      />
      <Box
        x={444}
        y={124}
        w={200}
        h={90}
        hue="teal"
        title="Cloud NAT"
        lines={["fixed 34.87.200.7", "outgoing only"]}
      />
      <Box
        x={16}
        y={262}
        w={180}
        h={66}
        title="You (home)"
        lines={["203.0.113.45"]}
      />
      <Box
        x={16}
        y={370}
        w={180}
        h={66}
        hue="plum"
        title="IAP"
        lines={["35.235.240.0/20"]}
      />
      <Box
        x={16}
        y={478}
        w={180}
        h={66}
        hue="amber"
        title="Firewall"
        lines={["only needed ports"]}
      />

      {/* kade-vpc */}
      <rect
        className="zone teal"
        x="230"
        y="250"
        width="414"
        height="294"
        rx="2"
      />
      <text className="s" x="244" y="272">
        kade-vpc · custom mode
      </text>
      <rect className="zone" x="244" y="286" width="186" height="108" rx="2" />
      <text className="s" x="258" y="306">
        sn-app
      </text>
      <Box
        x={256}
        y={318}
        w={162}
        h={62}
        hue="teal"
        title="kade-worker"
        lines={["10.10.1.20"]}
      />
      <rect className="zone" x="444" y="286" width="186" height="108" rx="2" />
      <text className="s" x="458" y="306">
        sn-run
      </text>
      <text className="s" x="458" y="344">
        10.10.3.0/24
      </text>
      <text className="s" x="458" y="365">
        Cloud Run’s egress
      </text>
      <rect
        className="zone plum"
        x="244"
        y="408"
        width="386"
        height="110"
        rx="2"
      />
      <text className="s" x="258" y="428">
        private services · 10.10.32.0/20
      </text>
      <Box
        x={256}
        y={442}
        w={362}
        h={62}
        hue="plum"
        title="Cloud SQL: kade-sql"
        lines={["10.10.32.3 · db.kade.internal"]}
      />

      {/* Wires */}
      <path
        className="w teal dd-hop"
        pathLength={1}
        d="M196 49 H227"
        markerEnd="url(#dd-ah-teal)"
        style={{ animationDelay: "200ms" }}
      />
      <path
        className="w teal dd-hop"
        pathLength={1}
        d="M325 82 V100 H101 V121"
        markerEnd="url(#dd-ah-teal)"
        style={{ animationDelay: "380ms" }}
      />
      <path
        className="w plum dd-hop"
        pathLength={1}
        d="M186 169 H211"
        markerEnd="url(#dd-ah-plum)"
        style={{ animationDelay: "560ms" }}
      />
      <path
        className="w plum dd-hop"
        pathLength={1}
        d="M400 214 V236 H500 V283"
        markerEnd="url(#dd-ah-plum)"
        style={{ animationDelay: "740ms" }}
      />
      <path
        className="w teal dd-hop"
        pathLength={1}
        d="M590 286 V217"
        markerEnd="url(#dd-ah-teal)"
        style={{ animationDelay: "920ms" }}
      />
      <path
        className="w green dd-hop"
        pathLength={1}
        d="M544 124 V85"
        markerEnd="url(#dd-ah-green)"
        style={{ animationDelay: "1100ms" }}
      />
      <path
        className="w green dd-hop"
        pathLength={1}
        d="M537 394 V439"
        markerEnd="url(#dd-ah-green)"
        style={{ animationDelay: "1100ms" }}
      />
      <path
        className="w plum dd-hop"
        pathLength={1}
        d="M106 328 V367"
        markerEnd="url(#dd-ah-plum)"
        style={{ animationDelay: "380ms" }}
      />
      <path
        className="w plum dd-hop"
        pathLength={1}
        d="M196 403 H218 V349 H253"
        markerEnd="url(#dd-ah-plum)"
        style={{ animationDelay: "560ms" }}
      />
    </svg>
  );
}
