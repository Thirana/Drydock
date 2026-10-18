// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

/** A numbered cost, matching the list under the drawing. */
function Cost({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <>
      <circle className="badge" cx={x} cy={y} r="11" />
      <text className="mid" x={x} y={y + 5}>
        {n}
      </text>
    </>
  );
}

export function FigBastion() {
  return (
    <svg viewBox="0 0 960 330" role="img" aria-label="The bastion pattern. You and every SSH scanner on the internet reach the bastion's port 22. From the bastion you SSH on to kade-api-1 and then kade-db, which have no public SSH. Three costs: the bastion is a VM you run and patch, it is still an internet-facing SSH port, and an attacker who takes it over is already inside, one hop from every VM.">
      <text className="s" x="16" y="34">internet</text>
      <rect className="n" x="16" y="56" width="170" height="64" rx="2" />
      <text className="t" x="30" y="82">You</text>
      <text className="s" x="30" y="104">SSH key</text>
      <rect className="n fault" x="16" y="196" width="170" height="64" rx="2" />
      <text className="t" x="30" y="222">SSH scanners</text>
      <text className="s" x="30" y="244">probe :22 all day</text>

      <rect className="zone teal" x="236" y="16" width="708" height="300" rx="2" />
      <text className="s" x="252" y="40">kade-vpc</text>

      <path className="w green" d="M186 88 H218 V128 H267" markerEnd="url(#dd-ah-green)" />
      <path className="w fault dash" d="M186 228 H218 V184 H267" markerEnd="url(#dd-ah-fault)" />
      <rect className="n amber" x="270" y="100" width="200" height="112" rx="2" />
      <text className="t" x="286" y="128">bastion</text>
      <text className="s" x="286" y="152">external IP</text>
      <text className="s" x="286" y="172">port 22 open</text>
      <text className="s" x="286" y="192">to the internet</text>

      <line className="w green" x1="470" y1="156" x2="537" y2="156" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="504" y="146">ssh</text>
      <rect className="n teal" x="540" y="124" width="170" height="64" rx="2" />
      <text className="t" x="554" y="150">kade-api-1</text>
      <text className="s" x="554" y="172">no public SSH</text>
      <line className="w green" x1="710" y1="156" x2="767" y2="156" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="739" y="146">ssh</text>
      <rect className="n teal" x="770" y="124" width="160" height="64" rx="2" />
      <text className="t" x="784" y="150">kade-db</text>
      <text className="s" x="784" y="172">no public SSH</text>

      {/* Whoever takes over the bastion can reach everything behind it. */}
      <path className="w fault dash" d="M370 212 V256 H625 V191" markerEnd="url(#dd-ah-fault)" />
      <path className="w fault dash" d="M625 256 H850 V191" markerEnd="url(#dd-ah-fault)" />
      <text className="flt" x="386" y="290">an attacker who takes over the bastion is already inside</text>

      <Cost x={470} y={100} n={1} />
      <Cost x={218} y={156} n={2} />
      <Cost x={370} y={256} n={3} />
    </svg>
  );
}

/** A red ✕ in a dot: where an attacker's attempt ends. */
function Stop({ x, y }: { x: number; y: number }) {
  return (
    <>
      <circle className="bad" cx={x} cy={y} r="11" />
      <text className="bn" x={x} y={y + 4}>
        ✕
      </text>
    </>
  );
}

