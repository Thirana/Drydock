// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigRelay() {
  return (
    <svg viewBox="0 0 920 260" role="img" aria-label="Stock scanner on the warehouse network broadcasts Discover; the office router's eth2 relay forwards it as unicast with giaddr 172.16.2.1 to the DHCP server 172.16.1.5 on the staff network; the offer comes back the same way.">
      <rect className="zone" x="16" y="20" width="270" height="220" rx="2" />
      <text className="s" x="30" y="42">warehouse · 172.16.2.0/24</text>
      <rect className="n plum" x="32" y="110" width="238" height="64" rx="2" />
      <text className="t" x="46" y="136">Stock scanner (new)</text>
      <text className="s" x="46" y="156">no address yet</text>
      <rect className="n teal" x="340" y="96" width="240" height="92" rx="2" />
      <text className="t" x="356" y="122">Office router</text>
      <text className="s" x="356" y="144">eth2 172.16.2.1: DHCP relay</text>
      <text className="s" x="356" y="164">eth1 172.16.1.1</text>
      <rect className="zone" x="634" y="20" width="270" height="220" rx="2" />
      <text className="s" x="648" y="42">staff · 172.16.1.0/24</text>
      <rect className="n green" x="650" y="110" width="238" height="64" rx="2" />
      <text className="t" x="664" y="136">DHCP server</text>
      <text className="s" x="664" y="156">172.16.1.5 · pools for both</text>
      <line className="w amber dash" x1="270" y1="130" x2="338" y2="130" markerEnd="url(#dd-ah-amber)" />
      <text className="s" x="186" y="96">1 · broadcast Discover</text>
      <line className="w green" x1="580" y1="130" x2="648" y2="130" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="530" y="86">2 · unicast to 172.16.1.5</text>
      <text className="s" x="530" y="102">with giaddr = 172.16.2.1</text>
      <line className="w green" x1="648" y1="160" x2="582" y2="160" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="530" y="210">3 · Offer from the warehouse pool</text>
      <line className="w green" x1="338" y1="160" x2="272" y2="160" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="186" y="210">4 · relayed to the scanner</text>
    </svg>
  );
}
