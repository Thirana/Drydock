// Drawings for this chapter. Classes are styled by `.dd-fig` in globals.css;
// arrowheads come from <DiagramDefs />. Plum is Google's front end, amber the
// load balancer settings Kadé writes, teal Kadé's own service.

/** One numbered step inside the target proxy. */
function Step({ y, n, title, lines }: { y: number; n: number; title: string; lines: [string, string][] }) {
  return (
    <>
      <circle className="badge" cx="302" cy={y - 5} r="11" />
      <text className="mid" x="302" y={y}>
        {n}
      </text>
      <text className="t" x="324" y={y}>
        {title}
      </text>
      {lines.map(([k, line], i) => (
        <text key={line} className={k} x="324" y={y + 21 + i * 20}>
          {line}
        </text>
      ))}
    </>
  );
}

export function FigTargetProxy() {
  return (
    <svg viewBox="0 0 960 372" role="img" aria-label="A shopper's encrypted connection 1 ends at kade-https-proxy on a Google Front End. The proxy ends TCP, ends TLS by showing kade.lk's certificate, and reads the HTTP request. The URL map and backend service then choose kade-api, and the front end opens a new connection 2 to it.">
      <rect className="n" x="16" y="148" width="120" height="88" rx="2" />
      <text className="t" x="30" y="184">Shopper</text>
      <text className="s" x="30" y="206">203.0.113.99</text>
      <path className="w" d="M136 192 H273" markerEnd="url(#dd-ah-muted)" />
      <text className="l" x="146" y="180">connection 1</text>
      <text className="l" x="146" y="214">encrypted</text>

      <rect className="zone plum" x="252" y="16" width="518" height="340" rx="2" />
      <text className="s" x="268" y="40">Google Front End, near the shopper</text>

      <rect className="n amber" x="276" y="56" width="276" height="284" rx="2" />
      <text className="t" x="292" y="84">kade-https-proxy</text>
      <text className="s" x="292" y="104">target HTTPS proxy</text>
      <line className="w" x1="276" y1="118" x2="552" y2="118" />
      <Step y={146} n={1} title="Ends TCP" lines={[["", "answers the handshake"]]} />
      <Step y={206} n={2} title="Ends TLS" lines={[["", "shows kade.lk's certificate,"], ["", "checks the TLS version"]]} />
      <Step y={280} n={3} title="Reads HTTP" lines={[["s", "Host: www.kade.lk"], ["s", "GET /api/cart"]]} />

      <rect className="n amber" x="580" y="72" width="166" height="64" rx="2" />
      <text className="t" x="594" y="98">URL map</text>
      <text className="s" x="594" y="120">/api/*</text>
      <rect className="n amber" x="580" y="184" width="166" height="64" rx="2" />
      <text className="t" x="594" y="210">backend service</text>
      <text className="s" x="594" y="232">kade-api-backend</text>
      <path className="w" d="M552 275 H566 V104 H577" markerEnd="url(#dd-ah-muted)" />
      <path className="w" d="M663 136 V181" markerEnd="url(#dd-ah-muted)" />

      <rect className="n teal" x="800" y="172" width="144" height="88" rx="2" />
      <text className="t" x="814" y="206">kade-api</text>
      <text className="s" x="814" y="228">Cloud Run</text>
      <path className="w" d="M746 216 H797" markerEnd="url(#dd-ah-muted)" />
      <text className="l" x="800" y="290">connection 2</text>
      <text x="800" y="310">a new one, opened</text>
      <text x="800" y="330">by the front end</text>
    </svg>
  );
}

const KIND_ROWS: { name: string; proxy?: [string, string]; urlMap: boolean; gap?: string }[] = [
  { name: "Application Load Balancer · reads HTTP", proxy: ["target HTTPS proxy", "or target HTTP proxy"], urlMap: true },
  { name: "Proxy Network Load Balancer · ends TCP, or TLS too", proxy: ["target TCP proxy", "or target SSL proxy"], urlMap: false, gap: "no URL map" },
  { name: "Passthrough Network Load Balancer · ends nothing", urlMap: false, gap: "no target proxy: packets pass through unread" },
];

export function FigProxyKinds() {
  return (
    <svg viewBox="0 0 960 318" role="img" aria-label="Three load balancer chains. The Application Load Balancer has a forwarding rule, a target HTTP or HTTPS proxy, a URL map, a backend service and backends. The proxy Network Load Balancer has a target TCP or SSL proxy but no URL map. The passthrough Network Load Balancer has no target proxy: its forwarding rule points straight at the backend service.">
      {KIND_ROWS.map((r, i) => {
        const y = 38 + i * 104;
        const cy = y + 26;
        const box = (x: number, w: number, title: string, sub: string, hue = "") => (
          <>
            <rect className={`n ${hue}`} x={x} y={y} width={w} height="52" rx="2" />
            <text className="t" x={x + 14} y={cy - 3}>
              {title}
            </text>
            <text className="s" x={x + 14} y={cy + 17}>
              {sub}
            </text>
          </>
        );
        // Where the wire into the backend service starts: the last box before it.
        const from = r.urlMap ? 584 : r.proxy ? 408 : 184;
        return (
          <g key={r.name}>
            <text className="s" x="16" y={y - 12}>
              {r.name}
            </text>
            {box(16, 168, "forwarding rule", "IP and port")}
            {r.proxy && (
              <>
                <path className="w" d={`M184 ${cy} H209`} markerEnd="url(#dd-ah-muted)" />
                {box(212, 196, r.proxy[0], r.proxy[1], "amber")}
              </>
            )}
            {r.urlMap && (
              <>
                <path className="w" d={`M408 ${cy} H433`} markerEnd="url(#dd-ah-muted)" />
                {box(436, 148, "URL map", "host + path")}
              </>
            )}
            <path className={r.proxy ? "w" : "w dash"} d={`M${from} ${cy} H609`} markerEnd="url(#dd-ah-muted)" />
            {r.gap && (
              <text className="l mid" x={(from + 609) / 2} y={cy - 10}>
                {r.gap}
              </text>
            )}
            {box(612, 172, "backend service", r.proxy ? "where to send it" : "regional")}
            <path className="w" d={`M784 ${cy} H809`} markerEnd="url(#dd-ah-muted)" />
            {box(812, 132, "backends", r.proxy ? "see the proxy" : "see the client")}
          </g>
        );
      })}
    </svg>
  );
}

const BACKEND_ZONES = [
  {
    y: 16,
    zone: "zone teal",
    box: "n teal",
    title: "In your VPC",
    kinds: [
      ["Managed group (MIG)", "VMs from a template"],
      ["Unmanaged group", "a fixed list of VMs"],
      ["Zonal NEG", "IP:port endpoints"],
    ],
  },
  {
    y: 126,
    zone: "zone plum",
    box: "n plum",
    title: "Run by Google, or published by someone else",
    kinds: [
      ["Serverless NEG", "Cloud Run: kade-api-neg"],
      ["Private Service Connect NEG", "a published service"],
    ],
  },
  {
    y: 236,
    zone: "zone",
    box: "n",
    title: "Outside Google Cloud",
    kinds: [
      ["Internet NEG", "an IP or name anywhere"],
      ["Hybrid NEG", "over VPN or Interconnect"],
    ],
  },
] as const;

/** What a backend service can point at, grouped by where the backend runs. */
export function FigBackends() {
  return (
    <svg
      viewBox="0 0 960 420"
      role="img"
      aria-label="A backend service can point at backends in three places. In your VPC: a managed instance group, an unmanaged instance group or a zonal NEG. Run by Google or published by someone else: a serverless NEG for Cloud Run, or a Private Service Connect NEG. Outside Google Cloud: an internet NEG or a hybrid NEG. A backend bucket is separate: it points at a Cloud Storage bucket."
    >
      <rect className="n amber" x="16" y="142" width="190" height="64" rx="2" />
      <text className="t" x="30" y="168">backend service</text>
      <text className="s" x="30" y="188">kade-api-backend</text>
      <line className="w" x1="206" y1="174" x2="287" y2="174" markerEnd="url(#dd-ah-muted)" />
      <path className="w" d="M248 174 V64 H287" markerEnd="url(#dd-ah-muted)" />
      <path className="w" d="M248 174 V284 H287" markerEnd="url(#dd-ah-muted)" />
      {BACKEND_ZONES.map((group) => (
        <g key={group.title}>
          <rect className={group.zone} x="290" y={group.y} width="654" height="96" rx="2" />
          <text className="s f" x="304" y={group.y + 20}>{group.title}</text>
          {group.kinds.map(([kind, sub], i) => (
            <g key={kind}>
              <rect className={group.box} x={304 + i * 212} y={group.y + 32} width="202" height="52" rx="2" />
              <text className="t" x={316 + i * 212} y={group.y + 54}>{kind}</text>
              <text className="s" x={316 + i * 212} y={group.y + 73}>{sub}</text>
            </g>
          ))}
        </g>
      ))}
      <rect className="n amber" x="16" y="352" width="190" height="56" rx="2" />
      <text className="t" x="30" y="376">backend bucket</text>
      <text className="s" x="30" y="395">kade-static</text>
      <line className="w" x1="206" y1="380" x2="301" y2="380" markerEnd="url(#dd-ah-muted)" />
      <rect className="n plum" x="304" y="352" width="414" height="56" rx="2" />
      <text className="t" x="316" y="376">Cloud Storage bucket</text>
      <text className="s" x="316" y="395">kade-static-assets · static files, no VMs</text>
    </svg>
  );
}

/** Balancing mode: a backend at its target counts as full, and the rest spills over. */
export function FigSpill() {
  return (
    <svg
      viewBox="0 0 960 212"
      role="img"
      aria-label="The load balancer sends traffic to the nearest group until that group reaches its target, here 80 requests a second per VM. At the target the group counts as full, and only the traffic over the target goes to the next group."
    >
      <rect className="n plum" x="16" y="76" width="170" height="60" rx="2" />
      <text className="t" x="30" y="101">load balancer</text>
      <text className="s" x="30" y="121">mode: RATE</text>
      <path className="w green" d="M186 106 H240 V56 H297" markerEnd="url(#dd-ah-green)" />
      <path className="w green dash" d="M240 106 V156 H297" markerEnd="url(#dd-ah-green)" />
      <text className="s f" x="16" y="170">dashed: only what is</text>
      <text className="s f" x="16" y="188">over the target</text>

      <rect className="n teal" x="300" y="16" width="644" height="80" rx="2" />
      <text className="t" x="314" y="42">nearest group</text>
      <text className="s" x="314" y="62">target: 80 req/s per VM</text>
      <text className="s" x="314" y="80">at the target: counts as full</text>
      <rect className="n green" x="600" y="34" width="328" height="22" rx="2" />
      <text className="s" x="600" y="76">filled to the target</text>

      <rect className="n teal" x="300" y="116" width="644" height="80" rx="2" />
      <text className="t" x="314" y="142">next group</text>
      <text className="s" x="314" y="162">takes the overflow</text>
      <text className="s" x="314" y="180">a MIG can add VMs instead</text>
      <rect className="ghost" x="600" y="134" width="328" height="22" rx="2" />
      <rect className="n green" x="600" y="134" width="96" height="22" rx="2" />
      <text className="s" x="600" y="176">room left</text>
    </svg>
  );
}

/** Session affinity: where one shopper's requests land, without it and with it. */
export function FigAffinity() {
  return (
    <svg
      viewBox="0 0 960 196"
      role="img"
      aria-label="Without session affinity, one shopper's requests are spread over both VMs, so the VM that holds the cart in memory is missed half the time. With session affinity, every request from that shopper goes to the same VM."
    >
      <text className="s" x="16" y="20" style={{ fontWeight: 700 }}>No affinity</text>
      <rect className="n" x="16" y="78" width="130" height="56" rx="2" />
      <text className="t" x="30" y="111">Shopper</text>
      <rect className="n teal" x="266" y="36" width="190" height="56" rx="2" />
      <text className="t" x="280" y="60">VM 1</text>
      <text className="s" x="280" y="79">cart in memory</text>
      <rect className="n fault" x="266" y="120" width="190" height="56" rx="2" />
      <text className="t" x="280" y="144">VM 2</text>
      <text className="s flt" x="280" y="163">no cart: looks empty</text>
      <path className="w green" d="M146 106 H206 V64 H263" markerEnd="url(#dd-ah-green)" />
      <path className="w" d="M206 106 V148 H263" markerEnd="url(#dd-ah-muted)" />

      <line className="w dash" x1="488" y1="8" x2="488" y2="188" />

      <text className="s" x="520" y="20" style={{ fontWeight: 700 }}>With affinity</text>
      <rect className="n" x="520" y="78" width="130" height="56" rx="2" />
      <text className="t" x="534" y="111">Shopper</text>
      <rect className="n teal" x="770" y="36" width="174" height="56" rx="2" />
      <text className="t" x="784" y="60">VM 1</text>
      <text className="s" x="784" y="79">every request</text>
      <g className="off">
        <rect className="n teal" x="770" y="120" width="174" height="56" rx="2" />
        <text className="t" x="784" y="144">VM 2</text>
        <text className="s" x="784" y="163">other shoppers</text>
      </g>
      <path className="w green" d="M650 106 H710 V64 H767" markerEnd="url(#dd-ah-green)" />
    </svg>
  );
}

/** How Google checks you own the domain before it issues a certificate. */
export function FigCertAuth() {
  return (
    <svg
      viewBox="0 0 960 262"
      role="img"
      aria-label="Two ways Google checks domain ownership. With load balancer authorization, Google follows the A record of kade.lk: if it points at the load balancer the certificate is issued, but if it points at Cloudflare the check fails. With DNS authorization, Google looks up a CNAME record you add once, so the certificate is issued wherever kade.lk points."
    >
      <text className="s" x="16" y="20" style={{ fontWeight: 700 }}>Load balancer authorization</text>
      <rect className="n plum" x="16" y="48" width="200" height="56" rx="2" />
      <text className="t" x="30" y="72">Google checks</text>
      <text className="s" x="30" y="91">connects to kade.lk</text>
      <text className="s f" x="232" y="66">follows the A record</text>
      <rect className="n green" x="560" y="32" width="384" height="48" rx="2" />
      <text className="t" x="574" y="53">A record → load balancer</text>
      <text className="s" x="574" y="71">34.120.88.10 · certificate issued</text>
      <rect className="n fault" x="560" y="92" width="384" height="48" rx="2" />
      <text className="t" x="574" y="113">A record → Cloudflare (chapter 13)</text>
      <text className="s flt" x="574" y="131">check fails · no certificate</text>
      <path className="w green" d="M216 76 H420 V56 H557" markerEnd="url(#dd-ah-green)" />
      <path className="w fault dash" d="M420 76 V116 H557" markerEnd="url(#dd-ah-fault)" />

      <text className="s" x="16" y="178" style={{ fontWeight: 700 }}>DNS authorization</text>
      <rect className="n plum" x="16" y="194" width="200" height="56" rx="2" />
      <text className="t" x="30" y="218">Google checks</text>
      <text className="s" x="30" y="237">looks up one record</text>
      <text className="s f" x="232" y="212">_acme-challenge.kade.lk</text>
      <rect className="n green" x="560" y="198" width="384" height="48" rx="2" />
      <text className="t" x="574" y="219">CNAME record, added once</text>
      <text className="s" x="574" y="237">issued · wherever kade.lk points</text>
      <line className="w green" x1="216" y1="222" x2="557" y2="222" markerEnd="url(#dd-ah-green)" />
    </svg>
  );
}

/** One address, many certificates: the browser names the site, the map picks. */
export function FigSni() {
  return (
    <svg
      viewBox="0 0 960 160"
      role="img"
      aria-label="The browser names the site it wants, api.kade.lk, at the start of TLS. The target proxy looks that name up in kade-cert-map, which has entries for kade.lk and for the wildcard star dot kade.lk. The wildcard entry matches, so its certificate is shown."
    >
      <rect className="n" x="16" y="50" width="230" height="60" rx="2" />
      <text className="t" x="30" y="76">Browser</text>
      <text className="s" x="30" y="96">TLS hello: api.kade.lk</text>
      <line className="w green" x1="246" y1="80" x2="357" y2="80" markerEnd="url(#dd-ah-green)" />
      <rect className="n amber" x="360" y="8" width="250" height="144" rx="2" />
      <text className="t" x="374" y="32">kade-cert-map</text>
      <rect className="ghost" x="374" y="46" width="222" height="40" rx="2" />
      <text className="s f" x="386" y="71">kade.lk</text>
      <rect className="n mark" x="374" y="98" width="222" height="40" rx="2" />
      <text className="s" x="386" y="123" style={{ fontWeight: 700 }}>*.kade.lk · matches</text>
      <path className="w green" d="M596 118 H660 V80 H721" markerEnd="url(#dd-ah-green)" />
      <rect className="n green" x="724" y="50" width="220" height="60" rx="2" />
      <text className="t" x="738" y="76">certificate shown</text>
      <text className="s" x="738" y="96">the one for *.kade.lk</text>
    </svg>
  );
}

const ANSWERS = [
  { x: 162, w: 170, box: "n plum", title: "Cloud CDN", notes: [["response_from_cache", "answered from the cache"]] },
  { x: 368, w: 170, box: "n amber", title: "Cloud Armor", notes: [["denied_by_security_policy", "a rule refused it"]] },
  { x: 574, w: 170, box: "n plum", title: "pick a backend", notes: [["failed_to_pick_backend", "none is healthy"]] },
  {
    x: 780,
    w: 164,
    box: "n teal",
    title: "backend",
    notes: [
      ["response_sent_by_backend", "the app answered"],
      ["backend_timeout", "no answer in time"],
    ],
  },
] as const;

/** Where on the way in each `statusDetails` value is produced. */
export function FigWhoAnswered() {
  return (
    <svg
      viewBox="0 0 960 232"
      role="img"
      aria-label="A request passes Cloud CDN, Cloud Armor, backend selection and then the backend. Each stage that can answer writes its own statusDetails. Cloud CDN: response_from_cache. Cloud Armor: denied_by_security_policy. Backend selection: failed_to_pick_backend, when none is healthy. The backend: response_sent_by_backend when the app answered, or backend_timeout when it did not answer in time."
    >
      <rect className="n" x="16" y="24" width="110" height="56" rx="2" />
      <text className="t" x="30" y="57">Shopper</text>
      {ANSWERS.map((stage) => {
        const mid = stage.x + stage.w / 2;
        return (
          <g key={stage.title}>
            <line className="w green" x1={stage.x - 36} y1="52" x2={stage.x - 3} y2="52" markerEnd="url(#dd-ah-green)" />
            <rect className={stage.box} x={stage.x} y="24" width={stage.w} height="56" rx="2" />
            <text className="t mid" x={mid} y="57">{stage.title}</text>
            <line className="w" x1={mid} y1="80" x2={mid} y2="104" />
            {stage.notes.map(([code, means], i) => (
              <g key={code}>
                <text className="s mid" x={mid} y={124 + i * 56} style={{ fontWeight: 700 }}>{code}</text>
                <text className="s f mid" x={mid} y={143 + i * 56}>{means}</text>
              </g>
            ))}
          </g>
        );
      })}
      <text className="s f" x="16" y="180">below each stage:</text>
      <text className="s f" x="16" y="199">the statusDetails it writes when it answers</text>
    </svg>
  );
}

const KADE_COLS = [
  { x: 16, w: 150, head: "forwarding rule" },
  { x: 205, w: 156, head: "target proxy" },
  { x: 400, w: 156, head: "URL map" },
  { x: 595, w: 150, head: "backend service or bucket" },
  { x: 784, w: 160, head: "backend" },
] as const;

const KADE_HTTPS = [
  ["kade-https-rule", ":443"],
  ["kade-https-proxy", "kade-cert-map"],
  ["kade-url-map", "host and path"],
  ["kade-api-backend", "Armor · logs 100%"],
  ["kade-api-neg", "→ Cloud Run kade-api"],
] as const;

const KADE_HTTP = [
  ["kade-http-rule", ":80"],
  ["kade-http-proxy", "no certificate"],
  ["kade-redirect-map", "301 to https"],
] as const;

/** Kadé's whole load balancer: two chains on one address. */
export function FigKadeChain() {
  return (
    <svg
      viewBox="0 0 960 284"
      role="img"
      aria-label="Kadé's load balancer on kade-lb-ip 34.120.88.10. The HTTPS chain: kade-https-rule on port 443, kade-https-proxy with kade-cert-map, kade-url-map, then either kade-api-backend with Cloud Armor and the serverless NEG kade-api-neg to Cloud Run, or the backend bucket kade-static with Cloud CDN and the bucket kade-static-assets. The HTTP chain: kade-http-rule on port 80, kade-http-proxy and kade-redirect-map, which answers with a redirect to HTTPS and has no backend."
    >
      <text className="s" x="16" y="16" style={{ fontWeight: 700 }}>both rules on kade-lb-ip · 34.120.88.10</text>
      {KADE_COLS.map((col, i) => (
        <g key={col.head}>
          <text className="s f" x={col.x} y="40">{col.head}</text>
          <rect className={i === 4 ? "n teal" : "n amber"} x={col.x} y="50" width={col.w} height="56" rx="2" />
          <text className="t" x={col.x + 12} y="74">{KADE_HTTPS[i][0]}</text>
          <text className="s" x={col.x + 12} y="93">{KADE_HTTPS[i][1]}</text>
          {i > 0 && <line className="w green" x1={KADE_COLS[i - 1].x + KADE_COLS[i - 1].w} y1="78" x2={col.x - 3} y2="78" markerEnd="url(#dd-ah-green)" />}
        </g>
      ))}
      {/* The URL map's second branch: static files. */}
      <path className="w green" d="M575 78 V150 H592" markerEnd="url(#dd-ah-green)" />
      <rect className="n amber" x="595" y="122" width="150" height="56" rx="2" />
      <text className="t" x="607" y="146">kade-static</text>
      <text className="s" x="607" y="165">bucket · Cloud CDN</text>
      <line className="w green" x1="745" y1="150" x2="781" y2="150" markerEnd="url(#dd-ah-green)" />
      <rect className="n teal" x="784" y="122" width="160" height="56" rx="2" />
      <text className="t" x="796" y="146">bucket</text>
      <text className="s" x="796" y="165">kade-static-assets</text>

      {KADE_HTTP.map(([name, sub], i) => {
        const col = KADE_COLS[i];
        return (
          <g key={name}>
            <rect className="n amber" x={col.x} y="212" width={col.w} height="56" rx="2" />
            <text className="t" x={col.x + 12} y="236">{name}</text>
            <text className="s" x={col.x + 12} y="255">{sub}</text>
            {i > 0 && <line className="w" x1={KADE_COLS[i - 1].x + KADE_COLS[i - 1].w} y1="240" x2={col.x - 3} y2="240" markerEnd="url(#dd-ah-muted)" />}
          </g>
        );
      })}
      <text className="s f" x="595" y="236">answers by itself:</text>
      <text className="s f" x="595" y="255">no backend behind it</text>
    </svg>
  );
}