export function FigWhat() {
  return (
    <svg viewBox="0 0 960 412" role="img" aria-label="IAP TCP forwarding. Your laptop connects over HTTPS to IAP, which Google runs inside its own network but outside your VPC. IAP checks your Google sign-in and your IAM role, then connects from 35.235.240.0/20, still inside Google's network, into kade-vpc, where the firewall lets port 22 in from that range only, to kade-db, which has no external IP. An attacker who tries IAP is refused at the identity check, and one who goes straight at kade-db finds no public address to reach.">
      <text className="s" x="16" y="34">internet</text>
      <rect className="n" x="16" y="56" width="180" height="72" rx="2" />
      <text className="t" x="30" y="82">Your laptop</text>
      <text className="s" x="30" y="104">gcloud, signed in</text>
      <text className="s" x="30" y="122">as you@kade.lk</text>
      <rect className="n fault" x="16" y="262" width="180" height="72" rx="2" />
      <text className="t" x="30" y="288">Attacker</text>
      <text className="s" x="30" y="310">a scanner, or a</text>
      <text className="s" x="30" y="328">stolen SSH key</text>

      {/* Google's network holds both IAP and kade-vpc: a VPC is a virtual network on Google's hosts. */}
      <rect className="zone plum" x="240" y="16" width="704" height="338" rx="2" />
      <text className="s" x="256" y="40">Google&apos;s network</text>
      <rect className="n plum" x="260" y="56" width="320" height="168" rx="2" />
      <text className="t" x="276" y="82">IAP</text>
      <text className="s" x="276" y="102">run by Google, outside your VPC</text>
      <text className="s" x="276" y="130">1 who are you?</text>
      <text className="s" x="294" y="148">(Google sign-in)</text>
      <text className="s" x="276" y="172">2 may you reach this VM</text>
      <text className="s" x="294" y="190">on this port? (IAM)</text>
      <text className="s" x="276" y="214">3 yes: connect for you</text>

      <path className="w green" d="M196 92 H257" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="218" y="82">HTTPS</text>

      {/* The tunnel never leaves Google's network. */}
      <path className="w green" d="M396 224 V286 H617" markerEnd="url(#dd-ah-green)" />
      <text x="410" y="274">inside Google&apos;s network</text>
      <text className="s" x="410" y="308">from 35.235.240.0/20</text>

      <rect className="zone teal" x="600" y="200" width="328" height="138" rx="2" />
      <text className="s" x="616" y="224">kade-vpc (yours)</text>
      <rect className="n amber" x="620" y="250" width="136" height="72" rx="2" />
      <text className="t" x="634" y="276">firewall</text>
      <text x="634" y="296">22 only from</text>
      <text x="634" y="314">IAP&apos;s range</text>
      <line className="w green" x1="756" y1="286" x2="781" y2="286" markerEnd="url(#dd-ah-green)" />
      <rect className="n teal" x="784" y="250" width="128" height="72" rx="2" />
      <text className="t" x="798" y="276">kade-db</text>
      <text className="s" x="798" y="296">10.10.2.5</text>
      <text x="798" y="314">no external IP</text>

      {/* Attempt 1: through IAP. Refused at the identity check. */}
      <path className="w fault dash" d="M196 298 H222 V180 H237" />
      <Stop x={250} y={180} />
      <text className="flt" x="16" y="190">refused by IAP:</text>
      <text className="flt" x="16" y="208">not an allowed identity</text>

      {/* Attempt 2: straight at the VM. There is no public address to aim at. */}
      <path className="w fault dash" d="M106 334 V378 H834" />
      <Stop x={848} y={378} />
      <text className="flt" x="122" y="402">straight at kade-db: it has no external IP, so there is no address to reach</text>
    </svg>
  );
}

/** A green ✓ in a dot: where a connection is let through. */
function Pass({ x, y }: { x: number; y: number }) {
  return (
    <>
      <circle className="ok" cx={x} cy={y} r="11" />
      <text className="bn" x={x} y={y + 4}>
        ✓
      </text>
    </>
  );
}

