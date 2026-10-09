// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigToday() {
  return (
    <svg viewBox="0 0 960 600" role="img" aria-label="Map of the project today. Outside: shoppers, your home, the office and PayGate. Cloud DNS and the load balancer at 34.120.88.10 send traffic to kade-api-1 and kade-api-2 in sn-app. kade-db is in sn-data. Five firewall rules, three of them too open. The default network still exists with open rules. kade-api cannot reach PayGate.">
      <text className="s" x="16" y="30">outside GCP</text>
      <rect className="n" x="16" y="40" width="200" height="60" rx="2" />
      <text className="t" x="30" y="64">Shoppers</text>
      <text className="s" x="30" y="84">app + website</text>
      <rect className="n" x="16" y="128" width="200" height="62" rx="2" />
      <text className="t" x="30" y="152">You (home)</text>
      <text className="s" x="30" y="172">public IP 203.0.113.45</text>
      <rect className="n" x="16" y="216" width="200" height="62" rx="2" />
      <text className="t" x="30" y="240">Kadé office</text>
      <text className="s" x="30" y="260">public IP 198.51.100.20</text>
      <rect className="n" x="16" y="470" width="200" height="62" rx="2" />
      <text className="t" x="30" y="494">PayGate</text>
      <text className="s" x="30" y="514">allows only 34.87.200.7</text>
      <rect className="n plum" x="244" y="40" width="190" height="60" rx="2" />
      <text className="t" x="258" y="64">Cloud DNS</text>
      <text className="s" x="258" y="84">api → 34.120.88.10</text>
      <rect className="n plum" x="244" y="128" width="190" height="78" rx="2" />
      <text className="t" x="258" y="152">Load balancer</text>
      <text className="s" x="258" y="172">34.120.88.10 (anycast)</text>
      <text className="s" x="258" y="191">Google front ends</text>
      <text className="s" x="258" y="226">HTTP :8080 to both VMs</text>
      <line className="w dash" x1="216" y1="68" x2="241" y2="68" markerEnd="url(#dd-ah-muted)" />
      <path className="w teal" d="M216 88 C 228 88, 230 160, 241 160" markerEnd="url(#dd-ah-teal)" />
      <rect className="zone" x="460" y="10" width="484" height="582" rx="2" />
      <text className="s" x="476" y="30">project kade-prod · region asia-southeast1</text>
      <rect className="zone teal" x="476" y="40" width="452" height="424" rx="2" />
      <text className="s" x="492" y="60">kade-vpc · custom mode · no range of its own</text>
      <circle className="bad" cx="499" cy="78" r="8" />
      <text className="bn" x="499" y="82">8</text>
      <text className="s" x="512" y="82">no logs</text>
      <circle className="bad" cx="583" cy="78" r="8" />
      <text className="bn" x="583" y="82">9</text>
      <text className="s" x="596" y="82">VMs use the default service account</text>
      <rect className="zone" x="492" y="94" width="420" height="104" rx="2" />
      <text className="s" x="506" y="112">sn-app · 10.10.1.0/24 · gateway .1</text>
      <rect className="n teal" x="506" y="122" width="194" height="66" rx="2" />
      <text className="t" x="520" y="144">kade-api-1</text>
      <text className="s" x="520" y="162">10.10.1.10 · zone a</text>
      <text className="s" x="520" y="179">tag api · no external IP</text>
      <rect className="n teal" x="710" y="122" width="194" height="66" rx="2" />
      <text className="t" x="724" y="144">kade-api-2</text>
      <text className="s" x="724" y="162">10.10.1.11 · zone b</text>
      <text className="s" x="724" y="179">tag api · no external IP</text>
      <rect className="zone" x="492" y="210" width="420" height="92" rx="2" />
      <text className="s" x="506" y="228">sn-data · 10.10.2.0/24</text>
      <rect className="n green" x="506" y="238" width="398" height="54" rx="2" />
      <text className="t" x="520" y="260">kade-db (VM, PostgreSQL)</text>
      <text className="s" x="520" y="280">10.10.2.5:5432 · zone b · backups by hand</text>
      <circle className="bad" cx="892" cy="250" r="8" />
      <text className="bn" x="892" y="254">7</text>
      <line className="w dash" x1="760" y1="188" x2="760" y2="236" markerEnd="url(#dd-ah-muted)" />
      <text className="s" x="772" y="226">SQL to hardcoded IP</text>
      <circle className="bad" cx="746" cy="222" r="8" />
      <text className="bn" x="746" y="226">6</text>
      <path className="w plum" d="M434 160 C 470 160, 470 150, 503 150" markerEnd="url(#dd-ah-plum)" />
      <text className="s" x="506" y="326">firewall rules (priority 1000; names start with kade-)</text>
      <text className="f" x="520" y="346" style={{"fontSize": "11px"}}>name</text>
      <text className="f" x="688" y="346" style={{"fontSize": "11px"}}>ports</text>
      <text className="f" x="800" y="346" style={{"fontSize": "11px"}}>from</text>
      <circle className="bad" cx="508" cy="362" r="8" />
      <text className="bn" x="508" y="366">2</text>
      <text className="t" x="520" y="367">allow-ssh</text>
      <text className="s" x="688" y="366">tcp:22</text>
      <text className="s" x="800" y="366">0.0.0.0/0</text>
      <circle className="bad" cx="508" cy="382" r="8" />
      <text className="bn" x="508" y="386">3</text>
      <text className="t" x="520" y="387">allow-web</text>
      <text className="s" x="688" y="386">tcp:80,443,8080</text>
      <text className="s" x="800" y="386">0.0.0.0/0</text>
      <circle className="bad" cx="508" cy="402" r="8" />
      <text className="bn" x="508" y="406">4</text>
      <text className="t" x="520" y="407">allow-internal</text>
      <text className="s" x="688" y="406">all</text>
      <text className="s" x="800" y="406">10.10.0.0/16</text>
      <circle className="ok" cx="508" cy="422" r="5" />
      <text className="t" x="520" y="427">allow-lb</text>
      <text className="s" x="688" y="426">tcp:8080</text>
      <text className="s" x="800" y="426">Google LB ranges</text>
      <circle className="ok" cx="508" cy="442" r="5" />
      <text className="t" x="520" y="447">allow-icmp</text>
      <text className="s" x="688" y="446">icmp</text>
      <text className="s" x="800" y="446">home + office</text>
      <rect className="zone fault" x="476" y="476" width="452" height="104" rx="2" />
      <circle className="bad" cx="910" cy="494" r="8" />
      <text className="bn" x="910" y="498">1</text>
      <text className="s" x="492" y="498">default network · auto mode · 10.128.0.0/9</text>
      <text className="s" x="492" y="520">a /20 subnet in every region · no VMs today</text>
      <text className="s" x="492" y="540">rules open ssh, rdp and icmp to 0.0.0.0/0,</text>
      <text className="s" x="492" y="560">and allow everything from 10.128.0.0/9</text>
      <path className="w fault dash" d="M216 176 C 330 300, 420 272, 503 272" markerEnd="url(#dd-ah-fault)" />
      <text className="s" x="244" y="300">SSH via a temporary</text>
      <text className="s" x="244" y="316">external IP</text>
      <path className="w fault dash" d="M506 176 H468 V501 H219" markerEnd="url(#dd-ah-fault)" />
      <text className="x" x="340" y="506">✕</text>
      <circle className="bad" cx="258" cy="444" r="8" />
      <text className="bn" x="258" y="448">5</text>
      <text className="s" x="272" y="448">no way out:</text>
      <text className="s" x="272" y="466">no external IP, no NAT</text>
    </svg>
  );
}

