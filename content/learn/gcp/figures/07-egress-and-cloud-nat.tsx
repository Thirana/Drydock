// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigSplit() {
  return (
    <svg viewBox="0 0 960 250" role="img" aria-label="Three VMs send traffic to the internet. A VM with an external IP goes out as its own IP, even though Cloud NAT exists. A VM without an external IP and without NAT cannot get out. A VM without an external IP but covered by Cloud NAT goes out as the NAT IP 34.87.200.7.">
      <rect className="zone teal" x="16" y="12" width="520" height="226" rx="2" />
      <text className="s" x="32" y="34">kade-vpc · asia-southeast1</text>
      <rect className="n teal" x="32" y="48" width="230" height="52" rx="2" />
      <text className="t" x="44" y="70">test-vm</text>
      <text className="s" x="44" y="89">has external IP 34.87.130.4</text>
      <rect className="n teal" x="32" y="112" width="230" height="52" rx="2" />
      <text className="t" x="44" y="134">kade-api-1 today</text>
      <text className="s" x="44" y="153">no external IP, no NAT</text>
      <rect className="n teal" x="32" y="176" width="230" height="52" rx="2" />
      <text className="t" x="44" y="198">kade-api-1 after</text>
      <text className="s" x="44" y="217">no external IP, NAT covers it</text>
      {/* Level with "kade-api-1 after", so the wire into it stays straight. */}
      <rect className="n teal" x="300" y="170" width="200" height="64" rx="2" />
      <text className="t" x="314" y="194">Cloud NAT kade-nat</text>
      <text className="s" x="314" y="214">NAT IP 34.87.200.7</text>
      {/* Centred between the two ways out (y 74 and y 202), so they meet on one trunk. */}
      <rect className="n" x="744" y="102" width="200" height="72" rx="2" />
      <text className="t" x="758" y="128">Internet</text>
      <text className="s" x="758" y="150">PayGate, apt mirrors</text>
      <path className="w green" d="M262 74 H700 V138 H741" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="290" y="64">src 34.87.130.4 (NAT ignored)</text>
      <line className="w fault dash" x1="262" y1="138" x2="320" y2="138" />
      <text className="x" x="330" y="143">✕</text>
      <text className="s" x="344" y="143">no path</text>
      <line className="w teal" x1="262" y1="202" x2="297" y2="202" markerEnd="url(#dd-ah-teal)" />
      <path className="w green" d="M500 202 H700 V138 H741" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="556" y="192">src 34.87.200.7</text>
    </svg>
  );
}

const HOSTS = [
  { x: 40, zone: "a", vm: "kade-api-1", ip: "10.10.1.10" },
  { x: 376, zone: "b", vm: "kade-api-2", ip: "10.10.1.11" },
] as const;

export function FigRouter() {
  return (
    <svg
      viewBox="0 0 960 478"
      role="img"
      aria-label="kade-router, a Cloud Router in asia-southeast1, holds the kade-nat settings and passes no packets. The settings are pushed to the data plane on every host, in zone a and zone b. Each host rewrites its own VM's traffic from the VM's internal IP to the NAT IP 34.87.200.7, and the traffic goes straight to the internet."
    >
      <rect className="zone" x="16" y="12" width="690" height="450" rx="2" />
      <text className="s" x="32" y="34">region asia-southeast1</text>

      {/* Control plane: the settings, and nothing else. */}
      <rect className="n plum" x="258" y="40" width="360" height="88" rx="2" />
      <text className="t" x="276" y="66">kade-router (Cloud Router)</text>
      <text className="s" x="276" y="90">holds kade-nat · NAT IP 34.87.200.7</text>
      <text className="s" x="276" y="110">settings only: no packets pass here</text>
      <path className="w plum dash" d="M438 128 V156 H270 V297" markerEnd="url(#dd-ah-plum)" />
      <path className="w plum dash" d="M438 128 V156 H606 V297" markerEnd="url(#dd-ah-plum)" />
      <text className="s mid" x="438" y="184">settings pushed to every host</text>

      {/* Data plane: each host translates its own VM's packets. */}
      {HOSTS.map((h) => (
        <g key={h.zone}>
          <rect className="zone panel" x={h.x} y="200" width="316" height="200" rx="2" />
          <text className="s" x={h.x + 14} y="222">zone {h.zone} · physical host</text>
          <rect className="n teal" x={h.x + 16} y="234" width="150" height="42" rx="2" />
          <text className="t" x={h.x + 28} y="260">{h.vm}</text>
          <line
            className="w green"
            x1={h.x + 91}
            y1="276"
            x2={h.x + 91}
            y2="297"
            markerEnd="url(#dd-ah-green)"
          />
          <rect className="n plum" x={h.x + 16} y="300" width="284" height="84" rx="2" />
          <text className="t" x={h.x + 28} y="324">data plane</text>
          <text className="s" x={h.x + 28} y="346">route → firewall → NAT</text>
          <text className="s" x={h.x + 28} y="366">src {h.ip} → 34.87.200.7</text>
          {/* Out of the host and straight to the internet: one trunk, one head. */}
          <path
            className="w green"
            d={`M${h.x + 91} 384 V420 H749`}
            markerEnd="url(#dd-ah-green)"
          />
        </g>
      ))}
      <text className="s" x="572" y="442">src 34.87.200.7</text>

      <rect className="n" x="752" y="384" width="192" height="72" rx="2" />
      <text className="t" x="766" y="410">Internet</text>
      <text className="s" x="766" y="432">PayGate, apt mirrors</text>
    </svg>
  );
}

