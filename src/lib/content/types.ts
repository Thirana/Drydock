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
