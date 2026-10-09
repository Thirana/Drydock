// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigNetwork() {
  return (
    <svg viewBox="0 0 920 316" role="img" aria-label="Home LAN: router 192.168.1.1 connected to laptop .23, phone .40, TV .52 and printer .60; laptop prints directly to the printer.">
      <rect className="zone" x="16" y="16" width="888" height="290" rx="2" />
      <text className="s" x="32" y="40">home LAN · 192.168.1.0/24</text>
      <rect className="n teal" x="370" y="52" width="180" height="62" rx="2" />
      <text className="t" x="386" y="78">Home router</text>
      <text className="s" x="386" y="99">192.168.1.1</text>
      <line className="w" x1="460" y1="114" x2="135" y2="188" />
      <line className="w" x1="460" y1="114" x2="350" y2="188" />
      <line className="w" x1="460" y1="114" x2="565" y2="188" />
      <line className="w" x1="460" y1="114" x2="780" y2="188" />
      <rect className="n plum" x="40" y="190" width="190" height="62" rx="2" />
      <text className="t" x="56" y="216">Laptop</text>
      <text className="s" x="56" y="237">192.168.1.23</text>
      <rect className="n" x="255" y="190" width="190" height="62" rx="2" />
      <text className="t" x="271" y="216">Phone</text>
      <text className="s" x="271" y="237">192.168.1.40</text>
      <rect className="n" x="470" y="190" width="190" height="62" rx="2" />
      <text className="t" x="486" y="216">Smart TV</text>
      <text className="s" x="486" y="237">192.168.1.52</text>
      <rect className="n" x="685" y="190" width="190" height="62" rx="2" />
      <text className="t" x="701" y="216">Printer</text>
      <text className="s" x="701" y="237">192.168.1.60</text>
      <path className="w green dash" d="M135 252 V274 H780 V256" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="457" y="294">printing a Kadé invoice: straight across the LAN, no internet involved</text>
    </svg>
  );
}

export function FigDhcp() {
  return (
    <svg viewBox="0 0 920 340" role="img" aria-label="DHCP exchange: Discover broadcast, Offer, Request broadcast, Ack.">
      <rect className="n plum" x="60" y="14" width="200" height="46" rx="2" />
      <text className="t" x="76" y="35">Laptop</text>
      <text className="s" x="76" y="52">just joined, no IP yet</text>
      <rect className="n teal" x="660" y="14" width="200" height="46" rx="2" />
      <text className="t" x="676" y="35">Home router</text>
      <text className="s" x="676" y="52">DHCP server</text>
      <line className="w dash" x1="160" y1="60" x2="160" y2="332" />
      <line className="w dash" x1="760" y1="60" x2="760" y2="332" />
      <line className="w amber dash" x1="162" y1="105" x2="756" y2="105" markerEnd="url(#dd-ah-amber)" />
      <text className="mid l" x="460" y="95">1 · Discover: is there a DHCP server here?</text>
      <text className="mid s" x="460" y="123">from 0.0.0.0 to 255.255.255.255 (everyone)</text>
      <line className="w green" x1="758" y1="170" x2="164" y2="170" markerEnd="url(#dd-ah-green)" />
      <text className="mid l" x="460" y="160">2 · Offer: you can have 192.168.1.23</text>
      <text className="mid s" x="460" y="188">with mask, gateway, DNS server and lease time</text>
      <line className="w amber dash" x1="162" y1="235" x2="756" y2="235" markerEnd="url(#dd-ah-amber)" />
      <text className="mid l" x="460" y="225">3 · Request: I will take 192.168.1.23</text>
      <text className="mid s" x="460" y="253">still a broadcast, so any other DHCP server knows</text>
      <line className="w green" x1="758" y1="300" x2="164" y2="300" markerEnd="url(#dd-ah-green)" />
      <text className="mid l" x="460" y="290">4 · Ack: it is yours for 24 hours</text>
      <text className="mid s" x="460" y="318">the laptop starts using 192.168.1.23</text>
    </svg>
  );
}

export function FigLanwan() {
  return (
    <svg viewBox="0 0 920 240" role="img" aria-label="LAN with private devices; router has a LAN address and a WAN address; WAN has ISP, internet and api.kade.lk.">
      <rect className="zone" x="16" y="24" width="336" height="196" rx="2" />
      <text className="s" x="32" y="46">LAN · your home (private)</text>
      <rect className="n" x="32" y="66" width="110" height="40" rx="2" />
      <text x="44" y="91">Laptop .23</text>
      <rect className="n" x="152" y="66" width="110" height="40" rx="2" />
      <text x="164" y="91">Phone .40</text>
      <rect className="n" x="32" y="118" width="110" height="40" rx="2" />
      <text x="44" y="143">TV .52</text>
      <rect className="n" x="152" y="118" width="110" height="40" rx="2" />
      <text x="164" y="143">Printer .60</text>
      <rect className="zone" x="362" y="24" width="542" height="196" rx="2" />
      <text className="s" x="460" y="46">WAN · ISP and the internet (public)</text>
      <rect className="n teal" x="272" y="72" width="170" height="92" rx="2" />
      <text className="t" x="288" y="98">Home router</text>
      <text className="s" x="288" y="120">LAN 192.168.1.1</text>
      <text className="s" x="288" y="140">WAN 203.0.113.45</text>
      <line className="w green" x1="442" y1="98" x2="478" y2="98" markerEnd="url(#dd-ah-green)" />
      <rect className="n" x="480" y="70" width="150" height="56" rx="2" />
      <text className="t" x="496" y="94">ISP</text>
      <text className="s" x="496" y="114">gave 203.0.113.45</text>
      <line className="w green" x1="630" y1="98" x2="658" y2="98" markerEnd="url(#dd-ah-green)" />
      <rect className="n" x="660" y="70" width="230" height="56" rx="2" />
      <text className="t" x="676" y="94">Internet</text>
      <text className="s" x="676" y="114">public addresses only</text>
      <line className="w green" x1="775" y1="126" x2="775" y2="148" markerEnd="url(#dd-ah-green)" />
      <rect className="n green" x="660" y="150" width="230" height="56" rx="2" />
      <text className="t" x="676" y="174">api.kade.lk</text>
      <text className="s" x="676" y="194">34.87.120.15</text>
    </svg>
  );
}