export function FigTarget() {
  return (
    <svg viewBox="0 0 960 640" role="img" aria-label="Target map. Shoppers reach Cloudflare, then the load balancer, then Cloud Run kade-api. You reach kade-worker through IAP. Cloud Run and kade-worker send outgoing traffic through Cloud NAT with fixed IP 34.87.200.7 to PayGate. Cloud SQL kade-sql has a private IP 10.10.32.3 in the private services range. A private DNS zone kade.internal names it. The office connects over HA VPN with Cloud Router. A staging project uses 10.20.0.0/16.">
      <text className="s" x="16" y="30">outside GCP</text>
      <rect className="n" x="16" y="40" width="200" height="62" rx="2" />
      <text className="t" x="30" y="64">Shoppers</text>
      <text className="s" x="30" y="84">app + website</text>
      <rect className="n" x="16" y="128" width="200" height="62" rx="2" />
      <text className="t" x="30" y="152">You (home)</text>
      <text className="s" x="30" y="172">203.0.113.45</text>
      <rect className="n" x="16" y="380" width="200" height="62" rx="2" />
      <text className="t" x="30" y="404">PayGate</text>
      <text className="s" x="30" y="424">allows only 34.87.200.7</text>
      <rect className="n" x="16" y="540" width="200" height="62" rx="2" />
      <text className="t" x="30" y="564">Kadé office</text>
      <text className="s" x="30" y="584">172.16.0.0/16</text>
      <rect className="n" x="244" y="40" width="190" height="62" rx="2" />
      <text className="t" x="258" y="64">Cloudflare</text>
      <text className="s" x="258" y="84">DNS for kade.lk · WAF</text>
      <text className="ch" x="426" y="58">ch 13</text>
      <rect className="n plum" x="244" y="128" width="190" height="80" rx="2" />
      <text className="t" x="258" y="152">Load balancer</text>
      <text className="s" x="258" y="172">34.120.88.10</text>
      <text className="s" x="258" y="191">accepts only Cloudflare</text>
      <text className="ch" x="426" y="146">ch 11-13</text>
      <rect className="n plum" x="244" y="232" width="190" height="62" rx="2" />
      <text className="t" x="258" y="256">IAP</text>
      <text className="s" x="258" y="276">from 35.235.240.0/20</text>
      <text className="ch" x="426" y="250">ch 6</text>
      <rect className="ghost" x="244" y="462" width="190" height="62" rx="2" />
      <text className="t" x="258" y="486">kade-staging</text>
      <text className="s" x="258" y="506">project · 10.20.0.0/16</text>
      <text className="ch" x="426" y="480">ch 14</text>
      <line className="w dash" x1="434" y1="493" x2="473" y2="493" />
      <line className="w" x1="216" y1="71" x2="241" y2="71" markerEnd="url(#dd-ah-muted)" />
      <line className="w" x1="339" y1="102" x2="339" y2="125" markerEnd="url(#dd-ah-muted)" />
      <path className="w green" d="M216 166 C 232 166, 228 263, 241 263" markerEnd="url(#dd-ah-green)" />
      <rect className="zone" x="460" y="10" width="484" height="620" rx="2" />
      <text className="s" x="476" y="30">project kade-prod · org policies on (ch 17)</text>
      <rect className="n plum" x="710" y="40" width="218" height="78" rx="2" />
      <text className="t" x="724" y="64">Cloud Run: kade-api</text>
      <text className="s" x="724" y="84">ingress: internal + LB</text>
      <text className="s" x="724" y="103">egress: into sn-run</text>
      <text className="ch" x="920" y="110">ch 10</text>
      <path className="w plum" d="M434 150 C 500 150, 540 79, 707 79" markerEnd="url(#dd-ah-plum)" />
      <rect className="zone teal" x="476" y="140" width="452" height="476" rx="2" />
      <text className="s" x="492" y="160">kade-vpc · custom mode · plan 10.10.0.0/16</text>
      <rect className="zone" x="492" y="172" width="206" height="92" rx="2" />
      <text className="s" x="506" y="190">sn-app · 10.10.1.0/24</text>
      <rect className="n teal" x="506" y="200" width="178" height="54" rx="2" />
      <text className="t" x="518" y="222">kade-worker</text>
      <text className="s" x="518" y="242">10.10.1.20 · ch 10</text>
      <rect className="zone" x="710" y="172" width="202" height="92" rx="2" />
      <text className="s" x="724" y="190">sn-run · 10.10.3.0/24</text>
      <text className="s" x="724" y="222">{"Cloud Run's outgoing"}</text>
      <text className="s" x="724" y="240">traffic uses IPs here</text>
      <text className="ch" x="904" y="256">ch 10</text>
      <line className="w plum" x1="819" y1="118" x2="819" y2="170" markerEnd="url(#dd-ah-plum)" />
      <path className="w green" d="M434 263 C 466 263, 474 227, 503 227" markerEnd="url(#dd-ah-green)" />
      <rect className="n teal" x="492" y="282" width="206" height="62" rx="2" />
      <text className="t" x="506" y="306">Cloud NAT</text>
      <text className="s" x="506" y="326">fixed IP 34.87.200.7</text>
      <text className="ch" x="690" y="300">ch 7</text>
      <line className="w teal" x1="595" y1="254" x2="595" y2="279" markerEnd="url(#dd-ah-teal)" />
      <path className="w teal" d="M732 264 C 722 272, 708 276, 694 280" markerEnd="url(#dd-ah-teal)" />
      <path className="w teal" d="M492 313 H472 V411 H219" markerEnd="url(#dd-ah-teal)" />
      <rect className="n teal" x="710" y="282" width="202" height="62" rx="2" />
      <text className="t" x="724" y="306">Private DNS zone</text>
      <text className="s" x="724" y="326">db.kade.internal</text>
      <text className="ch" x="904" y="300">ch 8</text>
      <rect className="n amber" x="492" y="360" width="420" height="50" rx="2" />
      <text className="t" x="506" y="382">Firewall</text>
      <text className="s" x="506" y="400">rules target service accounts · only needed ports</text>
      <text className="ch" x="904" y="378">ch 5, 16</text>
      <rect className="zone plum" x="492" y="426" width="420" height="92" rx="2" />
      <text className="s" x="506" y="446">private services range 10.10.32.0/20</text>
      <text className="s" x="506" y="466">{"Google's side, joined"}</text>
      <text className="s" x="506" y="484">by peering</text>
      <rect className="n plum" x="690" y="452" width="210" height="54" rx="2" />
      <text className="t" x="702" y="474">Cloud SQL: kade-sql</text>
      <text className="s" x="702" y="494">private IP 10.10.32.3</text>
      <text className="ch" x="904" y="444">ch 9</text>
      <rect className="n teal" x="492" y="534" width="206" height="66" rx="2" />
      <text className="t" x="506" y="558">HA VPN + Cloud Router</text>
      <text className="s" x="506" y="578">BGP · ASN 64512</text>
      <text className="ch" x="690" y="592">ch 15</text>
      <path className="w" d="M492 567 H480 V571 H219" markerEnd="url(#dd-ah-muted)" markerStart="url(#dd-ah-muted)" />
      <rect className="n green" x="710" y="534" width="202" height="66" rx="2" />
      <text className="t" x="724" y="558">Logs on</text>
      <text className="s" x="724" y="578">flow, firewall, NAT</text>
      <text className="ch" x="904" y="552">ch 16</text>
    </svg>
  );
}

