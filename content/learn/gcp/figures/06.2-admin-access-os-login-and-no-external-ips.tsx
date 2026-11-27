// Drawings for this chapter. Classes are styled by `.dd-fig` in globals.css;
// arrowheads come from <DiagramDefs />. Plum is Google's, teal is Kadé's VPC and
// VMs, amber the settings Kadé writes, red a problem.

/** A red ✕ in a dot: where an attempt ends. */
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

const KEY_ROWS: [string, string, boolean][] = [
  ["you@laptop", "added by gcloud, 2025", false],
  ["teammate", "added by gcloud, 2025", false],
  ["freelancer", "left last year", true],
];
const KEY_VMS = ["kade-api-1", "kade-api-2", "kade-db", "kade-worker"];

export function FigKeys() {
  return (
    <svg viewBox="0 0 960 330" role="img" aria-label="SSH keys in project metadata. The ssh-keys list holds three public keys: yours, a teammate's, and a freelancer's who left last year. The guest agent on every VM copies the whole list into that VM, so all four VMs accept all three keys. The freelancer still holds the private key and can log in to every VM, and the VM's log names only the key, not the person.">
      <rect className="n amber" x="16" y="40" width="300" height="214" rx="2" />
      <text className="t" x="30" y="66">project metadata · ssh-keys</text>
      <text className="s" x="30" y="86">works on every VM</text>
      {KEY_ROWS.map(([who, note, bad], i) => {
        const y = 102 + i * 50;
        return (
          <g key={who}>
            <rect className={bad ? "n fault" : "n"} x="30" y={y} width="272" height="40" rx="2" />
            <text className="t" x="42" y={y + 25}>
              {who}
            </text>
            <text className={bad ? "flt" : "f"} x="290" y={y + 25} style={{ textAnchor: "end" }}>
              {note}
            </text>
          </g>
        );
      })}

      {/* The guest agent copies the whole list into every VM. */}
      <path className="w" d="M316 146 H350" />
      {KEY_VMS.map((vm, i) => {
        const y = 40 + i * 60;
        return (
          <g key={vm}>
            <path className="w" d={`M350 146 V${y + 24} H417`} markerEnd="url(#dd-ah-muted)" />
            <rect className="n teal" x="420" y={y} width="250" height="48" rx="2" />
            <text className="t" x="434" y={y + 21}>
              {vm}
            </text>
            <text className="s" x="434" y={y + 39}>
              accepts all 3 keys
            </text>
          </g>
        );
      })}
      <text className="f" x="16" y="282">
        the guest agent on each VM copies the list in
      </text>

      <rect className="n fault" x="744" y="104" width="200" height="84" rx="2" />
      <text className="t" x="758" y="130">Freelancer</text>
      <text className="s" x="758" y="152">still holds the</text>
      <text className="s" x="758" y="170">private key</text>
      {KEY_VMS.map((vm, i) => {
        const y = 40 + i * 60 + 24;
        return <path key={vm} className="w fault dash" d={`M744 146 H708 V${y} H673`} markerEnd="url(#dd-ah-fault)" />;
      })}
      <text className="flt" x="420" y="298">
        logs in to every VM, and the log only names the key:
      </text>
      <text className="s" x="420" y="318">
        Accepted publickey … SHA256:9fQ2…
      </text>
    </svg>
  );
}

