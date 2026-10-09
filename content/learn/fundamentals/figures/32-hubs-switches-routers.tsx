// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigHub() {
  return (
    <svg viewBox="0 0 920 230" role="img" aria-label="A hub copies a frame from PC A to every port; B, C and D all receive it; only C, the target, keeps it.">
      <rect className="n amber" x="390" y="90" width="140" height="50" rx="2" />
      <text className="t mid" x="460" y="120">Hub</text>
      <rect className="n plum" x="40" y="20" width="150" height="46" rx="2" />
      <text className="t" x="54" y="48">A · sender</text>
      <rect className="n" x="40" y="164" width="150" height="46" rx="2" />
      <text className="t" x="54" y="192">B · ignores it</text>
      <rect className="n green" x="730" y="20" width="150" height="46" rx="2" />
      <text className="t" x="744" y="48">C · target</text>
      <rect className="n" x="730" y="164" width="150" height="46" rx="2" />
      <text className="t" x="744" y="192">D · ignores it</text>
      <line className="w plum" x1="190" y1="43" x2="388" y2="104" markerEnd="url(#dd-ah-plum)" />
      <line className="w amber" x1="388" y1="126" x2="192" y2="186" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="532" y1="104" x2="728" y2="43" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="532" y1="126" x2="728" y2="186" markerEnd="url(#dd-ah-amber)" />
      <text className="s mid" x="460" y="170">copied to every port</text>
    </svg>
  );
}

export function FigBdomain() {
  return (
    <svg viewBox="0 0 920 250" role="img" aria-label="The office router separates two broadcast domains: the staff network with its switch and devices, and the warehouse network. An ARP broadcast from the front desk PC stays inside the staff domain.">
      <rect className="zone" x="16" y="16" width="380" height="220" rx="2" />
      <text className="s" x="30" y="38">broadcast domain 1 · staff 172.16.1.0/24</text>
      <rect className="zone" x="524" y="16" width="380" height="220" rx="2" />
      <text className="s" x="538" y="38">broadcast domain 2 · warehouse 172.16.2.0/24</text>
      <rect className="n teal" x="400" y="100" width="120" height="56" rx="2" />
      <text className="t mid" x="460" y="124">Router</text>
      <text className="s mid" x="460" y="144">the wall</text>
      <rect className="n" x="150" y="62" width="110" height="40" rx="2" />
      <text className="t mid" x="205" y="87">Switch</text>
      <rect className="n plum" x="30" y="170" width="110" height="46" rx="2" />
      <text className="s" x="42" y="191">Front desk</text>
      <text className="s" x="42" y="207">sends ARP</text>
      <rect className="n" x="150" y="170" width="110" height="46" rx="2" />
      <text className="s" x="162" y="198">Printer</text>
      <rect className="n" x="270" y="170" width="110" height="46" rx="2" />
      <text className="s" x="282" y="198">Laptop</text>
      <line className="w" x1="85" y1="168" x2="190" y2="104" />
      <line className="w" x1="205" y1="168" x2="205" y2="104" />
      <line className="w" x1="325" y1="168" x2="220" y2="104" />
      <line className="w" x1="260" y1="82" x2="398" y2="118" />
      <rect className="n" x="660" y="62" width="110" height="40" rx="2" />
      <text className="t mid" x="715" y="87">Switch</text>
      <rect className="n" x="540" y="170" width="110" height="46" rx="2" />
      <text className="s" x="552" y="198">Scanner</text>
      <rect className="n" x="660" y="170" width="110" height="46" rx="2" />
      <text className="s" x="672" y="198">Packing PC</text>
      <rect className="n" x="780" y="170" width="110" height="46" rx="2" />
      <text className="s" x="792" y="198">Label printer</text>
      <line className="w" x1="595" y1="168" x2="700" y2="104" />
      <line className="w" x1="715" y1="168" x2="715" y2="104" />
      <line className="w" x1="835" y1="168" x2="730" y2="104" />
      <line className="w" x1="522" y1="118" x2="660" y2="82" />
      <text className="s" x="30" y="150">ARP broadcast reaches every staff device…</text>
      <text className="s" x="400" y="186">…and stops here ✕</text>
    </svg>
  );
}
