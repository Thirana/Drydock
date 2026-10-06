// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigWhy() {
  return (
    <svg viewBox="0 0 960 300" role="img" aria-label="Left: what you see, kade-api-1 and kade-api-2 side by side in sn-app as if on one switch. Right: what is really there, two physical hosts in different zones, each with a data plane, joined only by Google's routers and links.">
      <text className="s" x="16" y="26">what you see</text>
      <rect className="zone teal" x="16" y="40" width="424" height="240" rx="2" />
      <text className="s" x="32" y="64">kade-vpc · sn-app · 10.10.1.0/24</text>
      <rect className="n teal" x="40" y="86" width="170" height="64" rx="2" />
      <text className="t" x="54" y="112">kade-api-1</text>
      <text className="s" x="54" y="132">10.10.1.10 · zone a</text>
      <rect className="n teal" x="250" y="86" width="170" height="64" rx="2" />
      <text className="t" x="264" y="112">kade-api-2</text>
      <text className="s" x="264" y="132">10.10.1.11 · zone b</text>
      <line className="w dash" x1="125" y1="150" x2="190" y2="200" />
      <line className="w dash" x1="335" y1="150" x2="270" y2="200" />
      <rect className="ghost" x="165" y="200" width="130" height="42" rx="2" />
      <text className="f mid" x="230" y="226">a switch?</text>
      <text className="s" x="32" y="268">looks like one LAN, one switch, one broadcast domain</text>
      <text className="s" x="480" y="26">what is really there</text>
      <rect className="zone" x="480" y="40" width="464" height="240" rx="2" />
      <rect className="n" x="500" y="58" width="178" height="150" rx="2" />
      <text className="s" x="512" y="78">physical host · zone a</text>
      <rect className="n teal" x="512" y="90" width="154" height="42" rx="2" />
      <text className="t" x="524" y="116">kade-api-1</text>
      <rect className="n plum" x="512" y="144" width="154" height="52" rx="2" />
      <text className="t" x="524" y="166">data plane</text>
      <text className="s" x="524" y="185">Andromeda</text>
      <rect className="n" x="750" y="58" width="178" height="150" rx="2" />
      <text className="s" x="762" y="78">physical host · zone b</text>
      <rect className="n teal" x="762" y="90" width="154" height="42" rx="2" />
      <text className="t" x="774" y="116">kade-api-2</text>
      <rect className="n plum" x="762" y="144" width="154" height="52" rx="2" />
      <text className="t" x="774" y="166">data plane</text>
      <text className="s" x="774" y="185">Andromeda</text>
      <line className="w" x1="589" y1="208" x2="620" y2="238" />
      <line className="w" x1="632" y1="238" x2="702" y2="238" />
      <line className="w" x1="726" y1="238" x2="796" y2="238" />
      <line className="w" x1="808" y1="238" x2="839" y2="208" />
      <circle className="badge" cx="620" cy="238" r="12" />
      <circle className="badge" cx="714" cy="238" r="12" />
      <circle className="badge" cx="808" cy="238" r="12" />
      <text className="s" x="500" y="270">{"Google's routers and links, which you never see"}</text>
    </svg>
  );
}

