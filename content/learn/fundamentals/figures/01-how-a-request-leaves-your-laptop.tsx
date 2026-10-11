// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigExample() {
  return (
    <svg viewBox="0 0 920 270" role="img" aria-label="Laptop with browser and OS stack sends an HTTPS request through the home router and the internet to a Node app on a GCP VM; the response comes back the same way.">
      <rect className="zone" x="16" y="26" width="212" height="190" rx="2" />
      <text className="s" x="32" y="50">your laptop · 192.168.1.23</text>
      <rect className="n plum" x="36" y="68" width="172" height="62" rx="2" />
      <text className="t" x="52" y="94">Browser</text>
      <text className="s" x="52" y="115">runs your fetch()</text>
      <line className="w" x1="122" y1="130" x2="122" y2="150" markerEnd="url(#dd-ah-muted)" />
      <rect className="n amber" x="36" y="152" width="172" height="46" rx="2" />
      <text className="t" x="52" y="180">OS network stack</text>
      <line className="w green" x1="228" y1="122" x2="314" y2="122" markerEnd="url(#dd-ah-green)" />
      <rect className="n teal" x="316" y="90" width="150" height="64" rx="2" />
      <text className="t" x="332" y="116">Home router</text>
      <text className="s" x="332" y="137">192.168.1.1</text>
      <line className="w green" x1="466" y1="122" x2="533" y2="122" markerEnd="url(#dd-ah-green)" />
      <rect className="zone" x="535" y="78" width="165" height="88" rx="2" />
      <text className="t" x="551" y="114">Internet</text>
      <text className="s" x="551" y="135">ISP + many routers</text>
      <line className="w green" x1="700" y1="122" x2="728" y2="122" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="240" y="112">request</text>
      <rect className="zone" x="730" y="26" width="176" height="190" rx="2" />
      <text className="s" x="744" y="50">GCP · asia-southeast1</text>
      <rect className="n green" x="746" y="66" width="144" height="134" rx="2" />
      <text className="t" x="762" y="92">kade-api (VM)</text>
      <text className="s" x="762" y="112">34.87.120.15</text>
      <rect className="n" x="760" y="128" width="116" height="56" rx="2" />
      <text className="t" x="774" y="152">Node app</text>
      <text className="s" x="774" y="172">listening</text>
      <path className="w dash" d="M818 216 V246 H122 V204" markerEnd="url(#dd-ah-muted)" />
      <text className="s" x="360" y="240">the response comes back the same way</text>
    </svg>
  );
}

export function FigDns() {
  return (
    <svg viewBox="0 0 920 330" role="img" aria-label="DNS chain: browser asks recursive resolver; resolver asks root, then .com TLD, then authoritative server; answer returns to browser.">
      <rect className="n plum" x="20" y="125" width="176" height="82" rx="2" />
      <text className="t" x="36" y="151">Browser</text>
      <text className="s" x="36" y="172">checks its own cache,</text>
      <text className="s" x="36" y="190">then the OS cache</text>
      <rect className="n teal" x="300" y="125" width="192" height="82" rx="2" />
      <text className="t" x="316" y="151">Recursive resolver</text>
      <text className="s" x="316" y="172">your ISP, or 8.8.8.8</text>
      <text className="s" x="316" y="190">asks others for you</text>
      <rect className="n" x="640" y="18" width="262" height="64" rx="2" />
      <text className="t" x="656" y="44">Root server</text>
      <text className="s" x="656" y="65">reply: ask the .lk servers</text>
      <rect className="n" x="640" y="134" width="262" height="64" rx="2" />
      <text className="t" x="656" y="160">.lk TLD server</text>
      <text className="s" x="656" y="181">{"reply: ask kade.lk's servers"}</text>
      <rect className="n green" x="640" y="250" width="262" height="64" rx="2" />
      <text className="t" x="656" y="276">Authoritative server</text>
      <text className="s" x="656" y="297">reply: 34.87.120.15</text>
      <line className="w plum" x1="196" y1="150" x2="298" y2="150" markerEnd="url(#dd-ah-plum)" />
      <line className="w green" x1="300" y1="184" x2="198" y2="184" markerEnd="url(#dd-ah-green)" />
      <line className="w" x1="492" y1="146" x2="638" y2="54" markerStart="url(#dd-ah-muted)" markerEnd="url(#dd-ah-muted)" />
      <line className="w" x1="492" y1="166" x2="638" y2="166" markerStart="url(#dd-ah-muted)" markerEnd="url(#dd-ah-muted)" />
      <line className="w" x1="492" y1="186" x2="638" y2="280" markerStart="url(#dd-ah-muted)" markerEnd="url(#dd-ah-muted)" />
      <circle className="badge" cx="247" cy="132" r="11" />
      <text className="mid" x="247" y="137">1</text>
      <circle className="badge" cx="565" cy="100" r="11" />
      <text className="mid" x="565" y="105">2</text>
      <circle className="badge" cx="565" cy="166" r="11" />
      <text className="mid" x="565" y="171">3</text>
      <circle className="badge" cx="565" cy="233" r="11" />
      <text className="mid" x="565" y="238">4</text>
      <circle className="badge" cx="247" cy="205" r="11" />
      <text className="mid" x="247" y="210">5</text>
    </svg>
  );
}