export function FigOsLogin() {
  return (
    <svg viewBox="0 0 960 384" role="img" aria-label="How OS Login decides. 1, gcloud adds your public key to your OS Login profile, which Google keeps for you@kade.lk. 2, you SSH to kade-db through IAP. 3, kade-db's SSH server asks OS Login, through the VM's metadata server at 169.254.169.254, whose key this is and whether IAM lets that person log in, and with sudo. 4, if yes, you log in as the Linux user you_kade_lk. The freelancer's old key is only in metadata, which a VM with OS Login ignores, so OS Login finds no allowed owner and the login is refused.">
      <text className="s" x="16" y="34">internet</text>
      <rect className="n" x="16" y="52" width="196" height="80" rx="2" />
      <text className="t" x="30" y="78">You</text>
      <text className="s" x="30" y="100">you@kade.lk</text>
      <text className="s" x="30" y="118">gcloud compute ssh</text>
      <rect className="n fault" x="16" y="262" width="196" height="72" rx="2" />
      <text className="t" x="30" y="288">Freelancer</text>
      <text className="s" x="30" y="310">old key, only in</text>
      <text className="s" x="30" y="326">metadata</text>

      <rect className="zone plum" x="236" y="16" width="708" height="352" rx="2" />
      <text className="s" x="252" y="40">Google&apos;s network</text>
      <rect className="n plum" x="600" y="40" width="324" height="112" rx="2" />
      <text className="t" x="614" y="66">OS Login · run by Google</text>
      <text className="s" x="614" y="90">profile you@kade.lk: your key</text>
      <text className="s" x="614" y="112">IAM: compute.osAdminLogin</text>
      <text className="s" x="614" y="134">Linux user: you_kade_lk</text>

      <path className="w dash" d="M212 66 H597" markerEnd="url(#dd-ah-muted)" />
      <text className="s" x="252" y="58">1 gcloud adds your key to your profile</text>

      <rect className="zone teal" x="256" y="186" width="668" height="168" rx="2" />
      <text className="s" x="272" y="210">kade-vpc</text>
      <rect className="n teal" x="470" y="222" width="250" height="112" rx="2" />
      <text className="t" x="484" y="248">kade-db · sshd</text>
      <text className="s" x="484" y="270">enable-oslogin=TRUE</text>
      <text className="s" x="484" y="290">metadata keys: ignored</text>
      <text className="s" x="484" y="312">asks via 169.254.169.254</text>

      <path className="w green" d="M212 110 H420 V250 H467" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="252" y="102">2 ssh, via IAP</text>

      <path className="w plum" d="M660 219 V155" markerStart="url(#dd-ah-plum)" markerEnd="url(#dd-ah-plum)" />
      <text className="s" x="672" y="176">3 whose key? allowed?</text>

      <text className="t" x="740" y="256">4 ✓ logged in</text>
      <text x="740" y="278">as you_kade_lk,</text>
      <text x="740" y="298">with sudo</text>

      <path className="w fault dash" d="M212 298 H445" />
      <Stop x={458} y={298} />
      <text className="flt" x="272" y="326">no allowed owner:</text>
      <text className="flt" x="272" y="344">refused</text>
    </svg>
  );
}

export function FigGates() {
  return (
    <svg viewBox="0 0 960 250" role="img" aria-label="Two gates, both inside Google's network. Gate 1, IAP: can this identity reach the VM's port 22? Needs the IAP API, the tunnel role, and the firewall rule for 35.235.240.0/20. Gate 2, OS Login, on the VM in kade-vpc: can this identity log in, and with sudo? Needs OS Login on, an OS Login role, and the service account user role on the VM's service account. Pass both and you get a shell as you_kade_lk.">
      <rect className="n" x="16" y="88" width="160" height="80" rx="2" />
      <text className="t" x="30" y="116">you@kade.lk</text>
      <text className="s" x="30" y="138">gcloud ssh</text>

      <rect className="zone plum" x="196" y="16" width="748" height="218" rx="2" />
      <text className="s" x="212" y="40">Google&apos;s network</text>
      <rect className="n plum" x="212" y="56" width="300" height="160" rx="2" />
      <text className="t" x="228" y="82">Gate 1 · IAP (chapter 6.1)</text>
      <text x="228" y="106">can you REACH port 22?</text>
      <text className="s" x="228" y="134">· IAP API enabled</text>
      <text className="s" x="228" y="156">· iap.tunnelResourceAccessor</text>
      <text className="s" x="228" y="178">· firewall: 22 from IAP</text>

      <rect className="zone teal" x="536" y="30" width="392" height="196" rx="2" />
      <text className="s" x="552" y="54">kade-vpc · on the VM</text>
      <rect className="n amber" x="552" y="66" width="360" height="150" rx="2" />
      <text className="t" x="568" y="92">Gate 2 · OS Login (this chapter)</text>
      <text x="568" y="116">can you LOG IN, and as whom?</text>
      <text className="s" x="568" y="142">· enable-oslogin=TRUE</text>
      <text className="s" x="568" y="164">· compute.osLogin or osAdminLogin</text>
      <text className="s" x="568" y="186">{"· serviceAccountUser on the VM's SA"}</text>
      <text className="t" x="568" y="208">→ shell as you_kade_lk</text>

      <line className="w green" x1="176" y1="128" x2="209" y2="128" markerEnd="url(#dd-ah-green)" />
      <line className="w green" x1="512" y1="128" x2="549" y2="128" markerEnd="url(#dd-ah-green)" />
    </svg>
  );
}

