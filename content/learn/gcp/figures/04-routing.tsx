// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigOneTable() {
  return (
    <svg viewBox="0 0 960 290" role="img" aria-label="kade-vpc has one route table. Routes without tags apply to every VM. A route tagged via-proxy applies only to VMs that carry the via-proxy tag. kade-worker has the tag and sees three routes; kade-api-1 and kade-db see only the untagged routes.">
      <rect className="zone teal" x="16" y="12" width="500" height="266" rx="2" />
      <text className="s" x="32" y="34">kade-vpc route table (one for the whole VPC)</text>
      <rect className="n teal" x="32" y="48" width="452" height="44" rx="2" />
      <text className="s" x="46" y="75">10.10.1.0/24  →  sn-app       subnet route · no tags</text>
      <rect className="n teal" x="32" y="100" width="452" height="44" rx="2" />
      <text className="s" x="46" y="127">10.10.2.0/24  →  sn-data      subnet route · no tags</text>
      <rect className="n teal" x="32" y="152" width="452" height="44" rx="2" />
      <text className="s" x="46" y="179">0.0.0.0/0  →  internet gateway   prio 1000 · no tags</text>
      <rect className="n amber" x="32" y="204" width="452" height="56" rx="2" />
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
      {/* The three untagged rows, gathered by a bracket, reach every VM on one trunk. */}
      <path className="w dash" d="M484 70 H496 V174 H484" />
      <path className="w dash" d="M496 122 H560 V62 H617" markerEnd="url(#dd-ah-muted)" />
      <path className="w dash" d="M560 122 V144 H617" markerEnd="url(#dd-ah-muted)" />
      <path className="w dash" d="M560 144 V214 H617" markerEnd="url(#dd-ah-muted)" />
      <path className="w amber" d="M484 240 H617" markerEnd="url(#dd-ah-amber)" />
      <text className="s" x="528" y="258">only</text>
      <text className="s" x="528" y="273">tagged VMs</text>
    </svg>
  );
}

/** Left edge of each zone column, and where the control plane's line enters it. */
const GEO = [
  ["zone a", 32, 196],
  ["zone b", 240, 404],
  ["zone c", 448, 612],
  ["zone a", 700, 896],
] as const;

export function FigRouteGeo() {
  return (
    <svg viewBox="0 0 960 420" role="img" aria-label="The control plane copies kade-vpc's one route table to the data plane on every host, in zones a, b and c of asia-southeast1 and in asia-south1. The route 0.0.0.0/0 for VMs tagged via-proxy points to kade-proxy, one VM in zone a. A tagged VM in zone b sends to it across zones. A tagged VM in asia-south1 sends to it across regions, which is slower and billed per gigabyte.">
      <rect className="n plum" x="248" y="16" width="464" height="60" rx="2" />
      <text className="t" x="264" y="40">control plane · one route table</text>
      <text className="s" x="264" y="62">0.0.0.0/0 → kade-proxy · tag via-proxy</text>

      <rect className="zone plum" x="16" y="116" width="644" height="232" rx="2" />
      <text className="t" x="32" y="140">asia-southeast1</text>
      <rect className="zone plum" x="684" y="116" width="260" height="232" rx="2" />
      <text className="t" x="700" y="140">asia-south1</text>
      {GEO.map(([z, x], i) => (
        <g key={i}>
          <rect className="zone panel" x={x} y="152" width={i === 3 ? 228 : 196} height="180" rx="2" />
          <text className="s" x={x + 12} y="172">
            {z}
          </text>
          <rect className="n plum" x={x + 12} y="188" width={i === 3 ? 204 : 172} height="48" rx="2" />
          <text className="t" x={x + 24} y="208">
            data plane
          </text>
          <text className="s" x={x + 24} y="227">
            has the route
          </text>
        </g>
      ))}

      {/* One trunk from the control plane, split to every zone in every region (drawn over the zone panels). */}
      {GEO.map(([, , cx], i) => (
        <path key={i} className="w plum dash" d={`M480 76 V96 H${cx} V184`} markerEnd="url(#dd-ah-plum)" />
      ))}

      <rect className="n amber" x="44" y="252" width="172" height="52" rx="2" />
      <text className="t" x="56" y="274">kade-proxy</text>
      <text className="s" x="56" y="294">next hop · zonal</text>
      <rect className="n amber" x="252" y="252" width="172" height="52" rx="2" />
      <text className="t" x="264" y="274">tagged VM</text>
      <text className="s" x="264" y="294">via-proxy</text>
      <text className="f" x="460" y="282">no tagged VMs</text>
      <rect className="n amber" x="712" y="252" width="204" height="52" rx="2" />
      <text className="t" x="724" y="274">tagged VM</text>
      <text className="s" x="724" y="294">via-proxy</text>

      {/* Both tagged VMs send to the one next hop in zone a. */}
      <path className="w amber" d="M252 278 H219" markerEnd="url(#dd-ah-amber)" />
      <path className="w amber" d="M814 304 V372 H130 V307" markerEnd="url(#dd-ah-amber)" />
      <text className="s" x="474" y="398">across regions: slower, and billed per GB</text>
    </svg>
  );
}
