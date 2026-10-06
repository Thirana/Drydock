// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigSwap() {
  return (
    <svg viewBox="0 0 920 270" role="img" aria-label="Outgoing packet source 192.168.1.23:52814 is rewritten by the home router to 203.0.113.45:40001; the reply to 203.0.113.45:40001 is rewritten back to 192.168.1.23:52814.">
      <rect className="zone" x="16" y="20" width="300" height="230" rx="2" />
      <text className="s" x="32" y="42">home LAN (private)</text>
      <rect className="zone" x="604" y="20" width="300" height="230" rx="2" />
      <text className="s" x="620" y="42">internet (public)</text>
      <rect className="n plum" x="32" y="112" width="140" height="64" rx="2" />
      <text className="t" x="46" y="138">Laptop</text>
      <text className="s" x="46" y="158">192.168.1.23</text>
      <rect className="n teal" x="360" y="100" width="200" height="88" rx="2" />
      <text className="t" x="376" y="126">Home router</text>
      <text className="s" x="376" y="148">does NAT</text>
      <text className="s" x="376" y="168">WAN 203.0.113.45</text>
      <rect className="n green" x="748" y="112" width="140" height="64" rx="2" />
      <text className="t" x="762" y="138">kade-api</text>
      <text className="s" x="762" y="158">34.87.120.15</text>
      <line className="w amber" x1="172" y1="128" x2="358" y2="128" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="560" y1="128" x2="746" y2="128" markerEnd="url(#dd-ah-amber)" />
      <line className="w green" x1="746" y1="162" x2="562" y2="162" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="358" y1="162" x2="174" y2="162" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="32" y="70">1 · out, before</text>
      <text className="s" x="32" y="88">src 192.168.1.23:52814</text>
      <text className="s" x="32" y="104">dst 34.87.120.15:443</text>
      <text className="s" x="620" y="70">2 · out, after</text>
      <text className="s" x="620" y="88">
        {"src "}
        <tspan className="l">203.0.113.45:40001</tspan>
      </text>
      <text className="s" x="620" y="104">dst 34.87.120.15:443</text>
      <text className="s" x="620" y="206">3 · reply</text>
      <text className="s" x="620" y="224">dst 203.0.113.45:40001</text>
      <text className="s" x="32" y="206">4 · reply, after</text>
      <text className="s" x="32" y="224">
        {"dst "}
        <tspan className="l">192.168.1.23:52814</tspan>
      </text>
    </svg>
  );
}

export function FigTimeouts() {
  return (
    <svg viewBox="0 40 920 190" role="img" aria-label="Timeline: without keepalive, the NAT row is removed after 20 minutes idle and a late reply is dropped; with a keepalive every 5 minutes, the row stays.">
      <text className="s" x="16" y="70">no keepalive</text>
      <line x1="80" y1="79" x2="187" y2="79" style={{"stroke": "var(--dd-green)", "strokeWidth": "7"}} />
      <line className="w amber dash" x1="187" y1="79" x2="720" y2="79" />
      <text className="s" x="330" y="64">idle 20 minutes: no packets either way</text>
      <text className="mid l" x="720" y="84" style={{"fontSize": "18px"}}>✕</text>
      <text className="s" x="660" y="110">row removed</text>
      <circle cx="773" cy="79" r="6" style={{"fill": "var(--dd-fault)"}} />
      <text className="s" x="760" y="60">late reply: dropped</text>
      <text className="s" x="16" y="150">keepalive</text>
      <line x1="80" y1="159" x2="880" y2="159" style={{"stroke": "var(--dd-green)", "strokeWidth": "7"}} />
      <circle cx="320" cy="159" r="5" style={{"fill": "var(--dd-ground)", "stroke": "var(--dd-green)", "strokeWidth": "2"}} />
      <circle cx="453" cy="159" r="5" style={{"fill": "var(--dd-ground)", "stroke": "var(--dd-green)", "strokeWidth": "2"}} />
      <circle cx="587" cy="159" r="5" style={{"fill": "var(--dd-ground)", "stroke": "var(--dd-green)", "strokeWidth": "2"}} />
      <circle cx="720" cy="159" r="5" style={{"fill": "var(--dd-ground)", "stroke": "var(--dd-green)", "strokeWidth": "2"}} />
      <circle cx="853" cy="159" r="5" style={{"fill": "var(--dd-ground)", "stroke": "var(--dd-green)", "strokeWidth": "2"}} />
      <text className="s" x="320" y="140">a small packet every 5 minutes keeps the row alive</text>
      <line className="w" x1="80" y1="198" x2="880" y2="198" />
      <text className="s mid" x="80" y="218">0</text>
      <text className="s mid" x="213" y="218">5</text>
      <text className="s mid" x="347" y="218">10</text>
      <text className="s mid" x="480" y="218">15</text>
      <text className="s mid" x="613" y="218">20</text>
      <text className="s mid" x="747" y="218">25</text>
      <text className="s mid" x="880" y="218">30 min</text>
    </svg>
  );
}

