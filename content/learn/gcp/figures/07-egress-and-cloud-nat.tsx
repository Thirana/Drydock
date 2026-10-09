// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigSplit() {
  return (
    <svg viewBox="0 0 960 250" role="img" aria-label="Three VMs send traffic to the internet. A VM with an external IP goes out as its own IP, even though Cloud NAT exists. A VM without an external IP and without NAT cannot get out. A VM without an external IP but covered by Cloud NAT goes out as the NAT IP 34.87.200.7.">
      <rect className="zone teal" x="16" y="12" width="560" height="226" rx="2" />
      <text className="s" x="32" y="34">kade-vpc · asia-southeast1</text>
      <rect className="n teal" x="32" y="48" width="230" height="52" rx="2" />
      <text className="t" x="44" y="70">test-vm</text>
      <text className="s" x="44" y="89">has external IP 34.87.130.4</text>
      <rect className="n teal" x="32" y="112" width="230" height="52" rx="2" />
      <text className="t" x="44" y="134">kade-api-1 today</text>
      <text className="s" x="44" y="153">no external IP, no NAT</text>
      <rect className="n teal" x="32" y="176" width="230" height="52" rx="2" />
      <text className="t" x="44" y="198">kade-api-1 after</text>
      <text className="s" x="44" y="217">no external IP, NAT covers it</text>
      <rect className="n teal" x="340" y="164" width="220" height="64" rx="2" />
      <text className="t" x="354" y="188">Cloud NAT kade-nat</text>
      <text className="s" x="354" y="208">NAT IP 34.87.200.7</text>
      <rect className="n" x="744" y="96" width="200" height="72" rx="2" />
      <text className="t" x="758" y="122">Internet</text>
      <text className="s" x="758" y="144">PayGate, apt mirrors</text>
      <path className="w green" d="M262 74 C 500 74, 600 100, 741 118" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="580" y="80">src 34.87.130.4 (NAT ignored)</text>
      <line className="w fault dash" x1="262" y1="138" x2="320" y2="138" />
      <text className="x" x="330" y="143">✕</text>
      <text className="s" x="344" y="143">no path</text>
      <line className="w teal" x1="262" y1="202" x2="337" y2="202" markerEnd="url(#dd-ah-teal)" />
      <path className="w green" d="M560 196 C 640 196, 680 160, 741 150" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="590" y="222">src 34.87.200.7</text>
    </svg>
  );
}
