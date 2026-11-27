// Drawings for this chapter. Classes are styled by `.dd-fig` in globals.css;
// arrowheads come from <DiagramDefs />. Plum is Google's own hardware and
// network, teal is what Kadé creates in its VPC.

/** One numbered level, matching the table under the drawing. */
function Level({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <>
      <circle className="badge" cx={x} cy={y} r="11" />
      <text className="mid" x={x} y={y + 5}>
        {n}
      </text>
    </>
  );
}

/** A physical host in a zone, with the VM Kadé runs on it, if any. */
function Host({ x, y, vm }: { x: number; y: number; vm?: string }) {
  return (
    <>
      <rect className="n" x={x} y={y} width="252" height="104" rx="2" />
      <text className="s" x={x + 14} y={y + 26}>
        host
      </text>
      {vm ? (
        <>
          <rect className="n teal" x={x + 10} y={y + 40} width="232" height="34" rx="2" />
          <text className="t" x={x + 22} y={y + 62}>
            {vm}
          </text>
          <text className="f" x={x + 14} y={y + 94}>
            + other customers
          </text>
        </>
      ) : (
        <text className="f" x={x + 14} y={y + 62}>
          other customers
        </text>
      )}
    </>
  );
}

/** Left edge of each zone column. */
const ZONES = [
  ["a", 48],
  ["b", 340],
  ["c", 632],
] as const;

export function FigLevels() {
  return (
    <svg viewBox="0 0 960 536" role="img" aria-label="Five levels. Google's network joins this region to every other region and to the internet. Region asia-southeast1 in Singapore holds three zones, a, b and c, joined by fast links. Each zone holds physical hosts. kade-api-1 runs on a host in zone a; kade-api-2 and kade-db run on hosts in zone b; zone c has no Kadé VMs. Each host also runs other customers' VMs.">
      <rect className="zone" x="16" y="16" width="928" height="504" rx="2" />
      <Level x={40} y={38} n={1} />
      <text className="s" x="60" y="43">{"Google's network: joins this region to every other region and to the internet (section 04)"}</text>

      <rect className="zone plum" x="32" y="64" width="896" height="440" rx="2" />
      <Level x={56} y={92} n={2} />
      <text className="t" x="76" y="97">region asia-southeast1 · Singapore</text>

      {/* Three zones, each with two hosts. */}
      {ZONES.map(([z, x]) => (
        <g key={z}>
          <rect className="zone panel" x={x} y="120" width="276" height="318" rx="2" />
          <text className="t" x={x === 48 ? 88 : x + 14} y="151">
            zone {z}
          </text>
          <text className="s" x={x + 14} y="178">
            asia-southeast1-{z}
          </text>
        </g>
      ))}
      <Level x={70} y={146} n={3} />

      <Host x={60} y={198} vm="kade-api-1" />
      <Host x={60} y={318} />
      <Host x={352} y={198} vm="kade-api-2" />
      <Host x={352} y={318} vm="kade-db" />
      <Host x={644} y={198} />
      <Host x={644} y={318} />
      <Level x={284} y={219} n={4} />
      <Level x={284} y={255} n={5} />

      {/* Fast links between the zones of one region. */}
      <path className="w plum" d="M186 438 V460 H770 V438" />
      <path className="w plum" d="M478 438 V460" />
      <text className="s mid" x="478" y="488">fast private links between the zones of one region</text>
    </svg>
  );
}

