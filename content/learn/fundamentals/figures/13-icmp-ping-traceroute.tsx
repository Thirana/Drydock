// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigPing() {
  return (
    <svg viewBox="0 0 920 250" role="img" aria-label="ping: laptop sends Echo Request seq 0 to kade-api, gets Echo Reply after 41 ms; then seq 1.">
      <rect className="n plum" x="60" y="10" width="200" height="46" rx="2" />
      <text className="t" x="76" y="38">Laptop (home)</text>
      <rect className="n green" x="660" y="10" width="200" height="46" rx="2" />
      <text className="t" x="676" y="38">kade-api</text>
      <line className="w dash" x1="160" y1="56" x2="160" y2="240" />
      <line className="w dash" x1="760" y1="56" x2="760" y2="240" />
      <line className="w green" x1="162" y1="80" x2="756" y2="110" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="460" y="84">Echo Request · type 8 · seq 0</text>
      <line className="w green" x1="758" y1="118" x2="164" y2="148" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="460" y="152">Echo Reply · type 0 · seq 0</text>
      <path className="w amber" d="M140 80 H128 V148 H140" />
      <text className="l" x="30" y="118">RTT</text>
      <text className="s" x="22" y="136">41.2 ms</text>
      <line className="w green" x1="162" y1="180" x2="756" y2="210" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="460" y="186">one per second: seq 1, seq 2 …</text>
    </svg>
  );
}