export function FigRange() {
  return (
    <svg viewBox="0 0 960 344" role="img" aria-label="Two layers guard port 22. You sign in to IAP over HTTPS, and IAP connects for you from 35.235.240.9, inside Google's network, and the firewall at kade-vpc's border lets it through to kade-db. A scanner from 203.0.113.99 crosses Google's edge but the firewall drops it, because it is not from IAP's range; with a 0.0.0.0/0 rule it would reach SSH. A faker who sends packets claiming to come from 35.235.240.7 is dropped at Google's edge, because nobody outside Google may use that range.">
      <text className="s" x="16" y="34">internet</text>
      <rect className="n" x="16" y="92" width="210" height="64" rx="2" />
      <text className="t" x="30" y="118">You</text>
      <text className="s" x="30" y="140">signed in, over HTTPS</text>
      <path className="w green" d="M226 124 H267" markerEnd="url(#dd-ah-green)" />
      <rect className="n fault" x="16" y="180" width="210" height="64" rx="2" />
      <text className="t" x="30" y="206">Scanner</text>
      <text className="s" x="30" y="228">from 203.0.113.99</text>
      <rect className="n fault" x="16" y="268" width="210" height="64" rx="2" />
      <text className="t" x="30" y="294">Faker</text>
      <text className="s" x="30" y="316">claims 35.235.240.7</text>

      <rect className="zone plum" x="250" y="16" width="694" height="320" rx="2" />
      <text className="s" x="266" y="40">Google&apos;s network</text>
      <rect className="n plum" x="270" y="92" width="200" height="76" rx="2" />
      <text className="t" x="284" y="118">IAP</text>
      <text className="s" x="284" y="140">connects for you from</text>
      <text className="s" x="284" y="158">35.235.240.9</text>

      <rect className="zone teal" x="510" y="52" width="418" height="200" rx="2" />
      <text className="s" x="526" y="76">kade-vpc</text>
      <rect className="n amber" x="530" y="92" width="180" height="150" rx="2" />
      <text className="t" x="544" y="118">firewall</text>
      <text className="s" x="544" y="142">allow tcp:22</text>
      <text className="s" x="544" y="162">from</text>
      <text className="s" x="544" y="182">35.235.240.0/20</text>
      <rect className="n teal" x="750" y="92" width="160" height="64" rx="2" />
      <text className="t" x="764" y="118">kade-db</text>
      <text className="s" x="764" y="140">port 22</text>

      {/* IAP: inside Google already, and from the allowed range. */}
      <path className="w green" d="M470 124 H527" markerEnd="url(#dd-ah-green)" />
      <path className="w green" d="M710 124 H747" markerEnd="url(#dd-ah-green)" />
      <Pass x={710} y={124} />

      {/* The scanner gets across Google's edge, then the firewall drops it. */}
      <path className="w fault dash" d="M226 212 H517" />
      <Stop x={530} y={212} />
      <text className="flt" x="730" y="200">not IAP&apos;s range: dropped</text>
      <text className="f" x="730" y="220">with 0.0.0.0/0, it</text>
      <text className="f" x="730" y="236">would reach SSH</text>

      {/* The faker claims IAP's range; Google's edge knows it cannot be. */}
      <path className="w fault dash" d="M226 300 H237" />
      <Stop x={250} y={300} />
      <text className="flt" x="270" y="294">faked IAP address:</text>
      <text className="flt" x="270" y="312">dropped at Google&apos;s edge</text>
    </svg>
  );
}

/** One check on the path, with what you see when it fails. */
function Gate({ x, n, title, sub, code, error, late }: { x: number; n: number; title: string; sub: string; code: string; error: string; late?: string }) {
  return (
    <>
      <circle className="badge" cx={x} cy={96} r="11" />
      <text className="mid" x={x} y={101}>
        {n}
      </text>
      <text className="t" x={x + 14} y={142}>
        {title}
      </text>
      <text x={x + 14} y={162}>
        {sub}
      </text>
      <text className="t flt" x={x + 14} y={218}>
        {`✕ ${code}`}
      </text>
      <text className="flt" x={x + 14} y={238}>
        {error}
      </text>
      {late && (
        <text className="f" x={x + 14} y={258}>
          {late}
        </text>
      )}
    </>
  );
}

