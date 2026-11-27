import type { Metadata } from "next";
import { Moved } from "@/components/site/moved";
import { harbourHref } from "@/lib/content/harbour-routes";

export const metadata: Metadata = { robots: { index: false } };

/** Old URL of the labs page, kept so links to it still land. */
export default function LabsMoved() {
  return <Moved to={harbourHref} />;
}
