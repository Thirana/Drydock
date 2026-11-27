import type { Metadata } from "next";
import { Moved } from "@/components/site/moved";
import { defectsHref } from "@/lib/content/harbour-routes";

export const metadata: Metadata = { robots: { index: false } };

/**
 * The old register: its #D6 anchors are pages of their own now, which only a
 * script can read, so this one old URL stays a page. The other old URLs
 * redirect in vercel.json.
 */
export default function DefectsMoved() {
  return <Moved to={defectsHref} pageFromHash />;
}
