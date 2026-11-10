// Drawings for this chapter. Classes are styled by `.dd-fig` in globals.css;
// arrowheads come from <DiagramDefs />.

/** By default Cloud Run is outside the VPC: no path to the database, no fixed IP. */
export function FigOutside() {
  return (
    <svg
      viewBox="0 0 960 300"
      role="img"
      aria-label="Cloud Run kade-api runs on Google's serverless infrastructure, outside kade-vpc. Its call to PayGate leaves from a random Google IP, which is not on PayGate's allow-list. Its call to kade-db at 10.10.2.5 has no path into kade-vpc."
    >
      <rect className="zone plum" x="16" y="12" width="300" height="276" rx="2" />
      <text className="s" x="32" y="34">{"Google's serverless network"}</text>
      <rect className="n plum" x="32" y="90" width="268" height="100" rx="2" />
      <text className="t" x="48" y="118">Cloud Run kade-api</text>
      <text className="s" x="48" y="140">no network card</text>
      <text className="s" x="48" y="158">no internal IP</text>

      <rect className="n" x="744" y="76" width="200" height="76" rx="2" />
      <text className="t" x="758" y="102">PayGate</text>
      <text className="s" x="758" y="124">allows only 34.87.200.7</text>
      <line className="w fault dash" x1="300" y1="114" x2="716" y2="114" />
      <text className="x" x="728" y="120">✕</text>
      <text className="s mid" x="520" y="104">source: a random Google IP</text>
      <text className="s flt mid" x="520" y="134">not on the allow-list</text>

      <rect className="zone teal" x="440" y="176" width="260" height="112" rx="2" />
      <text className="s" x="456" y="198">kade-vpc</text>
      <rect className="n teal" x="460" y="210" width="220" height="60" rx="2" />
      <text className="t" x="474" y="236">kade-db</text>
      <text className="s" x="474" y="256">10.10.2.5</text>
      <path className="w fault dash" d="M300 166 H370 V240 H414" />
      <text className="x" x="426" y="246">✕</text>
      <text className="s flt" x="330" y="268">no path in</text>
    </svg>
  );
}

/** The connector forwards through managed VMs; Direct VPC egress puts the instance in the subnet. */
export function FigTwoWays() {
  return (
    <svg
      viewBox="0 0 960 322"
      role="img"
      aria-label="Two ways from Cloud Run into kade-vpc. A: a Serverless VPC Access connector, a group of managed VMs in their own /28 that forward the traffic to kade-db. B: Direct VPC egress, where each Cloud Run instance gets its own address in sn-run and talks to kade-db directly."
    >
      <rect className="zone teal" x="290" y="12" width="654" height="298" rx="2" />
      <text className="s" x="306" y="34">kade-vpc</text>

      {/* One target, level with both lanes. */}
      <rect className="n teal" x="744" y="52" width="184" height="242" rx="2" />
      <text className="t" x="758" y="80">kade-db</text>
      <text className="s" x="758" y="100">10.10.2.5</text>

      <text className="s" x="16" y="34">A · connector</text>
      <rect className="n plum" x="16" y="52" width="200" height="64" rx="2" />
      <text className="t" x="30" y="78">kade-api</text>
      <text className="s" x="30" y="98">Cloud Run</text>
      <rect className="n plum" x="330" y="52" width="270" height="64" rx="2" />
      <text className="t" x="344" y="78">connector · 2 to 10 VMs</text>
      <text className="s" x="344" y="98">own /28 · billed all the time</text>
      <line className="w green" x1="216" y1="84" x2="327" y2="84" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="600" y1="84" x2="741" y2="84" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="672" y="74">extra hop</text>

      <text className="s" x="16" y="196">B · Direct VPC egress</text>
      <rect className="n plum" x="16" y="214" width="200" height="64" rx="2" />
      <text className="t" x="30" y="240">kade-api</text>
      <text className="s" x="30" y="260">Cloud Run</text>
      <rect className="zone panel" x="330" y="182" width="270" height="112" rx="2" />
      <text className="s" x="344" y="204">sn-run 10.10.3.0/24</text>
      <rect className="n plum" x="346" y="218" width="238" height="56" rx="2" />
      <text className="t" x="360" y="242">{"the instance's own address"}</text>
      <text className="s" x="360" y="262">10.10.3.7 · no extra cost</text>
      <line className="w green" x1="216" y1="246" x2="343" y2="246" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="584" y1="246" x2="741" y2="246" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="672" y="236">direct</text>
    </svg>
  );
}

const CELL = 42;
const cells = (from: number, count: number, y: number, kind: string) =>
  Array.from({ length: count }, (_, i) => (
    <rect key={`${kind}${from + i}`} className={`blk ${kind}`} x={250 + (from + i) * CELL} y={y} width={CELL - 4} height="40" rx="2" />
  ));

