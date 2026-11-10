// Drawings for this chapter. Classes are styled by `.dd-fig` in globals.css;
// arrowheads come from <DiagramDefs />. Wires are straight or square elbows.

/** The order of checks at Google's front end, and the cache hit that skips the backend policy. */
export function FigWhere() {
  return (
    <svg
      viewBox="0 0 960 282"
      role="img"
      aria-label="A request from a shopper reaches Google's front end. The edge security policy checks it first, then Cloud CDN looks in its cache, then the backend security policy checks it, and only then does it reach kade-api. Either policy can refuse the request. A cache hit is answered from Cloud CDN straight back to the shopper, so the backend policy never runs for it."
    >
      <rect className="n" x="16" y="90" width="140" height="60" rx="2" />
      <text className="t" x="30" y="116">Shopper</text>
      <text className="s" x="30" y="136">203.0.113.99</text>

      <rect className="zone plum" x="200" y="40" width="500" height="170" rx="2" />
      <text className="s" x="216" y="62">{"Google's front end"}</text>
      <rect className="n amber" x="216" y="90" width="150" height="60" rx="2" />
      <text className="t" x="230" y="116">1 edge policy</text>
      <text className="s" x="230" y="136">IP, country</text>
      <rect className="n plum" x="396" y="90" width="120" height="60" rx="2" />
      <text className="t" x="410" y="116">2 Cloud CDN</text>
      <text className="s" x="410" y="136">cache</text>
      <rect className="n amber" x="546" y="90" width="138" height="60" rx="2" />
      <text className="t" x="558" y="116">3 backend policy</text>
      <text className="s" x="558" y="136">all rule types</text>

      <rect className="n plum" x="780" y="90" width="164" height="60" rx="2" />
      <text className="t" x="794" y="116">kade-api</text>
      <text className="s" x="794" y="136">Cloud Run</text>

      <line className="w green" x1="156" y1="120" x2="213" y2="120" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="366" y1="120" x2="393" y2="120" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="516" y1="120" x2="543" y2="120" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="684" y1="120" x2="777" y2="120" markerEnd="url(#dd-ah-green)" />

      <line className="w fault dash" x1="291" y1="150" x2="291" y2="176" />
      <text className="s flt mid" x="291" y="194">refused</text>
      <line className="w fault dash" x1="615" y1="150" x2="615" y2="176" />
      <text className="s flt mid" x="615" y="194">403 · 404 · 429</text>

      {/* A cache hit turns back before the backend policy. */}
      <path className="w green" d="M456 150 V240 H86 V153" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="110" y="262">cache hit: answered here, and the backend policy never runs</text>
    </svg>
  );
}

const PARTS = [
  { x: 16, w: 110, text: "1000", what: "priority", sub: "lowest first" },
  { x: 142, w: 420, text: "evaluatePreconfiguredWaf('sqli-v33-stable')", what: "match", sub: "which requests" },
  { x: 578, w: 150, text: "deny-403", what: "action", sub: "what happens" },
  { x: 744, w: 200, text: "preview: off", what: "preview", sub: "on = log only" },
] as const;

/** The four parts of one rule. */
export function FigRule() {
  return (
    <svg
      viewBox="0 0 960 142"
      role="img"
      aria-label="One Cloud Armor rule has four parts. Priority: a number, and the lowest is checked first. Match: which requests the rule applies to, here the preconfigured SQL injection rule set. Action: what happens to them, here deny with 403. Preview: when on, the rule only logs and blocks nothing."
    >
      {PARTS.map((part) => (
        <g key={part.what}>
          <rect className="n amber" x={part.x} y="16" width={part.w} height="44" rx="2" />
          <text className="s mid" x={part.x + part.w / 2} y="43" style={{ fontWeight: 700 }}>{part.text}</text>
          <line className="w" x1={part.x + part.w / 2} y1="60" x2={part.x + part.w / 2} y2="76" />
          <text className="t mid" x={part.x + part.w / 2} y="96">{part.what}</text>
          <text className="s f mid" x={part.x + part.w / 2} y="116">{part.sub}</text>
        </g>
      ))}
    </svg>
  );
}

