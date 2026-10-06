// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigKinds() {
  return (
    <svg viewBox="0 0 960 260" role="img" aria-label="Where each firewall layer attaches. A hierarchical policy on organization kade.lk and another on folder production. Inside, project kade-prod holds kade-vpc with its VPC firewall rules and a global network policy. Project kade-staging arrives later.">
      <rect className="zone plum" x="16" y="12" width="928" height="236" rx="2" />
      <text className="s" x="32" y="34">organization kade.lk</text>
      <rect className="n amber" x="700" y="22" width="228" height="40" rx="2" />
      <text className="s" x="714" y="47">hierarchical policy (org)</text>
      <rect className="zone" x="32" y="70" width="896" height="164" rx="2" />
      <text className="s" x="48" y="92">folder production</text>
      <rect className="n amber" x="684" y="76" width="228" height="40" rx="2" />
      <text className="s" x="698" y="101">hierarchical policy (folder)</text>
      <rect className="zone teal" x="48" y="124" width="560" height="96" rx="2" />
      <text className="s" x="62" y="144">project kade-prod · kade-vpc</text>
      <rect className="n amber" x="62" y="156" width="250" height="50" rx="2" />
      <text className="t" x="76" y="178">VPC firewall rules</text>
      <text className="s" x="76" y="196">chapter 5.1</text>
      <rect className="n amber" x="326" y="156" width="266" height="50" rx="2" />
      <text className="t" x="340" y="178">global network policy</text>
      <text className="s" x="340" y="196">kade-vpc-policy · when needed</text>
      <rect className="ghost" x="624" y="124" width="288" height="96" rx="2" />
      <text className="s" x="640" y="148">project kade-staging (ch 14)</text>
      <text className="s" x="640" y="172">gets both hierarchical</text>
      <text className="s" x="640" y="190">policies automatically</text>
    </svg>
  );
}