/** sn-run as blocks of 16 addresses: a /24 survives a deploy at full scale, a /26 does not. */
export function FigSizing() {
  return (
    <svg
      viewBox="0 0 960 236"
      role="img"
      aria-label="sn-run drawn as blocks of 16 addresses. A /24 has 16 blocks: during a deploy at 50 instances the old revision holds about 7 blocks, the new revision about 7 more, and 2 stay free. A /26 has only 4 blocks: it is full at about 30 instances, long before a deploy needs 200 addresses."
    >
      <text className="t" x="16" y="56">sn-run as a /24</text>
      <text className="s" x="16" y="76">16 blocks of 16 addresses</text>
      {cells(0, 7, 34, "used")}
      {cells(7, 7, 34, "plan")}
      {cells(14, 2, 34, "free")}
      <path className="w" d="M250 84 V92 H540 V84" />
      <text className="s mid" x="395" y="110">old revision · 50 × 2 = 100</text>
      <path className="w" d="M544 84 V92 H834 V84" />
      <text className="s mid" x="689" y="110">new revision · 100 more</text>
      <text className="s f mid" x="876" y="110">free</text>

      <text className="t" x="16" y="172">sn-run as a /26</text>
      <text className="s" x="16" y="192">4 blocks</text>
      {cells(0, 4, 150, "used")}
      <text className="x" x="438" y="176">✕</text>
      <text className="s flt" x="456" y="166">full at about 30 instances</text>
      <text className="s flt" x="456" y="186">a deploy at 50 needs 200 addresses</text>
    </svg>
  );
}

const LANES = [
  { title: "1 · not connected", sees: "sees a random IP" },
  { title: "2 · connected, private-ranges-only", sees: "sees a random IP" },
  { title: "3 · connected, all-traffic", sees: "sees 34.87.200.7" },
] as const;

