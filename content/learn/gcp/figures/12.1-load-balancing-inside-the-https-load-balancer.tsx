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