export function FigHandoff() {
  return (
    <svg viewBox="0 0 920 420" role="img" aria-label="Layers: browser in user space hands bytes to the OS TCP/IP stack in the kernel, which passes frames to the NIC, which sends signals on the wire or air.">
      <text className="s" x="20" y="60">user space</text>
      <text className="s" x="20" y="185">kernel (the OS)</text>
      <text className="s" x="20" y="315">hardware</text>
      <text className="s" x="20" y="395">medium</text>
      <rect className="n plum" x="170" y="22" width="540" height="70" rx="2" />
      <text className="t" x="188" y="50">Browser (your app)</text>
      <text className="s" x="188" y="72">writes the HTTP request, asks for DNS, asks the OS to send</text>
      <line className="w" x1="440" y1="92" x2="440" y2="138" markerEnd="url(#dd-ah-muted)" />
      <text className="s" x="452" y="120">hands over bytes (writes to a socket)</text>
      <rect className="n amber" x="170" y="140" width="540" height="80" rx="2" />
      <text className="t" x="188" y="168">OS TCP/IP stack</text>
      <text className="s" x="188" y="190">implements TCP, UDP, ICMP, IP · picks the source port</text>
      <text className="s" x="188" y="208">splits the data and adds the headers (next sections)</text>
      <line className="w" x1="440" y1="220" x2="440" y2="278" markerEnd="url(#dd-ah-muted)" />
      <text className="s" x="452" y="244">passes finished frames</text>
      <text className="s" x="452" y="262">to the driver</text>
      <rect className="n teal" x="170" y="280" width="540" height="62" rx="2" />
      <text className="t" x="188" y="306">NIC (network card)</text>
      <text className="s" x="188" y="326">turns bits into physical signals</text>
      <line className="w" x1="440" y1="342" x2="440" y2="368" markerEnd="url(#dd-ah-muted)" />
      <rect className="n green" x="170" y="370" width="540" height="40" rx="2" />
      <text className="s" x="188" y="395">wire or air: radio (WiFi), electrical (Ethernet), light (fiber)</text>
      <path className="w plum" d="M728 26 H738 V88 H728" />
      <text className="l" x="750" y="62">prepares the</text>
      <text className="l" x="750" y="80">message</text>
      <path className="w amber" d="M728 144 H738 V338 H728" />
      <text className="l" x="750" y="246">transmits it</text>
    </svg>
  );
}

export function FigChunks() {
  return (
    <svg viewBox="0 0 920 240" role="img" aria-label="4,000 bytes split into three TCP segments of 1460, 1460 and 1080 bytes with sequence numbers 1, 1461 and 2921.">
      <rect className="n plum" x="20" y="20" width="880" height="44" rx="2" />
      <text className="mid t" x="460" y="47">4,000 bytes of request data</text>
      <line className="w" x1="175" y1="64" x2="175" y2="116" markerEnd="url(#dd-ah-muted)" />
      <line className="w" x1="501" y1="64" x2="501" y2="116" markerEnd="url(#dd-ah-muted)" />
      <line className="w" x1="786" y1="64" x2="786" y2="116" markerEnd="url(#dd-ah-muted)" />
      <rect className="n amber" x="20" y="118" width="310" height="70" rx="2" />
      <text className="t" x="36" y="145">chunk 1 · 1,460 bytes</text>
      <text className="s" x="36" y="167">bytes 1-1460 · seq 1</text>
      <rect className="n amber" x="346" y="118" width="310" height="70" rx="2" />
      <text className="t" x="362" y="145">chunk 2 · 1,460 bytes</text>
      <text className="s" x="362" y="167">bytes 1461-2920 · seq 1461</text>
      <rect className="n amber" x="672" y="118" width="228" height="70" rx="2" />
      <text className="t" x="688" y="145">chunk 3 · 1,080</text>
      <text className="s" x="688" y="167">bytes 2921-4000 · seq 2921</text>
      <path className="w amber" d="M20 196 V204 H330 V196" />
      <text className="l" x="20" y="226">each chunk travels in its own TCP segment, inside its own IP packet</text>
    </svg>
  );
}

