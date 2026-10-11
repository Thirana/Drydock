// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigWhy() {
  return (
    <svg viewBox="0 0 920 230" role="img" aria-label="Three senders feed a router whose queue is full; the outgoing link carries 100 Mbit/s; extra packets are dropped.">
      <rect className="n plum" x="16" y="20" width="170" height="46" rx="2" />
      <text className="t" x="30" y="48">Backup job</text>
      <rect className="n plum" x="16" y="92" width="170" height="46" rx="2" />
      <text className="t" x="30" y="120">Video call</text>
      <rect className="n plum" x="16" y="164" width="170" height="46" rx="2" />
      <text className="t" x="30" y="192">Staff browsing</text>
      <line className="w amber" x1="186" y1="43" x2="318" y2="104" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="186" y1="115" x2="318" y2="115" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="186" y1="187" x2="318" y2="126" markerEnd="url(#dd-ah-amber)" />
      <text className="s" x="320" y="48">together: 180 Mbit/s</text>
      <rect className="n teal" x="320" y="60" width="330" height="110" rx="2" />
      <text className="t" x="336" y="84">Office router · queue</text>
      <rect x="336" y="100" width="28" height="36" rx="2" style={{"fill": "var(--dd-amber)", "opacity": ".8"}} />
      <rect x="368" y="100" width="28" height="36" rx="2" style={{"fill": "var(--dd-amber)", "opacity": ".8"}} />
      <rect x="400" y="100" width="28" height="36" rx="2" style={{"fill": "var(--dd-amber)", "opacity": ".8"}} />
      <rect x="432" y="100" width="28" height="36" rx="2" style={{"fill": "var(--dd-amber)", "opacity": ".8"}} />
      <rect x="464" y="100" width="28" height="36" rx="2" style={{"fill": "var(--dd-amber)", "opacity": ".8"}} />
      <rect x="496" y="100" width="28" height="36" rx="2" style={{"fill": "var(--dd-amber)", "opacity": ".8"}} />
      <rect x="528" y="100" width="28" height="36" rx="2" style={{"fill": "var(--dd-amber)", "opacity": ".8"}} />
      <rect x="560" y="100" width="28" height="36" rx="2" style={{"fill": "var(--dd-amber)", "opacity": ".8"}} />
      <text className="s" x="336" y="156">full: the next arrivals are dropped</text>
      <text className="l" x="600" y="124" style={{"fontSize": "18.0px"}}>✕</text>
      <line className="w green" x1="650" y1="115" x2="760" y2="115" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="662" y="104">100 Mbit/s</text>
      <rect className="n" x="764" y="92" width="140" height="46" rx="2" />
      <text className="t" x="778" y="120">LankaNet</text>
    </svg>
  );
}
