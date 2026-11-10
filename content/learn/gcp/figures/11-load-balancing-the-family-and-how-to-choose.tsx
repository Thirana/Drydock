// Drawings for this chapter. Classes are styled by `.dd-fig` in globals.css;
// arrowheads come from <DiagramDefs />. Wires are straight or square elbows.

type Word = { x: number; w: number; text: string; what: string };
const NAME_A: Word[] = [
  { x: 16, w: 120, text: "Global", what: "spread" },
  { x: 152, w: 130, text: "external", what: "reach" },
  { x: 298, w: 150, text: "Application", what: "layer" },
];
const NAME_B: Word[] = [
  { x: 16, w: 120, text: "Regional", what: "spread" },
  { x: 152, w: 130, text: "internal", what: "reach" },
  { x: 298, w: 150, text: "passthrough", what: "mode" },
  { x: 464, w: 120, text: "Network", what: "layer" },
];

function NameRow({ words, y }: { words: Word[]; y: number }) {
  const last = words[words.length - 1];
  return (
    <>
      {words.map((word) => (
        <g key={word.text}>
          <rect className="n" x={word.x} y={y} width={word.w} height="44" rx="2" />
          <text className="t mid" x={word.x + word.w / 2} y={y + 27}>{word.text}</text>
          <line className="w" x1={word.x + word.w / 2} y1={y + 44} x2={word.x + word.w / 2} y2={y + 60} />
          <text className="s mid" x={word.x + word.w / 2} y={y + 78}>{word.what}</text>
        </g>
      ))}
      <text className="t f" x={last.x + last.w + 18} y={y + 27}>Load Balancer</text>
    </>
  );
}

/** Two names, read word by word. */
export function FigLbName() {
  return (
    <svg
      viewBox="0 0 960 232"
      role="img"
      aria-label="Two load balancer names read word by word. Global external Application Load Balancer: Global is the spread, external is the reach, Application is the layer, and there is no mode word because an Application load balancer is always a proxy. Regional internal passthrough Network Load Balancer: Regional is the spread, internal is the reach, passthrough is the mode, Network is the layer."
    >
      <NameRow words={NAME_A} y={20} />
      <text className="s" x="640" y="40">no mode word: an Application</text>
      <text className="s" x="640" y="58">load balancer is always a proxy</text>
      <NameRow words={NAME_B} y={136} />
    </svg>
  );
}

/** External: reached from the internet. Internal: a private IP only the VPC can reach. */
export function FigReach() {
  return (
    <svg
      viewBox="0 0 960 300"
      role="img"
      aria-label="A shopper on the internet reaches the external load balancer at its public IP 34.120.88.10, which sends the request to backends in kade-vpc. Inside kade-vpc, a caller reaches an internal load balancer at the private IP 10.10.1.50, which spreads calls across workers. The shopper has no route to the internal load balancer's private IP."
    >
      <rect className="n" x="16" y="40" width="170" height="60" rx="2" />
      <text className="t" x="30" y="66">Shopper</text>
      <text className="s" x="30" y="86">on the internet</text>
      <rect className="n plum" x="250" y="40" width="180" height="60" rx="2" />
      <text className="t" x="264" y="66">external LB</text>
      <text className="s" x="264" y="86">34.120.88.10</text>

      <rect className="zone teal" x="470" y="12" width="474" height="276" rx="2" />
      <text className="s" x="486" y="34">kade-vpc</text>
      <rect className="n teal" x="744" y="40" width="184" height="60" rx="2" />
      <text className="t" x="758" y="66">backends</text>
      <text className="s" x="758" y="86">kade-api</text>
      <line className="w green" x1="186" y1="70" x2="247" y2="70" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="430" y1="70" x2="741" y2="70" markerEnd="url(#dd-ah-green)" />

      <rect className="n teal" x="486" y="184" width="120" height="60" rx="2" />
      <text className="t" x="498" y="210">a caller</text>
      <text className="s" x="498" y="230">in the VPC</text>
      <rect className="n plum" x="632" y="184" width="150" height="60" rx="2" />
      <text className="t" x="644" y="210">internal LB</text>
      <text className="s" x="644" y="230">10.10.1.50</text>
      <rect className="n teal" x="808" y="184" width="120" height="60" rx="2" />
      <text className="t" x="820" y="210">workers</text>
      <text className="s" x="820" y="230">3 VMs</text>
      <line className="w green" x1="606" y1="214" x2="629" y2="214" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="782" y1="214" x2="805" y2="214" markerEnd="url(#dd-ah-green)" />

      {/* The internet has no way to a private address. */}
      <path className="w fault dash" d="M101 100 V214 H436" />
      <text className="x" x="448" y="220">✕</text>
      <text className="s flt" x="120" y="238">no route to a private IP</text>
    </svg>
  );
}

const SPOTS = [
  { title: "Global external proxies", source: "source: 35.191.x.x" },
  { title: "Regional and internal proxies", source: "source: proxy subnet" },
  { title: "Passthrough", source: "source: the client" },
] as const;

