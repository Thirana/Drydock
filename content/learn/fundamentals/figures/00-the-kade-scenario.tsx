// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigMap() {
  return (
    <svg
      viewBox="0 0 960 560"
      role="img"
      aria-label="Map: home LAN with laptop, phone, TV, printer and router; Kadé office with its router; the internet; GCP kade-vpc with sn-app holding kade-api and sn-data holding kade-db; later additions shown as dashed boxes."
    >
      <rect className="zone" x="16" y="24" width="310" height="300" rx="2" />
      <text className="s" x="32" y="46">
        home · Colombo · 192.168.1.0/24
      </text>
      <rect className="n plum" x="32" y="64" width="135" height="54" rx="2" />
      <text className="t" x="46" y="86">
        Laptop
      </text>
      <text className="s" x="46" y="105">
        .23 · you
      </text>
      <rect className="n" x="177" y="64" width="135" height="54" rx="2" />
      <text className="t" x="191" y="86">
        Phone
      </text>
      <text className="s" x="191" y="105">
        .40
      </text>
      <rect className="n" x="32" y="130" width="135" height="54" rx="2" />
      <text className="t" x="46" y="152">
        Smart TV
      </text>
      <text className="s" x="46" y="171">
        .52
      </text>
      <rect className="n" x="177" y="130" width="135" height="54" rx="2" />
      <text className="t" x="191" y="152">
        Printer
      </text>
      <text className="s" x="191" y="171">
        .60
      </text>
      <line className="w" x1="100" y1="184" x2="100" y2="212" />
      <line className="w" x1="245" y1="184" x2="245" y2="212" />
      <rect className="n teal" x="32" y="214" width="280" height="90" rx="2" />
      <text className="t" x="48" y="240">
        Home router
      </text>
      <text className="s" x="48" y="262">
        LAN side 192.168.1.1
      </text>
      <text className="s" x="48" y="282">
        WAN side 203.0.113.45 (public)
      </text>
      <line
        className="w amber"
        x1="312"
        y1="250"
        x2="368"
        y2="250"
        markerEnd="url(#dd-ah-amber)"
      />
      <text className="s" x="370" y="172">
        api.kade.lk → 34.87.120.15
      </text>
      <rect className="zone" x="370" y="186" width="170" height="80" rx="2" />
      <text className="t" x="386" y="218">
        Internet
      </text>
      <text className="s" x="386" y="240">
        ISP + many routers
      </text>
      <rect className="zone" x="600" y="24" width="344" height="300" rx="2" />
      <text className="s" x="616" y="46">
        GCP asia-southeast1 · kade-vpc 10.10.0.0/16
      </text>
      <rect className="zone" x="616" y="62" width="312" height="120" rx="2" />
      <text className="s" x="630" y="82">
        sn-app · 10.10.1.0/24
      </text>
      <rect className="n green" x="630" y="92" width="284" height="78" rx="2" />
      <text className="t" x="646" y="116">
        kade-api (VM, Node app)
      </text>
      <text className="s" x="646" y="138">
        internal 10.10.1.10
      </text>
      <text className="s" x="646" y="158">
        external 34.87.120.15
      </text>
      <rect className="zone" x="616" y="194" width="312" height="118" rx="2" />
      <text className="s" x="630" y="214">
        sn-data · 10.10.2.0/24
      </text>
      <rect
        className="n green"
        x="630"
        y="224"
        width="284"
        height="74"
        rx="2"
      />
      <text className="t" x="646" y="248">
        kade-db (VM, PostgreSQL)
      </text>
      <text className="s" x="646" y="270">
        10.10.2.5 · port 5432
      </text>
      <path
        className="w amber"
        d="M540 214 C 575 214, 590 131, 628 131"
        markerEnd="url(#dd-ah-amber)"
      />
      <line
        className="w dash"
        x1="772"
        y1="170"
        x2="772"
        y2="222"
        markerEnd="url(#dd-ah-muted)"
      />
      <text className="s" x="782" y="191">
        SQL queries
      </text>
      <rect className="zone" x="16" y="344" width="310" height="112" rx="2" />
      <text className="s" x="32" y="366">
        Kadé office · 172.16.0.0/16
      </text>
      <rect className="n teal" x="32" y="378" width="280" height="64" rx="2" />
      <text className="t" x="48" y="402">
        Office router
      </text>
      <text className="s" x="48" y="424">
        staff .1.0/24 · warehouse .2.0/24
      </text>
      <path
        className="w amber"
        d="M312 410 H455 V268"
        markerEnd="url(#dd-ah-amber)"
      />
      <text className="s" x="330" y="430">
        WAN 198.51.100.20
      </text>
      <text className="s" x="16" y="490">
        added in later chapters
      </text>
      <rect className="ghost" x="16" y="502" width="220" height="50" rx="2" />
      <text className="f" x="30" y="524">
        Load balancer
      </text>
      <text className="s" x="30" y="542">
        HTTPS front door
      </text>
      <rect className="ghost" x="252" y="502" width="220" height="50" rx="2" />
      <text className="f" x="266" y="524">
        Cloud NAT
      </text>
      <text className="s" x="266" y="542">
        fixed outgoing IP
      </text>
      <rect className="ghost" x="488" y="502" width="220" height="50" rx="2" />
      <text className="f" x="502" y="524">
        PayGate
      </text>
      <text className="s" x="502" y="542">
        payment provider
      </text>
      <rect className="ghost" x="724" y="502" width="220" height="50" rx="2" />
      <text className="f" x="738" y="524">
        VPN
      </text>
      <text className="s" x="738" y="542">
        office ↔ cloud
      </text>
    </svg>
  );
}