export function FigAndromeda() {
  return (
    <svg viewBox="0 0 960 330" role="img" aria-label="The Andromeda control plane at the top pushes state down to the data plane on three physical hosts. Each host runs one of Kadé's VMs next to another customer's VM.">
      <rect className="n plum" x="250" y="16" width="460" height="68" rx="2" />
      <text className="t" x="270" y="42">Andromeda control plane</text>
      <text className="s" x="270" y="64">the record of every VM, IP, host, route and firewall rule</text>
      <line className="w plum dash" x1="400" y1="84" x2="165" y2="146" markerEnd="url(#dd-ah-plum)" />
      <line className="w plum dash" x1="480" y1="84" x2="480" y2="146" markerEnd="url(#dd-ah-plum)" />
      <line className="w plum dash" x1="560" y1="84" x2="795" y2="146" markerEnd="url(#dd-ah-plum)" />
      <text className="s" x="492" y="106">pushes state down,</text>
      <text className="s" x="492" y="122">before any packet</text>
      <rect className="zone" x="20" y="150" width="290" height="166" rx="2" />
      <text className="s" x="34" y="170">physical host A · zone a</text>
      <rect className="n teal" x="34" y="182" width="124" height="48" rx="2" />
      <text className="t" x="46" y="211">kade-api-1</text>
      <rect className="n" x="170" y="182" width="126" height="48" rx="2" />
      <text className="s" x="182" y="202">another</text>
      <text className="s" x="182" y="219">{"customer's VM"}</text>
      <rect className="n plum" x="34" y="244" width="262" height="58" rx="2" />
      <text className="t" x="46" y="268">data plane</text>
      <text className="s" x="46" y="288">state loaded in advance</text>
      <rect className="zone" x="335" y="150" width="290" height="166" rx="2" />
      <text className="s" x="349" y="170">physical host B · zone b</text>
      <rect className="n teal" x="349" y="182" width="124" height="48" rx="2" />
      <text className="t" x="361" y="211">kade-api-2</text>
      <rect className="n" x="485" y="182" width="126" height="48" rx="2" />
      <text className="s" x="497" y="202">another</text>
      <text className="s" x="497" y="219">{"customer's VM"}</text>
      <rect className="n plum" x="349" y="244" width="262" height="58" rx="2" />
      <text className="t" x="361" y="268">data plane</text>
      <text className="s" x="361" y="288">state loaded in advance</text>
      <rect className="zone" x="650" y="150" width="290" height="166" rx="2" />
      <text className="s" x="664" y="170">physical host C · zone b</text>
      <rect className="n green" x="664" y="182" width="124" height="48" rx="2" />
      <text className="t" x="676" y="211">kade-db</text>
      <rect className="n" x="800" y="182" width="126" height="48" rx="2" />
      <text className="s" x="812" y="202">another</text>
      <text className="s" x="812" y="219">{"customer's VM"}</text>
      <rect className="n plum" x="664" y="244" width="262" height="58" rx="2" />
      <text className="t" x="676" y="268">data plane</text>
      <text className="s" x="676" y="288">state loaded in advance</text>
    </svg>
  );
}

export function FigScope() {
  return (
    <svg viewBox="0 0 960 330" role="img" aria-label="Nested scopes. Global holds kade-vpc and its firewall rules. Inside it, region asia-southeast1 holds subnets. Zone a and zone b sit inside the region. sn-app stretches across both zones, with kade-api-1 in zone a and kade-api-2 in zone b. sn-data holds kade-db in zone b. Another region could hold a new subnet of the same kade-vpc.">
      <rect className="zone" x="16" y="12" width="928" height="306" rx="2" />
      <text className="s" x="32" y="34">global · kade-vpc, firewall rules, routes, load balancer IP 34.120.88.10</text>
      <rect className="zone teal" x="32" y="50" width="600" height="252" rx="2" />
      <text className="s" x="48" y="72">region asia-southeast1 · subnets, Cloud NAT, Cloud Router</text>
      <rect className="zone" x="48" y="86" width="276" height="204" rx="2" />
      <text className="s" x="62" y="106">zone asia-southeast1-a</text>
      <rect className="zone" x="340" y="86" width="276" height="204" rx="2" />
      <text className="s" x="354" y="106">zone asia-southeast1-b</text>
      <rect className="zone teal" x="56" y="120" width="552" height="84" rx="2" />
      <text className="s" x="68" y="140">sn-app 10.10.1.0/24 · spans both zones</text>
      <rect className="n teal" x="68" y="150" width="200" height="44" rx="2" />
      <text className="t" x="80" y="177">kade-api-1</text>
      <rect className="n teal" x="360" y="150" width="200" height="44" rx="2" />
      <text className="t" x="372" y="177">kade-api-2</text>
      <rect className="zone teal" x="56" y="218" width="552" height="62" rx="2" />
      <text className="s" x="68" y="253">sn-data 10.10.2.0/24</text>
      <rect className="n green" x="360" y="226" width="200" height="44" rx="2" />
      <text className="t" x="372" y="253">kade-db</text>
      <rect className="ghost" x="652" y="50" width="276" height="252" rx="2" />
      <text className="s" x="668" y="72">another region, e.g. asia-south1</text>
      <text className="s" x="668" y="112">a subnet added here is part of</text>
      <text className="s" x="668" y="130">the same kade-vpc</text>
      <text className="s" x="668" y="166">VMs in both regions reach each</text>
      <text className="s" x="668" y="184">other on internal IPs, over</text>
      <text className="s" x="668" y="202">{"Google's network, with no VPN"}</text>
    </svg>
  );
}
