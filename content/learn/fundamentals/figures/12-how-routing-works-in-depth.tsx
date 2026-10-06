// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigPath() {
  return (
    <svg viewBox="0 0 1000 300" role="img" aria-label="Path: front desk PC, R1 office router, R2 ISP edge, R3 ISP border, R4 Google edge in Singapore, kade-api. R3 also links to a transit provider.">
      <rect className="zone" x="8" y="14" width="334" height="170" rx="2" />
      <text className="s" x="22" y="34">Kadé office</text>
      <rect className="zone" x="340" y="14" width="330" height="170" rx="2" />
      <text className="s" x="354" y="34">LankaNet (ISP) · AS 64500</text>
      <rect className="zone" x="672" y="14" width="320" height="170" rx="2" />
      <text className="s" x="686" y="34">Google · AS 15169</text>
      <rect className="n plum" x="16" y="56" width="150" height="100" rx="2" />
      <text className="t" x="28" y="80">Front desk PC</text>
      <text className="s" x="28" y="102">172.16.1.10</text>
      <text className="s" x="28" y="120">gw 172.16.1.1</text>
      <rect className="n teal" x="182" y="56" width="150" height="100" rx="2" />
      <text className="t" x="194" y="80">R1 · office</text>
      <text className="s" x="194" y="102">eth1 172.16.1.1</text>
      <text className="s" x="194" y="120">eth0 198.51.100.20</text>
      <text className="s" x="194" y="140">does NAT</text>
      <rect className="n" x="348" y="56" width="150" height="100" rx="2" />
      <text className="t" x="360" y="80">R2 · ISP edge</text>
      <text className="s" x="360" y="102">ge0 198.51.100.1</text>
      <text className="s" x="360" y="120">ge1 10.200.0.1</text>
      <rect className="n" x="514" y="56" width="150" height="100" rx="2" />
      <text className="t" x="526" y="80">R3 · ISP border</text>
      <text className="s" x="526" y="102">ge0 10.200.0.2</text>
      <text className="s" x="526" y="120">ge1 192.0.2.1</text>
      <text className="s" x="526" y="138">ge2 192.0.2.5</text>
      <rect className="n green" x="680" y="56" width="150" height="100" rx="2" />
      <text className="t" x="692" y="80">R4 · Google edge</text>
      <text className="s" x="692" y="102">192.0.2.2</text>
      <text className="s" x="692" y="120">Singapore</text>
      <rect className="n" x="846" y="56" width="140" height="100" rx="2" />
      <text className="t" x="858" y="80">kade-api</text>
      <text className="s" x="858" y="102">34.87.120.15</text>
      <text className="s" x="858" y="120">(10.10.1.10)</text>
      <line className="w" x1="166" y1="106" x2="182" y2="106" />
      <line className="w" x1="332" y1="106" x2="348" y2="106" />
      <line className="w" x1="498" y1="106" x2="514" y2="106" />
      <line className="w" x1="664" y1="106" x2="680" y2="106" />
      <line className="w" x1="830" y1="106" x2="846" y2="106" />
      <text className="s mid" x="174" y="176">172.16.1.0/24</text>
      <text className="s mid" x="340" y="200">198.51.100.0/24</text>
      <text className="s mid" x="506" y="176">10.200.0.0/30</text>
      <text className="s mid" x="672" y="200">192.0.2.0/30</text>
      <text className="s mid" x="838" y="176">{"Google's network"}</text>
      <path className="w dash" d="M589 156 V238" />
      <rect className="ghost" x="480" y="240" width="220" height="50" rx="2" />
      <text className="f" x="494" y="262">Transit provider</text>
      <text className="s" x="494" y="280">192.0.2.6 · link 192.0.2.4/30</text>
    </svg>
  );
}

export function FigTtl() {
  return (
    <svg viewBox="0 0 920 220" role="img" aria-label="Routing loop: a packet bounces between R2 and R3, TTL drops by one each time, and at zero it is dropped and an ICMP Time Exceeded message goes back to the sender.">
      <rect className="n plum" x="16" y="80" width="150" height="60" rx="2" />
      <text className="t" x="30" y="106">Sender</text>
      <text className="s" x="30" y="126">TTL starts at 64</text>
      <line className="w" x1="166" y1="110" x2="246" y2="110" markerEnd="url(#dd-ah-muted)" />
      <rect className="n" x="250" y="80" width="170" height="60" rx="2" />
      <text className="t" x="266" y="106">R2</text>
      <text className="s" x="266" y="126">{"\"203.0.113.99 → R3\""}</text>
      <rect className="n" x="560" y="80" width="170" height="60" rx="2" />
      <text className="t" x="576" y="106">R3</text>
      <text className="s" x="576" y="126">{"\"203.0.113.99 → R2\""}</text>
      <path className="w amber" d="M420 92 C 470 40, 510 40, 558 92" markerEnd="url(#dd-ah-amber)" />
      <path className="w amber" d="M560 128 C 510 180, 470 180, 422 128" markerEnd="url(#dd-ah-amber)" />
      <text className="s mid" x="490" y="36">TTL 63, 61, 59 …</text>
      <text className="s mid" x="490" y="194">TTL 62, 60, 58 …</text>
      <text className="l" x="760" y="100">at TTL 0:</text>
      <text className="s" x="760" y="120">packet dropped,</text>
      <text className="s" x="760" y="138">{"ICMP \"Time Exceeded\""}</text>
      <text className="s" x="760" y="156">sent to the sender</text>
    </svg>
  );
}