export function FigOneWay() {
  return (
    <svg
      viewBox="0 0 960 330"
      role="img"
      aria-label="Inside kade-vpc, kade-api-1 opens a connection to PayGate on the public internet. Cloud NAT rewrites the source to 34.87.200.7 and records the connection, so PayGate's reply is matched and sent back to 10.10.1.10. A scanner on the internet that starts a connection to port 22 matches no entry and is dropped at the edge of the VPC, so a firewall rule allowing 0.0.0.0/0 on port 22 is never reached."
    >
      {/* Your side: private addresses only. */}
      <rect className="zone teal" x="16" y="12" width="572" height="306" rx="2" />
      <text className="s" x="32" y="34">kade-vpc · asia-southeast1</text>

      <rect className="n teal" x="32" y="52" width="180" height="130" rx="2" />
      <text className="t" x="46" y="78">kade-api-1</text>
      <text className="s" x="46" y="100">10.10.1.10</text>
      <text className="s" x="46" y="120">no external IP</text>

      <rect className="n amber" x="32" y="222" width="180" height="76" rx="2" />
      <text className="t" x="46" y="246">a bad firewall rule</text>
      <text className="s" x="46" y="266">0.0.0.0/0 on tcp:22</text>
      <text className="s f" x="46" y="286">never reached</text>

      <rect className="n plum" x="340" y="52" width="220" height="246" rx="2" />
      <text className="t" x="354" y="78">Cloud NAT</text>
      <text className="s f" x="354" y="100">connection table</text>
      <text className="s" x="354" y="122">34.87.200.7:41002</text>
      <text className="s" x="354" y="142">↔ 10.10.1.10:51000</text>
      <text className="s flt" x="354" y="266">no entry: dropped</text>

      {/* The other side: the public internet. */}
      <rect className="zone" x="612" y="12" width="332" height="306" rx="2" />
      <text className="s" x="628" y="34">public internet</text>

      <rect className="n" x="760" y="52" width="168" height="130" rx="2" />
      <text className="t" x="774" y="78">PayGate</text>
      <text className="s" x="774" y="100">api.paygate.lk:443</text>

      <rect className="n" x="760" y="222" width="168" height="76" rx="2" />
      <text className="t" x="774" y="246">Anyone else</text>
      <text className="s" x="774" y="266">scanners, SSH bots</text>

      {/* Out and back: the request, then the reply the table matches. */}
      <line className="w green" x1="212" y1="112" x2="337" y2="112" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="276" y="104">src 10.10.1.10</text>
      <line className="w green" x1="560" y1="112" x2="757" y2="112" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="628" y="104">src 34.87.200.7</text>
      <line className="w green" x1="760" y1="148" x2="563" y2="148" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="628" y="140">dst 34.87.200.7</text>
      <line className="w green" x1="340" y1="148" x2="215" y2="148" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="276" y="140">dst 10.10.1.10</text>

      {/* In: a new connection matches nothing and stops at the edge. */}
      <line className="w fault dash" x1="760" y1="260" x2="584" y2="260" />
      <text className="x" x="574" y="266">✕</text>
      <text className="s" x="628" y="252">to port 22</text>
    </svg>
  );
}

