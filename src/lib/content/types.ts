import type { MDXContent } from "mdx/types";
import type { ArchitectureModel } from "@/lib/architecture/types";

/**
 * The case study: one fictional platform, read in three parts.
 *
 *   /harbour                        overview: the business and how it got this way
 *   /harbour/platform               the map; /harbour/platform/<page> for the rest
 *   /harbour/journeys/<journey>     one packet journey, as found or fixed
 *   /harbour/defects/<defect>       one defect: what it is, what it breaks, the fix
 */

/** Icons a page can use in navigation (see src/components/ui/icons.tsx). */
export type IconName =
  "book" | "map" | "grid" | "server" | "layers" | "route" | "alert";

/** One page of the platform section, written in MDX. */
export interface PlatformPage {
  slug: string;
  title: string;
  /** Used for page metadata and section lists. */
  description: string;
  /** Opening paragraph under the page's title. Falls back to `description`. */
  lead?: string;
  icon?: IconName;
  Content: MDXContent;
}

export interface CaseStudy {
  title: string;
  /** What it is, in a few words. */
  kind: string;
  /** The overview's heading. */
  heading: string;
  summary: string;
  /** Said once, at the foot of every page. */
  disclaimer: string;
  meta: { label: string; value: string }[];
  /** The overview, after its header. */
  Overview: MDXContent;
  /** The first page is the platform section's index. */
  platform: [PlatformPage, ...PlatformPage[]];
  /** Data behind the map, the journeys and the defects. */
  architecture: ArchitectureModel;
}

/**
 * Courses: course → part → chapter → section.
 *
 *   /learn                              the learning path
 *   /learn/fundamentals                 course index
 *   /learn/fundamentals/subnet-masks    chapter
 */

export interface Part {
  id: string;
  title: string;
}

export interface Chapter {
  /** "4", "5.1" - shown as the move numeral. */
  num: string;
  slug: string;
  title: string;
  /** The paragraph under the title; also the page description. */
  lead: string;
  /** Id of the part it belongs to. */
  part: string;
  /** Reading time in minutes. */
  minutes: number;
  /** Listed, but not linked or routed (a chapter still being written). */
  draft?: boolean;
}

/**
 * Each chapter's MDX by slug, kept apart from the course metadata: only the
 * chapter route imports it, so every other page stays free of widget code.
 */
export type ChapterLoaders = Record<
  string,
  () => Promise<{ default: MDXContent }>
>;

/** The four drawing hues (see DESIGN.md, Drawing hues). */
export type Hue = "plum" | "teal" | "green" | "amber";

export interface Course {
  slug: string;
  title: string;
  /** Short name for navigation, e.g. "Fundamentals". */
  short: string;
  summary: string;
  parts: Part[];
  /** What each drawing hue means in this course's figures. */
  legend: Partial<Record<Hue, string>>;
  /** In reading order. Chapter 0 is the course's Kadé reference. */
  chapters: Chapter[];
}
