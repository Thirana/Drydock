import type { Metadata } from "next";
import { Moved } from "@/components/site/moved";
import {
  defectsHref,
  getPlatformPage,
  journeysHref,
  platformPageHref,
} from "@/lib/content/harbour";

export const dynamicParams = false;

export const metadata: Metadata = { robots: { index: false } };

/** The old reference's tabs, and where each one lives now. */
const MOVED: Record<string, string> = {
  map: platformPageHref("map"),
  "ip-plan": platformPageHref("ip-plan"),
  components: platformPageHref("components"),
  "load-balancing": platformPageHref("load-balancing"),
  journeys: journeysHref,
  defects: defectsHref,
};

// Fail the build if a platform page this points at is renamed.
for (const slug of ["map", "ip-plan", "components", "load-balancing"])
  if (!getPlatformPage(slug))
    throw new Error(`Old Harbour tab "${slug}" has no platform page`);

export function generateStaticParams() {
  return Object.keys(MOVED).map((view) => ({ view }));
}

/** Old URL of a Harbour tab, kept so links to it still land. */
export default async function ViewMoved({
  params,
}: PageProps<"/gcp/harbour/network/[view]">) {
  const { view } = await params;
  return <Moved to={MOVED[view]} pageFromHash={view === "defects"} />;
}
