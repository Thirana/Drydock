// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigScope() {
  return (
    <svg viewBox="0 0 960 250" role="img" aria-label="Project kade-prod holds two VPC networks. kade-vpc has its own routes, firewall rules and subnets, with kade-db inside. The default network has its own routes and rules. A VM in default cannot reach kade-db because there is no route between the two networks.">
      <rect className="zone" x="16" y="12" width="928" height="226" rx="2" />
      <text className="s" x="32" y="34">project kade-prod</text>
      <rect className="zone teal" x="32" y="48" width="430" height="176" rx="2" />
      <text className="s" x="48" y="70">VPC kade-vpc (custom mode)</text>
      <text className="s" x="48" y="94">routes · firewall rules · subnets</text>
      <rect className="n teal" x="48" y="112" width="186" height="54" rx="2" />
      <text className="t" x="62" y="136">kade-api-1</text>
      <text className="s" x="62" y="155">10.10.1.10 · sn-app</text>
      <rect className="n green" x="248" y="112" width="200" height="54" rx="2" />
      <text className="t" x="262" y="136">kade-db</text>
      <text className="s" x="262" y="155">10.10.2.5 · sn-data</text>
      <text className="s" x="48" y="198">these two can reach each other (if the firewall allows)</text>
      <rect className="zone fault" x="498" y="48" width="430" height="176" rx="2" />
      <text className="s" x="514" y="70">VPC default (auto mode)</text>
      <text className="s" x="514" y="94">its own routes · its own firewall rules · its own subnets</text>
      <rect className="ghost" x="514" y="112" width="220" height="54" rx="2" />
      <text className="t" x="528" y="136">test-vm</text>
      <text className="s" x="528" y="155">10.148.0.2 (if someone made one)</text>
      <line className="w fault dash" x1="514" y1="139" x2="451" y2="139" markerEnd="url(#dd-ah-fault)" />
      <text className="x" x="481" y="130">✕</text>
      <text className="s" x="514" y="198">no route to 10.10.2.5: a different world</text>
    </svg>
  );
}

export function FigAlias() {
  return (
    <svg viewBox="0 0 960 250" role="img" aria-label="sn-app has a primary range 10.10.1.0/24 and a secondary range named apps-containers, 10.10.8.0/24. kade-api-1's network card holds its primary IP 10.10.1.10, an alias 10.10.1.100 from the primary range, and an alias block 10.10.8.0/28 from the secondary range.">
      <rect className="zone teal" x="16" y="12" width="928" height="226" rx="2" />
      <text className="s" x="32" y="34">subnet sn-app</text>
      <rect className="n teal" x="32" y="48" width="300" height="56" rx="2" />
      <text className="t" x="46" y="72">primary range</text>
      <text className="s" x="46" y="92">10.10.1.0/24 · loses 4 addresses</text>
      <rect className="n" x="32" y="120" width="300" height="56" rx="2" />
      <text className="t" x="46" y="144">{"secondary range \"apps-containers\""}</text>
      <text className="s" x="46" y="164">10.10.8.0/24 · all 256 usable</text>
      <text className="s" x="32" y="208">{"example only; not part of Kadé's plan"}</text>
      <rect className="n" x="430" y="48" width="498" height="176" rx="2" />
      <text className="t" x="446" y="72">kade-api-1 · network card nic0</text>
      <rect className="n teal" x="446" y="86" width="466" height="36" rx="2" />
      <text className="s" x="460" y="109">primary IP        10.10.1.10     from the primary range</text>
      <rect className="n teal" x="446" y="130" width="466" height="36" rx="2" />
      <text className="s" x="460" y="153">alias IP          10.10.1.100/32 from the primary range</text>
      <rect className="n" x="446" y="174" width="466" height="36" rx="2" />
      <text className="s" x="460" y="197">{"alias IP range    10.10.8.0/28   from \"apps-containers\""}</text>
      {/* The primary range feeds two rows from one trunk; the secondary range feeds the third. */}
      <path className="w teal" d="M332 76 H380 V148 H443" markerEnd="url(#dd-ah-teal)" />
      <path className="w teal" d="M380 104 H443" markerEnd="url(#dd-ah-teal)" />
      <path className="w" d="M332 164 H404 V192 H443" markerEnd="url(#dd-ah-muted)" />
    </svg>
  );
}

