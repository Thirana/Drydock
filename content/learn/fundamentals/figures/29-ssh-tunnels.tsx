// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigGcp() {
  return (
    <svg viewBox="0 0 920 230" role="img" aria-label="Your laptop connects over HTTPS to Google's Identity-Aware Proxy, which checks your identity and IAM permission, then connects from 35.235.240.0/20 to kade-db's internal IP on port 22. kade-db has no external IP.">
      <rect className="n plum" x="16" y="80" width="170" height="64" rx="2" />
      <text className="t" x="30" y="106">Your laptop</text>
      <text className="s" x="30" y="126">gcloud compute ssh</text>
      <rect className="n teal" x="300" y="64" width="250" height="96" rx="2" />
      <text className="t" x="316" y="90">Identity-Aware Proxy (IAP)</text>
      <text className="s" x="316" y="112">checks your Google login</text>
      <text className="s" x="316" y="130">and your IAM role</text>
      <rect className="zone" x="680" y="20" width="224" height="190" rx="2" />
      <text className="s" x="694" y="42">kade-vpc · no external IPs</text>
      <rect className="n green" x="700" y="80" width="190" height="64" rx="2" />
      <text className="t" x="716" y="106">kade-db</text>
      <text className="s" x="716" y="126">10.10.2.5 : 22</text>
      <line className="w plum" x1="186" y1="112" x2="298" y2="112" markerEnd="url(#dd-ah-plum)" />
      <text className="s" x="194" y="102">HTTPS (443)</text>
      <line className="w green" x1="550" y1="112" x2="698" y2="112" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="556" y="102">from 35.235.240.0/20</text>
      <text className="s" x="694" y="170">firewall: allow tcp:22</text>
      <text className="s" x="694" y="188">only from 35.235.240.0/20</text>
      <text className="s" x="694" y="204">{"(IAP's range)"}</text>
    </svg>
  );
}