export function FigGates() {
  return (
    <svg viewBox="0 0 960 322" role="img" aria-label="Four checks along the path of an IAP SSH connection, all inside Google's network. At IAP: 1, is the IAP API enabled, and 2, does your identity hold the IAM role; either failure answers at once with 4033 not authorized. In kade-vpc: 3, does a firewall rule allow port 22 from 35.235.240.0/20; and at the VM, 4, is SSH running; either failure shows up after a pause as 4003 failed to connect to backend.">
      <rect className="n" x="16" y="116" width="130" height="64" rx="2" />
      <text className="t" x="30" y="142">Your laptop</text>
      <text className="s" x="30" y="164">gcloud ssh</text>

      <rect className="zone plum" x="166" y="16" width="778" height="290" rx="2" />
      <text className="s" x="182" y="40">Google&apos;s network</text>
      <text className="s" x="190" y="76">IAP · run by Google</text>
      <rect className="n plum" x="190" y="116" width="170" height="64" rx="2" />
      <rect className="n plum" x="384" y="116" width="146" height="64" rx="2" />

      <rect className="zone teal" x="566" y="52" width="370" height="246" rx="2" />
      <text className="s" x="582" y="76">kade-vpc</text>
      <rect className="n amber" x="586" y="116" width="170" height="64" rx="2" />
      <rect className="n teal" x="776" y="116" width="150" height="64" rx="2" />

      <path className="w green" d="M146 148 H187" markerEnd="url(#dd-ah-green)" />
      <path className="w green" d="M360 148 H381" markerEnd="url(#dd-ah-green)" />
      <path className="w green" d="M530 148 H583" markerEnd="url(#dd-ah-green)" />
      <path className="w green" d="M756 148 H773" markerEnd="url(#dd-ah-green)" />

      <Gate x={190} n={1} title="IAP API" sub="enabled?" code="4033" error="not authorized" />
      <Gate x={384} n={2} title="IAM role" sub="tunnel access?" code="4033" error="not authorized" />
      <Gate x={586} n={3} title="firewall" sub="22 from IAP?" code="4003" error="failed to connect" late="after a pause" />
      <Gate x={776} n={4} title="kade-db" sub="SSH running?" code="4003" error="same as 3" late="after a pause" />

      <text className="f" x="190" y="290">IAP refuses you itself: the answer is quick</text>
      <text className="f" x="586" y="284">IAP let you in; the last hop fails</text>
    </svg>
  );
}

/** A numbered step on a path, matching the list under the drawing. */
function Num({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <>
      <circle className="badge" cx={x} cy={y} r="11" />
      <text className="mid" x={x} y={y + 5}>
        {n}
      </text>
    </>
  );
}

export function FigIapWeb() {
  return (
    <svg viewBox="0 0 960 430" role="img" aria-label="IAP for HTTPS on a load balancer. 1, DNS turns admin.kade.lk into the load balancer's IP 34.120.88.10. 2, the forwarding rule receives the request on port 443. 3, the target proxy ends TLS. 4, the URL map sends admin.kade.lk to the backend service kade-admin-backend. 5, IAP on that backend service checks that you are signed in and hold the IAM role, and adds a signed header saying who you are; a browser that is not signed in is sent to Google sign-in and comes back with a session cookie. 6, the firewall in kade-vpc lets port 8080 in from the load balancer's ranges. 7, kade-worker's dashboard checks the signed header.">
      <rect className="n" x="16" y="40" width="170" height="72" rx="2" />
      <text className="t" x="30" y="66">DNS</text>
      <text className="s" x="30" y="86">admin.kade.lk</text>
      <text className="s" x="30" y="104">→ 34.120.88.10</text>
      <rect className="n" x="16" y="150" width="170" height="80" rx="2" />
      <text className="t" x="30" y="178">Browser</text>
      <text className="s" x="30" y="200">admin.kade.lk</text>
      <line className="w" x1="101" y1="150" x2="101" y2="115" markerStart="url(#dd-ah-muted)" markerEnd="url(#dd-ah-muted)" />

      <rect className="zone plum" x="210" y="16" width="734" height="398" rx="2" />
      <text className="s" x="226" y="40">Google&apos;s network: the load balancer runs on Google&apos;s front ends</text>

      <rect className="n plum" x="230" y="150" width="157" height="80" rx="2" />
      <text className="t" x="244" y="176">forwarding rule</text>
      <text className="s" x="244" y="198">34.120.88.10</text>
      <text className="s" x="244" y="216">port 443</text>
      <rect className="n amber" x="411" y="150" width="157" height="80" rx="2" />
      <text className="t" x="425" y="176">target proxy</text>
      <text x="425" y="198">TLS ends here</text>
      <rect className="n amber" x="592" y="150" width="157" height="80" rx="2" />
      <text className="t" x="606" y="176">URL map</text>
      <text className="s" x="606" y="198">admin.kade.lk</text>
      <text className="s" x="606" y="216">→ kade-admin</text>
      <rect className="n amber" x="773" y="120" width="157" height="170" rx="2" />
      <text className="t" x="787" y="146">backend service</text>
      <text className="s" x="787" y="166">kade-admin</text>
      <rect className="n plum" x="783" y="178" width="137" height="100" rx="2" />
      <text className="t" x="795" y="200">IAP is on</text>
      <text x="795" y="222">signed in?</text>
      <text x="795" y="242">IAM role?</text>
      <text x="795" y="266">adds who you are</text>

      <line className="w green" x1="186" y1="190" x2="227" y2="190" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="387" y1="190" x2="408" y2="190" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="568" y1="190" x2="589" y2="190" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="749" y1="190" x2="770" y2="190" markerEnd="url(#dd-ah-green)" />

      {/* Not signed in yet: a round trip to Google sign-in, then back with a cookie. */}
      <path className="w dash" d="M773 270 H101 V233" markerEnd="url(#dd-ah-muted)" />
      <text className="f" x="244" y="262">not signed in yet: sent to Google sign-in, then back with a session cookie</text>

      <rect className="zone teal" x="440" y="300" width="494" height="104" rx="2" />
      <text className="s" x="456" y="322">kade-vpc</text>
      <rect className="n amber" x="773" y="332" width="157" height="62" rx="2" />
      <text className="t" x="787" y="356">firewall</text>
      <text x="787" y="378">8080 from LB ranges</text>
      <rect className="n teal" x="580" y="332" width="168" height="62" rx="2" />
      <text className="t" x="594" y="356">kade-worker :8080</text>
      <text x="594" y="378">checks the header</text>
      <line className="w green" x1="851" y1="290" x2="851" y2="329" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="773" y1="363" x2="751" y2="363" markerEnd="url(#dd-ah-green)" />

      <Num x={186} y={40} n={1} />
      <Num x={230} y={150} n={2} />
      <Num x={411} y={150} n={3} />
      <Num x={592} y={150} n={4} />
      <Num x={773} y={120} n={5} />
      <Num x={773} y={332} n={6} />
      <Num x={580} y={332} n={7} />
    </svg>
  );
}

