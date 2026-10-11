// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigSplit() {
  return (
    <svg viewBox="0 0 960 250" role="img" aria-label="Three VMs send traffic to the internet. A VM with an external IP goes out as its own IP, even though Cloud NAT exists. A VM without an external IP and without NAT cannot get out. A VM without an external IP but covered by Cloud NAT goes out as the NAT IP 34.87.200.7.">
      <rect className="zone teal" x="16" y="12" width="560" height="226" rx="2" />
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
      <rect className="n teal" x="340" y="164" width="220" height="64" rx="2" />
      <text className="t" x="354" y="188">Cloud NAT kade-nat</text>
      <text className="s" x="354" y="208">NAT IP 34.87.200.7</text>
      <rect className="n" x="744" y="96" width="200" height="72" rx="2" />
      <text className="t" x="758" y="122">Internet</text>
      <text className="s" x="758" y="144">PayGate, apt mirrors</text>
      <path className="w green" d="M262 74 C 500 74, 600 100, 741 118" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="580" y="80">src 34.87.130.4 (NAT ignored)</text>
      <line className="w fault dash" x1="262" y1="138" x2="320" y2="138" />
      <text className="x" x="330" y="143">✕</text>
      <text className="s" x="344" y="143">no path</text>
      <line className="w teal" x1="262" y1="202" x2="337" y2="202" markerEnd="url(#dd-ah-teal)" />
      <path className="w green" d="M560 196 C 640 196, 680 160, 741 150" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="590" y="222">src 34.87.200.7</text>
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
