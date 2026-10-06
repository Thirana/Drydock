// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigGives() {
  return (
    <svg viewBox="0 0 920 250" role="img" aria-label="Congestion window over time: grows quickly in slow start, halves on loss, then grows slowly, forming a sawtooth.">
      <line className="w" x1="60" y1="210" x2="890" y2="210" />
      <line className="w" x1="60" y1="210" x2="60" y2="20" />
      <text className="s" x="66" y="30">amount in flight (congestion window)</text>
      <text className="s" x="780" y="232">time (round trips) →</text>
      <polyline points="60,205 110,200 160,190 210,170 260,130 300,60 300,130 380,110 460,90 520,74 520,138 610,118 700,98 760,84 760,146 850,126 890,117" style={{"fill": "none", "stroke": "var(--dd-amber)", "strokeWidth": "2.5"}} />
      <line className="w fault dash" x1="60" y1="64" x2="890" y2="64" style={{"stroke": "var(--dd-fault)"}} />
      <text className="s" x="610" y="56">what the network can really carry</text>
      <text className="s" x="120" y="160">slow start: doubles each round trip</text>
      <text className="s" x="306" y="54">loss → cut</text>
      <text className="s" x="400" y="150">then grows slowly</text>
    </svg>
  );
}
