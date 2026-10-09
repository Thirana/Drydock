// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigRepeat() {
  return (
    <svg viewBox="0 0 920 260" role="img" aria-label="Two separate homes both use 192.168.1.23 for a laptop, with different MACs; on the internet they appear as different public IPs.">
      <rect className="zone" x="16" y="20" width="300" height="220" rx="2" />
      <text className="s" x="32" y="42">your home · 192.168.1.0/24</text>
      <rect className="n plum" x="32" y="60" width="268" height="72" rx="2" />
      <text className="t" x="48" y="86">Your laptop</text>
      <text className="s" x="48" y="106">
        {"IP  "}
        <tspan className="l">192.168.1.23</tspan>
      </text>
      <text className="s" x="48" y="124">MAC a4:83:e7:2b:91:0c</text>
      <rect className="n teal" x="32" y="160" width="268" height="56" rx="2" />
      <text className="t" x="48" y="184">Home router</text>
      <text className="s" x="48" y="203">public 203.0.113.45</text>
      <rect className="zone" x="604" y="20" width="300" height="220" rx="2" />
      <text className="s" x="620" y="42">{"staff member's home · 192.168.1.0/24"}</text>
      <rect className="n plum" x="620" y="60" width="268" height="72" rx="2" />
      <text className="t" x="636" y="86">Their laptop</text>
      <text className="s" x="636" y="106">
        {"IP  "}
        <tspan className="l">192.168.1.23</tspan>
        {"  same, fine"}
      </text>
      <text className="s" x="636" y="124">MAC 70:3a:cb:04:e1:9f  different</text>
      <rect className="n teal" x="620" y="160" width="268" height="56" rx="2" />
      <text className="t" x="636" y="184">Their router</text>
      <text className="s" x="636" y="203">public 203.0.113.88</text>
      <rect className="zone" x="360" y="150" width="200" height="76" rx="2" />
      <text className="t mid" x="460" y="182">Internet</text>
      <text className="s mid" x="460" y="204">sees only the public IPs</text>
      <line className="w green" x1="300" y1="188" x2="358" y2="188" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="620" y1="188" x2="562" y2="188" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="460" y="80">private IPs repeat freely</text>
      <text className="s mid" x="460" y="98">because these networks never mix</text>
    </svg>
  );
}
