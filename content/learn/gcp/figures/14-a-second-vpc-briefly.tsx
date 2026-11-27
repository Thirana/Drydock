// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigNeed() {
  return (
    <svg viewBox="0 0 960 250" role="img" aria-label="Two separate projects. kade-prod with kade-vpc 10.10.0.0/16, Cloud Run kade-api, Cloud SQL kade-sql and Cloud NAT. kade-staging with staging-vpc 10.20.0.0/16, its own Cloud Run, its own small Cloud SQL and Cloud NAT. No connection between them.">
      <rect className="zone" x="16" y="12" width="440" height="226" rx="2" />
      <text className="s" x="32" y="34">project kade-prod</text>
      <rect className="zone teal" x="32" y="46" width="408" height="176" rx="2" />
      <text className="s" x="46" y="66">kade-vpc · plan 10.10.0.0/16</text>
      <rect className="n teal" x="46" y="80" width="180" height="56" rx="2" />
      <text className="t" x="58" y="104" style={{"fontSize": "14.5px"}}>Cloud Run kade-api</text>
      <text className="s" x="58" y="124" style={{"fontSize": "12.5px"}}>via sn-run</text>
      <rect className="n green" x="244" y="80" width="180" height="56" rx="2" />
      <text className="t" x="256" y="104" style={{"fontSize": "14.5px"}}>Cloud SQL kade-sql</text>
      <text className="s" x="256" y="124" style={{"fontSize": "12.5px"}}>10.10.32.3</text>
      <rect className="n teal" x="46" y="150" width="378" height="56" rx="2" />
      <text className="t" x="58" y="174" style={{"fontSize": "14.5px"}}>Cloud NAT · 34.87.200.7</text>
      <text className="s" x="58" y="194" style={{"fontSize": "12.5px"}}>{"on PayGate's live allow-list"}</text>
      <rect className="zone" x="504" y="12" width="440" height="226" rx="2" />
      <text className="s" x="520" y="34">project kade-staging</text>
      <rect className="zone teal" x="520" y="46" width="408" height="176" rx="2" />
      <text className="s" x="534" y="66">staging-vpc · plan 10.20.0.0/16</text>
      <rect className="n teal" x="534" y="80" width="180" height="56" rx="2" />
      <text className="t" x="546" y="104" style={{"fontSize": "14.5px"}}>Cloud Run kade-api</text>
      <text className="s" x="546" y="124" style={{"fontSize": "12.5px"}}>staging build</text>
      <rect className="n green" x="732" y="80" width="180" height="56" rx="2" />
      <text className="t" x="744" y="104" style={{"fontSize": "14.5px"}}>Cloud SQL (small)</text>
      <text className="s" x="744" y="124" style={{"fontSize": "12.5px"}}>test data only</text>
      <rect className="n teal" x="534" y="150" width="378" height="56" rx="2" />
      <text className="t" x="546" y="174" style={{"fontSize": "14.5px"}}>Cloud NAT · its own IP</text>
      <text className="s" x="546" y="194" style={{"fontSize": "12.5px"}}>{"on PayGate's sandbox allow-list"}</text>
      <text className="x" x="480" y="134">✕</text>
      <text className="s mid" x="480" y="160" style={{"fontSize": "12.5px"}}>no</text>
      <text className="s mid" x="480" y="176" style={{"fontSize": "12.5px"}}>link</text>
    </svg>
  );
}
