// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigQuestion() {
  return (
    <svg viewBox="0 0 920 290" role="img" aria-label="Decision: apply the mask to my IP and to the target; if the results match send directly, otherwise send to the gateway.">
      <rect className="n plum" x="20" y="110" width="190" height="70" rx="2" />
      <text className="t" x="36" y="138">Packet to send</text>
      <text className="s" x="36" y="160">to 34.87.120.15</text>
      <line className="w" x1="210" y1="145" x2="238" y2="145" markerEnd="url(#dd-ah-muted)" />
      <rect className="n" x="240" y="98" width="230" height="94" rx="2" />
      <text className="t" x="256" y="124">Apply the mask</text>
      <text className="s" x="256" y="148">my IP AND mask</text>
      <text className="s" x="256" y="168">target AND mask</text>
      <line className="w" x1="470" y1="145" x2="498" y2="145" markerEnd="url(#dd-ah-muted)" />
      <polygon className="n" points="590,92 680,145 590,198 500,145" />
      <text className="mid t" x="590" y="141">same</text>
      <text className="mid s" x="590" y="159">network?</text>
      <path className="w green" d="M590 92 V69 H738" markerEnd="url(#dd-ah-green)" />
      <text className="l" x="604" y="62">yes</text>
      <rect className="n green" x="740" y="26" width="170" height="86" rx="2" />
      <text className="t" x="756" y="52">Same network</text>
      <text className="s" x="756" y="74">send directly</text>
      <text className="s" x="756" y="94">ARP for the target</text>
      <path className="w amber" d="M590 198 V221 H738" markerEnd="url(#dd-ah-amber)" />
      <text className="l" x="604" y="242">no</text>
      <rect className="n amber" x="740" y="178" width="170" height="86" rx="2" />
      <text className="t" x="756" y="204">Different</text>
      <text className="s" x="756" y="226">send to the gateway</text>
      <text className="s" x="756" y="246">ARP for the router</text>
    </svg>
  );
}