export function FigDynamic() {
  return (
    <svg viewBox="0 0 920 250" role="img" aria-label="BGP: Google announces 34.87.0.0/16 to LankaNet; the transit provider announces a default and 34.0.0.0/8; LankaNet announces 198.51.100.0/24 to both, so replies can come back.">
      <rect className="n teal" x="16" y="90" width="170" height="70" rx="2" />
      <text className="t" x="32" y="118">Kadé office</text>
      <text className="s" x="32" y="138">no AS · static default</text>
      <rect className="n" x="300" y="90" width="210" height="70" rx="2" />
      <text className="t" x="316" y="118">LankaNet · AS 64500</text>
      <text className="s" x="316" y="138">owns 198.51.100.0/24</text>
      <rect className="n green" x="700" y="20" width="204" height="70" rx="2" />
      <text className="t" x="716" y="48">Google · AS 15169</text>
      <text className="s" x="716" y="68">owns 34.87.0.0/16</text>
      <rect className="n" x="700" y="160" width="204" height="70" rx="2" />
      <text className="t" x="716" y="188">Transit · AS 64510</text>
      <text className="s" x="716" y="208">reaches everywhere</text>
      <line className="w" x1="186" y1="125" x2="298" y2="125" markerEnd="url(#dd-ah-muted)" />
      <line className="w green" x1="698" y1="50" x2="512" y2="102" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="540" y="54">{"\"34.87.0.0/16 via me\""}</text>
      <line className="w green" x1="698" y1="195" x2="512" y2="148" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="520" y="210">{"\"0.0.0.0/0 and 34.0.0.0/8 via me\""}</text>
      <line className="w amber dash" x1="512" y1="115" x2="698" y2="70" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber dash" x1="512" y1="138" x2="698" y2="180" markerEnd="url(#dd-ah-amber)" />
      <text className="s" x="540" y="120">{"\"198.51.100.0/24 via me\""}</text>
    </svg>
  );
}

export function FigAnycast() {
  return (
    <svg viewBox="0 0 920 280" role="img" aria-label="A shopper in Colombo and a shopper in London both connect to the same anycast IP; each reaches a nearby Google edge, which carries traffic over Google's network to kade-api in Singapore.">
      <rect className="n plum" x="16" y="40" width="190" height="56" rx="2" />
      <text className="t" x="30" y="64">Shopper in Colombo</text>
      <text className="s" x="30" y="84">→ 34.120.7.9</text>
      <rect className="n plum" x="16" y="184" width="190" height="56" rx="2" />
      <text className="t" x="30" y="208">Shopper in London</text>
      <text className="s" x="30" y="228">→ 34.120.7.9 (same IP)</text>
      <rect className="n green" x="300" y="40" width="200" height="56" rx="2" />
      <text className="t" x="316" y="64">Google edge</text>
      <text className="s" x="316" y="84">near Colombo · announces it</text>
      <rect className="n green" x="300" y="184" width="200" height="56" rx="2" />
      <text className="t" x="316" y="208">Google edge</text>
      <text className="s" x="316" y="228">London · announces it too</text>
      <line className="w amber" x1="206" y1="68" x2="298" y2="68" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="206" y1="212" x2="298" y2="212" markerEnd="url(#dd-ah-amber)" />
      <text className="s" x="212" y="60">short hop</text>
      <text className="s" x="212" y="204">short hop</text>
      <rect className="zone" x="560" y="20" width="344" height="240" rx="2" />
      <text className="s" x="576" y="42">{"Google's private backbone"}</text>
      <rect className="n" x="700" y="110" width="190" height="62" rx="2" />
      <text className="t" x="716" y="136">kade-api</text>
      <text className="s" x="716" y="156">Singapore</text>
      <line className="w green" x1="500" y1="68" x2="698" y2="130" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="500" y1="212" x2="698" y2="154" markerEnd="url(#dd-ah-green)" />
    </svg>
  );
}
