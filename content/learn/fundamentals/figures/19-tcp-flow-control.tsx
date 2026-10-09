// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigProblem() {
  return (
    <svg viewBox="0 0 920 220" role="img" aria-label="Sender pushes data over the network into the receiver's buffer; the app reads from the other end. The buffer has filled part, free part.">
      <rect className="n plum" x="16" y="70" width="170" height="70" rx="2" />
      <text className="t" x="32" y="98">Laptop</text>
      <text className="s" x="32" y="120">uploading 20 photos</text>
      <line className="w amber" x1="186" y1="105" x2="300" y2="105" markerEnd="url(#dd-ah-amber)" />
      <text className="s" x="196" y="94">segments</text>
      <rect className="zone" x="304" y="20" width="600" height="180" rx="2" />
      <text className="s" x="320" y="42">kade-api (the receiver)</text>
      <text className="s" x="320" y="72">receive buffer for this connection</text>
      <rect x="320" y="84" width="420" height="44" rx="2" style={{"fill": "none", "stroke": "var(--dd-rule-strong)"}} />
      <rect x="320" y="84" width="290" height="44" rx="2" style={{"fill": "color-mix(in srgb,var(--dd-amber) 30%,transparent)", "stroke": "var(--dd-amber)"}} />
      <text className="s mid" x="465" y="111">waiting to be read · 48 KB</text>
      <text className="s mid" x="675" y="111">free · 16 KB</text>
      <line className="w green" x1="740" y1="106" x2="786" y2="106" markerEnd="url(#dd-ah-green)" />
      <rect className="n green" x="790" y="80" width="100" height="52" rx="2" />
      <text className="t" x="804" y="104">Node app</text>
      <text className="s" x="804" y="122">reads</text>
      <text className="s" x="320" y="160">TCP writes in from the left as segments arrive. The app reads from the right when it calls read().</text>
      <text className="s" x="320" y="180">If the app is busy (for example, a slow image resize), the orange part grows until nothing is free.</text>
    </svg>
  );
}
