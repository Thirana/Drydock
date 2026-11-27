// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigZones() {
  return (
    <svg viewBox="0 0 960 250" role="img" aria-label="Public zone kade.lk answers anyone on the internet with 34.120.88.10 for api.kade.lk. Private zone kade.internal answers only VMs in kade-vpc, with 10.10.2.5 for db.kade.internal. From the internet, db.kade.internal does not exist.">
      <rect className="n" x="16" y="30" width="190" height="60" rx="2" />
      <text className="t" x="30" y="56">{"Shopper's phone"}</text>
      <text className="s" x="30" y="76">anywhere on the internet</text>
      <rect className="n plum" x="330" y="20" width="300" height="80" rx="2" />
      <text className="t" x="346" y="46">public zone kade-lk</text>
      <text className="s" x="346" y="68">kade.lk · anyone can ask</text>
      <text className="s" x="346" y="86">api.kade.lk A 34.120.88.10</text>
      <line className="w" x1="206" y1="54" x2="327" y2="54" markerEnd="url(#dd-ah-muted)" />
      <text className="s" x="216" y="44">api.kade.lk?</text>
      <rect className="n teal" x="16" y="160" width="190" height="60" rx="2" />
      <text className="t" x="30" y="186">kade-worker</text>
      <text className="s" x="30" y="206">inside kade-vpc</text>
      <rect className="n teal" x="330" y="150" width="300" height="80" rx="2" />
      <text className="t" x="346" y="176">private zone kade-internal</text>
      <text className="s" x="346" y="198">kade.internal · kade-vpc only</text>
      <text className="s" x="346" y="216">db.kade.internal A 10.10.2.5</text>
      <line className="w teal" x1="206" y1="190" x2="327" y2="190" markerEnd="url(#dd-ah-teal)" />
      <text className="s" x="216" y="180">db.kade.internal?</text>
      {/* The phone's question for the private name stops before the zone. */}
      <path className="w fault dash" d="M110 90 V124 H480 V132" />
      <text className="x" x="480" y="146">✕</text>
      <text className="s" x="124" y="116">db.kade.internal?</text>
      <text className="s" x="664" y="176">From the internet, db.kade.internal</text>
      <text className="s" x="664" y="194">does not exist at all: the private</text>
      <text className="s" x="664" y="212">zone only answers kade-vpc.</text>
      <text className="s" x="664" y="46">Anyone may ask a public zone.</text>
      <text className="s" x="664" y="64">It is what the world sees for</text>
      <text className="s" x="664" y="82">your domain.</text>
    </svg>
  );
}

/** Every question goes to the metadata server; a VM that asks elsewhere loses the private answers. */
export function FigAsk() {
  return (
    <svg
      viewBox="0 0 960 320"
      role="img"
      aria-label="kade-worker sends every DNS question to the metadata server at 169.254.169.254, which can answer from private zones, from internal DNS, or from public DNS. A VM whose resolv.conf points at 8.8.8.8 reaches public DNS only: private zones and internal names give no answer."
    >
      <rect className="n teal" x="16" y="80" width="200" height="60" rx="2" />
      <text className="t" x="30" y="106">kade-worker</text>
      <text className="s" x="30" y="126">DNS server set by DHCP</text>

      <rect className="n plum" x="356" y="70" width="214" height="80" rx="2" />
      <text className="t" x="372" y="98">metadata server</text>
      <text className="s" x="372" y="120">169.254.169.254</text>
      <text className="s f" x="372" y="138">knows all three</text>

      <line className="w teal" x1="216" y1="110" x2="353" y2="110" markerEnd="url(#dd-ah-teal)" />
      <text className="s mid" x="285" y="100">every question</text>

      <rect className="n teal" x="650" y="20" width="294" height="52" rx="2" />
      <text className="t" x="664" y="42">private zones</text>
      <text className="s" x="664" y="60">db.kade.internal</text>
      <rect className="n plum" x="650" y="84" width="294" height="52" rx="2" />
      <text className="t" x="664" y="106">internal DNS</text>
      <text className="s" x="664" y="124">kade-db…c.kade-prod.internal</text>
      <rect className="n" x="650" y="148" width="294" height="52" rx="2" />
      <text className="t" x="664" y="170">public DNS</text>
      <text className="s" x="664" y="188">api.kade.lk</text>

      {/* One trunk out of the metadata server, a branch to each source. */}
      <line className="w plum" x1="570" y1="110" x2="647" y2="110" markerEnd="url(#dd-ah-plum)" />
      <path className="w plum" d="M610 110 V46 H647" markerEnd="url(#dd-ah-plum)" />
      <path className="w plum" d="M610 110 V174 H647" markerEnd="url(#dd-ah-plum)" />

      {/* The same VM, pointed somewhere else by hand. */}
      <rect className="n teal" x="16" y="236" width="200" height="60" rx="2" />
      <text className="t" x="30" y="262">a VM you edited</text>
      <text className="s" x="30" y="282">resolv.conf → 8.8.8.8</text>
      <rect className="n" x="356" y="236" width="214" height="60" rx="2" />
      <text className="t" x="372" y="262">8.8.8.8</text>
      <text className="s" x="372" y="282">a public resolver</text>
      <line className="w" x1="216" y1="266" x2="353" y2="266" markerEnd="url(#dd-ah-muted)" />
      <path className="w" d="M570 266 H797 V203" markerEnd="url(#dd-ah-muted)" />
      <text className="s flt" x="586" y="290">private zones, internal DNS: no answer</text>
    </svg>
  );
}

