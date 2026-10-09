// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigPort() {
  return (
    <svg viewBox="0 0 920 230" role="img" aria-label="Packets to kade-api 10.10.1.10 are handed by the OS to different programs by port: 443 to Node, 22 to sshd, 9100 to the metrics agent.">
      <rect className="zone" x="300" y="16" width="604" height="200" rx="2" />
      <text className="s" x="316" y="38">kade-api · one IP: 10.10.1.10</text>
      <rect className="n amber" x="320" y="54" width="130" height="146" rx="2" />
      <text className="t" x="336" y="80">OS</text>
      <text className="s" x="336" y="102">reads the</text>
      <text className="s" x="336" y="120">destination</text>
      <text className="s" x="336" y="138">port, hands</text>
      <text className="s" x="336" y="156">the data on</text>
      <rect className="n plum" x="560" y="54" width="330" height="40" rx="2" />
      <text className="s" x="576" y="79">:443 → Node (kade-api)</text>
      <rect className="n green" x="560" y="106" width="330" height="40" rx="2" />
      <text className="s" x="576" y="131">:22 → sshd (chapter 29)</text>
      <rect className="n teal" x="560" y="158" width="330" height="40" rx="2" />
      <text className="s" x="576" y="183">:9100 → metrics agent</text>
      <line className="w amber" x1="450" y1="74" x2="558" y2="74" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="450" y1="126" x2="558" y2="126" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="450" y1="178" x2="558" y2="178" markerEnd="url(#dd-ah-amber)" />
      <rect className="n" x="16" y="60" width="240" height="130" rx="2" />
      <text className="t" x="32" y="86">Arriving packets</text>
      <text className="s" x="32" y="110">dst 10.10.1.10 : 443</text>
      <text className="s" x="32" y="130">dst 10.10.1.10 : 22</text>
      <text className="s" x="32" y="150">dst 10.10.1.10 : 9100</text>
      <text className="s" x="32" y="170">dst 10.10.1.10 : 5432 → none</text>
      <line className="w" x1="256" y1="126" x2="318" y2="126" markerEnd="url(#dd-ah-muted)" />
    </svg>
  );
}
