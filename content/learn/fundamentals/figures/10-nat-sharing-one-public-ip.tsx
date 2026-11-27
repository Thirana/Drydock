// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigSwap() {
  // What NAT rewrote, in each label.
  const changed = { fontWeight: 700, fill: "var(--dd-ink)" };
  return (
    <svg viewBox="0 0 920 330" role="img" aria-label="Outgoing packet source 192.168.1.23:52814 is rewritten by the home router to 203.0.113.45:40001; the reply to 203.0.113.45:40001 is rewritten back to 192.168.1.23:52814.">
      <rect className="zone" x="16" y="16" width="300" height="298" rx="2" />
      <text className="s" x="32" y="40">home LAN (private)</text>
      <rect className="zone" x="604" y="16" width="300" height="298" rx="2" />
      <text className="s" x="620" y="40">internet (public)</text>
      <rect className="n plum" x="32" y="160" width="140" height="64" rx="2" />
      <text className="t" x="46" y="186">Laptop</text>
      <text className="s" x="46" y="206">192.168.1.23</text>
      <rect className="n teal" x="360" y="148" width="200" height="88" rx="2" />
      <text className="t" x="376" y="174">Home router</text>
      <text className="s" x="376" y="196">does NAT</text>
      <text className="s" x="376" y="216">WAN 203.0.113.45</text>
      <rect className="n green" x="748" y="160" width="140" height="64" rx="2" />
      <text className="t" x="762" y="186">kade-api</text>
      <text className="s" x="762" y="206">34.87.120.15</text>
      <line className="w amber" x1="172" y1="178" x2="358" y2="178" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="560" y1="178" x2="746" y2="178" markerEnd="url(#dd-ah-amber)" />
      <line className="w green" x1="746" y1="208" x2="562" y2="208" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="358" y1="208" x2="174" y2="208" markerEnd="url(#dd-ah-green)" />
      <text className="l" x="32" y="80">1 · out, before</text>
      <text className="s" x="32" y="102">src 192.168.1.23:52814</text>
      <text className="s" x="32" y="122">dst 34.87.120.15:443</text>
      <text className="l" x="620" y="80">2 · out, after</text>
      <text className="s" x="620" y="102">
        {"src "}
        <tspan style={changed}>203.0.113.45:40001</tspan>
      </text>
      <text className="s" x="620" y="122">dst 34.87.120.15:443</text>
      <text className="l" x="620" y="264">3 · reply</text>
      <text className="s" x="620" y="286">dst 203.0.113.45:40001</text>
      <text className="l" x="32" y="264">4 · reply, after</text>
      <text className="s" x="32" y="286">
        {"dst "}
        <tspan style={changed}>192.168.1.23:52814</tspan>
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
      <text className="mid l" x="720" y="84" style={{"fontSize": "18.0px"}}>✕</text>
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
    <svg viewBox="0 0 920 372" role="img" aria-label="Hole punching: each laptop asks a STUN server for its public address, they exchange addresses, then both send to each other at the same time so each NAT has a row for the other side.">
      <rect className="n" x="340" y="16" width="240" height="56" rx="2" />
      <text className="t" x="356" y="40">STUN server</text>
      <text className="s" x="356" y="59">{"\"your public ip:port is …\""}</text>
      <rect className="n teal" x="220" y="152" width="170" height="70" rx="2" />
      <text className="t" x="234" y="178">Home NAT</text>
      <text className="s" x="234" y="200">203.0.113.45:40010</text>
      <rect className="n teal" x="530" y="152" width="170" height="70" rx="2" />
      <text className="t" x="544" y="178">Their NAT</text>
      <text className="s" x="544" y="200">203.0.113.88:51022</text>
      <rect className="n plum" x="20" y="270" width="170" height="56" rx="2" />
      <text className="t" x="34" y="294">Your laptop</text>
      <text className="s" x="34" y="313">192.168.1.23:5000</text>
      <rect className="n plum" x="730" y="270" width="170" height="56" rx="2" />
      <text className="t" x="744" y="294">Their laptop</text>
      <text className="s" x="744" y="313">192.168.1.23:5000</text>
      {/* Each laptop up to its NAT; each NAT up to STUN (square bends). */}
      <path className="w" d="M105 270 V187 H220" />
      <path className="w" d="M815 270 V187 H700" />
      <path className="w dash" d="M305 152 V44 H338" markerEnd="url(#dd-ah-muted)" />
      <path className="w dash" d="M615 152 V44 H582" markerEnd="url(#dd-ah-muted)" />
      <circle className="badge" cx="305" cy="100" r="11" />
      <text className="mid" x="305" y="105">1</text>
      <circle className="badge" cx="615" cy="100" r="11" />
      <text className="mid" x="615" y="105">1</text>
      <text className="l mid" x="460" y="104">2 · swap ip:port</text>
      <text className="s mid" x="460" y="124">through any server</text>
      <path className="w green" d="M392 187 H528" markerStart="url(#dd-ah-green)" markerEnd="url(#dd-ah-green)" />
      <text className="l mid" x="460" y="256">3 · both send at the same time</text>
      <text className="s mid" x="460" y="276">each NAT now has a row for the other side,</text>
      <text className="s mid" x="460" y="294">{"so the other side's packets are let in"}</text>
      <text className="s" x="20" y="358">{"1 · each asks STUN \"what is my public ip:port?\"   2 · they swap those through any server both can reach"}</text>
    </svg>
  );
}

