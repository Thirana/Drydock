// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigMap() {
  return (
    <svg viewBox="0 0 920 390" role="img" aria-label="OSI layers 7, 6 and 5 map to TCP/IP Application; 4 to Transport; 3 to Internet; 2 and 1 to Link.">
      <text className="s" x="40" y="14">OSI · 7 layers</text>
      <text className="s" x="580" y="14">TCP/IP · 4 layers</text>
      <polygon points="340,24 580,24 580,164 340,164" style={{"fill": "var(--dd-plum)", "opacity": ".10"}} />
      <polygon points="340,174 580,174 580,214 340,214" style={{"fill": "var(--dd-amber)", "opacity": ".12"}} />
      <polygon points="340,224 580,224 580,264 340,264" style={{"fill": "var(--dd-green)", "opacity": ".12"}} />
      <polygon points="340,274 580,274 580,364 340,364" style={{"fill": "var(--dd-teal)", "opacity": ".10"}} />
      <rect className="n plum" x="40" y="24" width="300" height="40" rx="2" />
      <text className="t" x="56" y="49">7 · Application</text>
      <rect className="n plum" x="40" y="74" width="300" height="40" rx="2" />
      <text className="t" x="56" y="99">6 · Presentation</text>
      <rect className="n plum" x="40" y="124" width="300" height="40" rx="2" />
      <text className="t" x="56" y="149">5 · Session</text>
      <rect className="n amber" x="40" y="174" width="300" height="40" rx="2" />
      <text className="t" x="56" y="199">4 · Transport</text>
      <rect className="n green" x="40" y="224" width="300" height="40" rx="2" />
      <text className="t" x="56" y="249">3 · Network</text>
      <rect className="n teal" x="40" y="274" width="300" height="40" rx="2" />
      <text className="t" x="56" y="299">2 · Data link</text>
      <rect className="n" x="40" y="324" width="300" height="40" rx="2" />
      <text className="t" x="56" y="349">1 · Physical</text>
      <rect className="n plum" x="580" y="24" width="300" height="140" rx="2" />
      <text className="t" x="596" y="90">Application</text>
      <text className="s" x="596" y="110">HTTP, DNS, TLS</text>
      <rect className="n amber" x="580" y="174" width="300" height="40" rx="2" />
      <text className="t" x="596" y="199">Transport</text>
      <text className="s" x="740" y="199">TCP, UDP</text>
      <rect className="n green" x="580" y="224" width="300" height="40" rx="2" />
      <text className="t" x="596" y="249">Internet</text>
      <text className="s" x="740" y="249">IP, ICMP</text>
      <rect className="n teal" x="580" y="274" width="300" height="90" rx="2" />
      <text className="t" x="596" y="314">Link</text>
      <text className="s" x="596" y="334">Ethernet, WiFi, ARP</text>
    </svg>
  );
}

export function FigEncap() {
  return (
    <svg viewBox="0 0 920 410" role="img" aria-label="Laptop stack of four layers, router with only Internet and Link layers, kade-api stack of four layers. Data goes down the laptop stack, across the wire, up to the router's Internet layer, down again, across, and up kade-api's stack. Same layers talk to each other.">
      <text className="t" x="20" y="24">Laptop</text>
      <text className="t" x="350" y="24">Router</text>
      <text className="t" x="680" y="24">kade-api</text>
      <rect className="n plum" x="20" y="40" width="220" height="48" rx="2" />
      <text x="36" y="69">Application · HTTP</text>
      <rect className="n amber" x="20" y="100" width="220" height="48" rx="2" />
      <text x="36" y="129">Transport · TCP</text>
      <rect className="n green" x="20" y="160" width="220" height="48" rx="2" />
      <text x="36" y="189">Internet · IP</text>
      <rect className="n teal" x="20" y="220" width="220" height="48" rx="2" />
      <text x="36" y="249">Link · WiFi</text>
      <rect className="ghost" x="350" y="40" width="220" height="108" rx="2" />
      <text className="s f" x="366" y="98">never opened here</text>
      <rect className="n green" x="350" y="160" width="220" height="48" rx="2" />
      <text x="366" y="189">Internet · IP</text>
      <rect className="n teal" x="350" y="220" width="220" height="48" rx="2" />
      <text x="366" y="249">Link · WiFi / Ethernet</text>
      <rect className="n plum" x="680" y="40" width="220" height="48" rx="2" />
      <text x="696" y="69">Application · HTTP</text>
      <rect className="n amber" x="680" y="100" width="220" height="48" rx="2" />
      <text x="696" y="129">Transport · TCP</text>
      <rect className="n green" x="680" y="160" width="220" height="48" rx="2" />
      <text x="696" y="189">Internet · IP</text>
      <rect className="n teal" x="680" y="220" width="220" height="48" rx="2" />
      <text x="696" y="249">Link · Ethernet</text>
      <line className="w green" x1="200" y1="88" x2="200" y2="98" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="200" y1="148" x2="200" y2="158" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="200" y1="208" x2="200" y2="218" markerEnd="url(#dd-ah-green)" />
      <path className="w green" d="M200 268 V310 H400 V270" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="400" y1="220" x2="400" y2="210" markerEnd="url(#dd-ah-green)" />
      <path className="w green" d="M520 210 V218" markerEnd="url(#dd-ah-green)" />
      <path className="w green" d="M520 268 V310 H720 V270" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="720" y1="220" x2="720" y2="210" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="720" y1="160" x2="720" y2="150" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="720" y1="100" x2="720" y2="90" markerEnd="url(#dd-ah-green)" />
      <line className="w plum dash" x1="240" y1="64" x2="678" y2="64" />
      <line className="w amber dash" x1="240" y1="124" x2="678" y2="124" />
      <line className="w green dash" x1="240" y1="184" x2="348" y2="184" />
      <line className="w green dash" x1="570" y1="184" x2="678" y2="184" />
      <text className="s mid" x="460" y="58">HTTP talks to HTTP</text>
      <text className="s mid" x="460" y="118">TCP talks to TCP (end to end)</text>
      <text className="s" x="20" y="340">down the stack = wrap</text>
      <text className="s" x="350" y="340">up to IP, look up, down again</text>
      <text className="s" x="680" y="340">up the stack = unwrap</text>
      <text className="s" x="20" y="376">A router only unwraps as far as the Internet layer. It reads the IP header to choose the next hop, then</text>
      <text className="s" x="20" y="394">builds a new frame. It never reads your TCP or HTTP (NAT is the one exception: it also rewrites ports).</text>
    </svg>
  );
}
