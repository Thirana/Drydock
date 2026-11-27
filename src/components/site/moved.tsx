import Link from "next/link";
import { MovedHash } from "./moved-hash";

/**
 * A static page at an old URL that sends the reader to the new one. The
 * export has no server to answer with a 308, so the page refreshes itself,
 * and a script carries over any #anchor (a defect ID, a section) on the way.
 */
export function Moved({
  to,
  pageFromHash,
}: {
  to: string;
  /** The old page's anchors are pages of their own under `to` now. */
  pageFromHash?: boolean;
}) {
  return (
    <>
      {/* When the anchor picks the page, the script has to go first: the refresh waits. */}
      <meta
        httpEquiv="refresh"
        content={`${pageFromHash ? 1 : 0}; url=${to}`}
      />
      <link rel="canonical" href={to} />
      <MovedHash to={to} pageFromHash={pageFromHash} />
      <main className="mx-auto w-full max-w-[1200px] px-5 py-24 sm:px-8">
        <p className="text-ink-body text-[18px]">
          This page has moved to{" "}
          <Link href={to} className="dd-link">
            {to}
          </Link>
          .
        </p>
      </main>
    </>
  );
}
