// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigQueues() {
  return (
    <svg viewBox="0 0 920 220" role="img" aria-label="SYN arrives and waits in the SYN queue; after the final ACK the connection moves to the accept queue; accept() hands it to the app.">
      <rect className="n plum" x="16" y="80" width="130" height="56" rx="2" />
      <text className="t" x="30" y="104">Clients</text>
      <text className="s" x="30" y="124">SYN, then ACK</text>
      <line className="w amber" x1="146" y1="108" x2="206" y2="108" markerEnd="url(#dd-ah-amber)" />
      <rect className="n amber" x="208" y="60" width="230" height="96" rx="2" />
      <text className="t" x="224" y="86">SYN queue</text>
      <text className="s" x="224" y="108">half-open: SYN-RECEIVED</text>
      <text className="s" x="224" y="128">waiting for the final ACK</text>
      <line className="w green" x1="438" y1="108" x2="498" y2="108" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="444" y="98">ACK</text>
      <rect className="n" x="500" y="60" width="230" height="96" rx="2" />
      <text className="t" x="516" y="86">Accept queue</text>
      <text className="s" x="516" y="108">ESTABLISHED, not yet taken</text>
      <text className="s" x="516" y="128">size = backlog</text>
      <line className="w plum" x1="730" y1="108" x2="790" y2="108" markerEnd="url(#dd-ah-plum)" />
      <text className="s" x="734" y="98">accept()</text>
      <rect className="n green" x="792" y="80" width="112" height="56" rx="2" />
      <text className="t" x="806" y="104">Node app</text>
      <text className="s" x="806" y="124">handles it</text>
      <text className="s" x="208" y="190">Full SYN queue: SYN flood (chapter 16).     Full accept queue: the app is not calling accept() fast enough.</text>
    </svg>
  );
}