export function FigEdge() {
  return (
    <svg viewBox="0 0 960 416" role="img" aria-label="A shopper in Colombo sends a request to 34.120.88.10. The shopper's ISP hands it to the nearest Google edge, which announces that address. The edge ends TLS and carries the request over Google's backbone to kade-api-1 and kade-api-2 in kade-vpc, in region asia-southeast1, Singapore. Another Google edge announces the same address for shoppers elsewhere. A subnet of kade-vpc in asia-south1, Mumbai, would reach the same VMs over the backbone on internal IPs, with no VPN.">
      <text className="s" x="16" y="52">shoppers elsewhere use</text>
      <text className="s" x="16" y="72">their own nearest edge</text>
      <path className="w" d="M206 56 H366" markerEnd="url(#dd-ah-muted)" />
      <rect className="n plum" x="368" y="24" width="196" height="64" rx="2" />
      <text className="t" x="382" y="50">Another Google edge</text>
      <text className="s" x="382" y="72">also 34.120.88.10</text>

      <rect className="n" x="16" y="144" width="140" height="64" rx="2" />
      <text className="t" x="30" y="170">Shopper</text>
      <text className="s" x="30" y="192">Colombo</text>
      <rect className="n" x="188" y="144" width="140" height="64" rx="2" />
      <text className="t" x="202" y="170">{"Shopper's ISP"}</text>
      <text className="s" x="202" y="192">Sri Lanka</text>
      <rect className="n plum" x="372" y="132" width="192" height="88" rx="2" />
      <text className="t" x="386" y="158">Nearest Google edge</text>
      <text className="s" x="386" y="180">34.120.88.10 here</text>
      <text className="s" x="386" y="200">TLS ends here</text>
      <path className="w" d="M156 176 H186" markerEnd="url(#dd-ah-muted)" />
      <path className="w" d="M328 176 H370" markerEnd="url(#dd-ah-muted)" />

      {/* The backbone: both edges join one trunk into the region. */}
      <path className="w plum" d="M564 56 H652 V176" style={{ strokeWidth: 2.5 }} />
      <path className="w plum" d="M564 176 H652" style={{ strokeWidth: 2.5 }} />
      <path className="w plum" d="M652 176 V138 H706" markerEnd="url(#dd-ah-plum)" style={{ strokeWidth: 2.5 }} />
      <path className="w plum" d="M652 176 V214 H706" markerEnd="url(#dd-ah-plum)" style={{ strokeWidth: 2.5 }} />
      <text className="s mid" x="608" y="246">{"Google's"}</text>
      <text className="s mid" x="608" y="264">backbone</text>

      <rect className="zone plum" x="676" y="16" width="268" height="264" rx="2" />
      <text className="t" x="692" y="40">asia-southeast1</text>
      <text className="s" x="692" y="60">Singapore</text>
      <rect className="zone teal" x="692" y="72" width="236" height="192" rx="2" />
      <text className="s" x="706" y="94">kade-vpc</text>
      <rect className="n teal" x="708" y="110" width="204" height="56" rx="2" />
      <text className="t" x="722" y="134">kade-api-1</text>
      <text className="s" x="722" y="154">zone a</text>
      <rect className="n teal" x="708" y="186" width="204" height="56" rx="2" />
      <text className="t" x="722" y="210">kade-api-2</text>
      <text className="s" x="722" y="230">zone b</text>

      <circle className="badge" cx="349" cy="176" r="11" />
      <text className="mid" x="349" y="181">1</text>
      <circle className="badge" cx="608" cy="176" r="11" />
      <text className="mid" x="608" y="181">2</text>
      <circle className="badge" cx="652" cy="196" r="11" />
      <text className="mid" x="652" y="201">3</text>

      <path className="w plum dash" d="M810 280 V310" />
      <rect className="ghost" x="676" y="312" width="268" height="92" rx="2" />
      <text className="t" x="692" y="336">asia-south1 · Mumbai</text>
      <text className="s" x="692" y="358">same VPC, internal IPs,</text>
      <text className="s" x="692" y="378">over the backbone, no VPN</text>

      <text className="s" x="16" y="320">1 · the ISP hands the request to the nearest edge announcing 34.120.88.10</text>
      <text className="s" x="16" y="344">{"2 · the edge ends TLS and carries the request on Google's own backbone"}</text>
      <text className="s" x="16" y="368">3 · it reaches kade-api in Singapore without crossing the public internet</text>
    </svg>
  );
}

/** A resource box with a name and one line under it. */
function Res({ x, y, w, t, s, c = "teal" }: { x: number; y: number; w: number; t: string; s?: string; c?: string }) {
  return (
    <>
      <rect className={c === "ghost" ? "ghost" : `n ${c}`} x={x} y={y} width={w} height={s ? 52 : 40} rx="2" />
      <text className="t" x={x + 12} y={y + (s ? 22 : 25)}>
        {t}
      </text>
      {s && (
        <text className="s" x={x + 12} y={y + 42}>
          {s}
        </text>
      )}
    </>
  );
}