/** Where each kind of load balancer runs, and the source address the backend sees. */
export function FigWhereRuns() {
  return (
    <svg
      viewBox="0 0 960 384"
      role="img"
      aria-label="Where load balancers run. Global external proxies run on Google Front Ends outside your VPC, and the backend sees a source in 35.191.0.0/16 or 130.211.0.0/22. Regional and internal proxies run as Envoy proxies in a proxy-only subnet inside your VPC, and the backend sees a source from that subnet. A passthrough load balancer is the data plane on the backend's host, and the backend sees the client's own address."
    >
      <rect className="zone teal" x="420" y="12" width="524" height="360" rx="2" />
      <text className="s" x="436" y="32">kade-vpc</text>
      {SPOTS.map((spot, i) => {
        const y = 28 + i * 120;
        // The proxy-only subnet's box sits a little lower inside its panel.
        const mid = i === 1 ? y + 62 : y + 54;
        return (
          <g key={spot.title}>
            <text className="s" x="16" y={y + 12} style={{ fontWeight: 700 }}>{spot.title}</text>
            <rect className="n" x="16" y={mid - 30} width="150" height="60" rx="2" />
            <text className="t" x="30" y={mid - 4}>client</text>
            <text className="s" x="30" y={mid + 16}>203.0.113.99</text>
            <rect className="n teal" x="760" y={mid - 30} width="168" height="60" rx="2" />
            <text className="t" x="774" y={mid - 4}>backend</text>
            <text className="s" x="774" y={mid + 16}>{spot.source}</text>
            {i === 0 && (
              <>
                <rect className="n plum" x="200" y={mid - 30} width="190" height="60" rx="2" />
                <text className="t" x="214" y={mid - 4}>Google Front Ends</text>
                <text className="s" x="214" y={mid + 16}>outside your VPC</text>
                <line className="w green" x1="166" y1={mid} x2="197" y2={mid} markerEnd="url(#dd-ah-green)" />
                <line className="w green" x1="390" y1={mid} x2="757" y2={mid} markerEnd="url(#dd-ah-green)" />
              </>
            )}
            {i === 1 && (
              <>
                <rect className="zone panel" x="440" y={y + 18} width="210" height="72" rx="2" />
                <text className="s" x="454" y={y + 35}>proxy-only subnet</text>
                <rect className="n plum" x="452" y={y + 42} width="186" height="40" rx="2" />
                <text className="t" x="466" y={y + 67}>Envoy proxies</text>
              </>
            )}
            {i === 2 && (
              <>
                <rect className="n plum" x="452" y={mid - 30} width="186" height="60" rx="2" />
                <text className="t" x="466" y={mid - 4}>host data plane</text>
                <text className="s" x="466" y={mid + 16}>steers, never ends it</text>
              </>
            )}
            {i > 0 && (
              <>
                <line className="w green" x1="166" y1={mid} x2="449" y2={mid} markerEnd="url(#dd-ah-green)" />
                <line className="w green" x1="638" y1={mid} x2="757" y2={mid} markerEnd="url(#dd-ah-green)" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

const COLS = [
  ["External", "global"],
  ["External", "regional"],
  ["Internal", "cross-region"],
  ["Internal", "regional"],
] as const;
const GFE = "Google Front Ends";
const ENVOY = "Envoy · proxy subnet";
const HOST = "host data plane";
const ROWS: { title: string; sub: string; cells: (string | null)[] }[] = [
  { title: "Application", sub: "L7 · proxy", cells: [GFE, ENVOY, ENVOY, ENVOY] },
  { title: "Proxy Network", sub: "L4 · proxy", cells: [GFE, ENVOY, ENVOY, ENVOY] },
  { title: "Passthrough Network", sub: "L4 · passthrough", cells: [null, HOST, null, HOST] },
];

/** Every load balancer that exists, as layer and mode against reach and spread. */
export function FigFamily() {
  return (
    <svg
      viewBox="0 0 960 310"
      role="img"
      aria-label="The load balancer family as a grid. Columns: external global, external regional, internal cross-region, internal regional. Application load balancers and proxy Network load balancers exist in all four; the external global ones run on Google Front Ends and the rest on Envoy in a proxy-only subnet. Passthrough Network load balancers exist only as external regional and internal regional, and run in the host data plane. Kadé's is the external global Application load balancer."
    >
      {COLS.map(([reach, spread], c) => (
        <g key={reach + spread}>
          <text className="t" x={250 + c * 180} y="30">{reach}</text>
          <text className="s" x={250 + c * 180} y="50">{spread}</text>
        </g>
      ))}
      {ROWS.map((row, r) => {
        const y = 68 + r * 80;
        return (
          <g key={row.title}>
            <text className="t" x="16" y={y + 28}>{row.title}</text>
            <text className="s" x="16" y={y + 48}>{row.sub}</text>
            {row.cells.map((cell, c) => {
              const x = 236 + c * 180;
              const kade = r === 0 && c === 0;
              return cell ? (
                <g key={c}>
                  <rect className={kade ? "n plum cur" : "n plum"} x={x} y={y} width="168" height="64" rx="2" />
                  <text className="s" x={x + 14} y={y + (kade ? 28 : 38)}>{cell}</text>
                  {kade && <text className="t" x={x + 14} y={y + 50}>{"Kadé's"}</text>}
                </g>
              ) : (
                <g key={c}>
                  <rect className="ghost" x={x} y={y} width="168" height="64" rx="2" />
                  <text className="s f" x={x + 14} y={y + 38}>does not exist</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
