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
      <path className="w plum" d="M190 43 H290 V104 H388" markerEnd="url(#dd-ah-plum)" />
      <path className="w amber" d="M390 126 H290 V187 H192" markerEnd="url(#dd-ah-amber)" />
      <path className="w amber" d="M530 104 H630 V43 H728" markerEnd="url(#dd-ah-amber)" />
      <path className="w amber" d="M530 126 H630 V187 H728" markerEnd="url(#dd-ah-amber)" />
      <text className="s mid" x="460" y="170">copied to every port</text>
    </svg>
  );
}

export function FigBdomain() {
  return (
    <svg viewBox="0 0 920 270" role="img" aria-label="The office router separates two broadcast domains: the staff network with its switch and devices, and the warehouse network. An ARP broadcast from the front desk PC stays inside the staff domain.">
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
      <path className="w" d="M205 102 V124 H85 V170" />
      <path className="w" d="M205 102 V170" />
      <path className="w" d="M205 102 V124 H325 V170" />
      <path className="w" d="M260 82 H440 V100" />
      <rect className="n" x="660" y="62" width="110" height="40" rx="2" />
      <text className="t mid" x="715" y="87">Switch</text>
      <rect className="n" x="540" y="170" width="110" height="46" rx="2" />
      <text className="s" x="552" y="198">Scanner</text>
      <rect className="n" x="660" y="170" width="110" height="46" rx="2" />
      <text className="s" x="672" y="198">Packing PC</text>
      <rect className="n" x="780" y="170" width="110" height="46" rx="2" />
      <text className="s" x="792" y="198">Label printer</text>
      <path className="w" d="M715 102 V124 H595 V170" />
      <path className="w" d="M715 102 V170" />
      <path className="w" d="M715 102 V124 H835 V170" />
      <path className="w" d="M660 82 H480 V100" />
      <text className="s" x="30" y="260">ARP broadcast reaches every staff device…</text>
      <text className="s" x="400" y="260">…and stops here at the router ✕</text>
    </svg>
  );
}
