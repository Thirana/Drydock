// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigGateway() {
  return (
    <svg viewBox="0 0 920 300" role="img" aria-label="Home LAN: laptop sends to the printer directly; traffic from laptop, phone and TV for outside addresses all goes through the home router, the only way out, to the internet and kade-api.">
      <rect className="zone" x="16" y="20" width="560" height="266" rx="2" />
      <text className="s" x="32" y="42">home LAN · 192.168.1.0/24</text>
      <rect className="n plum" x="40" y="60" width="170" height="50" rx="2" />
      <text className="t" x="54" y="90">Laptop .23</text>
      <rect className="n" x="370" y="60" width="170" height="50" rx="2" />
      <text className="t" x="384" y="90">Printer .60</text>
      <line className="w green dash" x1="210" y1="80" x2="368" y2="80" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="226" y="70">local: no gateway</text>
      <rect className="n" x="40" y="130" width="170" height="50" rx="2" />
      <text className="t" x="54" y="160">Phone .40</text>
      <rect className="n" x="40" y="196" width="170" height="50" rx="2" />
      <text className="t" x="54" y="226">Smart TV .52</text>
      <path className="w amber" d="M210 98 H300 V221 H418" markerEnd="url(#dd-ah-amber)" />
      <path className="w amber" d="M210 155 H300 V221 H418" markerEnd="url(#dd-ah-amber)" />
      <path className="w amber" d="M210 221 H418" markerEnd="url(#dd-ah-amber)" />
      <rect className="n teal" x="420" y="180" width="220" height="82" rx="2" />
      <text className="t" x="436" y="206">Home router</text>
      <text className="s" x="436" y="228">gateway 192.168.1.1</text>
      <text className="s" x="436" y="248">the only way out</text>
      <line className="w green" x1="640" y1="221" x2="698" y2="221" markerEnd="url(#dd-ah-green)" />
      <rect className="zone" x="700" y="181" width="204" height="80" rx="2" />
      <text className="t" x="716" y="213">Internet</text>
      <text className="s" x="716" y="235">ISP + many routers</text>
      <line className="w green" x1="802" y1="181" x2="802" y2="112" markerEnd="url(#dd-ah-green)" />
      <rect className="n green" x="700" y="40" width="204" height="70" rx="2" />
      <text className="t" x="716" y="68">kade-api</text>
      <text className="s" x="716" y="90">34.87.120.15</text>
    </svg>
  );
}

export function FigOnward() {
  return (
    <svg viewBox="0 0 920 150" role="img" aria-label="Chain: laptop's gateway is the home router; the home router's gateway is the ISP router; the ISP passes it to more routers until it reaches kade-api.">
      <rect className="n plum" x="16" y="30" width="160" height="72" rx="2" />
      <text className="t" x="30" y="58">Laptop</text>
      <text className="s" x="30" y="80">gw → 192.168.1.1</text>
      <line className="w green" x1="176" y1="66" x2="198" y2="66" markerEnd="url(#dd-ah-green)" />
      <rect className="n teal" x="200" y="30" width="170" height="72" rx="2" />
      <text className="t" x="214" y="58">Home router</text>
      <text className="s" x="214" y="80">gw → 203.0.113.1</text>
      <line className="w green" x1="370" y1="66" x2="392" y2="66" markerEnd="url(#dd-ah-green)" />
      <rect className="n" x="394" y="30" width="160" height="72" rx="2" />
      <text className="t" x="408" y="58">ISP router</text>
      <text className="s" x="408" y="80">203.0.113.1</text>
      <line className="w green" x1="554" y1="66" x2="576" y2="66" markerEnd="url(#dd-ah-green)" />
      <rect className="zone" x="578" y="30" width="150" height="72" rx="2" />
      <text className="t" x="592" y="58">More routers</text>
      <text className="s" x="592" y="80">hop by hop</text>
      <line className="w green" x1="728" y1="66" x2="750" y2="66" markerEnd="url(#dd-ah-green)" />
      <rect className="n green" x="752" y="30" width="152" height="72" rx="2" />
      <text className="t" x="766" y="58">kade-api</text>
      <text className="s" x="766" y="80">34.87.120.15</text>
      <text className="s" x="16" y="134">The big routers in the middle of the internet have no default gateway at all: they hold a route to every network. That comes in the routing chapter.</text>
    </svg>
  );
}

export function FigCloud() {
  return (
    <svg viewBox="0 0 920 300" role="img" aria-label="In kade-vpc, kade-api sends every packet to its gateway 10.10.1.1, which is software, not a box. The VPC route table then decides: a packet to kade-db matches the /24 subnet route and stays inside the VPC; a packet to 8.8.8.8 matches only 0.0.0.0/0 and goes to the default internet gateway, where it needs a public address: an external IP or Cloud NAT.">
      <rect className="zone" x="16" y="20" width="628" height="268" rx="2" />
      <text className="s" x="32" y="42">kade-vpc · 10.10.0.0/16</text>
      <rect className="n plum" x="36" y="58" width="200" height="58" rx="2" />
      <text className="t" x="50" y="82">kade-api</text>
      <text className="s" x="50" y="102">10.10.1.10 · sn-app</text>
      <line className="w amber" x1="236" y1="87" x2="318" y2="87" markerEnd="url(#dd-ah-amber)" />
      <rect className="n teal" x="320" y="58" width="310" height="58" rx="2" />
      <text className="t" x="334" y="82">Gateway 10.10.1.1</text>
      <text className="s" x="334" y="102">software, not a box</text>
      <line className="w teal" x1="475" y1="116" x2="475" y2="148" markerEnd="url(#dd-ah-teal)" />
      <rect className="n teal" x="320" y="150" width="310" height="122" rx="2" />
      <text className="t" x="334" y="174">VPC route table</text>
      <text className="s" x="334" y="198">10.10.1.0/24 → the VPC network</text>
      <text className="s" x="334" y="220">10.10.2.0/24 → the VPC network</text>
      <text className="s" x="334" y="242">0.0.0.0/0 → default-internet-gateway</text>
      <rect className="n green" x="36" y="190" width="200" height="58" rx="2" />
      <text className="t" x="50" y="214">kade-db</text>
      <text className="s" x="50" y="234">10.10.2.5 · sn-data</text>
      <line className="w green" x1="318" y1="219" x2="238" y2="219" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="246" y="210">/24 wins</text>
      <path className="w amber" d="M630 237 H668 V179 H698" markerEnd="url(#dd-ah-amber)" />
      <rect className="n" x="700" y="150" width="204" height="58" rx="2" />
      <text className="t" x="714" y="174">8.8.8.8</text>
      <text className="s" x="714" y="194">the internet</text>
      <text className="s" x="700" y="234">needs a public address:</text>
      <text className="s" x="700" y="254">external IP or Cloud NAT</text>
    </svg>
  );
}
