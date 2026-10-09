// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigWhere() {
  return (
    <svg viewBox="0 0 960 230" role="img" aria-label="kade-api-1 sends a packet to kade-db. As it leaves, the data plane checks kade-api-1's egress rules. As it arrives, the data plane on kade-db's host checks kade-db's ingress rules. Both must allow it.">
      <rect className="n teal" x="16" y="60" width="200" height="70" rx="2" />
      <text className="t" x="30" y="88">kade-api-1</text>
      <text className="s" x="30" y="110">10.10.1.10</text>
      <rect className="n amber" x="236" y="60" width="170" height="70" rx="2" />
      <text className="t" x="250" y="88">egress check</text>
      <text className="s" x="250" y="110">{"kade-api-1's rules"}</text>
      <rect className="n amber" x="554" y="60" width="170" height="70" rx="2" />
      <text className="t" x="568" y="88">ingress check</text>
      <text className="s" x="568" y="110">{"kade-db's rules"}</text>
      <rect className="n green" x="744" y="60" width="200" height="70" rx="2" />
      <text className="t" x="758" y="88">kade-db</text>
      <text className="s" x="758" y="110">10.10.2.5:5432</text>
      <line className="w" x1="216" y1="95" x2="233" y2="95" markerEnd="url(#dd-ah-muted)" />
      <line className="w teal" x1="406" y1="95" x2="551" y2="95" markerEnd="url(#dd-ah-teal)" />
      <text className="s mid" x="480" y="85">TCP SYN :5432</text>
      <line className="w" x1="724" y1="95" x2="741" y2="95" markerEnd="url(#dd-ah-muted)" />
      <text className="s" x="236" y="40">on host A, as it leaves</text>
      <text className="s" x="554" y="40">on host B, as it arrives</text>
      <text className="s" x="236" y="170">Both must allow, or the packet is dropped.</text>
      <text className="s" x="236" y="192">Same subnet or same host makes no difference: both checks always happen.</text>
    </svg>
  );
}
