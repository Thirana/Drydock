// Drawings for this chapter, converted from the course notes. Classes are
// styled by `.dd-fig` in globals.css; arrowheads come from <DiagramDefs />.

export function FigGates() {
  return (
    <svg viewBox="0 0 960 220" role="img" aria-label="Two gates. Gate 1, IAP: can this identity reach the VM's port 22? Needs the IAP API, the tunnel role, and the firewall rule for 35.235.240.0/20. Gate 2, OS Login: can this identity log in, and with sudo? Needs an OS Login role and service account user role.">
      <rect className="n" x="16" y="70" width="170" height="80" rx="2" />
      <text className="t" x="30" y="100">you@kade.lk</text>
      <text className="s" x="30" y="122">gcloud compute ssh</text>
      <line className="w" x1="186" y1="110" x2="233" y2="110" markerEnd="url(#dd-ah-muted)" />
      <rect className="n plum" x="236" y="30" width="300" height="160" rx="2" />
      <text className="t" x="252" y="56">Gate 1 · IAP (chapter 6.1)</text>
      <text className="s" x="252" y="80">can you REACH port 22?</text>
      <text className="s" x="252" y="108">· IAP API enabled</text>
      <text className="s" x="252" y="128">· iap.tunnelResourceAccessor</text>
      <text className="s" x="252" y="148">· firewall: 22 from 35.235.240.0/20</text>
      <line className="w green" x1="536" y1="110" x2="583" y2="110" markerEnd="url(#dd-ah-green)" />
      <rect className="n amber" x="586" y="30" width="300" height="160" rx="2" />
      <text className="t" x="602" y="56">Gate 2 · OS Login (this chapter)</text>
      <text className="s" x="602" y="80">can you LOG IN, and as whom?</text>
      <text className="s" x="602" y="108">· enable-oslogin=TRUE</text>
      <text className="s" x="602" y="128">· compute.osLogin (or osAdminLogin)</text>
      <text className="s" x="602" y="148">{"· serviceAccountUser on the VM's SA"}</text>
      <line className="w green" x1="886" y1="110" x2="921" y2="110" markerEnd="url(#dd-ah-green)" />
      <text className="s" x="900" y="96">shell</text>
    </svg>
  );
}

export function FigNoip() {
  return (
    <svg viewBox="0 0 960 260" role="img" aria-label="A VM with no external IP needs three paths. Inbound admin access through IAP from 35.235.240.0/20. Outbound to Google APIs through Private Google Access. Outbound to the internet through Cloud NAT with a fixed IP.">
      <rect className="n green" x="360" y="80" width="240" height="100" rx="2" />
      <text className="t" x="376" y="110">kade-worker</text>
      <text className="s" x="376" y="134">10.10.1.20</text>
      <text className="s" x="376" y="156">no external IP</text>
      <rect className="n plum" x="16" y="30" width="250" height="70" rx="2" />
      <text className="t" x="30" y="58">1 · IAP</text>
      <text className="s" x="30" y="80">admin comes IN (chapter 6.1)</text>
      <line className="w plum" x1="266" y1="75" x2="357" y2="110" markerEnd="url(#dd-ah-plum)" />
      <rect className="n plum" x="694" y="30" width="250" height="70" rx="2" />
      <text className="t" x="708" y="58">2 · Private Google Access</text>
      <text className="s" x="708" y="80">to Google APIs (chapter 9)</text>
      <line className="w teal" x1="600" y1="110" x2="691" y2="75" markerEnd="url(#dd-ah-teal)" />
      <rect className="n teal" x="694" y="170" width="250" height="70" rx="2" />
      <text className="t" x="708" y="198">3 · Cloud NAT</text>
      <text className="s" x="708" y="220">to the internet (chapter 7)</text>
      <line className="w teal" x1="600" y1="150" x2="691" y2="200" markerEnd="url(#dd-ah-teal)" />
      <text className="s" x="16" y="170">Nothing starts a connection</text>
      <text className="s" x="16" y="188">to kade-worker from the internet.</text>
      <text className="s" x="16" y="214">Everything else is identity-</text>
      <text className="s" x="16" y="232">controlled or goes out only.</text>
    </svg>
  );
}
