// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigTree() {
  return (
    <svg viewBox="0 0 920 300" role="img" aria-label="DNS tree: root at the top, then TLDs .lk, .com, .org; under .lk the domain kade.lk; under kade.lk the names api, www and mail.">
      <rect className="n" x="380" y="10" width="160" height="50" rx="2" />
      <text className="t mid" x="460" y="33">Root ( . )</text>
      <text className="s mid" x="460" y="51">knows every TLD</text>
      <rect className="n amber" x="150" y="110" width="160" height="50" rx="2" />
      <text className="t mid" x="230" y="133">.lk</text>
      <text className="s mid" x="230" y="151">{"knows kade.lk's servers"}</text>
      <rect className="n" x="380" y="110" width="160" height="50" rx="2" />
      <text className="t mid" x="460" y="139">.com</text>
      <rect className="n" x="610" y="110" width="160" height="50" rx="2" />
      <text className="t mid" x="690" y="139">.org</text>
      <rect className="n green" x="130" y="210" width="200" height="50" rx="2" />
      <text className="t mid" x="230" y="233">kade.lk</text>
      <text className="s mid" x="230" y="251">the real records (authoritative)</text>
      <rect className="n" x="480" y="210" width="130" height="50" rx="2" />
      <text className="t mid" x="545" y="239">example.com</text>
      <line className="w" x1="440" y1="60" x2="250" y2="108" />
      <line className="w" x1="460" y1="60" x2="460" y2="108" />
      <line className="w" x1="480" y1="60" x2="670" y2="108" />
      <line className="w" x1="230" y1="160" x2="230" y2="208" />
      <line className="w" x1="470" y1="160" x2="530" y2="208" />
      <text className="s" x="350" y="222">api.kade.lk → 34.87.120.15</text>
      <text className="s" x="350" y="240">www.kade.lk → …</text>
      <text className="s" x="350" y="258">MX → mail servers (chapter 23)</text>
      <text className="s" x="16" y="290">{"Solid lines are delegations: each parent keeps only a pointer to the child zone's servers."}</text>
    </svg>
  );
}
