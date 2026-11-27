import type { MetadataRoute } from "next";
import { site } from "@/config/site";

// A static export writes this once, at build time.
export const dynamic = "force-static";

/** What a phone needs to add the site to its home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    // The dark theme's ground: the site opens dark.
    background_color: "#131312",
    theme_color: "#131312",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      // Full bleed with the mark inside the safe zone, so it crops cleanly.
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