/** Zone columns inside one region, shared by both rows of FigMap. */
const MAP_ZONES = [
  ["a", 0],
  ["b", 208],
  ["c", 416],
] as const;

export function FigMap() {
  return (
    <svg viewBox="0 0 960 548" role="img" aria-label="The same two web servers in AWS and in GCP. AWS: a VPC lives in one region, and each subnet lives in one zone, so kade-api-1 in zone a and kade-api-2 in zone b need two subnets, a third zone needs a third subnet, and a second region needs a second VPC joined by peering. GCP: kade-vpc is global. Its subnet sn-app belongs to region asia-southeast1 and stretches across zones a, b and c, so both servers share it. A second region, asia-south1, only needs a new subnet in the same kade-vpc.">
      {/* AWS: the VPC is the region; a subnet is one zone. */}
      <text className="t" x="16" y="30">AWS: a VPC is regional, a subnet is zonal</text>
      <rect className="zone teal" x="16" y="46" width="664" height="214" rx="2" />
      <text className="s" x="32" y="70">VPC · one region, Singapore</text>
      {MAP_ZONES.map(([z, dx]) => (
        <g key={z}>
          <rect className="zone panel" x={32 + dx} y="84" width="200" height="160" rx="2" />
          <text className="s" x={46 + dx} y="106">
            AZ {z}
          </text>
        </g>
      ))}
      <rect className="zone teal" x="40" y="118" width="184" height="116" rx="2" />
      <text className="s" x="52" y="140">subnet 10.10.1.0/24</text>
      <rect className="n teal" x="52" y="154" width="160" height="40" rx="2" />
      <text className="t" x="64" y="179">kade-api-1</text>
      <text className="f" x="52" y="220">this zone only</text>
      <rect className="zone teal" x="248" y="118" width="184" height="116" rx="2" />
      <text className="s" x="260" y="140">subnet 10.10.3.0/24</text>
      <rect className="n teal" x="260" y="154" width="160" height="40" rx="2" />
      <text className="t" x="272" y="179">kade-api-2</text>
      <text className="f" x="260" y="220">this zone only</text>
      <rect className="ghost" x="456" y="118" width="184" height="116" rx="2" />
      <text className="f" x="468" y="168">a VM here needs</text>
      <text className="f" x="468" y="188">a third subnet</text>
      <rect className="ghost" x="704" y="46" width="240" height="214" rx="2" />
      <text className="t" x="720" y="72">Mumbai</text>
      <text className="s" x="720" y="104">a second region needs</text>
      <text className="s" x="720" y="124">a second VPC, joined</text>
      <text className="s" x="720" y="144">by peering or a</text>
      <text className="s" x="720" y="164">transit gateway</text>

      {/* GCP: the VPC spans regions; a subnet spans the zones of its region. */}
      <text className="t" x="16" y="314">GCP: kade-vpc is global, a subnet is regional</text>
      <rect className="zone teal" x="16" y="330" width="928" height="202" rx="2" />
      <text className="s" x="32" y="354">kade-vpc · global, one network for every region</text>
      <rect className="zone plum" x="32" y="366" width="640" height="152" rx="2" />
      <text className="s" x="48" y="388">region asia-southeast1 · Singapore</text>
      {MAP_ZONES.map(([z, dx]) => (
        <g key={z}>
          <rect className="zone panel" x={48 + dx} y="398" width="192" height="108" rx="2" />
          <text className="s" x={60 + dx} y="418">
            zone {z}
          </text>
        </g>
      ))}
      {/* One band across all three zones: the subnet belongs to the region. */}
      <rect className="zone teal" x="40" y="428" width="624" height="68" rx="2" />
      <rect className="n teal" x="60" y="442" width="172" height="40" rx="2" />
      <text className="t" x="72" y="467">kade-api-1</text>
      <rect className="n teal" x="268" y="442" width="172" height="40" rx="2" />
      <text className="t" x="280" y="467">kade-api-2</text>
      <text className="s" x="476" y="454">sn-app 10.10.1.0/24</text>
      <text className="f" x="476" y="474">every zone in the region</text>
      <rect className="ghost" x="688" y="366" width="240" height="152" rx="2" />
      <text className="t" x="704" y="392">asia-south1 · Mumbai</text>
      <text className="s" x="704" y="424">a second region needs</text>
      <text className="s" x="704" y="444">only a new subnet in</text>
      <text className="s" x="704" y="464">the same kade-vpc</text>
    </svg>
  );
}