const COMPARE_ROWS: [string, [string, string, string][]][] = [
  [
    "IAP TCP FORWARDING · sections 02 to 06",
    [
      ["Your laptop", "gcloud opens", "a tunnel"],
      ["IAP", "iap.tunnelResource-", "Accessor · per connection"],
      ["firewall", "22 from", "35.235.240.0/20"],
      ["VM :22", "or any TCP port", "sees IAP's range"],
    ],
  ],
  [
    "IAP FOR HTTPS · this section",
    [
      ["Browser", "just a URL,", "no gcloud"],
      ["Load balancer + IAP", "iap.httpsResource-", "Accessor · per request"],
      ["firewall", "8080 from 35.191.0.0/16,", "130.211.0.0/22"],
      ["VM :8080", "a web app", "sees LB ranges"],
    ],
  ],
];

export function FigIapCompare() {
  const xs = [16, 240, 504, 760];
  const ws = [196, 236, 228, 184];
  return (
    <svg viewBox="0 0 960 300" role="img" aria-label="The two kinds of IAP side by side. TCP forwarding: your laptop runs gcloud, which opens a tunnel; IAP checks each connection against the tunnel role; the firewall allows port 22 from 35.235.240.0/20; the VM sees IAP's range. IAP for HTTPS: a browser opens a URL with no gcloud; the load balancer with IAP checks each request against the HTTPS role; the firewall allows port 8080 from the load balancer ranges 35.191.0.0/16 and 130.211.0.0/22; the VM sees the load balancer's ranges.">
      {COMPARE_ROWS.map(([name, boxes], r) => {
        const y = 44 + r * 136;
        return (
          <g key={name}>
            <text className="s" x="16" y={y - 14}>
              {name}
            </text>
            {boxes.map(([t, a, b], i) => (
              <g key={t}>
                <rect className={`n ${i === 1 ? "plum" : i === 2 ? "amber" : i === 3 ? "teal" : ""}`} x={xs[i]} y={y} width={ws[i]} height="96" rx="2" />
                <text className="t" x={xs[i] + 14} y={y + 28}>
                  {t}
                </text>
                <text className="s" x={xs[i] + 14} y={y + 54}>
                  {a}
                </text>
                <text className="s" x={xs[i] + 14} y={y + 74}>
                  {b}
                </text>
                {i > 0 && <line className="w green" x1={xs[i - 1] + ws[i - 1]} y1={y + 48} x2={xs[i] - 3} y2={y + 48} markerEnd="url(#dd-ah-green)" />}
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
