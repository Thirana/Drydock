"use client";

import { useEffect } from "react";

/**
 * Go to the new URL now, keeping the old URL's #anchor. With `pageFromHash`,
 * an anchor that named an entry on the old page names a page of its own
 * now: /defects#D6 becomes /defects/d6.
 */
export function MovedHash({
  to,
  pageFromHash,
}: {
  to: string;
  pageFromHash?: boolean;
}) {
  useEffect(() => {
    const hash = window.location.hash;
    const entry = pageFromHash && /^#([A-Za-z0-9-]+)$/.exec(hash)?.[1];
    window.location.replace(entry ? `${to}/${entry.toLowerCase()}` : to + hash);
  }, [to, pageFromHash]);
  return null;
}
