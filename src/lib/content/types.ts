import type { MDXContent } from "mdx/types";
import type { ArchitectureModel } from "@/lib/architecture/types";

/**
 * Content hierarchy: provider → lab → track → view.
 *
 *   /gcp                        provider (Google Cloud)
 *   /gcp/harbour                lab      (one fictional platform)
 *   /gcp/harbour/network        track    (one concern: network, later IAM, …)
 *   /gcp/harbour/network/map    view     (one page of a track)
 */

/** Icons a view can use in navigation (see src/components/ui/icons.tsx). */
export type IconName =
  "book" | "map" | "grid" | "server" | "layers" | "route" | "alert";

export interface TrackView {
  slug: string;
  title: string;
  /** Used for page metadata and view cards. */
  description: string;
  /** Opening paragraph under the view's title. Falls back to `description`. */
  lead?: string;
  icon?: IconName;
  Content: MDXContent;
}

export interface Track {
  slug: string;
  /** Short name, e.g. "Network". */
  title: string;
  /** Page heading, e.g. "Harbour - GCP network reference architecture". */
  heading: string;
  summary: string;
  meta: { label: string; value: string }[];
  /** The first view is the track's index page. */
  views: [TrackView, ...TrackView[]];
  /**
   * Data behind the interactive map, journeys and defect register. Tracks
   * with a different shape (e.g. IAM) add their own optional model here.
   */
  architecture?: ArchitectureModel;
}

export interface Lab {
  slug: string;
  title: string;
  summary: string;
  disclaimer?: string;
  tracks: Track[];
}

export interface Provider {
  slug: string;
  name: string;
  summary: string;
  labs: Lab[];
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
  /** Missing until the chapter is migrated: listed, but not linked or routed. */
  Content?: MDXContent;
}

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
