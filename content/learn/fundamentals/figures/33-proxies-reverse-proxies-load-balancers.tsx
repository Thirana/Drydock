// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigTwo() {
  return (
    <svg viewBox="0 0 920 200" role="img" aria-label="The laptop has TCP connection 1 with the proxy. The proxy has a separate TCP connection 2 with kade-api. kade-api sees the proxy's IP as the client.">
      <rect className="n plum" x="16" y="70" width="170" height="60" rx="2" />
      <text className="t mid" x="101" y="96">Laptop</text>
      <text className="s mid" x="101" y="116">203.0.113.45 (after NAT)</text>
      <rect className="n teal" x="375" y="62" width="170" height="76" rx="2" />
      <text className="t mid" x="460" y="92">Proxy</text>
      <text className="s mid" x="460" y="112">copies data between</text>
      <text className="s mid" x="460" y="128">its two connections</text>
      <rect className="n amber" x="734" y="70" width="170" height="60" rx="2" />
      <text className="t mid" x="819" y="96">kade-api</text>
      <text className="s mid" x="819" y="116">10.10.1.11</text>
      <line className="w plum" x1="188" y1="100" x2="372" y2="100" markerEnd="url(#dd-ah-plum)" />
      <line className="w amber" x1="547" y1="100" x2="731" y2="100" markerEnd="url(#dd-ah-amber)" />
      <text className="s mid" x="280" y="88">connection 1</text>
      <text className="s mid" x="280" y="124">own handshake, own TLS,</text>
      <text className="s mid" x="280" y="140">own timeouts</text>
      <text className="s mid" x="640" y="88">connection 2</text>
      <text className="s mid" x="640" y="124">{"source IP = the proxy's"}</text>
      <text className="s mid" x="640" y="140">can be reused by many clients</text>
      <text className="s mid" x="460" y="182">Two 4-tuples (chapter 31), two sets of TCP state (chapter 16), two sets of idle timeouts (chapter 21).</text>
    </svg>
  );
}

export function FigFwd() {
  return (
    <svg viewBox="0 0 920 250" role="img" aria-label="Left: a forward proxy inside the office acts for office clients reaching internet sites. Right: a reverse proxy inside Kadé's network acts for Kadé's servers, receiving shoppers' requests.">
      <rect className="zone" x="10" y="16" width="275" height="220" rx="2" />
      <text className="s" x="24" y="36">{"Office: the clients' side"}</text>
      <rect className="n" x="24" y="56" width="110" height="44" rx="2" />
      <text className="s mid" x="79" y="83">Front desk PC</text>
      <rect className="n" x="24" y="160" width="110" height="44" rx="2" />
      <text className="s mid" x="79" y="187">Staff laptop</text>
      <rect className="n teal" x="160" y="100" width="112" height="60" rx="2" />
      <text className="t mid" x="216" y="126" style={{"fontSize": "12.5px"}}>Forward</text>
      <text className="t mid" x="216" y="145" style={{"fontSize": "12.5px"}}>proxy</text>
      <line className="w" x1="134" y1="80" x2="158" y2="116" markerEnd="url(#dd-ah-muted)" />
      <line className="w" x1="134" y1="180" x2="158" y2="146" markerEnd="url(#dd-ah-muted)" />
      <rect className="n" x="330" y="56" width="110" height="44" rx="2" />
      <text className="s mid" x="385" y="83">google.com</text>
      <rect className="n" x="330" y="160" width="110" height="44" rx="2" />
      <text className="s mid" x="385" y="187">other sites</text>
      <line className="w teal" x1="272" y1="116" x2="328" y2="84" markerEnd="url(#dd-ah-teal)" />
      <line className="w teal" x1="272" y1="146" x2="328" y2="178" markerEnd="url(#dd-ah-teal)" />
      <line className="w dash" x1="460" y1="20" x2="460" y2="232" />
      <rect className="n" x="480" y="56" width="110" height="44" rx="2" />
      <text className="s mid" x="535" y="83">Shopper 1</text>
      <rect className="n" x="480" y="160" width="110" height="44" rx="2" />
      <text className="s mid" x="535" y="187">Shopper 2</text>
      <rect className="zone" x="620" y="16" width="290" height="220" rx="2" />
      <text className="s" x="634" y="36">{"Kadé: the servers' side"}</text>
      <rect className="n teal" x="636" y="100" width="112" height="60" rx="2" />
      <text className="t mid" x="692" y="126" style={{"fontSize": "12.5px"}}>Reverse</text>
      <text className="t mid" x="692" y="145" style={{"fontSize": "12.5px"}}>proxy</text>
      <line className="w" x1="590" y1="80" x2="634" y2="116" markerEnd="url(#dd-ah-muted)" />
      <line className="w" x1="590" y1="180" x2="634" y2="146" markerEnd="url(#dd-ah-muted)" />
      <rect className="n amber" x="784" y="56" width="112" height="44" rx="2" />
      <text className="s mid" x="840" y="83">kade-api-1</text>
      <rect className="n amber" x="784" y="160" width="112" height="44" rx="2" />
      <text className="s mid" x="840" y="187">kade-api-2</text>
      <line className="w teal" x1="748" y1="116" x2="782" y2="84" markerEnd="url(#dd-ah-teal)" />
      <line className="w teal" x1="748" y1="146" x2="782" y2="178" markerEnd="url(#dd-ah-teal)" />
    </svg>
  );
}

