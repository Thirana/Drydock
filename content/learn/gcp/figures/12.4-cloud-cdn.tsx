// Drawings for this chapter. Classes are styled by `.dd-fig` in globals.css;
// arrowheads come from <DiagramDefs />. Wires are straight or square elbows.

const TRIPS = [
  { title: "1 · first request: a miss", cdn: "no copy: fetch one, keep it", origin: "sends rice.jpg", reach: "full" },
  { title: "2 · next requests: a hit", cdn: "has a copy: answers here", origin: "", reach: "none" },
  { title: "3 · after the TTL: a check", cdn: "copy too old: asks first", origin: "304: not changed", reach: "ask" },
] as const;

/** Miss, hit and revalidation: how far each request travels. */
export function FigHitMiss() {
  return (
    <svg
      viewBox="0 0 960 306"
      role="img"
      aria-label="Three requests for the same image. The first is a miss: Cloud CDN has no copy, fetches it from the bucket and keeps it. The next requests are hits: Cloud CDN answers from its copy and the bucket is not contacted. After the TTL runs out, Cloud CDN asks the bucket whether the file changed; the bucket answers 304 not changed and the copy is used again."
    >
      {TRIPS.map((trip, i) => {
        const y = 12 + i * 98;
        return (
          <g key={trip.title}>
            <text className="s" x="16" y={y + 12} style={{ fontWeight: 700 }}>{trip.title}</text>
            <rect className="n" x="16" y={y + 26} width="150" height="52" rx="2" />
            <text className="t" x="30" y={y + 57}>Shopper</text>
            <rect className="n plum" x="330" y={y + 26} width="260" height="52" rx="2" />
            <text className="t" x="344" y={y + 48}>Cloud CDN</text>
            <text className="s" x="344" y={y + 68}>{trip.cdn}</text>
            <line className="w green" x1="166" y1={y + 52} x2="327" y2={y + 52} markerEnd="url(#dd-ah-green)" />
            <g className={trip.reach === "none" ? "off" : undefined}>
              <rect className="n teal" x="760" y={y + 26} width="184" height="52" rx="2" />
              <text className="t" x="774" y={y + 48}>bucket</text>
              <text className="s" x="774" y={y + 68}>{trip.origin || "not contacted"}</text>
            </g>
            {trip.reach !== "none" && (
              <line className={trip.reach === "ask" ? "w green dash" : "w green"} x1="590" y1={y + 52} x2="757" y2={y + 52} markerEnd="url(#dd-ah-green)" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

const EDGES = [
  { y: 24, who: "Shopper, Colombo", cache: "has rice.jpg: hit", hit: true },
  { y: 94, who: "Visitor, Singapore", cache: "empty: miss, then fills", hit: false },
  { y: 164, who: "Visitor, London", cache: "empty: miss, then fills", hit: false },
] as const;

/** Every edge location keeps its own cache. */
export function FigEdges() {
  return (
    <svg
      viewBox="0 0 960 232"
      role="img"
      aria-label="Three visitors in Colombo, Singapore and London each reach a different Google edge location, and each location keeps its own cache. Colombo already has the image, so that is a hit. Singapore and London do not, so each has its own first miss and fetches the image from the one bucket."
    >
      {EDGES.map((edge) => (
        <g key={edge.who}>
          <rect className="n" x="16" y={edge.y} width="200" height="52" rx="2" />
          <text className="t" x="30" y={edge.y + 31}>{edge.who}</text>
          <rect className="n plum" x="330" y={edge.y} width="250" height="52" rx="2" />
          <text className="t" x="344" y={edge.y + 22}>edge cache</text>
          <text className="s" x="344" y={edge.y + 42}>{edge.cache}</text>
          <line className="w green" x1="216" y1={edge.y + 26} x2="327" y2={edge.y + 26} markerEnd="url(#dd-ah-green)" />
        </g>
      ))}
      <rect className="n teal" x="760" y="94" width="184" height="52" rx="2" />
      <text className="t" x="774" y="116">bucket</text>
      <text className="s" x="774" y="136">kade-static-assets</text>
      {/* The two misses join one trunk into the bucket. */}
      <line className="w green" x1="580" y1="120" x2="757" y2="120" markerEnd="url(#dd-ah-green)" />
      <path className="w green" d="M580 190 H680 V120" />
      <text className="s" x="600" y="50">no trip: answered here</text>
    </svg>
  );
}

const CHECKS = [
  { x: 16, title: "1 · a GET", sub: "not POST or PUT" },
  { x: 206, title: "2 · no cookie", sub: "no Set-Cookie" },
  { x: 396, title: "3 · not private", sub: "no private, no-store" },
  { x: 586, title: "4 · mode says yes", sub: "see the three below" },
] as const;

/** A response must pass every check to be stored. */
export function FigCacheable() {
  return (
    <svg
      viewBox="0 0 960 180"
      role="img"
      aria-label="A response is stored at the edge only if it passes four checks in a row. One: the request was a GET. Two: the response sets no cookie. Three: its Cache-Control does not say private or no-store. Four: the backend's cache mode agrees. Failing any check means it is not stored, and every request for it goes to the origin."
    >
      {CHECKS.map((check, i) => (
        <g key={check.title}>
          <rect className="n amber" x={check.x} y="24" width="164" height="64" rx="2" />
          <text className="t" x={check.x + 14} y="50">{check.title}</text>
          <text className="s" x={check.x + 14} y="72">{check.sub}</text>
          <line className="w green" x1={check.x + 164} y1="56" x2={check.x + 187} y2="56" markerEnd="url(#dd-ah-green)" />
          <line className="w fault dash" x1={check.x + 82} y1="88" x2={check.x + 82} y2="116" />
          {i === 0 && <text className="s flt" x="16" y="140">fails any one: not stored, every request goes to the origin</text>}
        </g>
      ))}
      <path className="w fault dash" d="M98 116 H668" />
      <rect className="n plum" x="776" y="24" width="168" height="64" rx="2" />
      <text className="t" x="790" y="50">stored</text>
      <text className="s" x="790" y="72">at the edge</text>
    </svg>
  );
}

const CLOCKS = [
  { y: 30, title: "The origin says", sub: "max-age = 7 days", w: 560, kind: "ghost", note: "" },
  { y: 96, title: "The edge keeps it", sub: "max TTL caps it at 1 day", w: 240, kind: "n plum", note: "" },
  { y: 162, title: "A browser keeps it", sub: "client TTL caps it at 1 hour", w: 70, kind: "n", note: "" },
] as const;

/** Three clocks on one response: the origin's wish, the edge's cap, the browser's cap. */
export function FigTtl() {
  return (
    <svg
      viewBox="0 0 960 224"
      role="img"
      aria-label="One response and three lifetimes. The origin asks for 7 days with max-age. The edge keeps it for at most the max TTL, 1 day. A browser is told to keep it for at most the client TTL, 1 hour. Each cap can only shorten the origin's value, never lengthen it."
    >
      {CLOCKS.map((clock) => (
        <g key={clock.title}>
          <text className="t" x="16" y={clock.y + 18}>{clock.title}</text>
          <text className="s" x="16" y={clock.y + 38}>{clock.sub}</text>
          <rect className={clock.kind} x="330" y={clock.y} width={clock.w} height="44" rx="2" />
        </g>
      ))}
      <text className="s f" x="344" y="57">7 days</text>
      <text className="s" x="344" y="123">1 day</text>
      <text className="s" x="414" y="189">1 hour</text>
    </svg>
  );
}

const URL_PARTS = [
  { x: 16, w: 100, text: "https", what: "protocol", sub: "in the key" },
  { x: 132, w: 170, text: "www.kade.lk", what: "host", sub: "in the key" },
  { x: 318, w: 220, text: "/media/rice-640w.jpg", what: "path", sub: "always in the key" },
  { x: 554, w: 390, text: "?fmt=webp&utm_source=mail", what: "query string", sub: "in the key, unless you say otherwise" },
] as const;

/** The parts of a URL that make up the default cache key. */
export function FigKey() {
  return (
    <svg
      viewBox="0 0 960 142"
      role="img"
      aria-label="A URL split into four parts: the protocol https, the host www.kade.lk, the path /media/rice-640w.jpg and the query string fmt=webp and utm_source=mail. By default all four are part of the cache key. The query string is the part you usually need to change."
    >
      {URL_PARTS.map((part, i) => (
        <g key={part.what}>
          <rect className={i === 3 ? "n amber" : "n"} x={part.x} y="16" width={part.w} height="44" rx="2" />
          <text className="s mid" x={part.x + part.w / 2} y="43" style={{ fontWeight: 700 }}>{part.text}</text>
          <line className="w" x1={part.x + part.w / 2} y1="60" x2={part.x + part.w / 2} y2="76" />
          <text className="t mid" x={part.x + part.w / 2} y="96">{part.what}</text>
          <text className="s f mid" x={part.x + part.w / 2} y="116">{part.sub}</text>
        </g>
      ))}
    </svg>
  );
}

/** Who still holds the old file after you replace it, and what an invalidation reaches. */
export function FigUpdate() {
  return (
    <svg
      viewBox="0 0 960 262"
      role="img"
      aria-label="After banner.jpg is replaced in the bucket, two places still hold the old copy: browsers, for up to 1 hour, and Cloud CDN's edge caches, for up to 1 day. An invalidation clears the edge caches. No command reaches a browser. A new file name, banner.8c1d.jpg, avoids the problem: no cache has it, so the next request gets the new file."
    >
      <rect className="n" x="16" y="30" width="240" height="60" rx="2" />
      <text className="t" x="30" y="56">browsers</text>
      <text className="s" x="30" y="76">old copy · up to 1 hour</text>
      <rect className="n plum" x="360" y="30" width="240" height="60" rx="2" />
      <text className="t" x="374" y="56">Cloud CDN edges</text>
      <text className="s" x="374" y="76">old copy · up to 1 day</text>
      <rect className="n teal" x="704" y="30" width="240" height="60" rx="2" />
      <text className="t" x="718" y="56">bucket</text>
      <text className="s" x="718" y="76">new banner.jpg</text>
      <line className="w" x1="256" y1="60" x2="357" y2="60" markerEnd="url(#dd-ah-muted)" />
      <line className="w" x1="600" y1="60" x2="701" y2="60" markerEnd="url(#dd-ah-muted)" />

      <line className="w fault dash" x1="136" y1="90" x2="136" y2="112" />
      <text className="s flt mid" x="136" y="132">no command reaches these</text>
      <line className="w" x1="480" y1="90" x2="480" y2="112" />
      <text className="s mid" x="480" y="132">an invalidation clears these</text>

      <rect className="n green" x="16" y="182" width="928" height="60" rx="2" />
      <text className="t" x="30" y="208">a new name instead: banner.8c1d.jpg</text>
      <text className="s" x="30" y="228">no browser and no edge has a copy, so the next request gets the new file</text>
      <text className="s" x="16" y="170">the other way</text>
    </svg>
  );
}

/** A copy's life: fresh, then stale but still useful, then gone. */
export function FigStale() {
  return (
    <svg
      viewBox="0 0 960 170"
      role="img"
      aria-label="The life of a cached copy on a time line. While fresh, it is served as it is. After the TTL it is stale: with serve-while-stale on, shoppers still get it at once while Cloud CDN refreshes it in the background, and they keep getting it if the origin is down. After the serve-while-stale time it is gone, and the request must reach the origin."
    >
      <rect className="n green" x="16" y="40" width="320" height="52" rx="2" />
      <text className="t" x="30" y="62">fresh</text>
      <text className="s" x="30" y="82">served as it is</text>
      <rect className="n mark" x="336" y="40" width="400" height="52" rx="2" />
      <text className="t" x="350" y="62">stale, still served</text>
      <text className="s" x="350" y="82">refreshed in the background</text>
      <rect className="ghost" x="736" y="40" width="208" height="52" rx="2" />
      <text className="t f" x="750" y="62">gone</text>
      <text className="s f" x="750" y="82">must reach the origin</text>
      <line className="w" x1="336" y1="28" x2="336" y2="104" />
      <text className="s mid" x="336" y="20">TTL ends</text>
      <line className="w" x1="736" y1="28" x2="736" y2="104" />
      <text className="s mid" x="736" y="20">serve-while-stale ends</text>
      <text className="s mid" x="536" y="126">origin slow or down? shoppers still get an answer</text>
      <text className="s f mid" x="536" y="146">only with serve-while-stale turned on</text>
    </svg>
  );
}

/** A signed URL: the app vouches for one file, for a short time. */
export function FigSigned() {
  return (
    <svg
      viewBox="0 0 960 250"
      role="img"
      aria-label="kade-api signs a URL for one invoice, valid for 10 minutes, and gives it to the shopper. The shopper requests it from Cloud CDN, which checks the signature and the expiry and then reads the file from a private bucket that only Cloud CDN may read. Anyone else, with no signature or an expired one, gets a 403."
    >
      <rect className="n" x="16" y="36" width="170" height="64" rx="2" />
      <text className="t" x="30" y="62">kade-api</text>
      <text className="s" x="30" y="82">signs the URL</text>
      <rect className="n" x="270" y="36" width="170" height="64" rx="2" />
      <text className="t" x="284" y="62">Shopper</text>
      <text className="s" x="284" y="82">owns invoice 1042</text>
      <rect className="n amber" x="524" y="36" width="190" height="64" rx="2" />
      <text className="t" x="538" y="62">Cloud CDN checks</text>
      <text className="s" x="538" y="82">signature · expiry</text>
      <rect className="n teal" x="790" y="36" width="154" height="64" rx="2" />
      <text className="t" x="804" y="62">private bucket</text>
      <text className="s" x="804" y="82">CDN-only read</text>
      <line className="w" x1="186" y1="68" x2="267" y2="68" markerEnd="url(#dd-ah-muted)" />
      <text className="s mid" x="228" y="24">signed link, 10 min</text>
      <line className="w green" x1="440" y1="68" x2="521" y2="68" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="714" y1="68" x2="787" y2="68" markerEnd="url(#dd-ah-green)" />

      <rect className="n fault" x="270" y="170" width="170" height="64" rx="2" />
      <text className="t" x="284" y="196">Anyone else</text>
      <text className="s" x="284" y="216">guesses the URL</text>
      <path className="w fault dash" d="M440 202 H619 V124" />
      <text className="x" x="619" y="118">✕</text>
      <text className="s flt" x="636" y="206">no signature, or expired: 403</text>
    </svg>
  );
}

/** What goes wrong when a personal response is cached. */
export function FigLeak() {
  return (
    <svg
      viewBox="0 0 960 236"
      role="img"
      aria-label="With FORCE_CACHE_ALL on the API, shopper A requests /api/orders. Cloud CDN passes it to kade-api and keeps a copy of A's orders. Then shopper B requests the same URL, and Cloud CDN answers from its copy: B receives A's orders, and kade-api is never asked."
    >
      <text className="s" x="16" y="22" style={{ fontWeight: 700 }}>GET /api/orders · cache mode FORCE_CACHE_ALL</text>
      <rect className="n" x="16" y="40" width="160" height="60" rx="2" />
      <text className="t" x="30" y="66">Shopper A</text>
      <text className="s" x="30" y="86">logged in</text>
      <rect className="n plum" x="330" y="40" width="270" height="60" rx="2" />
      <text className="t" x="344" y="66">Cloud CDN</text>
      <text className="s" x="344" y="86">{"keeps a copy of A's orders"}</text>
      <rect className="n plum" x="760" y="40" width="184" height="60" rx="2" />
      <text className="t" x="774" y="66">kade-api</text>
      <text className="s" x="774" y="86">{"returns A's orders"}</text>
      <line className="w green" x1="176" y1="70" x2="327" y2="70" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="600" y1="70" x2="757" y2="70" markerEnd="url(#dd-ah-green)" />

      <rect className="n" x="16" y="150" width="160" height="60" rx="2" />
      <text className="t" x="30" y="176">Shopper B</text>
      <text className="s" x="30" y="196">someone else</text>
      <rect className="n fault" x="330" y="150" width="270" height="60" rx="2" />
      <text className="t" x="344" y="176">Cloud CDN</text>
      <text className="s" x="344" y="196">same URL: a hit</text>
      <g className="off">
        <rect className="n plum" x="760" y="150" width="184" height="60" rx="2" />
        <text className="t" x="774" y="176">kade-api</text>
        <text className="s" x="774" y="196">never asked</text>
      </g>
      <line className="w" x1="176" y1="166" x2="327" y2="166" markerEnd="url(#dd-ah-muted)" />
      <line className="w fault" x1="330" y1="194" x2="179" y2="194" markerEnd="url(#dd-ah-fault)" />
      <text className="s flt mid" x="252" y="226">{"gets A's orders"}</text>
    </svg>
  );
}

const CACHE_LINES: [text: string, says: string][] = [
  ["httpRequest.cacheLookup: true", "the cache was checked"],
  ["httpRequest.cacheHit: true", "answered from the cache"],
  ["httpRequest.cacheValidatedWithOriginServer: false", "true = it asked the origin first"],
  ['jsonPayload.statusDetails: "response_from_cache"', "who answered, in words"],
  ['jsonPayload.cacheId: "SIN-4d2a81"', "which edge location"],
];

/** The cache's part of a load balancer log entry. */
export function FigCacheLog() {
  return (
    <svg
      viewBox="0 0 960 190"
      role="img"
      aria-label="The cache fields of a load balancer log entry. cacheLookup true: the cache was checked. cacheHit true: answered from the cache. cacheValidatedWithOriginServer: when true, Cloud CDN asked the origin first. statusDetails response_from_cache: who answered. cacheId: which edge location."
    >
      <rect className="n" x="16" y="16" width="560" height="160" rx="2" />
      {CACHE_LINES.map(([text, says], i) => {
        const y = 44 + i * 28;
        return (
          <g key={text}>
            <text className="s" x="32" y={y + 4} style={{ fontWeight: 700 }}>{text}</text>
            <line className="w amber" x1="646" y1={y} x2="579" y2={y} markerEnd="url(#dd-ah-amber)" />
            <text className="s" x="658" y={y + 4}>{says}</text>
          </g>
        );
      })}
    </svg>
  );
}