export function FigChunks2() {
  return (
    <svg viewBox="0 0 920 224" role="img" aria-label="Frame layout: Ethernet header 14 bytes, IP header 20, TCP header 20, data 1460, FCS 4. The chunk of data, up to the MSS of 1,460 bytes, sits inside a TCP segment (TCP header plus chunk), which sits inside an IP packet of up to the MTU, 1,500 bytes, which sits inside a frame of 1,518 bytes on the cable.">
      <text className="mid l" x="460" y="20">frame on the cable: 1,518 bytes</text>
      <path className="w teal" d="M20 38 V30 H900 V38" />
      <text className="mid l" x="465" y="54">IP packet: up to the MTU, 1,500 bytes</text>
      <path className="w green" d="M112 72 V64 H818 V72" />
      <rect className="n teal" x="20" y="78" width="90" height="60" rx="2" />
      <text className="mid t" x="65" y="104">Eth</text>
      <text className="mid s" x="65" y="124">14</text>
      <rect className="n green" x="112" y="78" width="118" height="60" rx="2" />
      <text className="mid t" x="171" y="104">IP header</text>
      <text className="mid s" x="171" y="124">20</text>
      <rect className="n amber" x="232" y="78" width="118" height="60" rx="2" />
      <text className="mid t" x="291" y="104">TCP header</text>
      <text className="mid s" x="291" y="124">20</text>
      <rect className="n plum" x="352" y="78" width="466" height="60" rx="2" />
      <text className="mid t" x="585" y="104">Data: one chunk</text>
      <text className="mid s" x="585" y="124">up to 1,460</text>
      <rect className="n teal" x="820" y="78" width="80" height="60" rx="2" />
      <text className="mid t" x="860" y="104">FCS</text>
      <text className="mid s" x="860" y="124">4</text>
      <path className="w amber" d="M232 146 V154 H818 V146" />
      <text className="mid l" x="525" y="172">TCP segment: 20 + up to 1,460</text>
      <path className="w plum" d="M352 182 V190 H818 V182" />
      <text className="mid l" x="585" y="210">chunk: up to the MSS, 1,460 = 1,500 − 20 (IP) − 20 (TCP)</text>
    </svg>
  );
}

export function FigArp() {
  return (
    <svg viewBox="0 0 920 320" role="img" aria-label="ARP: laptop broadcasts who has 192.168.1.1 to phone, TV and router; phone and TV ignore; router replies with its MAC.">
      <rect className="n plum" x="20" y="118" width="192" height="82" rx="2" />
      <text className="t" x="36" y="144">Your laptop</text>
      <text className="s" x="36" y="165">192.168.1.23</text>
      <text className="s" x="36" y="183">a4:83:e7:2b:91:0c</text>
      <rect className="n" x="640" y="18" width="262" height="64" rx="2" />
      <text className="t" x="656" y="44">Phone</text>
      <text className="s" x="656" y="65">192.168.1.40 · not me, ignore</text>
      <rect className="n" x="640" y="128" width="262" height="64" rx="2" />
      <text className="t" x="656" y="154">Smart TV</text>
      <text className="s" x="656" y="175">192.168.1.52 · not me, ignore</text>
      <rect className="n teal" x="640" y="238" width="262" height="64" rx="2" />
      <text className="t" x="656" y="264">Home router</text>
      <text className="s" x="656" y="285">{"192.168.1.1 · that's me"}</text>
      <line className="w amber dash" x1="212" y1="140" x2="638" y2="52" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber dash" x1="212" y1="152" x2="638" y2="160" markerEnd="url(#dd-ah-amber)" />
      <line className="w amber dash" x1="212" y1="164" x2="638" y2="258" markerEnd="url(#dd-ah-amber)" />
      <line className="w green" x1="638" y1="290" x2="214" y2="192" markerEnd="url(#dd-ah-green)" />
      <text className="l" x="232" y="30">1 · broadcast to ff:ff:ff:ff:ff:ff (everyone)</text>
      <text className="s" x="232" y="50">{"\"who has 192.168.1.1? tell 192.168.1.23\""}</text>
      <text className="l" x="232" y="288">2 · reply only to the laptop</text>
      <text className="s" x="232" y="308">{"\"192.168.1.1 is at 3c:84:6a:10:ee:01\""}</text>
    </svg>
  );
}