/** A pass at a check: a drawn tick in ink. */
function Pass({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x - 7} ${y} l5 5 l10 -11`}
      style={{ fill: "none", stroke: "var(--dd-ink)", strokeWidth: 2.25 }}
    />
  );
}

/** A stop at a check: a red cross. */
function Stop({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x - 6} ${y - 6} l12 12 m0 -12 l-12 12`}
      style={{ fill: "none", stroke: "var(--dd-fault)", strokeWidth: 2.25 }}
    />
  );
}

/** A check this trip does not need. */
function Skip({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x - 6} ${y} h12`}
      style={{ fill: "none", stroke: "var(--dd-ink-faint)", strokeWidth: 2.25 }}
    />
  );
}

const CHECKS = [
  { x: 300, hue: "teal", t: "1 · Route", s: "which way" },
  { x: 520, hue: "amber", t: "2 · Firewall rule", s: "whether it is allowed" },
  { x: 740, hue: "", t: "3 · Public address", s: "to use the internet" },
] as const;

type Mark = "pass" | "stop" | "skip";

const TRIPS: { t: string; s: string; y: number; checks: [Mark, string][] }[] = [
  {
    t: "kade-api-1 → kade-db",
    s: "10.10.1.10 → 10.10.2.5",
    y: 112,
    checks: [
      ["pass", "10.10.2.0/24"],
      ["pass", "ingress rule"],
      ["skip", "stays in the VPC"],
    ],
  },
  {
    t: "kade-api-1 → PayGate",
    s: "before Cloud NAT",
    y: 176,
    checks: [
      ["pass", "0.0.0.0/0"],
      ["pass", "egress allowed"],
      ["stop", "none: dropped"],
    ],
  },
  {
    t: "kade-api-1 → PayGate",
    s: "with Cloud NAT",
    y: 240,
    checks: [
      ["pass", "0.0.0.0/0"],
      ["pass", "egress allowed"],
      ["pass", "NAT IP 34.87.200.7"],
    ],
  },
  {
    t: "kade-db → Cloud Storage",
    s: "Private Google Access on",
    y: 304,
    checks: [
      ["pass", "0.0.0.0/0"],
      ["pass", "egress allowed"],
      ["skip", "stays in Google"],
    ],
  },
];

export function FigThree() {
  return (
    <svg
      viewBox="0 0 960 350"
      role="img"
      aria-label="Every trip passes three checks in order: a route, a firewall rule, and, for the internet, a public address. kade-api-1 to kade-db needs no public address. kade-api-1 to PayGate is dropped at the third check until Cloud NAT gives it the NAT IP. kade-db to Cloud Storage stays inside Google with Private Google Access."
    >
      {CHECKS.map((c) => (
        <g key={c.t}>
          <rect className={`n ${c.hue}`} x={c.x} y="16" width="204" height="54" rx="2" />
          <text className="t" x={c.x + 14} y="40">{c.t}</text>
          <text className="s" x={c.x + 14} y="60">{c.s}</text>
          <rect className="zone" x={c.x} y="80" width="204" height="258" rx="2" />
        </g>
      ))}
      {TRIPS.map((trip) => {
        const stopAt = trip.checks.findIndex(([m]) => m === "stop");
        const end = stopAt < 0 ? 948 : CHECKS[stopAt].x + 14;
        return (
          <g key={trip.t + trip.s}>
            <text className="t" x="16" y={trip.y - 2}>{trip.t}</text>
            <text className="s" x="16" y={trip.y + 18}>{trip.s}</text>
            <line
              className="w green"
              x1="282"
              y1={trip.y - 6}
              x2={end}
              y2={trip.y - 6}
              markerEnd={stopAt < 0 ? "url(#dd-ah-green)" : undefined}
            />
            {trip.checks.map(([mark, words], i) => {
              const x = CHECKS[i].x + 18;
              const y = trip.y - 6;
              return (
                <g key={i}>
                  {/* A disc of page colour, so the mark reads over the line. */}
                  {(i <= stopAt || stopAt < 0) && (
                    <circle cx={x} cy={y} r="12" style={{ fill: "var(--dd-ground)" }} />
                  )}
                  {mark === "pass" && <Pass x={x} y={y} />}
                  {mark === "stop" && <Stop x={x} y={y} />}
                  {mark === "skip" && <Skip x={x} y={y} />}
                  <text className="s" x={CHECKS[i].x + 12} y={trip.y + 18}>
                    {words}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
