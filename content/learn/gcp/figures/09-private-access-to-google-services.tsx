// Drawings for this chapter. Classes are styled by `.dd-fig` in globals.css;
// arrowheads come from <DiagramDefs />.

/** Cloud SQL has two doors: its admin API (PGA) and the instance's IP (PSA). */
export function FigTwoDoors() {
  return (
    <svg
      viewBox="0 0 960 288"
      role="img"
      aria-label="kade-api-1 in kade-vpc talks to Cloud SQL in two ways. To manage the instance and fetch certificates it calls the Cloud SQL Admin API, sqladmin.googleapis.com, over HTTPS with an IAM token, which reaches Google through Private Google Access. To query the database it connects to kade-sql at 10.10.32.3 on port 5432, inside Google's service network, over the private services access peering."
    >
      {/* Your side: one VM, both wires leave from it at their row's height. */}
      <rect className="zone teal" x="16" y="12" width="300" height="264" rx="2" />
      <text className="s" x="32" y="34">kade-vpc</text>
      <rect className="n teal" x="32" y="52" width="268" height="208" rx="2" />
      <text className="t" x="48" y="80">kade-api-1</text>
      <text className="s" x="48" y="102">10.10.1.10</text>
      <text className="s f" x="48" y="124">runs the Cloud SQL connector</text>

      {/* Google's side: the API everyone shares, and the instance that is Kadé's. */}
      <rect className="zone plum" x="560" y="12" width="384" height="264" rx="2" />
      <text className="s" x="576" y="34">Google&apos;s network</text>

      <rect className="n plum" x="576" y="52" width="352" height="80" rx="2" />
      <text className="t" x="592" y="78">Cloud SQL Admin API</text>
      <text className="s" x="592" y="100">sqladmin.googleapis.com</text>
      <text className="s f" x="592" y="120">create, resize, certificates</text>

      <rect className="zone plum" x="576" y="150" width="352" height="110" rx="2" />
      <text className="s" x="592" y="172">service network</text>
      <rect className="n plum" x="592" y="184" width="320" height="60" rx="2" />
      <text className="t" x="608" y="208">kade-sql</text>
      <text className="s" x="608" y="230">10.10.32.3 · your data</text>

      {/* Control: a Google API call. */}
      <line className="w green" x1="300" y1="90" x2="573" y2="90" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="430" y="80">HTTPS + IAM token</text>
      <text className="l mid" x="430" y="112">Private Google Access</text>

      {/* Data: a connection to an IP, over the peering. */}
      <line className="w green" x1="300" y1="214" x2="589" y2="214" markerEnd="url(#dd-ah-green)" />
      <text className="s mid" x="430" y="204">Postgres on :5432</text>
      <text className="l mid" x="430" y="236">private services access</text>
    </svg>
  );
}
