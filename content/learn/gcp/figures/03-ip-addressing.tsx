// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigExternal() {
  return (
    <svg viewBox="0 0 960 300" role="img" aria-label="1:1 NAT for a VM external IP. Inbound, a packet to 34.87.120.15 reaches the host's data plane, which rewrites the destination to 10.10.1.10 before the VM sees it. Outbound, the VM sends from 10.10.1.10 and the data plane rewrites the source to 34.87.120.15. Inside the VM only 10.10.1.10 exists.">
      <text className="s" x="16" y="24">coming in</text>
      <rect className="n" x="16" y="36" width="190" height="56" rx="2" />
      <text className="t" x="30" y="60">Your laptop</text>
      <text className="s" x="30" y="79">203.0.113.45</text>
      <line className="w" x1="206" y1="64" x2="357" y2="64" markerEnd="url(#dd-ah-muted)" />
      <text className="s" x="220" y="54">dst 34.87.120.15</text>
      <rect className="n plum" x="360" y="36" width="250" height="176" rx="2" />
      <text className="t" x="376" y="60">data plane on the host</text>
      <text className="s" x="376" y="84">{"access config \"external-nat\""}</text>
      <text className="s" x="376" y="104">type ONE_TO_ONE_NAT</text>
      <text className="s" x="376" y="134">34.87.120.15 ⇄ 10.10.1.10</text>
      <text className="s" x="376" y="164">in: rewrite destination</text>
      <text className="s" x="376" y="184">out: rewrite source</text>
      <line className="w teal" x1="610" y1="64" x2="731" y2="64" markerEnd="url(#dd-ah-teal)" />
      <text className="s" x="622" y="54">dst 10.10.1.10</text>
      <rect className="n teal" x="734" y="36" width="210" height="176" rx="2" />
      <text className="t" x="750" y="60">kade-api-1 (guest)</text>
      <text className="s" x="750" y="88">$ ip addr</text>
      <text className="s" x="750" y="108">inet 10.10.1.10/32</text>
      <text className="s" x="750" y="140">34.87.120.15 is</text>
      <text className="s" x="750" y="158">nowhere in here</text>
      <text className="s" x="16" y="162">going out</text>
      <rect className="n" x="16" y="174" width="190" height="56" rx="2" />
      <text className="t" x="30" y="198">PayGate</text>
      <text className="s" x="30" y="217">sees 34.87.120.15</text>
      <line className="w green" x1="357" y1="188" x2="209" y2="188" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="222" y="178">src 34.87.120.15</text>
      <line className="w green" x1="731" y1="188" x2="613" y2="188" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="622" y="178">src 10.10.1.10</text>
      <text className="s" x="16" y="276">The VM always sends and receives with 10.10.1.10. The rewrite happens outside it, on the host.</text>
    </svg>
  );
}

export function FigTiers() {
  return (
    <svg viewBox="0 0 960 250" role="img" aria-label="Premium tier: a shopper in Colombo enters Google's network at the nearest edge and rides Google's backbone to asia-southeast1. Standard tier: the same shopper crosses the public internet, through several providers, and enters Google's network only near asia-southeast1.">
      <rect className="n" x="16" y="92" width="150" height="62" rx="2" />
      <text className="t" x="30" y="116">Shopper</text>
      <text className="s" x="30" y="136">Colombo</text>
      <rect className="n teal" x="794" y="92" width="150" height="62" rx="2" />
      <text className="t" x="808" y="116">asia-</text>
      <text className="t" x="808" y="136">southeast1</text>
      <text className="s" x="190" y="30">Premium tier (default)</text>
      <path className="w" d="M166 110 C 200 70, 220 60, 250 60" markerEnd="url(#dd-ah-muted)" />
      <rect className="n plum" x="252" y="42" width="164" height="36" rx="2" />
      <text className="s" x="264" y="65">nearest Google edge</text>
      <line className="w plum" x1="416" y1="60" x2="760" y2="60" />
      <path className="w plum" d="M760 60 C 780 60, 790 80, 800 90" markerEnd="url(#dd-ah-plum)" />
      <text className="s" x="450" y="50">{"Google's own backbone for most of the trip"}</text>
      <text className="s" x="190" y="232">Standard tier</text>
      <path className="w dash" d="M166 138 C 200 190, 230 196, 270 196" />
      <circle className="badge" cx="290" cy="196" r="10" />
      <circle className="badge" cx="380" cy="196" r="10" />
      <circle className="badge" cx="470" cy="196" r="10" />
      <circle className="badge" cx="560" cy="196" r="10" />
      <line className="w dash" x1="300" y1="196" x2="370" y2="196" />
      <line className="w dash" x1="390" y1="196" x2="460" y2="196" />
      <line className="w dash" x1="480" y1="196" x2="550" y2="196" />
      <line className="w dash" x1="570" y1="196" x2="640" y2="196" />
      <text className="s" x="300" y="222">{"public internet: other providers' routers"}</text>
      <rect className="n plum" x="640" y="178" width="118" height="36" rx="2" />
      <text className="s" x="652" y="201">Google edge</text>
      <path className="w plum" d="M758 196 C 780 196, 790 170, 806 157" markerEnd="url(#dd-ah-plum)" />
    </svg>
  );
}
