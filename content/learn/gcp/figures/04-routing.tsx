// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigOneTable() {
  return (
    <svg viewBox="0 0 960 290" role="img" aria-label="kade-vpc has one route table. Routes without tags apply to every VM. A route tagged via-proxy applies only to VMs that carry the via-proxy tag. kade-worker has the tag and sees three routes; kade-api-1 and kade-db see only the untagged routes.">
      <rect className="zone teal" x="16" y="12" width="500" height="266" rx="2" />
      <text className="s" x="32" y="34">kade-vpc route table (one for the whole VPC)</text>
      <rect className="n teal" x="32" y="48" width="468" height="44" rx="2" />
      <text className="s" x="46" y="75">10.10.1.0/24  →  sn-app       subnet route · no tags</text>
      <rect className="n teal" x="32" y="100" width="468" height="44" rx="2" />
      <text className="s" x="46" y="127">10.10.2.0/24  →  sn-data      subnet route · no tags</text>
      <rect className="n teal" x="32" y="152" width="468" height="44" rx="2" />
      <text className="s" x="46" y="179">0.0.0.0/0  →  internet gateway   prio 1000 · no tags</text>
      <rect className="n amber" x="32" y="204" width="468" height="56" rx="2" />
      <text className="s" x="46" y="228">0.0.0.0/0  →  kade-proxy (VM)   prio 900</text>
      <text className="s" x="46" y="247">tags: via-proxy</text>
      <rect className="n teal" x="620" y="30" width="324" height="64" rx="2" />
      <text className="t" x="636" y="56">kade-api-1</text>
      <text className="s" x="636" y="76">tags: api · sees 3 routes</text>
      <rect className="n green" x="620" y="112" width="324" height="64" rx="2" />
      <text className="t" x="636" y="138">kade-db</text>
      <text className="s" x="636" y="158">no tags · sees 3 routes</text>
      <rect className="n amber" x="620" y="194" width="324" height="72" rx="2" />
      <text className="t" x="636" y="220">kade-worker</text>
      <text className="s" x="636" y="240">tags: via-proxy</text>
      <text className="s" x="636" y="258">sees all 4 routes</text>
      <line className="w dash" x1="500" y1="120" x2="617" y2="62" markerEnd="url(#dd-ah-muted)" />
      <line className="w dash" x1="500" y1="130" x2="617" y2="144" markerEnd="url(#dd-ah-muted)" />
      <line className="w dash" x1="500" y1="140" x2="617" y2="222" markerEnd="url(#dd-ah-muted)" />
      <line className="w amber" x1="500" y1="232" x2="617" y2="236" markerEnd="url(#dd-ah-amber)" />
      <text className="s" x="528" y="258">only</text>
      <text className="s" x="528" y="273">tagged VMs</text>
    </svg>
  );
}