export function FigCloudnat() {
  return (
    <svg viewBox="0 0 920 250" role="img" aria-label="kade-api and kade-db without external IPs send outbound traffic through Cloud NAT, which uses static IP 34.87.200.7, to PayGate and OS update servers.">
      <rect className="zone" x="16" y="20" width="560" height="214" rx="2" />
      <text className="s" x="32" y="42">kade-vpc · asia-southeast1</text>
      <rect className="n green" x="36" y="56" width="252" height="62" rx="2" />
      <text className="t" x="52" y="82">kade-api (later)</text>
      <text className="s" x="52" y="102">10.10.1.10 · no external IP</text>
      <rect className="n" x="36" y="146" width="252" height="62" rx="2" />
      <text className="t" x="52" y="172">kade-db</text>
      <text className="s" x="52" y="192">10.10.2.5 · no external IP</text>
      <rect className="n teal" x="330" y="96" width="226" height="74" rx="2" />
      <text className="t" x="346" y="122">Cloud NAT</text>
      <text className="s" x="346" y="142">set up on a Cloud Router</text>
      <text className="s" x="346" y="160">static IP 34.87.200.7</text>
      {/* Both VMs merge on one trunk into Cloud NAT; out of it, one bus splits to each destination. */}
      <path className="w amber" d="M288 87 H308 V133 H328" markerEnd="url(#dd-ah-amber)" />
      <path className="w amber" d="M288 177 H308 V133" />
      <rect className="n" x="660" y="40" width="244" height="62" rx="2" />
      <text className="t" x="676" y="66">PayGate API</text>
      <text className="s" x="676" y="86">allow list: 34.87.200.7/32</text>
      <rect className="n" x="660" y="150" width="244" height="62" rx="2" />
      <text className="t" x="676" y="176">OS update servers</text>
      <text className="s" x="676" y="196">package mirrors</text>
      <path className="w amber" d="M556 133 H612 V71 H658" markerEnd="url(#dd-ah-amber)" />
      <path className="w amber" d="M556 133 H612 V181 H658" markerEnd="url(#dd-ah-amber)" />
    </svg>
  );
}

export function FigTunnel() {
  return (
    <svg viewBox="0 0 920 344" role="img" aria-label="Reverse tunnel: the laptop opens an outgoing connection through the home router to a tunnel service and keeps it open. PayGate sends its webhook to the service's public URL, and the service sends it back down that open connection to the laptop. Sent straight to the router's public IP, the same webhook is dropped.">
      <rect className="zone" x="16" y="16" width="446" height="236" rx="2" />
      <text className="s" x="32" y="40">home (private)</text>
      <rect className="zone" x="478" y="16" width="426" height="236" rx="2" />
      <text className="s" x="494" y="40">internet (public)</text>
      <rect className="n green" x="32" y="124" width="160" height="72" rx="2" />
      <text className="t" x="46" y="152">Your laptop</text>
      <text className="s" x="46" y="174">kade-api on :3000</text>
      <rect className="n teal" x="276" y="112" width="170" height="96" rx="2" />
      <text className="t" x="290" y="138">Home router</text>
      <text className="s" x="290" y="160">203.0.113.45</text>
      <text className="s" x="290" y="182">row made by step 1</text>
      <rect className="n teal" x="530" y="112" width="176" height="96" rx="2" />
      <text className="t" x="544" y="138">Tunnel service</text>
      <text className="s" x="544" y="160">Cloudflare, ngrok</text>
      <text className="s" x="544" y="182">gives a public URL</text>
      <rect className="n plum" x="760" y="124" width="128" height="72" rx="2" />
      <text className="t" x="774" y="152">PayGate</text>
      <text className="s" x="774" y="174">sends webhook</text>
      {/* The tunnel: one outgoing connection, opened from the laptop and kept open. */}
      <path className="w teal" d="M192 144 H274" markerEnd="url(#dd-ah-teal)" style={{ strokeWidth: 3 }} />
      <path className="w teal" d="M446 144 H528" markerEnd="url(#dd-ah-teal)" style={{ strokeWidth: 3 }} />
      {/* The webhook: to the service, then back down the tunnel. */}
      <path className="w amber" d="M760 176 H708" markerEnd="url(#dd-ah-amber)" />
      <path className="w amber" d="M530 176 H448" markerEnd="url(#dd-ah-amber)" />
      <path className="w amber" d="M276 176 H194" markerEnd="url(#dd-ah-amber)" />
      {/* Straight to the router's public IP: no row, so dropped. */}
      <path className="w fault dash" d="M824 124 V76 H361 V92" />
      <text className="x" x="361" y="106">✕</text>
      <text className="s flt" x="494" y="66">straight to 203.0.113.45: no row, dropped</text>
      <circle className="badge" cx="234" cy="144" r="11" />
      <text className="mid" x="234" y="149">1</text>
      <circle className="badge" cx="734" cy="176" r="11" />
      <text className="mid" x="734" y="181">2</text>
      <circle className="badge" cx="504" cy="176" r="11" />
      <text className="mid" x="504" y="181">3</text>
      <text className="s" x="16" y="284">1 · the laptop connects out and keeps the connection open. Like any outgoing connection, it gets a NAT row.</text>
      <text className="s" x="16" y="308">{"2 · PayGate sends the webhook to the tunnel's public URL, not to your router."}</text>
      <text className="s" x="16" y="332">3 · the service sends it back down the open connection. It matches the row, so the router lets it in.</text>
    </svg>
  );
}