const NAME_PARTS = [
  { x: 126, w: 110, text: "kade-db", what: "VM name", hue: "teal" },
  { x: 258, w: 210, text: "asia-southeast1-b", what: "zone", hue: "teal" },
  { x: 490, w: 50, text: "c", what: "always c", hue: "" },
  { x: 562, w: 130, text: "kade-prod", what: "project ID", hue: "teal" },
  { x: 714, w: 120, text: "internal", what: "always internal", hue: "" },
] as const;

/** The five parts of a VM's automatic name. */
export function FigName() {
  return (
    <svg
      viewBox="0 0 960 132"
      role="img"
      aria-label="A VM's internal DNS name has five parts joined by dots: the VM name kade-db, the zone asia-southeast1-b, the letter c, the project ID kade-prod, and the word internal. It resolves to 10.10.2.5."
    >
      {NAME_PARTS.map((part, i) => (
        <g key={part.text}>
          <rect className={`n ${part.hue}`} x={part.x} y="20" width={part.w} height="44" rx="2" />
          <text className="t mid" x={part.x + part.w / 2} y="47">{part.text}</text>
          <line className="w" x1={part.x + part.w / 2} y1="64" x2={part.x + part.w / 2} y2="82" />
          <text className={part.hue ? "s mid" : "s f mid"} x={part.x + part.w / 2} y="100">{part.what}</text>
          {i > 0 && <text className="t mid" x={part.x - 11} y="50">.</text>}
        </g>
      ))}
      <text className="s" x="850" y="47">→ 10.10.2.5</text>
    </svg>
  );
}

