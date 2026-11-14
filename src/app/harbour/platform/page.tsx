import type { Metadata } from "next";
import { PlatformView } from "@/components/harbour/platform-view";
import { harbour } from "@/lib/content/harbour";

const page = harbour.platform[0];

export const metadata: Metadata = {
  title: `${page.title} · ${harbour.title}`,
  description: page.description,
};

/** The platform section's index: its first page, the map. */
export default function PlatformIndex() {
  return <PlatformView page={page} />;
}
