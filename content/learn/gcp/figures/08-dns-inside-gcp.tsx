// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigZones() {
  return (
    <svg viewBox="0 0 960 250" role="img" aria-label="Public zone kade.lk answers anyone on the internet with 34.120.88.10 for api.kade.lk. Private zone kade.internal answers only VMs in kade-vpc, with 10.10.2.5 for db.kade.internal. From the internet, db.kade.internal does not exist.">
      <rect className="n" x="16" y="30" width="190" height="60" rx="2" />
      <text className="t" x="30" y="56">{"Shopper's phone"}</text>
      <text className="s" x="30" y="76">anywhere on the internet</text>
      <rect className="n plum" x="330" y="20" width="300" height="80" rx="2" />
      <text className="t" x="346" y="46">public zone kade-lk</text>
      <text className="s" x="346" y="68">kade.lk · anyone can ask</text>
      <text className="s" x="346" y="86">api.kade.lk A 34.120.88.10</text>
      <line className="w" x1="206" y1="54" x2="327" y2="54" markerEnd="url(#dd-ah-muted)" />
      <text className="s" x="216" y="44">api.kade.lk?</text>
      <rect className="n teal" x="16" y="160" width="190" height="60" rx="2" />
      <text className="t" x="30" y="186">kade-worker</text>
      <text className="s" x="30" y="206">inside kade-vpc</text>
      <rect className="n teal" x="330" y="150" width="300" height="80" rx="2" />
      <text className="t" x="346" y="176">private zone kade-internal</text>
      <text className="s" x="346" y="198">kade.internal · kade-vpc only</text>
      <text className="s" x="346" y="216">db.kade.internal A 10.10.2.5</text>
      <line className="w teal" x1="206" y1="190" x2="327" y2="190" markerEnd="url(#dd-ah-teal)" />
      <text className="s" x="216" y="180">db.kade.internal?</text>
      <path className="w fault dash" d="M150 90 C 200 125, 280 140, 330 152" />
      <text className="x" x="250" y="136">✕</text>
      <text className="s" x="664" y="176">From the internet, db.kade.internal</text>
      <text className="s" x="664" y="194">does not exist at all: the private</text>
      <text className="s" x="664" y="212">zone only answers kade-vpc.</text>
      <text className="s" x="664" y="46">Anyone may ask a public zone.</text>
      <text className="s" x="664" y="64">It is what the world sees for</text>
      <text className="s" x="664" y="82">your domain.</text>
    </svg>
  );
}