/** DNSSEC: a signed answer is accepted, a forged one is thrown away. */
export function FigDnssec() {
  return (
    <svg
      viewBox="0 0 960 340"
      role="img"
      aria-label="The public zone kade-lk signs its records. A validating resolver checks that the signature on the answer for api.kade.lk matches the zone's key, and that the key matches the DS record held by the .lk registry. The real answer, 34.120.88.10, is passed to the shopper. A forged answer from an attacker has no valid signature and is rejected."
    >
      <rect className="n plum" x="16" y="20" width="290" height="76" rx="2" />
      <text className="t" x="30" y="46">public zone kade-lk</text>
      <text className="s" x="30" y="68">api.kade.lk A 34.120.88.10</text>
      <text className="s" x="30" y="86">+ signature</text>

      <rect className="n fault" x="16" y="152" width="290" height="76" rx="2" />
      <text className="t" x="30" y="178">attacker in the path</text>
      <text className="s" x="30" y="200">api.kade.lk A 203.0.113.66</text>
      <text className="s flt" x="30" y="218">no valid signature</text>

      <rect className="n" x="420" y="20" width="230" height="208" rx="2" />
      <text className="t" x="436" y="46">validating resolver</text>
      <text className="s" x="436" y="112">1 signature fits the key</text>
      <text className="s" x="436" y="134">2 key fits the DS record</text>

      <line className="w green" x1="306" y1="58" x2="417" y2="58" markerEnd="url(#dd-ah-green)" />
      <line className="w fault dash" x1="306" y1="190" x2="400" y2="190" />
      <text className="x" x="408" y="196">✕</text>

      <rect className="n" x="744" y="20" width="200" height="76" rx="2" />
      <text className="t" x="758" y="46">{"Shopper's phone"}</text>
      <text className="s" x="758" y="68">gets 34.120.88.10</text>
      <line className="w green" x1="650" y1="58" x2="741" y2="58" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="676" y="186">forged answer rejected:</text>
      <text className="s" x="676" y="204">an error, never the</text>
      <text className="s" x="676" y="222">{"attacker's server"}</text>

      <rect className="n" x="420" y="264" width="230" height="60" rx="2" />
      <text className="t" x="436" y="290">.lk registry</text>
      <text className="s" x="436" y="310">DS record for kade.lk</text>
      <line className="w" x1="535" y1="264" x2="535" y2="231" markerEnd="url(#dd-ah-muted)" />
      <text className="s" x="676" y="290">added at your registrar;</text>
      <text className="s" x="676" y="308">without it, nothing is checked</text>
    </svg>
  );
}

/** After chapter 13: public DNS at Cloudflare, private DNS still in Cloud DNS. */
export function FigTwoHomes() {
  return (
    <svg
      viewBox="0 0 960 292"
      role="img"
      aria-label="Outside GCP, a shopper's phone asks Cloudflare, which is authoritative for kade.lk, and gets 34.120.88.10. Its traffic then goes to the load balancer in GCP. The public zone kade-lk in Cloud DNS is deleted. Inside GCP, kade-worker still asks the private zone kade-internal, which stays in Cloud DNS, for db.kade.internal."
    >
      <text className="s" x="16" y="28">outside GCP</text>
      <rect className="n" x="16" y="44" width="200" height="60" rx="2" />
      <text className="t" x="30" y="70">{"Shopper's phone"}</text>
      <text className="s" x="30" y="90">anywhere on the internet</text>

      <rect className="n" x="16" y="180" width="290" height="76" rx="2" />
      <text className="t" x="30" y="206">Cloudflare</text>
      <text className="s" x="30" y="226">authoritative for kade.lk</text>
      <text className="s" x="30" y="244">api.kade.lk A 34.120.88.10</text>
      <line className="w" x1="116" y1="104" x2="116" y2="177" markerEnd="url(#dd-ah-muted)" />
      <text className="s" x="130" y="146">1 api.kade.lk?</text>

      <rect className="zone plum" x="400" y="8" width="544" height="272" rx="2" />
      <text className="s" x="416" y="28">GCP · kade-prod</text>

      <rect className="n plum" x="420" y="44" width="230" height="60" rx="2" />
      <text className="t" x="434" y="70">load balancer</text>
      <text className="s" x="434" y="90">34.120.88.10</text>
      <line className="w green" x1="216" y1="74" x2="417" y2="74" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="308" y="64">2 traffic</text>

      <rect className="ghost" x="700" y="44" width="228" height="60" rx="2" />
      <text className="t f" x="714" y="70">public zone kade-lk</text>
      <text className="s f" x="714" y="90">deleted in chapter 13</text>

      <rect className="n teal" x="420" y="188" width="170" height="60" rx="2" />
      <text className="t" x="434" y="214">kade-worker</text>
      <text className="s" x="434" y="234">inside kade-vpc</text>
      <rect className="n teal" x="700" y="180" width="228" height="76" rx="2" />
      <text className="t" x="714" y="206">private zone kade-internal</text>
      <text className="s" x="714" y="226">stays in Cloud DNS</text>
      <text className="s" x="714" y="244">db.kade.internal</text>
      <line className="w teal" x1="590" y1="218" x2="697" y2="218" markerEnd="url(#dd-ah-teal)" />
    </svg>
  );
}