export function FigNoip() {
  return (
    <svg viewBox="0 0 960 472" role="img" aria-label="VMs with no external IP still do their whole job through four paths. 1, admin comes in through IAP to kade-worker. 2, kade-worker reaches Google APIs through Private Google Access, without leaving Google's network. 3, kade-worker reaches the internet through Cloud NAT, going out only. 4, shoppers reach the kade-media VMs through the external load balancer, which holds the public IP 34.120.88.10 and connects to the VMs on their internal IPs; the firewall lets traffic in from the load balancer's ranges only. A scanner on the internet finds nothing to connect to, because no VM has an external IP.">
      <text className="s" x="16" y="34">internet</text>
      <rect className="n" x="16" y="40" width="180" height="64" rx="2" />
      <text className="t" x="30" y="66">You</text>
      <text className="s" x="30" y="88">admin work</text>
      <rect className="n" x="16" y="136" width="180" height="64" rx="2" />
      <text className="t" x="30" y="162">Shoppers</text>
      <text className="s" x="30" y="184">www.kade.lk/media</text>
      <rect className="n fault" x="16" y="288" width="180" height="64" rx="2" />
      <text className="t" x="30" y="314">Scanner</text>
      <text className="s" x="30" y="336">looking for a way in</text>
      <rect className="n" x="16" y="384" width="180" height="64" rx="2" />
      <text className="t" x="30" y="410">apt, PayGate</text>
      <text className="s" x="30" y="432">sites on the internet</text>

      <rect className="zone plum" x="220" y="16" width="724" height="446" rx="2" />
      <text className="s" x="236" y="40">Google&apos;s network</text>
      <rect className="n plum" x="240" y="48" width="164" height="56" rx="2" />
      <text className="t" x="254" y="72">IAP</text>
      <text className="s" x="254" y="92">chapter 6.1</text>
      <rect className="n plum" x="240" y="136" width="164" height="64" rx="2" />
      <text className="t" x="254" y="160">load balancer</text>
      <text className="s" x="254" y="182">34.120.88.10</text>
      <rect className="n plum" x="780" y="48" width="150" height="56" rx="2" />
      <text className="t" x="794" y="72">Google APIs</text>
      <text className="s" x="794" y="92">Storage, Logging</text>

      <rect className="zone teal" x="430" y="120" width="330" height="232" rx="2" />
      <text className="s" x="446" y="142">kade-vpc</text>
      <rect className="n teal" x="460" y="154" width="270" height="64" rx="2" />
      <text className="t" x="474" y="180">kade-worker</text>
      <text className="s" x="474" y="202">10.10.1.20 · no external IP</text>
      <rect className="n teal" x="460" y="256" width="270" height="64" rx="2" />
      <text className="t" x="474" y="282">kade-media VMs · ch. 12.2</text>
      <text className="s" x="474" y="304">:8080 · no external IP</text>

      <rect className="n teal" x="460" y="390" width="270" height="56" rx="2" />
      <text className="t" x="474" y="414">Cloud NAT · chapter 7</text>
      <text className="s" x="474" y="434">a shared IP, out only</text>

      {/* 1: admin in, through IAP. */}
      <line className="w green" x1="196" y1="72" x2="237" y2="72" markerEnd="url(#dd-ah-green)" />
      <path className="w green" d="M404 72 H595 V151" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="420" y="64">1 admin in</text>
      {/* 2: to Google APIs, never leaving Google's network. */}
      <path className="w teal" d="M730 178 H900 V107" markerEnd="url(#dd-ah-teal)" />
      <text className="s" x="776" y="206">2 Private Google</text>
      <text className="s" x="776" y="224">Access · ch. 9</text>
      {/* 3: to the internet, out through Cloud NAT. */}
      <path className="w teal" d="M730 198 H745 V418 H733" markerEnd="url(#dd-ah-teal)" />
      <path className="w teal" d="M460 418 H199" markerEnd="url(#dd-ah-teal)" />
      <text className="s" x="240" y="408">3 out to the internet</text>
      {/* 4: public traffic in, through the load balancer, to internal IPs. */}
      <line className="w green" x1="196" y1="168" x2="237" y2="168" markerEnd="url(#dd-ah-green)" />
      <path className="w green" d="M404 168 H444 V288 H457" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="250" y="226">4 public traffic in</text>
      <text className="s" x="250" y="244">to internal IPs,</text>
      <text className="s" x="250" y="262">from LB ranges</text>

      {/* Nothing from the internet can start a connection to a VM directly. */}
      <path className="w fault dash" d="M196 320 H417" />
      <Stop x={430} y={320} />
      <text className="flt" x="240" y="346">nothing to connect to:</text>
      <text className="flt" x="240" y="364">no external IP</text>
    </svg>
  );
}

