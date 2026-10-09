// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigGateway() {
  return (
    <svg viewBox="0 0 920 270" role="img" aria-label="Home LAN: laptop sends to the printer directly; traffic from laptop, phone and TV for outside addresses all goes through the home router, the only way out, to the internet and kade-api.">
      <rect className="zone" x="16" y="20" width="560" height="236" rx="2" />
      <text className="s" x="32" y="42">home LAN · 192.168.1.0/24</text>
      <rect className="n plum" x="40" y="56" width="170" height="50" rx="2" />
      <text className="t" x="54" y="86">Laptop .23</text>
      <rect className="n" x="260" y="56" width="150" height="50" rx="2" />
      <text className="t" x="274" y="86">Printer .60</text>
      <line className="w green dash" x1="210" y1="81" x2="258" y2="81" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="214" y="52">local: no gateway</text>
      <rect className="n" x="40" y="130" width="170" height="50" rx="2" />
      <text className="t" x="54" y="160">Phone .40</text>
      <rect className="n" x="40" y="196" width="170" height="50" rx="2" />
      <text className="t" x="54" y="226">Smart TV .52</text>
      <line className="w amber" x1="170" y1="106" x2="468" y2="130" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="210" y1="155" x2="468" y2="145" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="210" y1="221" x2="468" y2="162" markerEnd="url(#dd-ah-amber)" />
      <rect className="n teal" x="470" y="100" width="200" height="82" rx="2" />
      <text className="t" x="486" y="126">Home router</text>
      <text className="s" x="486" y="148">gateway 192.168.1.1</text>
      <text className="s" x="486" y="168">the only way out</text>
      <line className="w green" x1="670" y1="125" x2="718" y2="90" markerEnd="url(#dd-ah-green)" />
      <rect className="zone" x="720" y="40" width="184" height="80" rx="2" />
      <text className="t" x="736" y="72">Internet</text>
      <text className="s" x="736" y="94">ISP + many routers</text>
      <line className="w green" x1="812" y1="120" x2="812" y2="158" markerEnd="url(#dd-ah-green)" />
      <rect className="n green" x="720" y="160" width="184" height="70" rx="2" />
      <text className="t" x="736" y="188">kade-api</text>
      <text className="s" x="736" y="210">34.87.120.15</text>
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
