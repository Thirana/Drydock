// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigScale() {
  return (
    <svg viewBox="0 0 920 250" role="img" aria-label="Rider app connected to kade-api instance A publishes a location; a pub/sub channel delivers it to instance B, which pushes it to the shopper's app connected there.">
      <rect className="n plum" x="16" y="30" width="170" height="56" rx="2" />
      <text className="t" x="30" y="54">{"Rider's app"}</text>
      <text className="s" x="30" y="74">sends GPS</text>
      <rect className="n plum" x="16" y="164" width="170" height="56" rx="2" />
      <text className="t" x="30" y="188">{"Shopper's app"}</text>
      <text className="s" x="30" y="208">watching order 1042</text>
      <rect className="n green" x="280" y="30" width="236" height="56" rx="2" />
      <text className="t" x="296" y="54">kade-api · A</text>
      <text className="s" x="296" y="74">{"holds the rider's socket"}</text>
      <rect className="n green" x="280" y="164" width="236" height="56" rx="2" />
      <text className="t" x="296" y="188">kade-api · B</text>
      <text className="s" x="296" y="208">{"holds the shopper's socket"}</text>
      <rect className="n amber" x="590" y="96" width="300" height="60" rx="2" />
      <text className="t" x="606" y="120">{"Pub/sub channel \"order:1042\""}</text>
      <text className="s" x="606" y="140">Redis, or GCP Pub/Sub</text>
      <line className="w plum" x1="186" y1="58" x2="278" y2="58" markerEnd="url(#dd-ah-plum)" />
      <line className="w amber" x1="516" y1="58" x2="588" y2="104" markerEnd="url(#dd-ah-amber)" />
      <text className="s" x="524" y="54">publish</text>
      <line className="w amber" x1="588" y1="148" x2="518" y2="192" markerEnd="url(#dd-ah-amber)" />
      <text className="s" x="524" y="204">deliver</text>
      <line className="w green" x1="278" y1="192" x2="188" y2="192" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="196" y="182">push</text>
    </svg>
  );
}
