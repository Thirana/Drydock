// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigWhat() {
  return (
    <svg viewBox="0 0 960 250" role="img" aria-label="IAP TCP forwarding. Your laptop connects over HTTPS port 443 to IAP. IAP checks your Google identity and IAM role. If allowed, IAP opens a TCP connection from 35.235.240.0/20 to kade-db port 22. kade-db has no external IP, and the firewall allows port 22 only from IAP's range.">
      <rect className="n" x="16" y="80" width="190" height="80" rx="2" />
      <text className="t" x="30" y="106">Your laptop</text>
      <text className="s" x="30" y="128">gcloud, logged in</text>
      <text className="s" x="30" y="146">as you@kade.lk</text>
      <line className="w" x1="206" y1="120" x2="283" y2="120" markerEnd="url(#dd-ah-muted)" />
      <text className="s mid" x="245" y="110">HTTPS :443</text>
      <rect className="n plum" x="286" y="40" width="300" height="160" rx="2" />
      <text className="t" x="302" y="66">IAP (Google)</text>
      <text className="s" x="302" y="92">1. who are you? (Google login)</text>
      <text className="s" x="302" y="114">2. may you tunnel to this VM</text>
      <text className="s" x="302" y="132">   on this port? (IAM)</text>
      <text className="s" x="302" y="160">3. if yes: open TCP to the VM</text>
      <text className="s" x="302" y="182">   from 35.235.240.0/20</text>
      <line className="w green" x1="586" y1="120" x2="663" y2="120" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="625" y="110">tcp:22</text>
      <rect className="n amber" x="666" y="80" width="120" height="80" rx="2" />
      <text className="t" x="678" y="106">firewall</text>
      <text className="s" x="678" y="128">22 only from</text>
      <text className="s" x="678" y="146">35.235.240.0/20</text>
      <line className="w green" x1="786" y1="120" x2="811" y2="120" markerEnd="url(#dd-ah-green)" />
      <rect className="n green" x="814" y="80" width="130" height="80" rx="2" />
      <text className="t" x="826" y="106">kade-db</text>
      <text className="s" x="826" y="128">10.10.2.5</text>
      <text className="s" x="826" y="146">no external IP</text>
      <text className="s" x="16" y="232">{"Your laptop only needs outbound HTTPS. The VM never sees your IP; it sees a connection from IAP's range."}</text>
    </svg>
  );
}