export function FigPlan() {
  return (
    <svg viewBox="0 0 960 250" role="img" aria-label="Address plan bar for 10.10.0.0/16. Subnets live in 10.10.0.0/20. 10.10.32.0/20 is the private services range for Google. 10.10.200.0/24 is reserved for Private Service Connect endpoints. The rest is free. Zoom of the first sixteen /24 blocks: .0 unused, .1 sn-app, .2 sn-data, .3 sn-run planned, .4 to .15 free.">
      <text className="s" x="40" y="24">{"10.10.0.0/16 · Kadé's block in kade-vpc · one cell = one /20 (4,096 addresses)"}</text>
      <rect className="blk used" x="40" y="36" width="56" height="40" rx="2" />
      <rect className="blk free" x="96" y="36" width="56" height="40" rx="2" />
      <rect className="blk goog" x="152" y="36" width="56" height="40" rx="2" />
      <rect className="blk free" x="208" y="36" width="56" height="40" rx="2" />
      <rect className="blk free" x="264" y="36" width="56" height="40" rx="2" />
      <rect className="blk free" x="320" y="36" width="56" height="40" rx="2" />
      <rect className="blk free" x="376" y="36" width="56" height="40" rx="2" />
      <rect className="blk free" x="432" y="36" width="56" height="40" rx="2" />
      <rect className="blk free" x="488" y="36" width="56" height="40" rx="2" />
      <rect className="blk free" x="544" y="36" width="56" height="40" rx="2" />
      <rect className="blk free" x="600" y="36" width="56" height="40" rx="2" />
      <rect className="blk free" x="656" y="36" width="56" height="40" rx="2" />
      <rect className="blk res" x="712" y="36" width="56" height="40" rx="2" />
      <rect className="blk free" x="768" y="36" width="56" height="40" rx="2" />
      <rect className="blk free" x="824" y="36" width="56" height="40" rx="2" />
      <rect className="blk free" x="880" y="36" width="56" height="40" rx="2" />
      <text className="s" x="40" y="96">.0.0/20</text>
      <text className="s" x="40" y="112">subnets</text>
      <text className="s" x="152" y="96">.32.0/20</text>
      <text className="s" x="376" y="96">free for later</text>
      <text className="s" x="712" y="96">.192.0/20</text>
      <text className="s" x="880" y="96">.240.0/20</text>
      <text className="s" x="152" y="112">private services (ch 9)</text>
      <text className="s" x="712" y="112">.200.0/24 kept for PSC (ch 9)</text>
      <text className="s" x="40" y="142">zoom into the first cell, 10.10.0.0/20 · one cell = one /24 (256 addresses)</text>
      <rect className="blk free" x="40" y="152" width="56" height="44" rx="2" />
      <rect className="blk used" x="96" y="152" width="56" height="44" rx="2" />
      <rect className="blk used" x="152" y="152" width="56" height="44" rx="2" />
      <rect className="blk plan" x="208" y="152" width="56" height="44" rx="2" />
      <rect className="blk free" x="264" y="152" width="56" height="44" rx="2" />
      <rect className="blk free" x="320" y="152" width="56" height="44" rx="2" />
      <rect className="blk free" x="376" y="152" width="56" height="44" rx="2" />
      <rect className="blk free" x="432" y="152" width="56" height="44" rx="2" />
      <rect className="blk free" x="488" y="152" width="56" height="44" rx="2" />
      <rect className="blk free" x="544" y="152" width="56" height="44" rx="2" />
      <rect className="blk free" x="600" y="152" width="56" height="44" rx="2" />
      <rect className="blk free" x="656" y="152" width="56" height="44" rx="2" />
      <rect className="blk free" x="712" y="152" width="56" height="44" rx="2" />
      <rect className="blk free" x="768" y="152" width="56" height="44" rx="2" />
      <rect className="blk free" x="824" y="152" width="56" height="44" rx="2" />
      <rect className="blk free" x="880" y="152" width="56" height="44" rx="2" />
      <text className="s mid" x="68" y="179">.0</text>
      <text className="s mid" x="124" y="179">.1</text>
      <text className="s mid" x="180" y="179">.2</text>
      <text className="s mid" x="236" y="179">.3</text>
      <text className="s mid" x="292" y="179">.4</text>
      <text className="s mid" x="908" y="179">.15</text>
      <text className="s" x="40" y="216">unused</text>
      <text className="s" x="110" y="216">sn-app</text>
      <text className="s" x="166" y="232">sn-data</text>
      <text className="s" x="222" y="216">sn-run (ch 10)</text>
      <text className="s" x="376" y="216">free for new subnets</text>
    </svg>
  );
}
