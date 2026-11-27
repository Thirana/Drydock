import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import {
  defectHref,
  harbour,
  harbourHref,
  journeyHref,
  journeysHref,
  defectsHref,
  platformPageHref,
} from "@/lib/content/harbour";
import {
  chapterHref,
  courseHref,
  courses,
  publishedChapters,
} from "@/lib/content/learn";

// A static export writes this once, at build time.
export const dynamic = "force-static";

/** Every page a reader can land on. The old /gcp/harbour URLs only redirect, so they are left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/learn",
    ...courses.map(courseHref),
    ...publishedChapters().map(chapterHref),
    "/learn/glossary",
    "/labs",
    harbourHref,
    ...harbour.platform.map((p) => platformPageHref(p.slug)),
    journeysHref,
    ...harbour.architecture.journeys.map((j) => journeyHref(j.slug)),
    defectsHref,
    ...harbour.architecture.defects.map((d) => defectHref(d.id)),
  ];
  return paths.map((path) => ({ url: `${site.url}${path}` }));
}
