// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigChain() {
  return (
    <svg viewBox="0 0 920 250" role="img" aria-label="Chain of trust: root CA in the trust store signs an intermediate CA, which signs api.kade.lk's certificate; the server sends the leaf and intermediate.">
      <rect className="n" x="20" y="30" width="250" height="84" rx="2" />
      <text className="t" x="36" y="56">Root CA</text>
      <text className="s" x="36" y="78">self-signed, kept offline</text>
      <text className="s" x="36" y="98">already in your trust store</text>
      <rect className="n green" x="335" y="30" width="250" height="84" rx="2" />
      <text className="t" x="351" y="56">Intermediate CA</text>
      <text className="s" x="351" y="78">signed by the root</text>
      <text className="s" x="351" y="98">sent by the server</text>
      <rect className="n plum" x="650" y="30" width="250" height="84" rx="2" />
      <text className="t" x="666" y="56">api.kade.lk (leaf)</text>
      <text className="s" x="666" y="78">signed by the intermediate</text>
      <text className="s" x="666" y="98">sent by the server</text>
      <line className="w green" x1="270" y1="72" x2="333" y2="72" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="276" y="64">signs</text>
      <line className="w green" x1="585" y1="72" x2="648" y2="72" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="591" y="64">signs</text>
      <text className="s" x="20" y="150">The client checks from the bottom up:</text>
      <text className="s" x="20" y="172">{"1 · the leaf's signature verifies with the intermediate's public key"}</text>
      <text className="s" x="20" y="192">{"2 · the intermediate's signature verifies with the root's public key"}</text>
      <text className="s" x="20" y="212">3 · the root is in the trust store  ·  plus: names match, dates valid, not revoked, allowed usage</text>
      <text className="s" x="20" y="236">{"An attacker can make a certificate that says \"api.kade.lk\", but no trusted CA will sign it for them."}</text>
    </svg>
  );
}