export function FigLb() {
  return (
    <svg viewBox="0 0 920 330" role="img" aria-label="Shoppers reach the Google front end load balancer at 34.120.88.10 over HTTPS. It forwards HTTP on port 8080 to kade-api-1 and kade-api-2 in kade-vpc. Health checks from Google ranges probe both. Both VMs use kade-db and send outgoing traffic through Cloud NAT.">
      <text className="s" x="16" y="104">api.kade.lk → 34.120.88.10</text>
      <rect className="n plum" x="16" y="120" width="160" height="70" rx="2" />
      <text className="t mid" x="96" y="150">Shoppers</text>
      <text className="s mid" x="96" y="170">browser · mobile app</text>
      <rect className="n teal" x="230" y="64" width="236" height="182" rx="2" />
      <text className="t" x="246" y="92">Google front end</text>
      <text className="s" x="246" y="116">External Application LB</text>
      <text className="s" x="246" y="136">34.120.88.10 · anycast</text>
      <text className="s" x="246" y="156">TLS ends here (managed cert)</text>
      <text className="s" x="246" y="176">Cloud Armor · URL map</text>
      <text className="s" x="246" y="196">adds X-Forwarded-For</text>
      <text className="s" x="246" y="216">keeps a pool of connections</text>
      <text className="s" x="246" y="234">to the backends</text>
      <line className="w plum" x1="176" y1="155" x2="228" y2="155" markerEnd="url(#dd-ah-plum)" />
      <text className="s mid" x="202" y="146">:443</text>
      <rect className="zone" x="500" y="16" width="404" height="300" rx="2" />
      <text className="s" x="514" y="36">kade-vpc · asia-southeast1</text>
      <text className="s" x="514" y="60">instance group in sn-app</text>
      <rect className="n amber" x="514" y="72" width="170" height="56" rx="2" />
      <text className="t mid" x="599" y="96" style={{"fontSize": "13px"}}>kade-api-1</text>
      <text className="s mid" x="599" y="116">10.10.1.10:8080</text>
      <rect className="n amber" x="514" y="146" width="170" height="56" rx="2" />
      <text className="t mid" x="599" y="170" style={{"fontSize": "13px"}}>kade-api-2</text>
      <text className="s mid" x="599" y="190">10.10.1.11:8080</text>
      <line className="w amber" x1="466" y1="125" x2="512" y2="102" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber" x1="466" y1="170" x2="512" y2="174" markerEnd="url(#dd-ah-amber)" />
      <rect className="n" x="738" y="46" width="152" height="76" rx="2" />
      <text className="s mid" x="814" y="70">Health checks</text>
      <text className="s mid" x="814" y="90">35.191.0.0/16</text>
      <text className="s mid" x="814" y="108">130.211.0.0/22</text>
      <line className="w dash" x1="738" y1="84" x2="686" y2="96" markerEnd="url(#dd-ah-muted)" />
      <line className="w dash" x1="760" y1="122" x2="686" y2="166" markerEnd="url(#dd-ah-muted)" />
      <rect className="n green" x="738" y="160" width="152" height="56" rx="2" />
      <text className="t mid" x="814" y="184" style={{"fontSize": "13px"}}>kade-db</text>
      <text className="s mid" x="814" y="204">10.10.2.5:5432</text>
      <line className="w green" x1="684" y1="120" x2="736" y2="176" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="684" y1="180" x2="736" y2="188" markerEnd="url(#dd-ah-green)" />
      <rect className="n" x="514" y="240" width="170" height="56" rx="2" />
      <text className="s mid" x="599" y="264">Cloud NAT</text>
      <text className="s mid" x="599" y="282">→ PayGate (outgoing)</text>
      <line className="w" x1="599" y1="202" x2="599" y2="238" markerEnd="url(#dd-ah-muted)" />
      <text className="s" x="16" y="296">Before: api.kade.lk → 34.87.120.15, one VM.</text>
      <text className="s" x="16" y="314">Now: no VM has a public IP at all.</text>
    </svg>
  );
}
