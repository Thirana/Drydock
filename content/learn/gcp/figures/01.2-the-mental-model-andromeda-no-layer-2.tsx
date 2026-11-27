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
      <path className="w dash" d="M125 150 V221 H165" />
      <path className="w dash" d="M335 150 V221 H295" />
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
      <path className="w" d="M589 208 V238 H608" />
      <line className="w" x1="632" y1="238" x2="702" y2="238" />
      <line className="w" x1="726" y1="238" x2="796" y2="238" />
      <path className="w" d="M820 238 H839 V208" />
      <circle className="badge" cx="620" cy="238" r="12" />
      <circle className="badge" cx="714" cy="238" r="12" />
      <circle className="badge" cx="808" cy="238" r="12" />
      <text className="s" x="500" y="270">{"Google's routers and links, which you never see"}</text>
    </svg>
  );
}

export function FigAndromeda() {
  return (
    <svg viewBox="0 0 960 354" role="img" aria-label="The Andromeda control plane at the top pushes state down to the data plane on three physical hosts. Each host runs one of Kadé's VMs next to another customer's VM.">
      <rect className="n plum" x="250" y="16" width="460" height="68" rx="2" />
      <text className="t" x="270" y="42">Andromeda control plane</text>
      <text className="s" x="270" y="64">the record of every VM, IP, host, route and firewall rule</text>
      {/* One trunk from the control plane, split to every host. */}
      <path className="w plum dash" d="M480 84 V106 H165 V170" markerEnd="url(#dd-ah-plum)" />
      <path className="w plum dash" d="M480 84 V170" markerEnd="url(#dd-ah-plum)" />
      <path className="w plum dash" d="M480 106 H795 V170" markerEnd="url(#dd-ah-plum)" />
      <text className="s" x="492" y="132">pushes state down,</text>
      <text className="s" x="492" y="148">before any packet</text>
      <rect className="zone" x="20" y="174" width="290" height="166" rx="2" />
      <text className="s" x="34" y="194">physical host A · zone a</text>
      <rect className="n teal" x="34" y="206" width="124" height="48" rx="2" />
      <text className="t" x="46" y="235">kade-api-1</text>
      <rect className="n" x="170" y="206" width="126" height="48" rx="2" />
      <text className="s" x="182" y="226">another</text>
      <text className="s" x="182" y="243">{"customer's VM"}</text>
      <rect className="n plum" x="34" y="268" width="262" height="58" rx="2" />
      <text className="t" x="46" y="292">data plane</text>
      <text className="s" x="46" y="312">state loaded in advance</text>
      <rect className="zone" x="335" y="174" width="290" height="166" rx="2" />
      <text className="s" x="349" y="194">physical host B · zone b</text>
      <rect className="n teal" x="349" y="206" width="124" height="48" rx="2" />
      <text className="t" x="361" y="235">kade-api-2</text>
      <rect className="n" x="485" y="206" width="126" height="48" rx="2" />
      <text className="s" x="497" y="226">another</text>
      <text className="s" x="497" y="243">{"customer's VM"}</text>
      <rect className="n plum" x="349" y="268" width="262" height="58" rx="2" />
      <text className="t" x="361" y="292">data plane</text>
      <text className="s" x="361" y="312">state loaded in advance</text>
      <rect className="zone" x="650" y="174" width="290" height="166" rx="2" />
      <text className="s" x="664" y="194">physical host C · zone b</text>
      <rect className="n green" x="664" y="206" width="124" height="48" rx="2" />
      <text className="t" x="676" y="235">kade-db</text>
      <rect className="n" x="800" y="206" width="126" height="48" rx="2" />
      <text className="s" x="812" y="226">another</text>
      <text className="s" x="812" y="243">{"customer's VM"}</text>
      <rect className="n plum" x="664" y="268" width="262" height="58" rx="2" />
      <text className="t" x="676" y="292">data plane</text>
      <text className="s" x="676" y="312">state loaded in advance</text>
    </svg>
  );
}