export function FigScope() {
  return (
    <svg viewBox="0 0 960 488" role="img" aria-label="Where Kadé's resources live. Global, for the whole planet: kade-vpc, its firewall rules, its routes and the load balancer IP 34.120.88.10. Regional, in asia-southeast1: subnets sn-app and sn-data, which stretch across zones a, b and c, and later Cloud Router, Cloud NAT and its IP. Zonal: kade-api-1 in zone a, kade-api-2 and kade-db in zone b. Another region, such as asia-south1, could hold a new subnet of the same kade-vpc.">
      <rect className="zone" x="16" y="16" width="928" height="456" rx="2" />
      <text className="s" x="32" y="40">global · one object for the whole planet</text>
      <Res x={32} y={54} w={208} t="kade-vpc" s="the network" />
      <Res x={256} y={54} w={208} t="Firewall rules" s="kade-allow-*" />
      <Res x={480} y={54} w={208} t="Routes" s="belong to kade-vpc" />
      <Res x={704} y={54} w={224} t="34.120.88.10" s="load balancer IP" c="plum" />

      <rect className="zone plum" x="32" y="124" width="640" height="332" rx="2" />
      <text className="s" x="48" y="146">regional · asia-southeast1</text>
      <Res x={48} y={158} w={296} t="Cloud Router + Cloud NAT" s="later · chapter 7" c="ghost" />
      <Res x={360} y={158} w={296} t="NAT IP 34.87.200.7" s="later · chapter 7" c="ghost" />

      <rect className="zone" x="48" y="226" width="196" height="218" rx="2" />
      <text className="s" x="60" y="246">zonal · zone a</text>
      <rect className="zone" x="256" y="226" width="196" height="218" rx="2" />
      <text className="s" x="268" y="246">zone b</text>
      <rect className="zone" x="464" y="226" width="196" height="218" rx="2" />
      <text className="s" x="476" y="246">zone c</text>

      {/* Subnets are regional: each one runs across every zone. */}
      <rect className="zone teal" x="40" y="258" width="624" height="84" rx="2" />
      <text className="s" x="476" y="280">sn-app 10.10.1.0/24</text>
      <text className="f" x="476" y="300">spans every zone</text>
      <Res x={60} y={286} w={172} t="kade-api-1" />
      <Res x={268} y={286} w={172} t="kade-api-2" />
      <rect className="zone teal" x="40" y="352" width="624" height="80" rx="2" />
      <text className="s" x="476" y="374">sn-data 10.10.2.0/24</text>
      <text className="f" x="476" y="394">spans every zone</text>
      <Res x={268} y={378} w={172} t="kade-db" />

      <rect className="ghost" x="688" y="124" width="240" height="332" rx="2" />
      <text className="t" x="704" y="148">asia-south1</text>
      <text className="s" x="704" y="170">another region</text>
      <text className="s" x="704" y="206">a new subnet here is</text>
      <text className="s" x="704" y="226">part of the same kade-vpc</text>
      <text className="s" x="704" y="262">its VMs reach Singapore</text>
      <text className="s" x="704" y="282">on internal IPs, over</text>
      <text className="s" x="704" y="302">{"Google's backbone, no VPN"}</text>
    </svg>
  );
}

/** One thing a VM might use, with whether it can, on its wire. */
function Use({ x, y, t, s, ok, side }: { x: number; y: number; t: string; s: string; ok: boolean; side: "l" | "r" }) {
  const markX = side === "l" ? x + 300 + 18 : x - 18;
  return (
    <>
      <rect className="n" x={x} y={y} width="300" height="64" rx="2" />
      <text className="t" x={x + 14} y={y + 27}>
        {t}
      </text>
      <text className={ok ? "s" : "s flt"} x={x + 14} y={y + 48}>
        {s}
      </text>
      <circle className={ok ? "ok" : "bad"} cx={markX} cy={y + 32} r="10" />
      <text className="bn" x={markX} y={y + 36} style={{ fontSize: "12px" }}>
        {ok ? "✓" : "✕"}
      </text>
    </>
  );
}

export function FigPlacement() {
  const rows = [32, 120, 208, 296];
  return (
    <svg viewBox="0 0 960 392" role="img" aria-label="What kade-api-1, in zone asia-southeast1-a, can use. It can use its boot disk in the same zone, sn-app in the same region, a static IP from asia-southeast1, and kade-vpc with its firewall rules and routes, which are global. It cannot use a disk in zone b, a subnet in asia-south1, a static IP from asia-south1, or the global IP 34.120.88.10, which only global load balancers use.">
      <rect className="n teal" x="390" y="160" width="180" height="72" rx="2" />
      <text className="t" x="404" y="188">kade-api-1</text>
      <text className="s" x="404" y="210">asia-southeast1-a</text>

      {/* Can use: one trunk on the left. Cannot: one trunk on the right. */}
      {rows.map((y) => (
        <path key={`l${y}`} className="w green" d={`M390 196 H352 V${y + 32} H318`} markerEnd="url(#dd-ah-green)" />
      ))}
      {rows.map((y) => (
        <path key={`r${y}`} className="w fault dash" d={`M570 196 H608 V${y + 32} H642`} markerEnd="url(#dd-ah-fault)" />
      ))}

      <Use x={16} y={rows[0]} t="Its boot disk" s="zone a: same zone" ok side="l" />
      <Use x={16} y={rows[1]} t="sn-app" s="asia-southeast1: same region" ok side="l" />
      <Use x={16} y={rows[2]} t="A static IP" s="from asia-southeast1: same region" ok side="l" />
      <Use x={16} y={rows[3]} t="kade-vpc, rules, routes" s="global: usable anywhere" ok side="l" />
      <Use x={644} y={rows[0]} t="A disk in zone b" s="another zone" ok={false} side="r" />
      <Use x={644} y={rows[1]} t="A subnet in asia-south1" s="another region" ok={false} side="r" />
      <Use x={644} y={rows[2]} t="A static IP" s="from asia-south1: another region" ok={false} side="r" />
      <Use x={644} y={rows[3]} t="Global IP 34.120.88.10" s="only global load balancers" ok={false} side="r" />
    </svg>
  );
}
