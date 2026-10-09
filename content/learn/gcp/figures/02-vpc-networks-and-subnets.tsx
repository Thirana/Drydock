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
      <line className="w teal" x1="332" y1="76" x2="443" y2="104" markerEnd="url(#dd-ah-teal)" />
      <line className="w teal" x1="332" y1="84" x2="443" y2="148" markerEnd="url(#dd-ah-teal)" />
      <line className="w" x1="332" y1="148" x2="443" y2="192" markerEnd="url(#dd-ah-muted)" />
    </svg>
  );
}