export function FigTraverse() {
  return (
    <svg viewBox="0 0 920 310" role="img" aria-label="Hole punching: each laptop asks a STUN server for its public address, they exchange addresses, then both send to each other at the same time so each NAT has a row for the other side.">
      <rect className="n" x="360" y="16" width="200" height="56" rx="2" />
      <text className="t" x="376" y="40">STUN server</text>
      <text className="s" x="376" y="59">{"\"your public ip:port is …\""}</text>
      <rect className="n plum" x="20" y="206" width="170" height="56" rx="2" />
      <text className="t" x="34" y="230">Your laptop</text>
      <text className="s" x="34" y="249">192.168.1.23:5000</text>
      <rect className="n teal" x="220" y="140" width="170" height="70" rx="2" />
      <text className="t" x="234" y="166">Home NAT</text>
      <text className="s" x="234" y="188">203.0.113.45:40010</text>
      <rect className="n teal" x="530" y="140" width="170" height="70" rx="2" />
      <text className="t" x="544" y="166">Their NAT</text>
      <text className="s" x="544" y="188">203.0.113.88:51022</text>
      <rect className="n plum" x="730" y="206" width="170" height="56" rx="2" />
      <text className="t" x="744" y="230">Their laptop</text>
      <text className="s" x="744" y="249">192.168.1.23:5000</text>
      <line className="w" x1="190" y1="225" x2="218" y2="200" />
      <line className="w" x1="730" y1="225" x2="702" y2="200" />
      <line className="w dash" x1="305" y1="140" x2="420" y2="74" markerEnd="url(#dd-ah-muted)" />
      <line className="w dash" x1="615" y1="140" x2="500" y2="74" markerEnd="url(#dd-ah-muted)" />
      <circle className="badge" cx="362" cy="107" r="11" />
      <text className="mid" x="362" y="112">1</text>
      <circle className="badge" cx="558" cy="107" r="11" />
      <text className="mid" x="558" y="112">1</text>
      <text className="s mid" x="460" y="112">2 · swap</text>
      <text className="s mid" x="460" y="128">ip:port</text>
      <line className="w green" x1="392" y1="175" x2="528" y2="175" markerStart="url(#dd-ah-green)" markerEnd="url(#dd-ah-green)" />
      <text className="mid l" x="460" y="232">3 · both send at the same time</text>
      <text className="s mid" x="460" y="250">each NAT now has a row for the other side,</text>
      <text className="s mid" x="460" y="266">{"so the other side's packets are let in"}</text>
      <text className="s" x="20" y="296">{"1 · each asks STUN \"what is my public ip:port?\"   2 · they swap those through any server both can reach"}</text>
    </svg>
  );
}

export function FigCloudnat() {
  return (
    <svg viewBox="0 0 920 250" role="img" aria-label="kade-api and kade-db without external IPs send outbound traffic through Cloud NAT, which uses static IP 34.87.200.7, to PayGate and OS update servers.">
      <rect className="zone" x="16" y="20" width="560" height="214" rx="2" />
      <text className="s" x="32" y="42">kade-vpc · asia-southeast1</text>
      <rect className="n green" x="36" y="56" width="236" height="62" rx="2" />
      <text className="t" x="52" y="82">kade-api (later)</text>
      <text className="s" x="52" y="102">10.10.1.10 · no external IP</text>
      <rect className="n" x="36" y="146" width="236" height="62" rx="2" />
      <text className="t" x="52" y="172">kade-db</text>
      <text className="s" x="52" y="192">10.10.2.5 · no external IP</text>
      <rect className="n teal" x="330" y="96" width="226" height="74" rx="2" />
      <text className="t" x="346" y="122">Cloud NAT</text>
      <text className="s" x="346" y="142">set up on a Cloud Router</text>
      <text className="s" x="346" y="160">static IP 34.87.200.7</text>
      <line className="w amber" x1="272" y1="87" x2="328" y2="120" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="272" y1="177" x2="328" y2="146" markerEnd="url(#dd-ah-amber)" />
      <rect className="n" x="660" y="40" width="244" height="62" rx="2" />
      <text className="t" x="676" y="66">PayGate API</text>
      <text className="s" x="676" y="86">allow list: 34.87.200.7/32</text>
      <rect className="n" x="660" y="150" width="244" height="62" rx="2" />
      <text className="t" x="676" y="176">OS update servers</text>
      <text className="s" x="676" y="196">package mirrors</text>
      <line className="w amber" x1="556" y1="120" x2="658" y2="72" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="556" y1="146" x2="658" y2="180" markerEnd="url(#dd-ah-amber)" />
    </svg>
  );
}