const LEVELS = [
  { n: 1, w: 120, false: "rare", note: "start here" },
  { n: 2, w: 240, false: "some", note: "" },
  { n: 3, w: 360, false: "common", note: "" },
  { n: 4, w: 480, false: "many: needs careful tuning", note: "" },
] as const;

/** Sensitivity: each level switches on more signatures, and more false positives. */
export function FigSensitivity() {
  return (
    <svg
      viewBox="0 0 960 222"
      role="img"
      aria-label="The four sensitivity levels of a preconfigured WAF rule set. Level 1 switches on the fewest signatures and false positives are rare: start here. Each higher level adds more signatures and more false positives. Level 4 switches on all of them and needs careful tuning."
    >
      <text className="s" x="170" y="22">signatures switched on</text>
      <text className="s" x="690" y="22">false positives</text>
      {LEVELS.map((level, i) => {
        const y = 36 + i * 46;
        return (
          <g key={level.n}>
            <text className="t" x="16" y={y + 21}>sensitivity {level.n}</text>
            <rect className="n amber" x="170" y={y} width={level.w} height="32" rx="2" />
            <text className={i === 3 ? "s flt" : "s"} x="690" y={y + 21}>{level.false}</text>
            {level.note && <text className="s" x={170 + level.w + 14} y={y + 21} style={{ fontWeight: 700 }}>{`← ${level.note}`}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/** Only the start of a request body is inspected. */
export function FigBody() {
  return (
    <svg
      viewBox="0 0 960 138"
      role="img"
      aria-label="A 64 KB POST body drawn as a bar. Only the first 8 KB is inspected by the WAF rules. The rest is not inspected, so an attack placed after the first 8 KB passes."
    >
      <text className="s" x="16" y="28">POST body · 64 KB</text>
      <rect className="n amber" x="16" y="44" width="180" height="44" rx="2" />
      <text className="t" x="30" y="71">first 8 KB</text>
      <rect className="ghost" x="196" y="44" width="748" height="44" rx="2" />
      <text className="s f" x="214" y="71">the rest: not inspected</text>
      <line className="w" x1="106" y1="88" x2="106" y2="104" />
      <text className="s mid" x="106" y="122">inspected</text>
      <line className="w fault dash" x1="570" y1="88" x2="570" y2="104" />
      <text className="s flt mid" x="570" y="122">an attack placed here passes the WAF rules</text>
    </svg>
  );
}

const STEPS = [
  { title: "1 · Add in preview", sub: "--preview" },
  { title: "2 · Read the logs", sub: "a week of traffic" },
  { title: "3 · Tune", sub: "opt out, exclude" },
  { title: "4 · Enforce", sub: "--no-preview" },
  { title: "5 · Keep watching", sub: "alert on denies" },
] as const;

/** The rollout loop: preview, read, tune, and only then enforce. */
export function FigRollout() {
  return (
    <svg
      viewBox="0 0 960 190"
      role="img"
      aria-label="Rolling out a WAF rule in five steps. One: add it in preview. Two: read the logs over a week of real traffic. Three: tune it, by opting out of rule IDs or excluding fields, and go back to reading the logs until no real shopper is caught. Four: enforce it. Five: keep watching, with an alert on denies."
    >
      {STEPS.map((step, i) => {
        const x = 16 + i * 192;
        return (
          <g key={step.title}>
            <rect className={i === 3 ? "n amber" : "n"} x={x} y="30" width="160" height="70" rx="2" />
            <text className="t" x={x + 12} y="60">{step.title}</text>
            <text className="s" x={x + 12} y="82">{step.sub}</text>
            {i > 0 && <line className="w" x1={x - 32} y1="65" x2={x - 3} y2="65" markerEnd="url(#dd-ah-muted)" />}
          </g>
        );
      })}
      {/* Tune, then look again. */}
      <path className="w" d="M480 100 V136 H288 V103" markerEnd="url(#dd-ah-muted)" />
      <text className="s mid" x="384" y="158">repeat until no real shopper is caught</text>
    </svg>
  );
}

/** Behind another proxy, the connection's address is the proxy's, not the visitor's. */
export function FigUserIp() {
  return (
    <svg
      viewBox="0 0 960 176"
      role="img"
      aria-label="A shopper at 203.0.113.99 connects to Cloudflare, and Cloudflare at 173.245.48.10 connects to Google. Cloud Armor's origin.ip is therefore Cloudflare's address, the same for every shopper. The shopper's own address arrives in the CF-Connecting-IP header."
    >
      <rect className="n" x="16" y="30" width="180" height="70" rx="2" />
      <text className="t" x="30" y="60">Shopper</text>
      <text className="s" x="30" y="82">203.0.113.99</text>
      <rect className="n" x="270" y="30" width="190" height="70" rx="2" />
      <text className="t" x="284" y="60">Cloudflare</text>
      <text className="s" x="284" y="82">173.245.48.10</text>
      <rect className="n amber" x="534" y="30" width="410" height="70" rx="2" />
      <text className="t" x="548" y="56">Cloud Armor sees</text>
      <text className="s" x="548" y="76">origin.ip = 173.245.48.10</text>
      <text className="s" x="548" y="92">CF-Connecting-IP: 203.0.113.99</text>
      <line className="w green" x1="196" y1="65" x2="267" y2="65" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="460" y1="65" x2="531" y2="65" markerEnd="url(#dd-ah-green)" />
      <line className="w" x1="739" y1="100" x2="739" y2="118" />
      <text className="s mid" x="739" y="138">every shopper has the same origin.ip:</text>
      <text className="s mid" x="739" y="156">count and block by the header instead</text>
    </svg>
  );
}

const mark = { fontWeight: 700, textDecoration: "underline" } as const;

/** Three ways a request reaches a backend without the policy judging it. */
export function FigPast() {
  const lanes = [12, 112, 212];
  return (
    <svg
      viewBox="0 0 960 312"
      role="img"
      aria-label="Three ways traffic gets past a Cloud Armor policy. One: a backend service with no policy attached, so the load balancer passes the request straight to that backend. Two: a way around the load balancer, such as a run.app address or a VM's external IP, so the policy is never asked. Three: a cache hit, where Cloud CDN answers before the backend policy runs."
    >
      {lanes.map((y, i) => (
        <g key={y}>
          <text className="s" x="16" y={y + 12} style={{ fontWeight: 700 }}>
            {["1 · a backend service without a policy", "2 · a way around the load balancer", "3 · a cache hit"][i]}
          </text>
          <rect className="n fault" x="16" y={y + 30} width="150" height="52" rx="2" />
          <text className="t" x="30" y={y + 61}>Attacker</text>
        </g>
      ))}

      {/* 1: through the load balancer, but nothing is attached to this backend service. */}
      <rect className="n plum" x="250" y="42" width="180" height="52" rx="2" />
      <text className="t" x="264" y="73">load balancer</text>
      <rect className="ghost" x="500" y="42" width="180" height="52" rx="2" />
      <text className="s f" x="514" y="73">no policy attached</text>
      <rect className="n teal" x="760" y="42" width="184" height="52" rx="2" />
      <text className="t" x="774" y="73">kade-media</text>
      <line className="w fault" x1="166" y1="68" x2="247" y2="68" markerEnd="url(#dd-ah-fault)" />
      <line className="w fault" x1="430" y1="68" x2="497" y2="68" markerEnd="url(#dd-ah-fault)" />
      <line className="w fault" x1="680" y1="68" x2="757" y2="68" markerEnd="url(#dd-ah-fault)" />

      {/* 2: never through the load balancer at all. */}
      <g className="off">
        <rect className="n amber" x="400" y="118" width="200" height="30" rx="2" />
        <text className="t" x="414" y="138">policy: never asked</text>
      </g>
      <line className="w fault" x1="166" y1="168" x2="757" y2="168" markerEnd="url(#dd-ah-fault)" />
      <text className="s mid" x="462" y="188">a run.app address, or a VM&apos;s external IP</text>
      <rect className="n plum" x="760" y="142" width="184" height="52" rx="2" />
      <text className="t" x="774" y="173">kade-api</text>

      {/* 3: answered from the cache, before the backend policy. */}
      <rect className="n plum" x="250" y="242" width="180" height="52" rx="2" />
      <text className="t" x="264" y="266">Cloud CDN</text>
      <text className="s" x="264" y="284">answers from cache</text>
      <line className="w fault" x1="166" y1="268" x2="247" y2="268" markerEnd="url(#dd-ah-fault)" />
      <g className="off">
        <rect className="n amber" x="500" y="242" width="180" height="52" rx="2" />
        <text className="t" x="514" y="273">backend policy</text>
        <rect className="n teal" x="760" y="242" width="184" height="52" rx="2" />
        <text className="t" x="774" y="273">backend</text>
      </g>
    </svg>
  );
}

/** The default rule turns the policy into a block list or an allow list. */
export function FigDefault() {
  const panels = [
    { x: 0, title: "default allow: a block list", rules: "deny rules", gets: "gets the rest", out: "what a rule names", wide: "main" },
    { x: 480, title: "default deny: an allow list", rules: "allow rules", gets: "gets only those", out: "everything else", wide: "out" },
  ] as const;
  return (
    <svg
      viewBox="0 0 960 196"
      role="img"
      aria-label="Two kinds of policy. With a default of allow, the policy is a block list: deny rules stop only what they name and everything else reaches kade-api. With a default of deny, it is an allow list: allow rules let through only what they name and everything else is refused."
    >
      {panels.map((p) => (
        <g key={p.title}>
          <text className="t" x={p.x + 16} y="26">{p.title}</text>
          <rect className="n" x={p.x + 16} y="46" width="110" height="56" rx="2" />
          <text className="t" x={p.x + 28} y="70">requests</text>
          <text className="s" x={p.x + 28} y="90">all of them</text>
          <rect className="n amber" x={p.x + 176} y="46" width="130" height="56" rx="2" />
          <text className="t" x={p.x + 190} y="79">{p.rules}</text>
          <rect className="n plum" x={p.x + 346} y="46" width="118" height="56" rx="2" />
          <text className="t" x={p.x + 358} y="70">kade-api</text>
          <text className="s" x={p.x + 358} y="90">{p.gets}</text>
          <line className="w green" x1={p.x + 126} y1="74" x2={p.x + 173} y2="74" strokeWidth="3" markerEnd="url(#dd-ah-green)" />
          <line className="w green" x1={p.x + 306} y1="74" x2={p.x + 343} y2="74" strokeWidth={p.wide === "main" ? 3 : 1.5} markerEnd="url(#dd-ah-green)" />
          <line className="w fault" x1={p.x + 241} y1="102" x2={p.x + 241} y2="146" strokeWidth={p.wide === "out" ? 3 : 1.5} />
          <text className="x" x={p.x + 241} y="162">✕</text>
          <text className="s flt" x={p.x + 258} y="160">{p.out}</text>
        </g>
      ))}
    </svg>
  );
}

const PIECES = [
  ["from 203.0.113.99", "origin.ip"],
  ["country: LK", "origin.region_code"],
  ["POST", "request.method"],
  ["/api/search", "request.path"],
  ["?q=rice&page=2", "request.query"],
  ["User-Agent: Mozilla/5.0 …", "request.headers['user-agent']"],
] as const;

/** One request, and the name an expression uses for each piece of it. */
export function FigRequest() {
  return (
    <svg
      viewBox="0 0 960 296"
      role="img"
      aria-label="One request and what an expression calls each piece. The address it came from is origin.ip. Its country is origin.region_code. POST is request.method. The path /api/search is request.path. Everything after the question mark is request.query. A header such as User-Agent is request.headers with the name in lower case."
    >
      <text className="s" x="16" y="22">one request</text>
      <text className="s" x="420" y="22">what an expression calls it</text>
      <rect className="n" x="16" y="34" width="330" height="250" rx="2" />
      {PIECES.map(([piece, name], i) => {
        const y = 62 + i * 40;
        return (
          <g key={name}>
            <text className="s" x="32" y={y + 4} style={{ fontWeight: 700 }}>{piece}</text>
            <line className="w amber" x1="346" y1={y} x2="417" y2={y} markerEnd="url(#dd-ah-amber)" />
            <rect className="n amber" x="420" y={y - 16} width="290" height="32" rx="2" />
            <text className="s" x="434" y={y + 4}>{name}</text>
          </g>
        );
      })}
      <text className="s" x="730" y="266">header names are</text>
      <text className="s" x="730" y="284">written in lower case</text>
    </svg>
  );
}

/** A signature catches a pattern: the same pattern can be an attack or a shopper. */
export function FigSignature() {
  return (
    <svg
      viewBox="0 0 960 216"
      role="img"
      aria-label="Two requests caught by SQL injection signatures. The first, q equals quote OR quote 1 quote equals quote 1, is a real attack and is correctly denied. The second, a search for rice 'n' curry, double dash, 5kg, contains a quote and a double dash, so a signature also matches it: a false positive that blocks a real shopper."
    >
      <text className="t" x="16" y="52">an attack</text>
      <rect className="n" x="150" y="24" width="360" height="48" rx="2" />
      <text className="s" x="166" y="53">
        q=<tspan style={mark}>{"' OR '1'='1"}</tspan>
      </text>
      <rect className="n amber" x="580" y="24" width="200" height="48" rx="2" />
      <text className="t" x="594" y="53">a signature matches</text>
      <rect className="n fault" x="850" y="24" width="94" height="48" rx="2" />
      <text className="t" x="866" y="53">403</text>
      <line className="w" x1="510" y1="48" x2="577" y2="48" markerEnd="url(#dd-ah-muted)" />
      <line className="w fault" x1="780" y1="48" x2="847" y2="48" markerEnd="url(#dd-ah-fault)" />
      <text className="s" x="150" y="94">correct: this is SQL injection</text>

      <text className="t" x="16" y="152">a shopper</text>
      <rect className="n" x="150" y="124" width="360" height="48" rx="2" />
      <text className="s" x="166" y="153">
        q=rice <tspan style={mark}>{"'"}</tspan>n<tspan style={mark}>{"'"}</tspan> curry <tspan style={mark}>--</tspan> 5kg
      </text>
      <rect className="n amber" x="580" y="124" width="200" height="48" rx="2" />
      <text className="t" x="594" y="153">a signature matches</text>
      <rect className="n fault" x="850" y="124" width="94" height="48" rx="2" />
      <text className="t" x="866" y="153">403</text>
      <line className="w" x1="510" y1="148" x2="577" y2="148" markerEnd="url(#dd-ah-muted)" />
      <line className="w fault" x1="780" y1="148" x2="847" y2="148" markerEnd="url(#dd-ah-fault)" />
      <text className="s flt" x="150" y="194">false positive: this is a search for rice</text>
    </svg>
  );
}

const TUNES = [
  { title: "1 · Exclude a field", w: 70, what: "one header, cookie or parameter is not read", when: "one field always holds odd text" },
  { title: "2 · Opt out of a signature", w: 150, what: "one signature off, by its ID", when: "one signature misfires in many fields" },
  { title: "3 · Scope the rule", w: 250, what: "the rule skips one path", when: "only one endpoint has the problem" },
  { title: "4 · Lower the sensitivity", w: 380, what: "a whole level of signatures off", when: "many signatures misfire" },
] as const;

/** Four ways to tune, from the least protection given up to the most. */
export function FigTune() {
  return (
    <svg
      viewBox="0 0 960 246"
      role="img"
      aria-label="Four ways to tune out a false positive, from the least protection given up to the most. One: exclude a field, so one header, cookie or parameter is not read. Two: opt out of one signature by its ID. Three: scope the rule so it skips one path. Four: lower the sensitivity, which switches off a whole level of signatures."
    >
      <text className="s" x="250" y="22">protection given up</text>
      {TUNES.map((tune, i) => {
        const y = 36 + i * 52;
        return (
          <g key={tune.title}>
            <text className="t" x="16" y={y + 24}>{tune.title}</text>
            <rect className="n amber" x="250" y={y} width={tune.w} height="38" rx="2" />
            <text className="s" x={250 + tune.w + 14} y={y + 16}>{tune.what}</text>
            <text className="s f" x={250 + tune.w + 14} y={y + 34}>{`when ${tune.when}`}</text>
          </g>
        );
      })}
    </svg>
  );
}

const KEYS = [
  { x: 16, title: "key: IP", sub: "clients reach Google directly", counters: [["203.0.113.99", 3], ["198.51.100.7", 2], ["192.0.2.44", 1]], bad: "" },
  { x: 332, title: "key: IP, behind a proxy", sub: "everyone arrives as the proxy", counters: [["173.245.48.10", 6]], bad: "one counter: all banned together" },
  { x: 648, title: "key: HTTP-HEADER", sub: "counted by CF-Connecting-IP", counters: [["203.0.113.99", 3], ["198.51.100.7", 2], ["192.0.2.44", 1]], bad: "" },
] as const;

/** The same six requests, counted three ways. */
export function FigKeys() {
  return (
    <svg
      viewBox="0 0 960 232"
      role="img"
      aria-label="The same six requests from three visitors, counted three ways. With key IP and clients reaching Google directly, there are three counters: 3, 2 and 1. With key IP behind a proxy, everyone arrives as the proxy's address, so one counter holds all 6 and all visitors are banned together. With key HTTP-HEADER on CF-Connecting-IP, there are three counters again."
    >
      {KEYS.map((key) => (
        <g key={key.title}>
          <text className="t" x={key.x} y="24">{key.title}</text>
          <text className="s" x={key.x} y="44">{key.sub}</text>
          {key.counters.map(([name, count], i) => (
            <g key={name}>
              <rect className={key.bad ? "n fault" : "n amber"} x={key.x} y={60 + i * 48} width="296" height="40" rx="2" />
              <text className="s" x={key.x + 12} y={85 + i * 48}>{name}</text>
              {Array.from({ length: count }, (_, d) => (
                <circle key={d} className="ok" cx={key.x + 170 + d * 18} cy={80 + i * 48} r="5" />
              ))}
            </g>
          ))}
          {key.bad && <text className="s flt" x={key.x} y="126">{key.bad}</text>}
        </g>
      ))}
    </svg>
  );
}

const LOG_LINES: [text: string, says?: string][] = [
  ['statusDetails: "denied_by_security_policy"', "Cloud Armor refused it, not the app"],
  ["enforcedSecurityPolicy:"],
  ['  name: "kade-edge-policy"'],
  ["  priority: 1000", "which rule decided"],
  ['  configuredAction: "DENY"', "what the rule is set to do"],
  ['  outcome: "DENY"', "what happened to the request"],
  ['  preconfiguredExprIds: ["…id942130-sqli"]', "the signature: the ID to opt out of"],
  ["previewSecurityPolicy: …", "the same, for a rule still in preview"],
];

/** One log entry, with what each line tells you. */
export function FigLog() {
  return (
    <svg
      viewBox="0 0 960 282"
      role="img"
      aria-label="One load balancer log entry for a request Cloud Armor refused. statusDetails says denied by security policy: Cloud Armor refused it, not the app. Under enforcedSecurityPolicy, priority says which rule decided, configuredAction what the rule is set to do, outcome what happened to the request, and preconfiguredExprIds names the signature, which is the ID to opt out of. previewSecurityPolicy holds the same fields for a rule still in preview."
    >
      <rect className="n" x="16" y="16" width="504" height="250" rx="2" />
      {LOG_LINES.map(([text, says], i) => {
        const y = 46 + i * 28;
        return (
          <g key={text}>
            <text className="s" x="32" y={y + 4} style={{ whiteSpace: "pre", fontWeight: says ? 700 : 500 }}>{text}</text>
            {says && (
              <>
                <line className="w amber" x1="596" y1={y} x2="523" y2={y} markerEnd="url(#dd-ah-amber)" />
                <text className="s" x="608" y={y + 4}>{says}</text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
