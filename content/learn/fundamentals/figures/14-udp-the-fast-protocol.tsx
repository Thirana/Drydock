// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigConnless() {
  return (
    <svg viewBox="0 0 920 250" role="img" aria-label="UDP: laptop sends a DNS query straight to the resolver and gets a reply, two messages total. TCP would first need a three-message handshake.">
      <rect className="n plum" x="40" y="10" width="200" height="44" rx="2" />
      <text className="t" x="56" y="37">Laptop</text>
      <rect className="n teal" x="680" y="10" width="200" height="44" rx="2" />
      <text className="t" x="696" y="37">DNS resolver :53</text>
      <line className="w dash" x1="140" y1="54" x2="140" y2="220" />
      <line className="w dash" x1="780" y1="54" x2="780" y2="220" />
      <line className="w amber" x1="142" y1="80" x2="776" y2="100" markerEnd="url(#dd-ah-amber)" />
      <text className="s mid" x="460" y="80">{"datagram 1 · \"A record for api.kade.lk?\""}</text>
      <line className="w green" x1="778" y1="112" x2="144" y2="132" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="460" y="140">{"datagram 2 · \"34.87.120.15\""}</text>
      <text className="s" x="140" y="180">Done. Two datagrams, no setup, no goodbye.</text>
      <text className="s" x="140" y="200">With TCP, three setup messages would have to finish before the question</text>
      <text className="s" x="140" y="220">could even be sent (see the TCP chapters).</text>
    </svg>
  );
}