/** The same two calls under each egress setting: one to the database, one to PayGate. */
export function FigEgress() {
  return (
    <svg
      viewBox="0 0 960 478"
      role="img"
      aria-label="Three egress settings for kade-api. Not connected: the database is unreachable and PayGate sees a random Google IP. Connected with private-ranges-only: the database is reached through kade-vpc, but calls to PayGate still go straight to the internet from a random IP. Connected with all-traffic: the database is reached through kade-vpc and calls to PayGate leave through Cloud NAT as 34.87.200.7."
    >
      {LANES.map((lane, i) => {
        const y = 12 + i * 166;
        const inVpc = i > 0;
        const viaNat = i === 2;
        return (
          <g key={lane.title}>
            <text className="s" x="16" y={y + 12} style={{ fontWeight: 700 }}>{lane.title}</text>
            <rect className="n plum" x="16" y={y + 24} width="170" height="80" rx="2" />
            <text className="t" x="30" y={y + 58}>kade-api</text>
            <text className="s" x="30" y={y + 78}>Cloud Run</text>

            <rect className="zone teal" x="250" y={y + 24} width="440" height="80" rx="2" />
            <text className="s" x="566" y={y + 46}>kade-vpc</text>
            <rect className="n teal" x="270" y={y + 32} width="190" height="32" rx="2" />
            <text className="t" x="284" y={y + 53}>kade-db 10.10.2.5</text>
            <rect className={viaNat ? "n plum" : "n plum off"} x="476" y={y + 68} width="200" height="32" rx="2" />
            <text className={viaNat ? "t" : "t off"} x="490" y={y + 89}>NAT 34.87.200.7</text>

            <rect className="n" x="760" y={y + 60} width="184" height="48" rx="2" />
            <text className="t" x="774" y={y + 80}>PayGate</text>
            <text className={viaNat ? "s" : "s flt"} x="774" y={y + 98}>{lane.sees}</text>

            {/* To the database. */}
            {inVpc ? (
              <line className="w green" x1="186" y1={y + 48} x2="267" y2={y + 48} markerEnd="url(#dd-ah-green)" />
            ) : (
              <>
                <line className="w fault dash" x1="186" y1={y + 48} x2="222" y2={y + 48} />
                <text className="x" x="234" y={y + 54}>✕</text>
              </>
            )}

            {/* To PayGate: through the NAT, or around the VPC altogether. */}
            {viaNat ? (
              <>
                <line className="w green" x1="186" y1={y + 84} x2="473" y2={y + 84} markerEnd="url(#dd-ah-green)" />
                <line className="w green" x1="676" y1={y + 84} x2="757" y2={y + 84} markerEnd="url(#dd-ah-green)" />
              </>
            ) : (
              <>
                <path className="w" d={`M100 ${y + 104} V${y + 126} H852 V${y + 111}`} markerEnd="url(#dd-ah-muted)" />
                <text className="s" x="250" y={y + 144}>straight to the internet, never through kade-vpc</text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Ingress left at "all": the run.app address is a second door past every protection. */
export function FigBypass() {
  return (
    <svg
      viewBox="0 0 960 250"
      role="img"
      aria-label="The intended path: a shopper goes through Cloudflare, then the load balancer with Cloud Armor, to kade-api. With ingress set to all, an attacker can call the run.app address directly and reach kade-api, skipping Cloudflare, the load balancer and Cloud Armor."
    >
      <rect className="n" x="16" y="30" width="160" height="64" rx="2" />
      <text className="t" x="30" y="56">Shopper</text>
      <text className="s" x="30" y="76">api.kade.lk</text>
      <rect className="n" x="230" y="30" width="160" height="64" rx="2" />
      <text className="t" x="244" y="56">Cloudflare</text>
      <text className="s" x="244" y="76">chapter 13</text>
      <rect className="n plum" x="444" y="30" width="230" height="64" rx="2" />
      <text className="t" x="458" y="56">load balancer</text>
      <text className="s" x="458" y="76">+ Cloud Armor</text>
      <rect className="n plum" x="760" y="30" width="184" height="64" rx="2" />
      <text className="t" x="774" y="56">kade-api</text>
      <text className="s" x="774" y="76">Cloud Run</text>
      <line className="w green" x1="176" y1="62" x2="227" y2="62" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="390" y1="62" x2="441" y2="62" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="674" y1="62" x2="757" y2="62" markerEnd="url(#dd-ah-green)" />

      <rect className="n fault" x="16" y="170" width="160" height="64" rx="2" />
      <text className="t" x="30" y="196">Attacker</text>
      <text className="s" x="30" y="216">anywhere</text>
      <rect className="n amber" x="760" y="124" width="184" height="36" rx="2" />
      <text className="t" x="774" y="147">ingress: all</text>
      <path className="w fault" d="M176 202 H852 V163" markerEnd="url(#dd-ah-fault)" />
      <line className="w fault" x1="852" y1="124" x2="852" y2="97" markerEnd="url(#dd-ah-fault)" />
      <text className="s" x="200" y="192">kade-api-xxxx.run.app</text>
      <text className="s flt" x="200" y="224">skips Cloudflare, the load balancer and Cloud Armor</text>
    </svg>
  );
}

const GATES = [
  { x: 166, title: "Default URL", ask: "run.app exists?", flag: "--no-default-url", no: "404", hue: "" },
  { x: 376, title: "Ingress", ask: "path allowed?", flag: "--ingress", no: "404", hue: "amber" },
  { x: 586, title: "IAM invoker", ask: "caller allowed?", flag: "roles/run.invoker", no: "403", hue: "amber" },
] as const;

/** Three checks in a row; a request must pass each one. */
export function FigGates() {
  return (
    <svg
      viewBox="0 0 960 190"
      role="img"
      aria-label="A request passes three checks before it reaches kade-api. First, does the run.app address exist: it can be removed with no-default-url. Second, the ingress setting: is this network path allowed, otherwise 404. Third, the IAM invoker check: is this caller allowed, otherwise 403."
    >
      <rect className="n" x="16" y="30" width="120" height="84" rx="2" />
      <text className="t" x="30" y="66">a request</text>
      <text className="s" x="30" y="86">any caller</text>
      {GATES.map((gate) => (
        <g key={gate.title}>
          <line className="w green" x1={gate.x - 30} y1="72" x2={gate.x - 3} y2="72" markerEnd="url(#dd-ah-green)" />
          <rect className={`n ${gate.hue}`} x={gate.x} y="30" width="180" height="84" rx="2" />
          <text className="t" x={gate.x + 14} y="56">{gate.title}</text>
          <text className="s" x={gate.x + 14} y="78">{gate.ask}</text>
          <text className="s f" x={gate.x + 14} y="98">{gate.flag}</text>
          <line className="w fault dash" x1={gate.x + 90} y1="114" x2={gate.x + 90} y2="146" />
          <text className="s flt mid" x={gate.x + 90} y="166">{`no → ${gate.no}`}</text>
        </g>
      ))}
      <line className="w green" x1="766" y1="72" x2="793" y2="72" markerEnd="url(#dd-ah-green)" />
      <rect className="n plum" x="796" y="30" width="148" height="84" rx="2" />
      <text className="t" x="810" y="66">kade-api</text>
      <text className="s" x="810" y="86">runs the request</text>
    </svg>
  );
}

/** A call between two services only counts as internal when it travels through the VPC. */
export function FigServiceCall() {
  return (
    <svg
      viewBox="0 0 960 276"
      role="img"
      aria-label="kade-api calls kade-notify, a second Cloud Run service with ingress internal. A call that does not go through the VPC arrives from the internet and gets a 404. A call sent through kade-vpc, using all-traffic egress from sn-run and Private Google Access, arrives as internal and is accepted. kade-notify then checks the caller's identity token and the run.invoker role."
    >
      <rect className="n plum" x="16" y="96" width="180" height="76" rx="2" />
      <text className="t" x="30" y="124">kade-api</text>
      <text className="s" x="30" y="146">the caller</text>
      <rect className="n plum" x="764" y="96" width="180" height="76" rx="2" />
      <text className="t" x="778" y="124">kade-notify</text>
      <text className="s" x="778" y="146">ingress: internal</text>

      {/* Around the VPC: arrives as internet traffic. */}
      <path className="w fault dash" d="M106 96 V40 H854 V66" />
      <text className="x" x="854" y="86">✕</text>
      <text className="s mid" x="480" y="30">not through the VPC: arrives as internet traffic</text>
      <text className="s flt mid" x="480" y="60">404</text>

      {/* Through the VPC: arrives as internal. */}
      <rect className="zone teal" x="270" y="84" width="420" height="116" rx="2" />
      <text className="s" x="286" y="190">kade-vpc</text>
      <rect className="n teal" x="290" y="106" width="170" height="56" rx="2" />
      <text className="t" x="304" y="130">sn-run</text>
      <text className="s" x="304" y="150">egress all-traffic</text>
      <rect className="n plum" x="500" y="106" width="170" height="56" rx="2" />
      <text className="t" x="514" y="130">Private</text>
      <text className="t" x="514" y="150">Google Access</text>
      <line className="w green" x1="196" y1="134" x2="287" y2="134" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="460" y1="134" x2="497" y2="134" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="670" y1="134" x2="761" y2="134" markerEnd="url(#dd-ah-green)" />

      <rect className="n amber" x="764" y="204" width="180" height="60" rx="2" />
      <text className="t" x="778" y="228">then: IAM check</text>
      <text className="s" x="778" y="248">token + run.invoker</text>
      <line className="w amber" x1="854" y1="172" x2="854" y2="201" markerEnd="url(#dd-ah-amber)" />
    </svg>
  );
}

const DRAWS = [
  { y: 12, hue: "teal", title: "Database connections", sum: "50 × a pool of 10 = 500", fix: "keep under the database's limit" },
  { y: 100, hue: "plum", title: "NAT ports", sum: "50 instances calling PayGate", fix: "reuse connections (chapter 7)" },
  { y: 188, hue: "teal", title: "sn-run addresses", sum: "50 × 2 = 100, 200 in a deploy", fix: "size the subnet first" },
] as const;

/** Every instance brings its own connections, ports and addresses. */
export function FigMultiply() {
  return (
    <svg
      viewBox="0 0 960 272"
      role="img"
      aria-label="kade-api scaled to 50 instances multiplies three things. Database connections: 50 instances with a pool of 10 each is 500 connections. NAT ports: 50 instances all calling PayGate. sn-run addresses: 100 in steady state and 200 during a deploy."
    >
      {/* A stack: the same box, many times. */}
      <rect className="n plum" x="32" y="84" width="230" height="88" rx="2" />
      <rect className="n plum" x="24" y="92" width="230" height="88" rx="2" />
      <rect className="n plum" x="16" y="100" width="230" height="88" rx="2" />
      <text className="t" x="30" y="130">kade-api</text>
      <text className="s" x="30" y="152">up to 50 instances</text>
      <text className="s f" x="30" y="172">each brings its own</text>

      <line className="w" x1="262" y1="136" x2="557" y2="136" markerEnd="url(#dd-ah-muted)" />
      <path className="w" d="M410 136 V48 H557" markerEnd="url(#dd-ah-muted)" />
      <path className="w" d="M410 136 V224 H557" markerEnd="url(#dd-ah-muted)" />
      <text className="t mid" x="336" y="124">× 50</text>

      {DRAWS.map((d) => (
        <g key={d.title}>
          <rect className={`n ${d.hue}`} x="560" y={d.y} width="384" height="72" rx="2" />
          <text className="t" x="576" y={d.y + 24}>{d.title}</text>
          <text className="s" x="576" y={d.y + 44}>{d.sum}</text>
          <text className="s f" x="576" y={d.y + 62}>{d.fix}</text>
        </g>
      ))}
    </svg>
  );
}