export function FigBorrow() {
  return (
    <svg viewBox="0 0 960 300" role="img" aria-label="How logging in borrows a VM's service account. dev2 has no access to Secret Manager, but logs in to kade-db, which runs as sa-kade-db. 1, a command on kade-db asks the metadata server at 169.254.169.254 for a token. 2, the metadata server hands back sa-kade-db's token, the same one the database gets. 3, the command calls Secret Manager as sa-kade-db and reads kade-db-password. dev2 now holds access nobody granted them.">
      <rect className="n" x="16" y="84" width="170" height="80" rx="2" />
      <text className="t" x="30" y="110">dev2@kade.lk</text>
      <text className="s" x="30" y="132">no Secret Manager</text>
      <text className="s" x="30" y="150">access of their own</text>

      <rect className="zone plum" x="210" y="16" width="734" height="268" rx="2" />
      <text className="s" x="226" y="40">Google&apos;s network</text>
      <rect className="zone teal" x="230" y="52" width="330" height="132" rx="2" />
      <text className="s" x="246" y="74">kade-vpc</text>
      <rect className="n teal" x="250" y="84" width="290" height="80" rx="2" />
      <text className="t" x="264" y="110">kade-db · runs as sa-kade-db</text>
      <text className="s" x="264" y="132">dev2 runs: gcloud secrets</text>
      <text className="s" x="264" y="150">versions access …</text>
      <line className="w" x1="186" y1="124" x2="247" y2="124" markerEnd="url(#dd-ah-muted)" />

      <rect className="n plum" x="250" y="218" width="290" height="56" rx="2" />
      <text className="t" x="264" y="242">metadata server</text>
      <text className="s" x="264" y="262">169.254.169.254, on the host</text>
      <line className="w" x1="330" y1="164" x2="330" y2="215" markerEnd="url(#dd-ah-muted)" />
      <text className="s" x="342" y="206">1 token?</text>
      <line className="w fault" x1="460" y1="218" x2="460" y2="167" markerEnd="url(#dd-ah-fault)" />
      <text className="flt" x="472" y="206">2 its token</text>

      <rect className="n plum" x="700" y="84" width="224" height="80" rx="2" />
      <text className="t" x="714" y="110">Secret Manager</text>
      <text className="s" x="714" y="132">kade-db-password</text>
      <path className="w fault" d="M540 124 H697" markerEnd="url(#dd-ah-fault)" />
      <text className="flt" x="576" y="114">3 as sa-kade-db</text>
      <text className="flt" x="700" y="200">dev2 reads a secret</text>
      <text className="flt" x="700" y="220">nobody granted them</text>
    </svg>
  );
}
